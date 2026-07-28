# Chapter 5: Demand Side - Acquisition and Retention

## The Demand Imperative

While supply creates the product, demand creates the business. Without buyers, even the best supply sits idle. The demand side requires different strategies: higher volume, lower touch, faster conversion cycles, and relentless focus on lifetime value.

---

## Demand Acquisition Strategies

### 1. Organic Acquisition (Foundation)

```python
class OrganicDemandAcquisition:
    """Sustainable, compounding demand channels."""
    
    CHANNELS = {
        "seo": {
            "strategy": "Capture existing purchase intent",
            "tactics": [
                "Category pages for high-volume keywords",
                "Product pages optimized for long-tail",
                "Review/content pages for consideration keywords",
                "Comparison pages (vs competitors)",
                "Local SEO for geographic marketplaces"
            ],
            "metrics": ["organic_traffic", "organic_conversion_rate", "seo_cac"],
            "timeline": "6-18 months to scale"
        },
        
        "content_marketing": {
            "strategy": "Build trust and capture earlier funnel",
            "tactics": [
                "Buying guides and how-tos",
                "Supplier success stories",
                "Market trend reports",
                "Video content (YouTube, TikTok, Reels)",
                "Email newsletter with curated picks"
            ],
            "metrics": ["content_traffic", "newsletter_subscribers", "content_to_purchase"],
            "timeline": "3-12 months"
        },
        
        "referral_program": {
            "strategy": "Turn buyers into advocates",
            "tactics": [
                "Double-sided credits ($10/$10)",
                "Tiered rewards (bronze/silver/gold)",
                "Social sharing integration",
                "Affiliate program for creators",
                "B2B referral for team purchases"
            ],
            "metrics": ["referral_rate", "referral_cac", "viral_coefficient"],
            "timeline": "1-3 months to optimize"
        },
        
        "email_lifecycle": {
            "strategy": "Own the relationship",
            "tactics": [
                "Welcome series (5-7 emails)",
                "Abandoned cart/browse recovery",
                "Price drop alerts",
                "New arrival notifications",
                "Replenishment reminders",
                "Win-back campaigns"
            ],
            "metrics": ["open_rate", "click_rate", "revenue_per_email", "unsubscribe_rate"],
            "timeline": "Immediate, compounds over time"
        }
    }
```

### 2. Paid Acquisition (Accelerator)

```python
class PaidDemandAcquisition:
    """Scalable, measurable demand generation."""
    
    def __init__(self):
        self.platforms = {
            "google_ads": {
                "search": "High intent, capture demand",
                "shopping": "Visual product discovery",
                "display": "Retargeting, awareness",
                "youtube": "Video consideration",
                "performance_max": "Automated cross-channel"
            },
            "meta_ads": {
                "facebook_instagram": "Broad targeting, creative testing",
                "advantage_plus": "AI-optimized shopping campaigns",
                "collection_ads": "Catalog-driven discovery"
            },
            "tiktok_ads": {
                "spark_ads": "Boost organic creator content",
                "shop_ads": "Native shopping experience",
                "search_ads": "Emerging intent channel"
            },
            "marketplace_ads": {
                "amazon_ads": "If selling there too",
                "retail_media": "Walmart, Target, Instacart platforms"
            }
        }
    
    def campaign_structure(self):
        """Full-funnel campaign architecture."""
        return {
            "prospecting": {
                "objective": "New customer acquisition",
                "targeting": "Broad interests, lookalikes, keywords",
                "creative": "Value prop, social proof, offers",
                "budget_split": "60%"
            },
            "consideration": {
                "objective": "Engagement, add-to-cart",
                "targeting": "Website visitors, video viewers, engagers",
                "creative": "Product demos, reviews, comparisons",
                "budget_split": "25%"
            },
            "conversion": {
                "objective": "Purchase, ROAS",
                "targeting": "Cart abandoners, past purchasers, high intent",
                "creative": "Urgency, scarcity, free shipping, codes",
                "budget_split": "15%"
            }
        }
    
    def bid_strategy(self, stage: str, maturity: str) -> BidStrategy:
        if stage == "conversion":
            if maturity == "new":
                return BidStrategy.MAXIMIZE_CONVERSIONS  # Learn phase
            elif maturity == "mature":
                return BidStrategy.TARGET_ROAS  # Profitability phase
        elif stage == "prospecting":
            return BidStrategy.MAXIMIZE_CLICKS  # Volume phase
```

