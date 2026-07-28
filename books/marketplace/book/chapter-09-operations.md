# Chapter 9: Operations and Marketplace Management

## The Operational Reality

> "Marketplaces are operations businesses with a tech layer, not tech businesses with an ops layer."

Once the platform is live, the real work begins: managing supply, stimulating demand, ensuring trust, and keeping the flywheel spinning. This chapter covers the operational machinery that keeps a marketplace healthy.

---

## 1. Supply Operations

### Supply Management Framework

```python
class SupplyOperations:
    def __init__(self):
        self.acquisition = SupplyAcquisition()
        self.onboarding = SupplyOnboarding()
        self.quality = SupplyQuality()
        self.retention = SupplyRetention()
        self.growth = SupplyGrowth()
    
    def daily_operations(self) -> DailyOpsReport:
        return DailyOpsReport(
            # Acquisition
            new_applications=self.acquisition.get_applications_today(),
            approved=self.acquisition.get_approved_today(),
            rejected=self.acquisition.get_rejected_today(),
            cac_by_channel=self.acquisition.get_cac_by_channel(),
            
            # Onboarding
            in_onboarding=self.onboarding.get_in_progress(),
            activated_today=self.onboarding.get_activated_today(),
            avg_time_to_activate=self.onboarding.get_avg_time_to_activate(),
            drop_off_points=self.onboarding.get_drop_off_points(),
            
            # Quality
            quality_reviews=self.quality.get_reviews_today(),
            suspensions=self.quality.get_suspensions_today(),
            reinstatements=self.quality.get_reinstatements_today(),
            quality_score_distribution=self.quality.get_score_distribution(),
            
            # Retention
            at_risk_count=self.retention.get_at_risk_count(),
            churned_today=self.retention.get_churned_today(),
            winbacks_initiated=self.retention.get_winbacks_initiated(),
            
            # Growth
            gmv_by_segment=self.growth.get_gmv_by_segment(),
            new_listings=self.growth.get_new_listings(),
            feature_adoption=self.growth.get_feature_adoption()
        )
```

### Seller Support Tiers

```python
SELLER_SUPPORT_TIERS = {
    "self_serve": {
        "eligibility": "All sellers",
        "channels": ["Help center", "Community forum", "Chatbot"],
        "sla": "24h response",
        "team_ratio": "1:10,000 sellers"
    },
    "email_support": {
        "eligibility": ">$1k GMV/mo OR >6 months tenure",
        "channels": ["Email", "Ticket system"],
        "sla": "12h response",
        "team_ratio": "1:1,000 sellers"
    },
    "phone_chat": {
        "eligibility": ">$10k GMV/mo OR Power Seller badge",
        "channels": ["Phone", "Live chat", "Email"],
        "sla": "4h response",
        "team_ratio": "1:200 sellers"
    },
    "dedicated": {
        "eligibility": ">$100k GMV/mo OR Strategic partner",
        "channels": ["Dedicated manager", "Slack", "Phone", "Quarterly reviews"],
        "sla": "1h response",
        "team_ratio": "1:20 sellers"
    }
}
```

### Supply Quality Operations

```python
class SupplyQualityOps:
    def __init__(self):
        self.review_queue = ReviewQueue()
        self.auto_moderation = AutoModeration()
        self.appeals = AppealsProcess()
    
    def daily_quality_review(self):
        # 1. Auto-moderation handles 80%+
        auto_results = self.auto_moderation.process_pending()
        
        # 2. Human review for edge cases
        human_queue = self.review_queue.get_pending(
            priority=["high_risk", "appeals", "new_seller_first_listing"]
        )
        
        for item in human_queue:
            decision = self.reviewer.review(item)
            self.apply_decision(item, decision)
        
        # 3. Process appeals
        appeals = self.appeals.get_pending()
        for appeal in appeals:
            decision = self.appeals_reviewer.review(appeal)
            self.apply_appeal_decision(appeal, decision)
        
        # 4. Quality trends
        self.analyze_trends()
    
    def analyze_trends(self):
        trends = QualityTrends(
            violation_rate_by_category=self.get_violation_rate_by_category(),
            violation_rate_by_seller_segment=self.get_violation_rate_by_segment(),
            auto_mod_accuracy=self.auto_moderation.get_accuracy(),
            appeal_overturn_rate=self.appeals.get_overturn_rate(),
            time_to_review=self.review_queue.get_avg_time()
        )
        
        if trends.violation_rate_by_category.get("electronics", 0) > 0.05:
            self.alert_team("High violation rate in electronics", trends)
```

