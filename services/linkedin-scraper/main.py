"""
LinkedIn Scraper API Service
Uses LinkedIn's Voyager Dash API with cookie authentication
Runs as a separate service on Railway
"""

import os
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import uvicorn

# ============================================
# MODELS
# ============================================

class ProfileResponse(BaseModel):
    id: str
    name: str
    headline: Optional[str] = None
    summary: Optional[str] = None
    location: Optional[str] = None
    industry: Optional[str] = None
    profile_picture: Optional[str] = None
    url: str
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    premium: bool = False


class CompanyResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[int] = None
    logo: Optional[str] = None
    url: str


class PostResponse(BaseModel):
    id: str
    text: str
    author: str
    url: str
    image_url: Optional[str] = None
    published_at: Optional[str] = None
    likes: int = 0
    comments: int = 0


# ============================================
# LINKEDIN CLIENT
# ============================================

class LinkedInClient:
    def __init__(self, cookie: str):
        self.cookie = cookie
        self.session = requests.Session()
        self.session.cookies.set("li_at", cookie)
        self.csrf_token = None
        self._init_session()

    def _init_session(self):
        """Initialize session and get CSRF token"""
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
        resp = self.session.get("https://www.linkedin.com/", headers=headers)
        self.csrf_token = self.session.cookies.get("JSESSIONID", "").replace('"', "")

    def _get_headers(self):
        return {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/vnd.linkedin.normalized+json+2.1",
            "x-li-lang": "en_US",
            "x-restli-protocol-version": "2.0.0",
            "csrf-token": self.csrf_token,
        }

    def get_profile(self, username: str) -> Optional[Dict[str, Any]]:
        """Get profile using Dash API"""
        url = f"https://www.linkedin.com/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity={username}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.WebTopCardCore-16"

        resp = self.session.get(url, headers=self._get_headers())

        if resp.status_code != 200:
            return None

        data = resp.json()

        # Extract profile from included items
        # Find the primary profile (has objectUrn and premium field)
        profile_data = {}
        location = None
        profile_picture = None

        for item in data.get("included", []):
            item_type = item.get("$type", "")

            # Get the primary profile (with objectUrn)
            if "profile.Profile" in item_type and item.get("objectUrn"):
                profile_data = {
                    "firstName": item.get("multiLocaleFirstName", {}).get("en_US", ""),
                    "lastName": item.get("lastName", ""),
                    "headline": item.get("headline", ""),
                    "summary": item.get("summary", ""),
                    "premium": item.get("premium", False),
                    "objectUrn": item.get("objectUrn", ""),
                }

            if "common.Geo" in item_type:
                location = item.get("defaultLocalizedName", "")

            if "profile.ProfilePhoto" in item_type or "common.VectorImage" in item_type:
                if "rootUrl" in item:
                    profile_picture = item.get("rootUrl", "")

        if profile_data:
            profile_data["location"] = location
            profile_data["profilePicture"] = profile_picture

        return profile_data if profile_data else None

    def get_company(self, company_name: str) -> Optional[Dict[str, Any]]:
        """Get company profile"""
        url = f"https://www.linkedin.com/voyager/api/organization/companies?decorationId=com.linkedin.voyager.deco.organization.web.WebFullCompanyMain-12&q=universalName&universalName={company_name}"

        resp = self.session.get(url, headers=self._get_headers())

        if resp.status_code != 200:
            # Try alternative endpoint
            url2 = f"https://www.linkedin.com/voyager/api/entities/companies/{company_name}"
            resp = self.session.get(url2, headers=self._get_headers())
            if resp.status_code != 200:
                return None

        data = resp.json()

        # Extract company data
        company_data = {}
        for item in data.get("included", []):
            item_type = item.get("$type", "")

            if "Organization" in item_type or "Company" in item_type:
                company_data.update({
                    "name": item.get("name", company_name),
                    "description": item.get("description", ""),
                    "website": item.get("companyPageUrl", ""),
                    "staffCount": item.get("staffCount", 0),
                    "industries": item.get("industries", []),
                })

        if not company_data.get("name"):
            # Check elements
            elements = data.get("elements", [])
            if elements:
                company_data = elements[0]

        return company_data if company_data else None


