#!/usr/bin/env python3
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "https://loopdesk-production.up.railway.app/bevakning"
OUTPUT_DIR = Path("artifacts")
PROFILE_DIR = Path(".playwright-profile")


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    PROFILE_DIR.mkdir(exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE_DIR),
            headless=False,
            channel="chrome",
            args=[
                "--disable-dev-shm-usage",
            ],
        )
        page = browser.new_page()
        page.goto(URL, wait_until="domcontentloaded")

        print("Browser opened.")
        print("1) Log in if needed.")
        print("2) Navigate to the bevakning page if redirected.")
        print("3) When the list is visible, return here and press Enter.")
        input("Press Enter to capture... ")

        page.wait_for_timeout(1000)
        page.screenshot(path=str(OUTPUT_DIR / "bevakning.png"), full_page=True)
        html = page.content()
        (OUTPUT_DIR / "bevakning.html").write_text(html, encoding="utf-8")

        # Extract some basic DOM info for analysis
        data = {
            "url": page.url,
            "title": page.title(),
        }
        (OUTPUT_DIR / "bevakning_meta.txt").write_text(
            f"url: {data['url']}\n" f"title: {data['title']}\n",
            encoding="utf-8",
        )

        print("Saved artifacts:")
        print(f"- {OUTPUT_DIR / 'bevakning.png'}")
        print(f"- {OUTPUT_DIR / 'bevakning.html'}")
        print(f"- {OUTPUT_DIR / 'bevakning_meta.txt'}")

        browser.close()


if __name__ == "__main__":
    main()
