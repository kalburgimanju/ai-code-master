# Chapter 3: Event-Driven Architecture

> *"Don't tell services what to do. Tell them what happened, and let them decide."*

## What Is Event-Driven Architecture?

Event-Driven Architecture (EDA) is a design pattern where components communicate by producing and consuming events — immutable records of something that happened in the system. Instead of services calling each other directly, they emit events that other services can react to asynchronously.

```
Traditional Request/Response:
┌──────────┐    HTTP    ┌──────────┐
│ Order    │───────────►│ Payment  │
│ Service  │◄──────────│ Service  │
└──────────┘  Response  └──────────┘
  (Tightly coupled, synchronous)

Event-Driven:
┌──────────┐    ┌─────────┐    ┌──────────┐
│ Order    │───►│  Event  │───►│ Payment  │
│ Service  │   │  Broker │   │ Service  │
└──────────┘    └────┬────┘   └──────────┘
                     │    ┌──────────┐
                     ├───►│ Shipping │
                     │    │ Service  │
                     │    └──────────┘
                     │    ┌──────────┐
                     └───►│Analytics │
                          │ Service  │
                          └──────────┘
  (Loosely coupled, asynchronous)
```

## Event Types

### Domain Events
Business-significant occurrences:
```
OrderPlaced        → { orderId: "123", userId: "456", total: 99.99 }
PaymentProcessed   → { orderId: "123", amount: 99.99, method: "card" }
OrderShipped       → { orderId: "123", trackingNo: "TRACK-789" }
```

### Integration Events
Events shared between services or systems:
```
UserRegistered     → { userId: "789", email: "user@example.com", plan: "pro" }
InventoryLow       → { productId: "ABC", remaining: 5, threshold: 10 }
```

### Command Events
Events that trigger specific actions:
```
SendWelcomeEmail   → { userId: "789", template: "welcome" }
ChargePayment      → { orderId: "123", amount: 99.99 }
```

### Event Comparison Table

| Type | Purpose | Scope | Example |
|------|---------|-------|---------|
| Domain Event | Record business state change | Single bounded context | `OrderPlaced` |
| Integration Event | Cross-service communication | Multiple services | `PaymentProcessed` |
| Command Event | Trigger specific action | Single consumer | `SendEmail` |

## Pub/Sub Pattern

```
                    ┌─────────────────────────┐
                    │      Event Broker        │
                    │    (Topic/Channel)       │
                    │                          │
 ┌──────────┐      │  ┌───────┐  ┌───────┐  │      ┌──────────┐
 │ Producer │─────►│  │ Topic │  │ Topic │  │─────►│Consumer A│
 │(Publisher)│     │  │  A    │  │  B    │  │      │(Subscriber)│
 └──────────┘      │  └───┬───┘  └───────┘  │      └──────────┘
                    │      │                 │
 ┌──────────┐      │      │                 │      ┌──────────┐
 │ Producer │─────►│      └────────────────►│─────►│Consumer B│
 └──────────┘      │                        │      └──────────┘
                    └─────────────────────────┘
```

## Message Broker Comparison

| Feature | Kafka | RabbitMQ | Redis Streams | AWS SQS |
|---------|-------|----------|---------------|---------|
| **Model** | Log-based | Queue-based | Log-based | Queue-based |
| **Ordering** | Per partition | Per queue | Per stream | Best-effort |
| **Retention** | Configurable (days/forever) | Until consumed | Configurable | 14 days max |
| **Throughput** | Very high (millions/sec) | High (thousands/sec) | High | High |
| **Replay** | Yes (from offset) | No (once consumed) | Yes | No |
| **Complexity** | High | Medium | Low | Low (managed) |
| **Use Case** | Event sourcing, analytics | Task queues, RPC | Caching, simple pub/sub | Simple async tasks |

