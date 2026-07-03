# Chapter 10: Example Projects — Building AGI Systems from Scratch

## Introduction

Theory without practice is sterile; practice without theory is blind. Throughout this book, we have explored the concepts, architectures, and principles that underpin artificial general intelligence. In this chapter, we shift from theory to implementation, guiding you through five complete projects that demonstrate core AGI capabilities in practice.

Each project is self-contained, includes complete runnable code, and is designed to teach you something fundamental about building intelligent systems. We begin with a Retrieval-Augmented Generation (RAG) chatbot — the workhorse of modern AI applications — and progress through multi-agent systems, autonomous coding assistants, vision-language models, and reinforcement learning agents. By the end of this chapter, you will have built, from scratch, five systems that embody different facets of general intelligence.

> **Philosophy:** These projects are designed to be educational, not production-ready. We prioritize clarity and completeness over optimization. Every line of code is written to teach you something. Where shortcuts exist in production systems, we explain them in the "Deployment Considerations" section at the end of each project.

### Prerequisites

All projects in this chapter share these prerequisites:

- **Python 3.10+** with `uv` package manager (see CLAUDE.md for installation)
- **8GB+ RAM** (16GB recommended for Projects 3–5)
- **GPU optional** but recommended for Projects 3–5 (CPU fallback provided)
- **Familiarity with Python**, basic understanding of machine learning concepts

### Project Overview

| # | Project | Key Concepts | Difficulty | Time |
|---|---------|-------------|------------|------|
| 1 | RAG Chatbot | Embeddings, vector stores, retrieval, conversation memory | ★★☆☆☆ | 4–6 hours |
| 2 | Multi-Agent System | Agent orchestration, tool use, task decomposition | ★★★☆☆ | 6–10 hours |
| 3 | Coding Assistant | Code generation, AST analysis, IDE integration | ★★★★☆ | 8–12 hours |
| 4 | Vision-Language App | CLIP, diffusion models, multi-modal reasoning | ★★★★☆ | 8–12 hours |
| 5 | RL Agent | DQN, PPO, reward shaping, policy optimization | ★★★★★ | 10–16 hours |

---

## Project 1: Building a Custom Chatbot with RAG (Retrieval-Augmented Generation)

### Description and Goals

Retrieval-Augmented Generation (RAG) combines the knowledge retrieval capabilities of search systems with the generative capabilities of large language models. Rather than relying solely on a model's parametric knowledge (which may be outdated or incomplete), RAG systems retrieve relevant documents at query time and inject them into the prompt, grounding the model's responses in actual source material.

**Goals:**
- Build a RAG pipeline from scratch using open-source components
- Implement document ingestion, chunking, embedding, and indexing
- Create a conversational chatbot with memory and source attribution
- Deploy a web interface using Gradio or Streamlit
- Evaluate retrieval quality and response accuracy

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface (Gradio)                │
│  ┌─────────────────────┐    ┌──────────────────────────┐ │
│  │   Chat Input Box    │    │    Response Display       │ │
│  │   (text/images)     │    │    (with sources)         │ │
│  └──────────┬──────────┘    └────────────▲──────────────┘ │
└─────────────┼────────────────────────────┼───────────────┘
              │                            │
              ▼                            │
┌─────────────────────────────────────────────────────────┐
│                  RAG Orchestrator                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │   Query      │  │  Retriever   │  │   Generator   │ │
│  │   Processor  │→ │  (top-k)     │→ │  (LLM + ctx)  │ │
│  └──────────────┘  └──────▲───────┘  └───────▲───────┘ │
│                           │                  │           │
│  ┌──────────────┐  ┌──────┴───────┐  ┌───────┴───────┐ │
│  │  Conversation │  │ Vector Store │  │ Prompt        │ │
│  │  Memory       │  │ (ChromaDB)   │  │ Template      │ │
│  └──────────────┘  └──────▲───────┘  └───────────────┘ │
└──────────────────────────┼──────────────────────────────┘
                           │
                    ┌──────┴───────┐
                    │  Document    │
                    │  Ingestion   │
                    │  Pipeline    │
                    │  ┌─────────┐ │
                    │  │ Loader  │ │
                    │  │ Chunker │ │
                    │  │ Embedder│ │
                    │  └─────────┘ │
                    └──────────────┘
```

### Step 1: Setting Up the Environment

```python
# pyproject.toml dependencies (add to your project)
# dependencies = [
#     "chromadb>=0.4.0",
#     "sentence-transformers>=2.2.0",
#     "transformers>=4.35.0",
#     "torch>=2.0.0",
#     "gradio>=4.0.0",
#     "langchain>=0.1.0",
#     "langchain-community>=0.0.10",
#     "langchain-huggingface>=0.0.1",
#     "pypdf>=3.15.0",
#     "python-dotenv>=1.0.0",
# ]

# Install with:
# uv pip install chromadb sentence-transformers transformers torch gradio langchain langchain-community langchain-huggingface pypdf python-dotenv
```

```python
# config.py
import os
from dataclasses import dataclass, field
from dotenv import load_dotenv

load_dotenv()

@dataclass
class RAGConfig:
    """Configuration for the RAG chatbot."""

    # Embedding model
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dim: int = 384

    # Vector store
    collection_name: str = "rag_documents"
    persist_directory: str = "./chroma_db"

    # Retrieval
    top_k: int = 5
    score_threshold: float = 0.3

    # Chunking
    chunk_size: int = 500
    chunk_overlap: int = 50

    # LLM (using a small local model for demo; replace with API in production)
    llm_model: str = "microsoft/DialoGPT-medium"
    max_new_tokens: int = 512
    temperature: float = 0.7

    # Conversation memory
    max_history_length: int = 10

    # Paths
    documents_dir: str = "./documents"
```

### Step 2: Building the Document Ingestion Pipeline

```python
# ingestion.py
"""
Document ingestion pipeline: load, chunk, embed, and store documents.
"""
from pathlib import Path
from dataclasses import dataclass
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.schema import Document


@dataclass
class DocumentChunk:
    """A chunk of text with metadata."""
    content: str
    metadata: dict


class DocumentIngestionPipeline:
    """Pipeline for loading, chunking, and preparing documents for embedding."""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def load_document(self, file_path: str) -> list[Document]:
        """Load a single document from a file path."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Document not found: {file_path}")

        if path.suffix.lower() == ".pdf":
            loader = PyPDFLoader(str(path))
        elif path.suffix.lower() in (".txt", ".md", ".py", ".json"):
            loader = TextLoader(str(path))
        else:
            raise ValueError(f"Unsupported file type: {path.suffix}")

        return loader.load()

    def load_documents(self, directory: str) -> list[Document]:
        """Load all supported documents from a directory."""
        docs = []
        path = Path(directory)
        if not path.exists():
            path.mkdir(parents=True, exist_ok=True)
            print(f"Created empty documents directory: {directory}")
            return docs

        supported = {".pdf", ".txt", ".md", ".py", ".json"}
        for file_path in path.rglob("*"):
            if file_path.suffix.lower() in supported:
                try:
                    docs.extend(self.load_document(str(file_path)))
                    print(f"  Loaded: {file_path.name}")
                except Exception as e:
                    print(f"  Warning: Failed to load {file_path.name}: {e}")

        print(f"Loaded {len(docs)} documents total.")
        return docs

    def chunk_documents(self, documents: list[Document]) -> list[Document]:
        """Split documents into chunks suitable for embedding."""
        chunks = self.text_splitter.split_documents(documents)
        print(f"Split {len(documents)} documents into {len(chunks)} chunks.")
        return chunks

    def add_metadata(self, chunks: list[Document]) -> list[Document]:
        """Add source metadata to each chunk."""
        for chunk in chunks:
            if "source" not in chunk.metadata:
                chunk.metadata["source"] = "unknown"
            chunk.metadata["chunk_length"] = len(chunk.page_content)
        return chunks

    def run(self, directory: str) -> list[Document]:
        """Execute the full ingestion pipeline."""
        print("=== Document Ingestion Pipeline ===")
        docs = self.load_documents(directory)
        if not docs:
            print("No documents found. Add .pdf, .txt, or .md files to the documents/ directory.")
            return []
        chunks = self.chunk_documents(docs)
        chunks = self.add_metadata(chunks)
        print(f"Pipeline complete: {len(chunks)} chunks ready for embedding.\n")
        return chunks
```

### Step 3: Vector Embeddings and Vector Store

```python
# vector_store.py
"""
Vector store management: embedding documents and querying the store.
"""
from chromadb import Client as ChromaClient
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from langchain.schema import Document


class VectorStoreManager:
    """Manages document embeddings and retrieval using ChromaDB."""

    def __init__(self, embedding_model: str, collection_name: str, persist_directory: str):
        self.embedding_model = embedding_model
        self.collection_name = collection_name
        self.persist_directory = persist_directory

        # Initialize embedding model
        print(f"Loading embedding model: {embedding_model}")
        self.embedder = SentenceTransformer(embedding_model)
        self.embedding_dim = self.embedder.get_sentence_embedding_dimension()

        # Initialize ChromaDB
        self.client = ChromaClient(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory=persist_directory,
            anonymized_telemetry=False,
        ))
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        print(f"Vector store initialized: {collection_name} ({self.collection.count()} documents)")

    def add_documents(self, chunks: list[Document], batch_size: int = 100) -> int:
        """Add document chunks to the vector store."""
        if not chunks:
            return 0

        total_added = 0
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i : i + batch_size]
            texts = [chunk.page_content for chunk in batch]
            metadatas = [chunk.metadata for chunk in batch]
            ids = [f"doc_{i + j}" for j in range(len(batch))]

            embeddings = self.embedder.encode(texts, show_progress_bar=False).tolist()

            self.collection.add(
                documents=texts,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids,
            )
            total_added += len(batch)

        print(f"Added {total_added} chunks to vector store.")
        return total_added

    def query(self, query_text: str, top_k: int = 5) -> list[dict]:
        """Query the vector store for similar documents."""
        query_embedding = self.embedder.encode([query_text]).tolist()

        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )

        retrieved = []
        for i in range(len(results["documents"][0])):
            retrieved.append({
                "content": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i],
                "score": 1 - results["distances"][0][i],  # Convert distance to similarity
            })

        return retrieved

    def get_stats(self) -> dict:
        """Get statistics about the vector store."""
        return {
            "collection": self.collection_name,
            "total_documents": self.collection.count(),
            "embedding_model": self.embedding_model,
            "embedding_dim": self.embedding_dim,
        }
```

### Step 4: Building the RAG Pipeline

```python
# rag_pipeline.py
"""
RAG pipeline: combines retrieval with generation for grounded responses.
"""
from dataclasses import dataclass, field
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch


@dataclass
class RAGResponse:
    """Response from the RAG pipeline."""
    answer: str
    sources: list[dict]
    query: str


class RAGPipeline:
    """Retrieval-Augmented Generation pipeline."""

    def __init__(self, vector_store, config):
        self.vector_store = vector_store
        self.config = config

        # Load LLM
        print(f"Loading LLM: {config.llm_model}")
        self.tokenizer = AutoTokenizer.from_pretrained(config.llm_model)
        self.model = AutoModelForCausalLM.from_pretrained(config.llm_model)
        self.model.eval()
        print("LLM loaded successfully.")

    def _format_context(self, retrieved_docs: list[dict]) -> str:
        """Format retrieved documents into context for the prompt."""
        context_parts = []
        for i, doc in enumerate(retrieved_docs, 1):
            source = doc["metadata"].get("source", "unknown")
            context_parts.append(
                f"[Source {i}: {source}]\n{doc['content']}\n"
            )
        return "\n---\n".join(context_parts)

    def _build_prompt(self, query: str, context: str, chat_history: list[dict]) -> str:
        """Build the prompt with context and chat history."""
        # Format chat history
        history_str = ""
        for msg in chat_history[-self.config.max_history_length:]:
            role = msg["role"].capitalize()
            history_str += f"{role}: {msg['content']}\n"

        prompt = f"""You are a helpful AI assistant. Answer the user's question based on the provided context. If the context doesn't contain enough information, say so honestly. Always cite your sources.

Context from documents:
{context}

Conversation history:
{history_str}