---

## 2. Demand Operations

### Demand Generation Operations

```python
class DemandOperations:
    def __init__(self):
        self.acquisition = DemandAcquisition()
        self.conversion = ConversionOptimization()
        self.retention = DemandRetention()
        self.reactivation = Reactivation()
    
    def weekly_demand_review(self) -> WeeklyDemandReport:
        return WeeklyDemandReport(
            # Acquisition
            new_buyers=self.acquisition.get_new_buyers_week(),
            cac_blended=self.acquisition.get_blended_cac(),
            cac_by_channel=self.acquisition.get_cac_by_channel(),
            roas_by_campaign=self.acquisition.get_roas_by_campaign(),
            
            # Conversion
            visit_to_purchase=self.conversion.get_visit_to_purchase(),
            cart_abandonment=self.conversion.get_cart_abandonment(),
            checkout_completion=self.conversion.get_checkout_completion(),
            top_drop_off_points=self.conversion.get_drop_off_points(),
            
            # Retention
            repeat_rate_30d=self.retention.get_repeat_rate(30),
            repeat_rate_90d=self.retention.get_repeat_rate(90),
            cohort_retention=self.retention.get_cohort_retention(),
            ltv_by_cohort=self.retention.get_ltv_by_cohort(),
            
            # Reactivation
            winback_campaigns=self.reactivation.get_active_campaigns(),
            reactivated_buyers=self.reactivation.get_reactivated_count(),
            winback_roi=self.reactivation.get_roi()
        )
```

### Promotional Calendar Operations

```python
class PromotionalCalendar:
    def __init__(self):
        self.calendar = PromotionalCalendarStore()
        self.conflict_checker = ConflictChecker()
    
    def plan_quarter(self, quarter: str) -> PromotionalPlan:
        # 1. Major events (fixed)
        fixed_events = [
            Event("New Year", "jan", discount="sitewide_15"),
            Event("Valentine's", "feb", category="gifts"),
            Event("Spring Sale", "mar", discount="category_20"),
            Event("Mother's Day", "may", category="home_garden"),
            Event("Summer Sale", "jun", discount="sitewide_20"),
            Event("Back to School", "aug", category="electronics"),
            Event("Black Friday", "nov", discount="sitewide_30"),
            Event("Cyber Monday", "nov", discount="sitewide_25"),
            Event("Holiday Sale", "dec", discount="sitewide_20")
        ]
        
        # 2. Category-specific promotions
        category_promos = self.plan_category_promotions(quarter)
        
        # 3. Seller-funded promotions
        seller_promos = self.coordinate_seller_promotions(quarter)
        
        # 4. Check conflicts
        all_events = fixed_events + category_promos + seller_promos
        conflicts = self.conflict_checker.check(all_events)
        
        return PromotionalPlan(
            events=all_events,
            conflicts=conflicts,
            budget=self.calculate_budget(all_events),
            expected_lift=self.estimate_lift(all_events)
        )
```

---

## 3. Trust & Safety Operations

### Content Moderation at Scale

