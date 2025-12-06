import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { CategorySelector } from "./CategorySelector";
import { AlertCircle, CheckCircle } from "lucide-react";

interface TransactionFormProps {
  condominioId: string;
  month: string; // "2025-12"
  onSuccess?: (transaction: any) => void;
  onCancel?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  condominioId,
  month,
  onSuccess,
  onCancel,
}) => {
  const [type, setType] = useState<"RECEITA" | "DESPESA">("RECEITA");
  const [categoryCode, setCategoryCode] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validações
    if (!categoryCode) {
      setError("Selecione uma categoria");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Valor inválido");
      return;
    }
    if (!date) {
      setError("Data é obrigatória");
      return;
    }

    try {
      setLoading(true);

      // Converter valor (remover formatação se existir)
      const numericAmount = parseFloat(amount.replace(",", "."));

      const { data, error: insertError } = await supabase
        .from("financial_transactions")
        .insert({
          condominio_id: condominioId,
          category_code: categoryCode,
          type: type,
          description: description || categoryName,
          amount: numericAmount,
          transaction_date: date,
          month: month,
          source: "manual_input",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess(`Transação de ${type.toLowerCase()} registrada com sucesso!`);

      // Resetar formulário
      setCategoryCode("");
      setCategoryName("");
      setDescription("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);

      if (onSuccess) {
        onSuccess(data);
      }

      // Limpar mensagem após 3 segundos
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.message || "Erro ao salvar transação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Nova Transação</h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <p className="text-emerald-700 text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Transação */}
        <div className="grid grid-cols-2 gap-4">
          <label
            className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors"
            style={{
              borderColor: type === "RECEITA" ? "#10b981" : "#d1d5db",
              backgroundColor: type === "RECEITA" ? "#ecfdf5" : "white",
            }}
          >
            <input
              type="radio"
              name="type"
              value="RECEITA"
              checked={type === "RECEITA"}
              onChange={(e) => {
                setType(e.target.value as "RECEITA" | "DESPESA");
                setCategoryCode("");
                setCategoryName("");
              }}
              className="w-4 h-4 accent-emerald-600"
            />
            <span className="ml-3 font-medium text-slate-900">Receita (+)</span>
          </label>

          <label
            className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors"
            style={{
              borderColor: type === "DESPESA" ? "#f43f5e" : "#d1d5db",
              backgroundColor: type === "DESPESA" ? "#fff1f5" : "white",
            }}
          >
            <input
              type="radio"
              name="type"
              value="DESPESA"
              checked={type === "DESPESA"}
              onChange={(e) => {
                setType(e.target.value as "RECEITA" | "DESPESA");
                setCategoryCode("");
                setCategoryName("");
              }}
              className="w-4 h-4 accent-rose-600"
            />
            <span className="ml-3 font-medium text-slate-900">Despesa (-)</span>
          </label>
        </div>

        {/* Categoria */}
        <CategorySelector
          type={type}
          value={categoryCode}
          onChange={(code, name) => {
            setCategoryCode(code);
            setCategoryName(name);
          }}
          label="Categoria"
          required
        />

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Descrição (opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={categoryName || "Digite uma descrição..."}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Data e Valor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Data *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Valor *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-500">R$</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  // Permite apenas números e vírgula
                  const value = e.target.value.replace(/[^\d,]/g, "");
                  setAmount(value);
                }}
                placeholder="0,00"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? "Salvando..." : "Salvar Transação"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Informações de debug */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600">
          <strong>Condomínio:</strong> {condominioId} | <strong>Mês:</strong>{" "}
          {month}
        </p>
      </div>
    </div>
  );
};
