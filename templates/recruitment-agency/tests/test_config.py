"""Tests for configuration management."""

import os
from pathlib import Path
from unittest.mock import patch

import pytest

from backend.config import (
    Settings,
    load_config,
    AgentsConfig,
    LLMConfig,
    DatabaseConfig,
    FeaturesConfig,
    AgentPersonasConfig,
)


class TestSettings:
    """Test Settings model."""

    def test_default_settings(self):
        """Settings can be created with defaults."""
        settings = Settings()
        assert settings.environment == "development"
        assert settings.llm.provider == "openrouter"
        assert settings.llm.model == "qwen/qwen3-coder:free"
        assert settings.features.dry_run_mode is False

    def test_settings_from_yaml(self, tmp_path):
        """Settings can be loaded from YAML config."""
        config_file = tmp_path / "config.yaml"
        config_file.write_text("""
llm:
  provider: openrouter
  model: test-model
  temperature: 0.5
features:
  dry_run_mode: true
  enable_ai_research: false
""")
        settings = load_config(str(config_file))
        assert settings.llm.model == "test-model"
        assert settings.llm.temperature == 0.5
        assert settings.features.dry_run_mode is True
        assert settings.features.enable_ai_research is False

    def test_database_url_resolution(self):
        """Database URL environment variables are resolved."""
        with patch.dict(os.environ, {"DATABASE_URL": "sqlite:///test.db"}):
            settings = Settings(database={"url": "${DATABASE_URL}"})
            assert settings.database.url == "sqlite:///test.db"

    def test_api_key_resolution(self):
        """API keys from environment variables are resolved."""
        with patch.dict(os.environ, {"TEST_API_KEY": "secret123"}):
            settings = Settings(apis={"apify": {"token": "${TEST_API_KEY}"}})
            assert settings.apis.apify.token == "secret123"


class TestAgentConfigs:
    """Test agent configuration models."""

    def test_agents_config_defaults(self):
        """AgentsConfig has correct defaults."""
        config = AgentsConfig()
        assert config.discovery.enabled is True
        assert config.research.enabled is True
        assert config.outreach.enabled is True
        assert config.followup.enabled is True
        assert config.scheduler.enabled is True

    def test_agent_personas_config(self):
        """AgentPersonasConfig loads persona templates."""
        config = AgentPersonasConfig()
        # Defaults are None when not loaded from YAML
        assert config.saas_hunter is None
        assert config.fintech_recruiter is None
        assert config.ai_ml_specialist is None


class TestLLMConfig:
    """Test LLM configuration."""

    def test_llm_config_defaults(self):
        """LLMConfig has correct defaults."""
        config = LLMConfig()
        assert config.provider == "openrouter"
        assert config.model == "qwen/qwen3-coder:free"
        assert config.temperature == 0.7
        assert config.max_tokens == 4000
        assert len(config.models) > 0

    def test_model_list_contains_free_models(self):
        """Model list includes free models."""
        config = LLMConfig()
        for model in config.models:
            assert model.endswith(":free") or "/" in model


class TestFeaturesConfig:
    """Test feature flags."""

    def test_feature_flags_defaults(self):
        """Feature flags have correct defaults."""
        config = FeaturesConfig()
        assert config.enable_ai_research is True
        assert config.enable_auto_outreach is True
        assert config.enable_auto_followup is True
        assert config.enable_auto_scheduling is True
        assert config.enable_crm_sync is True
        assert config.enable_analytics is True
        assert config.dry_run_mode is False
        assert config.enable_human_review is False