## Apache Kafka

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Kafka Cluster                     │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │          Topic: order-events                │    │
│  │                                             │    │
│  │  Partition 0:  [e1] [e3] [e5] [e7] ──────►│──┐ │
│  │  Partition 1:  [e2] [e4] [e6] [e8] ──────►│──┤ │
│  │  Partition 2:  [e9] [e10] [e11] ──────────►│──┤ │
│  └─────────────────────────────────────────────┘  │ │
│                                                     │ │
│  ┌──────────────┐  ┌──────────────┐                │ │
│  │ Consumer     │  │ Consumer     │  ◄─────────────┘ │
│  │ Group A      │  │ Group A      │                  │
│  │ (Payment)    │  │ (Payment)    │                  │
│  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────┘
```

### Python Example with Kafka

```python
# kafka_producer.py
from confluent_kafka import Producer
import json
import uuid
from datetime import datetime, timezone


class EventProducer:
    def __init__(self, broker: str = "localhost:9092"):
        self.producer = Producer({
            "bootstrap.servers": broker,
            "acks": "all",
            "enable.idempotence": True,
        })

    def produce(self, topic: str, event_type: str, data: dict, key: str | None = None):
        event = {
            "id": str(uuid.uuid4()),
            "type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }

        self.producer.produce(
            topic=topic,
            key=key or str(uuid.uuid4()),
            value=json.dumps(event).encode("utf-8"),
            callback=self._delivery_callback,
        )
        self.producer.flush()

    @staticmethod
    def _delivery_callback(err, msg):
        if err:
            print(f"Delivery failed: {err}")
        else:
            print(f"Message delivered to {msg.topic()} [{msg.partition()}]")


# Usage
if __name__ == "__main__":
    producer = EventProducer()

    producer.produce(
        topic="order-events",
        event_type="OrderPlaced",
        data={
            "order_id": "order-123",
            "user_id": "user-456",
            "items": [
                {"product_id": "prod-1", "quantity": 2, "price": 29.99}
            ],
            "total": 59.98,
        },
        key="order-123",
    )
```

```python
# kafka_consumer.py
from confluent_kafka import Consumer, KafkaError
import json
import signal
import sys


class EventConsumer:
    def __init__(self, broker: str, group_id: str, topics: list[str]):
        self.consumer = Consumer({
            "bootstrap.servers": broker,
            "group.id": group_id,
            "auto.offset.reset": "earliest",
            "enable.auto.commit": True,
        })
        self.topics = topics
        self.running = True
        self.handlers: dict[str, callable] = {}

        signal.signal(signal.SIGINT, self._shutdown)
        signal.signal(signal.SIGTERM, self._shutdown)

    def on(self, event_type: str, handler: callable):
        self.handlers[event_type] = handler

    def start(self):
        self.consumer.subscribe(self.topics)
        print(f"Consuming from {self.topics}...")

        while self.running:
            msg = self.consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                print(f"Error: {msg.error()}")
                continue

            try:
                event = json.loads(msg.value().decode("utf-8"))
                event_type = event.get("type")

                if event_type in self.handlers:
                    print(f"Handling event: {event_type}")
                    self.handlers[event_type](event["data"])
                else:
                    print(f"No handler for event type: {event_type}")
            except Exception as e:
                print(f"Error processing message: {e}")

    def _shutdown(self, *args):
        print("\nShutting down consumer...")
        self.running = False
        self.consumer.close()


# Usage: Payment Service
def handle_order_placed(data):
    print(f"Processing payment for order {data['order_id']}: ${data['total']}")
    # Process payment...

def handle_order_cancelled(data):
    print(f"Refunding payment for order {data['order_id']}")
    # Process refund...

if __name__ == "__main__":
    consumer = EventConsumer(
        broker="localhost:9092",
        group_id="payment-service",
        topics=["order-events"],
    )
    consumer.on("OrderPlaced", handle_order_placed)
    consumer.on("OrderCancelled", handle_order_cancelled)
    consumer.start()
```

## RabbitMQ Example

```python
# rabbitmq_producer.py
import pika
import json
import uuid
from datetime import datetime, timezone


class RabbitMQProducer:
    def __init__(self, host: str = "localhost"):
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=host)
        )
        self.channel = self.connection.channel()

    def declare_exchange(self, exchange: str, exchange_type: str = "topic"):
        self.channel.exchange_declare(
            exchange=exchange,
            exchange_type=exchange_type,
            durable=True,
        )

    def publish(self, exchange: str, routing_key: str, event_type: str, data: dict):
        event = {
            "id": str(uuid.uuid4()),
            "type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }

        self.channel.basic_publish(
            exchange=exchange,
            routing_key=routing_key,
            body=json.dumps(event).encode("utf-8"),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Persistent message
                content_type="application/json",
                message_id=str(uuid.uuid4()),
            ),
        )
        print(f"Published {event_type} to {exchange}/{routing_key}")

    def close(self):
        self.connection.close()