### 3. Partnerships & Channel (Multiplier)

```python
class PartnershipAcquisition:
    """Leverage other audiences and channels."""
    
    PARTNERSHIP_TYPES = {
        "affiliate_networks": {
            "examples": ["ShareASale", "CJ", "Impact", "PartnerStack"],
            "model": "CPA (cost per acquisition)",
            "best_for": "High-volume, standardized products"
        },
        "influencer_marketing": {
            "macro": ">100k followers, brand awareness",
            "micro": "10k-100k, higher engagement, lower cost",
            "nano": "<10k, authentic, very cost-effective",
            "model": "Fixed fee + affiliate commission"
        },
        "content_partnerships": {
            "publishers": "Wirecutter, NYT Wirecutter, BuzzFeed",
            "newsletters": "Morning Brew, The Hustle, niche newsletters",
            "communities": "Reddit, Discord, Facebook Groups, Slack"
        },
        "b2b_channel": {
            "corporate_gifting": "Sendoso, Alyce, Reachdesk",
            "procurement_platforms": "Coupa, Ariba, Zip",
            "employee_benefits": "Compt, Benepass, Fringe"
        },
        "integration_partnerships": {
            "shopify_apps": "Reach merchants where they work",
            "pos_systems": "Square, Toast, Lightspeed",
            "erp_systems": "NetSuite, SAP, QuickBooks"
        }
    }
```

---

## Conversion Optimization

### The Buyer Journey

```
Demand Funnel
┌─────────────────────────────────────────────────────────────┐
│ AWARENESS          │ 100%  │ Impressions, Reach             │
├─────────────────────────────────────────────────────────────┤
│ CONSIDERATION      │ 15%   │ Clicks, Site Visits, Time      │
├─────────────────────────────────────────────────────────────┤
│ INTENT             │ 5%    │ Search, Filter, Compare, Cart  │
├─────────────────────────────────────────────────────────────┤
│ PURCHASE           │ 2%    │ Checkout, Payment, Confirmation│
├─────────────────────────────────────────────────────────────┤
│ RETENTION          │ 30%   │ Repeat, Refer, Review          │
└─────────────────────────────────────────────────────────────┘
```

### Conversion Rate Optimization Framework

```python
class ConversionOptimization:
    def __init__(self):
        self.experiment_framework = ExperimentFramework()
    
    def prioritize_experiments(self) -> List[Experiment]:
        """ICE scoring: Impact × Confidence × Ease"""
        experiments = [
            Experiment(
                name="guest_checkout",
                hypothesis="Removing account creation increases conversion 15%",
                impact=9, confidence=8, ease=7,
                ice_score=9*8*7  # 504
            ),
            Experiment(
                name="free_shipping_threshold",
                hypothesis="$50 free shipping increases AOV 20%",
                impact=8, confidence=7, ease=9,
                ice_score=8*7*9  # 504
            ),
            Experiment(
                name="social_proof_on_pdp",
                hypothesis="Showing '10+ near price increases trust",
                impact=7, confidence=9, ease=8,
                ice_score=7*9*8  # 504
            ),
            Experiment(
                name="express_checkout",
                hypothesis="Apple/Google Pay reduces mobile friction",
                impact=8, confidence=8, ease=6,
                ice_score=8*8*6  # 384
            ),
            Experiment(
                name="personalized_homepage",
                hypothesis="Dynamic recommendations increase relevance",
                impact=9, confidence=6, ease=4,
                ice_score=9*6*4  # 216
            )
        ]
        return sorted(experiments, key=lambda x: x.ice_score, reverse=True)
    
    def run_experiment(self, experiment: Experiment):
        # Implementation with proper statistical rigor
        pass

# Key pages to optimize
PAGE_PRIORITIES = [
    ("Homepage", "Traffic entry point, brand communication"),
    ("Category/Search Results", "Discovery, filtering, sorting"),
    ("Product Detail Page (PDP)", "Decision, trust, add-to-cart"),
    ("Cart", "Review, edit, trust signals, upsells"),
    ("Checkout", "Friction reduction, payment options, clarity"),
    ("Post-Purchase", "Confirmation, tracking, referral, review request")
]
```

