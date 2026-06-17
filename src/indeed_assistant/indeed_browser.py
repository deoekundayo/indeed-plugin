from __future__ import annotations

import json
import re
from datetime import date, datetime
from pathlib import Path
from urllib.parse import quote_plus

from playwright.sync_api import Browser, BrowserContext, Page, sync_playwright

from .config import AppConfig
from .documents import TailoredDocuments
from .matcher import JobListing


INDEED_BASE = "https://www.indeed.com"


def _session_path(config: AppConfig) -> Path:
    path = config.resolve(config.paths.session_file)
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def _applications_log_path(config: AppConfig) -> Path:
    return config.resolve("data/applications_log.json")


def count_applications_today(config: AppConfig) -> int:
    path = _applications_log_path(config)
    if not path.exists():
        return 0
    data = json.loads(path.read_text(encoding="utf-8"))
    today = date.today().isoformat()
    return sum(1 for entry in data if entry.get("date") == today)


def log_application(config: AppConfig, job: JobListing, status: str) -> None:
    path = _applications_log_path(config)
    path.parent.mkdir(parents=True, exist_ok=True)
    entries = []
    if path.exists():
        entries = json.loads(path.read_text(encoding="utf-8"))
    entries.append(
        {
            "date": date.today().isoformat(),
            "time": datetime.now().isoformat(),
            "job_id": job.job_id,
            "title": job.title,
            "company": job.company,
            "url": job.url,
            "status": status,
        }
    )
    path.write_text(json.dumps(entries, indent=2), encoding="utf-8")