# Usage
if __name__ == "__main__":
    producer = RabbitMQProducer()
    producer.declare_exchange("orders", "topic")

    producer.publish(
        exchange="orders",
        routing_key="order.placed",
        event_type="OrderPlaced",
        data={"order_id": "123", "total": 99.99},
    )
    producer.close()
```

```python
# rabbitmq_consumer.py
import pika
import json
import signal
import sys


class RabbitMQConsumer:
    def __init__(self, host: str = "localhost"):
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=host)
        )
        self.channel = self.connection.channel()
        self.running = True
        self.handlers: dict[str, callable] = {}

        signal.signal(signal.SIGINT, self._shutdown)
        signal.signal(signal.SIGTERM, self._shutdown)

    def on(self, routing_key: str, handler: callable):
        self.handlers[routing_key] = handler

    def consume(self, exchange: str, queue: str, bindings: list[str]):
        self.channel.exchange_declare(exchange=exchange, exchange_type="topic", durable=True)
        self.channel.queue_declare(queue=queue, durable=True)

        for key in bindings:
            self.channel.queue_bind(exchange=exchange, queue=queue, routing_key=key)

        def callback(ch, method, properties, body):
            try:
                event = json.loads(body.decode("utf-8"))
                routing_key = method.routing_key

                if routing_key in self.handlers:
                    self.handlers[routing_key](event["data"])
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                else:
                    print(f"No handler for routing key: {routing_key}")
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            except Exception as e:
                print(f"Error: {e}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

        self.channel.basic_qos(prefetch_count=10)
        self.channel.basic_consume(queue=queue, on_message_callback=callback)
        print(f"Waiting for messages on {queue}...")
        self.channel.start_consuming()

    def _shutdown(self, *args):
        print("\nShutting down...")
        self.running = False
        self.channel.stop_consuming()
        self.connection.close()
```

## Redis Streams Example

```python
# redis_streams_example.py
import redis
import json
import uuid
from datetime import datetime, timezone


class EventStream:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.from_url(redis_url, decode_responses=True)

    def publish(self, stream: str, event_type: str, data: dict, key: str | None = None):
        event = {
            "type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": json.dumps(data),
        }
        message_id = self.redis.xadd(stream, event, id=key)
        print(f"Published {event_type} to {stream}: {message_id}")
        return message_id

    def consume(self, stream: str, group: str, consumer: str, handler, count: int = 10):
        """Consume events using consumer groups."""
        try:
            self.redis.xgroup_create(stream, group, id="0", mkstream=True)
        except redis.exceptions.ResponseError:
            pass  # Group already exists

        while True:
            messages = self.redis.xreadgroup(
                group, consumer, {stream: ">"}, count=count, block=5000
            )

            for stream_name, entries in messages:
                for message_id, fields in entries:
                    try:
                        event = {
                            "type": fields["type"],
                            "timestamp": fields["timestamp"],
                            "data": json.loads(fields["data"]),
                        }
                        handler(event["data"])
                        self.redis.xack(stream, group, message_id)
                        print(f"Processed {event['type']}: {message_id}")
                    except Exception as e:
                        print(f"Error processing {message_id}: {e}")

    def get_pending(self, stream: str, group: str):
        """Get pending messages that haven't been acknowledged."""
        return self.redis.xpending_range(stream, group, min="-", max="+", count=100)


# Usage
if __name__ == "__main__":
    stream = EventStream()

    # Publisher
    stream.publish(
        "order-events", "OrderPlaced",
        {"order_id": "123", "total": 99.99},
    )

    # Consumer
    def handle_event(data):
        print(f"Processing: {data}")

    stream.consume("order-events", "payment-group", "payment-worker-1", handle_event)
```

## Event Schemas

### Avro Schema (with Schema Registry)

```json
{
  "type": "record",
  "name": "OrderPlaced",
  "namespace": "com.example.events",
  "fields": [
    {"name": "order_id", "type": "string"},
    {"name": "user_id", "type": "string"},
    {"name": "total", "type": "double"},
    {"name": "items", "type": {
      "type": "array",
      "items": {
        "type": "record",
        "name": "OrderItem",
        "fields": [
          {"name": "product_id", "type": "string"},
          {"name": "quantity", "type": "int"},
          {"name": "price", "type": "double"}
        ]
      }
    }},
    {"name": "created_at", "type": "string", "logicalType": "timestamp-millis"}
  ]
}
```

### CloudEvents Specification

```json
{
  "specversion": "1.0",
  "type": "com.example.order.placed",
  "source": "/orders/service",
  "id": "evt-123-abc",
  "time": "2025-01-15T10:30:00Z",
  "datacontenttype": "application/json",
  "subject": "order-123",
  "data": {
    "orderId": "order-123",
    "userId": "user-456",
    "total": 99.99,
    "items": [
      {"productId": "prod-1", "quantity": 2, "price": 29.99}
    ]
  }
}
```

## Eventual Consistency

In event-driven systems, data consistency across services is **eventual** — not immediate:

```
Timeline:
─────────────────────────────────────────────────────►

User places order
    │
    ├──► Order Service: Order created (status: pending)
    │
    │    ... 100ms delay (event travels through broker) ...
    │
    ├──► Payment Service: Payment processed
    │
    │    ... 50ms delay ...
    │
    ├──► Inventory Service: Stock decremented
    │
    │    ... 50ms delay ...
    │
    └──► Notification Service: Confirmation email sent

Total time: ~200ms for all services to be consistent
```

### Strategies for Managing Eventual Consistency

| Strategy | Description | Trade-off |
|----------|-------------|-----------|
| **Compensating Transactions** | Rollback logic via reverse events | Complex, but handles failures |
| **Idempotent Consumers** | Process same event multiple times safely | Requires unique event IDs |
| **Event Sourcing** | Store all events, rebuild state | Complete audit trail, but storage cost |
| **Choreography** | Services react independently | Simple, but hard to trace flows |
| **Orchestration** | Central coordinator manages flow | Clear flow, but single point of concern |

## Complete E-Commerce Event Flow

```
┌─────────┐  OrderPlaced   ┌─────────┐  PaymentProcessed  ┌─────────┐
│ Order   │──────────────►│ Payment │───────────────────►│Shipping │
│ Service │               │ Service │                    │ Service │
└────┬────┘               └────┬────┘                    └────┬────┘
     │                         │                              │
     │ OrderPlaced             │ PaymentProcessed             │ OrderShipped
     ▼                         ▼                              ▼
┌─────────┐             ┌─────────┐                    ┌─────────────┐
│Inventory│             │Analytics│                    │Notification │
│ Service │             │ Service │                    │   Service   │
└─────────┘             └─────────┘                    └─────────────┘
```

## Pros and Cons

### Pros

| Advantage | Impact |
|-----------|--------|
| Loose coupling | Services evolve independently |
| Scalability | Add consumers without changing producers |
| Resilience | Broker absorbs temporary failures |
| Auditability | Event log provides complete history |
| Flexibility | New services can react to existing events |

### Cons

| Disadvantage | Mitigation |
|-------------|------------|
| Eventual consistency | Design UI to handle temporary inconsistencies |
| Complexity | Use established patterns (Saga, CQRS) |
| Debugging difficulty | Distributed tracing, correlation IDs |
| Ordering challenges | Partition by entity ID, use sequence numbers |
| Event versioning | Schema registry, backward-compatible changes |

## Summary

Event-Driven Architecture enables building loosely-coupled, scalable systems where services react to events rather than direct calls. Choose your broker based on your needs: Kafka for high-throughput event streaming and replay, RabbitMQ for flexible routing and task queues, Redis Streams for simplicity. Design events as immutable facts, use schema registries for evolution, and implement idempotent consumers for reliability.

**Key Takeaways:**
- Events are immutable facts about what happened, not commands
- Choose the right broker: Kafka for streaming, RabbitMQ for queues, Redis for simplicity
- Design for eventual consistency from the start
- Use correlation IDs and distributed tracing for debugging
- Implement idempotent consumers to handle duplicate events
