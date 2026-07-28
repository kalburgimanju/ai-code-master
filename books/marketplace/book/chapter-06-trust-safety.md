# Chapter 6: Trust, Safety, and Reputation Systems

## Why Trust is the Currency of Marketplaces

> "In a marketplace, trust is not a feature—it's the product. Without trust, transactions don't happen."

Marketplaces solve the fundamental problem of **trust between strangers**. Every design decision should strengthen trust signals and reduce trust barriers.

---

## Trust Architecture Framework

```
Trust Layers
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSACTION GUARANTEES                       │
│  Money-back guarantees • Insurance • Escrow • Chargeback rights │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    DISPUTE RESOLUTION                           │
│  Mediation • Arbitration • Automated resolution • Appeals       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    REPUTATION SYSTEMS                           │
│  Ratings • Reviews • Badges • Verification • History            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    IDENTITY & VERIFICATION                      │
│  KYC/KYB • Document verification • Biometrics • Linked accounts │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    PLATFORM POLICIES                            │
│  Terms of Service • Community Guidelines • Prohibited items     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Identity Verification

### Verification Tiers

```python
class VerificationTier(Enum):
    UNVERIFIED = 0
    EMAIL_VERIFIED = 1
    PHONE_VERIFIED = 2
    ID_VERIFIED = 3          # Government ID
    ADDRESS_VERIFIED = 4     # Utility bill, bank statement
    BUSINESS_VERIFIED = 5    # Business registration, tax ID
    ENHANCED_DUE_DILIGENCE = 6  # Source of funds, beneficial owners

VERIFICATION_REQUIREMENTS = {
    "buyer": {
        "basic": [VerificationTier.EMAIL_VERIFIED],
        "high_value": [VerificationTier.ID_VERIFIED, VerificationTier.ADDRESS_VERIFIED],
        "regulated": [VerificationTier.ENHANCED_DUE_DILIGENCE]
    },
    "seller": {
        "casual": [VerificationTier.EMAIL_VERIFIED, VerificationTier.PHONE_VERIFIED],
        "regular": [VerificationTier.ID_VERIFIED, VerificationTier.ADDRESS_VERIFIED],
        "professional": [VerificationTier.BUSINESS_VERIFIED],
        "high_risk": [VerificationTier.ENHANCED_DUE_DILIGENCE]
    }
}
```

### Verification Flow

```python
class IdentityVerificationService:
    def __init__(self, doc_provider, biometric_provider, screening_provider):
        self.docs = doc_provider
        self.biometric = biometric_provider
        self.screening = screening_provider
    
    async def verify_user(self, user_id: str, tier: VerificationTier) -> VerificationResult:
        user = await self.get_user(user_id)
        
        if tier == VerificationTier.EMAIL_VERIFIED:
            return await self.verify_email(user)
        elif tier == VerificationTier.PHONE_VERIFIED:
            return await self.verify_phone(user)
        elif tier == VerificationTier.ID_VERIFIED:
            return await self.verify_identity_document(user)
        elif tier == VerificationTier.BUSINESS_VERIFIED:
            return await self.verify_business(user)
        elif tier == VerificationTier.ENHANCED_DUE_DILIGENCE:
            return await self.edd_verification(user)
    
    async def verify_identity_document(self, user: User) -> VerificationResult:
        # 1. Document upload and validation
        doc_result = await self.docs.validate(
            document_type=user.id_document_type,
            front_image=user.id_front_image,
            back_image=user.id_back_image,
            selfie_image=user.selfie_image
        )
        
        if not doc_result.valid:
            return VerificationResult(
                status="rejected",
                reason=doc_result.reason,
                tier=VerificationTier.UNVERIFIED
            )
        
        # 2. Biometric match (selfie vs ID photo)
        bio_result = await self.biometric.match(
            selfie=user.selfie_image,
            id_photo=doc_result.extracted_photo
        )
        
        if bio_result.similarity < 0.85:
            return VerificationResult(
                status="rejected",
                reason="Biometric mismatch",
                tier=VerificationTier.UNVERIFIED
            )
        
        # 3. Data extraction and validation
        extracted = doc_result.extracted_data
        if not self.validate_extracted_data(extracted, user):
            return VerificationResult(
                status="manual_review",
                reason="Data mismatch",
                tier=VerificationTier.UNVERIFIED
            )
        
        # 4. Watchlist screening
        screen_result = await self.screening.check(
            name=extracted["full_name"],
            dob=extracted["date_of_birth"],
            document_number=extracted["document_number"]
        )
        
        if screen_result.hit:
            return VerificationResult(
                status="rejected",
                reason="Watchlist match",
                tier=VerificationTier.UNVERIFIED
            )
        
        # 5. Success
        await self.update_user_verification(user.id, VerificationTier.ID_VERIFIED)
        return VerificationResult(
            status="verified",
            tier=VerificationTier.ID_VERIFIED,
            data=extracted
        )