class IndeedBrowser:
    def __init__(self, config: AppConfig, *, headless: bool = False) -> None:
        self.config = config
        self.headless = headless
        self._playwright = None
        self._browser: Browser | None = None
        self._context: BrowserContext | None = None

    def __enter__(self) -> IndeedBrowser:
        self._playwright = sync_playwright().start()
        self._browser = self._playwright.chromium.launch(headless=self.headless)
        session = _session_path(self.config)
        if session.exists():
            self._context = self._browser.new_context(storage_state=str(session))
        else:
            self._context = self._browser.new_context()
        return self

    def __exit__(self, *args: object) -> None:
        if self._context:
            self._context.close()
        if self._browser:
            self._browser.close()
        if self._playwright:
            self._playwright.stop()

    def save_session(self) -> None:
        assert self._context
        self._context.storage_state(path=str(_session_path(self.config)))

    def login_interactive(self) -> None:
        """Open Indeed sign-in; user completes login, then we persist the session."""
        assert self._context
        page = self._context.new_page()
        page.goto(f"{INDEED_BASE}/account/login", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)
        print(
            "\n>>> Log in to Indeed in the browser window.\n"
            ">>> When you see your account home or job search, press Enter here...\n"
        )
        input()
        self.save_session()
        page.close()

    def _new_page(self) -> Page:
        assert self._context
        return self._context.new_page()

    def search_jobs(self) -> list[JobListing]:
        search = self.config.search
        q = quote_plus(search.query)
        loc = quote_plus(search.location)
        url = f"{INDEED_BASE}/jobs?q={q}&l={loc}"
        if search.indeed_apply_only:
            url += "&iafilter=1"

        page = self._new_page()
        page.goto(url, wait_until="domcontentloaded")
        page.wait_for_timeout(2500)

        # Scroll to load more cards
        for _ in range(3):
            page.mouse.wheel(0, 2000)
            page.wait_for_timeout(800)

        jobs: list[JobListing] = []
        cards = page.locator('[data-jk], .job_seen_beacon, .tapItem')
        count = cards.count()
        seen_ids: set[str] = set()

        for i in range(min(count, 40)):
            card = cards.nth(i)
            try:
                job_id = card.get_attribute("data-jk") or ""
                if not job_id:
                    link = card.locator("a[href*='jk='], a.jcs-JobTitle").first
                    href = link.get_attribute("href") or ""
                    match = re.search(r"jk=([a-f0-9]+)", href)
                    job_id = match.group(1) if match else f"idx-{i}"
                if job_id in seen_ids:
                    continue
                seen_ids.add(job_id)

                title_el = card.locator(
                    "h2.jobTitle span, a.jcs-JobTitle, [data-testid='job-title']"
                ).first
                title = title_el.inner_text(timeout=2000).strip() if title_el.count() else "Unknown"

                company_el = card.locator(
                    "[data-testid='company-name'], .companyName, span.companyName"
                ).first
                company = (
                    company_el.inner_text(timeout=1500).strip()
                    if company_el.count()
                    else "Unknown"
                )

                loc_el = card.locator(
                    "[data-testid='text-location'], .companyLocation"
                ).first
                location = (
                    loc_el.inner_text(timeout=1500).strip() if loc_el.count() else search.location
                )

                snippet_el = card.locator(".job-snippet, .underShelfFooter").first
                snippet = (
                    snippet_el.inner_text(timeout=1000).strip() if snippet_el.count() else ""
                )

                job_url = f"{INDEED_BASE}/viewjob?jk={job_id}"
                indeed_apply = search.indeed_apply_only or bool(
                    card.locator("text=Easily apply, text=Indeed Apply").count()
                )

                jobs.append(
                    JobListing(
                        job_id=job_id,
                        title=title,
                        company=company,
                        location=location,
                        url=job_url,
                        snippet=snippet,
                        indeed_apply=indeed_apply,
                    )
                )
            except Exception:
                continue

        page.close()
        return jobs

    def apply_to_job(self, job: JobListing, docs: TailoredDocuments) -> str:
        """
        Attempt Indeed Apply flow. Returns status: applied | skipped | manual_required | error.
        Indeed forms vary; we fill common fields and submit when possible.
        """
        profile = self.config.profile
        page = self._new_page()
        status = "error"
        try:
            page.goto(job.url, wait_until="domcontentloaded")
            page.wait_for_timeout(2000)

            apply_btn = page.locator(
                "button:has-text('Apply now'), "
                "a:has-text('Apply now'), "
                "button:has-text('Easily apply'), "
                "#indeedApplyButton, "
                "[data-testid='indeedApplyButton-test']"
            ).first

            if apply_btn.count() == 0:
                page.close()
                return "manual_required"

            apply_btn.click(timeout=5000)
            page.wait_for_timeout(2000)

            self._fill_if_present(page, 'input[name="firstName"], input[id*="firstName"]', profile.name.split()[0])
            if len(profile.name.split()) > 1:
                self._fill_if_present(
                    page,
                    'input[name="lastName"], input[id*="lastName"]',
                    profile.name.split()[-1],
                )
            self._fill_if_present(
                page, 'input[type="email"], input[name="email"]', profile.email
            )
            self._fill_if_present(
                page, 'input[type="tel"], input[name="phone"]', profile.phone
            )

            # Cover letter / additional info text areas
            for selector in [
                'textarea[name*="cover"]',
                'textarea[id*="cover"]',
                'textarea[aria-label*="cover" i]',
                'textarea[name*="message"]',
                "textarea",
            ]:
                if self._fill_if_present(page, selector, docs.cover_letter):
                    break

            # Continue / Submit buttons in multi-step flows
            for _ in range(5):
                submitted = self._click_if_present(
                    page,
                    "button:has-text('Submit'), button:has-text('Apply'), "
                    "button:has-text('Continue'), button[type='submit']",
                )
                page.wait_for_timeout(1500)
                if submitted and page.locator("text=Application submitted, text=applied").count():
                    status = "applied"
                    break
            else:
                # Heuristic: if we clicked through without error
                if page.locator("text=Application submitted, text=You applied").count():
                    status = "applied"
                else:
                    status = "manual_required"

        except Exception:
            status = "error"
        finally:
            page.close()

        return status

    @staticmethod
    def _fill_if_present(page: Page, selector: str, value: str) -> bool:
        loc = page.locator(selector).first
        if loc.count() == 0:
            return False
        try:
            loc.fill(value, timeout=3000)
            return True
        except Exception:
            return False

    @staticmethod
    def _click_if_present(page: Page, selector: str) -> bool:
        loc = page.locator(selector).first
        if loc.count() == 0:
            return False
        try:
            loc.click(timeout=3000)
            return True
        except Exception:
            return False