linkedin_client: Optional[LinkedInClient] = None


def get_linkedin_client() -> LinkedInClient:
    global linkedin_client

    if linkedin_client is not None:
        return linkedin_client

    cookie = os.environ.get("LINKEDIN_COOKIE", "")

    if not cookie:
        raise HTTPException(
            status_code=503,
            detail="LINKEDIN_COOKIE environment variable not set"
        )

    # Remove li_at= prefix if present
    if cookie.startswith("li_at="):
        cookie = cookie[6:]

    try:
        linkedin_client = LinkedInClient(cookie)
        return linkedin_client
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize LinkedIn client: {str(e)}")


# ============================================
# APP
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: try to initialize LinkedIn client
    try:
        cookie = os.environ.get("LINKEDIN_COOKIE", "")
        if cookie:
            print(f"LinkedIn cookie configured (length: {len(cookie)})")
            # Test connection
            client = get_linkedin_client()
            print("LinkedIn client initialized successfully")
        else:
            print("WARNING: LINKEDIN_COOKIE not set")
    except Exception as e:
        print(f"LinkedIn init warning: {e}")
    yield


app = FastAPI(
    title="LinkedIn Scraper API",
    description="API for scraping LinkedIn profiles and companies using Voyager Dash API",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    cookie_set = bool(os.environ.get("LINKEDIN_COOKIE"))
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "linkedin_configured": cookie_set
    }


@app.get("/profile/{username}", response_model=ProfileResponse)
async def get_profile(username: str):
    """Get LinkedIn profile by username"""
    try:
        client = get_linkedin_client()
        profile = client.get_profile(username)

        if not profile:
            raise HTTPException(status_code=404, detail=f"Profile '{username}' not found")

        return ProfileResponse(
            id=username,
            name=f"{profile.get('firstName', '')} {profile.get('lastName', '')}".strip() or username,
            headline=profile.get("headline"),
            summary=profile.get("summary"),
            location=profile.get("location"),
            industry=profile.get("industry"),
            profile_picture=profile.get("profilePicture"),
            url=f"https://www.linkedin.com/in/{username}",
            experience=profile.get("experience", [])[:5],
            education=profile.get("education", [])[:3],
            premium=profile.get("premium", False)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/company/{company_name}", response_model=CompanyResponse)
async def get_company(company_name: str):
    """Get LinkedIn company by name/slug"""
    try:
        client = get_linkedin_client()
        company = client.get_company(company_name)

        if not company:
            raise HTTPException(status_code=404, detail=f"Company '{company_name}' not found")

        # Extract industry
        industry = None
        industries = company.get("industries", [])
        if industries:
            industry = industries[0].get("localizedName") if isinstance(industries[0], dict) else industries[0]

        return CompanyResponse(
            id=company_name,
            name=company.get("name", company_name),
            description=company.get("description"),
            website=company.get("website"),
            industry=industry,
            size=company.get("staffCount"),
            logo=company.get("logo"),
            url=f"https://www.linkedin.com/company/{company_name}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/posts/{username}", response_model=List[PostResponse])
async def get_posts(username: str, limit: int = Query(default=10, le=50)):
    """Get recent activity/posts from a LinkedIn user"""
    try:
        client = get_linkedin_client()
        profile = client.get_profile(username)

        if not profile:
            raise HTTPException(status_code=404, detail=f"Profile '{username}' not found")

        name = f"{profile.get('firstName', '')} {profile.get('lastName', '')}".strip()
        posts = []

        # Add profile summary as a post
        if profile.get("summary"):
            posts.append(PostResponse(
                id=f"{username}-summary",
                text=profile["summary"],
                author=name,
                url=f"https://www.linkedin.com/in/{username}",
                image_url=profile.get("profilePicture"),
                published_at=datetime.now().isoformat()
            ))

        # Add headline as a post if no summary
        if not posts and profile.get("headline"):
            posts.append(PostResponse(
                id=f"{username}-headline",
                text=f"{name}: {profile['headline']}",
                author=name,
                url=f"https://www.linkedin.com/in/{username}",
                image_url=profile.get("profilePicture"),
                published_at=datetime.now().isoformat()
            ))

        return posts
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting LinkedIn Scraper API on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