```

---

## 2. Reputation Systems

### Rating & Review Design

```python
class ReputationSystem:
    """Multi-dimensional reputation with anti-gaming."""
    
    DIMENSIONS = {
        "overall": {"weight": 1.0, "description": "Overall experience"},
        "accuracy": {"weight": 0.8, "description": "Item matches description"},
        "communication": {"weight": 0.6, "description": "Responsiveness and clarity"},
        "speed": {"weight": 0.7, "description": "Shipping/delivery speed"},
        "value": {"weight": 0.5, "description": "Price vs quality"}
    }
    
    def calculate_score(self, user_id: str) -> ReputationScore:
        reviews = self.get_published_reviews(user_id)
        
        if len(reviews) < 3:
            return ReputationScore(
                score=None,  # Not enough data
                review_count=len(reviews),
                status="new"
            )
        
        # Time-weighted average (recent reviews matter more)
        weighted_sum = 0
        weight_total = 0
        now = datetime.now()
        
        for review in reviews:
            age_days = (now - review.created_at).days
            time_weight = max(0.1, 1 - (age_days / 365) * 0.5)  # Decay over year
            
            # Quality weight (detailed reviews count more)
            quality_weight = self.calculate_quality_weight(review)
            
            # Verified purchase weight
            verified_weight = 1.5 if review.verified_purchase else 1.0
            
            total_weight = time_weight * quality_weight * verified_weight
            weighted_sum += review.overall_rating * total_weight
            weight_total += total_weight
        
        score = weighted_sum / weight_total
        
        # Bayesian adjustment for low review counts
        prior_avg = self.get_category_average(user_id)
        prior_weight = 10  # Equivalent to 10 average reviews
        adjusted_score = (score * weight_total + prior_avg * prior_weight) / (weight_total + prior_weight)
        
        return ReputationScore(
            score=round(adjusted_score, 1),
            review_count=len(reviews),
            dimension_scores=self.calculate_dimensions(reviews),
            percentile=self.get_percentile(adjusted_score),
            trend=self.get_trend(user_id),
            badges=self.calculate_badges(user_id, reviews)
        )