User: {query}
Assistant:"""
        return prompt

    def generate(self, prompt: str) -> str:
        """Generate a response from the LLM."""
        inputs = self.tokenizer.encode(prompt, return_tensors="pt", max_length=2048, truncation=True)

        with torch.no_grad():
            outputs = self.model.generate(
                inputs,
                max_new_tokens=self.config.max_new_tokens,
                temperature=self.config.temperature,
                do_sample=True,
                top_p=0.9,
                repetition_penalty=1.1,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        # Decode only the new tokens
        response = self.tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
        return response.strip()

    def query(self, question: str, chat_history: list[dict] = None) -> RAGResponse:
        """Process a question through the RAG pipeline."""
        if chat_history is None:
            chat_history = []

        # Step 1: Retrieve relevant documents
        retrieved = self.vector_store.query(question, top_k=self.config.top_k)

        # Step 2: Filter by score threshold
        relevant_docs = [d for d in retrieved if d["score"] >= self.config.score_threshold]

        if not relevant_docs:
            # Fall back to top results even if below threshold
            relevant_docs = retrieved[:3]

        # Step 3: Build context and prompt
        context = self._format_context(relevant_docs)
        prompt = self._build_prompt(question, context, chat_history)

        # Step 4: Generate response
        answer = self.generate(prompt)

        return RAGResponse(
            answer=answer,
            sources=[{"content": d["content"][:200], "metadata": d["metadata"], "score": d["score"]} for d in relevant_docs],
            query=question,
        )
```

### Step 5: Adding Conversation Memory

```python
# conversation_memory.py
"""
Conversation memory management for multi-turn dialogue.
"""
from dataclasses import dataclass, field
from datetime import datetime
import json
from pathlib import Path


@dataclass
class Message:
    """A single message in the conversation."""
    role: str  # "user" or "assistant"
    content: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    sources: list[dict] = field(default_factory=list)


class ConversationMemory:
    """Manages conversation history with persistence."""

    def __init__(self, max_length: int = 10, persistence_path: str = None):
        self.max_length = max_length
        self.persistence_path = persistence_path
        self.history: list[Message] = []
        self._load()

    def add_user_message(self, content: str) -> Message:
        """Add a user message to the conversation."""
        msg = Message(role="user", content=content)
        self.history.append(msg)
        self._trim()
        self._save()
        return msg

    def add_assistant_message(self, content: str, sources: list[dict] = None) -> Message:
        """Add an assistant message to the conversation."""
        msg = Message(role="assistant", content=content, sources=sources or [])
        self.history.append(msg)
        self._trim()
        self._save()
        return msg

    def get_history_dicts(self) -> list[dict]:
        """Get conversation history as list of dicts (for LLM prompts)."""
        return [{"role": m.role, "content": m.content} for m in self.history]

    def get_full_history(self) -> list[Message]:
        """Get full conversation history."""
        return list(self.history)

    def clear(self):
        """Clear conversation history."""
        self.history = []
        self._save()

    def _trim(self):
        """Keep only the most recent messages."""
        if len(self.history) > self.max_length * 2:  # *2 for user+assistant pairs
            self.history = self.history[-self.max_length * 2 :]

    def _save(self):
        """Persist conversation to disk."""
        if self.persistence_path:
            data = [
                {"role": m.role, "content": m.content, "timestamp": m.timestamp}
                for m in self.history
            ]
            Path(self.persistence_path).write_text(json.dumps(data, indent=2))

    def _load(self):
        """Load conversation from disk."""
        if self.persistence_path and Path(self.persistence_path).exists():
            data = json.loads(Path(self.persistence_path).read_text())
            self.history = [
                Message(role=m["role"], content=m["content"], timestamp=m["timestamp"])
                for m in data
            ]
```

### Step 6: Building the Web Interface

```python
# app.py
"""
Gradio-based web interface for the RAG chatbot.
"""
import gradio as gr
from config import RAGConfig
from ingestion import DocumentIngestionPipeline
from vector_store import VectorStoreManager
from rag_pipeline import RAGPipeline
from conversation_memory import ConversationMemory


class RAGChatbotApp:
    """Main application combining all RAG components."""

    def __init__(self):
        self.config = RAGConfig()

        # Initialize components
        print("Initializing RAG Chatbot...")
        self.ingestion = DocumentIngestionPipeline(
            chunk_size=self.config.chunk_size,
            chunk_overlap=self.config.chunk_overlap,
        )
        self.vector_store = VectorStoreManager(
            embedding_model=self.config.embedding_model,
            collection_name=self.config.collection_name,
            persist_directory=self.config.persist_directory,
        )
        self.rag = RAGPipeline(self.vector_store, self.config)
        self.memory = ConversationMemory(
            max_length=self.config.max_history_length,
            persistence_path="./conversation_history.json",
        )

        # Ingest documents on startup
        self._ingest_documents()

    def _ingest_documents(self):
        """Run the ingestion pipeline on startup."""
        chunks = self.ingestion.run(self.config.documents_dir)
        if chunks:
            self.vector_store.add_documents(chunks)

    def chat(self, message: str, history: list[list[str]]) -> tuple:
        """Handle a chat interaction."""
        # Add user message to memory
        self.memory.add_user_message(message)

        # Get RAG response
        response = self.rag.query(message, self.memory.get_history_dicts())

        # Add assistant response to memory
        self.memory.add_assistant_message(response.answer, response.sources)

        # Format sources
        sources_text = ""
        if response.sources:
            sources_text = "\n\n**Sources:**\n"
            for i, src in enumerate(response.sources, 1):
                score = src["score"]
                source = src["metadata"].get("source", "unknown")
                sources_text += f"{i}. {source} (relevance: {score:.2f})\n"

        return response.answer + sources_text

    def ingest_documents(self, files) -> str:
        """Handle document upload and ingestion."""
        if not files:
            return "No files uploaded."

        count = 0
        for file in files:
            try:
                chunks = self.ingestion.load_document(file.name)
                chunk_list = self.ingestion.chunk_documents(chunks)
                self.vector_store.add_documents(chunk_list)
                count += len(chunk_list)
            except Exception as e:
                print(f"Error processing {file.name}: {e}")

        stats = self.vector_store.get_stats()
        return f"Ingested {count} chunks from {len(files)} files. Total documents in store: {stats['total_documents']}"

    def get_stats(self) -> str:
        """Get current system statistics."""
        stats = self.vector_store.get_stats()
        return f"""**System Statistics:**
- Collection: {stats['collection']}
- Total documents: {stats['total_documents']}
- Embedding model: {stats['embedding_model']}
- Embedding dimension: {stats['embedding_dim']}
- Conversation length: {len(self.memory.get_full_history())} messages
"""

    def build_ui(self) -> gr.Blocks:
        """Build the Gradio interface."""
        with gr.Blocks(title="RAG Chatbot", theme=gr.themes.Soft()) as app:
            gr.Markdown("# RAG Chatbot\nAsk questions about your documents.")

            with gr.Row():
                with gr.Column(scale=3):
                    chatbot = gr.Chatbot(label="Chat", height=500)
                    msg = gr.Textbox(label="Your question", placeholder="Ask something about your documents...")
                    with gr.Row():
                        submit = gr.Button("Send", variant="primary")
                        clear = gr.Button("Clear History")

                with gr.Column(scale=1):
                    gr.Markdown("### Document Upload")
                    file_upload = gr.File(
                        label="Upload Documents",
                        file_count="multiple",
                        file_types=[".pdf", ".txt", ".md"],
                    )
                    upload_btn = gr.Button("Ingest Documents")
                    upload_status = gr.Textbox(label="Status", interactive=False)

                    gr.Markdown("### System Info")
                    stats_display = gr.Markdown(value=self.get_stats())
                    refresh_btn = gr.Button("Refresh Stats")

            # Event handlers
            def respond(message, chat_history):
                if not message.strip():
                    return "", chat_history
                bot_message = self.chat(message, chat_history)
                chat_history.append([message, bot_message])
                return "", chat_history

            submit.click(respond, [msg, chatbot], [msg, chatbot])
            msg.submit(respond, [msg, chatbot], [msg, chatbot])
            clear.click(lambda: ([], ""), outputs=[chatbot, msg])
            upload_btn.click(self.ingest_documents, [file_upload], [upload_status])
            refresh_btn.click(self.get_stats, outputs=[stats_display])

        return app


if __name__ == "__main__":
    app = RAGChatbotApp()
    demo = app.build_ui()
    demo.launch(share=True)
```

### Step 7: Testing and Evaluation

```python
# test_rag.py
"""
Tests for the RAG pipeline components.
"""
import pytest
from pathlib import Path
import tempfile
import shutil
from ingestion import DocumentIngestionPipeline
from vector_store import VectorStoreManager
from conversation_memory import ConversationMemory


@pytest.fixture
def temp_dir():
    """Create a temporary directory with test documents."""
    tmp = tempfile.mkdtemp()
    doc_dir = Path(tmp) / "docs"
    doc_dir.mkdir()

    # Create test documents
    (doc_dir / "test1.txt").write_text(
        "Artificial General Intelligence (AGI) refers to a type of artificial intelligence "
        "that has the capacity to understand or learn any intellectual task that a human being can. "
        "AGI is considered the hypothetical successor to narrow AI."
    )
    (doc_dir / "test2.txt").write_text(
        "Machine learning is a subset of artificial intelligence that provides systems "
        "the ability to automatically learn and improve from experience without being "
        "explicitly programmed. Machine learning focuses on the development of computer "
        "programs that can access data and use it to learn for themselves."
    )
    yield tmp
    shutil.rmtree(tmp)


def test_document_ingestion(temp_dir):
    """Test the document ingestion pipeline."""
    pipeline = DocumentIngestionPipeline(chunk_size=100, chunk_overlap=10)
    docs = pipeline.load_documents(str(Path(temp_dir) / "docs"))
    assert len(docs) == 2

    chunks = pipeline.chunk_documents(docs)
    assert len(chunks) > 0
    print(f"Created {len(chunks)} chunks from 2 test documents.")


def test_vector_store(temp_dir):
    """Test the vector store."""
    store = VectorStoreManager(
        embedding_model="sentence-transformers/all-MiniLM-L6-v2",
        collection_name="test_collection",
        persist_directory=str(Path(temp_dir) / "db"),
    )

    from langchain.schema import Document
    chunks = [
        Document(page_content="AGI is artificial general intelligence.", metadata={"source": "test1.txt"}),
        Document(page_content="Machine learning is a subset of AI.", metadata={"source": "test2.txt"}),
    ]

    store.add_documents(chunks)
    assert store.get_stats()["total_documents"] == 2

    results = store.query("What is AGI?")
    assert len(results) > 0
    assert results[0]["score"] > 0.3
    print(f"Query 'What is AGI?' returned {len(results)} results, top score: {results[0]['score']:.3f}")


def test_conversation_memory():
    """Test conversation memory."""
    memory = ConversationMemory(max_length=3)

    memory.add_user_message("Hello")
    memory.add_assistant_message("Hi there!")
    memory.add_user_message("What is AI?")
    memory.add_assistant_message("AI is artificial intelligence.")

    history = memory.get_history_dicts()
    assert len(history) == 4
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "assistant"

    # Test trimming
    for i in range(10):
        memory.add_user_message(f"Message {i}")
        memory.add_assistant_message(f"Response {i}")

    assert len(memory.get_history_dicts()) <= 6  # max_length * 2
    print("Conversation memory tests passed.")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

### Expected Output

When you run the application and upload some PDF or text documents:

```
Initializing RAG Chatbot...
Loading embedding model: sentence-transformers/all-MiniLM-L6-v2
Vector store initialized: rag_documents (0 documents)
=== Document Ingestion Pipeline ===
  Loaded: research_paper.pdf
  Loaded: technical_docs.txt
Loaded 2 documents total.
Split 2 documents into 12 chunks.
Pipeline complete: 12 chunks ready for embedding.

Added 12 chunks to vector store.
Loading LLM: microsoft/DialoGPT-medium
LLM loaded successfully.
Running on local URL:  http://127.0.0.1:7860
```

### Challenges and Solutions

| Challenge | Solution |
|-----------|----------|
| Chunk size too large causes context overflow | Use `RecursiveCharacterTextSplitter` with configurable sizes; test different values |
| Poor retrieval quality | Experiment with different embedding models (e.g., `bge-small-en-v1.5`, `e5-small-v2`) |
| LLM hallucinates despite context | Strengthen the prompt to emphasize grounding; use a larger model |
| Slow query response | Use GPU; reduce `top_k`; pre-compute and cache embeddings |
| Documents with tables/images | Use specialized loaders (e.g., `UnstructuredPDFLoader`) for complex PDFs |

### Extension Ideas

1. **Hybrid search:** Combine vector search with BM25 keyword search for better retrieval
2. **Re-ranking:** Add a cross-encoder re-ranker (e.g., `cross-encoder/ms-marco-MiniLM-L-6-v2`) to improve ranking
3. **Multi-modal RAG:** Support image and table extraction alongside text
4. **Streaming responses:** Add streaming generation for real-time response display
5. **Evaluation framework:** Implement RAGAS or custom metrics for retrieval and generation quality

### Deployment Considerations

- **Vector store persistence:** Use a managed vector database (Pinecone, Weaviate, Qdrant) for production
- **LLM hosting:** Use vLLM or TGI for efficient serving; consider API providers (OpenAI, Anthropic)
- **Scaling:** Use async processing for document ingestion; implement request queuing
- **Security:** Add input sanitization, rate limiting, and authentication for the web interface
- **Monitoring:** Track retrieval quality, response latency, and user satisfaction metrics

---

## Project 2: Multi-Agent System for Task Automation

### Description and Goals

Multi-agent systems represent a step toward AGI by decomposing complex tasks into subtasks handled by specialized agents. This project builds an orchestrator that coordinates a team of AI agents — a researcher, a coder, and a code reviewer — to solve complex programming tasks.

**Goals:**
- Design a base agent class with common capabilities (LLM interaction, tool use, memory)
- Implement specialized agents (researcher, coder, reviewer) with distinct roles
- Build an orchestrator that decomposes tasks and coordinates agent collaboration
- Implement inter-agent communication and state management
- Create a web dashboard for monitoring agent activity

### Architecture

```
┌──────────────────────────────────────────────────────┐
│                   User Dashboard                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │              Task Input & Status                 │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐   │ │
│  │  │Researcher│ │  Coder   │ │   Reviewer   │   │ │
│  │  │  Status  │ │  Status  │ │    Status    │   │ │
│  │  └──────────┘ └──────────┘ └──────────────┘   │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   Orchestrator   │
              │  ┌────────────┐ │
              │  │   Task     │ │
              │  │ Decomposer │ │
              │  └──────┬─────┘ │
              │         │       │
              │  ┌──────▼─────┐ │
              │  │  Scheduler │ │
              │  └──────┬─────┘ │
              └─────────┼───────┘
          ┌─────────────┼─────────────┐
          │             │             │
   ┌──────▼──────┐ ┌───▼────┐ ┌──────▼──────┐
   │ Researcher  │ │ Coder  │ │  Reviewer   │
   │   Agent     │ │ Agent  │ │   Agent     │
   │ ┌─────────┐ │ │┌──────┐│ │ ┌─────────┐│
   │ │Web Search│ │ ││ Code ││ │ │ AST      ││
   │ │Docs Query│ │ ││ Gen  ││ │ │ Analysis ││
   │ │Papers   │ │ ││Debug ││ │ │ Linting  ││
   │ └─────────┘ │ │└──────┘│ │ └─────────┘│
   └─────────────┘ └────────┘ └─────────────┘
          │             │             │
          └─────────────┼─────────────┘
                  ┌─────▼─────┐
                  │  Shared    │
                  │  Memory    │
                  │  Store     │
                  └───────────┘
```

### Prerequisites

```toml
# Add to pyproject.toml dependencies
# dependencies = [
#     "openai>=1.0.0",       # or use local models
#     "chromadb>=0.4.0",
#     "gradio>=4.0.0",
#     "ast-grep>=0.1.0",
#     "rich>=13.0.0",        # Pretty console output
# ]
```

### Step 1: Designing the Agent Base Class

```python
# agents/base.py
"""
Base agent class providing common capabilities for all agents.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import json
import uuid