### Trust Signals That Convert

```python
TRUST_SIGNALS = {
    "social_proof": [
        "Verified purchase badges on reviews",
        "Review count and distribution (not just average)",
        "Recent purchase notifications ('John in NYC bought 2 min ago')",
        "User-generated photos/videos",
        "Q&A section with seller responses"
    ],
    "authority": [
        "Press mentions and awards",
        "Certifications (SSL, PCI, SOC2)",
        "Partner logos (payment providers, shipping)",
        "Media coverage"
    ],
    "guarantees": [
        "Money-back guarantee badge",
        "Free returns messaging",
        "Price match guarantee",
        "Authenticity guarantee (for luxury/collectibles)"
    ],
    "transparency": [
        "Clear shipping costs and dates before checkout",
        "Seller ratings and history visible",
        "Return policy in plain language",
        "Real-time inventory status"
    ]
}
```

---

## Retention & Lifetime Value

### Retention Cohort Analysis

```python
class RetentionAnalyzer:
    def analyze_cohorts(self) -> CohortAnalysis:
        # Build retention matrix
        cohorts = self.build_retention_matrix(
            interval="monthly",
            metric="repeat_purchase_rate"
        )
        
        # Key patterns to identify
        patterns = {
            "flattening": self.check_flattening(cohorts),  # Good!
            "declining": self.check_declining(cohorts),    # Bad!
            "seasonal": self.check_seasonal(cohorts),      # Expected
            "improving": self.check_improving(cohorts)     # Great!
        }
        
        return CohortAnalysis(
            matrix=cohorts,
            patterns=patterns,
            ltv_by_cohort=self.calculate_ltv_by_cohort(cohorts),
            payback_by_cohort=self.calculate_payback_by_cohort(cohorts)
        )
    
    def retention_benchmarks(self) -> Dict[str, float]:
        """Industry benchmarks for marketplace retention."""
        return {
            "month_1": 0.25,   # 25% repeat in month 1
            "month_3": 0.15,   # 15% in month 3
            "month_6": 0.10,   # 10% in month 6
            "month_12": 0.08,  # 8% in month 12
            "year_2": 0.20,    # 20% of year-1 buyers active in year 2
            "year_3": 0.15     # 15% in year 3
        }
```

### Lifecycle Marketing Programs

