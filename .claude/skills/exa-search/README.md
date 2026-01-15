# Exa Search Skill

Avancerad semantisk webbsökning med Exa AI för Claude Code.

## Funktioner

- **Semantisk sökning** - Naturligt språk, förstår kontext
- **Hitta liknande** - Hitta sidor liknande en given URL
- **Hämta innehåll** - Extrahera text och highlights från URLs
- **Datumfiltrering** - Begränsa till specifika tidsperioder
- **Domänfiltrering** - Inkludera/exkludera specifika domäner

## Installation

```bash
pip3 install --break-system-packages exa_py
```

## Användning

### CLI

```bash
# Semantisk sökning
python3 exa_search.py "AI startups Sverige 2024" 10

# Hitta liknande sidor
python3 exa_search.py --similar "https://breakit.se" 10

# Hämta innehåll från URLs
python3 exa_search.py --contents "https://url1.com" "https://url2.com"
```

### I Python

```python
from exa_search import search, find_similar, get_contents

# Sök
results = search(
    query="svenska tech nyheter",
    num_results=10,
    start_published_date="2024-01-01",
    include_domains=["breakit.se", "di.se"]
)

# Hitta liknande
similar = find_similar("https://example.com", num_results=5)

# Hämta innehåll
contents = get_contents(["https://url1.com", "https://url2.com"])
```

### Via Slash Command

```
/exa-search
```

## API-nyckel

Konfigurerad i skriptet. Kan överridas:

```bash
export EXA_API_KEY="din-nyckel"
```

## Output-format

```json
{
  "success": true,
  "query": "söksträng",
  "num_results": 10,
  "results": [
    {
      "title": "Artikeltitel",
      "url": "https://...",
      "published_date": "2024-01-01T00:00:00.000Z",
      "author": "Författare",
      "text": "Artikeltext (max 2000 tecken)...",
      "highlights": ["Relevanta utdrag..."]
    }
  ]
}
```

## Avancerade parametrar

| Parameter | Beskrivning | Default |
|-----------|-------------|---------|
| `num_results` | Antal resultat | 10 |
| `search_type` | 'auto', 'neural', 'keyword' | 'auto' |
| `include_text` | Inkludera fulltext | True |
| `include_highlights` | Inkludera highlights | True |
| `start_published_date` | Filtrera från datum | None |
| `end_published_date` | Filtrera till datum | None |
| `include_domains` | Endast dessa domäner | None |
| `exclude_domains` | Exkludera domäner | None |
