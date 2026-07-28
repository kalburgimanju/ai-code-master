# Chapter 11: Metrics, Analytics, and Unit Economics

## The Measurement Imperative

> "You can't manage what you don't measure. But measuring the wrong things is worse than not measuring at all."

Marketplace metrics are uniquely complex because they involve **two-sided dynamics**. A metric that looks good for one side may be terrible for the other, and aggregate metrics can mask dangerous imbalances.

---

## 1. North Star Metrics

### The Marketplace North Star

```
PRIMARY NORTH STAR: LIQUIDITY-ADJUSTED GMV
    = GMV × Fill Rate × Match Quality Score

Where:
- GMV = Gross Merchandise Value
- Fill Rate = % of demand that finds supply (or vice versa)
- Match Quality = NPS / satisfaction of completed transactions
```

### Why This Works

| Traditional Metric | Problem | Liquidity-Adjusted GMV Fix |
|-------------------|---------|---------------------------|
| GMV alone | Can grow via low-quality matches | Penalizes poor matches |
| Revenue alone | Encourages high take rate → kills liquidity | Balances revenue & volume |
| User count | Vanity metric | Requires actual transactions |
| Conversion rate | Can be gamed (filtering) | Requires both sides satisfied |

### Alternative North Stars by Stage

```python
NORTH_STAR_BY_STAGE = {
    "seed": {
        "metric": "Weekly Active Sellers with ≥1 Sale",
        "why": "Proves supply can monetize"
    },
    "early_growth": {
        "metric": "Liquidity (Fill Rate × Match Quality)",
        "why": "Validates core marketplace mechanic"
    },
    "scale": {
        "metric": "Liquidity-Adjusted GMV",
        "why": "Balances growth, quality, efficiency"
    },
    "maturity": {
        "metric": "FCF per Transaction",
        "why": "Optimizes profitability at scale"
    }
}
```

---

## 2. The Metric Hierarchy

```
LEVEL 1: NORTH STAR (1 metric)
    │
    ├── LEVEL 2: HEALTH METRICS (5-7 metrics)
    │   ├── Supply Health
    │   ├── Demand Health  
    │   ├── Liquidity
    │   ├── Trust & Safety
    │   └── Economics
    │
    ├── LEVEL 3: DIAGNOSTIC METRICS (20-50 metrics)
    │   ├── By funnel stage
    │   ├── By segment
    │   ├── By cohort
    │   └── By geography/category
    │
    └── LEVEL 4: OPERATIONAL METRICS (100+ metrics)
        ├── Real-time dashboards
        ├── Alerting thresholds
        └── Team-level KPIs
```

---

## 3. Supply-Side Metrics

### Acquisition

```python
SUPPLY_ACQUISITION = {
    "new_sellers": "Count of sellers creating accounts",
    "verified_sellers": "Count completing verification",
    "first_listing_rate": "verified_sellers / new_sellers",
    "cac_supply": "Marketing + Sales spend / verified_sellers",
    "cac_by_channel": "Channel spend / verified_sellers_from_channel",
    "time_to_first_listing": "Median hours from signup to published listing"
}
```

### Activation & Retention

```python
SUPPLY_ACTIVATION = {
    "activation_rate": "Sellers with ≥1 sale in first 30 days / verified_sellers",
    "time_to_first_sale": "Median days from first listing to first sale",
    "listings_per_seller": "Median active listings per active seller",
    "gm_per_seller": "Median monthly GMV per active seller"
}

SUPPLY_RETENTION = {
    "monthly_retention": "Active sellers month N / Active sellers month N-1",
    "cohort_retention": "Retention curves by acquisition month",
    "churn_rate": "1 - monthly_retention",
    "reactivation_rate": "Churned sellers returning / total churned",
    "ltv_supply": "Sum of discounted future contribution margin per seller"
}
```

### Quality & Performance