```

### Anti-Gaming Measures

```python
class ReviewAntiGaming:
    """Detect and prevent review manipulation."""
    
    DETECTION_RULES = [
        # Velocity checks
        Rule("review_velocity", 
             condition="reviews_per_hour > 5",
             action="flag"),
        
        # Reciprocal reviews
        Rule("reciprocal_reviews",
             condition="user_a reviewed user_b AND user_b reviewed user_a within 7 days",
             action="flag_both"),
        
        # Same IP/device
        Rule("shared_device",
             condition="reviewer and reviewee share device fingerprint",
             action="flag"),
        
        # Content similarity
        Rule("template_reviews",
             condition="cosine_similarity(review_text, other_reviews) > 0.9",
             action="flag"),
        
        # New account reviewing
        Rule("new_account_review",
             condition="reviewer.account_age_days < 7 AND review_count > 3",
             action="require_verification"),
        
        # Extreme ratings only
        Rule("polarized_rater",
             condition="std_dev(ratings) < 0.5 AND review_count > 10",
             action="reduce_weight"),
        
        # Competitor sabotage
        Rule("competitor_sabotage",
             condition="reviewer sells in same category AND rating <= 2",
             action="flag_for_manual"),
    ]
    
    def analyze_review(self, review: Review) -> GamingAnalysis:
        signals = []
        
        for rule in self.DETECTION_RULES:
            if rule.condition_met(review):
                signals.append(GamingSignal(
                    rule=rule.name,
                    severity=rule.severity,
                    action=rule.action
                ))
        
        # ML model score
        ml_score = self.ml_model.predict(review)
        
        return GamingAnalysis(
            signals=signals,
            ml_score=ml_score,
            overall_risk=max([s.severity for s in signals] + [ml_score]),
            recommended_action=self.determine_action(signals, ml_score)
        )
```

### Badge System

```python
BADGE_DEFINITIONS = [
    Badge(
        id="top_rated",
        name="Top Rated",
        criteria="score >= 4.8 AND review_count >= 50 AND percentile >= 90",
        tier="gold",
        benefits=["search_boost", "badge_display", "lower_take_rate"]
    ),
    Badge(
        id="super_responsive",
        name="Super Responsive",
        criteria="avg_response_time < 1h AND response_rate >= 95%",
        tier="silver",
        benefits=["badge_display", "priority_in_search"]
    ),
    Badge(
        id="fast_shipper",
        name="Fast Shipper",
        criteria="avg_ship_time < 12h AND on_time_rate >= 98%",
        tier="silver",
        benefits=["badge_display", "shipping_filter_priority"]
    ),
    Badge(
        id="quality_seller",
        name="Quality Seller",
        criteria="accuracy_score >= 4.7 AND return_rate < 2%",
        tier="gold",
        benefits=["search_boost", "badge_display", "buyer_protection_badge"]
    ),
    Badge(
        id="verified_business",
        name="Verified Business",
        criteria="business_verification = VERIFIED",
        tier="platinum",
        benefits=["trust_badge", "higher_limits", "priority_support"]
    ),
    Badge(
        id="eco_friendly",
        name="Eco-Friendly",
        criteria="uses_sustainable_packaging AND carbon_neutral_shipping",
        tier="green",
        benefits=["filter_tag", "marketing_highlight"]
    )
]
```

---

## 3. Dispute Resolution

### Dispute Lifecycle

```
Dispute Flow
┌─────────────┐
│   OPENED    │  Buyer or seller initiates
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  EVIDENCE   │  Both parties submit evidence
│  COLLECTION │  (photos, messages, tracking)
└──────┬──────┘
       │
       ▼
┌─────────────┐     Automated     ┌─────────────┐
│  AUTOMATED  │──────────────────►│   RESOLVED  │
│  RESOLUTION │  Clear evidence   │  (refund,   │
└──────┬──────┘                   │   return,   │
       │ No                       │   partial)  │
       ▼                          └─────────────┘
┌─────────────┐
│  MEDIATION  │  Platform mediator
└──────┬──────┘
       │
       ▼
