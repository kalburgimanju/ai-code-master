# Chapter 3: Marketplace Design and Architecture

## Core Architectural Components

A marketplace platform consists of interconnected systems that enable trust, matching, and transactions between supply and demand.

```
Marketplace Architecture
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Web App │  │ Mobile   │  │ API/SDK  │  │ Partner Portal │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                         API GATEWAY                               │
│              (Auth, Rate Limiting, Routing, Logging)             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      CORE SERVICES LAYER                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ User &   │ │ Listing  │ │ Matching │ │ Trans-   │ │ Trust  │ │
│  │ Identity │ │ & Search │ │ Engine   │ │ actions  │ │ & Safety│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       DATA LAYER                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │Primary DB│ │ Search   │ │ Cache    │ │ Event    │ │ Object │ │
│  │(Postgres)│ │(Elastic) │ │(Redis)   │ │ Stream   │ │ Storage│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. User & Identity Service

### Data Model

```sql
-- Users table (both buyers and sellers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('buyer', 'seller', 'both', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- Profiles (extended info by role)
CREATE TABLE buyer_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    shipping_addresses JSONB DEFAULT '[]',
    payment_methods JSONB DEFAULT '[]'
);

CREATE TABLE seller_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    business_name VARCHAR(255),
    business_type VARCHAR(50) CHECK (business_type IN ('individual', 'business', 'enterprise')),
    tax_id VARCHAR(50),
    bank_account JSONB,
    verification_status VARCHAR(20) DEFAULT 'unverified',
    verification_documents JSONB DEFAULT '[]',
    payout_schedule VARCHAR(20) DEFAULT 'weekly'
);

-- Authentication tokens
CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    token_type VARCHAR(20) CHECK (token_type IN ('access', 'refresh', 'api')),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP
);
```

### Identity Verification Flow

```python
class IdentityService:
    async def verify_seller(self, user_id: str, documents: List[Document]) -> VerificationResult:
        # 1. Document validation (OCR, expiry, format)
        doc_results = await self.validate_documents(documents)
        
        # 2. Biometric verification (selfie + ID match)
        bio_result = await self.biometric_check(documents)
        
        # 3. Database checks (sanctions, fraud databases)
        db_result = await self.database_screening(user_id)
        
        # 4. Risk scoring
        risk_score = self.calculate_risk(doc_results, bio_result, db_result)
        
        # 5. Decision
        if risk_score < 0.3:
            status = "verified"
        elif risk_score < 0.7:
            status = "manual_review"
        else:
            status = "rejected"
        
        await self.update_verification_status(user_id, status, risk_score)
        return VerificationResult(status, risk_score, details)
```

---

## 2. Listing & Search Service

### Listing Data Model

```sql
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    condition VARCHAR(20) CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    
    -- Pricing
    price_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    price_type VARCHAR(20) DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'auction', 'negotiable')),
    
    -- Inventory
    quantity INTEGER DEFAULT 1,
    sku VARCHAR(100),
    
    -- Media
    images JSONB DEFAULT '[]',  -- [{url, alt_text, order}]
    videos JSONB DEFAULT '[]',
    
    -- Attributes (category-specific)
    attributes JSONB DEFAULT '{}',
    
    -- Shipping
    shipping_options JSONB DEFAULT '[]',
    ships_from JSONB,  -- {country, state, city, postal_code}
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'sold', 'expired', 'removed')),
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
    
    -- Metrics
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Search vector (updated by trigger)
    search_vector tsvector
);

-- Full-text search index
CREATE INDEX idx_listings_search ON listings USING GIN(search_vector);

-- Category hierarchy
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    attribute_schema JSONB,  -- Defines valid attributes for this category
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Search Architecture