```python
SUPPLY_QUALITY = {
    "fill_rate": "Orders fulfilled / Orders received",
    "on_time_ship_rate": "Shipped by promised date / Total shipped",
    "cancellation_rate": "Seller-cancelled orders / Total orders",
    "return_rate": "Returned items / Delivered items",
    "dispute_rate": "Disputes / Transactions",
    "avg_rating": "Weighted average rating (Bayesian)",
    "response_time": "Median hours to respond to buyer messages",
    "policy_violations": "Violations per 1000 transactions"
}
```

---

## 4. Demand-Side Metrics

### Acquisition

```python
DEMAND_ACQUISITION = {
    "new_buyers": "Count of buyers creating accounts",
    "first_purchase_rate": "Buyers with ≥1 purchase / new_buyers",
    "cac_demand": "Marketing spend / first_purchase_buyers",
    "cac_by_channel": "Channel spend / first_purchase_buyers_from_channel",
    "organic_vs_paid": "Organic buyers / Paid buyers"
}
```

### Activation & Retention

```python
DEMAND_ACTIVATION = {
    "activation_rate": "Buyers with ≥1 purchase in first 7 days / new_buyers",
    "time_to_first_purchase": "Median hours from signup to first purchase",
    "aov_first_purchase": "Average order value on first purchase"
}

DEMAND_RETENTION = {
    "repeat_purchase_rate": "Buyers with ≥2 purchases / Total buyers",
    "purchase_frequency": "Orders per buyer per year",
    "cohort_retention": "Retention curves by acquisition month",
    "ltv_demand": "Sum of discounted future contribution margin per buyer",
    "cross_category_penetration": "Categories purchased per buyer"
}
```

### Engagement

```python
DEMAND_ENGAGEMENT = {
    "sessions_per_buyer": "Monthly sessions / Monthly active buyers",
    "searches_per_session": "Searches / Sessions",
    "conversion_rate": "Purchases / Sessions",
    "cart_abandonment": "Carts created / Checkouts started",
    "wishlist_adoption": "Buyers with ≥1 wishlist item / Active buyers",
    "review_rate": "Reviews written / Delivered orders"
}
```

---

## 5. Liquidity Metrics

### Core Liquidity

```python
LIQUIDITY_METRICS = {
    # Buyer-side liquidity
    "search_fill_rate": "Searches with ≥1 click / Total searches",
    "click_to_purchase": "Purchases / Listing clicks",
    "search_to_purchase": "Purchases / Searches",
    "time_to_purchase": "Median time from first search to purchase",
    
    # Seller-side liquidity
    "listing_fill_rate": "Listings with ≥1 sale in 30 days / Active listings",
    "time_to_first_sale": "Median days from listing to first sale",
    "sell_through_rate": "Units sold / Units listed",
    
    # Market-level
    "match_rate": "Matches (transactions) / (Buyer searches × Seller listings)",
    "market_depth": "Active listings per active buyer",
    "concentration": "Top 10% sellers GMV share / Total GMV"
}
```

### Liquidity Health Dashboard

```python
def liquidity_health_score() -> LiquidityScore:
    """Composite liquidity health 0-100."""
    
    components = {
        "buyer_liquidity": weighted_average([
            (search_fill_rate, 0.3),
            (click_to_purchase, 0.3),
            (search_to_purchase, 0.4)
        ]),
        "seller_liquidity": weighted_average([
            (listing_fill_rate, 0.4),
            (time_to_first_sale_inverse, 0.3),
            (sell_through_rate, 0.3)
        ]),
        "market_balance": weighted_average([
            (market_depth_score, 0.5),
            (concentration_score, 0.5)
        ])
    }
    
    return LiquidityScore(
        overall=sum(c * w for c, w in [
            (components["buyer_liquidity"], 0.4),
            (components["seller_liquidity"], 0.4),
            (components["market_balance"], 0.2)
        ]),
        components=components,
        trend=compare_to_prior_period(components)
    )
```

---

## 6. Trust & Safety Metrics