┌─────────────┐     Failed       ┌─────────────┐
│ ARBITRATION │─────────────────►│  DECISION   │
│  (Binding)  │                  │  (Final)    │
└─────────────┘                  └─────────────┘
```

### Automated Resolution Engine

```python
class AutomatedDisputeResolution:
    """Rule-based automated resolution for clear-cut cases."""
    
    RULES = [
        # Item not received
        Rule(
            name="inr_tracking_delivered",
            condition="tracking.shows_delivered AND buyer.claims_not_received",
            resolution="deny_claim",
            reason="Carrier confirmed delivery",
            evidence_required=["tracking_proof"]
        ),
        Rule(
            name="inr_no_tracking",
            condition="seller.cannot_provide_tracking AND buyer.claims_not_received",
            resolution="full_refund",
            reason="Seller failed to provide proof of shipment",
            evidence_required=[]
        ),
        
        # Not as described
        Rule(
            name="nad_photos_match",
            condition="buyer.photos_match_listing AND seller.photos_match_listing",
            resolution="deny_claim",
            reason="Item matches listing photos",
            evidence_required=["buyer_photos", "listing_photos"]
        ),
        Rule(
            name="nad_clear_mismatch",
            condition="buyer.photos_show_clear_difference AND expert.verifies_difference",
            resolution="full_refund_plus_return",
            reason="Clear material difference from listing",
            evidence_required=["buyer_photos", "expert_opinion"]
        ),
        
        # Damaged in transit
        Rule(
            name="damaged_carrier_insurance",
            condition="damage_reported_within_24h AND carrier_insurance_available",
            resolution="insurance_claim",
            reason="Carrier insurance covers transit damage",
            evidence_required=["damage_photos", "packaging_photos"]
        ),
        
        # Counterfeit
        Rule(
            name="counterfeit_authentication_failed",
            condition="item_fails_authentication AND category_requires_auth",
            resolution="full_refund_no_return",
            reason="Platform policy: counterfeit items destroyed",
            evidence_required=["authentication_report"]
        )
    ]
    
    def attempt_auto_resolution(self, dispute: Dispute) -> Optional[Resolution]:
        for rule in self.RULES:
            if rule.matches(dispute):
                # Verify evidence exists
                if all(dispute.has_evidence(e) for e in rule.evidence_required):
                    return Resolution(
                        type=rule.resolution,
                        reason=rule.reason,
                        automated=True,
                        rule=rule.name
                    )
        return None
```

### Mediation System

```python
class MediationService:
    def __init__(self):
        self.mediators = MediatorPool()
        self.sla_hours = 48
    
    async def start_mediation(self, dispute: Dispute) -> MediationSession:
        # Assign mediator based on category expertise
        mediator = await self.mediators.get_best_match(dispute.category)
        
        session = MediationSession(
            dispute_id=dispute.id,
            mediator_id=mediator.id,
            parties=[dispute.buyer_id, dispute.seller_id],
            status="active",
            deadline=datetime.now() + timedelta(hours=self.sla_hours)
        )
        
        # Notify parties
        await self.notify_parties(session, "mediation_started")
        
        # Create shared workspace
        await self.create_mediation_workspace(session)
        
        return session
    
    async def mediator_action(self, session: MediationSession, action: MediatorAction):
        if action.type == "propose_settlement":
            await self.present_settlement(session, action.proposal)
        elif action.type == "request_evidence":
            await self.request_evidence(session, action.from_party, action.evidence_type)
        elif action.type == "make_decision":
            await self.finalize_mediation(session, action.decision)
```

---

## 4. Fraud Prevention

### Fraud Types in Marketplaces

```
Marketplace Fraud Taxonomy
├── BUYER FRAUD
│   ├── Chargeback fraud (friendly fraud)
│   ├── Item not received (false INR)
│   ├── Not as described (false NAD)
│   ├── Return fraud (send back different item)
│   ├── Promotion abuse (coupon stacking)
│   └── Account takeover
├── SELLER FRAUD
│   ├── Never ship (take money, disappear)
│   ├── Ship empty box / wrong item
│   ├── Counterfeit goods
│   ├── Fake reviews (self-review, review rings)
│   ├── Shill bidding (auction manipulation)
│   └── Off-platform payment diversion
├── COLLUSION
│   ├── Buyer-seller collusion (fake transactions)
│   ├── Review rings (groups boosting each other)
│   └── Money laundering (high-value circular trades)
└── PLATFORM FRAUD
    ├── Affiliate fraud (fake referrals)
    ├── Ad fraud (click farms)
    └── Bonus abuse (signup bonuses)
