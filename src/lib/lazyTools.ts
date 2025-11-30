// Utilitários para carregamento dinâmico de bibliotecas pesadas
// Evita incluir libs grandes no bundle inicial das rotas

export async function loadJsPDF() {
  const mod = await import('jspdf')
  return mod.jsPDF
}

export async function loadQRCodeCanvas() {
  const mod = await import('qrcode.react')
  return mod.QRCodeCanvas
}

// Exemplo de uso:
// const jsPDF = await loadJsPDF()
// const doc = new jsPDF()
// const QRCodeCanvas = await loadQRCodeCanvas()