```python
TRUST_SAFETY = {
    # Fraud
    "fraud_rate": "Fraudulent transactions / Total transactions",
    "chargeback_rate": "Chargebacks / Total transactions",
    "account_takeover_rate": "ATO incidents / Active accounts",
    
    # Disputes
    "dispute_rate": "Disputes / Transactions",
    "dispute_resolution_time": "Median hours to resolve",
    "buyer_win_rate": "Buyer-favorable resolutions / Total resolved",
    "seller_win_rate": "Seller-favorable resolutions / Total resolved",
    
    # Quality
    "not_as_described_rate": "NAD disputes / Transactions",
    "item_not_received_rate": "INR disputes / Transactions",
    "counterfeit_rate": "Confirmed counterfeit / Transactions (authenticated categories)",
    
    # Moderation
    "content_moderation_queue": "Items pending review",
    "moderation_accuracy": "Correct decisions / Total reviewed",
    "false_positive_rate": "Legitimate items rejected / Total rejected",
    
    # Trust perception
    "trust_nps": "NPS on 'I trust this marketplace'",
    "safety_perception": "Survey: 'I feel safe transacting here'"
}
```

---

## 7. Unit Economics

### Supply-Side Unit Economics

```python
@dataclass
class SupplyUnitEconomics:
    seller_id: str
    period: str  # monthly
    
    # Revenue (to marketplace)
    gmv: float
    take_rate: float
    marketplace_revenue: float  # gmv * take_rate
    
    # Variable Costs
    payment_processing: float
    shipping_subsidy: float
    promotion_cost: float
    support_cost: float
    
    # Fixed Costs (allocated)
    acquisition_amortized: float  # CAC / expected_months
    onboarding_cost: float
    platform_cost: float  # Infra, tools per seller
    
    @property
    def contribution_margin(self) -> float:
        return (self.marketplace_revenue 
                - self.payment_processing
                - self.shipping_subsidy
                - self.promotion_cost
                - self.support_cost)
    
    @property
    def full_margin(self) -> float:
        return (self.contribution_margin
                - self.acquisition_amortized
                - self.onboarding_cost
                - self.platform_cost)
    
    @property
    def payback_months(self) -> float:
        cac = self.acquisition_amortized * self.expected_months
        monthly_margin = self.contribution_margin
        return cac / monthly_margin if monthly_margin > 0 else float('inf')
    
    @property
    def ltv_cac_ratio(self) -> float:
        ltv = sum(
            self.full_margin * (retention_rate ** month)
            for month in range(1, self.expected_lifetime_months)
        )
        return ltv / (self.acquisition_amortized * self.expected_months)
```

### Demand-Side Unit Economics

```python
@dataclass
class DemandUnitEconomics:
    buyer_id: str
    period: str
    
    # Revenue
    gmv: float
    take_rate: float
    marketplace_revenue: float
    
    # Variable Costs
    payment_processing: float
    acquisition_marketing: float  # Attributable to this buyer
    retention_marketing: float
    support_cost: float
    refund_chargeback_cost: float
    
    @property
    def contribution_margin(self) -> float:
        return (self.marketplace_revenue
                - self.payment_processing
                - self.acquisition_marketing
                - self.retention_marketing
                - self.support_cost
                - self.refund_chargeback_cost)
    
    @property
    def ltv(self) -> float:
        """Cohort-based LTV projection."""
        return self.project_ltv(cohort=self.buyer_cohort)
    
    @property
    def cac_payback_months(self) -> float:
        cac = self.get_cac(self.buyer_cohort)
        monthly_margin = self.contribution_margin
        return cac / monthly_margin if monthly_margin > 0 else float('inf')
```

### Blended Marketplace Economics