```python
class SearchService:
    def __init__(self, es_client, pg_pool):
        self.es = es_client
        self.pg = pg_pool
    
    async def search(self, query: SearchQuery) -> SearchResults:
        # 1. Parse and expand query
        parsed = self.parse_query(query.text)
        
        # 2. Build Elasticsearch query
        es_query = self.build_es_query(parsed, query.filters)
        
        # 3. Execute search
        results = await self.es.search(
            index="listings",
            body=es_query,
            size=query.limit,
            from_=query.offset
        )
        
        # 4. Hydrate from Postgres (for ACID data like price, availability)
        listing_ids = [r["_id"] for r in results["hits"]["hits"]]
        listings = await self.hydrate_listings(listing_ids)
        
        # 5. Apply business logic (boosting, personalization)
        ranked = self.rank_results(listings, query.user_id)
        
        return SearchResults(
            listings=ranked,
            total=results["hits"]["total"]["value"],
            facets=self.extract_facets(results),
            suggestions=self.get_suggestions(parsed)
        )
    
    def build_es_query(self, parsed: ParsedQuery, filters: SearchFilters) -> dict:
        must = []
        should = []
        filter_clauses = []
        
        # Text search with fuzziness
        if parsed.text:
            must.append({
                "multi_match": {
                    "query": parsed.text,
                    "fields": ["title^3", "description", "attributes.*", "category_name^2"],
                    "fuzziness": "AUTO",
                    "type": "best_fields"
                }
            })
        
        # Category filter
        if filters.category_id:
            filter_clauses.append({"term": {"category_path": filters.category_id}})
        
        # Price range
        if filters.min_price or filters.max_price:
            price_filter = {}
            if filters.min_price: price_filter["gte"] = filters.min_price
            if filters.max_price: price_filter["lte"] = filters.max_price
            filter_clauses.append({"range": {"price_cents": price_filter}})
        
        # Location/distance
        if filters.location and filters.radius_km:
            filter_clauses.append({
                "geo_distance": {
                    "distance": f"{filters.radius_km}km",
                    "location": {"lat": filters.location.lat, "lon": filters.location.lon}
                }
            })
        
        # Seller filters
        if filters.seller_rating_min:
            filter_clauses.append({"range": {"seller_rating": {"gte": filters.seller_rating_min}}})
        
        # Boost factors
        should.extend([
            {"term": {"is_verified_seller": {"value": True, "boost": 2.0}}},
            {"range": {"seller_rating": {"gte": 4.5, "boost": 1.5}}},
            {"range": {"created_at": {"gte": "now-30d", "boost": 1.2}}},
        ])
        
        return {
            "bool": {
                "must": must,
                "should": should,
                "filter": filter_clauses,
                "minimum_should_match": 1
            }
        }
```

### Real-time Indexing

```python
# Event-driven indexing via message queue
class ListingIndexer:
    async def handle_listing_event(self, event: ListingEvent):
        if event.type == "listing.created":
            await self.index_listing(event.listing_id)
        elif event.type == "listing.updated":
            await self.update_listing(event.listing_id, event.changes)
        elif event.type == "listing.deleted":
            await self.delete_listing(event.listing_id)
        elif event.type == "listing.status_changed":
            await self.update_status(event.listing_id, event.new_status)
    
    async def index_listing(self, listing_id: str):
        listing = await self.get_listing_with_relations(listing_id)
        doc = self.transform_to_es_doc(listing)
        await self.es.index(index="listings", id=listing_id, document=doc)
```

---

## 3. Matching Engine

### Matching Algorithms by Marketplace Type

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List

@dataclass
class MatchRequest:
    requester_id: str
    request_type: str  # "buy", "book", "hire", "ride"
    criteria: dict
    urgency: str  # "instant", "soon", "flexible"
    max_results: int = 10

@dataclass
class MatchResult:
    listing_id: str
    score: float
    match_reasons: List[str]
    estimated_price: int
    estimated_time: int  # seconds/minutes

class MatchingEngine(ABC):
    @abstractmethod
    async def find_matches(self, request: MatchRequest) -> List[MatchResult]:
        pass

# 1. Instant Matching (Uber, DoorDash) - Real-time, geospatial
class InstantMatchingEngine(MatchingEngine):
    async def find_matches(self, request: MatchRequest) -> List[MatchResult]:
        # Geospatial query for nearby supply
        nearby = await self.geo_index.query(
            center=request.criteria["location"],
            radius_km=request.criteria.get("max_distance", 5),
            filters={"status": "available", "type": request.criteria.get("vehicle_type")}
        )
        
        # Score by: distance, driver rating, acceptance rate, estimated earnings
        scored = []
        for driver in nearby:
            score = self.calculate_score(
                distance=driver.distance,
                rating=driver.rating,
                acceptance_rate=driver.acceptance_rate,
                surge_multiplier=request.criteria.get("surge", 1.0)
            )
            scored.append(MatchResult(
                listing_id=driver.id,
                score=score,
                match_reasons=[f"{driver.distance:.1f}km away", f"Rating: {driver.rating}"],
                estimated_price=self.estimate_price(driver, request),
                estimated_time=driver.distance * 2  # minutes
            ))
        
        return sorted(scored, key=lambda x: -x.score)[:request.max_results]

