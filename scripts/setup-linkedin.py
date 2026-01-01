#!/usr/bin/env python3
"""
LinkedIn Scraper Setup Script
Helps you configure LinkedIn scraping for LoopDesk
"""

import os
import sys
import json

def get_cookie_instructions():
    print("""
╔══════════════════════════════════════════════════════════════════╗
║                   LinkedIn Cookie Setup                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  1. Oppna LinkedIn i Chrome och logga in                        ║
║  2. Tryck F12 for att oppna DevTools                            ║
║  3. Ga till Application → Storage → Cookies → linkedin.com      ║
║  4. Hitta cookien som heter 'li_at'                             ║
║  5. Kopiera vardet (Value-kolumnen)                             ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
""")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    env_file = os.path.join(project_dir, ".env.local")

    get_cookie_instructions()

    print("Klistra in din li_at cookie-varde har:")
    cookie = input("> ").strip()

    if not cookie:
        print("Ingen cookie angiven. Avbryter.")
        sys.exit(1)

    # Format the cookie properly
    if not cookie.startswith("li_at="):
        cookie = f"li_at={cookie}"

    # Read existing .env.local
    env_vars = {}
    if os.path.exists(env_file):
        with open(env_file, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    env_vars[key] = value

    # Update LinkedIn cookie
    env_vars["LINKEDIN_COOKIE"] = cookie

    # Write back
    with open(env_file, "w") as f:
        for key, value in env_vars.items():
            f.write(f"{key}={value}\n")

    print(f"\n✅ Cookie sparad i {env_file}")
    print("\nNu kan du testa LinkedIn-skrapning med:")
    print(f"  python3 {os.path.join(script_dir, 'test-linkedin.py')} antonosika")

    return cookie

if __name__ == "__main__":
    main()