```python
@dataclass
class MarketplaceUnitEconomics:
    period: str
    
    # Supply side
    supply_revenue: float
    supply_variable_costs: float
    supply_fixed_costs: float
    supply_contribution: float
    active_sellers: int
    
    # Demand side
    demand_revenue: float
    demand_variable_costs: float
    demand_fixed_costs: float
    demand_contribution: float
    active_buyers: int
    
    # Platform
    platform_revenue: float  # Ads, subscriptions, financial services
    platform_costs: float
    
    # Corporate
    corporate_costs: float  # G&A, R&D, etc.
    
    @property
    def total_revenue(self) -> float:
        return self.supply_revenue + self.demand_revenue + self.platform_revenue
    
    @property
    def total_contribution(self) -> float:
        return (self.supply_contribution + self.demand_contribution 
                + self.platform_revenue - self.platform_costs)
    
    @property
    def contribution_margin_pct(self) -> float:
        return self.total_contribution / self.total_revenue
    
    @property
    def ebitda(self) -> float:
        return self.total_contribution - self.corporate_costs
    
    @property
    def ebitda_margin(self) -> float:
        return self.ebitda / self.total_revenue
    
    @property
    def rule_of_40(self) -> float:
        """Growth % + EBITDA margin %"""
        yoy_growth = self.get_yoy_growth()
        return yoy_growth + self.ebitda_margin * 100
```

---

## 8. Cohort Analysis Framework

### Retention Cohorts

```python
class CohortAnalyzer:
    def build_retention_matrix(self, 
                               entity_type: str,  # "buyer" or "seller"
                               metric: str,       # "retention", "gmv", "orders"
                               interval: str = "monthly") -> CohortMatrix:
        """
        Returns matrix:
                    Month 0  Month 1  Month 2  Month 3 ...
        Cohort Jan     100%     45%      32%      28%
        Cohort Feb     100%     48%      35%      --
        Cohort Mar     100%     50%      --       --
        """
        pass
    
    def analyze_cohort_trends(self, matrix: CohortMatrix) -> CohortTrends:
        return CohortTrends(
            # Are newer cohorts better/worse?
            retention_trend=self.calculate_trend(matrix, "retention"),
            gmv_trend=self.calculate_trend(matrix, "gmv"),
            
            # Key comparisons
            month_1_retention_by_cohort=matrix.get_column("Month 1"),
            month_3_retention_by_cohort=matrix.get_column("Month 3"),
            month_12_retention_by_cohort=matrix.get_column("Month 12"),
            
            # Plateau detection
            plateau_month=self.detect_plateau(matrix),
            long_term_retention=self.estimate_long_term(matrix)
        )
```

### LTV by Cohort

```python
def calculate_ltv_by_cohort(cohort: Cohort) -> LTVProjection:
    # 1. Historical data
    historical = get_cohort_history(cohort)
    
    # 2. Fit survival curve
    survival_model = fit_weibull(historical.retention)
    
    # 3. Fit spending curve
    spending_model = fit_power_law(historical.gmv_per_retained)
    
    # 4. Project
    projection = []
    for month in range(1, 37):  # 3 years
        retention = survival_model.predict(month)
        gmv_per_retained = spending_model.predict(month)
        projected_gmv = retention * gmv_per_retained * cohort.size
        projected_margin = projected_gmv * take_rate * contribution_margin_rate
        projection.append(MonthlyProjection(month, retention, gmv_per_retained, 
                                          projected_gmv, projected_margin))
    
    # 5. Discount
    discount_rate = 0.15 / 12  # Monthly
    ltv = sum(p.projected_margin / (1 + discount_rate) ** p.month 
              for p in projection)
    
    return LTVProjection(
        cohort=cohort,
        ltv=ltv,
        payback_month=next(p.month for p in projection 
                          if sum(x.projected_margin for x in projection[:p.month]) > cohort.cac),
        projection=projection,
        confidence_interval=bootstrap_confidence(projection)
    )
```

---

## 9. Experimentation Framework

### Experiment Design

```python
@dataclass
class ExperimentDesign:
    name: str
    hypothesis: str
    
    # Metrics
    primary_metric: MetricDefinition
    guardrail_metrics: List[MetricDefinition]
    
    # Population
    population: PopulationDefinition
    randomization_unit: str  # "user", "session", "search", "listing"
    
    # Variants
    control: Variant
    treatment: List[Variant]
    traffic_split: Dict[str, float]
    
    # Power
    minimum_detectable_effect: float
    significance_level: float = 0.05
    power: float = 0.8
    
    # Duration
    min_duration_days: int
    max_duration_days: int
    
    def sample_size(self) -> int:
        """Calculate required sample size per variant."""
        return power_analysis(
            baseline=self.primary_metric.baseline,
            mde=self.minimum_detectable_effect,
            alpha=self.significance_level,
            power=self.power,
            randomization_unit=self.randomization_unit
        )
```

