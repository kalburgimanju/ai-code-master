# Chapter 8: Matching Algorithms and Search

## The Matching Problem

Matching is the core technical challenge of every marketplace: **connecting the right buyer with the right seller at the right time**. The quality of matching directly determines liquidity, conversion, and user satisfaction.

---

## Matching Architecture

```
Matching System
┌─────────────────────────────────────────────────────────────────┐
│                      QUERY UNDERSTANDING                        │
│  NLP parsing • Intent classification • Entity extraction       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                      CANDIDATE GENERATION                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Retrieval  │  │  Filtering  │  │  Pre-ranking│             │
│  │  (ANN,      │  │  (hard      │  │  (cheap     │             │
│  │   Inverted) │  │   constraints)│  │   signals)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                      RANKING                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  First-pass │  │  Refinement │  │  Final      │             │
│  │  (ML model) │  │  (Personal- │  │  (Business  │             │
│  │             │  │   ization)  │  │   Rules)    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                      POST-PROCESSING                            │
│  Diversity • Fairness • Business Rules • Logging               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Query Understanding

### Intent Classification

```python
class QueryUnderstanding:
    def __init__(self):
        self.intent_classifier = IntentClassifier()
        self.entity_extractor = EntityExtractor()
        self.query_expander = QueryExpander()
    
    async def parse(self, query: str, context: UserContext) -> ParsedQuery:
        # 1. Detect intent
        intent = await self.intent_classifier.classify(query, context)
        
        # 2. Extract entities
        entities = await self.entity_extractor.extract(query)
        
        # 3. Expand query (synonyms, corrections, completions)
        expanded = await self.query_expander.expand(query, entities, context)
        
        # 4. Determine search strategy
        strategy = self.determine_strategy(intent, entities, context)
        
        return ParsedQuery(
            original=query,
            intent=intent,
            entities=entities,
            expanded_terms=expanded.terms,
            corrections=expanded.corrections,
            strategy=strategy,
            filters=expanded.filters
        )
    
    def determine_strategy(self, intent: Intent, entities: Entities, context: UserContext) -> SearchStrategy:
        if intent == Intent.SPECIFIC_PRODUCT:
            return SearchStrategy.EXACT_MATCH  # SKU, brand + model
        elif intent == Intent.CATEGORY_BROWSE:
            return SearchStrategy.FACETED_NAVIGATION
        elif intent == Intent.DISCOVERY:
            return SearchStrategy.RECOMMENDATION
        elif intent == Intent.LOCAL:
            return SearchStrategy.GEO_SEARCH
        elif intent == Intent.PRICE_SENSITIVE:
            return SearchStrategy.PRICE_OPTIMIZED
        else:
            return SearchStrategy.HYBRID
```

### Query Expansion

```python
class QueryExpander:
    def __init__(self):
        self.synonyms = SynonymDictionary()
        self.categories = CategoryTaxonomy()
        self.spell_checker = SpellChecker()
    
    async def expand(self, query: str, entities: Entities, context: UserContext) -> ExpandedQuery:
        # 1. Spell correction
        corrected = self.spell_checker.correct(query)
        
        # 2. Synonym expansion
        synonyms = self.synonyms.get_synonyms(entities.product_terms)
        
        # 3. Category expansion
        category_terms = self.categories.get_related_terms(entities.category)
        
        # 4. Attribute extraction
        attributes = self.extract_attributes(query)
        
        # 5. Price range detection
        price_range = self.extract_price_range(query)
        
        # 6. Location detection
        location = self.extract_location(query, context)
        
        return ExpandedQuery(
            terms=[corrected] + synonyms + category_terms,
            filters={
                "category": entities.category,
                "attributes": attributes,
                "price_range": price_range,
                "location": location,
                "condition": entities.condition,
                "brand": entities.brand
            }
        )
