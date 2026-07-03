export interface Chapter {
  id: string;
  slug: string;
  title: string;
  number: number;
  part: string;
  partNumber: number;
  fileName: string;
  description: string;
  icon: string;
  topics: string[];
}

export const BOOK = {
  title: "15 Architecture Concepts Every Developer Must Know",
  subtitle: "A Comprehensive Guide to Modern Software Architecture",
  author: "Manjunath Kalburgi",
  description: "Master the 15 most important architecture patterns every developer needs: microservices, event-driven, caching, load balancing, CQRS, CAP theorem, and more.",
};

export const CHAPTERS: Chapter[] = [
  { id: "1", slug: "arch-microservices", title: "Microservices", number: 1, part: "Core Patterns", partNumber: 1, fileName: "chapter-01-microservices.md", description: "Build apps as small, independent services that scale and deploy separately.", icon: "🧩", topics: ["Service Decomposition", "Communication", "Service Mesh", "Docker & K8s"] },
  { id: "2", slug: "arch-modular-monolith", title: "Modular Monolith", number: 2, part: "Core Patterns", partNumber: 1, fileName: "chapter-02-modular-monolith.md", description: "Keep one app but split it into clear, decoupled modules with internal APIs.", icon: "📦", topics: ["Module Boundaries", "Internal APIs", "Migration Path", "vs Microservices"] },
  { id: "3", slug: "arch-event-driven", title: "Event-Driven Architecture", number: 3, part: "Core Patterns", partNumber: 1, fileName: "chapter-03-event-driven.md", description: "Let services react to events instead of direct requests.", icon: "⚡", topics: ["Pub/Sub", "Kafka & RabbitMQ", "Event Schemas", "Eventual Consistency"] },
  { id: "4", slug: "arch-caching", title: "Caching", number: 4, part: "Data Patterns", partNumber: 2, fileName: "chapter-04-caching.md", description: "Store popular data in memory for faster access.", icon: "🚀", topics: ["Redis & Memcached", "CDN Caching", "Invalidation", "Cache Stampede"] },
  { id: "5", slug: "arch-load-balancing", title: "Load Balancing", number: 5, part: "Data Patterns", partNumber: 2, fileName: "chapter-05-load-balancing.md", description: "Spread requests across many servers for reliability.", icon: "⚖️", topics: ["Round-Robin", "Consistent Hashing", "L4 vs L7", "Nginx & HAProxy"] },
  { id: "6", slug: "arch-database-sharding", title: "Database Sharding", number: 6, part: "Data Patterns", partNumber: 2, fileName: "chapter-06-database-sharding.md", description: "Split data across many databases for horizontal scaling.", icon: "🗄️", topics: ["Shard Keys", "Hash & Range", "Resharding", "MongoDB & PostgreSQL"] },
  { id: "7", slug: "arch-database-replication", title: "Database Replication", number: 7, part: "Data Patterns", partNumber: 2, fileName: "chapter-07-database-replication.md", description: "Copy data to many databases for high availability.", icon: "📋", topics: ["Primary-Replica", "Multi-Primary", "Sync vs Async", "Replication Lag"] },
  { id: "8", slug: "arch-api-gateway", title: "API Gateway", number: 8, part: "Communication Patterns", partNumber: 3, fileName: "chapter-08-api-gateway.md", description: "Route, secure, and manage requests to backend services.", icon: "🚪", topics: ["Routing", "Auth & Rate Limiting", "Kong", "AWS API Gateway"] },
  { id: "9", slug: "arch-cqrs", title: "CQRS", number: 9, part: "Communication Patterns", partNumber: 3, fileName: "chapter-09-cqrs.md", description: "Separate write operations from read operations.", icon: "📖", topics: ["Command vs Query", "Read/Write Models", "Implementation", "Code Examples"] },
  { id: "10", slug: "arch-event-sourcing", title: "Event Sourcing", number: 10, part: "Communication Patterns", partNumber: 3, fileName: "chapter-10-event-sourcing.md", description: "Store every change as an event for complete audit trail.", icon: "📜", topics: ["Event Store", "Projections", "Snapshots", "Event Replay"] },
  { id: "11", slug: "arch-cap-theorem", title: "CAP Theorem", number: 11, part: "System Patterns", partNumber: 4, fileName: "chapter-11-cap-theorem.md", description: "Understand the trade-offs in distributed systems.", icon: "🔺", topics: ["Consistency", "Availability", "Partition Tolerance", "PACELC"] },
  { id: "12", slug: "arch-observability", title: "Observability", number: 12, part: "System Patterns", partNumber: 4, fileName: "chapter-12-observability.md", description: "Use logs, metrics, and traces to understand system health.", icon: "📊", topics: ["Three Pillars", "Prometheus", "OpenTelemetry", "Tracing"] },
  { id: "13", slug: "arch-distributed-transactions", title: "Distributed Transactions", number: 13, part: "System Patterns", partNumber: 4, fileName: "chapter-13-distributed-transactions.md", description: "Keep data consistent across many services.", icon: "🔗", topics: ["2PC", "Saga Pattern", "Outbox", "Eventual Consistency"] },
  { id: "14", slug: "arch-resilience", title: "Resilience Engineering", number: 14, part: "System Patterns", partNumber: 4, fileName: "chapter-14-resilience.md", description: "Keep systems running during failures.", icon: "🛡️", topics: ["Circuit Breaker", "Retry & Backoff", "Bulkhead", "Chaos Engineering"] },
  { id: "15", slug: "arch-clean-architecture", title: "Clean Architecture", number: 15, part: "System Patterns", partNumber: 4, fileName: "chapter-15-clean-architecture.md", description: "Separate business logic from external tools and frameworks.", icon: "🏛️", topics: ["Hexagonal", "Dependency Rule", "Layers", "Ports & Adapters"] },
];

export function getChaptersForBook(): Chapter[] { return CHAPTERS; }
export function getBookInfo() { return BOOK; }
