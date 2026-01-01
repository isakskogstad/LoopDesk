"""
Social Media Scraper Service
Provides REST API for scraping Twitter/X and Facebook
"""

import os
import json
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import facebook_scraper as fb

# Try to import twscrape (may not be configured yet)
try:
    from twscrape import API as TwitterAPI, gather
    TWITTER_AVAILABLE = True
except ImportError:
    TWITTER_AVAILABLE = False

# ============================================
# MODELS
# ============================================

class SocialPost(BaseModel):
    id: str
    text: str
    author: str
    author_id: Optional[str] = None
    url: str
    image_url: Optional[str] = None
    published_at: str
    likes: int = 0
    shares: int = 0
    comments: int = 0
    platform: str
    raw: Optional[Dict[str, Any]] = None


class ScraperStatus(BaseModel):
    twitter: bool
    facebook: bool
    twitter_accounts: int = 0


# ============================================
# TWITTER SCRAPER
# ============================================

twitter_api: Optional[Any] = None


async def init_twitter():
    """Initialize Twitter API with accounts from environment"""
    global twitter_api

    if not TWITTER_AVAILABLE:
        print("twscrape not installed")
        return

    accounts_json = os.environ.get("TWITTER_ACCOUNTS", "")
    if not accounts_json:
        print("No Twitter accounts configured")
        return

    try:
        accounts = json.loads(accounts_json)
        twitter_api = TwitterAPI("/app/data/twitter_accounts.db")

        for acc in accounts:
            if acc.get("cookies"):
                await twitter_api.pool.add_account(
                    acc["username"],
                    acc.get("password", ""),
                    acc.get("email", ""),
                    acc.get("email_password", ""),
                    cookies=acc["cookies"]
                )
            else:
                await twitter_api.pool.add_account(
                    acc["username"],
                    acc["password"],
                    acc.get("email", ""),
                    acc.get("email_password", "")
                )

        # Login all accounts
        await twitter_api.pool.login_all()
        print(f"Twitter: {len(accounts)} accounts initialized")
    except Exception as e:
        print(f"Twitter init error: {e}")
        twitter_api = None


async def get_twitter_user_tweets(username: str, limit: int = 20) -> List[SocialPost]:
    """Get tweets from a Twitter user"""
    if not twitter_api:
        raise HTTPException(status_code=503, detail="Twitter scraper not configured")

    try:
        user = await twitter_api.user_by_login(username)
        if not user:
            raise HTTPException(status_code=404, detail=f"User @{username} not found")

        tweets = await gather(twitter_api.user_tweets(user.id, limit=limit))

        posts = []
        for tweet in tweets:
            image_url = None
            if tweet.media and tweet.media.photos:
                image_url = tweet.media.photos[0].url

            posts.append(SocialPost(
                id=str(tweet.id),
                text=tweet.rawContent or tweet.renderedContent or "",
                author=tweet.user.username,
                author_id=str(tweet.user.id),
                url=tweet.url,
                image_url=image_url,
                published_at=tweet.date.isoformat() if tweet.date else datetime.now().isoformat(),
                likes=tweet.likeCount or 0,
                shares=tweet.retweetCount or 0,
                comments=tweet.replyCount or 0,
                platform="twitter",
                raw={"id": str(tweet.id), "user_id": str(tweet.user.id)}
            ))

        return posts
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Twitter error: {str(e)}")


async def search_twitter(query: str, limit: int = 20) -> List[SocialPost]:
    """Search Twitter"""
    if not twitter_api:
        raise HTTPException(status_code=503, detail="Twitter scraper not configured")

    try:
        tweets = await gather(twitter_api.search(query, limit=limit))

        posts = []
        for tweet in tweets:
            image_url = None
            if tweet.media and tweet.media.photos:
                image_url = tweet.media.photos[0].url

            posts.append(SocialPost(
                id=str(tweet.id),
                text=tweet.rawContent or tweet.renderedContent or "",
                author=tweet.user.username,
                author_id=str(tweet.user.id),
                url=tweet.url,
                image_url=image_url,
                published_at=tweet.date.isoformat() if tweet.date else datetime.now().isoformat(),
                likes=tweet.likeCount or 0,
                shares=tweet.retweetCount or 0,
                comments=tweet.replyCount or 0,
                platform="twitter"
            ))

        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Twitter search error: {str(e)}")


