#!/usr/bin/env python3
"""
Test LinkedIn profile scraping
Usage: python3 test-linkedin.py <username>
"""

import os
import sys
import json

# Add warning suppression
import warnings
warnings.filterwarnings("ignore")

def load_cookie():
    """Load LinkedIn cookie from .env.local"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    env_file = os.path.join(project_dir, ".env.local")

    if not os.path.exists(env_file):
        print("Ingen .env.local hittad. Kor forst: python3 scripts/setup-linkedin.py")
        sys.exit(1)

    with open(env_file, "r") as f:
        for line in f:
            if line.startswith("LINKEDIN_COOKIE="):
                return line.split("=", 1)[1].strip()

    print("LINKEDIN_COOKIE inte hittad i .env.local")
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Anvandning: python3 test-linkedin.py <username>")
        print("Exempel: python3 test-linkedin.py antonosika")
        sys.exit(1)

    username = sys.argv[1]
    cookie_str = load_cookie()

    # Extract just the cookie value
    if "li_at=" in cookie_str:
        cookie_str = cookie_str.replace("li_at=", "")

    print(f"Hamtar profil for: {username}")
    print("Ansluter till LinkedIn...")

    try:
        from linkedin_api import Linkedin

        # Create API instance with cookie
        # The linkedin-api library expects cookies in a specific format
        api = Linkedin("", "", cookies={"li_at": cookie_str}, authenticate=False)

        # Get profile
        profile = api.get_profile(username)

        if profile:
            print("\n" + "=" * 60)
            print(f"Namn: {profile.get('firstName', '')} {profile.get('lastName', '')}")
            print(f"Headline: {profile.get('headline', 'N/A')}")
            print(f"Plats: {profile.get('locationName', 'N/A')}")
            print(f"Sammanfattning: {profile.get('summary', 'N/A')[:200]}...")
            print("=" * 60)

            # Save full profile to JSON
            output_file = f"/tmp/linkedin_{username}.json"
            with open(output_file, "w") as f:
                json.dump(profile, f, indent=2, default=str)
            print(f"\nFullstandig profil sparad: {output_file}")

            return profile
        else:
            print("Kunde inte hamta profilen")
            sys.exit(1)

    except Exception as e:
        print(f"Fel: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
