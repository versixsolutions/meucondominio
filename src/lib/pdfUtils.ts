import * as pdfjsLib from 'pdfjs-dist'

// Configura o Worker do PDF.js (necessário para processar o arquivo)
// Usamos uma CDN para evitar configurações complexas de build no Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''

    // Percorre todas as páginas
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      
      // Junta os fragmentos de texto da página
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      
      fullText += `\n--- Página ${i} ---\n${pageText}`
    }

    return fullText
  } catch (error) {
    console.error('Erro ao ler PDF:', error)
    throw new Error('Não foi possível extrair o texto do PDF.')
  }
}