# 2. Search-based Matching (Airbnb, eBay) - Relevance ranking
class SearchMatchingEngine(MatchingEngine):
    async def find_matches(self, request: MatchRequest) -> List[MatchResult]:
        # Use search service with personalization
        results = await self.search_service.search(SearchQuery(
            text=request.criteria.get("query", ""),
            filters=self.build_filters(request),
            user_id=request.requester_id,
            limit=request.max_results
        ))
        
        return [MatchResult(
            listing_id=r.id,
            score=r.relevance_score,
            match_reasons=r.match_reasons,
            estimated_price=r.price_cents,
            estimated_time=r.availability_info
        ) for r in results.listings]

# 3. Request-for-Proposal (Upwork, Thumbtack) - Bid matching
class RFPMatchingEngine(MatchingEngine):
    async def find_matches(self, request: MatchRequest) -> List[MatchResult]:
        # 1. Find eligible suppliers
        suppliers = await self.find_eligible_suppliers(request.criteria)
        
        # 2. Score by fit
        scored = []
        for supplier in suppliers:
            fit_score = self.calculate_fit_score(supplier, request.criteria)
            if fit_score > 0.5:  # Threshold
                scored.append(MatchResult(
                    listing_id=supplier.id,
                    score=fit_score,
                    match_reasons=self.explain_fit(supplier, request.criteria),
                    estimated_price=supplier.estimate_price(request.criteria),
                    estimated_time=supplier.availability
                ))
        
        return sorted(scored, key=lambda x: -x.score)[:request.max_results]

# 4. Double-ended Matching (Dating, Mentorship) - Mutual fit
class DoubleEndedMatchingEngine(MatchingEngine):
    async def find_matches(self, request: MatchRequest) -> List[MatchResult]:
        # Score mutual compatibility
        candidates = await self.get_candidates(request.requester_id)
        
        scored = []
        for candidate in candidates:
            mutual_score = self.mutual_compatibility(request.requester_id, candidate.id)
            if mutual_score > 0.6:
                scored.append(MatchResult(
                    listing_id=candidate.id,
                    score=mutual_score,
                    match_reasons=["Mutual interests", "Compatible schedules"],
                    estimated_price=0,
                    estimated_time=0
                ))
        
        return sorted(scored, key=lambda x: -x.score)[:request.max_results]
```

### Matching Service Orchestration

```python
class MatchingService:
    def __init__(self):
        self.engines = {
            "instant": InstantMatchingEngine(),
            "search": SearchMatchingEngine(),
            "rfp": RFPMatchingEngine(),
            "double_ended": DoubleEndedMatchingEngine(),
        }
    
    async def match(self, request: MatchRequest) -> MatchResponse:
        # Select engine based on marketplace type
        engine = self.engines[self.get_engine_type(request.request_type)]
        
        # Get matches
        matches = await engine.find_matches(request)
        
        # Log for ML training
        await self.log_match_request(request, matches)
        
        # Trigger notifications
        await self.notify_supplies(matches[:3], request)  # Top 3
        
        return MatchResponse(matches=matches, request_id=request.request_id)
```

---

## 4. Transaction Service

### Transaction State Machine

```
Transaction States:
                    ┌─────────────┐
                    │   CREATED   │
                    └──────┬──────┘
                           │ buyer commits
                           ▼
                    ┌─────────────┐     payment fails     ┌─────────────┐
                    │  PENDING    │──────────────────────►│   FAILED    │
                    │  PAYMENT    │                       └─────────────┘
                    └──────┬──────┘
                           │ payment succeeds
                           ▼
              ┌────────────────────────┐
              │     PAID / HELD        │
              │   (escrow if needed)   │
              └───────────┬────────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ SHIPPING │ │ PROVIDING│ │  READY   │
       │  GOODS   │ │ SERVICE  │ │ FOR PICK │
       └────┬─────┘ └────┬─────┘ └────┬─────┘
            │            │            │
            │ delivery   │ completion │ pickup
            ▼            ▼            ▼
       ┌──────────────────────────────┐
       │       COMPLETED              │
       │   (release funds to seller)  │
       └──────────────┬───────────────┘
                      │
           ┌──────────┴──────────┐
           │                     │
           ▼                     ▼
    ┌────────────┐         ┌────────────┐
    │  REFUND    │         │  DISPUTE   │
    │ REQUESTED  │         │  OPENED    │
    └─────┬──────┘         └─────┬──────┘
          │                      │
          ▼                      ▼
    ┌────────────┐         ┌────────────┐
    │  REFUNDED  │         │  RESOLVED  │
    └────────────┘         └────────────┘