```

---

## 2. Candidate Generation

### Retrieval Methods

```python
class CandidateGenerator:
    def __init__(self, search_index, vector_index, graph_index):
        self.search = search_index      # Elasticsearch/OpenSearch
        self.vector = vector_index      # FAISS/Milvus/Pinecone
        self.graph = graph_index        # Knowledge graph
    
    async def generate(self, parsed: ParsedQuery, limit: int = 1000) -> List[Candidate]:
        candidates = []
        
        # 1. Keyword-based retrieval (high precision)
        if parsed.strategy in [SearchStrategy.EXACT_MATCH, SearchStrategy.HYBRID]:
            kw_results = await self.search.query(
                text=parsed.expanded_terms,
                filters=parsed.filters,
                size=limit // 2
            )
            candidates.extend(kw_results)
        
        # 2. Vector-based retrieval (high recall, semantic)
        if parsed.strategy in [SearchStrategy.DISCOVERY, SearchStrategy.HYBRID]:
            vec_results = await self.vector.search(
                query_vector=self.embed_query(parsed),
                filters=parsed.filters,
                size=limit // 2
            )
            candidates.extend(vec_results)
        
        # 3. Graph-based retrieval (relationships)
        if parsed.strategy == SearchStrategy.RECOMMENDATION:
            graph_results = await self.graph.traverse(
                user_id=parsed.user_id,
                hops=2,
                limit=limit // 4
            )
            candidates.extend(graph_results)
        
        # 4. Deduplicate and merge
        return self.merge_candidates(candidates, limit)
    
    def merge_candidates(self, candidates: List[Candidate], limit: int) -> List[Candidate]:
        # Deduplicate by listing_id, keep highest score
        seen = {}
        for c in candidates:
            if c.listing_id not in seen or c.score > seen[c.listing_id].score:
                seen[c.listing_id] = c
        
        # Sort by combined score
        merged = sorted(seen.values(), key=lambda x: -x.combined_score)
        return merged[:limit]
```

### Filtering (Hard Constraints)

```python
class CandidateFilter:
    """Apply hard filters before expensive ranking."""
    
    def filter(self, candidates: List[Candidate], filters: SearchFilters) -> List[Candidate]:
        filtered = []
        
        for candidate in candidates:
            # Availability
            if filters.in_stock_only and candidate.inventory <= 0:
                continue
            
            # Price range
            if filters.min_price and candidate.price < filters.min_price:
                continue
            if filters.max_price and candidate.price > filters.max_price:
                continue
            
            # Location / Shipping
            if filters.location and not candidate.ships_to(filters.location):
                continue
            if filters.max_distance_km:
                if candidate.distance_km > filters.max_distance_km:
                    continue
            
            # Seller requirements
            if filters.min_seller_rating and candidate.seller_rating < filters.min_seller_rating:
                continue
            if filters.verified_sellers_only and not candidate.seller_verified:
                continue
            if filters.exclude_sellers and candidate.seller_id in filters.exclude_sellers:
                continue
            
            # Category
            if filters.category and candidate.category_id not in filters.category:
                continue
            
            # Condition
            if filters.condition and candidate.condition not in filters.condition:
                continue
            
            # Compliance
            if candidate.is_restricted and not filters.allow_restricted:
                continue
            
            filtered.append(candidate)
        
        return filtered
```

---

## 3. Ranking

### Two-Stage Ranking

```python
class RankingPipeline:
    def __init__(self):
        self.first_pass = FirstPassRanker()      # Fast, ~1000 candidates
        self.second_pass = SecondPassRanker()    # Slower, ~100 candidates
        self.final_rank = FinalRanker()          # Business rules, ~20 results
    
    async def rank(self, query: ParsedQuery, candidates: List[Candidate]) -> List[RankedResult]:
        # Stage 1: Fast scoring
        stage1 = await self.first_pass.score(query, candidates)
        top_100 = sorted(stage1, key=lambda x: -x.score)[:100]
        
        # Stage 2: Personalization + complex features
        stage2 = await self.second_pass.score(query, top_100)
        top_50 = sorted(stage2, key=lambda x: -x.score)[:50]
        
        # Stage 3: Business rules, diversity, fairness
        final = await self.final_rank.rank(query, top_50)
        
        return final