# ============================================
# FACEBOOK SCRAPER
# ============================================

def get_facebook_cookies() -> Optional[str]:
    """Get Facebook cookies from environment or file"""
    cookies = os.environ.get("FACEBOOK_COOKIES", "")
    if cookies:
        return cookies

    # Try to load from file
    cookie_file = "/app/data/facebook_cookies.txt"
    if os.path.exists(cookie_file):
        return cookie_file

    return None


def get_facebook_page_posts(page: str, pages: int = 2) -> List[SocialPost]:
    """Get posts from a Facebook page"""
    try:
        cookies = get_facebook_cookies()

        posts_list = []
        for post in fb.get_posts(
            page,
            pages=pages,
            cookies=cookies,
            options={"allow_extra_requests": False}
        ):
            image_url = None
            if post.get("images"):
                image_url = post["images"][0]
            elif post.get("image"):
                image_url = post["image"]

            posts_list.append(SocialPost(
                id=str(post.get("post_id", "")),
                text=post.get("text", "") or post.get("post_text", "") or "",
                author=post.get("username", page),
                author_id=post.get("user_id"),
                url=post.get("post_url", f"https://facebook.com/{page}"),
                image_url=image_url,
                published_at=post.get("time", datetime.now()).isoformat() if post.get("time") else datetime.now().isoformat(),
                likes=post.get("likes", 0) or 0,
                shares=post.get("shares", 0) or 0,
                comments=post.get("comments", 0) or 0,
                platform="facebook",
                raw={"post_id": post.get("post_id")}
            ))

        return posts_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Facebook error: {str(e)}")


# ============================================
# FASTAPI APP
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup"""
    await init_twitter()
    yield


app = FastAPI(
    title="Social Media Scraper",
    description="REST API for scraping Twitter/X and Facebook",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.get("/status", response_model=ScraperStatus)
async def status():
    """Get scraper status"""
    twitter_accounts = 0
    if twitter_api:
        try:
            accounts = await twitter_api.pool.accounts_info()
            twitter_accounts = len([a for a in accounts if a.active])
        except:
            pass

    return ScraperStatus(
        twitter=twitter_api is not None,
        facebook=True,  # Always available (may be limited without cookies)
        twitter_accounts=twitter_accounts
    )


# ============================================
# TWITTER ENDPOINTS
# ============================================

@app.get("/twitter/user/{username}", response_model=List[SocialPost])
async def twitter_user(
    username: str,
    limit: int = Query(default=20, le=100)
):
    """Get tweets from a Twitter user"""
    return await get_twitter_user_tweets(username, limit)


@app.get("/twitter/search", response_model=List[SocialPost])
async def twitter_search(
    q: str = Query(..., description="Search query"),
    limit: int = Query(default=20, le=100)
):
    """Search Twitter"""
    return await search_twitter(q, limit)


# ============================================
# FACEBOOK ENDPOINTS
# ============================================

@app.get("/facebook/page/{page}", response_model=List[SocialPost])
async def facebook_page(
    page: str,
    pages: int = Query(default=2, le=10, description="Number of pages to scrape")
):
    """Get posts from a Facebook page"""
    # Run in thread pool since facebook_scraper is sync
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, get_facebook_page_posts, page, pages)


# ============================================
# GENERIC ENDPOINTS
# ============================================

@app.get("/feed/{platform}/{identifier}", response_model=List[SocialPost])
async def generic_feed(
    platform: str,
    identifier: str,
    limit: int = Query(default=20, le=100)
):
    """Generic feed endpoint for any platform"""
    if platform == "twitter":
        return await get_twitter_user_tweets(identifier, limit)
    elif platform == "facebook":
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, get_facebook_page_posts, identifier, 2)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")
