"""Seed the database with sample data for development and demo purposes."""

import asyncio
from datetime import datetime, timedelta
from uuid import uuid4

from backend.storage import get_db_manager, get_db_session
from backend.storage.models import (
    AgentConfig,
    AgentStatus,
    Company,
    CompanyStage,
    Contact,
    EmailLog,
    EmailStatus,
    OutreachCampaign,
    CampaignStatus,
    PipelineDeal,
    CallBooking,
    DealActivity,
)


SAMPLE_AGENTS = [
    {
        "name": "SaaS Hunter",
        "description": "Targets Series A-C SaaS companies hiring engineers",
        "persona": "saas_hunter",
        "specialization": "SaaS Engineering Talent",
        "value_prop": "I place senior engineers at high-growth SaaS companies. My candidates have shipped products at scale.",
        "case_study": "Recently placed a Staff Backend Engineer at a Series B devtools company - they reduced API latency by 40% in month 1.",
        "discovery_industries": ["SaaS", "B2B Software", "DevTools", "API Platforms"],
        "discovery_company_size": "50-500",
        "discovery_hiring_signals": ["engineering", "backend", "platform", "infrastructure", "api"],
        "max_companies_per_run": 50,
        "research_depth": "deep",
        "research_focus_areas": ["tech_stack", "team_structure", "hiring_plan", "scaling_challenges"],
        "outreach_tone": "professional_peer",
        "outreach_daily_limit": 50,
        "outreach_delay_seconds": 30,
        "followup_sequence": "saas_4_touch",
        "scheduler_meeting_type": "discovery_call",
        "scheduler_duration_minutes": 30,
        "status": AgentStatus.ACTIVE,
    },
    {
        "name": "FinTech Recruiter",
        "description": "Targets FinTech companies needing compliant engineering talent",
        "persona": "fintech_recruiter",
        "specialization": "FinTech Engineering & Compliance",
        "value_prop": "I understand the unique hiring challenges in FinTech - regulatory compliance, security, and scale.",
        "case_study": "Placed a Lead Security Engineer at a Series C payments company - they passed SOC2 Type II in 60 days.",
        "discovery_industries": ["FinTech", "Payments", "Banking", "InsurTech", "RegTech"],
        "discovery_company_size": "50-1000",
        "discovery_hiring_signals": ["security", "compliance", "payments", "ledger", "risk", "fraud"],
        "max_companies_per_run": 30,
        "research_depth": "deep",
        "research_focus_areas": ["tech_stack", "compliance_requirements", "team_structure", "regulatory_landscape"],
        "outreach_tone": "executive_brief",
        "outreach_daily_limit": 30,
        "outreach_delay_seconds": 45,
        "followup_sequence": "standard_3_touch",
        "scheduler_meeting_type": "compliance_intro_call",
        "scheduler_duration_minutes": 30,
        "status": AgentStatus.ACTIVE,
    },
    {
        "name": "AI/ML Specialist",
        "description": "Targets AI/ML companies hiring research and applied engineers",
        "persona": "ai_ml_specialist",
        "specialization": "AI/ML Research & Applied Engineering",
        "value_prop": "I work with researchers from top labs and engineers who've deployed LLMs in production.",
        "case_study": "Placed a Senior ML Engineer at a generative AI startup - they optimized inference latency by 3x.",
        "discovery_industries": ["AI/ML", "Generative AI", "LLM Applications", "Computer Vision", "NLP"],
        "discovery_company_size": "10-500",
        "discovery_hiring_signals": ["ml", "llm", "generative", "pytorch", "tensorflow", "transformers", "rag", "fine-tuning"],
        "max_companies_per_run": 25,
        "research_depth": "deep",
        "research_focus_areas": ["tech_stack", "model_architecture", "deployment_infrastructure", "research_vs_applied"],
        "outreach_tone": "professional_peer",
        "outreach_daily_limit": 40,
        "outreach_delay_seconds": 30,
        "followup_sequence": "saas_4_touch",
        "scheduler_meeting_type": "tech_deep_dive",
        "scheduler_duration_minutes": 45,
        "status": AgentStatus.INACTIVE,
    },
]