```

### First-Pass Ranker (LightGBM / XGBoost)

```python
class FirstPassRanker:
    FEATURES = [
        # Query-Listing relevance
        "bm25_score",
        "vector_similarity",
        "category_match",
        "attribute_overlap",
        "brand_match",
        
        # Listing quality
        "listing_quality_score",
        "image_count",
        "description_length",
        "attribute_completeness",
        "video_present",
        
        # Seller quality
        "seller_rating",
        "seller_response_time",
        "seller_fulfillment_rate",
        "seller_verification_level",
        
        # Price signals
        "price_competitiveness",  # vs category median
        "price_vs_history",       # vs seller's own history
        "discount_depth",
        
        # Popularity
        "view_count_7d",
        "conversion_rate_30d",
        "favorite_count",
        "sales_velocity",
        
        # Recency
        "days_since_listed",
        "days_since_updated",
        
        # Personalization (lightweight)
        "user_category_affinity",
        "user_price_preference",
        "user_brand_affinity"
    ]
    
    def __init__(self):
        self.model = lgb.Booster(model_file="ranker_v1.txt")
    
    def score(self, query: ParsedQuery, candidates: List[Candidate]) -> List[ScoredCandidate]:
        features = self.build_features(query, candidates)
        scores = self.model.predict(features)
        
        return [
            ScoredCandidate(candidate=c, score=float(s), features=f)
            for c, s, f in zip(candidates, scores, features)
        ]
```

### Second-Pass Ranker (Neural, Personalized)

```python
class SecondPassRanker:
    """Deep learning ranker with personalization."""
    
    def __init__(self):
        self.model = TwoTowerModel(
            query_tower=QueryTower(
                layers=[256, 128, 64],
                inputs=["query_embedding", "user_embedding", "context_embedding"]
            ),
            item_tower=ItemTower(
                layers=[256, 128, 64],
                inputs=["item_embedding", "seller_embedding", "category_embedding"]
            )
        )
    
    async def score(self, query: ParsedQuery, candidates: List[ScoredCandidate]) -> List[ScoredCandidate]:
        # Build query representation
        query_vec = await self.build_query_vector(query)
        
        # Build item representations (batch)
        item_vecs = await self.build_item_vectors([c.candidate for c in candidates])
        
        # Compute scores
        scores = await self.model.predict_batch(query_vec, item_vecs)
        
        # Combine with first-pass score
        for candidate, score in zip(candidates, scores):
            candidate.final_score = 0.7 * score + 0.3 * candidate.score
            candidate.personalization_score = score
        
        return sorted(candidates, key=lambda x: -x.final_score)
```

### Final Ranker (Business Rules)

```python
class FinalRanker:
    def __init__(self):
        self.diversity = DiversityController()
        self.fairness = FairnessController()
        self.business_rules = BusinessRulesEngine()
    
    async def rank(self, query: ParsedQuery, candidates: List[ScoredCandidate]) -> List[RankedResult]:
        # 1. Apply business rules
        candidates = self.business_rules.apply(query, candidates)
        
        # 2. Diversity (category, seller, price)
        candidates = self.diversity.enforce(
            candidates,
            max_per_seller=3,
            max_per_category=5,
            min_price_spread=0.3
        )
        
        # 3. Fairness (new seller boost, rotation)
        candidates = self.fairness.apply(candidates)
        
        # 4. Slot allocation (sponsored, organic)
        return self.allocate_slots(query, candidates)
    
    def allocate_slots(self, query: ParsedQuery, candidates: List[ScoredCandidate]) -> List[RankedResult]:
        results = []
        organic_idx = 0
        sponsored_idx = 0
        
        for slot in range(1, 21):  # Top 20 results
            if slot % 4 == 0 and sponsored_idx < len(query.sponsored):
                # Sponsored slot
                results.append(RankedResult(
                    candidate=query.sponsored[sponsored_idx],
                    rank=slot,
                    slot_type="sponsored"
                ))
                sponsored_idx += 1
            else:
                # Organic slot
                while organic_idx < len(candidates) and candidates[organic_idx].used:
                    organic_idx += 1
                if organic_idx < len(candidates):
                    results.append(RankedResult(
                        candidate=candidates[organic_idx],
                        rank=slot,
                        slot_type="organic"
                    ))
                    candidates[organic_idx].used = True
                    organic_idx += 1
        
        return results