```python
class LifecycleMarketing:
    """Automated, personalized buyer journey."""
    
    PROGRAMS = {
        "onboarding": {
            "trigger": "first_purchase",
            "sequence": [
                Email(day=0, template="welcome_order_confirmation"),
                Email(day=1, template="tracking_info"),
                Email(day=3, template="delivery_confirmation"),
                Email(day=7, template="review_request"),
                Email(day=14, template="how_to_use_care"),
                Email(day=30, template="replenishment_or_related")
            ]
        },
        
        "repeat_purchase": {
            "trigger": "second_purchase",
            "sequence": [
                Email(day=0, template="vip_welcome"),
                Email(day=30, template="exclusive_access"),
                Email(day=60, template="birthday_gift"),
                Email(day=90, template="anniversary_reward")
            ]
        },
        
        "winback": {
            "trigger": "inactive_90_days",
            "segments": {
                "high_value": {
                    "sequence": [
                        Email(day=0, template="personal_outreach_from_csm"),
                        Email(day=7, template="exclusive_offer_30pct"),
                        Email(day=14, template="new_arrivals_curated"),
                        Email(day=30, template="final_notice_account_closure")
                    ]
                },
                "medium_value": {
                    "sequence": [
                        Email(day=0, template="we_miss_you_20pct"),
                        Email(day=7, template="whats_new"),
                        Email(day=21, template="last_chance_15pct")
                    ]
                },
                "low_value": {
                    "sequence": [
                        Email(day=0, template="generic_winback_10pct"),
                        Email(day=14, template="final_offer")
                    ]
                }
            }
        },
        
        "replenishment": {
            "trigger": "predicted_reorder_date",
            "products": ["consumables", "subscriptions", "seasonal"],
            "sequence": [
                Email(day=-7, template="running_low_reminder"),
                Email(day=0, template="one_click_reorder"),
                Email(day=7, template="subscribe_save_10pct")
            ]
        },
        
        "cross_sell": {
            "trigger": "category_affinity",
            "logic": "Users who bought X also buy Y",
            "sequence": [
                Email(day=3, template="complete_the_look"),
                Email(day=14, template="customers_also_bought"),
                Email(day=30, template="seasonal_recommendations")
            ]
        }
    }
```

### Loyalty Programs

```python
class LoyaltyProgram:
    """Tiered loyalty with meaningful benefits."""
    
    TIERS = [
        Tier(
            name="Insider",
            requirement="Create account",
            benefits=[
                "Early access to sales (24hr)",
                "Free standard shipping on $50+",
                "Birthday gift",
                "1 point per $1 spent"
            ]
        ),
        Tier(
            name="Silver",
            requirement="$200 spent OR 5 orders in 12 months",
            benefits=[
                "All Insider benefits",
                "Free express shipping",
                "1.5x points",
                "Priority support",
                "Exclusive products"
            ]
        ),
        Tier(
            name="Gold",
            requirement="$1000 spent OR 15 orders in 12 months",
            benefits=[
                "All Silver benefits",
                "Free same-day delivery (where available)",
                "2x points",
                "Dedicated support line",
                "Early access to new collections",
                "Free returns (no questions)"
            ]
        ),
        Tier(
            name="Platinum",
            requirement="$5000 spent OR invite-only",
            benefits=[
                "All Gold benefits",
                "Personal shopper",
                "VIP events",
                "Concierge service",
                "Custom commission requests",
                "3x points"
            ]
        )
    ]
    
    POINTS_ECONOMY = {
        "earn_rate": {
            "base": 1,          # 1 point per $1
            "silver": 1.5,
            "gold": 2,
            "platinum": 3
        },
        "bonus_actions": {
            "review_with_photo": 100,
            "referral_signup": 500,
            "social_share": 50,
            "birthday": 200
        },
        "redemption": {
            "100 points": "$1 off",
            "500 points": "$5 off + free shipping",
            "1000 points": "$15 off",
            "5000 points": "$100 off + exclusive item"
        },
        "breakage_rate": 0.15,  # Expected unredeemed
        "liability_accounting": "deferred_revenue"
    }
```

---

## Demand-Side Unit Economics

### CAC Payback & LTV