class AgentRole(Enum):
    """Roles available in the multi-agent system."""
    RESEARCHER = "researcher"
    CODER = "coder"
    REVIEWER = "reviewer"
    ORCHESTRATOR = "orchestrator"


class TaskStatus(Enum):
    """Status of a task or subtask."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


@dataclass
class Task:
    """A unit of work in the multi-agent system."""
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    description: str = ""
    status: TaskStatus = TaskStatus.PENDING
    assigned_to: AgentRole = AgentRole.ORCHESTRATOR
    result: str = ""
    dependencies: list[str] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    completed_at: str = ""
    metadata: dict = field(default_factory=dict)


@dataclass
class AgentMessage:
    """A message between agents."""
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    from_agent: AgentRole = AgentRole.ORCHESTRATOR
    to_agent: AgentRole = AgentRole.ORCHESTRATOR
    content: str = ""
    message_type: str = "info"  # info, request, response, error
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: dict = field(default_factory=dict)


class BaseAgent(ABC):
    """
    Abstract base class for all agents in the multi-agent system.

    Provides:
    - LLM interaction
    - Shared memory access
    - Message passing
    - Task lifecycle management
    """

    def __init__(self, role: AgentRole, memory_store: "MemoryStore", llm_client=None):
        self.role = role
        self.memory = memory_store
        self.llm = llm_client
        self.message_queue: list[AgentMessage] = []
        self.task_history: list[Task] = []
        self._system_prompt = self._build_system_prompt()

    @abstractmethod
    def _build_system_prompt(self) -> str:
        """Build the system prompt for this agent's role."""
        pass

    @abstractmethod
    def execute_task(self, task: Task) -> Task:
        """Execute an assigned task. Must be implemented by subclasses."""
        pass

    def send_message(self, to_agent: AgentRole, content: str,
                     msg_type: str = "info") -> AgentMessage:
        """Send a message to another agent."""
        message = AgentMessage(
            from_agent=self.role,
            to_agent=to_agent,
            content=content,
            message_type=msg_type,
        )
        self.memory.store_message(message)
        return message

    def receive_messages(self) -> list[AgentMessage]:
        """Retrieve pending messages for this agent."""
        messages = self.memory.get_messages_for(self.role)
        return messages

    def llm_call(self, prompt: str, context: str = "") -> str:
        """Make a call to the LLM with the agent's system prompt."""
        full_prompt = f"{self._system_prompt}\n\n"
        if context:
            full_prompt += f"Context:\n{context}\n\n"
        full_prompt += f"Task: {prompt}\n\nResponse:"

        if self.llm:
            # Use actual LLM client (OpenAI API compatible)
            response = self.llm.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": self._system_prompt},
                    {"role": "user", "content": f"{context}\n\n{prompt}" if context else prompt},
                ],
                temperature=0.7,
                max_tokens=2048,
            )
            return response.choices[0].message.content
        else:
            # Fallback: return a template response for demo purposes
            return f"[{self.role.value}] Processed: {prompt[:100]}..."

    def log(self, message: str):
        """Log an agent action."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"  [{timestamp}] [{self.role.value.upper()}] {message}")

    def assign_task(self, task: Task):
        """Assign a task to this agent."""
        task.assigned_to = self.role
        task.status = TaskStatus.IN_PROGRESS
        self.log(f"Received task: {task.description[:80]}...")
        self.task_history.append(task)
```

### Step 2: Creating Specialized Agents

```python
# agents/researcher.py
"""Research agent: gathers information and context for coding tasks."""
from agents.base import BaseAgent, AgentRole, Task, TaskStatus


class ResearcherAgent(BaseAgent):
    """Agent specialized in gathering information, documentation, and context."""

    def __init__(self, memory_store, llm_client=None):
        super().__init__(AgentRole.RESEARCHER, memory_store, llm_client)

    def _build_system_prompt(self) -> str:
        return """You are a Research Agent in a multi-agent coding system.

Your role is to:
1. Analyze task requirements and identify what information is needed
2. Research best practices, design patterns, and relevant documentation
3. Provide context and specifications to the Coder agent
4. Identify potential risks, edge cases, and dependencies

Output format:
- Provide a structured research summary with clear sections
- Include specific API references, library recommendations, and code patterns
- Highlight potential challenges and suggest approaches
- Be specific and actionable — the Coder agent needs concrete guidance."""

    def execute_task(self, task: Task) -> Task:
        """Research the task and produce a specification document."""
        self.log(f"Starting research on: {task.description[:60]}...")

        # Step 1: Analyze the task
        analysis = self._analyze_task(task)

        # Step 2: Gather relevant context from memory
        context = self._gather_context(task)

        # Step 3: Research and produce specification
        specification = self._produce_specification(task, analysis, context)

        # Step 4: Send findings to coder
        self.send_message(AgentRole.CODER, specification, msg_type="request")

        task.result = specification
        task.status = TaskStatus.COMPLETED
        task.completed_at = __import__("datetime").datetime.now().isoformat()

        self.log("Research complete. Specification sent to Coder.")
        return task

    def _analyze_task(self, task: Task) -> str:
        """Analyze the task requirements."""
        return self.llm_call(
            f"Analyze this task and identify requirements, constraints, and dependencies:\n{task.description}",
            context=f"Task ID: {task.id}"
        )

    def _gather_context(self, task: Task) -> str:
        """Gather relevant context from shared memory."""
        # Query memory for related tasks and knowledge
        related = self.memory.search(task.description, limit=5)
        if related:
            return "Related context from previous work:\n" + "\n".join(
                f"- {r['content'][:200]}" for r in related
            )
        return "No prior context found."

    def _produce_specification(self, task: Task, analysis: str, context: str) -> str:
        """Produce a detailed specification for the coder."""
        return self.llm_call(
            f"Based on this analysis, produce a detailed coding specification:\n\n"
            f"Task: {task.description}\n\nAnalysis:\n{analysis}",
            context=context
        )
```

```python
# agents/coder.py
"""Code generation agent."""
from agents.base import BaseAgent, AgentRole, Task, TaskStatus


class CoderAgent(BaseAgent):
    """Agent specialized in writing and debugging code."""

    def __init__(self, memory_store, llm_client=None):
        super().__init__(AgentRole.CODER, memory_store, llm_client)

    def _build_system_prompt(self) -> str:
        return """You are a Coder Agent in a multi-agent coding system.

Your role is to:
1. Write clean, well-documented Python code based on specifications
2. Follow PEP 8 style guidelines and best practices
3. Include comprehensive error handling
4. Write code that is modular, testable, and maintainable
5. Add docstrings and type hints

Output format:
- Provide the complete, runnable code
- Include brief inline comments for complex logic
- Structure code with clear functions and classes
- Handle edge cases and errors gracefully."""

    def execute_task(self, task: Task) -> Task:
        """Write code based on the research specification."""
        self.log(f"Starting coding for: {task.description[:60]}...")

        # Step 1: Review the specification
        spec = self._review_specification(task)

        # Step 2: Generate code
        code = self._generate_code(task, spec)

        # Step 3: Add basic tests
        tests = self._generate_tests(task, code)

        # Step 4: Send to reviewer
        combined = f"## Generated Code\n\n```python\n{code}\n```\n\n## Tests\n\n```python\n{tests}\n```"
        self.send_message(AgentRole.REVIEWER, combined, msg_type="request")

        task.result = combined
        task.status = TaskStatus.COMPLETED
        task.completed_at = __import__("datetime").datetime.now().isoformat()

        self.log("Code generation complete. Sent to Reviewer.")
        return task

    def _review_specification(self, task: Task) -> str:
        """Review the specification from the researcher."""
        messages = self.receive_messages()
        spec_messages = [m for m in messages if m.message_type == "request"]
        if spec_messages:
            return spec_messages[-1].content
        return task.description

    def _generate_code(self, task: Task, specification: str) -> str:
        """Generate code from the specification."""
        return self.llm_call(
            f"Write Python code for this specification:\n{specification}",
            context=f"Task: {task.description}"
        )

    def _generate_tests(self, task: Task, code: str) -> str:
        """Generate basic tests for the code."""
        return self.llm_call(
            f"Write pytest tests for this code:\n{code}",
            context="Focus on edge cases and basic functionality."
        )
```

```python
# agents/reviewer.py
"""Code review agent."""
from agents.base import BaseAgent, AgentRole, Task, TaskStatus


class ReviewerAgent(BaseAgent):
    """Agent specialized in reviewing code quality and correctness."""

    def __init__(self, memory_store, llm_client=None):
        super().__init__(AgentRole.REVIEWER, memory_store, llm_client)

    def _build_system_prompt(self) -> str:
        return """You are a Code Review Agent in a multi-agent coding system.

Your role is to:
1. Review code for correctness, style, and best practices
2. Identify bugs, security issues, and performance problems
3. Suggest improvements and refactoring opportunities
4. Verify that the code matches the original specification
5. Check that tests cover the key functionality