```

### Transaction Data Model

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketplace_id UUID NOT NULL,  -- For multi-tenant
    
    -- Participants
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    
    -- Listing
    listing_id UUID NOT NULL REFERENCES listings(id),
    listing_snapshot JSONB NOT NULL,  -- Immutable copy at purchase time
    
    -- Financial
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    fee_cents INTEGER NOT NULL,        -- Platform fee
    fee_basis_points INTEGER NOT NULL, -- e.g., 1000 = 10%
    tax_cents INTEGER DEFAULT 0,
    shipping_cents INTEGER DEFAULT 0,
    seller_payout_cents INTEGER NOT NULL,  -- amount - fee - tax
    
    -- Payment
    payment_intent_id VARCHAR(255),  -- Stripe/PayPal reference
    payment_method JSONB,            -- Type, last4, brand
    payment_status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP,
    
    -- Escrow
    escrow_status VARCHAR(20) DEFAULT 'not_required' 
        CHECK (escrow_status IN ('not_required', 'held', 'released', 'refunded')),
    escrow_released_at TIMESTAMP,
    
    -- Fulfillment
    fulfillment_type VARCHAR(20) CHECK (fulfillment_type IN ('shipping', 'pickup', 'digital', 'service')),
    shipping_address JSONB,
    tracking_number VARCHAR(100),
    carrier VARCHAR(50),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    pickup_code VARCHAR(20),
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'created' CHECK (status IN (
        'created', 'pending_payment', 'paid', 'processing', 
        'shipped', 'delivered', 'completed', 'cancelled',
        'refund_requested', 'refunded', 'disputed', 'resolved'
    )),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_by UUID REFERENCES users(id),
    cancel_reason TEXT
);

-- Transaction events for audit trail
CREATE TABLE transaction_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    event_type VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES users(id),  -- Who triggered
    previous_state VARCHAR(30),
    new_state VARCHAR(30),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Disputes
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    opened_by UUID NOT NULL REFERENCES users(id),
    reason VARCHAR(50) NOT NULL,  -- item_not_received, not_as_described, etc.
    description TEXT,
    evidence JSONB DEFAULT '[]',  -- Photos, messages, documents
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'escalated')),
    resolution VARCHAR(20),       -- refund_buyer, refund_seller, partial, no_action
    resolved_by UUID REFERENCES users(id),  -- Admin/mediator
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Payment Processing

```python
class PaymentService:
    def __init__(self, stripe_client, config):
        self.stripe = stripe_client
        self.config = config
    
    async def create_payment_intent(self, transaction: Transaction) -> PaymentIntent:
        # Calculate amounts
        platform_fee = transaction.amount_cents * self.config.fee_bps // 10000
        
        # Create Stripe PaymentIntent with application_fee_amount
        intent = await self.stripe.PaymentIntent.create(
            amount=transaction.amount_cents,
            currency=transaction.currency.lower(),
            customer=transaction.buyer.stripe_customer_id,
            payment_method=transaction.payment_method_id,
            application_fee_amount=platform_fee,
            transfer_data={
                "destination": transaction.seller.stripe_account_id
            },
            metadata={
                "transaction_id": str(transaction.id),
                "marketplace_id": str(transaction.marketplace_id)
            },
            on_behalf_of=transaction.seller.stripe_account_id
        )
        
        return PaymentIntent(
            id=intent.id,
            client_secret=intent.client_secret,
            status=intent.status
        )
    
    async def handle_webhook(self, event: stripe.Event):
        if event.type == "payment_intent.succeeded":
            await self.on_payment_succeeded(event.data.object)
        elif event.type == "payment_intent.payment_failed":
            await self.on_payment_failed(event.data.object)
        elif event.type == "transfer.created":
            await self.on_seller_payout(event.data.object)
    
    async def on_payment_succeeded(self, intent: stripe.PaymentIntent):
        transaction_id = intent.metadata["transaction_id"]
        await self.transaction_service.update_status(
            transaction_id, 
            "paid",
            payment_intent_id=intent.id,
            paid_at=datetime.fromtimestamp(intent.charges.data[0].created)
        )
        
        # If escrow required, hold funds
        if await self.requires_escrow(transaction_id):
            await self.escrow_service.hold_funds(transaction_id, intent.amount)