```

---

## 4. Matching Algorithms by Marketplace Type

### Instant Matching (Rides, Delivery)

```python
class InstantMatcher:
    """Real-time matching for on-demand services."""
    
    def __init__(self):
        self.geo_index = GeoIndex()  # H3 / QuadTree
        self.supply_tracker = SupplyTracker()  # Real-time locations
    
    async def match(self, request: MatchRequest) -> MatchResult:
        # 1. Find nearby supply
        nearby = await self.geo_index.query_radius(
            center=request.location,
            radius_km=request.max_distance_km,
            filters={
                "status": "available",
                "vehicle_type": request.vehicle_type,
                "min_rating": 4.0
            }
        )
        
        # 2. Score each candidate
        scored = []
        for supplier in nearby:
            score = self.score_match(supplier, request)
            if score > 0.3:
                scored.append((supplier, score))
        
        # 3. Sort by score
        scored.sort(key=lambda x: -x[1])
        
        # 4. Dispatch to top candidate (with backup)
        primary = scored[0] if scored else None
        backups = scored[1:3]
        
        return MatchResult(
            primary=primary,
            backups=backups,
            strategy="closest_available",
            estimated_arrival=primary.eta if primary else None
        )
    
    def score_match(self, supplier: Supplier, request: MatchRequest) -> float:
        weights = {
            "distance": 0.30,
            "eta": 0.20,
            "rating": 0.15,
            "acceptance_rate": 0.15,
            "completion_rate": 0.10,
            "surge_multiplier": 0.10
        }
        
        return (
            weights["distance"] * (1 - supplier.distance_km / request.max_distance_km) +
            weights["eta"] * (1 - supplier.eta_min / request.max_eta_min) +
            weights["rating"] * (supplier.rating - 3) / 2 +
            weights["acceptance_rate"] * supplier.acceptance_rate +
            weights["completion_rate"] * supplier.completion_rate +
            weights["surge_multiplier"] * min(request.surge, 3.0) / 3.0
        )
```

### Search-Based Matching (E-commerce, Rentals)

```python
class SearchMatcher:
    """Relevance-based matching for browse/search marketplaces."""
    
    def __init__(self, ranking_pipeline: RankingPipeline):
        self.ranker = ranking_pipeline
    
    async def match(self, request: SearchRequest) -> SearchResults:
        # 1. Parse query
        parsed = await self.query_understanding.parse(request.query, request.user_context)
        
        # 2. Generate candidates
        candidates = await self.candidate_generator.generate(parsed, limit=500)
        
        # 3. Filter
        candidates = self.candidate_filter.filter(candidates, parsed.filters)
        
        # 4. Rank
        ranked = await self.ranker.rank(parsed, candidates)
        
        # 5. Paginate
        page = ranked[(request.page-1)*request.page_size:request.page*request.page_size]
        
        return SearchResults(
            results=page,
            total=len(ranked),
            facets=self.extract_facets(candidates),
            suggestions=self.generate_suggestions(parsed),
            query_id=parsed.query_id
        )
```

### Request-for-Quote / Bid Matching (Services, B2B)

```python
class RFPMatcher:
    """Matching for request-for-proposal workflows."""
    
    async def match(self, rfp: RFP) -> List[SupplierMatch]:
        # 1. Parse requirements
        requirements = self.parse_rfp(rfp)
        
        # 2. Find eligible suppliers
        eligible = await self.supplier_index.find_eligible(
            category=rfp.category,
            skills=requirements.skills,
            location=rfp.location,
            budget_min=rfp.budget_min,
            budget_max=rfp.budget_max,
            timeline=rfp.timeline,
            min_rating=4.0
        )
        
        # 3. Score fit
        scored = []
        for supplier in eligible:
            fit_score = self.calculate_fit(supplier, requirements)
            if fit_score > 0.5:
                scored.append(SupplierMatch(
                    supplier=supplier,
                    fit_score=fit_score,
                    match_reasons=self.explain_fit(supplier, requirements),
                    estimated_price=supplier.estimate_price(requirements),
                    availability=supplier.get_availability(rfp.timeline)
                ))
        
        # 4. Rank and return top matches
        scored.sort(key=lambda x: -x.fit_score)
        return scored[:rfp.max_matches or 10]
    
    def calculate_fit(self, supplier: Supplier, requirements: RFPRequirements) -> float:
        scores = {
            "skills": self.skill_match(supplier.skills, requirements.skills),
            "experience": self.experience_match(supplier, requirements),
            "budget": self.budget_match(supplier, requirements),
            "location": self.location_match(supplier, requirements),
            "availability": self.availability_match(supplier, requirements),
            "reputation": supplier.rating / 5.0
        }
        
        weights = {"skills": 0.30, "experience": 0.20, "budget": 0.15, 
                   "location": 0.10, "availability": 0.15, "reputation": 0.10}
        
        return sum(scores[k] * weights[k] for k in scores)
