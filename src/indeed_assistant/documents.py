from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from jinja2 import Template

from .config import AppConfig, ProfileConfig
from .matcher import JobListing


@dataclass
class TailoredDocuments:
    resume: str
    cover_letter: str
    job: JobListing


RESUME_PROMPT = """You are an expert resume writer. Tailor the candidate's resume for this job.
Keep facts truthful — only rephrase, reorder, and emphasize relevant experience. One page tone.
Output plain text (markdown ok), no commentary.

JOB:
Title: {title}
Company: {company}
Location: {location}
Description snippet: {snippet}

CANDIDATE PROFILE:
Field of study: {field_of_study}
Skills: {skills}
Experience:
{experience}
Education:
{education}

BASE RESUME:
{base_resume}
"""

COVER_LETTER_PROMPT = """Write a concise, professional cover letter (3–4 paragraphs) for this application.
Use the candidate's real background only. No placeholder brackets. Sign off with the candidate's name.

JOB: {title} at {company} ({location})
Field: {field_of_study}

Candidate: {name}
{experience}
"""


def _read_base_resume(config: AppConfig) -> str:
    path = config.resolve(config.profile.base_resume_path)
    if not path.exists():
        return (
            f"{config.profile.name}\n"
            f"{config.profile.education}\n\n"
            f"{config.profile.experience}"
        )
    return path.read_text(encoding="utf-8")


def _generate_with_openai(config: AppConfig, prompt: str) -> str:
    from openai import OpenAI

    if not config.openai.api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Add it to your environment or config.yaml openai.api_key."
        )
    client = OpenAI(api_key=config.openai.api_key)
    response = client.chat.completions.create(
        model=config.openai.model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )
    return (response.choices[0].message.content or "").strip()


def _template_resume(profile: ProfileConfig, job: JobListing, base: str) -> str:
    tpl = Template(
        """# {{ name }}
{{ email }} | {{ phone }} | {{ location }}

## Summary
{{ field_of_study }} graduate targeting **{{ job_title }}** roles. Focus: {{ skills_line }}.

## Experience
{{ experience }}

## Education
{{ education }}

## Target role alignment — {{ company }}
{{ snippet }}
"""
    )
    return tpl.render(
        name=profile.name,
        email=profile.email,
        phone=profile.phone,
        location=profile.location,
        field_of_study=profile.field_of_study,
        job_title=job.title,
        skills_line=", ".join(profile.skills[:8]),
        experience=profile.experience.strip(),
        education=profile.education.strip(),
        company=job.company,
        snippet=job.snippet[:400],
    )


def _template_cover_letter(profile: ProfileConfig, job: JobListing) -> str:
    tpl = Template(
        """{{ date }}

{{ company }}
Re: {{ title }}

Dear Hiring Manager,

I am applying for the {{ title }} position at {{ company }}. I recently completed my
{{ degree }} in {{ field_of_study }} ({{ graduation_year }}) and am eager to contribute
skills including {{ skills_line }}.

{{ experience_block }}

I would welcome the opportunity to discuss how my background fits your team. Thank you
for your consideration.

Sincerely,
{{ name }}
{{ email }} | {{ phone }}
"""
    )
    from datetime import date

    return tpl.render(
        date=date.today().strftime("%B %d, %Y"),
        company=job.company,
        title=job.title,
        degree=profile.degree,
        field_of_study=profile.field_of_study,
        graduation_year=profile.graduation_year,
        skills_line=", ".join(profile.skills[:6]),
        experience_block=profile.experience.strip()[:600],
        name=profile.name,
        email=profile.email,
        phone=profile.phone,
    )


def generate_documents(
    config: AppConfig,
    job: JobListing,
    *,
    use_ai: bool = True,
) -> TailoredDocuments:
    profile = config.profile
    base = _read_base_resume(config)

    if use_ai and config.openai.api_key:
        resume = _generate_with_openai(
            config,
            RESUME_PROMPT.format(
                title=job.title,
                company=job.company,
                location=job.location,
                snippet=job.snippet,
                field_of_study=profile.field_of_study,
                skills=", ".join(profile.skills),
                experience=profile.experience,
                education=profile.education,
                base_resume=base,
            ),
        )
        cover = _generate_with_openai(
            config,
            COVER_LETTER_PROMPT.format(
                title=job.title,
                company=job.company,
                location=job.location,
                field_of_study=profile.field_of_study,
                name=profile.name,
                experience=profile.experience,
            ),
        )
    else:
        resume = _template_resume(profile, job, base)
        cover = _template_cover_letter(profile, job)

    return TailoredDocuments(resume=resume, cover_letter=cover, job=job)


def save_documents(config: AppConfig, docs: TailoredDocuments) -> Path:
    out_dir = config.resolve(config.paths.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    safe_id = docs.job.job_id or "unknown"
    folder = out_dir / safe_id
    folder.mkdir(parents=True, exist_ok=True)

    (folder / "resume.md").write_text(docs.resume, encoding="utf-8")
    (folder / "cover_letter.md").write_text(docs.cover_letter, encoding="utf-8")
    meta = {
        "job_id": docs.job.job_id,
        "title": docs.job.title,
        "company": docs.job.company,
        "url": docs.job.url,
        "match_score": docs.job.match_score,
    }
    (folder / "job.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return folder
