# Electron App vs LoopDesk - 2Captcha Proxy Analys

**Datum:** 2026-01-02
**Status:** Kritiska skillnader identifierade

## 🔍 Proxy Implementation Jämförelse

### Electron App (`/Users/isak/Desktop/Bolags/src/proxy-manager.js`)

#### API Endpoint:
```javascript
const url = `https://api.2captcha.com/proxy/generate_white_list_connections?key=${API_KEY}&country=${country}&protocol=${protocol}&connection_count=${count}&ip=${myIp}`;
```

#### Proxy Format:
```javascript
// Response: ["ip:port", "ip:port", ...]
const proxies = result.data.map((proxy) => {
  const [host, port] = proxy.split(":");
  return {
    host,
    port: parseInt(port, 10),
    url: `http://${proxy}`,
    source: "2captcha"
  };
});
```

#### Playwright Config:
```javascript
getPlaywrightConfig(proxy) {
  if (!proxy) return {};

  return {
    server: proxy.url  // BARA URL, ingen auth!
  };
}
```

**Metod:** ✅ **IP-Whitelisting**
- Din IP skickas till 2captcha
- 2captcha whitelistar din IP på alla proxies
- Proxies returneras som `ip:port` utan credentials
- Playwright använder proxies **UTAN username/password**

---

### LoopDesk (`/Users/isak/Desktop/LoopDesk/src/lib/kungorelser/proxy-manager.ts`)

#### API Endpoint:
```typescript
const url = new URL('https://2captcha.com/api/v1/proxy');
url.searchParams.set('country', 'SE');
url.searchParams.set('type', 'residential');
url.searchParams.set('limit', '10');
```

#### Proxy Format:
```typescript
// Response: Array of objects with login/password
this.proxies = data.proxies.map((p) => ({
  id: p.id || `${p.ip}:${p.port}`,
  type: p.type || 'residential',
  ip: p.ip,
  port: p.port,
  login: p.login || '',
  password: p.password || '',
  url: p.login
    ? `http://${p.login}:${p.password}@${p.ip}:${p.port}`
    : `http://${p.ip}:${p.port}`,
}));
```

#### Playwright Config (FÖRE fix):
```typescript
// ❌ FÖRE FIX - saknade credentials
proxy: { server: options.proxyUrl }
```

#### Playwright Config (EFTER fix):
```typescript
// ✅ EFTER FIX - inkluderar credentials
proxy: {
  server: options.proxyUrl,
  ...(PROXY_USERNAME && PROXY_PASSWORD
    ? { username: PROXY_USERNAME, password: PROXY_PASSWORD }
    : {}),
}
```

**Metod:** ✅ **Authentication-baserad**
- Proxies returneras med login/password
- Playwright använder proxies **MED username/password**

---

## 📊 Vilken Metod Fungerar Bäst?

### IP-Whitelisting (Electron App)

**Fördelar:**
✅ Enklare - ingen authentication behövs
✅ Snabbare - ingen auth overhead
✅ Färre credentials att hantera

**Nackdelar:**
❌ Kräver statisk IP från din sida (eller uppdatering vid IP-change)
❌ Mindre flexibelt - om din IP ändras måste proxies regenereras
❌ Kan vara problem i moln-miljöer med dynamiska IPs

**Fungerar det för Electron?**
✅ **JA** - för desktop-applikation med relativt statisk IP

**Fungerar det för LoopDesk (Railway)?**
❌ **NEJ** - Railway deployment har dynamisk IP, svårt att whitelist

---

### Authentication-baserad (LoopDesk)

**Fördelar:**
✅ Fungerar från vilken IP som helst
✅ Perfekt för moln-deployments (Railway, AWS, etc.)
✅ Flexibelt - inga IP-whitelisting dependencies

**Nackdelar:**
❌ Kräver credentials (username/password)
❌ Lite mer komplext - måste hantera auth i Playwright config

**Fungerar det för Electron?**
✅ **JA** - skulle fungera, men overkill för desktop app

**Fungerar det för LoopDesk (Railway)?**
✅ **JA** - idealiskt för moln-deployment med dynamisk IP

---

## 🎯 Rekommendationer

### För Electron App (Desktop):
✅ **Behåll IP-whitelisting approach**
- Fungerar perfekt för desktop-användning
- Enklare implementation
- INGEN ändring behövs

### För LoopDesk (Railway):
✅ **Behåll authentication-baserad approach**
- Perfekt för moln-deployment
- Nu fixad med korrekt credentials
- Fungerar från vilken IP som helst

---

## 🔧 Testa Om Electron App Fungerar Med 2captcha Proxy

För att testa om Electron-appen kan hämta kungörelser med 2captcha proxy:

### 1. Sätt Environment Variables:
```bash
export TWOCAPTCHA_API_KEY="your_api_key_here"
export USE_PROXY="true"
```

### 2. Kör Electron-appen:
```bash
cd /Users/isak/Desktop/Bolags
npm start
```

### 3. Förväntade Loggar:
```
[ProxyManager] My IP: xxx.xxx.xxx.xxx
[ProxyManager] 2captcha balance: $xx.xx
[ProxyManager] Fetching 10 SE proxies from 2captcha...
[ProxyManager] Got 10 proxies from 2captcha
[ProxyManager] Loaded 10 proxies
PROXY: Activated with 10 Swedish proxies
```

### 4. Vid Detail Fetch:
```
DETAIL: switching to proxy http://xxx.xxx.xxx.xxx:xxxx
DETAIL: got text with length 1234
```

---

## ⚠️ Potentiella Problem Med Electron App

### Problem 1: API Endpoint
```javascript
const url = `https://api.2captcha.com/proxy/generate_white_list_connections...`;
```

**Verifiering behövs:**
- Är detta den korrekta 2captcha API endpoint för whitelist-proxies?
- Fungerar den fortfarande (API kan ha ändrats)?

**Test:**
```bash
curl "https://api.2captcha.com/proxy/generate_white_list_connections?key=YOUR_KEY&country=se&protocol=http&connection_count=5&ip=$(curl -s https://api.ipify.org)"
```

### Problem 2: Proxy Format
Electron-appen förväntar sig:
```json
{
  "status": "OK",
  "data": ["ip:port", "ip:port", ...]
}
```

Om 2captcha returnerar annat format → parsing kommer faila.

---

## ✅ Slutsats

**Kan Electron-appen hämta kungörelser med 2captcha proxy?**

**Teoretiskt:** ✅ **JA**
- Koden är skriven för att använda 2captcha IP-whitelisting proxies
- Smart proxy activation vid 429/CAPTCHA
- Proxy rotation implementerad

**I praktiken:** ⚠️ **BEHÖVER TESTAS**
- API endpoint måste verifieras
- Response format måste matcha
- IP-whitelisting måste fungera från din maskin

**Rekommendation:**
1. Testa Electron-appen med `USE_PROXY=true`
2. Verifiera att 2captcha API endpoint fungerar
3. Kontrollera att proxies faktiskt används i requests
4. Om problem → överväg byta till authentication-baserade proxies (som LoopDesk)

---

## 📝 Relaterade Filer

**Electron App:**
- `/Users/isak/Desktop/Bolags/src/proxy-manager.js` - Proxy management
- `/Users/isak/Desktop/Bolags/src/poit.js` - Main scraper logic

**LoopDesk:**
- `src/lib/kungorelser/proxy-manager.ts` - Authentication-based proxies
- `src/lib/kungorelser/scraper.ts` - Scraper with auth proxies
- `PROXY_AUTH_FIX.md` - Senaste proxy authentication fix
