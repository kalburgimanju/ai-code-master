# Legal Document Review Assistant - Architecture Diagram

```mermaid
digraph G {
    rankdir=LR;
    node [shape=box, style=filled, color=lightblue];
    
    // Main Components
    subgraph cluster_0 {
        label = "Document Processing Layer";
        color = lightgreen;
        
        node [style=filled, color=lightgreen];
        "Document Uploader";
        "Document Parser";
        "Document Classifier";
        "Contract Analyzer";
        "Citation Extractor";
        "Document Structurer";
    }
    
    subgraph cluster_1 {
        label = "Knowledge Base Layer";
        color = lightyellow;
        
        node [style=filled, color=lightyellow];
        "Case Law Database";
        "Statute Database";
        "Regulatory Database";
        "Legal Commentary DB";
        "Knowledge Graph";
    }
    
    subgraph cluster_2 {
        label = "AI Analysis Layer";
        color = lightpink;
        
        node [style=filled, color=lightpink];
        "Clause Analyzer";
        "Risk Assessor";
        "Conflict Detector";
        "Document Reviewer";
        "Legal Reasoning Engine";
        "Recommendation Engine";
    }
    
    subgraph cluster_3 {
        label = "Workflow & Review Layer";
        color = lightcyan;
        
        node [style=filled, color=lightcyan];
        "Review Queue Manager";
        "Document Reviewer";
        "Comment System";
        "Approval Workflow";
        "Version Control";
        "Collaboration Tools";
    }
    
    // Data Flow
    "Document Uploader" -> "Document Parser";
    "Document Parser" -> "Document Classifier";
    "Document Classifier" -> "Contract Analyzer";
    "Contract Analyzer" -> "Document Structurer";
    "Document Structurer" -> "Review Queue Manager";
    "Case Law Database" -> "Knowledge Graph";
    "Statute Database" -> "Knowledge Graph";
    "Regulatory Database" -> "Knowledge Graph";
    "Legal Commentary DB" -> "Knowledge Graph";
    "Citation Extractor" -> "Knowledge Graph";
    "Document Structurer" -> "Clause Analyzer";
    "Contract Analyzer" -> "Risk Assessor";
    "Contract Analyzer" -> "Conflict Detector";
    "Risk Assessor" -> "Recommendation Engine";
    "Conflict Detector" -> "Recommendation Engine";
    "Legal Reasoning Engine" -> "Recommendation Engine";
    "Knowledge Graph" -> "Clause Analyzer";
    "Document Structurer" -> "Document Reviewer";
    "Review Queue Manager" -> "Document Reviewer";
    "Document Reviewer" -> "Comment System";
    "Comment System" -> "Approval Workflow";
    "Collaboration Tools" -> "Comment System";
    
    // External Systems
    node [shape=ellipse, color=lightgray];
    "Legal Professionals";
    "Courts";
    "Regulators";
    
    "Legal Professionals" -> "Document Uploader";
    "Courts" -> "Case Law Database";
    "Regulators" -> "Regulatory Database";
}
```