#!/usr/bin/env python3
"""
Local LinkedIn Scraper API Server
Runs on http://localhost:8100 and provides LinkedIn profile data
"""

import os
import sys
import json
import warnings
warnings.filterwarnings("ignore")

# Add site-packages to path
sys.path.insert(0, os.path.expanduser("~/Library/Python/3.9/lib/python/site-packages"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="LinkedIn Scraper API", version="1.0.0")

# Allow CORS from localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global LinkedIn API instance
linkedin_api = None

def load_cookie():
    """Load LinkedIn cookie from .env.local"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    env_file = os.path.join(project_dir, ".env.local")

    if os.path.exists(env_file):
        with open(env_file, "r") as f:
            for line in f:
                if line.startswith("LINKEDIN_COOKIE="):
                    cookie = line.split("=", 1)[1].strip()
                    if "li_at=" in cookie:
                        cookie = cookie.replace("li_at=", "")
                    return cookie
    return None

def get_linkedin_api():
    """Get or create LinkedIn API instance"""
    global linkedin_api

    if linkedin_api is None:
        cookie = load_cookie()
        if not cookie:
            raise HTTPException(status_code=500, detail="LinkedIn cookie not configured. Run setup-linkedin.py first.")

        from linkedin_api import Linkedin
        linkedin_api = Linkedin("", "", cookies={"li_at": cookie}, authenticate=False)

    return linkedin_api

@app.get("/health")
async def health():
    return {"status": "ok", "linkedin_configured": load_cookie() is not None}

@app.get("/profile/{username}")
async def get_profile(username: str):
    """Get LinkedIn profile by username"""
    try:
        api = get_linkedin_api()
        profile = api.get_profile(username)

        if not profile:
            raise HTTPException(status_code=404, detail=f"Profile {username} not found")

        # Extract key fields
        return {
            "id": username,
            "name": f"{profile.get('firstName', '')} {profile.get('lastName', '')}".strip(),
            "headline": profile.get("headline"),
            "summary": profile.get("summary"),
            "location": profile.get("locationName"),
            "industry": profile.get("industryName"),
            "profile_picture": profile.get("displayPictureUrl"),
            "connection_count": profile.get("connections"),
            "experience": profile.get("experience", [])[:3],  # First 3 jobs
            "education": profile.get("education", [])[:2],     # First 2 education
            "url": f"https://www.linkedin.com/in/{username}",
            "raw": profile
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/company/{company_name}")
async def get_company(company_name: str):
    """Get LinkedIn company profile"""
    try:
        api = get_linkedin_api()
        company = api.get_company(company_name)

        if not company:
            raise HTTPException(status_code=404, detail=f"Company {company_name} not found")

        return {
            "id": company_name,
            "name": company.get("name"),
            "description": company.get("description"),
            "website": company.get("companyPageUrl"),
            "industry": company.get("companyIndustries", [{}])[0].get("localizedName") if company.get("companyIndustries") else None,
            "size": company.get("staffCount"),
            "headquarters": company.get("headquarter"),
            "logo": company.get("logo", {}).get("image", {}).get("com.linkedin.common.VectorImage", {}).get("rootUrl"),
            "url": f"https://www.linkedin.com/company/{company_name}",
            "raw": company
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/posts/{username}")
async def get_posts(username: str, limit: int = 10):
    """Get recent posts from a LinkedIn user"""
    try:
        api = get_linkedin_api()

        # First get the profile to get the urn
        profile = api.get_profile(username)
        if not profile:
            raise HTTPException(status_code=404, detail=f"Profile {username} not found")

        # Get posts using the profile URN
        # Note: This may require additional API calls
        posts = []

        # The linkedin-api library has limited post support
        # Return profile info as a "post" for now
        return [{
            "id": f"{username}-profile",
            "text": profile.get("summary") or profile.get("headline") or f"Profile: {username}",
            "author": f"{profile.get('firstName', '')} {profile.get('lastName', '')}".strip(),
            "url": f"https://www.linkedin.com/in/{username}",
            "image_url": profile.get("displayPictureUrl"),
            "published_at": None,
            "platform": "linkedin"
        }]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("=" * 60)
    print("LinkedIn Scraper API Server")
    print("=" * 60)

    cookie = load_cookie()
    if cookie:
        print("✅ LinkedIn cookie found")
    else:
        print("❌ LinkedIn cookie NOT found")
        print("   Kor forst: python3 scripts/setup-linkedin.py")
        print()

    print("\nStartar server pa http://localhost:8100")
    print("Tryck Ctrl+C for att avsluta\n")

    uvicorn.run(app, host="0.0.0.0", port=8100, log_level="info")
