"""Agents package initialization."""

from backend.agents.base import BaseAgent, AgentContext, AgentResult, AgentStep, LLMMixin
from backend.agents.discovery import CompanyDiscoveryAgent
from backend.agents.research import CompanyResearchAgent
from backend.agents.outreach import OutreachAgent
from backend.agents.followup import FollowupAgent
from backend.agents.scheduler import SchedulerAgent
from backend.agents.pipeline import PipelineAgent

__all__ = [
    "BaseAgent",
    "AgentContext",
    "AgentResult",
    "AgentStep",
    "LLMMixin",
    "CompanyDiscoveryAgent",
    "CompanyResearchAgent",
    "OutreachAgent",
    "FollowupAgent",
    "SchedulerAgent",
    "PipelineAgent",
]

# Agent registry for easy lookup
AGENT_CLASSES = {
    "discovery": CompanyDiscoveryAgent,
    "research": CompanyResearchAgent,
    "outreach": OutreachAgent,
    "followup": FollowupAgent,
    "scheduler": SchedulerAgent,
    "pipeline": PipelineAgent,
}


def get_agent_class(agent_type: str):
    """Get agent class by type."""
    return AGENT_CLASSES.get(agent_type)


def create_agent(agent_type: str, agent_config):
    """Create an agent instance by type."""
    agent_class = get_agent_class(agent_type)
    if agent_class:
        return agent_class(agent_config)
    raise ValueError(f"Unknown agent type: {agent_type}")