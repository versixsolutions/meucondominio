import * as pdfjsLib from "pdfjs-dist";

// --- CORREÇÃO DO WORKER ---
// Usando jsDelivr que é mais estável e tem CDN global confiável
// Fallback: Se a versão exata não existir, usa a latest
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
} catch {
  // Fallback para versão fixa conhecida
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs";
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Carrega o documento PDF
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = "";

    // Extrai texto página por página
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      const pageText = textContent.items.map((item: any) => item.str).join(" ");

      fullText += `\n--- PÁGINA ${i} ---\n${pageText}`;
    }

    return fullText;
  } catch (error: any) {
    console.error("Erro detalhado no PDF:", error);

    if (error.name === "MissingPDFException") {
      throw new Error("Arquivo PDF inválido ou corrompido.");
    }
    if (error.name === "PasswordException") {
      throw new Error("O PDF está protegido por senha.");
    }

    throw new Error("Falha ao processar o PDF. Tente recarregar a página.");
  }
}
