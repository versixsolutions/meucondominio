import React from "react";
import { useNavigate } from "react-router-dom";
import { TransactionForm } from "../../components/Financial/TransactionForm";
import { ArrowLeft } from "lucide-react";

const CONDOMINIO_ID = "5c624180-5fca-41fd-a5a0-a6e724f45d96"; // Pinheiro Park

export const AddTransactionPage: React.FC = () => {
  const navigate = useNavigate();

  // Obter mês atual em formato YYYY-MM
  const currentMonth = new Date().toISOString().slice(0, 7);

  const handleSuccess = (transaction: any) => {
    console.log("Transação salva:", transaction);
    // Opcionalmente, redirecionar ou exibir mensagem
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            Adicionar Transação
          </h1>
        </div>

        {/* Informações do período */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Período:</strong>{" "}
            {new Date(`${currentMonth}-01`).toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Formulário */}
        <TransactionForm
          condominioId={CONDOMINIO_ID}
          month={currentMonth}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default AddTransactionPage;
