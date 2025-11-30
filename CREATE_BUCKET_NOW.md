# 🚨 AÇÃO IMEDIATA: CRIAR BUCKET DE STORAGE

**Status:** ❌ Bucket "assembleias" não existe  
**Impacto:** Upload de PDFs não funcionará  
**Tempo:** 2 minutos  
**Prioridade:** 🔴 CRÍTICA

---

## 🎯 PASSO A PASSO VISUAL

### 1️⃣ Acesse o Dashboard do Supabase

**Link direto:** 
```
https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/storage/buckets
```

👆 **Ctrl + Clique** no link acima ou copie e cole no navegador

---

### 2️⃣ Clique no Botão "New bucket"

Você verá uma página como esta:

```
┌─────────────────────────────────────────────────────┐
│  Storage                                    [New bucket] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📦 Buckets                                         │
│  (vazio ou lista de outros buckets)                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Ação:** Clique no botão verde **"New bucket"** no canto superior direito

---

### 3️⃣ Preencha o Formulário

Um modal aparecerá com o formulário:

```
┌─────────────────────────────────────────────────────┐
│  Create a new bucket                          [×]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Name *                                             │
│  ┌─────────────────────────────────────────────┐   │
│  │ assembleias                                  │   │  ⬅️ DIGITE AQUI
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ☑ Public bucket                                    │  ⬅️ MARQUE ESTA CAIXA!
│    Allow public access to all files                │
│                                                     │
│  File size limit                                    │
│  ┌─────────────────────────────────────────────┐   │
│  │ 10 MB                                        │   │  ⬅️ DEIXE PADRÃO
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Allowed MIME types (optional)                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ application/pdf                              │   │  ⬅️ DIGITE ESTE
│  └─────────────────────────────────────────────┘   │
│                                                     │
│                         [Cancel]  [Create bucket]  │
└─────────────────────────────────────────────────────┘
```

**Configuração EXATA:**
- **Name:** `assembleias` (sem espaços, tudo minúsculo)
- **Public bucket:** ✅ **MARCAR** (muito importante!)
- **File size limit:** `10 MB` (deixar padrão)
- **Allowed MIME types:** `application/pdf`

---

### 4️⃣ Criar o Bucket

Clique no botão **"Create bucket"** (azul, canto inferior direito)

Você verá uma mensagem de sucesso:
```
✅ Bucket created successfully
```

O bucket "assembleias" aparecerá na lista:
```
┌─────────────────────────────────────────────────────┐
│  📦 assembleias                              🌐      │
│     Public • 0 files • Created just now              │
└─────────────────────────────────────────────────────┘
```

---

### 5️⃣ Verificar Criação

Volte ao terminal e execute:

```powershell
npm run check:storage
```

**Resultado esperado:**
```
🗄️  Verificando bucket de Storage no Supabase...

📦 Buckets existentes:
   🌐 assembleias (público)

============================================================
✅ Bucket "assembleias" ENCONTRADO!
   Status: 🌐 Público
============================================================
```

---

## ⚠️ IMPORTANTE: BUCKET DEVE SER PÚBLICO

Se você esquecer de marcar "Public bucket", os uploads funcionarão MAS as URLs públicas não serão acessíveis.

**Como verificar se está público:**
1. Acesse: https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/storage/buckets
2. Procure o ícone 🌐 ao lado de "assembleias"
3. Se estiver 🔒 (privado), clique no bucket e mude para público

---

## 🧪 TESTAR APÓS CRIAR

### Teste 1: Verificação Automática
```powershell
npm run check:storage
```

### Teste 2: Criar Assembleia de Teste
```powershell
npm run seed:assembleia
```

### Teste 3: Dev Server
```powershell
npm run dev
```

Depois:
1. Login como admin
2. Acesse: http://localhost:5173/admin/assembleias
3. Criar nova assembleia
4. **Upload de PDF** deve funcionar!

---

## 🐛 TROUBLESHOOTING

### Erro: "Bucket already exists"
**Causa:** Bucket foi criado mas com nome diferente

**Solução:**
1. Liste todos os buckets
2. Se existe "Assembleias" (maiúsculo) → renomear para "assembleias"
3. Ou deletar e criar novo com nome correto

---

### Erro: "Access denied" ao fazer upload
**Causa:** Bucket não está público

**Solução:**
1. Vá para: https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/storage/buckets
2. Clique em "assembleias"
3. Settings → Marque "Public bucket"
4. Save

---

### Upload funciona mas URL não abre
**Causa:** Bucket criado como privado

**Solução:**
1. Mesma solução acima
2. Ou adicionar policy manualmente:
   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'assembleias' );
   ```

---

## ✅ CHECKLIST FINAL

Antes de continuar, confirme:

- [ ] Bucket "assembleias" criado
- [ ] Ícone 🌐 (público) aparece ao lado do nome
- [ ] `npm run check:storage` retorna sucesso
- [ ] MIME type: `application/pdf` configurado

---

## 📞 AJUDA RÁPIDA

**Link direto para criar:**
https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/storage/buckets

**Configuração em texto simples:**
```
Nome: assembleias
Público: SIM
Tamanho: 10 MB
MIME: application/pdf
```

**Após criar, execute:**
```powershell
npm run check:storage
npm run seed:assembleia
npm run dev
```

---

## 🎯 PRÓXIMOS PASSOS

Após criar o bucket com sucesso:

1. ✅ Verificar: `npm run check:storage`
2. ✅ Seed de teste: `npm run seed:assembleia`
3. ✅ Testar upload no frontend
4. ✅ Smoke tests completos
5. ✅ Comunicar stakeholders: "Deploy completo!"

---

**⏱️ Tempo estimado:** 2 minutos  
**🔧 Dificuldade:** Baixa  
**⚠️ Importância:** CRÍTICA

**👉 Crie o bucket AGORA e depois execute:**
```powershell
npm run check:storage
```