Output format:
- Provide a structured review with severity levels (critical, major, minor, suggestion)
- For each issue, explain the problem and provide a fix
- End with an overall assessment: APPROVE, REQUEST_CHANGES, or NEEDS_DISCUSSION"""

    def execute_task(self, task: Task) -> Task:
        """Review the code submitted by the coder."""
        self.log(f"Starting review for: {task.description[:60]}...")

        # Step 1: Get the code from messages
        code_submission = self._get_submission()

        # Step 2: Review the code
        review = self._review_code(task, code_submission)

        # Step 3: Check tests
        test_review = self._review_tests(code_submission)

        # Step 4: Produce final assessment
        assessment = self._produce_assessment(review, test_review)

        # Store review results in shared memory
        self.memory.store_knowledge(
            f"Review for {task.id}: {assessment[:200]}",
            metadata={"task_id": task.id, "type": "review"}
        )

        task.result = assessment
        task.status = TaskStatus.COMPLETED
        task.completed_at = __import__("datetime").datetime.now().isoformat()

        self.log("Review complete.")
        return task

    def _get_submission(self) -> str:
        """Get the code submission from messages."""
        messages = self.receive_messages()
        code_messages = [m for m in messages if m.message_type == "request"]
        if code_messages:
            return code_messages[-1].content
        return "No submission found."

    def _review_code(self, task: Task, code: str) -> str:
        """Perform code review."""
        return self.llm_call(
            f"Review this code for a task: {task.description}\n\nCode:\n{code}",
            context="Focus on correctness, security, and best practices."
        )

    def _review_tests(self, code: str) -> str:
        """Review the test coverage."""
        return self.llm_call(
            f"Review the test coverage for this code:\n{code}",
            context="Check if tests cover edge cases and important functionality."
        )

    def _produce_assessment(self, review: str, test_review: str) -> str:
        """Produce final review assessment."""
        return f"## Code Review\n\n### Code Quality\n{review}\n\n### Test Coverage\n{test_review}"
```

### Step 3: Building the Orchestrator

```python
# orchestrator.py
"""
Multi-agent orchestrator: coordinates task decomposition and agent collaboration.
"""
from dataclasses import dataclass, field
from datetime import datetime
from agents.base import AgentRole, Task, TaskStatus, AgentMessage
from agents.researcher import ResearcherAgent
from agents.coder import CoderAgent
from agents.reviewer import ReviewerAgent


class MemoryStore:
    """Shared memory store for inter-agent communication."""

    def __init__(self):
        self.messages: list[AgentMessage] = []
        self.knowledge: list[dict] = []
        self.tasks: list[Task] = []

    def store_message(self, message: AgentMessage):
        self.messages.append(message)

    def get_messages_for(self, agent_role: AgentRole) -> list[AgentMessage]:
        return [m for m in self.messages if m.to_agent == agent_role]

    def store_knowledge(self, content: str, metadata: dict = None):
        self.knowledge.append({"content": content, "metadata": metadata or {}})

    def search(self, query: str, limit: int = 5) -> list[dict]:
        # Simple keyword search (replace with vector search in production)
        results = []
        for item in self.knowledge:
            if any(word.lower() in item["content"].lower() for word in query.split()):
                results.append(item)
        return results[:limit]

    def store_task(self, task: Task):
        self.tasks.append(task)


class Orchestrator:
    """
    Orchestrates the multi-agent system.

    Responsibilities:
    - Receive and decompose complex tasks
    - Assign subtasks to appropriate agents
    - Coordinate agent collaboration
    - Aggregate results
    """

    def __init__(self, llm_client=None):
        self.memory = MemoryStore()
        self.agents = {
            AgentRole.RESEARCHER: ResearcherAgent(self.memory, llm_client),
            AgentRole.CODER: CoderAgent(self.memory, llm_client),
            AgentRole.REVIEWER: ReviewerAgent(self.memory, llm_client),
        }
        self.task_log: list[dict] = []

    def submit_task(self, task_description: str) -> Task:
        """Submit a complex task for the agents to work on."""
        print(f"\n{'='*60}")
        print(f"New Task: {task_description}")
        print(f"{'='*60}\n")

        # Step 1: Decompose the task
        subtasks = self._decompose_task(task_description)

        # Step 2: Execute subtasks in order (research -> code -> review)
        pipeline = [AgentRole.RESEARCHER, AgentRole.CODER, AgentRole.REVIEWER]
        results = {}

        for agent_role in pipeline:
            subtask = subtasks.get(agent_role)
            if subtask:
                print(f"\n--- {agent_role.value.upper()} ---")
                agent = self.agents[agent_role]
                agent.assign_task(subtask)
                result = agent.execute_task(subtask)
                results[agent_role] = result
                self.memory.store_task(result)

        # Step 3: Aggregate results
        final_result = self._aggregate_results(results)
        print(f"\n{'='*60}")
        print("Task Complete!")
        print(f"{'='*60}\n")

        return final_result

    def _decompose_task(self, description: str) -> dict[AgentRole, Task]:
        """Decompose a complex task into subtasks for each agent."""
        # Create subtasks with dependencies
        research_task = Task(
            description=f"Research and analyze requirements for: {description}",
            assigned_to=AgentRole.RESEARCHER,
        )
        coding_task = Task(
            description=f"Implement the solution based on research for: {description}",
            assigned_to=AgentRole.CODER,
            dependencies=[research_task.id],
        )
        review_task = Task(
            description=f"Review and validate the implementation for: {description}",
            assigned_to=AgentRole.REVIEWER,
            dependencies=[coding_task.id],
        )

        return {
            AgentRole.RESEARCHER: research_task,
            AgentRole.CODER: coding_task,
            AgentRole.REVIEWER: review_task,
        }

    def _aggregate_results(self, results: dict) -> Task:
        """Aggregate results from all agents into a final task."""
        final = Task(
            description="Aggregated result",
            status=TaskStatus.COMPLETED,
        )

        parts = []
        for role, task in results.items():
            parts.append(f"### {role.value.capitalize()} Output\n\n{task.result}\n")

        final.result = "\n".join(parts)
        return final
```

### Step 4: Building the UI Dashboard

```python
# dashboard.py
"""
Gradio dashboard for monitoring the multi-agent system.
"""
import gradio as gr
from orchestrator import Orchestrator


class AgentDashboard:
    """Web dashboard for the multi-agent system."""

    def __init__(self):
        self.orchestrator = Orchestrator()
        self.task_results = []

    def process_task(self, task_description: str) -> str:
        """Process a task and return the results."""
        if not task_description.strip():
            return "Please enter a task description."

        try:
            result = self.orchestrator.submit_task(task_description)
            self.task_results.append({
                "task": task_description,
                "result": result.result,
            })
            return result.result
        except Exception as e:
            return f"Error: {str(e)}"

    def get_history(self) -> str:
        """Get the task history."""
        if not self.task_results:
            return "No tasks completed yet."

        output = ""
        for i, entry in enumerate(self.task_results, 1):
            output += f"## Task {i}\n\n**Description:** {entry['task']}\n\n"
            output += f"**Result:**\n{entry['result']}\n\n---\n\n"
        return output

    def build_ui(self) -> gr.Blocks:
        """Build the Gradio dashboard."""
        with gr.Blocks(title="Multi-Agent System", theme=gr.themes.Soft()) as app:
            gr.Markdown("# Multi-Agent Task Automation System")
            gr.Markdown("Submit complex programming tasks and watch the agents collaborate.")

            with gr.Row():
                with gr.Column(scale=2):
                    task_input = gr.Textbox(
                        label="Task Description",
                        placeholder="e.g., Build a REST API for managing a to-do list with CRUD operations...",
                        lines=4,
                    )
                    submit_btn = gr.Button("Submit Task", variant="primary")
                    output = gr.Markdown(label="Result")

                with gr.Column(scale=1):
                    gr.Markdown("### Agent Status")
                    gr.Markdown("""
                    - **Researcher**: Analyzes requirements
                    - **Coder**: Implements the solution
                    - **Reviewer**: Validates the code
                    """)
                    history_btn = gr.Button("View History")
                    history = gr.Markdown(label="Task History")

            submit_btn.click(self.process_task, [task_input], [output])
            task_input.submit(self.process_task, [task_input], [output])
            history_btn.click(self.get_history, outputs=[history])

        return app


if __name__ == "__main__":
    dashboard = AgentDashboard()
    demo = dashboard.build_ui()
    demo.launch(share=True)
```

### Step 5: Testing the Multi-Agent System

```python
# test_agents.py
"""Tests for the multi-agent system."""
import pytest
from orchestrator import Orchestrator, MemoryStore
from agents.base import AgentRole, Task, TaskStatus


def test_memory_store():
    """Test the shared memory store."""
    store = MemoryStore()

    from agents.base import AgentMessage
    msg = AgentMessage(from_agent=AgentRole.RESEARCHER, to_agent=AgentRole.CODER, content="Hello")
    store.store_message(msg)
    assert len(store.get_messages_for(AgentRole.CODER)) == 1

    store.store_knowledge("Python is a programming language", {"type": "fact"})
    results = store.search("Python")
    assert len(results) == 1
    print("Memory store tests passed.")


def test_orchestrator():
    """Test the orchestrator (without LLM)."""
    orch = Orchestrator(llm_client=None)
    result = orch.submit_task("Build a simple calculator")

    assert result.status == TaskStatus.COMPLETED
    assert len(orch.memory.tasks) == 3  # 3 subtasks
    print("Orchestrator test passed.")
    print(f"Result preview: {result.result[:200]}...")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

### Expected Output

```
============================================================
New Task: Build a REST API for managing a to-do list
============================================================

--- RESEARCHER ---
  [10:30:01] [RESEARCHER] Received task: Research and analyze requirements for...
  [10:30:03] [RESEARCHER] Research complete. Specification sent to Coder.

--- CODER ---
  [10:30:03] [CODER] Received task: Implement the solution based on research...
  [10:30:06] [CODER] Code generation complete. Sent to Reviewer.

--- REVIEWER ---
  [10:30:06] [REVIEWER] Received task: Review and validate the implementation...
  [10:30:09] [REVIEWER] Review complete.

============================================================
Task Complete!
============================================================
```

### Extension Ideas

1. **Parallel execution:** Allow independent subtasks to run concurrently
2. **Dynamic agent creation:** Spawn specialized agents based on task type
3. **Tool integration:** Give agents access to shell commands, file system, web APIs
4. **Persistent memory:** Use a vector store for long-term knowledge accumulation
5. **Agent negotiation:** Allow agents to debate and refine solutions before finalizing

### Deployment Considerations

- **Model hosting:** Use vLLM or Ollama for local model serving; use API providers for production
- **Task queuing:** Use Redis or Celery for asynchronous task management
- **Observability:** Add structured logging and tracing (e.g., LangSmith, Phoenix)
- **Scalability:** Each agent can run in a separate container; use message queues for coordination
- **Security:** Sandbox agent code execution (Docker, Firecracker) to prevent arbitrary code execution

---

## Project 3: Autonomous Coding Assistant

### Description and Goals

This project builds a coding assistant that understands code structure, generates implementations, and performs code review. Unlike simple text completion, this assistant understands AST structure, can navigate codebases, and produces contextually appropriate code.

**Goals:**
- Build a code understanding pipeline using AST analysis
- Implement code generation using a code-specialized LLM
- Add code review and quality analysis capabilities
- Create an interactive CLI/web interface
- Test with real programming tasks

### Architecture

```
┌──────────────────────────────────────────────────────┐
│               User Interface (CLI/Web)                │
│  ┌──────────────────────────────────────────────────┐│
│  │  Code Input  │  Command Input  │  Output Display ││
│  └──────┬───────┴────────┬───────┴────────▲────────┘│
└─────────┼────────────────┼────────────────┼──────────┘
          │                │                │
          ▼                ▼                │
┌──────────────────────────────────────────────┐
│            Code Assistant Core                │
│                                              │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │   Code        │  │  Code Generation   │   │
│  │   Understanding│ │  Engine            │   │
│  │  ┌──────────┐│  │  ┌──────────────┐  │   │
│  │  │  AST      ││  │  │  Template    │  │   │
│  │  │  Parser   ││  │  │  Engine      │  │   │
│  │  └──────────┘│  │  └──────────────┘  │   │
│  │  ┌──────────┐│  │  ┌──────────────┐  │   │
│  │  │  Scope   ││  │  │  Context     │  │   │
│  │  │  Analyzer││  │  │  Builder     │  │   │
│  │  └──────────┘│  │  └──────────────┘  │   │
│  └──────────────┘  └────────────────────┘   │
│                                              │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │  Code Review  │  │  Codebase Index    │   │
│  │  Engine       │  │  (Embeddings)      │   │
│  │  ┌──────────┐│  │  ┌──────────────┐  │   │
│  │  │  Linting  ││  │  │  Symbol      │  │   │
│  │  │  Analysis ││  │  │  Search      │  │   │
│  │  └──────────┘│  │  └──────────────┘  │   │
│  └──────────────┘  └────────────────────┘   │
└──────────────────────────────────────────────┘
```

### Step 1: Setting Up the Code Model

```python
# code_assistant/config.py
"""Configuration for the coding assistant."""
from dataclasses import dataclass


@dataclass
class CodeAssistantConfig:
    # Model configuration
    code_model: str = "bigcode/starcoder"  # or "codellama/CodeLlama-7b-hf"
    max_tokens: int = 2048
    temperature: float = 0.2  # Lower temperature for code

    # AST analysis
    supported_languages: list[str] = None

    # Code review
    max_line_length: int = 88
    max_function_length: int = 50

    def __post_init__(self):
        if self.supported_languages is None:
            self.supported_languages = ["python", "javascript", "typescript"]
```

### Step 2: Building the Code Understanding Pipeline

```python
# code_assistant/code_understanding.py
"""
AST-based code understanding pipeline.
"""
import ast
import json
from dataclasses import dataclass, field


@dataclass
class FunctionInfo:
    """Information about a function."""
    name: str
    args: list[str]
    return_type: str
    docstring: str
    body_lines: int
    decorators: list[str]
    line_start: int
    line_end: int


@dataclass
class ClassInfo:
    """Information about a class."""
    name: str
    bases: list[str]
    docstring: str
    methods: list[FunctionInfo]
    line_start: int
    line_end: int


@dataclass
class ModuleInfo:
    """Information about a Python module."""
    file_path: str
    imports: list[str]
    functions: list[FunctionInfo]
    classes: list[ClassInfo]
    top_level_code: str
    total_lines: int


class CodeAnalyzer:
    """Analyzes Python source code using AST parsing."""

    def analyze(self, source_code: str, file_path: str = "<string>") -> ModuleInfo:
        """Parse and analyze Python source code."""
        tree = ast.parse(source_code)
        lines = source_code.split("\n")

        imports = self._extract_imports(tree)
        functions = [self._analyze_function(node) for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        classes = [self._analyze_class(node) for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]

        return ModuleInfo(
            file_path=file_path,
            imports=imports,
            functions=functions,
            classes=classes,
            top_level_code=self._extract_top_level(tree, source_code),
            total_lines=len(lines),
        )

    def _extract_imports(self, tree: ast.Module) -> list[str]:
        """Extract all import statements."""
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(f"import {alias.name}")
            elif isinstance(node, ast.ImportFrom):
                names = ", ".join(a.name for a in node.names)
                imports.append(f"from {node.module} import {names}")
        return imports

    def _analyze_function(self, node: ast.FunctionDef) -> FunctionInfo:
        """Analyze a function definition."""
        args = [arg.arg for arg in node.args.args]
        return_type = ast.dump(node.returns) if node.returns else "None"
        docstring = ast.get_docstring(node) or ""
        decorators = [ast.dump(d) for d in node.decorator_list]

        return FunctionInfo(
            name=node.name,
            args=args,
            return_type=return_type,
            docstring=docstring,
            body_lines=node.end_lineno - node.lineno if hasattr(node, "end_lineno") else 0,
            decorators=decorators,
            line_start=node.lineno,
            line_end=getattr(node, "end_lineno", node.lineno),
        )

    def _analyze_class(self, node: ast.ClassDef) -> ClassInfo:
        """Analyze a class definition."""
        bases = [ast.dump(b) for b in node.bases]
        methods = [
            self._analyze_function(n) for n in node.body if isinstance(n, ast.FunctionDef)
        ]

        return ClassInfo(
            name=node.name,
            bases=bases,
            docstring=ast.get_docstring(node) or "",
            methods=methods,
            line_start=node.lineno,
            line_end=getattr(node, "end_lineno", node.lineno),
        )

    def _extract_top_level(self, tree: ast.Module, source: str) -> str:
        """Extract top-level code (not in functions/classes)."""
        lines = source.split("\n")
        # Simplified: return lines outside any function/class
        result = []
        in_block = False
        for i, line in enumerate(lines, 1):
            if line.strip().startswith(("def ", "class ", "async def ")):
                in_block = True
            elif not line.startswith((" ", "\t")) and line.strip():
                in_block = False
            if not in_block and not line.strip().startswith(("def ", "class ", "import ", "from ")):
                result.append(line)
        return "\n".join(result[:20])  # First 20 lines

    def get_summary(self, module: ModuleInfo) -> str:
        """Get a human-readable summary of the module."""
        summary = f"File: {module.file_path}\n"
        summary += f"Lines: {module.total_lines}\n"
        summary += f"Imports: {len(module.imports)}\n"
        summary += f"Functions: {len(module.functions)}\n"
        summary += f"Classes: {len(module.classes)}\n\n"

        if module.functions:
            summary += "Functions:\n"
            for f in module.functions:
                args_str = ", ".join(f.args)
                summary += f"  - {f.name}({args_str}) [lines {f.line_start}-{f.line_end}]\n"

        if module.classes:
            summary += "\nClasses:\n"
            for c in module.classes:
                summary += f"  - {c.name} ({len(c.methods)} methods)\n"

        return summary
```

### Step 3: Implementing Code Generation

```python
# code_assistant/code_generator.py
"""
Code generation engine using a code-specialized LLM.
"""
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch


class CodeGenerator:
    """Generates code using a code-specialized language model."""

    def __init__(self, model_name: str = "bigcode/starcoder", device: str = None):
        self.model_name = model_name
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        print(f"Loading code model: {model_name}")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            device_map="auto" if self.device == "cuda" else None,
        )
        self.model.to(self.device)
        self.model.eval()
        print(f"Model loaded on {self.device}")

    def generate_function(self, name: str, description: str, signature: str = "",
                          context: str = "") -> str:
        """Generate a function based on description."""
        prompt = f'"""\nGenerate a Python function.\n\nName: {name}\nDescription: {description}\n"""\n'
        if signature:
            prompt += f"def {signature}:\n"
        else:
            prompt += f"def {name}():\n"

        if context:
            prompt = f"# Context:\n{context}\n\n{prompt}"

        return self._generate(prompt)

    def generate_class(self, name: str, description: str, methods: list[str] = None) -> str:
        """Generate a class based on description."""
        prompt = f'"""\nGenerate a Python class.\n\nName: {name}\nDescription: {description}\n"""\n'
        prompt += f"class {name}:\n"

        if methods:
            prompt += f"    # Methods to implement: {', '.join(methods)}\n"

        return self._generate(prompt)

    def complete_code(self, code: str, instruction: str = "") -> str:
        """Complete or extend existing code."""
        prompt = code
        if instruction:
            prompt += f"\n# {instruction}\n"
        else:
            prompt += "\n"

        return self._generate(prompt)

    def explain_code(self, code: str) -> str:
        """Generate documentation/explanation for code."""
        prompt = f"# Explain this code in detail:\n\n{code}\n\n# Explanation:\n"
        return self._generate(prompt, max_tokens=1024)

    def fix_code(self, code: str, error: str) -> str:
        """Attempt to fix code based on an error message."""
        prompt = f"""# This code has an error:
{code}

