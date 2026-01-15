#!/usr/bin/env python3
"""
Exa Search Integration for Claude Code
Advanced semantic web search using Exa AI
"""

import os
import sys
import json
from typing import Any, Dict, List, Optional

try:
    from exa_py import Exa
except ImportError:
    print("Installing exa_py...")
    os.system("pip install exa_py")
    from exa_py import Exa

# API Key - can be overridden by environment variable
EXA_API_KEY = os.getenv("EXA_API_KEY", "6c78547a-340f-4b49-b833-a36ac79b82fb")

# Initialize Exa client
exa = Exa(api_key=EXA_API_KEY)


def search(
    query: str,
    num_results: int = 10,
    search_type: str = "auto",
    include_text: bool = True,
    include_highlights: bool = True,
    start_published_date: Optional[str] = None,
    end_published_date: Optional[str] = None,
    include_domains: Optional[List[str]] = None,
    exclude_domains: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Perform an Exa search with content retrieval.

    Args:
        query: Search query (can be natural language or URL-like)
        num_results: Number of results to return (default: 10)
        search_type: 'auto', 'neural', or 'keyword' (default: auto)
        include_text: Include full text content (default: True)
        include_highlights: Include relevant highlights (default: True)
        start_published_date: Filter by start date (YYYY-MM-DD)
        end_published_date: Filter by end date (YYYY-MM-DD)
        include_domains: Only include these domains
        exclude_domains: Exclude these domains

    Returns:
        Dictionary with search results
    """
    try:
        kwargs = {
            "query": query,
            "num_results": num_results,
            "type": search_type,
            "text": include_text,
            "highlights": include_highlights,
        }

        if start_published_date:
            kwargs["start_published_date"] = start_published_date
        if end_published_date:
            kwargs["end_published_date"] = end_published_date
        if include_domains:
            kwargs["include_domains"] = include_domains
        if exclude_domains:
            kwargs["exclude_domains"] = exclude_domains

        results = exa.search_and_contents(**kwargs)

        # Format results
        formatted_results = []
        for result in results.results:
            formatted_results.append({
                "title": result.title,
                "url": result.url,
                "published_date": getattr(result, "published_date", None),
                "author": getattr(result, "author", None),
                "score": getattr(result, "score", None),
                "text": getattr(result, "text", "")[:2000] if include_text else None,
                "highlights": getattr(result, "highlights", []) if include_highlights else None,
            })

        return {
            "success": True,
            "query": query,
            "num_results": len(formatted_results),
            "results": formatted_results,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "query": query,
        }


def find_similar(url: str, num_results: int = 10) -> Dict[str, Any]:
    """
    Find pages similar to a given URL.

    Args:
        url: URL to find similar pages for
        num_results: Number of results (default: 10)

    Returns:
        Dictionary with similar pages
    """
    try:
        results = exa.find_similar_and_contents(
            url=url,
            num_results=num_results,
            text=True,
            highlights=True,
        )

        formatted_results = []
        for result in results.results:
            formatted_results.append({
                "title": result.title,
                "url": result.url,
                "score": getattr(result, "score", None),
                "highlights": getattr(result, "highlights", []),
            })

        return {
            "success": True,
            "source_url": url,
            "num_results": len(formatted_results),
            "results": formatted_results,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "source_url": url,
        }


def get_contents(urls: List[str]) -> Dict[str, Any]:
    """
    Get contents of specific URLs.

    Args:
        urls: List of URLs to get content from

    Returns:
        Dictionary with page contents
    """
    try:
        results = exa.get_contents(urls=urls, text=True, highlights=True)

        formatted_results = []
        for result in results.results:
            formatted_results.append({
                "title": result.title,
                "url": result.url,
                "text": getattr(result, "text", "")[:3000],
                "highlights": getattr(result, "highlights", []),
            })

        return {
            "success": True,
            "num_urls": len(urls),
            "results": formatted_results,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


# CLI interface
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python exa_search.py <query> [num_results]")
        print("       python exa_search.py --similar <url> [num_results]")
        print("       python exa_search.py --contents <url1> <url2> ...")
        sys.exit(1)

    if sys.argv[1] == "--similar":
        url = sys.argv[2]
        num = int(sys.argv[3]) if len(sys.argv) > 3 else 10
        result = find_similar(url, num)
    elif sys.argv[1] == "--contents":
        urls = sys.argv[2:]
        result = get_contents(urls)
    else:
        query = sys.argv[1]
        num = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        result = search(query, num)

    print(json.dumps(result, indent=2, ensure_ascii=False))