```

---

## 5. Trust & Safety Service

### Review & Rating System

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    
    -- Ratings (1-5)
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    speed_rating INTEGER CHECK (speed_rating BETWEEN 1 AND 5),
    
    -- Content
    title VARCHAR(255),
    comment TEXT,
    
    -- Metadata
    is_public BOOLEAN DEFAULT TRUE,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    response TEXT,  -- Reviewee's response
    responded_at TIMESTAMP,
    
    -- Moderation
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'flagged', 'removed')),
    flagged_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- One review per transaction per direction
    UNIQUE(transaction_id, reviewer_id)
);

-- Aggregate ratings (materialized view, refreshed periodically)
CREATE MATERIALIZED VIEW user_ratings AS
SELECT 
    reviewee_id as user_id,
    COUNT(*) as review_count,
    AVG(overall_rating)::numeric(3,2) as avg_rating,
    AVG(accuracy_rating)::numeric(3,2) as avg_accuracy,
    AVG(communication_rating)::numeric(3,2) as avg_communication,
    AVG(speed_rating)::numeric(3,2) as avg_speed,
    COUNT(*) FILTER (WHERE overall_rating >= 4) as positive_count,
    COUNT(*) FILTER (WHERE overall_rating <= 2) as negative_count
FROM reviews
WHERE status = 'published' AND is_verified_purchase
GROUP BY reviewee_id;

CREATE UNIQUE INDEX idx_user_ratings_user ON user_ratings(user_id);
```

### Fraud Detection

```python
class FraudDetectionService:
    def __init__(self, ml_model, rules_engine):
        self.model = ml_model
        self.rules = rules_engine
    
    async def score_transaction(self, transaction: Transaction) -> FraudScore:
        # Feature engineering
        features = await self.extract_features(transaction)
        
        # ML model score
        ml_score = await self.model.predict_proba(features)
        
        # Rules-based score
        rules_score, triggered_rules = self.rules.evaluate(features)
        
        # Combined score (weighted)
        final_score = 0.7 * ml_score + 0.3 * rules_score
        
        # Determine action
        if final_score > 0.9:
            action = "block"
        elif final_score > 0.7:
            action = "manual_review"
        elif final_score > 0.5:
            action = "additional_verification"
        else:
            action = "allow"
        
        return FraudScore(
            score=final_score,
            action=action,
            ml_score=ml_score,
            rules_score=rules_score,
            triggered_rules=triggered_rules,
            features=features
        )
    
    async def extract_features(self, transaction: Transaction) -> dict:
        buyer = await self.get_user(transaction.buyer_id)
        seller = await self.get_user(transaction.seller_id)
        
        return {
            # Velocity features
            "buyer_txn_last_hour": await self.count_txns(buyer.id, hours=1),
            "buyer_txn_last_24h": await self.count_txns(buyer.id, hours=24),
            "seller_txn_last_hour": await self.count_txns(seller.id, hours=1),
            
            # Amount features
            "amount_zscore": self.zscore(transaction.amount_cents, buyer.avg_txn_amount),
            "amount_vs_category_avg": transaction.amount_cents / category_avg(transaction.category),
            
            # User features
            "buyer_account_age_days": (now() - buyer.created_at).days,
            "buyer_verification_level": buyer.verification_level,
            "buyer_historical_chargeback_rate": buyer.chargeback_rate,
            "seller_account_age_days": (now() - seller.created_at).days,
            "seller_rating": seller.avg_rating,
            
            # Network features
            "buyer_seller_prev_txns": await self.count_prev_txns(buyer.id, seller.id),
            "shared_device_fingerprint": await self.check_device_overlap(buyer.id, seller.id),
            "shared_ip": await self.check_ip_overlap(buyer.id, seller.id),
            
            # Behavioral
            "time_since_last_action": transaction.buyer_last_action_seconds_ago,
            "session_duration": transaction.session_duration_seconds,
            "num_failed_payments": transaction.failed_payment_attempts,
        }
```