```

### Real-time Fraud Scoring

```python
class FraudPreventionEngine:
    def __init__(self):
        self.rules = RuleEngine()
        self.ml_model = FraudMLModel()
        self.device_fingerprint = DeviceFingerprinting()
        self.behavioral = BehavioralAnalysis()
    
    async def score_event(self, event: FraudEvent) -> FraudDecision:
        # 1. Device intelligence
        device_risk = await self.device_fingerprint.analyze(
            event.device_fingerprint,
            event.ip_address
        )
        
        # 2. Behavioral analysis
        behavior_risk = await self.behavioral.analyze(
            user_id=event.user_id,
            action=event.action,
            context=event.context
        )
        
        # 3. Velocity checks
        velocity_risk = await self.check_velocity(event.user_id, event.action)
        
        # 4. Network analysis
        network_risk = await self.analyze_network(event.user_id)
        
        # 5. ML model
        features = self.build_features(event, device_risk, behavior_risk, 
                                       velocity_risk, network_risk)
        ml_score = await self.ml_model.predict(features)
        
        # 6. Rules engine
        rule_result = self.rules.evaluate(features)
        
        # 7. Combine scores
        final_score = self.combine_scores(
            ml_score=ml_score,
            rule_score=rule_result.score,
            device_risk=device_risk.score,
            behavior_risk=behavior_risk.score,
            velocity_risk=velocity_risk,
            network_risk=network_risk
        )
        
        # 8. Decision
        return self.make_decision(final_score, rule_result.triggered_rules)
    
    def make_decision(self, score: float, triggered_rules: List[str]) -> FraudDecision:
        if score > 0.9 or "hard_block" in triggered_rules:
            return FraudDecision(action="block", score=score, reasons=triggered_rules)
        elif score > 0.7 or "challenge" in triggered_rules:
            return FraudDecision(action="challenge", score=score, 
                                challenge_type=self.select_challenge(triggered_rules),
                                reasons=triggered_rules)
        elif score > 0.5:
            return FraudDecision(action="monitor", score=score, reasons=triggered_rules)
        else:
            return FraudDecision(action="allow", score=score)
    
    def select_challenge(self, rules: List[str]) -> ChallengeType:
        if "suspicious_login" in rules:
            return ChallengeType.MFA
        elif "new_device" in rules:
            return ChallengeType.DEVICE_VERIFICATION
        elif "high_value_transaction" in rules:
            return ChallengeType.ADDITIONAL_VERIFICATION
        else:
            return ChallengeType.CAPTCHA
```

---

## 5. Insurance & Guarantees

### Buyer Protection Program

```python
class BuyerProtectionProgram:
    """Platform-backed guarantee for buyer confidence."""
    
    COVERAGE = {
        "item_not_received": {
            "max_coverage": 10000,  # $100 per order
            "conditions": [
                "Order placed through platform",
                "Tracking shows no delivery",
                "Reported within 30 days of estimated delivery",
                "No prior INR claims this year > 2"
            ],
            "payout": "full_refund_including_shipping"
        },
        "not_as_described": {
            "max_coverage": 50000,  # $500 per order
            "conditions": [
                "Material difference from listing",
                "Reported within 14 days of delivery",
                "Photos provided showing difference",
                "Return initiated through platform"
            ],
            "payout": "full_refund_upon_return"
        },
        "counterfeit": {
            "max_coverage": 250000,  # $2500 per order
            "conditions": [
                "Category requires authentication",
                "Platform authentication fails",
                "Reported within 30 days"
            ],
            "payout": "full_refund_no_return_required"
        },
        "damaged_in_transit": {
            "max_coverage": 10000,
            "conditions": [
                "Reported within 24 hours with photos",
                "Packaging photos showing damage",
                "Carrier claim filed"
            ],
            "payout": "full_refund"
        }
    }
    
    FUNDING = {
        "source": "take_rate_allocation",  # 0.5% of GMV
        "reserve_target": "6_months_expected_claims",
        "reinsurance": "catastrophic_loss_coverage"
    }
