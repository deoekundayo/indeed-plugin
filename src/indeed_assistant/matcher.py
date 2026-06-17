from __future__ import annotations

import re
from dataclasses import dataclass

from .config import ProfileConfig


@dataclass
class JobListing:
    job_id: str
    title: str
    company: str
    location: str
    url: str
    snippet: str
    indeed_apply: bool = False
    match_score: float = 0.0


def _tokenize(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9+#.]+", text.lower())
    return {w for w in words if len(w) > 2}


def score_job(profile: ProfileConfig, job: JobListing) -> float:
    """Score 0–1 based on overlap with field of study, target roles, and skills."""
    profile_terms = _tokenize(
        " ".join(
            [
                profile.field_of_study,
                profile.degree,
                " ".join(profile.target_roles),
                " ".join(profile.skills),
                profile.experience,
            ]
        )
    )
    job_terms = _tokenize(f"{job.title} {job.company} {job.location} {job.snippet}")

    if not profile_terms or not job_terms:
        return 0.0

    overlap = len(profile_terms & job_terms)
    union = len(profile_terms | job_terms)
    jaccard = overlap / union if union else 0.0

    title_lower = job.title.lower()
    role_bonus = 0.0
    for role in profile.target_roles:
        role_words = role.lower().split()
        if all(w in title_lower for w in role_words if len(w) > 2):
            role_bonus = 0.25
            break
        if role.lower() in title_lower:
            role_bonus = 0.2
            break

    field_tokens = _tokenize(profile.field_of_study)
    field_hits = sum(1 for t in field_tokens if t in job_terms)
    field_bonus = min(0.15, field_hits * 0.05)

    return min(1.0, jaccard + role_bonus + field_bonus)


def filter_and_rank(
    profile: ProfileConfig,
    jobs: list[JobListing],
    min_score: float,
    limit: int,
) -> list[JobListing]:
    for job in jobs:
        job.match_score = score_job(profile, job)
    ranked = sorted(jobs, key=lambda j: j.match_score, reverse=True)
    matched = [j for j in ranked if j.match_score >= min_score]
    return matched[:limit]
