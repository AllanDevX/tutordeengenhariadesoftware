## 1. Visão Geral do Projeto
Este chatbot foi desenvolvido como parte da disciplina de **do projeto final do progeto Geração Tech**. O sistema utiliza a técnica de **RAG (Retrieval-Augmented Generation)** para fornecer respostas precisas baseadas nos PDFs das aulas e materiais acadêmicos da instituição.

* **Objetivo:** Auxiliar alunos e professores no acesso rápido a informações do curso.
* **Plataforma de Desenvolvimento:** Lovable (Frontend/Integração).
* **Tecnologias Core:** Python, LangChain, OpenAI API (ou similar) e Banco de Dados Vetorial.

---

## 2. Arquitetura do Sistema
O chatbot não apenas "conversa", ele consulta uma base de conhecimento privada antes de gerar uma resposta.



### Fluxo de Funcionamento:
1.  **Ingestão:** Os PDFs da FBUNI são processados e divididos em "chunks" (fragmentos).
2.  **Embedding:** Esses fragmentos são convertidos em vetores numéricos.
3.  **Recuperação (Retrieval):** Quando o usuário faz uma pergunta, o sistema busca os fragmentos mais semanticamente próximos no banco vetorial.
4.  **Geração:** O LLM recebe a pergunta + os fragmentos recuperados para gerar a resposta final.

---

## 3. Especificações Técnicas
### Tecnologias Utilizadas:
* **Frontend:** React/Tailwind via Lovable (interface responsiva).
* **Backend/Engine:** Python (LangChain / LlamaIndex).
* **Banco de Dados:** Pinecone ou Supabase Vector (armazenamento de embeddings).
* **Modelo de Linguagem:** GPT-4o ou GPT-3.5 Turbo.

### Requisitos de Sistema:
* Conexão estável com a internet.
* Navegador moderno (Chrome, Firefox, Edge).

---

## 4. Guia de Instalação e Configuração
*(Adapte este trecho conforme a realidade do seu repositório)*

1.  **Clonar o repositório:** `git clone [url-do-repositorio]`
2.  **Configurar Variáveis de Ambiente (.env):**
    * `OPENAI_API_KEY`: Chave da API para o modelo.
    * `VECTOR_STORE_ENDPOINT`: Link do banco de dados.
3.  **Execução:**
    * No Lovable: Basta publicar via interface.
    * Local: `npm run dev` ou `python main.py`.

---

## 5. Documentação de API e Endpoints
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Envia a mensagem do usuário e retorna a resposta do RAG. |
| `POST` | `/api/upload` | Faz o upload de novos PDFs para a base de conhecimento. |

---

## 6. Manual do Usuário
### Como interagir:
* **Perguntas Diretas:** "O que cai na prova de Engenharia de Software 2?"
* **Busca por Contexto:** "Baseado no PDF da aula 4, explique o que é Scrum."

### Limitações:
* O bot responde apenas com base nos documentos carregados (evita alucinações).
* Se a informação não estiver nos PDFs, o bot informará que não possui essa base de dados.

---
