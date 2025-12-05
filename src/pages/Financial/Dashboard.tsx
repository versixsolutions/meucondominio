import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { formatCurrency, formatDate } from "../../lib/utils";
import PageLayout from "../../components/PageLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";

// Types
interface Transaction {
  id: string;
  description: string;
  amount: number;
  reference_month: string;
  payment_date: string;
  category_code: string;
  status: string;
  category: {
    name: string;
    type: string;
  };
}

interface MonthlySummary {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export default function FinancialDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [healthScore, setHealthScore] = useState<any>(null);

  // Fetch Data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Get User's Condominio
        const { data: userData } = await supabase
          .from("users")
          .select("condominio_id")
          .eq("id", user?.id)
          .single();

        if (!userData?.condominio_id) return;

        // 2. Fetch Transactions
        let query = supabase
          .from("financial_transactions")
          .select(
            `
            *,
            category:financial_categories(name, type)
          `,
          )
          .eq("condominio_id", userData.condominio_id)
          .eq("status", "approved")
          .order("reference_month", { ascending: true }); // Order by month for charts

        const { data: transData, error } = await query;

        if (error) throw error;
        setTransactions(transData || []);

        // 3. Fetch Health Check (Edge Function)
        const { data: healthData } = await supabase.functions.invoke(
          "financial-health-check",
          {
            body: { condominio_id: userData.condominio_id },
          },
        );

        if (healthData) setHealthScore(healthData);
      } catch (error) {
        console.error("Error loading financial data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) loadData();
  }, [user]);

  // Process Data for Charts & Summary
  const summaryData = useMemo(() => {
    const filtered = transactions.filter((t) => {
      // Extrair ano e mês diretamente da string para evitar problemas de timezone
      const [year, month] = t.reference_month.split("-").map(Number);
      const yearMatch = year === selectedYear;
      const monthMatch = selectedMonth === "all" || month - 1 === selectedMonth;
      return yearMatch && monthMatch;
    });

    const totalReceitas = filtered
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDespesas = filtered
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const saldo = totalReceitas - totalDespesas;

    return { totalReceitas, totalDespesas, saldo, count: filtered.length };
  }, [transactions, selectedYear, selectedMonth]);

  const chartData = useMemo(() => {
    // Group by month
    const monthlyData: Record<string, MonthlySummary> = {};

    // Initialize all months for the selected year
    for (let i = 0; i < 12; i++) {
      const key = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
      monthlyData[key] = {
        month: new Date(selectedYear, i, 1).toLocaleString("pt-BR", {
          month: "short",
        }),
        receitas: 0,
        despesas: 0,
        saldo: 0,
      };
    }

    transactions.forEach((t) => {
      // Extrair ano e mês diretamente da string para evitar problemas de timezone
      const [year, month] = t.reference_month
        .split("-")
        .slice(0, 2)
        .map(Number);
      if (year !== selectedYear) return;

      const key = `${year}-${String(month).padStart(2, "0")}`;
      if (monthlyData[key]) {
        if (t.amount > 0) {
          monthlyData[key].receitas += t.amount;
        } else {
          monthlyData[key].despesas += Math.abs(t.amount);
        }
        monthlyData[key].saldo += t.amount;
      }
    });

    return Object.values(monthlyData);
  }, [transactions, selectedYear]);

  if (loading)
    return <LoadingSpinner message="Carregando dados financeiros..." />;

  return (
    <PageLayout
      title="Painel Financeiro"
      subtitle="Visão geral das finanças do condomínio"
      icon="📊"
      headerAction={
        <div className="flex gap-2">
          <select
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
          <select
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(
                e.target.value === "all" ? "all" : Number(e.target.value),
              )
            }
          >
            <option value="all">Todo o Ano</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(2025, i, 1).toLocaleString("pt-BR", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Receitas
              </p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(summaryData.totalReceitas)}
              </h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <ArrowUpCircle size={24} />
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Total arrecadado no período
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Despesas
              </p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(summaryData.totalDespesas)}
              </h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <ArrowDownCircle size={24} />
            </div>
          </div>
          <div className="text-xs text-gray-400">Total gasto no período</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Saldo
              </p>
              <h3
                className={`text-2xl font-bold mt-1 ${summaryData.saldo >= 0 ? "text-blue-600" : "text-red-600"}`}
              >
                {formatCurrency(summaryData.saldo)}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Wallet size={24} />
            </div>
          </div>
          <div className="text-xs text-gray-400">Resultado operacional</div>
        </div>

        {healthScore && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-gray-50 rounded-bl-full -mr-4 -mt-4"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Saúde Financeira
                </p>
                <h3
                  className="text-2xl font-bold mt-1"
                  style={{ color: healthScore.color }}
                >
                  {healthScore.classification}
                </h3>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: `${healthScore.color}20`,
                  color: healthScore.color,
                }}
              >
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${healthScore.health_score}%`,
                  backgroundColor: healthScore.color,
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 flex justify-between">
              <span>Score: {Math.round(healthScore.health_score)}/100</span>
              <span>Margem: {healthScore.margem_operacional?.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Evolução Mensal
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${value / 1000}k`}
                />
                <RechartsTooltip
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar
                  dataKey="receitas"
                  name="Receitas"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="despesas"
                  name="Despesas"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Maiores Despesas
          </h3>
          <div className="space-y-4">
            {transactions
              .filter((t) => {
                if (t.amount >= 0) return false;
                if (selectedMonth === "all") return true;
                const [, month] = t.reference_month.split("-").map(Number);
                return month - 1 === selectedMonth;
              })
              .sort((a, b) => a.amount - b.amount) // Sort by most negative (largest expense)
              .slice(0, 5)
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white rounded-full border border-gray-200 text-gray-500 shrink-0">
                      <TrendingDown size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {t.category?.name || "Outros"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {t.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-600 whitespace-nowrap">
                    {formatCurrency(Math.abs(t.amount))}
                  </span>
                </div>
              ))}

            {transactions.filter((t) => t.amount < 0).length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhuma despesa registrada no período.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">
            Transações Recentes
          </h3>
          <button className="text-sm text-primary font-bold hover:underline">
            Ver Todas
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Data</th>
                <th className="px-6 py-4 font-semibold">Descrição</th>
                <th className="px-6 py-4 font-semibold">Categoria</th>
                <th className="px-6 py-4 font-semibold text-right">Valor</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions
                .filter((t) => {
                  if (selectedMonth === "all") return true;
                  const [, month] = t.reference_month.split("-").map(Number);
                  return month - 1 === selectedMonth;
                })
                .slice(0, 10)
                .map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {formatDate(t.payment_date || t.reference_month)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {t.description}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {t.category?.name || t.category_code}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-bold ${t.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Aprovado
                      </span>
                    </td>
                  </tr>
                ))}

              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