SAMPLE_COMPANIES = [
    {
        "name": "Vercel",
        "domain": "vercel.com",
        "linkedin_url": "https://linkedin.com/company/vercel",
        "description": "Developers use Vercel to build, preview, and ship web applications.",
        "industry": "Developer Tools",
        "employee_count": 400,
        "employee_count_range": "201-500",
        "headquarters": "San Francisco, CA, US",
        "locations": ["San Francisco, CA", "New York, NY", "Remote"],
        "remote_friendly": True,
        "funding_stage": "Series D",
        "total_funding_usd": 563000000,
        "last_funding_amount_usd": 150000000,
        "investors": ["Andreessen Horowitz", "SV Angel", "Tiger Global"],
        "tech_stack": ["Next.js", "React", "TypeScript", "Rust", "Go", "Edge Functions"],
        "hiring_needs": ["platform engineering", "infrastructure", "developer experience"],
        "open_positions_count": 25,
        "hiring_signals": ["engineering", "platform", "infrastructure"],
        "pain_points": ["Scaling edge infrastructure", "Supporting enterprise customers"],
        "growth_signals": ["Series D funding", "Enterprise growth", "Open source community"],
        "competitors": ["Netlify", "Cloudflare Pages", "AWS Amplify"],
        "stage": CompanyStage.RESEARCHED,
        "confidence_score": 0.9,
    },
    {
        "name": "Supabase",
        "domain": "supabase.com",
        "linkedin_url": "https://linkedin.com/company/supabase",
        "description": "The open source Firebase alternative. Instant APIs, Auth, Realtime, Storage.",
        "industry": "Developer Tools",
        "employee_count": 120,
        "employee_count_range": "51-200",
        "headquarters": "San Francisco, CA, US",
        "locations": ["San Francisco, CA", "Remote"],
        "remote_friendly": True,
        "funding_stage": "Series B",
        "total_funding_usd": 116000000,
        "last_funding_amount_usd": 80000000,
        "investors": ["Felicis Ventures", "Coatue", "Y Combinator"],
        "tech_stack": ["PostgreSQL", "Elixir", "TypeScript", "Deno", "Kubernetes"],
        "hiring_needs": ["backend", "database", "infrastructure"],
        "open_positions_count": 15,
        "hiring_signals": ["engineering", "backend", "database"],
        "pain_points": ["Scaling PostgreSQL", "Enterprise support"],
        "growth_signals": ["Open source growth", "Enterprise customers"],
        "competitors": ["Firebase", "PlanetScale", "Neon"],
        "stage": CompanyStage.CONTACTED,
        "confidence_score": 0.85,
    },
    {
        "name": "Railway",
        "domain": "railway.app",
        "linkedin_url": "https://linkedin.com/company/railwayapp",
        "description": "Infrastructure for deploying apps. Instant deploys, automatic HTTPS, custom domains.",
        "industry": "Developer Tools",
        "employee_count": 45,
        "employee_count_range": "11-50",
        "headquarters": "San Francisco, CA, US",
        "locations": ["San Francisco, CA", "Remote"],
        "remote_friendly": True,
        "funding_stage": "Series A",
        "total_funding_usd": 33000000,
        "last_funding_amount_usd": 25000000,
        "investors": ["Khosla Ventures", "Y Combinator"],
        "tech_stack": ["Go", "TypeScript", "Kubernetes", "Nix", "PostgreSQL"],
        "hiring_needs": ["platform", "infrastructure", "backend"],
        "open_positions_count": 8,
        "hiring_signals": ["engineering", "platform", "infrastructure"],
        "pain_points": ["Scaling container orchestration", "Multi-tenant isolation"],
        "growth_signals": ["Series A funding", "Developer community growth"],
        "competitors": ["Heroku", "Render", "Fly.io"],
        "stage": CompanyStage.REPLIED,
        "confidence_score": 0.8,
    },
    {
        "name": "Retool",
        "domain": "retool.com",
        "linkedin_url": "https://linkedin.com/company/retool",
        "description": "Build internal tools remarkably fast. Drag-and-drop UI builder for business tools.",
        "industry": "SaaS",
        "employee_count": 350,
        "employee_count_range": "201-500",
        "headquarters": "San Francisco, CA, US",
        "locations": ["San Francisco, CA", "New York, NY", "Remote"],
        "remote_friendly": True,
        "funding_stage": "Series C",
        "total_funding_usd": 326000000,
        "last_funding_amount_usd": 45000000,
        "investors": ["Greenoaks Capital", "Coatue", "Sequoia Capital"],
        "tech_stack": ["React", "TypeScript", "Node.js", "PostgreSQL", "Redis", "AWS"],
        "hiring_needs": ["full-stack", "platform", "enterprise"],
        "open_positions_count": 30,
        "hiring_signals": ["engineering", "full-stack", "platform"],
        "pain_points": ["Enterprise security requirements", "Performance at scale"],
        "growth_signals": ["Enterprise customer growth", "International expansion"],
        "competitors": ["Appsmith", "Tooljet", "Budibase"],
        "stage": CompanyStage.CALL_BOOKED,
        "confidence_score": 0.92,
    },
    {
        "name": "Anthropic",
        "domain": "anthropic.com",
        "linkedin_url": "https://linkedin.com/company/anthropic",
        "description": "AI safety company building reliable, interpretable, and steerable AI systems.",
        "industry": "AI/ML",
        "employee_count": 800,
        "employee_count_range": "501-1000",
        "headquarters": "San Francisco, CA, US",
        "locations": ["San Francisco, CA", "New York, NY", "London, UK", "Remote"],
        "remote_friendly": True,
        "funding_stage": "Series D",
        "total_funding_usd": 7300000000,
        "last_funding_amount_usd": 2000000000,
        "investors": ["Google", "Spark Capital", "Menlo Ventures"],
        "tech_stack": ["Python", "PyTorch", "Rust", "Kubernetes", "CUDA"],
        "hiring_needs": ["ML research", "infrastructure", "safety"],
        "open_positions_count": 50,
        "hiring_signals": ["ml", "research", "safety", "infrastructure"],
        "pain_points": ["Scaling training infrastructure", "Safety research"],
        "growth_signals": ["Major funding round", "Claude model launches"],
        "competitors": ["OpenAI", "Google DeepMind", "Meta AI"],
        "stage": CompanyStage.QUALIFIED,
        "confidence_score": 0.95,
    },
    {
        "name": "Resend",
        "domain": "resend.com",
        "linkedin_url": "https://linkedin.com/company/resend",
        "description": "Email for developers. Modern email API built for developers.",
        "industry": "SaaS",
        "employee_count": 30,
        "employee_count_range": "11-50",
        "headquarters": "San Francisco, CA, US",
        "locations": ["Remote"],
        "remote_friendly": True,
        "funding_stage": "Series A",
        "total_funding_usd": 12000000,
        "last_funding_amount_usd": 12000000,
        "investors": ["Y Combinator", "Craft Ventures"],
        "tech_stack": ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
        "hiring_needs": ["full-stack", "infrastructure", "email deliverability"],
        "open_positions_count": 5,
        "hiring_signals": ["engineering", "full-stack", "infrastructure"],
        "pain_points": ["Email deliverability at scale", "Enterprise features"],
        "growth_signals": ["Series A funding", "Developer adoption"],
        "competitors": ["SendGrid", "Postmark", "Mailgun"],
        "stage": CompanyStage.DISCOVERED,
        "confidence_score": 0.75,
    },
    {
        "name": "Planetscale",
        "domain": "planetscale.com",
        "linkedin_url": "https://linkedin.com/company/planetscale",
        "description": "The MySQL-compatible serverless database platform built on Vitess.",
        "industry": "Database",
        "employee_count": 80,
        "employee_count_range": "51-100",
        "headquarters": "San Francisco, CA, US",
        "locations": ["San Francisco, CA", "Remote"],
        "remote_friendly": True,
        "funding_stage": "Series C",
        "total_funding_usd": 106000000,
        "last_funding_amount_usd": 50000000,
        "investors": ["a16z", "SignalFire", "Insight Partners"],
        "tech_stack": ["Go", "MySQL", "Vitess", "Kubernetes", "Rust"],
        "hiring_needs": ["database engineering", "infrastructure", "distributed systems"],
        "open_positions_count": 10,
        "hiring_signals": ["database", "infrastructure", "distributed systems"],
        "pain_points": ["Database scaling for enterprise", "Multi-region replication"],
        "growth_signals": ["Enterprise customer growth", "Open source Vitess"],
        "competitors": ["Neon", "Supabase", "CockroachDB"],
        "stage": CompanyStage.PROPOSAL_SENT,
        "confidence_score": 0.88,
    },
    {
        "name": "Neon",
        "domain": "neon.tech",
        "linkedin_url": "https://linkedin.com/company/neondatabase",
        "description": "Serverless Postgres. Separate storage and compute for autoscaling.",
        "industry": "Database",
        "employee_count": 100,
        "employee_count_range": "51-100",
        "headquarters": "San Francisco, CA, US",
        "locations": ["San Francisco, CA", "Remote", "Berlin, Germany"],
        "remote_friendly": True,
        "funding_stage": "Series B",
        "total_funding_usd": 74000000,
        "last_funding_amount_usd": 46000000,
        "investors": ["GGV Capital", "Founders Fund", "Menlo Ventures"],
        "tech_stack": ["Rust", "PostgreSQL", "Go", "Kubernetes", "AWS"],
        "hiring_needs": ["database engineering", "Rust", "distributed systems"],
        "open_positions_count": 12,
        "hiring_signals": ["database", "rust", "infrastructure"],
        "pain_points": ["Storage-compute separation scaling", "Enterprise compliance"],
        "growth_signals": ["Series B funding", "Developer adoption"],
        "competitors": ["Supabase", "PlanetScale", "CockroachDB"],
        "stage": CompanyStage.DISCOVERED,
        "confidence_score": 0.82,
    },
]