```python
class TrustSafetyOperations:
    def __init__(self):
        self.moderation = ModerationPipeline()
        self.investigations = InvestigationsTeam()
        self.policy = PolicyTeam()
        self.law_enforcement = LawEnforcementLiaison()
    
    def daily_moderation_volume(self) -> ModerationReport:
        return ModerationReport(
            # Volume
            listings_reviewed=self.moderation.get_reviewed_today(),
            listings_actioned=self.moderation.get_actioned_today(),
            users_actioned=self.moderation.get_users_actioned_today(),
            
            # By category
            by_violation_type=self.moderation.get_by_violation_type(),
            by_category=self.moderation.get_by_category(),
            by_region=self.moderation.get_by_region(),
            
            # Accuracy
            precision=self.moderation.get_precision(),
            recall=self.moderation.get_recall(),
            appeal_rate=self.moderation.get_appeal_rate(),
            overturn_rate=self.moderation.get_overturn_rate(),
            
            # Speed
            median_review_time=self.moderation.get_median_review_time(),
            sla_compliance=self.moderation.get_sla_compliance(),
            
            # Investigations
            active_investigations=self.investigations.get_active_count(),
            completed_investigations=self.investigations.get_completed_today(),
            law_enforcement_requests=self.law_enforcement.get_requests_today()
        )
```

### Policy Enforcement Framework

```python
class PolicyEnforcement:
    VIOLATION_SEVERITY = {
        "critical": {
            "examples": ["CSAM", "terrorism", "human_trafficking", "illegal_weapons"],
            "action": "immediate_ban + law_enforcement_report",
            "appeal": "not_available",
            "sla": "15 minutes"
        },
        "high": {
            "examples": ["counterfeit", "stolen_goods", "drugs", "weapons", "hate_speech"],
            "action": "immediate_removal + account_suspension",
            "appeal": "available_with_evidence",
            "sla": "1 hour"
        },
        "medium": {
            "examples": ["misleading_listing", "prohibited_category", "ip_infringement", "spam"],
            "action": "removal + warning",
            "appeal": "available",
            "sla": "4 hours"
        },
        "low": {
            "examples": ["poor_photos", "incomplete_description", "wrong_category", "keyword_stuffing"],
            "action": "suppression + coaching",
            "appeal": "self_service",
            "sla": "24 hours"
        }
    }
    
    def enforce(self, violation: Violation) -> EnforcementAction:
        severity = self.classify_severity(violation)
        policy = self.VIOLATION_SEVERITY[severity]
        
        action = EnforcementAction(
            listing_action=policy["action"].split(" + ")[0],
            account_action=policy["action"].split(" + ")[1] if " + " in policy["action"] else None,
            appeal_available=policy["appeal"] != "not_available",
            sla=policy["sla"]
        )
        
        self.execute(action, violation)
        return action
```

---

## 4. Customer Support Operations

### Support Ticket Management

```python
class SupportOperations:
    def __init__(self):
        self.routing = TicketRouter()
        self.knowledge_base = KnowledgeBase()
        self.qa = QualityAssurance()
    
    def daily_support_metrics(self) -> SupportMetrics:
        return SupportMetrics(
            # Volume
            tickets_created=self.get_tickets_created_today(),
            tickets_resolved=self.get_tickets_resolved_today(),
            backlog=self.get_backlog(),
            
            # By channel
            by_channel=self.get_by_channel(),
            
            # By category
            by_category=self.get_by_category(),
            
            # By user type
            by_user_type=self.get_by_user_type(),
            
            # Performance
            first_response_time=self.get_first_response_time(),
            resolution_time=self.get_resolution_time(),
            first_contact_resolution=self.get_fcr(),
            csat=self.get_csat(),
            
            # Quality
            qa_score=self.qa.get_avg_score(),
            coaching_sessions=self.qa.get_coaching_sessions(),
            
            # Automation
            bot_deflection_rate=self.get_bot_deflection(),
            self_service_rate=self.get_self_service_rate()
        )
```

### Escalation Matrix

```python
ESCALATION_MATRIX = {
    "tier_1": {
        "scope": "Standard issues (orders, returns, account, payments)",
        "team": "Frontline support",
        "empowerment": "Refunds up to $100, return labels, account fixes",
        "escalation_triggers": [
            "Customer requests supervisor",
            "Refund > $100",
            "Legal threat",
            "Media inquiry",
            "Safety issue"
        ]
    },
    "tier_2": {
        "scope": "Complex issues, exceptions, seller disputes",
        "team": "Senior support / Specialists",
        "empowerment": "Refunds up to $1,000, policy exceptions, account reinstatement",
        "escalation_triggers": [
            "Regulatory complaint",
            "High-value dispute (>$10k)",
            "Pattern of similar issues",
            "Executive escalation"
        ]
    },
    "tier_3": {
        "scope": "Legal, regulatory, PR, safety, executive",
        "team": "Legal / Trust & Safety / Executive team",
        "empowerment": "Full authority",
        "escalation_triggers": [
            "Law enforcement request",
            "Regulatory inquiry",
            "Media crisis",
            "Safety incident"
        ]
    }
}
```