### Content Moderation

```python
class ContentModerationService:
    def __init__(self, ml_moderator, human_queue):
        self.ml = ml_moderator
        self.queue = human_queue
    
    async def moderate_listing(self, listing: Listing) -> ModerationResult:
        # Check images
        image_results = await asyncio.gather(*[
            self.ml.moderate_image(img.url) for img in listing.images
        ])
        
        # Check text
        text_result = await self.ml.moderate_text(
            f"{listing.title}\n{listing.description}"
        )
        
        # Aggregate
        max_severity = max(
            [r.severity for r in image_results] + [text_result.severity]
        )
        
        if max_severity >= Severity.HIGH:
            action = "reject"
        elif max_severity >= Severity.MEDIUM:
            action = "human_review"
        else:
            action = "approve"
        
        if action == "human_review":
            await self.queue.enqueue(ModerationTask(
                content_type="listing",
                content_id=listing.id,
                priority=max_severity,
                ml_results=image_results + [text_result]
            ))
        
        return ModerationResult(action, max_severity, details)
```

---

## 6. Notification & Communication Service

### Multi-channel Notifications

```python
class NotificationService:
    def __init__(self, email_provider, push_provider, sms_provider, in_app_store):
        self.channels = {
            "email": email_provider,
            "push": push_provider,
            "sms": sms_provider,
            "in_app": in_app_store
        }
        self.templates = TemplateEngine()
    
    async def send(self, notification: Notification):
        # Determine channels based on user preferences and urgency
        channels = self.select_channels(notification)
        
        # Render templates for each channel
        rendered = {}
        for channel in channels:
            template = self.templates.get(notification.template, channel)
            rendered[channel] = template.render(notification.data)
        
        # Send in parallel
        await asyncio.gather(*[
            self.channels[channel].send(
                user_id=notification.user_id,
                content=rendered[channel],
                metadata=notification.metadata
            )
            for channel in channels
        ])
        
        # Log
        await self.log_notification(notification, channels, rendered)

# Preference-based channel selection
def select_channels(self, notification: Notification) -> List[str]:
    prefs = self.get_user_preferences(notification.user_id)
    urgency = notification.urgency  # low, normal, high, critical
    
    if urgency == "critical":
        return ["push", "sms", "email"]  # All channels
    elif urgency == "high":
        channels = ["push"]
        if prefs.email_enabled: channels.append("email")
        return channels
    else:
        channels = []
        if prefs.push_enabled: channels.append("push")
        if prefs.email_enabled: channels.append("email")
        if prefs.in_app_enabled: channels.append("in_app")
        return channels or ["in_app"]  # Fallback
```