SAMPLE_CONTACTS = [
    {
        "first_name": "Guillermo",
        "last_name": "Rauch",
        "title": "CEO",
        "seniority": "cxo",
        "is_decision_maker": True,
        "is_hiring_manager": False,
        "linkedin_url": "https://linkedin.com/in/rauchg",
    },
    {
        "first_name": "Lee",
        "last_name": "Robinson",
        "title": "VP of Developer Experience",
        "seniority": "vp",
        "is_decision_maker": True,
        "is_hiring_manager": True,
        "linkedin_url": "https://linkedin.com/in/leeerobinson",
    },
    {
        "first_name": "Paul",
        "last_name": "Copplestone",
        "title": "CEO & Co-founder",
        "seniority": "cxo",
        "is_decision_maker": True,
        "is_hiring_manager": False,
        "linkedin_url": "https://linkedin.com/in/paulcopples",
    },
    {
        "first_name": "Ania",
        "last_name": "Kubow",
        "title": "Developer Advocate",
        "seniority": "individual",
        "is_decision_maker": False,
        "is_hiring_manager": False,
        "linkedin_url": "https://linkedin.com/in/aniakubow",
    },
    {
        "first_name": "Jacob",
        "last_name": "Lee",
        "title": "Co-founder & CTO",
        "seniority": "cxo",
        "is_decision_maker": True,
        "is_hiring_manager": True,
        "linkedin_url": "https://linkedin.com/in/jacob-lee",
    },
    {
        "first_name": "Dario",
        "last_name": "Amodei",
        "title": "CEO",
        "seniority": "cxo",
        "is_decision_maker": True,
        "is_hiring_manager": False,
        "linkedin_url": "https://linkedin.com/in/dario-amodei",
    },
    {
        "first_name": "Daniela",
        "last_name": "Amodei",
        "title": "President",
        "seniority": "cxo",
        "is_decision_maker": True,
        "is_hiring_manager": False,
        "linkedin_url": "https://linkedin.com/in/daniela-amodei",
    },
    {
        "first_name": "Tony",
        "last_name": "Liu",
        "title": "Co-founder & CEO",
        "seniority": "cxo",
        "is_decision_maker": True,
        "is_hiring_manager": False,
        "linkedin_url": "https://linkedin.com/in/tonyliu",
    },
    {
        "first_name": "Alex",
        "last_name": "Rasmussen",
        "title": "Co-founder & CTO",
        "seniority": "cxo",
        "is_decision_maker": True,
        "is_hiring_manager": True,
        "linkedin_url": "https://linkedin.com/in/alexras",
    },
]