```

### Two-Sided Matching (Dating, Mentorship, Roommates)

```python
class TwoSidedMatcher:
    """Mutual preference matching (stable marriage / Gale-Shapley variants)."""
    
    async def find_matches(self, user_id: str, limit: int = 10) -> List[MutualMatch]:
        user = await self.get_user_profile(user_id)
        
        # 1. Get candidate pool
        candidates = await self.get_candidate_pool(user)
        
        # 2. Compute mutual compatibility
        mutual_matches = []
        for candidate in candidates:
            compatibility = self.compute_compatibility(user, candidate)
            
            if compatibility.mutual_score > 0.6:
                mutual_matches.append(MutualMatch(
                    user_id=candidate.id,
                    compatibility=compatibility,
                    match_reasons=compatibility.reasons,
                    conversation_starters=self.generate_starters(user, candidate)
                ))
        
        # 3. Sort by mutual score
        mutual_matches.sort(key=lambda x: -x.compatibility.mutual_score)
        
        return mutual_matches[:limit]
    
    def compute_compatibility(self, user: User, candidate: User) -> CompatibilityScore:
        # User's preferences vs candidate's attributes
        user_to_candidate = self.score_preferences(user.preferences, candidate.attributes)
        
        # Candidate's preferences vs user's attributes
        candidate_to_user = self.score_preferences(candidate.preferences, user.attributes)
        
        # Mutual score (geometric mean for balance)
        mutual = math.sqrt(user_to_candidate * candidate_to_user)
        
        return CompatibilityScore(
            user_to_candidate=user_to_candidate,
            candidate_to_user=candidate_to_user,
            mutual_score=mutual,
            reasons=self.explain_compatibility(user, candidate)
        )
```

---

## 5. Learning to Rank

### Training Data Collection

```python
class RankingDataCollector:
    """Collect implicit and explicit feedback for training."""
    
    EVENTS = {
        "impression": 0.1,
        "click": 1.0,
        "add_to_cart": 3.0,
        "purchase": 10.0,
        "favorite": 2.0,
        "share": 1.5,
        "dwell_time": "continuous",
        "bounce": -1.0
    }
    
    def log_interaction(self, event: InteractionEvent):
        # Build training example
        example = TrainingExample(
            query_id=event.query_id,
            listing_id=event.listing_id,
            rank=event.rank,
            features=event.features,
            label=self.EVENTS.get(event.action, 0),
            user_id=event.user_id,
            timestamp=event.timestamp
        )
        
        # Write to feature store
        self.feature_store.write(example)
        
        # Update real-time features
        self.realtime_features.update(event)
```

### Model Training Pipeline

```python
class RankingModelTrainer:
    def train(self, config: TrainingConfig) -> ModelArtifact:
        # 1. Load training data
        train_data = self.load_training_data(config.date_range)
        
        # 2. Feature engineering
        features = self.engineer_features(train_data)
        
        # 3. Handle position bias
        features = self.correct_position_bias(features)
        
        # 4. Train model
        if config.model_type == "lambdamart":
            model = self.train_lambdamart(features, config)
        elif config.model_type == "neural":
            model = self.train_neural(features, config)
        elif config.model_type == "listwise":
            model = self.train_listwise(features, config)
        
        # 5. Offline evaluation
        metrics = self.evaluate_offline(model, config.test_data)
        
        # 6. Validate against guardrails
        if not self.check_guardrails(metrics, config.guardrails):
            raise TrainingFailed("Guardrails not met")
        
        # 7. Package artifact
        return ModelArtifact(
            model=model,
            metrics=metrics,
            features=features.columns.tolist(),
            version=self.generate_version()
        )
    
    def correct_position_bias(self, data: pd.DataFrame) -> pd.DataFrame:
        """Inverse Propensity Weighting for position bias."""
        # Estimate propensity by position
        position_counts = data.groupby('rank').size()
        position_clicks = data.groupby('rank')['clicked'].sum()
        propensity = position_clicks / position_counts
        
        # Weight = 1 / propensity
        data['weight'] = data['rank'].map(lambda r: 1 / propensity.get(r, 1))
        
        return data