### Sequential Testing

```python
class SequentialTester:
    """Always-valid p-values for continuous monitoring."""
    
    def __init__(self, alpha: float = 0.05):
        self.alpha = alpha
        self.boundary = self._spending_function()  # Alpha spending
    
    def check_significance(self, 
                          control_data: List[float], 
                          treatment_data: List[float],
                          day: int) -> TestResult:
        """Check if experiment can stop early."""
        # Compute test statistic
        stat = self.compute_statistic(control_data, treatment_data)
        
        # Get boundary for this day
        boundary = self.boundary[day]
        
        if abs(stat) > boundary:
            return TestResult(
                significant=True,
                p_value=self.compute_p_value(stat),
                decision="reject_null" if stat > 0 else "reject_alternative"
            )
        else:
            return TestResult(
                significant=False,
                p_value=self.compute_p_value(stat),
                decision="continue"
            )
```

### Experiment Health Checks

```python
EXPERIMENT_GUARDRAILS = {
    "sample_ratio_mismatch": {
        "check": "Chi-square test of variant proportions",
        "threshold": "p < 0.001",
        "action": "Halt experiment, investigate randomization"
    },
    "novelty_effect": {
        "check": "Treatment effect in first 3 days vs days 4-7",
        "threshold": "> 50% decay",
        "action": "Extend minimum duration"
    },
    "network_effects": {
        "check": "Cross-variant contamination (buyer in treatment, seller in control)",
        "threshold": "> 5% contaminated transactions",
        "action": "Switch to cluster randomization"
    },
    "seasonality": {
        "check": "A/A test running in parallel",
        "threshold": "A/A p < 0.05",
        "action": "Invalidate results"
    }
}
```

---

## 10. Analytics Infrastructure

### Data Architecture

```python
ANALYTICS_STACK = {
    "event_collection": {
        "web": "Segment / Snowplow / RudderStack",
        "mobile": "Same + Amplitude / Mixpanel",
        "server": "Direct to Kafka / Kinesis"
    },
    "stream_processing": {
        "real_time": "Flink / Spark Streaming / Materialize",
        "use_cases": ["Real-time dashboards", "Fraud detection", "Personalization"]
    },
    "data_lake": {
        "storage": "S3 / GCS / ADLS (Parquet, Delta Lake)",
        "format": "Apache Iceberg / Delta Lake / Hudi",
        "partitioning": "Event date, event type, country"
    },
    "warehouse": {
        "primary": "Snowflake / BigQuery / Redshift / ClickHouse",
        "modeling": "dbt (staging → intermediate → marts)",
        "semantic_layer": "dbt metrics / LookML / Cube.dev"
    },
    "bi_tools": {
        "dashboards": "Looker / Tableau / Metabase / Superset",
        "exploration": "Hex / Deepnote / Jupyter",
        "embedding": "Embedded analytics in seller/buyer portals"
    },
    "ml_platform": {
        "feature_store": "Feast / Tecton / Hopsworks",
        "training": "Vertex AI / SageMaker / Databricks / MLflow",
        "serving": "Seldon / KServe / Triton / Custom"
    }
}
```

### Key Data Models