async def seed_agents(session) -> list[AgentConfig]:
    """Seed sample agents."""
    agents = []
    for agent_data in SAMPLE_AGENTS:
        agent = AgentConfig(**agent_data)
        session.add(agent)
        agents.append(agent)
    await session.flush()
    print(f"  Created {len(agents)} agents")
    return agents


async def seed_companies(session, agents: list[AgentConfig]) -> list[Company]:
    """Seed sample companies."""
    companies = []
    # Distribute companies across agents
    for i, company_data in enumerate(SAMPLE_COMPANIES):
        agent = agents[i % len(agents)]
        company = Company(agent_id=agent.id, **company_data)
        session.add(company)
        companies.append(company)
    await session.flush()
    print(f"  Created {len(companies)} companies")
    return companies


async def seed_contacts(session, companies: list[Company]) -> list[Contact]:
    """Seed sample contacts."""
    contacts = []
    # Assign 1-2 contacts per company
    contact_idx = 0
    for company in companies:
        num_contacts = min(2, len(SAMPLE_CONTACTS) - contact_idx)
        for _ in range(num_contacts):
            if contact_idx >= len(SAMPLE_CONTACTS):
                break
            contact_data = SAMPLE_CONTACTS[contact_idx]
            contact = Contact(
                company_id=company.id,
                full_name=f"{contact_data['first_name']} {contact_data['last_name']}",
                email=f"{contact_data['first_name'].lower()}.{contact_data['last_name'].lower()}@{company.domain}",
                email_verified=True,
                source="linkedin_search",
                confidence_score=0.85,
                **contact_data,
            )
            session.add(contact)
            contacts.append(contact)
            contact_idx += 1
    await session.flush()
    print(f"  Created {len(contacts)} contacts")
    return contacts


