# Enterprise Knowledge Management - Architecture Diagram

```mermaid
digraph G {
    rankdir=LR;
    node [shape=box, style=filled, color=lightblue];
    
    // Main Components
    subgraph cluster_0 {
        label = "Data Ingestion Layer";
        color = lightgreen;
        
        node [style=filled, color=lightgreen];
        "Web Crawler";
        "File Scanner";
        "Email Processor";
        "Document Converter";
        "Metadata Collector";
    }
    
    subgraph cluster_1 {
        label = "Vector Storage Layer";
        color = lightyellow;
        
        node [style=filled, color=lightyellow];
        "Vector Database";
        "Embedding Service";
        "Metadata Index";
        "Cache Layer";
    }
    
    subgraph cluster_2 {
        label = "Query Processing Layer";
        color = lightpink;
        
        node [style=filled, color=lightpink];
        "Query Parser";
        "Semantic Search Engine";
        "Context Window Manager";
        "Query Rewriter";
    }
    
    subgraph cluster_3 {
        label = "Response Generation Layer";
        color = lightcyan;
        
        node [style=filled, color=lightcyan];
        "LLM Service";
        "Context Retriever";
        "Explanation Generator";
        "Citation System";
        "Fact Validator";
    }
    
    subgraph cluster_4 {
        label = "User Interface Layer";
        color = lightsalmon;
        
        node [style=filled, color=lightsalmon];
        "Chat Interface";
        "Search Interface";
        "Knowledge Graph";
        "Analytics Dashboard";
    }
    
    // Data Flow
    "Web Crawler" -> "Document Converter";
    "File Scanner" -> "Document Converter";
    "Email Processor" -> "Document Converter";
    "Document Converter" -> "Vector Database";
    "Metadata Collector" -> "Metadata Index";
    "Vector Database" -> "Embedding Service";
    "Embedding Service" -> "Vector Database";
    "Semantic Search Engine" -> "Vector Database";
    "Query Rewriter" -> "Semantic Search Engine";
    "Context Window Manager" -> "Semantic Search Engine";
    "Context Retriever" -> "Vector Database";
    "LLM Service" -> "Explanation Generator";
    "Fact Validator" -> "LLM Service";
    "Citation System" -> "Explanation Generator";
    
    // External Systems
    node [shape=ellipse, color=lightgray];
    "Enterprise Systems";
    "Users";
    
    "Enterprise Systems" -> "Web Crawler";
    "Enterprise Systems" -> "File Scanner";
    "Users" -> "Chat Interface";
    "Users" -> "Search Interface";
}
```