```sql
-- Fact table: transactions
CREATE TABLE fact_transactions (
    transaction_id UUID PRIMARY KEY,
    date_id DATE,
    buyer_id UUID,
    seller_id UUID,
    listing_id UUID,
    category_id UUID,
    country_id UUID,
    gmv_cents BIGINT,
    take_rate_bps INTEGER,
    revenue_cents BIGINT,
    payment_method VARCHAR,
    fulfillment_type VARCHAR,
    is_first_purchase_buyer BOOLEAN,
    is_first_sale_seller BOOLEAN,
    dispute_status VARCHAR,
    created_at TIMESTAMP
) PARTITION BY date_id;

-- Fact table: daily snapshots
CREATE TABLE fact_daily_seller_metrics (
    date_id DATE,
    seller_id UUID,
    active_listings INTEGER,
    orders_received INTEGER,
    orders_fulfilled INTEGER,
    gmv_cents BIGINT,
    revenue_cents BIGINT,
    rating DECIMAL(3,2),
    response_time_hours DECIMAL(5,2),
    PRIMARY KEY (date_id, seller_id)
) PARTITION BY date_id;

-- Dimension: sellers (SCD Type 2)
CREATE TABLE dim_sellers (
    seller_id UUID,
    valid_from DATE,
    valid_to DATE,
    is_current BOOLEAN,
    segment VARCHAR,  -- hobbyist, professional, power, enterprise
    acquisition_channel VARCHAR,
    acquisition_date DATE,
    verification_tier VARCHAR,
    categories_active VARCHAR[],
    PRIMARY KEY (seller_id, valid_from)
);
```

---

## 11. Dashboard Design Principles

### Executive Dashboard (Daily)

```python
EXECUTIVE_DASHBOARD = {
    "north_star": {
        "metric": "Liquidity-Adjusted GMV",
        "current": "Today's value",
        "wow": "Week-over-week change",
        "mom": "Month-over-month change",
        "yoy": "Year-over-year change"
    },
    "health_summary": {
        "supply_health": "Green/Yellow/Red",
        "demand_health": "Green/Yellow/Red",
        "liquidity": "Green/Yellow/Red",
        "trust": "Green/Yellow/Red",
        "economics": "Green/Yellow/Red"
    },
    "key_metrics": [
        {"name": "GMV", "value": "$X.M", "trend": "sparkline"},
        {"name": "Revenue", "value": "$X.M", "trend": "sparkline"},
        {"name": "Active Buyers", "value": "X.M", "trend": "sparkline"},
        {"name": "Active Sellers", "value": "X.K", "trend": "sparkline"},
        {"name": "Take Rate", "value": "X%", "trend": "sparkline"},
        {"name": "Contribution Margin", "value": "X%", "trend": "sparkline"}
    ],
    "alerts": [
        "Any metric Red",
        "Any metric > 2σ from trend",
        "Experiment guardrail triggered"
    ]
}
```

### Team Dashboards

```python
TEAM_DASHBOARDS = {
    "supply_growth": {
        "focus": "Seller acquisition, activation, retention",
        "metrics": ["New verified sellers", "Activation rate", "CAC", "LTV/CAC",
                   "Time to first sale", "Listing quality score"]
    },
    "demand_growth": {
        "focus": "Buyer acquisition, conversion, retention",
        "metrics": ["New buyers", "First purchase rate", "CAC", "LTV/CAC",
                   "Repeat rate", "AOV", "Conversion funnel"]
    },
    "product_search": {
        "focus": "Search relevance, discovery, conversion",
        "metrics": ["Search fill rate", "Click-through rate", "Conversion rate",
                   "Zero result rate", "NDCG", "Personalization lift"]
    },
    "trust_safety": {
        "focus": "Fraud, disputes, moderation",
        "metrics": ["Fraud rate", "Chargeback rate", "Dispute rate", 
                   "Resolution time", "Moderation queue", "Trust NPS"]
    },
    "marketplace_operations": {
        "focus": "Day-to-day health, support, logistics",
        "metrics": ["Support volume", "SLA compliance", "Shipping performance",
                   "Return rate", "Policy violations", "Queue depths"]
    }
}
```

---

## Summary

1. **North Star** must balance both sides - Liquidity-Adjusted GMV
2. **Metric hierarchy** prevents dashboard overload
3. **Supply & demand metrics** mirror each other but measure different things
4. **Liquidity metrics** are the marketplace-specific vital signs
5. **Unit economics** must work per cohort, not just blended
6. **Cohort analysis** reveals true trajectory vs. aggregate noise
7. **Experimentation** requires guardrails for network effects
8. **Infrastructure** must support real-time + batch + ML

---

## Next Chapter: Regulatory, Legal, and Compliance

We'll cover the regulatory landscape: consumer protection, antitrust, data privacy, tax, labor classification, and building compliance into product.