async def seed_campaigns(session, agents: list[AgentConfig]) -> list[OutreachCampaign]:
    """Seed sample campaigns."""
    campaigns = []
    campaign_configs = [
        {
            "name": "Q1 SaaS Outreach",
            "sequence_name": "saas_4_touch",
            "status": CampaignStatus.RUNNING,
            "daily_limit": 50,
            "total_recipients": 120,
            "emails_sent": 85,
            "emails_delivered": 82,
            "emails_opened": 34,
            "emails_clicked": 12,
            "emails_replied": 8,
            "emails_bounced": 3,
        },
        {
            "name": "FinTech Decision Makers",
            "sequence_name": "standard_3_touch",
            "status": CampaignStatus.DRAFT,
            "daily_limit": 30,
        },
        {
            "name": "AI/ML Research Labs",
            "sequence_name": "saas_4_touch",
            "status": CampaignStatus.COMPLETED,
            "daily_limit": 40,
            "total_recipients": 60,
            "emails_sent": 60,
            "emails_delivered": 58,
            "emails_opened": 28,
            "emails_clicked": 9,
            "emails_replied": 11,
            "emails_bounced": 2,
        },
    ]
    for i, config in enumerate(campaign_configs):
        agent = agents[i % len(agents)]
        campaign = OutreachCampaign(agent_id=agent.id, **config)
        session.add(campaign)
        campaigns.append(campaign)
    await session.flush()
    print(f"  Created {len(campaigns)} campaigns")
    return campaigns


async def seed_deals(session, companies: list[Company]) -> list[PipelineDeal]:
    """Seed sample pipeline deals."""
    deals = []
    deal_configs = [
        {"stage": CompanyStage.QUALIFIED, "probability": 75, "value_usd": 18000},
        {"stage": CompanyStage.CALL_BOOKED, "probability": 60, "value_usd": 15000},
        {"stage": CompanyStage.REPLIED, "probability": 40, "value_usd": 20000},
        {"stage": CompanyStage.PROPOSAL_SENT, "probability": 90, "value_usd": 22000},
        {"stage": CompanyStage.CONTACTED, "probability": 25, "value_usd": 15000},
        {"stage": CompanyStage.DISCOVERED, "probability": 5, "value_usd": 18000},
        {"stage": CompanyStage.RESEARCHED, "probability": 15, "value_usd": 16000},
    ]
    for i, company in enumerate(companies[:7]):
        config = deal_configs[i % len(deal_configs)]
        deal = PipelineDeal(
            company_id=company.id,
            name=f"Placement: {company.name}",
            description=f"Recruitment partnership with {company.name}",
            stage=config["stage"],
            probability=config["probability"],
            value_usd=config["value_usd"],
            source="agent",
            expected_close_date=datetime.utcnow() + timedelta(days=30 + i * 10),
        )
        session.add(deal)
        deals.append(deal)
    await session.flush()
    print(f"  Created {len(deals)} pipeline deals")
    return deals


async def seed():
    """Seed the database with sample data."""
    print("Seeding database with sample data...")

    manager = get_db_manager()
    await manager.create_tables()

    async with manager.session() as session:
        agents = await seed_agents(session)
        companies = await seed_companies(session, agents)
        contacts = await seed_contacts(session, companies)
        campaigns = await seed_campaigns(session, agents)
        deals = await seed_deals(session, companies)

        await session.commit()

    print("\nDone! Database seeded with:")
    print(f"  - {len(agents)} agents")
    print(f"  - {len(companies)} companies")
    print(f"  - {len(contacts)} contacts")
    print(f"  - {len(campaigns)} campaigns")
    print(f"  - {len(deals)} pipeline deals")


if __name__ == "__main__":
    asyncio.run(seed())
