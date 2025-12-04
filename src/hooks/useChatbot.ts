import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { sanitizeHTML } from "../lib/sanitize";
import { logger } from "../lib/logger";
import { recordAIResponseFeedback } from "../lib/feedback";

export interface ChatOption {
  label: string;
  value: string;
  type: "category" | "question" | "action";
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isError?: boolean;
  options?: ChatOption[];
  isWelcome?: boolean;
}

interface UseChatbotParams {
  isOpen: boolean;
}

interface UseChatbotReturn {
  messages: ChatMessage[];
  inputText: string;
  setInputText: (v: string) => void;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleSendMessage: (
    e: React.FormEvent | null,
    override?: string,
  ) => Promise<void>;
  handleOptionClick: (opt: ChatOption) => void;
  createTicketFromChat: () => Promise<void>;
  recordFeedback: (useful: boolean) => Promise<void>;
}

export function useChatbot({ isOpen }: UseChatbotParams): UseChatbotReturn {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [lastQuestion, setLastQuestion] = useState("");

  // Scroll automático quando novas mensagens chegam
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Mensagem inicial
  useEffect(() => {
    if (isOpen && !initialized.current) {
      const hour = new Date().getHours();
      let greeting = "Bom dia";
      if (hour >= 12) greeting = "Boa tarde";
      if (hour >= 18) greeting = "Boa noite";
      const name = profile?.full_name?.split(" ")[0] || "Morador";
      setMessages([
        {
          id: "1",
          text: `${greeting}, ${name}! Sou a **Norma**, sua assistente virtual. 🤖\n\nJá estudei o regimento e as regras do condomínio. Como posso ajudar hoje?`,
          sender: "bot",
          timestamp: new Date(),
          isWelcome: true,
        },
      ]);
      initialized.current = true;
    }
  }, [isOpen, profile]);

  const createTicketFromChat = useCallback(async () => {
    if (!user || !lastQuestion) return;
    setIsTyping(true);
    try {
      const { error } = await supabase.from("chamados").insert({
        user_id: user.id,
        condominio_id: profile?.condominio_id,
        subject: "Dúvida via Chatbot (Norma)",
        description: lastQuestion,
        status: "aberto",
      });
      if (error) throw error;
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: `✅ **Chamado Aberto!**\n\nEnviei sua dúvida para o síndico. Você será notificado quando houver resposta.`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 1000);
    } catch (err) {
      logger.error("Erro ao criar chamado via chatbot", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Erro ao criar chamado. Tente novamente.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
        },
      ]);
      setIsTyping(false);
    }
  }, [user, lastQuestion, profile?.condominio_id]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent | null, textOverride?: string) => {
      if (e) e.preventDefault();
      const textToSend = (textOverride || inputText).trim();

      if (!textToSend) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "⚠️ Por favor, digite uma pergunta antes de enviar.",
            sender: "bot",
            timestamp: new Date(),
            isError: true,
          },
        ]);
        return;
      }
      if (textToSend.length > 500) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "⚠️ Sua pergunta é muito longa. Máximo 500 caracteres.",
            sender: "bot",
            timestamp: new Date(),
            isError: true,
          },
        ]);
        return;
      }
      if (!profile?.condominio_id) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "❌ Seu perfil não está vinculado a um condomínio. Entre em contato com o suporte.",
            sender: "bot",
            timestamp: new Date(),
            isError: true,
            options: [
              { label: "📞 Ver Suporte", value: "suporte", type: "action" },
            ],
          },
        ]);
        return;
      }

      const name = profile?.full_name?.split(" ")[0] || "Morador";
      setLastQuestion(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: textToSend,
          sender: "user",
          timestamp: new Date(),
        },
      ]);
      setInputText("");
      setIsTyping(true);

      try {
        logger.debug("Enviando para ask-ai", {
          query: textToSend,
          userName: name,
          filter_condominio_id: profile.condominio_id,
        });

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token)
          throw new Error("Não autorizado: faça login novamente");

        const { data, error } = await supabase.functions.invoke("ask-ai", {
          body: {
            query: textToSend,
            userName: name,
            filter_condominio_id: profile.condominio_id,
          },
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        logger.debug("Resposta ask-ai", { data, error });
        if (error) throw error;
        if (!data) throw new Error("Resposta vazia da API");

        const botResponseBase = sanitizeHTML(
          data.answer ||
            "Desculpe, não consegui processar sua pergunta no momento.",
        );
        // Acrescenta referências de fontes (FAQ/Documento) ao final da resposta
        let botResponse = botResponseBase;
        if (
          Array.isArray((data as any).sources) &&
          (data as any).sources.length > 0
        ) {
          const sources = (data as any).sources as Array<{
            title?: string;
            type?: string;
            article_reference?: string;
          }>;
          // Prioriza mostrar a primeira FAQ; se não houver, mostra o primeiro Documento
          const faqSource = sources.find(
            (s) => (s.type || "").toLowerCase() === "faq",
          );
          const docSource = sources.find(
            (s) => (s.type || "").toLowerCase() === "document",
          );
          const chosen = faqSource || docSource;

          if (chosen) {
            let sourceRef = null;

            // Para FAQs, APENAS usar article_reference (nunca o title que é a pergunta)
            if (chosen.type === "faq") {
              if (chosen.article_reference) {
                sourceRef = chosen.article_reference;
              }
              // Se não tiver article_reference, não mostrar fonte para FAQ
            } else {
              // Para documentos, usar o title
              sourceRef = chosen.title;
            }

            if (sourceRef) {
              botResponse = `${botResponseBase}\n\nFonte: ${sanitizeHTML(sourceRef)}`;
            }
          }
        }
        const notFoundKeywords = [
          "não encontrei",
          "não consta",
          "não localizei",
          "desculpe",
          "não há",
          "sem informação",
        ];
        const seemsNotFound = notFoundKeywords.some((kw) =>
          botResponse.toLowerCase().includes(kw),
        );

        const options: ChatOption[] | undefined = seemsNotFound
          ? [
              { label: "🎫 Abrir Chamado", value: "chamado", type: "action" },
              { label: "📞 Ver Contatos", value: "suporte", type: "action" },
            ]
          : undefined;

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: botResponse,
            sender: "bot",
            timestamp: new Date(),
            options,
          },
        ]);
        lastBotAnswer.current = {
          text: botResponse,
          sources: (data as any).sources,
        };
      } catch (err: any) {
        logger.error("Erro ao enviar mensagem para chatbot", err, {
          userId: user?.id,
          condominioId: profile?.condominio_id,
        });
        let errorMessage = "Estou com dificuldade de conexão no momento. ";
        if (err.message?.includes("condominio_id"))
          errorMessage =
            "Seu perfil não está vinculado a um condomínio. Entre em contato com o suporte.";
        else if (err.message?.includes("Query"))
          errorMessage =
            "Sua pergunta é inválida. Por favor, tente novamente com outras palavras.";
        else if (err.message?.includes("500"))
          errorMessage =
            "Erro no servidor. Nossa equipe foi notificada. Tente novamente em instantes.";
        else if (err.message) errorMessage = `Erro: ${err.message}`;

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: errorMessage,
            sender: "bot",
            timestamp: new Date(),
            isError: true,
            options: [
              { label: "🎫 Abrir Chamado", value: "chamado", type: "action" },
              { label: "📞 Ver Suporte", value: "suporte", type: "action" },
            ],
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [inputText, profile, user],
  );

  const handleOptionClick = useCallback(
    (option: ChatOption) => {
      if (option.type === "action") {
        if (option.value === "chamado") createTicketFromChat();
        // Navegação externa ou suporte será tratada no componente pai que conhece navigate/onClose
        return;
      }
      handleSendMessage(null, option.label);
    },
    [createTicketFromChat, handleSendMessage],
  );

  const lastBotAnswer = useRef<{
    text: string;
    sources?: Array<{ title?: string; type?: string }>;
  } | null>(null);

  const recordFeedback = useCallback(
    async (useful: boolean) => {
      const answer = lastBotAnswer.current?.text || "";
      const sources = lastBotAnswer.current?.sources || [];
      const primary =
        sources.find((s) => (s.type || "").toLowerCase() === "faq") ||
        sources[0];

      // Para FAQs, usar article_reference como source_title; para docs, usar title
      let sourceTitle = null;
      if (primary) {
        if (primary.type === "faq") {
          // FAQ: priorizar article_reference
          sourceTitle = (primary as any).article_reference || null;
        } else {
          // Documento: usar title
          sourceTitle = primary.title;
        }
      }

      try {
        await recordAIResponseFeedback({
          context: "chatbot",
          question: lastQuestion,
          answer,
          source_title: sourceTitle,
          source_type: primary?.type as any,
          useful,
          user_id: user?.id || null,
          condominio_id: profile?.condominio_id || null,
        });
        logger.info("Feedback registrado", { useful });
      } catch (err) {
        logger.warn("Falha ao registrar feedback", err);
      }
    },
    [lastQuestion, user?.id, profile?.condominio_id],
  );

  return {
    messages,
    inputText,
    setInputText,
    isTyping,
    messagesEndRef,
    handleSendMessage,
    handleOptionClick,
    createTicketFromChat,
    recordFeedback,
  };
}