---

## 5. Marketplace Health Monitoring

### Real-time Health Dashboard

```python
class MarketplaceHealthMonitor:
    def __init__(self):
        self.metrics = HealthMetricsCollector()
        self.alerts = AlertManager()
    
    def get_real_time_health(self) -> HealthStatus:
        metrics = self.metrics.get_current()
        
        # Core health indicators
        health = HealthStatus(
            # Liquidity
            fill_rate=metrics.fill_rate,
            time_to_match=metrics.time_to_match,
            search_to_fill=metrics.search_to_fill,
            
            # Growth
            gmv_current_hour=metrics.gmv_current_hour,
            gmv_vs_forecast=metrics.gmv_vs_forecast,
            new_suppliers=metrics.new_suppliers_today,
            new_buyers=metrics.new_buyers_today,
            
            # Quality
            dispute_rate=metrics.dispute_rate,
            cancellation_rate=metrics.cancellation_rate,
            nps_buyer=metrics.nps_buyer,
            nps_seller=metrics.nps_seller,
            
            # Technical
            api_latency_p99=metrics.api_latency_p99,
            error_rate=metrics.error_rate,
            uptime=metrics.uptime,
            
            # Financial
            take_rate=metrics.take_rate,
            revenue_per_transaction=metrics.revenue_per_transaction,
            cac_payback=metrics.cac_payback
        )
        
        # Check alerts
        self.check_alerts(health)
        
        return health
    
    def check_alerts(self, health: HealthStatus):
        alerts = []
        
        if health.fill_rate < 0.6:
            alerts.append(Alert("LOW_LIQUIDITY", "Fill rate below 60%", "critical"))
        
        if health.dispute_rate > 0.05:
            alerts.append(Alert("HIGH_DISPUTES", "Dispute rate above 5%", "warning"))
        
        if health.api_latency_p99 > 1000:
            alerts.append(Alert("HIGH_LATENCY", "P99 latency > 1s", "warning"))
        
        if health.gmv_vs_forecast < 0.8:
            alerts.append(Alert("GMV_MISS", "GMV tracking 20% below forecast", "warning"))
        
        for alert in alerts:
            self.alerts.fire(alert)
```

### Weekly Business Review (WBR)

```python
class WeeklyBusinessReview:
    def generate_wbr(self, week_ending: date) -> WBRDocument:
        return WBRDocument(
            week_ending=week_ending,
            
            # Executive Summary
            executive_summary=self.write_executive_summary(week_ending),
            
            # Key Metrics
            key_metrics=WBRMetrics(
                gmv=self.get_gmv(week_ending),
                revenue=self.get_revenue(week_ending),
                take_rate=self.get_take_rate(week_ending),
                buyers=self.get_active_buyers(week_ending),
                sellers=self.get_active_sellers(week_ending),
                orders=self.get_orders(week_ending),
                aov=self.get_aov(week_ending)
            ),
            
            # Deep Dives (rotating)
            deep_dive=self.get_deep_dive_topic(week_ending),
            
            # Experiments
            experiments=self.get_experiment_results(week_ending),
            
            # Operational Health
            ops_health=self.get_ops_health(week_ending),
            
            # Strategic Initiatives
            initiatives=self.get_initiative_updates(week_ending),
            
            # Risks & Opportunities
            risks=self.get_risks(week_ending),
            opportunities=self.get_opportunities(week_ending)
        )
    
    DEEP_DIVE_ROTATION = [
        "Supply acquisition efficiency",
        "Demand retention cohorts",
        "Search ranking performance",
        "Trust & safety trends",
        "Pricing & take rate optimization",
        "International expansion",
        "New category launch",
        "Mobile app performance",
        "Seller tool adoption",
        "Payment success rates"
    ]
```

