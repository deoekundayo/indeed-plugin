from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml


@dataclass
class ProfileConfig:
    name: str
    email: str
    phone: str
    field_of_study: str
    degree: str
    graduation_year: int
    location: str
    target_roles: list[str]
    skills: list[str]
    experience: str
    education: str
    base_resume_path: str


@dataclass
class SearchConfig:
    query: str
    location: str
    indeed_apply_only: bool = True
    max_jobs_per_run: int = 10
    min_match_score: float = 0.45


@dataclass
class ApplicationConfig:
    confirm_each: bool = True
    max_applications_per_day: int = 15
    delay_seconds_between_applies: int = 8


@dataclass
class OpenAIConfig:
    model: str = "gpt-4o-mini"
    api_key: str | None = None


@dataclass
class PathsConfig:
    output_dir: str = "data/generated"
    session_file: str = "data/indeed_session.json"


@dataclass
class AppConfig:
    profile: ProfileConfig
    search: SearchConfig
    application: ApplicationConfig
    openai: OpenAIConfig
    paths: PathsConfig
    root: Path = field(default_factory=Path.cwd)

    def resolve(self, relative: str) -> Path:
        path = Path(relative)
        if path.is_absolute():
            return path
        return self.root / path


def load_config(path: str | Path = "config.yaml") -> AppConfig:
    config_path = Path(path)
    if not config_path.exists():
        raise FileNotFoundError(
            f"Config not found: {config_path}. Copy config.example.yaml to config.yaml."
        )

    with config_path.open(encoding="utf-8") as f:
        raw: dict[str, Any] = yaml.safe_load(f)

    root = config_path.parent.resolve()
    profile_raw = raw["profile"]
    search_raw = raw.get("search", {})
    app_raw = raw.get("application", {})
    openai_raw = raw.get("openai", {})
    paths_raw = raw.get("paths", {})

    openai_key = openai_raw.get("api_key") or os.environ.get("OPENAI_API_KEY")

    return AppConfig(
        root=root,
        profile=ProfileConfig(**profile_raw),
        search=SearchConfig(**search_raw),
        application=ApplicationConfig(**app_raw),
        openai=OpenAIConfig(model=openai_raw.get("model", "gpt-4o-mini"), api_key=openai_key),
        paths=PathsConfig(**paths_raw),
    )
