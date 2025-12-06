import React, { useState, useMemo } from "react";
import { X, Download, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatCurrency } from "../../lib/utils";

interface BudgetPlanItem {
  category_code: string;
  category_name: string;
  monthly_limit: number | null;
  annual_limit: number | null;
  spent_by_month: Record<string, number>; // "2025-01": 1000, etc
  spent_year: number;
}

interface BudgetPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetData: BudgetPlanItem[];
  year: number;
  condominioId: string;
  condominioName: string;
}

const MONTHS = [
  { key: "01", label: "Janeiro" },
  { key: "02", label: "Fevereiro" },
  { key: "03", label: "Março" },
  { key: "04", label: "Abril" },
  { key: "05", label: "Maio" },
  { key: "06", label: "Junho" },
  { key: "07", label: "Julho" },
  { key: "08", label: "Agosto" },
  { key: "09", label: "Setembro" },
  { key: "10", label: "Outubro" },
  { key: "11", label: "Novembro" },
  { key: "12", label: "Dezembro" },
];

const BudgetPlanModal: React.FC<BudgetPlanModalProps> = ({
  isOpen,
  onClose,
  budgetData,
  year,
  condominioId,
  condominioName,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const tableData = useMemo(() => {
    return budgetData.map((item) => {
      const monthlyValues = MONTHS.map((m) => {
        const key = `${year}-${m.key}`;
        return item.spent_by_month[key] || 0;
      });

      const totalSpent = monthlyValues.reduce((sum, val) => sum + val, 0);
      const overBudgetMonths = MONTHS.filter((m) => {
        const key = `${year}-${m.key}`;
        const spent = item.spent_by_month[key] || 0;
        return item.monthly_limit && spent > item.monthly_limit && spent !== 0;
      });

      return {
        category_name: item.category_name,
        category_code: item.category_code,
        monthly_limit: item.monthly_limit || 0,
        annual_limit: item.annual_limit || 0,
        monthlyValues,
        totalSpent,
        spent_year: item.spent_year || 0,
        overBudgetMonths,
      };
    });
  }, [budgetData, year]);

  const summary = useMemo(() => {
    return {
      totalAnnualLimit: tableData.reduce(
        (sum, item) => sum + item.annual_limit,
        0,
      ),
      totalSpentYear: tableData.reduce((sum, item) => sum + item.spent_year, 0),
      categoriesOverBudget: tableData.filter(
        (item) => item.overBudgetMonths.length > 0,
      ).length,
      monthsWithOverage: Array.from(
        new Set(
          tableData.flatMap((item) => item.overBudgetMonths.map((m) => m.key)),
        ),
      ).length,
    };
  }, [tableData]);

  const filteredData = useMemo(() => {
    if (!selectedMonth) return tableData;
    return tableData.filter((item) =>
      item.overBudgetMonths.some((m) => m.key === selectedMonth),
    );
  }, [tableData, selectedMonth]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(18);
    doc.text("Planilha Orçamentária", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 10;

    doc.setFontSize(11);
    doc.text(`Condomínio: ${condominioName}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Ano: ${year}`, 20, yPosition);
    yPosition += 6;
    doc.text(
      `Data de Exportação: ${new Date().toLocaleDateString("pt-BR")}`,
      20,
      yPosition,
    );
    yPosition += 12;

    // Resumo Executivo
    doc.setFontSize(12);
    doc.text("Resumo Executivo", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    const summaryText = [
      `Orçamento Anual Total: ${formatCurrency(summary.totalAnnualLimit)}`,
      `Gasto no Ano: ${formatCurrency(summary.totalSpentYear)}`,
      `Diferença: ${formatCurrency(summary.totalAnnualLimit - summary.totalSpentYear)}`,
      `Categorias com Estouro: ${summary.categoriesOverBudget}`,
      `Meses com Estouro: ${summary.monthsWithOverage}`,
    ];

    summaryText.forEach((text) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(text, 20, yPosition);
      yPosition += 6;
    });

    yPosition += 6;

    // Tabela principal
    const tableHead = [
      "Categoria",
      ...MONTHS.map((m) => m.label.substring(0, 3)),
      "Total Anual",
      "Limite",
      "Status",
    ];

    const tableBody = filteredData.map((item) => [
      item.category_name.substring(0, 40),
      ...item.monthlyValues.map((v) => formatCurrency(v)),
      formatCurrency(item.spent_year),
      formatCurrency(item.annual_limit),
      item.spent_year > item.annual_limit ? "⚠️ ACIMA" : "✓ OK",
    ]);

    const options = {
      startY: yPosition,
      head: [tableHead],
      body: tableBody,
      theme: "grid" as const,
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        cellPadding: 2,
      },
      bodyStyles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        [tableHead.length - 1]: { textColor: [192, 57, 43], fontStyle: "bold" },
      },
      didDrawPage: (data: any) => {
        // Rodapé
        const pageCount = doc.internal.pages.length;
        doc.setFontSize(10);
        doc.text(`Página ${pageCount - 1}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
      },
    };

    (doc as any).autoTable(options);

    doc.save(`Orcamento_${condominioName}_${year}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center border-b border-blue-700">
          <div>
            <h2 className="text-2xl font-bold">Planilha Orçamentária</h2>
            <p className="text-blue-100 text-sm mt-1">
              {condominioName} • {year}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <Download size={18} />
              PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex gap-3 items-center">
          <Calendar size={18} className="text-gray-600" />
          <label className="text-sm font-semibold text-gray-700">
            Filtrar por mês com estouro:
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Mostrar todos</option>
            {MONTHS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600 ml-auto">
            {filteredData.length} de {tableData.length} categorias
          </span>
        </div>

        {/* Summary Cards */}
        <div className="bg-white p-4 border-b border-gray-200 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-600 uppercase">Orçamento Anual</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(summary.totalAnnualLimit)}
            </p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <p className="text-xs text-gray-600 uppercase">Gasto no Ano</p>
            <p className="text-lg font-bold text-emerald-600">
              {formatCurrency(summary.totalSpentYear)}
            </p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
            <p className="text-xs text-gray-600 uppercase">Diferença</p>
            <p
              className={`text-lg font-bold ${summary.totalAnnualLimit - summary.totalSpentYear >= 0 ? "text-amber-600" : "text-red-600"}`}
            >
              {formatCurrency(
                summary.totalAnnualLimit - summary.totalSpentYear,
              )}
            </p>
          </div>
          <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
            <p className="text-xs text-gray-600 uppercase">Categorias ⚠️</p>
            <p className="text-lg font-bold text-rose-600">
              {summary.categoriesOverBudget}
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
            <p className="text-xs text-gray-600 uppercase">Meses ⚠️</p>
            <p className="text-lg font-bold text-orange-600">
              {summary.monthsWithOverage}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Categoria
                </th>
                {MONTHS.map((m) => (
                  <th
                    key={m.key}
                    className="px-2 py-3 text-center font-semibold text-gray-600 text-xs"
                  >
                    {m.label.substring(0, 3)}
                  </th>
                ))}
                <th className="px-3 py-3 text-right font-semibold text-gray-700">
                  Total Ano
                </th>
                <th className="px-3 py-3 text-right font-semibold text-gray-700">
                  Limite
                </th>
                <th className="px-3 py-3 text-center font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={16}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Nenhuma categoria encontrada para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => {
                  const overBudget = item.spent_year > item.annual_limit;
                  const monthsOverText =
                    item.overBudgetMonths.length > 0
                      ? `${item.overBudgetMonths.map((m) => m.label.substring(0, 3)).join(", ")}`
                      : "";

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-gray-50 transition-colors ${overBudget ? "bg-red-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">
                          {item.category_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.category_code}
                        </div>
                        {monthsOverText && (
                          <div className="text-xs text-rose-600 font-semibold mt-1">
                            ⚠️ {monthsOverText}
                          </div>
                        )}
                      </td>
                      {item.monthlyValues.map((value, midx) => (
                        <td
                          key={midx}
                          className="px-2 py-3 text-center text-gray-700"
                        >
                          {value > 0 ? formatCurrency(value) : "-"}
                        </td>
                      ))}
                      <td
                        className={`px-3 py-3 text-right font-bold ${overBudget ? "text-red-600" : "text-gray-900"}`}
                      >
                        {formatCurrency(item.spent_year)}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-700">
                        {formatCurrency(item.annual_limit)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            overBudget
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {overBudget ? "⚠️ ACIMA" : "✓ OK"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanModal;