---

## 6. Incident Management

### Incident Response Process

```python
class IncidentManager:
    SEVERITY = {
        "SEV-1": {
            "definition": "Platform down, payments failing, data breach",
            "response_time": "5 minutes",
            "communication": "All-hands + status page + customer email",
            "escalation": "CTO + CEO + Legal"
        },
        "SEV-2": {
            "definition": "Major feature down, search broken, checkout issues",
            "response_time": "15 minutes",
            "communication": "Engineering + Product + Status page",
            "escalation": "Engineering Director + Product Director"
        },
        "SEV-3": {
            "definition": "Minor feature degraded, performance issues",
            "response_time": "1 hour",
            "communication": "Team channel",
            "escalation": "Team Lead"
        },
        "SEV-4": {
            "definition": "Low impact, cosmetic, non-urgent",
            "response_time": "Next business day",
            "communication": "Ticket only",
            "escalation": "None"
        }
    }
    
    def declare_incident(self, severity: str, title: str, description: str) -> Incident:
        incident = Incident(
            severity=severity,
            title=title,
            description=description,
            declared_at=datetime.now(),
            declared_by=get_current_user(),
            status="investigating"
        )
        
        # Auto-assign based on severity
        incident.assigned_team = self.get_oncall_team(severity)
        incident.communication_channel = self.create_channel(incident)
        
        # Notify stakeholders
        self.notify_stakeholders(incident)
        
        return incident
    
    def run_incident_retro(self, incident: Incident) -> Retrospective:
        """Blameless postmortem."""
        return Retrospective(
            incident=incident,
            timeline=self.build_timeline(incident),
            root_cause=self.analyze_root_cause(incident),
            impact=self.assess_impact(incident),
            action_items=self.generate_action_items(incident),
            prevention=self.plan_prevention(incident)
        )
```

---

## 7. Vendor & Partner Management

### Key Vendor Relationships

```python
VENDOR_CATEGORIES = {
    "payment_processors": {
        "primary": "Stripe / Adyen",
        "backup": "Braintree / Worldpay",
        "metrics": ["success_rate", "latency", "fee_bps", "dispute_rate"],
        "contract": "Volume discounts, dedicated support, SLA"
    },
    "cloud_infrastructure": {
        "primary": "AWS / GCP",
        "backup": "Multi-cloud strategy",
        "metrics": ["uptime", "cost_per_transaction", "latency"],
        "contract": "Enterprise agreement, committed spend"
    },
    "identity_verification": {
        "primary": "Persona / Veriff / Onfido",
        "backup": "Multiple providers for redundancy",
        "metrics": ["verification_rate", "accuracy", "latency", "cost"],
        "contract": "Per-verification pricing, volume tiers"
    },
    "shipping_logistics": {
        "primary": "Shippo / EasyPost / direct carrier",
        "backup": "Multiple carriers",
        "metrics": ["delivery_rate", "on_time", "cost", "tracking_accuracy"],
        "contract": "Negotiated rates, volume commitments"
    },
    "customer_support": {
        "primary": "In-house + BPO",
        "backup": "Overflow BPO",
        "metrics": ["csat", "fcr", "response_time", "cost_per_ticket"],
        "contract": "Per-ticket or dedicated team"
    }
}
```

---

## Summary

1. **Operations is the product** - Marketplace success is won in daily ops
2. **Segment support by value** - Self-serve → Dedicated based on GMV
3. **Quality scales with automation** - Auto-moderation + human review for edges
4. **Health monitoring must be real-time** - Dashboards, alerts, WBRs
5. **Incident response needs structure** - Severity levels, comms, retrospectives
6. **Vendor management is strategic** - Redundancy, SLAs, volume leverage

---

## Next Chapter: Scaling - From Local to Global

We'll cover geographic expansion, category expansion, platform extensibility, and organizational scaling.