### In-App Messaging (Buyer-Seller Chat)

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    listing_id UUID REFERENCES listings(id),
    participant_ids UUID[] NOT NULL,  -- [buyer_id, seller_id]
    subject VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system', 'offer')),
    metadata JSONB DEFAULT '{}',  -- For offers: {amount, expires_at}
    read_by UUID[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fetching conversation messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
```

---

## 7. Analytics & Event Streaming

### Event Schema (Apache Avro / JSON Schema)

```json
{
  "type": "record",
  "name": "MarketplaceEvent",
  "namespace": "com.marketplace.events",
  "fields": [
    {"name": "event_id", "type": "string"},
    {"name": "event_type", "type": "string"},
    {"name": "timestamp", "type": {"type": "long", "logicalType": "timestamp-millis"}},
    {"name": "user_id", "type": ["null", "string"], "default": null},
    {"name": "session_id", "type": ["null", "string"], "default": null},
    {"name": "properties", "type": {"type": "map", "values": "string"}},
    {"name": "context", "type": {
      "type": "record",
      "name": "EventContext",
      "fields": [
        {"name": "ip", "type": ["null", "string"]},
        {"name": "user_agent", "type": ["null", "string"]},
        {"name": "locale", "type": ["null", "string"]},
        {"name": "app_version", "type": ["null", "string"]}
      ]
    }}
  ]
}
```

### Key Events to Track

```python
# Event definitions
class EventTypes:
    # User lifecycle
    USER_SIGNED_UP = "user.signed_up"
    USER_VERIFIED = "user.verified"
    USER_ACTIVATED = "user.activated"
    
    # Listing lifecycle
    LISTING_CREATED = "listing.created"
    LISTING_PUBLISHED = "listing.published"
    LISTING_VIEWED = "listing.viewed"
    LISTING_FAVORITED = "listing.favorited"
    LISTING_SHARED = "listing.shared"
    
    # Search & Discovery
    SEARCH_PERFORMED = "search.performed"
    SEARCH_RESULT_CLICKED = "search.result_clicked"
    FILTER_APPLIED = "filter.applied"
    
    # Transaction funnel
    CHECKOUT_STARTED = "checkout.started"
    PAYMENT_ATTEMPTED = "payment.attempted"
    PAYMENT_SUCCEEDED = "payment.succeeded"
    PAYMENT_FAILED = "payment.failed"
    ORDER_PLACED = "order.placed"
    ORDER_SHIPPED = "order.shipped"
    ORDER_DELIVERED = "order.delivered"
    ORDER_COMPLETED = "order.completed"
    
    # Post-purchase
    REVIEW_SUBMITTED = "review.submitted"
    DISPUTE_OPENED = "dispute.opened"
    REFUND_REQUESTED = "refund.requested"
    
    # Engagement
    MESSAGE_SENT = "message.sent"
    NOTIFICATION_OPENED = "notification.opened"
    EMAIL_OPENED = "email.opened"
    PUSH_CLICKED = "push.clicked"

# Funnel analysis query
FUNNEL_QUERY = """
WITH funnel_steps AS (
    SELECT 
        user_id,
        MAX(CASE WHEN event_type = 'search.performed' THEN 1 ELSE 0 END) as searched,
        MAX(CASE WHEN event_type = 'listing.viewed' THEN 1 ELSE 0 END) as viewed,
        MAX(CASE WHEN event_type = 'checkout.started' THEN 1 ELSE 0 END) as checkout,
        MAX(CASE WHEN event_type = 'payment.succeeded' THEN 1 ELSE 0 END) as paid,
        MAX(CASE WHEN event_type = 'order.completed' THEN 1 ELSE 0 END) as completed
    FROM events
    WHERE timestamp >= NOW() - INTERVAL '30 days'
    GROUP BY user_id
)
SELECT 
    SUM(searched) as searches,
    SUM(viewed) as views,
    SUM(checkout) as checkouts,
    SUM(paid) as payments,
    SUM(completed) as completed,
    SUM(viewed)::float / NULLIF(SUM(searched), 0) as view_rate,
    SUM(checkout)::float / NULLIF(SUM(viewed), 0) as checkout_rate,
    SUM(paid)::float / NULLIF(SUM(checkout), 0) as payment_rate,
    SUM(completed)::float / NULLIF(SUM(paid), 0) as completion_rate
FROM funnel_steps;
"""
```

---

## Infrastructure Considerations

### Scaling Strategy

| Component | Scaling Approach |
|-----------|------------------|
| **API Gateway** | Horizontal (stateless), CDN for static assets |
| **User Service** | Read replicas, cache heavily (Redis) |
| **Search** | Elasticsearch cluster, index sharding by category/geo |
| **Matching** | Stateless workers, Redis for geo-index, async queue |
| **Transactions** | Primary DB (Postgres) with careful partitioning |
| **Payments** | Idempotency keys, webhook deduplication |
| **Notifications** | Async via message queue, batch sends |
| **Analytics** | Event streaming (Kafka) → Data warehouse (Snowflake/BigQuery) |

### Database Partitioning

```sql
-- Partition transactions by month for performance
CREATE TABLE transactions_partitioned (
    LIKE transactions INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE transactions_2024_01 PARTITION OF transactions_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE transactions_2024_02 PARTITION OF transactions_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... etc

-- Archive old partitions to cold storage
```

---

## Summary

1. **Modular service architecture** enables independent scaling and team autonomy
2. **Identity & verification** are foundational for trust
3. **Search & matching** require different algorithms per marketplace type
4. **Transactions** need robust state machines and escrow support
5. **Trust & safety** requires layered approach: automated + human
5. **Notifications** must respect user preferences and urgency
6. **Analytics** starts with comprehensive event streaming
7. **Infrastructure** should evolve with scale: start simple, partition strategically

---

## Next Chapter: Supply Acquisition and Onboarding

We'll cover strategies for acquiring, onboarding, and retaining quality supply - the lifeblood of any marketplace.