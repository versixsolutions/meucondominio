import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdmin } from '../../contexts/AdminContext'
import PageLayout from '../../components/PageLayout' // Ou AdminLayout se for usar como modal/página interna
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function FAQImport() {
  const { selectedCondominioId } = useAdmin()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Por favor, envie um arquivo .csv')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      parseCSV(text)
    }
    reader.readAsText(file)
  }

  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      const data = []
      
      // Começa do índice 1 para pular o cabeçalho
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        // Regex para lidar com vírgulas dentro de aspas (ex: "Sim, pode")
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/"/g, '')) || line.split(',')

        if (values.length >= 2) { // Mínimo pergunta e resposta
            const entry: any = {}
            headers.forEach((header, index) => {
                // Mapeia colunas do CSV para o banco
                // Esperado: question, answer, category, priority, article_reference
                if (values[index]) {
                    entry[header] = values[index].trim()
                }
            })
            
            // Validação básica
            if (entry.question && entry.answer) {
                data.push(entry)
            }
        }
      }

      setPreview(data)
      if (data.length === 0) {
        setError('Nenhuma pergunta válida encontrada no CSV.')
      } else {
        setError(null)
      }

    } catch (err) {
      console.error(err)
      setError('Erro ao ler o arquivo. Verifique a formatação.')
    }
  }

  const handleImport = async () => {
    if (!selectedCondominioId) {
      toast.error('Selecione um condomínio no topo primeiro.')
      return
    }

    if (preview.length === 0) return

    setUploading(true)
    const toastId = toast.loading(`Importando ${preview.length} perguntas...`)

    try {
      // Prepara dados para inserção em massa
      const faqsToInsert = preview.map(item => ({
        condominio_id: selectedCondominioId,
        question: item.question,
        answer: item.answer,
        category: item.category || 'geral',
        priority: item.priority ? parseInt(item.priority) : 3,
        article_reference: item.article_reference || null,
        created_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('faqs')
        .insert(faqsToInsert)

      if (error) throw error

      toast.success('Importação concluída com sucesso!', { id: toastId })
      navigate('/admin/ia') // Volta para a gestão de conhecimento ou onde preferir
      
    } catch (err: any) {
      console.error(err)
      toast.error('Erro na importação: ' + err.message, { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Importar FAQ via CSV</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-sm text-blue-700">
          <strong>Formato do Arquivo:</strong> O CSV deve ter as colunas: 
          <code className="bg-blue-100 px-1 py-0.5 rounded ml-1">question, answer, category, priority, article_reference</code>
        </p>
        <p className="text-xs text-blue-600 mt-1">
            Ex: "Pode cachorro?","Sim","animais",2,"Art. 34"
        </p>
      </div>

      {!preview.length ? (
        <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => fileInputRef.current?.click()}
        >
            <div className="text-4xl mb-3">📂</div>
            <p className="text-gray-600 font-medium">Clique para selecionar o arquivo CSV</p>
            <input 
                type="file" 
                ref={fileInputRef} 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileChange} 
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      ) : (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700">{preview.length} perguntas identificadas</h3>
                <button 
                    onClick={() => { setPreview([]); setError(null); }}
                    className="text-sm text-red-600 hover:underline"
                >
                    Cancelar / Trocar Arquivo
                </button>
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-lg mb-6">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="p-2 border-b">Pergunta</th>
                            <th className="p-2 border-b">Resposta</th>
                            <th className="p-2 border-b">Categoria</th>
                        </tr>
                    </thead>
                    <tbody>
                        {preview.map((item, idx) => (
                            <tr key={idx} className="border-b last:border-0">
                                <td className="p-2 truncate max-w-xs" title={item.question}>{item.question}</td>
                                <td className="p-2 truncate max-w-xs" title={item.answer}>{item.answer}</td>
                                <td className="p-2 text-xs font-mono">{item.category}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button
                onClick={handleImport}
                disabled={uploading || !selectedCondominioId}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            >
                {uploading ? 'Importando...' : 'Confirmar Importação'}
            </button>
            
            {!selectedCondominioId && (
                <p className="text-center text-red-500 text-xs mt-2">Selecione um condomínio no topo da página para habilitar o botão.</p>
            )}
        </div>
      )}
    </div>
  )
}