```

---

## 6. Search Quality Evaluation

### Offline Metrics

```python
SEARCH_METRICS = {
    "ndcg": {
        "name": "Normalized Discounted Cumulative Gain",
        "formula": "DCG / IDCG",
        "use_case": "Ranking quality with graded relevance",
        "k": [5, 10, 20]
    },
    "map": {
        "name": "Mean Average Precision",
        "formula": "Mean of AP across queries",
        "use_case": "Binary relevance, ranking quality"
    },
    "mrr": {
        "name": "Mean Reciprocal Rank",
        "formula": "Mean of 1/rank_of_first_relevant",
        "use_case": "Known-item search"
    },
    "precision_at_k": {
        "name": "Precision@K",
        "formula": "Relevant_in_top_k / k",
        "use_case": "Top-K quality"
    },
    "recall_at_k": {
        "name": "Recall@K",
        "formula": "Relevant_in_top_k / Total_relevant",
        "use_case": "Coverage"
    }
}
```

### Online Evaluation (A/B Testing)

```python
class SearchExperiment:
    def run_experiment(self, experiment: SearchExperimentConfig) -> ExperimentResult:
        # 1. Randomization
        variant_assignment = self.assign_variants(
            experiment.traffic_split,
            experiment.targeting
        )
        
        # 2. Run experiment
        metrics = self.collect_metrics(
            experiment.duration_days,
            variant_assignment
        )
        
        # 3. Statistical analysis
        results = self.analyze(
            metrics,
            experiment.primary_metric,
            experiment.guardrail_metrics
        )
        
        # 4. Decision
        decision = self.make_decision(results, experiment)
        
        return ExperimentResult(
            variant_results=results,
            decision=decision,
            confidence=results.p_value,
            lift=results.relative_lift
        )
    
    GUARDRAIL_METRICS = [
        "zero_result_rate",      # Must not increase
        "search_latency_p99",    # Must not increase > 10%
        "click_through_rate",    # Must not decrease > 5%
        "conversion_rate",       # Must not decrease > 2%
        "revenue_per_search"     # Must not decrease
    ]
```

---

## 7. Search Infrastructure

### Elasticsearch Cluster Design

```yaml
# Elasticsearch cluster for marketplace search
cluster:
  name: marketplace-search
  nodes:
    master:
      count: 3
      instance: r6g.xlarge
      storage: 100GB SSD
    data:
      count: 6
      instance: r6g.2xlarge
      storage: 2TB NVMe
      zones: 3
    coordinating:
      count: 4
      instance: c6g.xlarge
  
indices:
  listings:
    shards: 12
    replicas: 1
    refresh_interval: 30s
    lifecycle:
      hot: 7d
      warm: 30d
      cold: 365d
      delete: 730d
  
  users:
    shards: 3
    replicas: 1
  
  queries_log:
    shards: 6
    replicas: 1
    rollover: 7d
    retention: 90d
```

### Vector Search Infrastructure

```python
class VectorSearchInfrastructure:
    """Scale vector search to 100M+ listings."""
    
    def __init__(self):
        # Use Milvus / Pinecone / Weaviate / Qdrant
        self.index = MilvusIndex(
            collection="listing_embeddings",
            dimension=768,
            metric="IP",  # Inner product for normalized vectors
            index_type="HNSW",
            hnsw_m=16,
            hnsw_ef_construction=200
        )
    
    def build_index(self):
        """Incremental index building."""
        # 1. Full rebuild weekly
        # 2. Incremental updates every 5 minutes
        # 3. Delete tombstones daily
        pass
    
    def search(self, query_vector: np.ndarray, filters: dict, limit: int) -> List[VectorResult]:
        # Hybrid search: vector + scalar filters
        search_params = {
            "metric_type": "IP",
            "params": {"ef": 128}
        }
        
        return self.index.search(
            data=[query_vector],
            anns_field="embedding",
            param=search_params,
            limit=limit,
            expr=self.build_filter_expr(filters),
            output_fields=["listing_id", "seller_id", "category", "price"]
        )
```

---

## Summary

1. **Matching is the product** - Invest heavily in search and ranking
2. **Query understanding enables intent-aware search** - NLP, entities, expansion
3. **Two-stage retrieval** - Fast candidate generation → precise ranking
4. **Ranking evolves** - BM25 → Learning-to-rank → Neural + personalization
5. **Different marketplace types need different algorithms** - Instant vs search vs RFP vs two-sided
6. **Learning to rank requires careful data** - Position bias correction, guardrails
7. **Infrastructure scales differently** - Elasticsearch for keyword, vector DB for semantic
8. **Measure online and offline** - NDCG, MAP offline; A/B tests online

---

## Next Chapter: Operations and Marketplace Management

We'll cover the day-to-day operations: supply management, demand generation, trust & safety operations, customer support, and marketplace health monitoring.