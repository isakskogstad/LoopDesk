# RSSHub Docker Setup

Denna guide visar hur du kör din egen RSSHub-instans för bättre prestanda och tillgång till autentiserade källor.

## Fördelar med egen instans

- **Ingen rate limiting** - Publika instanser kan vara långsamma eller blockerade
- **Autentiserade källor** - Twitter, Instagram kräver inloggning
- **Snabbare** - Lokal instans = minimal latens
- **Mer pålitlig** - Du kontrollerar infrastrukturen

## Installation

### 1. Installera Docker Desktop

macOS:
```bash
brew install --cask docker
```

Eller ladda ner från: https://www.docker.com/products/docker-desktop

### 2. Starta RSSHub

```bash
# Från projektmappen
npm run docker:up
```

Detta startar:
- **RSSHub** på http://localhost:1200
- **Redis** för caching
- **Browserless** för JavaScript-rendering

### 3. Verifiera

Öppna http://localhost:1200 i webbläsaren. Du bör se RSSHub-startsidan.

## Konfigurera sociala medier

Kopiera `.env.example` till `.env` och fyll i dina uppgifter:

```bash
cp .env.example .env
```

### Twitter/X

För Twitter-flöden behöver du ett av dessa:

**Alternativ 1: Auth Token (enklast)**
1. Logga in på twitter.com
2. Öppna DevTools (F12) → Application → Cookies
3. Kopiera värdet för `auth_token`
4. Lägg till i `.env`:
   ```
   TWITTER_AUTH_TOKEN=ditt_token_här
   ```

**Alternativ 2: Användarnamn/Lösenord**
```
TWITTER_USERNAME=ditt_användarnamn
TWITTER_PASSWORD=ditt_lösenord
```

### Instagram

```
IG_USERNAME=ditt_användarnamn
IG_PASSWORD=ditt_lösenord
```

### YouTube (valfritt - ökar API-gränser)

1. Skapa ett projekt på Google Cloud Console
2. Aktivera YouTube Data API v3
3. Skapa en API-nyckel
4. Lägg till i `.env`:
   ```
   YOUTUBE_KEY=din_api_nyckel
   ```

### GitHub (valfritt - för privata repos)

1. Gå till GitHub → Settings → Developer settings → Personal access tokens
2. Skapa en token med `repo` scope
3. Lägg till i `.env`:
   ```
   GITHUB_ACCESS_TOKEN=din_token
   ```

## Kommandon

```bash
# Starta alla containers
npm run docker:up

# Stoppa alla containers
npm run docker:down

# Visa RSSHub-loggar
npm run docker:logs

# Visa status
npm run docker:status
```

## Felsökning

### RSSHub svarar inte

```bash
# Kolla att containers körs
docker compose ps

# Kolla loggar
docker compose logs rsshub
```

### Twitter fungerar inte

- Verifiera att `TWITTER_AUTH_TOKEN` är korrekt
- Auth tokens kan expira - skapa ett nytt

### Instagram fungerar inte

- Instagram är strikt mot automation
- Prova att använda en proxy: `IG_PROXY=http://din-proxy:port`
- Alternativt: Använd `/picuki/profile/username` som inte kräver inloggning

## Arkitektur

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App                          │
│                 localhost:3000                          │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                     RSSHub                               │
│                 localhost:1200                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Routes: Twitter, Instagram, LinkedIn, etc.      │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────┬─────────────────┬─────────────────────┘
                  │                 │
         ┌────────▼────────┐ ┌──────▼──────┐
         │      Redis      │ │  Browserless │
         │    (cache)      │ │  (puppeteer) │
         └─────────────────┘ └──────────────┘
```

## Tillgängliga routes

Se full dokumentation: https://docs.rsshub.app

Vanliga routes:
- `/twitter/user/username` - Twitter-användare
- `/instagram/user/username` - Instagram (kräver auth)
- `/picuki/profile/username` - Instagram (utan auth)
- `/telegram/channel/channelname` - Telegram-kanal
- `/youtube/channel/channelId` - YouTube-kanal
- `/github/repos/owner/repo` - GitHub repo