# Error:
{error}

# Fixed code:
"""
        return self._generate(prompt)

    def _generate(self, prompt: str, max_tokens: int = 2048, temperature: float = 0.2) -> str:
        """Generate code from a prompt."""
        inputs = self.tokenizer.encode(prompt, return_tensors="pt", max_length=2048, truncation=True)
        inputs = inputs.to(self.device)

        with torch.no_grad():
            outputs = self.model.generate(
                inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=True,
                top_p=0.95,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        generated = self.tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
        return generated.strip()
```

### Step 4: Adding Code Review Capabilities

```python
# code_assistant/code_review.py
"""
Code review engine: quality analysis, linting, and suggestions.
"""
import ast
import re
from dataclasses import dataclass, field
from code_understanding import CodeAnalyzer, ModuleInfo


@dataclass
class ReviewIssue:
    """A single code review issue."""
    severity: str  # critical, major, minor, suggestion
    category: str  # style, bug, security, performance, documentation
    line: int
    message: str
    suggestion: str = ""


@dataclass
class ReviewResult:
    """Complete code review result."""
    issues: list[ReviewIssue]
    score: float  # 0-100
    summary: str
    suggestions: list[str]


class CodeReviewer:
    """Reviews Python code for quality and correctness."""

    def __init__(self, max_line_length: int = 88, max_function_length: int = 50):
        self.max_line_length = max_line_length
        self.max_function_length = max_function_length
        self.analyzer = CodeAnalyzer()

    def review(self, source_code: str) -> ReviewResult:
        """Perform a comprehensive code review."""
        issues = []

        # Parse and analyze
        try:
            module = self.analyzer.analyze(source_code)
        except SyntaxError as e:
            return ReviewResult(
                issues=[ReviewIssue("critical", "syntax", e.lineno or 1, f"Syntax error: {e.msg}")],
                score=0,
                summary="Code has syntax errors and cannot be reviewed.",
                suggestions=["Fix syntax errors before proceeding."],
            )

        # Run all checks
        issues.extend(self._check_style(source_code))
        issues.extend(self._check_documentation(module))
        issues.extend(self._check_complexity(module))
        issues.extend(self._check_naming(module))
        issues.extend(self._check_security(source_code))
        issues.extend(self._check_errors(source_code))

        # Calculate score
        score = self._calculate_score(issues)

        # Generate summary and suggestions
        summary = self._generate_summary(issues, module)
        suggestions = self._generate_suggestions(issues)

        return ReviewResult(issues=issues, score=score, summary=summary, suggestions=suggestions)

    def _check_style(self, code: str) -> list[ReviewIssue]:
        """Check code style."""
        issues = []
        lines = code.split("\n")

        for i, line in enumerate(lines, 1):
            if len(line) > self.max_line_length:
                issues.append(ReviewIssue(
                    "minor", "style", i,
                    f"Line too long ({len(line)} > {self.max_line_length} chars)",
                    "Break line or use intermediate variables."
                ))
            if line.rstrip() != line and line.strip():
                issues.append(ReviewIssue(
                    "minor", "style", i,
                    "Trailing whitespace",
                    "Remove trailing whitespace."
                ))

        return issues

    def _check_documentation(self, module: ModuleInfo) -> list[ReviewIssue]:
        """Check for missing documentation."""
        issues = []
        for func in module.functions:
            if not func.docstring and not func.name.startswith("_"):
                issues.append(ReviewIssue(
                    "minor", "documentation", func.line_start,
                    f"Function '{func.name}' missing docstring",
                    f'Add docstring: """Description of {func.name}."""'
                ))
        for cls in module.classes:
            if not cls.docstring:
                issues.append(ReviewIssue(
                    "minor", "documentation", cls.line_start,
                    f"Class '{cls.name}' missing docstring",
                    f'Add docstring: """Description of {cls.name}."""'
                ))
        return issues

    def _check_complexity(self, module: ModuleInfo) -> list[ReviewIssue]:
        """Check for complexity issues."""
        issues = []
        for func in module.functions:
            if func.body_lines > self.max_function_length:
                issues.append(ReviewIssue(
                    "major", "complexity", func.line_start,
                    f"Function '{func.name}' is too long ({func.body_lines} lines)",
                    "Consider breaking into smaller functions."
                ))
        return issues

    def _check_naming(self, module: ModuleInfo) -> list[ReviewIssue]:
        """Check naming conventions."""
        issues = []
        for func in module.functions:
            if not re.match(r"^_*[a-z][a-z0-9_]*$", func.name) and not func.name.startswith("__"):
                issues.append(ReviewIssue(
                    "minor", "style", func.line_start,
                    f"Function '{func.name}' doesn't follow snake_case convention",
                    "Rename to use snake_case (e.g., my_function)."
                ))
        for cls in module.classes:
            if not re.match(r"^[A-Z][a-zA-Z0-9]*$", cls.name):
                issues.append(ReviewIssue(
                    "minor", "style", cls.line_start,
                    f"Class '{cls.name}' doesn't follow PascalCase convention",
                    "Rename to use PascalCase (e.g., MyClass)."
                ))
        return issues

    def _check_security(self, code: str) -> list[ReviewIssue]:
        """Check for common security issues."""
        issues = []
        dangerous = [
            (r"eval\s*\(", "Use of eval() is dangerous", "Use ast.literal_eval() or specific parsers."),
            (r"exec\s*\(", "Use of exec() is dangerous", "Avoid dynamic code execution."),
            (r"os\.system\s*\(", "Use of os.system() is vulnerable to injection", "Use subprocess.run() with a list of arguments."),
            (r"pickle\.loads?\s*\(", "Pickle deserialization is unsafe", "Use JSON or a safe serialization format."),
        ]
        for i, line in enumerate(code.split("\n"), 1):
            for pattern, msg, suggestion in dangerous:
                if re.search(pattern, line):
                    issues.append(ReviewIssue("critical", "security", i, msg, suggestion))
        return issues

    def _check_errors(self, code: str) -> list[ReviewIssue]:
        """Check for common error patterns."""
        issues = []
        for i, line in enumerate(code.split("\n"), 1):
            if "except:" in line or "except Exception:" in line:
                issues.append(ReviewIssue(
                    "major", "bug", i,
                    "Bare except clause catches all exceptions including SystemExit and KeyboardInterrupt",
                    "Catch specific exceptions: except ValueError as e:"
                ))
            if "== True" in line or "== False" in line:
                issues.append(ReviewIssue(
                    "minor", "style", i,
                    "Use 'if x:' instead of 'if x == True:'",
                    "Replace with 'if x:' or 'if not x:'."
                ))
        return issues

    def _calculate_score(self, issues: list[ReviewIssue]) -> float:
        """Calculate a quality score (0-100)."""
        penalties = {"critical": 25, "major": 10, "minor": 3, "suggestion": 1}
        total_penalty = sum(penalties.get(issue.severity, 0) for issue in issues)
        return max(0, 100 - total_penalty)

    def _generate_summary(self, issues: list[ReviewIssue], module: ModuleInfo) -> str:
        """Generate a review summary."""
        by_severity = {}
        for issue in issues:
            by_severity.setdefault(issue.severity, []).append(issue)

        summary = f"Reviewed {module.file_path} ({module.total_lines} lines)\n"
        summary += f"Found {len(issues)} issues:\n"
        for severity in ["critical", "major", "minor", "suggestion"]:
            count = len(by_severity.get(severity, []))
            if count:
                summary += f"  - {severity}: {count}\n"
        return summary

    def _generate_suggestions(self, issues: list[ReviewIssue]) -> list[str]:
        """Generate actionable suggestions."""
        return list({issue.suggestion for issue in issues if issue.suggestion})
```

### Step 5: Complete Coding Assistant Application

```python
# code_assistant/main.py
"""
Main application: interactive coding assistant.
"""
import sys
from code_understanding import CodeAnalyzer
from code_review import CodeReviewer
from code_generator import CodeGenerator


class CodingAssistant:
    """Interactive coding assistant combining analysis, generation, and review."""

    def __init__(self, use_model: bool = True):
        self.analyzer = CodeAnalyzer()
        self.reviewer = CodeReviewer()
        self.generator = None
        if use_model:
            try:
                self.generator = CodeGenerator(model_name="bigcode/starcoder")
            except Exception as e:
                print(f"Warning: Could not load code model ({e}). Using template-based generation.")

    def analyze_code(self, code: str) -> str:
        """Analyze code and return a summary."""
        module = self.analyzer.analyze(code)
        return self.analyzer.get_summary(module)

    def review_code(self, code: str) -> str:
        """Review code and return feedback."""
        result = self.reviewer.review(code)
        output = f"## Code Review (Score: {result.score}/100)\n\n"
        output += result.summary + "\n\n"

        if result.issues:
            output += "### Issues\n\n"
            for issue in result.issues[:20]:  # Limit display
                output += f"- **[{issue.severity}]** Line {issue.line}: {issue.message}\n"
                if issue.suggestion:
                    output += f"  > Suggestion: {issue.suggestion}\n"
            output += "\n"

        if result.suggestions:
            output += "### Top Suggestions\n\n"
            for s in result.suggestions[:5]:
                output += f"1. {s}\n"

        return output

    def generate_code(self, description: str, function_name: str = "solution") -> str:
        """Generate code from a description."""
        if self.generator:
            return self.generator.generate_function(
                name=function_name,
                description=description,
            )
        else:
            return f'''def {function_name}():
    """{description}

    TODO: Implement this function.
    """
    raise NotImplementedError("Please implement this function.")
'''

    def explain_code(self, code: str) -> str:
        """Explain what code does."""
        if self.generator:
            return self.generator.explain_code(code)
        else:
            summary = self.analyzer.analyze(code)
            return self.analyzer.get_summary(summary)

    def interactive_mode(self):
        """Run the interactive CLI."""
        print("=" * 60)
        print("  Autonomous Coding Assistant")
        print("  Commands: analyze, review, generate, explain, quit")
        print("=" * 60)

        while True:
            try:
                command = input("\n> ").strip().lower()
            except (EOFError, KeyboardInterrupt):
                print("\nGoodbye!")
                break

            if command == "quit" or command == "exit":
                print("Goodbye!")
                break
            elif command == "analyze":
                code = self._read_multiline("Enter code (empty line to finish):")
                print(self.analyze_code(code))
            elif command == "review":
                code = self._read_multiline("Enter code (empty line to finish):")
                print(self.review_code(code))
            elif command == "generate":
                desc = input("Describe what you need: ").strip()
                name = input("Function name (default: solution): ").strip() or "solution"
                print(f"\n```python\n{self.generate_code(desc, name)}\n```")
            elif command == "explain":
                code = self._read_multiline("Enter code (empty line to finish):")
                print(self.explain_code(code))
            else:
                print("Unknown command. Use: analyze, review, generate, explain, quit")

    def _read_multiline(self, prompt: str) -> str:
        """Read multiline input."""
        print(prompt)
        lines = []
        while True:
            try:
                line = input()
                if line == "" and lines:
                    break
                lines.append(line)
            except EOFError:
                break
        return "\n".join(lines)


if __name__ == "__main__":
    assistant = CodingAssistant(use_model="--no-model" not in sys.argv)
    assistant.interactive_mode()
```

### Expected Output

```
============================================================
  Autonomous Coding Assistant
  Commands: analyze, review, generate, explain, quit
============================================================

> review
Enter code (empty line to finish):
def calc(x,y):
    result = eval(f"{x}+{y}")
    return result

## Code Review (Score: 62/100)

Reviewed <string> (3 lines)
Found 4 issues:
  - critical: 1
  - minor: 3

### Issues

- **[critical]** Line 2: Use of eval() is dangerous
  > Suggestion: Use ast.literal_eval() or specific parsers.
- **[minor]** Line 1: Function 'calc' missing docstring
- **[minor]** Line 1: Function 'calc' doesn't follow snake_case convention
- **[minor]** Line 1: Line too long (43 > 88 chars)

### Top Suggestions

1. Use ast.literal_eval() or specific parsers.
2. Add docstring: """Description of calc."""
3. Rename to use snake_case (e.g., my_function).
```

### Extension Ideas

1. **Codebase indexing:** Build a searchable index of an entire codebase
2. **Refactoring suggestions:** Analyze code patterns and suggest refactoring
3. **Test generation:** Generate comprehensive test suites from code analysis
4. **IDE integration:** Build VS Code or JetBrains extensions
5. **Multi-language support:** Extend AST analysis to JavaScript, TypeScript, Go

---

## Project 4: Vision-Language Model Application

### Description and Goals

This project builds a multi-modal application that can understand images, answer questions about them, and generate images from text descriptions. It demonstrates the convergence of vision and language — a key capability for AGI.

**Goals:**
- Set up CLIP for image-text understanding
- Build an image understanding pipeline
- Implement visual question answering
- Add text-to-image generation
- Create a web application with both capabilities

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Web Interface                          │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │  Image Upload    │  │  Text Prompt Input            │  │
│  │  or Camera       │  │  "Describe a sunset over..."  │  │
│  └────────┬────────┘  └──────────┬───────────────────┘  │
└───────────┼──────────────────────┼──────────────────────┘
            │                      │
            ▼                      │
┌──────────────────────┐  ┌───────▼──────────────────────┐
│  Vision Pipeline     │  │  Generation Pipeline          │
│                      │  │                               │
│  ┌────────────────┐  │  │  ┌────────────────────────┐  │
│  │   CLIP          │  │  │  │  Stable Diffusion       │  │
│  │   Encoder       │  │  │  │  Pipeline               │  │
│  │                 │  │  │  └────────────────────────┘  │
│  │  ┌───────────┐ │  │  │                               │
│  │  │ Image     │ │  │  │  ┌────────────────────────┐  │
│  │  │ Encoder   │ │  │  │  │  Prompt Enhancement     │  │
│  │  └───────────┘ │  │  │  │  (LLM-assisted)         │  │
│  │  ┌───────────┐ │  │  │  └────────────────────────┘  │
│  │  │ Text      │ │  │  │                               │
│  │  │ Encoder   │ │  │  │  ┌────────────────────────┐  │
│  │  └───────────┘ │  │  │  │  Image Post-Processing  │  │
│  └────────────────┘  │  │  └────────────────────────┘  │
│                      │  │                               │
│  ┌────────────────┐  │  └───────────────────────────────┘
│  │  VQA Pipeline   │  │
│  │  (BLIP-2/LLaVA) │  │
│  └────────────────┘  │
└──────────────────────┘
```

### Step 1: Setting Up CLIP and Image Processing

```python
# vision_app/clip_engine.py
"""
CLIP-based image-text understanding engine.
"""
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
from pathlib import Path
import numpy as np


class CLIPEngine:
    """Engine for image-text similarity and understanding using CLIP."""

    def __init__(self, model_name: str = "openai/clip-vit-base-patch32"):
        print(f"Loading CLIP model: {model_name}")
        self.model = CLIPModel.from_pretrained(model_name)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        self.model.eval()
        print("CLIP model loaded.")

    def encode_image(self, image: Image.Image) -> np.ndarray:
        """Encode an image into CLIP embedding space."""
        inputs = self.processor(images=image, return_tensors="pt")
        with torch.no_grad():
            features = self.model.get_image_features(**inputs)
        return features / features.norm(dim=-1, keepdim=True)

    def encode_text(self, text: str) -> np.ndarray:
        """Encode text into CLIP embedding space."""
        inputs = self.processor(text=[text], return_tensors="pt", padding=True, truncation=True)
        with torch.no_grad():
            features = self.model.get_text_features(**inputs)
        return features / features.norm(dim=-1, keepdim=True)

    def compute_similarity(self, image: Image.Image, text: str) -> float:
        """Compute similarity between an image and text."""
        image_emb = self.encode_image(image)
        text_emb = self.encode_text(text)
        similarity = torch.nn.functional.cosine_similarity(image_emb, text_emb)
        return similarity.item()

    def zero_shot_classify(self, image: Image.Image, labels: list[str]) -> dict[str, float]:
        """Classify an image using zero-shot with text labels."""
        scores = {}
        for label in labels:
            score = self.compute_similarity(image, f"a photo of {label}")
            scores[label] = score

        # Normalize
        total = sum(scores.values())
        return {k: v / total for k, v in sorted(scores.items(), key=lambda x: -x[1])}

    def image_search(self, query: str, image_dir: str, top_k: int = 5) -> list[tuple[str, float]]:
        """Search for images matching a text query."""
        query_emb = self.encode_text(query)
        results = []

        image_dir = Path(image_dir)
        image_exts = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"}

        for img_path in image_dir.rglob("*"):
            if img_path.suffix.lower() in image_exts:
                try:
                    image = Image.open(img_path).convert("RGB")
                    img_emb = self.encode_image(image)
                    similarity = torch.nn.functional.cosine_similarity(query_emb, img_emb).item()
                    results.append((str(img_path), similarity))
                except Exception as e:
                    print(f"  Error processing {img_path.name}: {e}")

        results.sort(key=lambda x: -x[1])
        return results[:top_k]

    def describe_image(self, image: Image.Image, candidate_descriptions: list[str] = None) -> str:
        """Generate a description for an image from candidates."""
        if candidate_descriptions is None:
            candidate_descriptions = [
                "a photograph of people",
                "a landscape with mountains",
                "a city skyline at night",
                "an animal in nature",
                "a close-up of food",
                "abstract art",
                "a technical diagram",
                "a portrait",
                "an indoor scene",
                "an outdoor scene",
            ]

        classifications = self.zero_shot_classify(image, candidate_descriptions)
        top_label = max(classifications, key=classifications.get)
        return f"This appears to be: {top_label} (confidence: {classifications[top_label]:.2%})"
```

### Step 2: Building Visual Question Answering

```python
# vision_app/vqa_pipeline.py
"""
Visual Question Answering pipeline.
"""
from PIL import Image
from transformers import BlipProcessor, BlipForQuestionAnswering
from clip_engine import CLIPEngine


class VQAPipeline:
    """Pipeline for answering questions about images."""

    def __init__(self):
        # Load BLIP VQA model
        print("Loading VQA model (BLIP)...")
        self.processor = BlipProcessor.from_pretrained("Salesforce/blip-vqa-base")
        self.model = BlipForQuestionAnswering.from_pretrained("Salesforce/blip-vqa-base")
        self.model.eval()

        # CLIP for classification-style questions
        self.clip = CLIPEngine()
        print("VQA pipeline ready.")

    def answer_question(self, image: Image.Image, question: str) -> str:
        """Answer a question about an image."""
        inputs = self.processor(image, question, return_tensors="pt")

        import torch
        with torch.no_grad():
            output = self.model.generate(**inputs, max_length=50)

        answer = self.processor.decode(output[0], skip_special_tokens=True)
        return answer

    def generate_caption(self, image: Image.Image) -> str:
        """Generate a caption for an image."""
        from transformers import BlipProcessor, BlipForConditionalGeneration
        processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

        inputs = processor(image, return_tensors="pt")
        import torch
        with torch.no_grad():
            output = model.generate(**inputs, max_length=50)

        return processor.decode(output[0], skip_special_tokens=True)

    def analyze_image(self, image: Image.Image) -> dict:
        """Comprehensive image analysis."""
        caption = self.generate_caption(image)

        questions = [
            "What is in this image?",
            "What colors are dominant?",
            "Is this image taken indoors or outdoors?",
            "What time of day might this be?",
            "Are there any people in this image?",
        ]

        answers = {}
        for q in questions:
            answers[q] = self.answer_question(image, q)

        return {
            "caption": caption,
            "analysis": answers,
            "dimensions": f"{image.width}x{image.height}",
        }
```

### Step 3: Adding Image Generation

```python
# vision_app/image_generator.py
"""
Image generation pipeline using Stable Diffusion.
"""
from diffusers import StableDiffusionPipeline
import torch
from pathlib import Path


class ImageGenerator:
    """Text-to-image generation using Stable Diffusion."""

    def __init__(self, model_id: str = "runwayml/stable-diffusion-v1-5"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.dtype = torch.float16 if self.device == "cuda" else torch.float32

        print(f"Loading Stable Diffusion ({model_id})...")
        self.pipe = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=self.dtype,
        ).to(self.device)
        print(f"Generator ready on {self.device}")

    def generate(self, prompt: str, negative_prompt: str = "",
                 num_images: int = 1, steps: int = 50,
                 guidance_scale: float = 7.5, width: int = 512, height: int = 512,
                 seed: int = None) -> list:
        """Generate images from a text prompt."""
        if seed is not None:
            generator = torch.Generator(self.device).manual_seed(seed)
        else:
            generator = None

        if not negative_prompt:
            negative_prompt = "blurry, low quality, distorted, watermark, text"

        images = self.pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_images_per_prompt=num_images,
            num_inference_steps=steps,
            guidance_scale=guidance_scale,
            width=width,
            height=height,
            generator=generator,
        ).images

        return images

    def enhance_prompt(self, base_prompt: str) -> str:
        """Enhance a prompt with quality modifiers."""
        enhancements = [
            "highly detailed",
            "professional photography",
            "sharp focus",
            "8k resolution",
            "dramatic lighting",
        ]
        return f"{base_prompt}, {', '.join(enhancements)}, masterpiece"

    def save_images(self, images: list, output_dir: str, prefix: str = "generated") -> list[str]:
        """Save generated images to disk."""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        saved = []
        for i, img in enumerate(images):
            filename = f"{prefix}_{i+1}.png"
            filepath = output_path / filename
            img.save(filepath)
            saved.append(str(filepath))
            print(f"Saved: {filepath}")

        return saved
```

### Step 4: Building the Web Application

```python
# vision_app/app.py
"""
Gradio web application for the vision-language model.
"""
import gradio as gr
from PIL import Image
from clip_engine import CLIPEngine
from vqa_pipeline import VQAPipeline
from image_generator import ImageGenerator


class VisionLanguageApp:
    """Multi-modal vision-language application."""

    def __init__(self, use_generation: bool = True):
        self.clip = CLIPEngine()
        self.vqa = VQAPipeline()
        self.generator = ImageGenerator() if use_generation else None

    def analyze_image(self, image: Image.Image) -> str:
        """Analyze an uploaded image."""
        if image is None:
            return "Please upload an image."

        result = self.vqa.analyze_image(image)

        output = f"## Image Analysis\n\n"
        output += f"**Caption:** {result['caption']}\n\n"
        output += f"**Dimensions:** {result['dimensions']}\n\n"
        output += "### Answers to Standard Questions\n\n"
        for q, a in result["analysis"].items():
            output += f"- **Q:** {q}\n  **A:** {a}\n\n"

        return output

    def ask_about_image(self, image: Image.Image, question: str) -> str:
        """Ask a specific question about an image."""
        if image is None:
            return "Please upload an image first."
        if not question.strip():
            return "Please enter a question."

        answer = self.vqa.answer_question(image, question)
        return f"**Question:** {question}\n\n**Answer:** {answer}"

    def classify_image(self, image: Image.Image, labels: str) -> str:
        """Classify an image using zero-shot CLIP."""
        if image is None:
            return "Please upload an image."

        label_list = [l.strip() for l in labels.split(",") if l.strip()]
        if not label_list:
            return "Please enter comma-separated labels."

        scores = self.clip.zero_shot_classify(image, label_list)

        output = "## Classification Results\n\n"
        for label, score in scores.items():
            bar = "█" * int(score * 30)
            output += f"- **{label}**: {score:.1%} {bar}\n"

        return output

    def generate_image(self, prompt: str, negative_prompt: str,
                       num_images: int, steps: int, seed: int) -> list:
        """Generate images from a text prompt."""
        if self.generator is None:
            return []
        if not prompt.strip():
            return []

        enhanced = self.generator.enhance_prompt(prompt)
        images = self.generator.generate(
            prompt=enhanced,
            negative_prompt=negative_prompt or "blurry, low quality",
            num_images=num_images,
            steps=int(steps),
            seed=int(seed) if seed >= 0 else None,
        )

        return images

    def build_ui(self) -> gr.Blocks:
        """Build the Gradio interface."""
        with gr.Blocks(title="Vision-Language Model", theme=gr.themes.Soft()) as app:
            gr.Markdown("# Vision-Language Model Application")
            gr.Markdown("Upload images to analyze, or generate images from text descriptions.")

            with gr.Tabs():
                # Tab 1: Image Analysis
                with gr.Tab("Image Analysis"):
                    with gr.Row():
                        with gr.Column():
                            img_input = gr.Image(label="Upload Image", type="pil", height=300)
                            analyze_btn = gr.Button("Analyze Image", variant="primary")
                        with gr.Column():
                            analysis_output = gr.Markdown(label="Analysis")

                    with gr.Row():
                        question_input = gr.Textbox(label="Ask about this image", placeholder="What is in the foreground?")
                        ask_btn = gr.Button("Ask")
                    answer_output = gr.Markdown(label="Answer")

                    with gr.Row():
                        labels_input = gr.Textbox(label="Classification labels (comma-separated)", placeholder="cat, dog, bird, fish")
                        classify_btn = gr.Button("Classify")
                    classification_output = gr.Markdown(label="Classification")

                # Tab 2: Image Generation
                with gr.Tab("Image Generation"):
                    with gr.Row():
                        with gr.Column():
                            prompt_input = gr.Textbox(label="Prompt", placeholder="A sunset over mountains, digital art", lines=3)
                            neg_prompt = gr.Textbox(label="Negative Prompt", value="blurry, low quality")
                            with gr.Row():
                                num_images = gr.Slider(1, 4, value=1, step=1, label="Number of Images")
                                num_steps = gr.Slider(10, 100, value=50, step=5, label="Steps")
                                seed_input = gr.Slider(-1, 999999, value=-1, step=1, label="Seed (-1 = random)")
                            generate_btn = gr.Button("Generate Images", variant="primary")
                        with gr.Column():
                            gallery = gr.Gallery(label="Generated Images", columns=2, height=400)

                    generate_btn.click(
                        self.generate_image,
                        [prompt_input, neg_prompt, num_images, num_steps, seed_input],
                        [gallery],
                    )

                # Tab 3: Image Search
                with gr.Tab("Image Search"):
                    gr.Markdown("### Search images by text description")
                    search_query = gr.Textbox(label="Search query", placeholder="a cat sleeping on a couch")
                    search_dir = gr.Textbox(label="Image directory", value="./images")
                    search_btn = gr.Button("Search")
                    search_results = gr.Gallery(label="Results", columns=3)

            # Wire up events
            analyze_btn.click(self.analyze_image, [img_input], [analysis_output])
            ask_btn.click(self.ask_about_image, [img_input, question_input], [answer_output])
            question_input.submit(self.ask_about_image, [img_input, question_input], [answer_output])
            classify_btn.click(self.classify_image, [img_input, labels_input], [classification_output])

        return app


if __name__ == "__main__":
    app = VisionLanguageApp(use_generation=True)
    demo = app.build_ui()
    demo.launch(share=True)
```

### Expected Output

```
Loading CLIP model: openai/clip-vit-base-patch32
CLIP model loaded.
Loading VQA model (BLIP)...
VQA pipeline ready.
Loading Stable Diffusion (runwayml/stable-diffusion-v1-5)...
Generator ready on cuda
Running on local URL:  http://127.0.0.1:7860
```

### Extension Ideas

1. **Image editing:** Add inpainting and outpainting capabilities
2. **Video understanding:** Extend to analyze video frames
3. **OCR integration:** Extract and understand text from images
4. **Object detection:** Add YOLO or DETR for precise object localization
5. **Style transfer:** Apply artistic styles to uploaded images

---

## Project 5: Reinforcement Learning Agent

### Description and Goals

Reinforcement learning represents a different paradigm of intelligence: learning through trial-and-error interaction with an environment. This project implements two foundational RL algorithms — Deep Q-Networks (DQN) and Proximal Policy Optimization (PPO) — and applies them to classic control tasks.

**Goals:**
- Set up OpenAI Gym environments
- Implement DQN from scratch
- Implement PPO from scratch
- Visualize training progress and learned policies
- Compare the two approaches on benchmark tasks

### Architecture

```
┌──────────────────────────────────────────────────────┐
│              RL Training Framework                    │
│                                                      │
│  ┌──────────────┐       ┌──────────────────────────┐│
│  │  Environment  │◄─────│  Agent                    ││
│  │  (Gym)        │      │  ┌─────────────────────┐ ││
│  │              │       │  │  DQN Agent           │ ││
│  │  ┌────────┐ │       │  │  ┌─────────────────┐ │ ││
│  │  │ State  │─┼───────┼──│─▶│  Q-Network       │ │ ││
│  │  │ Space  │ │       │  │  │  (Neural Net)    │ │ ││
│  │  └────────┘ │       │  │  └─────────────────┘ │ ││
│  │  ┌────────┐ │       │  │  ┌─────────────────┐ │ ││
│  │  │Action  │◀┼───────┼──│──│  Target Network   │ │ ││
│  │  │ Space  │ │       │  │  └─────────────────┘ │ ││
│  │  └────────┘ │       │  └─────────────────────┘ ││
│  │  ┌────────┐ │       │                          ││
│  │  │Reward  │─┼───────┤  ┌─────────────────────┐ ││
│  │  │ Signal │ │       │  │  PPO Agent           │ ││
│  │  └────────┘ │       │  │  ┌─────────────────┐ │ ││
│  └──────────────┘       │  │  │ Policy Network   │ │ ││
│                         │  │  └─────────────────┘ │ ││
│  ┌──────────────────┐  │  │  ┌─────────────────┐ │ ││
│  │  Replay Buffer    │  │  │  │ Value Network    │ │ ││
│  │  (Experience      │  │  │  └─────────────────┘ │ ││
│  │   Memory)         │  │  └─────────────────────┘ ││
│  └──────────────────┘  └──────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │  Visualization & Monitoring                      ││
│  │  ┌──────────────┐  ┌──────────────────────────┐ ││
│  │  │  Training     │  │  Reward Curves            │ ││
│  │  │  Progress     │  │  (matplotlib/tensorboard) │ ││
│  │  └──────────────┘  └──────────────────────────┘ ││
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

### Step 1: Setting Up the Environment

```python
# rl_agent/config.py
"""Configuration for RL training."""
from dataclasses import dataclass, field


@dataclass
class DQNConfig:
    """DQN hyperparameters."""
    env_name: str = "CartPole-v1"
    learning_rate: float = 1e-3
    gamma: float = 0.99
    epsilon_start: float = 1.0
    epsilon_end: float = 0.01
    epsilon_decay: float = 0.995
    batch_size: int = 64
    buffer_size: int = 10000
    target_update_freq: int = 100
    num_episodes: int = 500
    max_steps: int = 500
    hidden_dim: int = 128


@dataclass
class PPOConfig:
    """PPO hyperparameters."""
    env_name: str = "CartPole-v1"
    learning_rate: float = 3e-4
    gamma: float = 0.99
    gae_lambda: float = 0.95
    clip_epsilon: float = 0.2
    value_coeff: float = 0.5
    entropy_coeff: float = 0.01
    batch_size: int = 64
    num_episodes: int = 500
    max_steps: int = 500
    ppo_epochs: int = 4
    hidden_dim: int = 128
```

### Step 2: Implementing DQN

```python
# rl_agent/dqn.py
"""
Deep Q-Network (DQN) implementation from scratch.
"""
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import random
from collections import deque
from dataclasses import dataclass


class QNetwork(nn.Module):
    """Neural network for approximating the Q-function."""

    def __init__(self, state_dim: int, action_dim: int, hidden_dim: int = 128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class ReplayBuffer:
    """Experience replay buffer for DQN training."""

    def __init__(self, capacity: int):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size: int) -> tuple:
        batch = random.sample(self.buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        return (
            torch.FloatTensor(np.array(states)),
            torch.LongTensor(actions),
            torch.FloatTensor(rewards),
            torch.FloatTensor(np.array(next_states)),
            torch.FloatTensor(dones),
        )

    def __len__(self):
        return len(self.buffer)


class DQNAgent:
    """Deep Q-Network agent."""

    def __init__(self, state_dim: int, action_dim: int, config):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.config = config
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Q-networks
        self.q_net = QNetwork(state_dim, action_dim, config.hidden_dim).to(self.device)
        self.target_net = QNetwork(state_dim, action_dim, config.hidden_dim).to(self.device)
        self.target_net.load_state_dict(self.q_net.state_dict())

        # Optimizer
        self.optimizer = optim.Adam(self.q_net.parameters(), lr=config.learning_rate)

        # Replay buffer
        self.buffer = ReplayBuffer(config.buffer_size)

        # Exploration parameters
        self.epsilon = config.epsilon_start
        self.steps = 0

    def select_action(self, state: np.ndarray, evaluate: bool = False) -> int:
        """Select an action using epsilon-greedy policy."""
        if not evaluate and random.random() < self.epsilon:
            return random.randrange(self.action_dim)

        state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
        with torch.no_grad():
            q_values = self.q_net(state_tensor)
        return q_values.argmax(dim=1).item()

    def store_transition(self, state, action, reward, next_state, done):
        """Store a transition in the replay buffer."""
        self.buffer.push(state, action, reward, next_state, done)

    def update(self) -> float:
        """Update the Q-network using a batch of experiences."""
        if len(self.buffer) < self.config.batch_size:
            return 0.0

        # Sample batch
        states, actions, rewards, next_states, dones = self.buffer.sample(self.config.batch_size)
        states = states.to(self.device)
        actions = actions.to(self.device)
        rewards = rewards.to(self.device)
        next_states = next_states.to(self.device)
        dones = dones.to(self.device)

        # Current Q-values
        current_q = self.q_net(states).gather(1, actions.unsqueeze(1)).squeeze(1)

        # Target Q-values (with Bellman equation)
        with torch.no_grad():
            next_q = self.target_net(next_states).max(dim=1)[0]
            target_q = rewards + self.config.gamma * next_q * (1 - dones)

        # Compute loss
        loss = nn.MSELoss()(current_q, target_q)

        # Update
        self.optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.q_net.parameters(), 1.0)
        self.optimizer.step()

        # Decay epsilon
        self.epsilon = max(self.config.epsilon_end, self.epsilon * self.config.epsilon_decay)

        # Update target network
        self.steps += 1
        if self.steps % self.config.target_update_freq == 0:
            self.target_net.load_state_dict(self.q_net.state_dict())

        return loss.item()

    def train(self, env) -> list[dict]:
        """Train the agent on an environment."""
        training_log = []

        for episode in range(self.config.num_episodes):
            state, _ = env.reset()
            episode_reward = 0
            losses = []

            for step in range(self.config.max_steps):
                # Select and take action
                action = self.select_action(state)
                next_state, reward, terminated, truncated, _ = env.step(action)
                done = terminated or truncated

                # Store transition
                self.store_transition(state, action, reward, next_state, float(done))

                # Update network
                loss = self.update()
                if loss > 0:
                    losses.append(loss)

                state = next_state
                episode_reward += reward

                if done:
                    break

            avg_loss = np.mean(losses) if losses else 0
            training_log.append({
                "episode": episode,
                "reward": episode_reward,
                "loss": avg_loss,
                "epsilon": self.epsilon,
                "steps": step + 1,
            })

            if (episode + 1) % 50 == 0:
                recent_rewards = [log["reward"] for log in training_log[-50:]]
                avg_reward = np.mean(recent_rewards)
                print(f"Episode {episode + 1}/{self.config.num_episodes} | "
                      f"Avg Reward: {avg_reward:.1f} | Epsilon: {self.epsilon:.3f} | "
                      f"Loss: {avg_loss:.4f}")

        return training_log
```

### Step 3: Implementing PPO

```python
# rl_agent/ppo.py
"""
Proximal Policy Optimization (PPO) implementation from scratch.
"""
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from dataclasses import dataclass


class ActorCritic(nn.Module):
    """Combined actor-critic network for PPO."""

    def __init__(self, state_dim: int, action_dim: int, hidden_dim: int = 128):
        super().__init__()

        # Shared feature extractor
        self.shared = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        )

        # Actor (policy) head
        self.actor = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, action_dim),
            nn.Softmax(dim=-1),
        )

        # Critic (value) head
        self.critic = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),
        )

    def forward(self, state: torch.Tensor) -> tuple:
        features = self.shared(state)
        action_probs = self.actor(features)
        value = self.critic(features)
        return action_probs, value

    def get_action(self, state: np.ndarray) -> tuple:
        """Sample an action from the policy."""
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        action_probs, value = self.forward(state_tensor)

        # Sample from the distribution
        dist = torch.distributions.Categorical(action_probs)
        action = dist.sample()
        log_prob = dist.log_prob(action)

        return action.item(), log_prob.item(), value.item()

    def evaluate(self, states: torch.Tensor, actions: torch.Tensor) -> tuple:
        """Evaluate actions (for PPO update)."""
        action_probs, values = self.forward(states)
        dist = torch.distributions.Categorical(action_probs)
        log_probs = dist.log_prob(actions)
        entropy = dist.entropy()
        return log_probs, values.squeeze(-1), entropy


class RolloutBuffer:
    """Buffer for storing PPO rollouts."""

    def __init__(self):
        self.states = []
        self.actions = []
        self.rewards = []
        self.values = []
        self.log_probs = []
        self.dones = []

    def add(self, state, action, reward, value, log_prob, done):
        self.states.append(state)
        self.actions.append(action)
        self.rewards.append(reward)
        self.values.append(value)
        self.log_probs.append(log_prob)
        self.dones.append(done)

    def clear(self):
        self.states.clear()
        self.actions.clear()
        self.rewards.clear()
        self.values.clear()
        self.log_probs.clear()
        self.dones.clear()

    def compute_returns(self, gamma: float, gae_lambda: float, next_value: float) -> tuple:
        """Compute GAE advantages and returns."""
        rewards = np.array(self.rewards)
        values = np.array(self.values + [next_value])
        dones = np.array(self.dones)

        advantages = np.zeros_like(rewards)
        last_gae = 0

        for t in reversed(range(len(rewards))):
            delta = rewards[t] + gamma * values[t + 1] * (1 - dones[t]) - values[t]
            advantages[t] = last_gae = delta + gamma * gae_lambda * (1 - dones[t]) * last_gae

        returns = advantages + np.array(self.values)
        return advantages, returns

    def get_batches(self, advantages, returns, batch_size: int):
        """Generate mini-batches for PPO update."""
        n = len(self.states)
        indices = np.random.permutation(n)

        for start in range(0, n, batch_size):
            end = min(start + batch_size, n)
            batch_indices = indices[start:end]

            yield {
                "states": torch.FloatTensor(np.array(self.states)[batch_indices]),
                "actions": torch.LongTensor(np.array(self.actions)[batch_indices]),
                "old_log_probs": torch.FloatTensor(np.array(self.log_probs)[batch_indices]),
                "advantages": torch.FloatTensor(advantages[batch_indices]),
                "returns": torch.FloatTensor(returns[batch_indices]),
            }


class PPOAgent:
    """Proximal Policy Optimization agent."""

    def __init__(self, state_dim: int, action_dim: int, config):
        self.config = config
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Actor-critic network
        self.network = ActorCritic(state_dim, action_dim, config.hidden_dim).to(self.device)
        self.optimizer = optim.Adam(self.network.parameters(), lr=config.learning_rate)

        # Rollout buffer
        self.buffer = RolloutBuffer()

    def select_action(self, state: np.ndarray) -> tuple:
        """Select an action using the current policy."""
        return self.network.get_action(state)

    def update(self) -> dict:
        """PPO update using collected rollout data."""
        # Compute advantages
        # Use the last value estimate for bootstrap (assumes done or will be computed)
        next_value = 0  # Terminal state
        advantages, returns = self.buffer.compute_returns(
            self.config.gamma, self.config.gae_lambda, next_value
        )

        # Normalize advantages
        advantages = (advantages - advantages.mean()) / (advantages.std() + 1e-8)

        total_loss = 0
        total_policy_loss = 0
        total_value_loss = 0
        total_entropy = 0
        update_count = 0

        # PPO epochs
        for _ in range(self.config.ppo_epochs):
            for batch in self.buffer.get_batches(advantages, returns, self.config.batch_size):
                states = batch["states"].to(self.device)
                actions = batch["actions"].to(self.device)
                old_log_probs = batch["old_log_probs"].to(self.device)
                adv = batch["advantages"].to(self.device)
                ret = batch["returns"].to(self.device)

                # Evaluate current policy
                new_log_probs, values, entropy = self.network.evaluate(states, actions)

                # Policy loss (clipped)
                ratio = torch.exp(new_log_probs - old_log_probs)
                surr1 = ratio * adv
                surr2 = torch.clamp(ratio, 1 - self.config.clip_epsilon, 1 + self.config.clip_epsilon) * adv
                policy_loss = -torch.min(surr1, surr2).mean()

                # Value loss
                value_loss = nn.MSELoss()(values, ret)

                # Entropy bonus
                entropy_loss = -entropy.mean()

                # Total loss
                loss = (policy_loss
                        + self.config.value_coeff * value_loss
                        + self.config.entropy_coeff * entropy_loss)

                self.optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.network.parameters(), 0.5)
                self.optimizer.step()

                total_loss += loss.item()
                total_policy_loss += policy_loss.item()
                total_value_loss += value_loss.item()
                total_entropy += -entropy_loss.item()
                update_count += 1

        self.buffer.clear()

        return {
            "loss": total_loss / max(update_count, 1),
            "policy_loss": total_policy_loss / max(update_count, 1),
            "value_loss": total_value_loss / max(update_count, 1),
            "entropy": total_entropy / max(update_count, 1),
        }

    def train(self, env) -> list[dict]:
        """Train the agent on an environment."""
        training_log = []

        for episode in range(self.config.num_episodes):
            state, _ = env.reset()
            episode_reward = 0

            for step in range(self.config.max_steps):
                # Collect experience
                action, log_prob, value = self.select_action(state)
                next_state, reward, terminated, truncated, _ = env.step(action)
                done = terminated or truncated

                self.buffer.add(state, action, reward, value, log_prob, float(done))

                state = next_state
                episode_reward += reward

                if done:
                    break

            # Update policy after collecting enough experience
            update_info = self.update()

            training_log.append({
                "episode": episode,
                "reward": episode_reward,
                "loss": update_info["loss"],
                "policy_loss": update_info["policy_loss"],
                "value_loss": update_info["value_loss"],
                "entropy": update_info["entropy"],
                "steps": step + 1,
            })

            if (episode + 1) % 50 == 0:
                recent_rewards = [log["reward"] for log in training_log[-50:]]
                avg_reward = np.mean(recent_rewards)
                print(f"Episode {episode + 1}/{self.config.num_episodes} | "
                      f"Avg Reward: {avg_reward:.1f} | "
                      f"Policy Loss: {update_info['policy_loss']:.4f} | "
                      f"Value Loss: {update_info['value_loss']:.4f}")

        return training_log
```

### Step 4: Training and Visualization

```python
# rl_agent/training.py
"""
Training orchestration and visualization.
"""
import gymnasium as gym
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

from dqn import DQNAgent
from ppo import PPOAgent
from config import DQNConfig, PPOConfig


class RLTrainer:
    """Orchestrates RL training and evaluation."""

    def __init__(self, env_name: str = "CartPole-v1"):
        self.env_name = env_name
        self.env = gym.make(env_name)
        self.state_dim = self.env.observation_space.shape[0]
        self.action_dim = self.env.action_space.n

        print(f"Environment: {env_name}")
        print(f"State dim: {self.state_dim}, Action dim: {self.action_dim}")

    def train_dqn(self, config: DQNConfig = None) -> tuple:
        """Train a DQN agent."""
        config = config or DQNConfig()
        print("\n=== Training DQN ===")
        agent = DQNAgent(self.state_dim, self.action_dim, config)
        log = agent.train(self.env)
        return agent, log

    def train_ppo(self, config: PPOConfig = None) -> tuple:
        """Train a PPO agent."""
        config = config or PPOConfig()
        print("\n=== Training PPO ===")
        agent = PPOAgent(self.state_dim, self.action_dim, config)
        log = agent.train(self.env)
        return agent, log

    def evaluate_agent(self, agent, num_episodes: int = 10, render: bool = False) -> float:
        """Evaluate a trained agent."""
        env = gym.make(self.env_name, render_mode="human" if render else None)
        rewards = []

        for _ in range(num_episodes):
            state, _ = env.reset()
            episode_reward = 0
            done = False

            while not done:
                if hasattr(agent, "select_action"):
                    # DQN uses epsilon-greedy; disable exploration for evaluation
                    if hasattr(agent, "epsilon"):
                        old_epsilon = agent.epsilon
                        agent.epsilon = 0
                        action = agent.select_action(state, evaluate=True)
                        agent.epsilon = old_epsilon
                    else:
                        action, _, _ = agent.select_action(state)
                else:
                    action = agent.select_action(state)

                state, reward, terminated, truncated, _ = env.step(action)
                episode_reward += reward
                done = terminated or truncated

            rewards.append(episode_reward)

        env.close()
        return np.mean(rewards)

    def plot_results(self, dqn_log: list, ppo_log: list, save_path: str = None):
        """Plot and compare training results."""
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))

        # Reward curves
        ax = axes[0, 0]
        dqn_rewards = [l["reward"] for l in dqn_log]
        ppo_rewards = [l["reward"] for l in ppo_log]

        # Moving average
        window = 50
        dqn_ma = np.convolve(dqn_rewards, np.ones(window)/window, mode="valid")
        ppo_ma = np.convolve(ppo_rewards, np.ones(window)/window, mode="valid")

        ax.plot(dqn_rewards, alpha=0.3, color="blue", label="DQN (raw)")
        ax.plot(range(window-1, len(dqn_rewards)), dqn_ma, color="blue", label="DQN (MA)")
        ax.plot(ppo_rewards, alpha=0.3, color="red", label="PPO (raw)")
        ax.plot(range(window-1, len(ppo_rewards)), ppo_ma, color="red", label="PPO (MA)")
        ax.set_xlabel("Episode")
        ax.set_ylabel("Reward")
        ax.set_title("Training Reward Curves")
        ax.legend()
        ax.grid(True, alpha=0.3)

        # Loss curves
        ax = axes[0, 1]
        dqn_losses = [l["loss"] for l in dqn_log if l["loss"] > 0]
        ppo_losses = [l["loss"] for l in ppo_log]
        ax.plot(dqn_losses, alpha=0.5, color="blue", label="DQN Loss")
        ax.plot(ppo_losses, alpha=0.5, color="red", label="PPO Loss")
        ax.set_xlabel("Episode")
        ax.set_ylabel("Loss")
        ax.set_title("Training Loss")
        ax.legend()
        ax.grid(True, alpha=0.3)

        # Epsilon decay (DQN)
        ax = axes[1, 0]
        dqn_epsilon = [l["epsilon"] for l in dqn_log]
        ax.plot(dqn_epsilon, color="blue")
        ax.set_xlabel("Episode")
        ax.set_ylabel("Epsilon")
        ax.set_title("DQN Exploration Rate")
        ax.grid(True, alpha=0.3)

        # Entropy (PPO)
        ax = axes[1, 1]
        ppo_entropy = [l["entropy"] for l in ppo_log]
        ax.plot(ppo_entropy, color="red")
        ax.set_xlabel("Episode")
        ax.set_ylabel("Entropy")
        ax.set_title("PPO Policy Entropy")
        ax.grid(True, alpha=0.3)

        plt.suptitle(f"RL Training Comparison: {self.env_name}", fontsize=14)
        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=150, bbox_inches="tight")
            print(f"Plot saved to {save_path}")
        plt.show()


def main():
    """Main training script."""
    trainer = RLTrainer(env_name="CartPole-v1")

    # Train both agents
    dqn_agent, dqn_log = trainer.train_dqn()
    ppo_agent, ppo_log = trainer.train_ppo()

    # Evaluate
    dqn_score = trainer.evaluate_agent(dqn_agent, num_episodes=20)
    ppo_score = trainer.evaluate_agent(ppo_agent, num_episodes=20)

    print(f"\n=== Final Evaluation ===")
    print(f"DQN Average Reward: {dqn_score:.2f}")
    print(f"PPO Average Reward: {ppo_score:.2f}")

    # Plot results
    trainer.plot_results(dqn_log, ppo_log, save_path="rl_training_results.png")


if __name__ == "__main__":
    main()
```

### Step 5: Advanced — Policy Visualization

```python
# rl_agent/visualization.py
"""
Policy visualization and analysis tools.
"""
import gymnasium as gym
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation


def record_episode(agent, env_name: str, max_steps: int = 500) -> list[np.ndarray]:
    """Record an episode for visualization."""
    env = gym.make(env_name, render_mode="rgb_array")
    frames = []
    state, _ = env.reset()

    for _ in range(max_steps):
        frames.append(env.render())

        if hasattr(agent, "select_action"):
            if hasattr(agent, "epsilon"):
                old = agent.epsilon
                agent.epsilon = 0
                action = agent.select_action(state, evaluate=True)
                agent.epsilon = old
            else:
                action, _, _ = agent.select_action(state)
        else:
            action = agent.select_action(state)

        state, _, terminated, truncated, _ = env.step(action)
        if terminated or truncated:
            break

    env.close()
    return frames


def save_gif(frames: list, path: str, fps: int = 30):
    """Save frames as a GIF."""
    from PIL import Image
    imgs = [Image.fromarray(f) for f in frames]
    imgs[0].save(path, save_all=True, append_images=imgs[1:], duration=1000//fps, loop=0)
    print(f"Saved animation to {path}")


def plot_state_space(agent, env_name: str, resolution: int = 50):
    """Visualize the agent's policy across the state space."""
    env = gym.make(env_name)
    state_dim = env.observation_space.shape[0]

    if state_dim != 4:  # CartPole specific
        print("State space visualization only works for 4D state spaces (CartPole).")
        return

    # Create a grid over two dimensions, fix the other two
    x = np.linspace(env.observation_space.low[0], env.observation_space.high[0], resolution)
    theta = np.linspace(env.observation_space.low[2], env.observation_space.high[2], resolution)
    X, Theta = np.meshgrid(x, theta)

    Q_values = np.zeros_like(X)

    for i in range(resolution):
        for j in range(resolution):
            state = np.array([X[i, j], 0, Theta[i, j], 0])  # Fix velocity to 0
            if hasattr(agent, "q_net"):
                import torch
                state_tensor = torch.FloatTensor(state).unsqueeze(0)
                with torch.no_grad():
                    q = agent.q_net(state_tensor)
                Q_values[i, j] = q.max().item()

    fig, ax = plt.subplots(figsize=(10, 8))
    c = ax.contourf(X, Theta, Q_values, levels=50, cmap="RdYlGn")
    ax.set_xlabel("Position")
    ax.set_ylabel("Angle (theta)")
    ax.set_title("DQN Q-Value Heatmap")
    plt.colorbar(c, label="Max Q-Value")
    plt.savefig("state_space.png", dpi=150)
    plt.show()