```

### Seller Protection

```python
class SellerProtectionProgram:
    """Protect sellers from fraudulent buyers."""
    
    COVERAGE = {
        "chargeback_protection": {
            "covers": "fraudulent_chargebacks",
            "conditions": [
                "Tracking shows delivery to buyer address",
                "Seller responded to messages within 24h",
                "No policy violations"
            ],
            "limit": "$10,000 per incident, $50,000 annually"
        },
        "return_abuse_protection": {
            "covers": "buyer_returns_different_item",
            "conditions": [
                "Seller provides unboxing video",
                "Weight/dimensions mismatch documented",
                "Reported within 48 hours of receipt"
            ],
            "payout": "item_value + shipping"
        },
        "promotion_abuse": {
            "covers": "coupon_stacking_exploits",
            "conditions": ["Platform bug caused exploit"],
            "payout": "lost_revenue"
        }
    }
```

---

## 6. Trust Metrics & Monitoring

### Trust Health Dashboard

```python
class TrustHealthDashboard:
    def generate_report(self) -> TrustHealthReport:
        return TrustHealthReport(
            # Verification
            verification_rate=self.get_verification_rate(),
            verification_by_tier=self.get_verification_by_tier(),
            verification_time_avg=self.get_avg_verification_time(),
            
            # Reputation
            avg_rating=self.get_avg_rating(),
            rating_distribution=self.get_rating_distribution(),
            review_volume=self.get_review_volume(),
            review_fraud_rate=self.get_review_fraud_rate(),
            
            # Disputes
            dispute_rate=self.get_dispute_rate(),  # disputes / transactions
            dispute_by_type=self.get_disputes_by_type(),
            auto_resolution_rate=self.get_auto_resolution_rate(),
            mediation_rate=self.get_mediation_rate(),
            arbitration_rate=self.get_arbitration_rate(),
            avg_resolution_time=self.get_avg_resolution_time(),
            buyer_win_rate=self.get_buyer_win_rate(),
            seller_win_rate=self.get_seller_win_rate(),
            
            # Fraud
            fraud_attempts_blocked=self.get_fraud_blocked(),
            fraud_loss_rate=self.get_fraud_loss_rate(),  # $ lost / GMV
            chargeback_rate=self.get_chargeback_rate(),
            account_takeover_attempts=self.get_ato_attempts(),
            
            # Guarantees
            claims_filed=self.get_claims_filed(),
            claims_approved_rate=self.get_claims_approved_rate(),
            claims_payout_total=self.get_claims_payout(),
            reserve_adequacy=self.get_reserve_adequacy(),
            
            # Trust Signals
            trust_nps=self.get_trust_nps(),
            would_recommend=self.get_would_recommend(),
            safety_perception=self.get_safety_perception()
        )
```

---

## Summary

1. **Trust is layered** - Policies → Verification → Reputation → Disputes → Guarantees
2. **Verification must match risk** - Tiered approach, progressive requirements
3. **Reputation needs anti-gaming** - Time-weighting, Bayesian adjustment, ML detection
4. **Disputes need automation + human** - Clear rules for simple cases, mediation for complex
5. **Fraud prevention is multi-layered** - Device, behavior, velocity, network, ML
6. **Insurance builds confidence** - Buyer and seller protection programs
7. **Measure trust continuously** - Dispute rates, fraud loss, resolution times, NPS

---

## Next Chapter: Pricing Strategies and Revenue Models

We'll cover how marketplaces make money: take rates, subscription models, advertising, financial services, and pricing optimization.