```python
@dataclass
class DemandUnitEconomics:
    # Acquisition
    blended_cac: float
    cac_by_channel: Dict[str, float]
    
    # Revenue
    aov: float                    # Average order value
    take_rate: float              # Platform revenue %
    revenue_per_order: float      # aov * take_rate
    
    # Frequency
    orders_per_year: float
    annual_revenue_per_buyer: float
    
    # Retention
    yearly_retention_rate: float
    expected_lifetime_years: float
    
    # Costs
    support_cost_per_order: float
    payment_cost_per_order: float
    refund_chargeback_rate: float
    
    # Calculated
    @property
    def contribution_per_order(self) -> float:
        revenue = self.revenue_per_order
        costs = (self.support_cost_per_order + 
                self.payment_cost_per_order + 
                self.aov * self.refund_chargeback_rate)
        return revenue - costs
    
    @property
    def ltv(self) -> float:
        """Lifetime value with retention decay."""
        annual_contribution = self.contribution_per_order * self.orders_per_year
        r = self.yearly_retention_rate
        # Sum of geometric series: a / (1 - r)
        return annual_contribution / (1 - r) if r < 1 else float('inf')
    
    @property
    def cac_payback_months(self) -> float:
        monthly_contribution = self.contribution_per_order * (self.orders_per_year / 12)
        return self.blended_cac / monthly_contribution if monthly_contribution > 0 else float('inf')
    
    @property
    def ltv_cac_ratio(self) -> float:
        return self.ltv / self.blended_cac if self.blended_cac > 0 else float('inf')
    
    def health_check(self) -> Dict[str, str]:
        return {
            "ltv_cac": "healthy" if self.ltv_cac_ratio > 3 else "at_risk" if self.ltv_cac_ratio > 1 else "unhealthy",
            "payback": "healthy" if self.cac_payback_months < 6 else "at_risk" if self.cac_payback_months < 12 else "unhealthy",
            "retention": "healthy" if self.yearly_retention_rate > 0.3 else "at_risk" if self.yearly_retention_rate > 0.15 else "unhealthy"
        }
```

---

## Measuring Demand Health

### Demand Health Dashboard

```python
class DemandHealthDashboard:
    def generate_report(self) -> DemandHealthReport:
        return DemandHealthReport(
            # Acquisition
            new_buyers_30d=self.count_new_buyers(30),
            cac_blended=self.get_blended_cac(),
            cac_by_channel=self.get_cac_by_channel(),
            cac_trend=self.get_cac_trend(90),
            
            # Conversion
            visit_to_purchase_rate=self.get_conversion_rate(),
            cart_abandonment_rate=self.get_cart_abandonment(),
            checkout_completion_rate=self.get_checkout_completion(),
            
            # Revenue
            gmv_30d=self.get_gmv(30),
            revenue_30d=self.get_revenue(30),
            aov=self.get_aov(),
            aov_trend=self.get_aov_trend(90),
            
            # Retention
            repeat_rate_30d=self.get_repeat_rate(30),
            repeat_rate_90d=self.get_repeat_rate(90),
            retention_cohorts=self.get_retention_cohorts(),
            
            # LTV
            ltv_estimate=self.estimate_ltv(),
            ltv_cac_ratio=self.get_ltv_cac_ratio(),
            payback_months=self.get_payback_months(),
            
            # Engagement
            sessions_per_buyer=self.get_sessions_per_buyer(),
            pages_per_session=self.get_pages_per_session(),
            time_on_site=self.get_avg_time_on_site(),
            nps_score=self.get_buyer_nps(),
            
            # Product
            categories_shopping=self.get_category_penetration(),
            search_utilization=self.get_search_utilization(),
            wishlist_adoption=self.get_wishlist_adoption(),
            
            # Mobile vs Desktop
            mobile_share=self.get_mobile_share(),
            mobile_conversion_rate=self.get_mobile_conversion(),
            
            # Geographic
            top_geos=self.get_top_geos(),
            international_share=self.get_international_share()
        )
```

---

## Summary

1. **Demand requires volume** - Different math than supply: higher CAC tolerance, faster cycles
2. **Full-funnel approach** - Brand → Consideration → Conversion → Retention
3. **Conversion optimization is continuous** - ICE framework, statistical rigor
4. **Trust signals are conversion multipliers** - Reviews, guarantees, transparency
5. **Retention > Acquisition** - LTV/CAC > 3, payback < 6 months
6. **Lifecycle marketing automates growth** - Onboarding, repeat, winback, replenishment
7. **Loyalty programs increase frequency** - Tiered, points, exclusive benefits
8. **Unit economics must work per cohort** - Not just blended averages

---

## Next Chapter: Trust, Safety, and Reputation Systems

We'll cover the trust infrastructure that makes marketplaces work: verification, reviews, dispute resolution, fraud prevention, and insurance.