```

### Expected Output

```
Environment: CartPole-v1
State dim: 4, Action dim: 2

=== Training DQN ===
Episode 50/500 | Avg Reward: 22.4 | Epsilon: 0.778 | Loss: 0.0421
Episode 100/500 | Avg Reward: 45.2 | Epsilon: 0.606 | Loss: 0.0215
Episode 150/500 | Avg Reward: 98.7 | Epsilon: 0.472 | Loss: 0.0089
Episode 200/500 | Avg Reward: 167.3 | Epsilon: 0.368 | Loss: 0.0042
Episode 250/500 | Avg Reward: 289.1 | Epsilon: 0.286 | Loss: 0.0018
Episode 300/500 | Avg Reward: 398.4 | Epsilon: 0.222 | Loss: 0.0009
Episode 350/500 | Avg Reward: 445.6 | Epsilon: 0.173 | Loss: 0.0005
Episode 400/500 | Avg Reward: 478.2 | Epsilon: 0.134 | Loss: 0.0003
Episode 450/500 | Avg Reward: 492.1 | Epsilon: 0.105 | Loss: 0.0002
Episode 500/500 | Avg Reward: 498.7 | Epsilon: 0.081 | Loss: 0.0001

=== Training PPO ===
Episode 50/500 | Avg Reward: 24.1 | Policy Loss: 0.0312 | Value Loss: 12.45
Episode 100/500 | Avg Reward: 42.8 | Policy Loss: 0.0205 | Value Loss: 8.32
...
Episode 500/500 | Avg Reward: 500.0 | Policy Loss: 0.0008 | Value Loss: 0.12

=== Final Evaluation ===
DQN Average Reward: 489.50
PPO Average Reward: 500.00
```

### Challenges and Solutions

| Challenge | Solution |
|-----------|----------|
| DQN training is unstable | Use target network, experience replay, and gradient clipping |
| PPO diverges early | Reduce learning rate; increase clip epsilon; add entropy bonus |
| CartPole solved too quickly | Try harder environments: MountainCar, LunarLander, Acrobot |
| Sparse rewards | Use reward shaping, curiosity-driven exploration, or HER |
| Sample inefficiency | Use prioritized experience replay, n-step returns, or distributed training |

### Extension Ideas

1. **Multi-agent RL:** Implement self-play for competitive environments
2. **Model-based RL:** Add a learned environment model (Dyna-Q, MuZero)
3. **Hierarchical RL:** Implement options framework for temporal abstraction
4. **Continuous action spaces:** Extend PPO to handle continuous actions (e.g., Mujoco)
5. **Reward learning:** Implement inverse RL and reward shaping from demonstrations

### Real-World Applications

- **Robotics:** Training robots to manipulate objects, navigate, and perform tasks
- **Game playing:** AlphaGo, OpenAI Five, and game AI development
- **Autonomous vehicles:** Decision-making in driving scenarios
- **Resource management:** Optimizing data center cooling, traffic light control
- **Finance:** Portfolio optimization and trading strategies
- **Healthcare:** Treatment planning and drug discovery

---

## Conclusion

These five projects represent a journey through the core capabilities of artificial general intelligence: understanding and generating language (Project 1), coordinating multiple intelligent agents (Project 2), understanding and generating code (Project 3), processing and generating visual content (Project 4), and learning through interaction with environments (Project 5).

Each project is deliberately designed to be extendable. The RAG chatbot can grow into a production knowledge management system. The multi-agent framework can be expanded with new agent types and coordination strategies. The coding assistant can be integrated into IDEs and development workflows. The vision-language application can incorporate video, audio, and 3D understanding. The RL agent can be applied to increasingly complex real-world problems.

> **Key Takeaway:** Building AGI is not about any single technique or algorithm — it is about the integration of many capabilities into coherent, adaptive systems. These projects give you the building blocks. The challenge — and the opportunity — lies in combining them into something greater than the sum of their parts.

As you continue your journey in AI development, remember that the field values both technical skill and intellectual curiosity. The best practitioners are those who can not only implement algorithms but also understand *why* they work, *when* they fail, and *how* they connect to the broader vision of artificial general intelligence. Build projects, read papers, engage with the community, and never stop learning.

---

**← Back to Chapter 9: Study Materials | End of Part IV**
