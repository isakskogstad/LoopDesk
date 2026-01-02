# 2Captcha Integration - Status och Resurser

**Datum:** 2026-01-02
**Status:** ✅ Fungerande integration (custom implementation)

## 📊 Nuvarande Implementation

LoopDesk har en **custom 2captcha integration** som fungerar perfekt för projektet:

### Komponenter:

#### 1. `src/lib/kungorelser/scraper.ts`
- **CAPTCHA Solving:** Base64 image-baserad lösning
- **Method:** Text recognition för enkla CAPTCHAs
- **API:** Direkta anrop till `2captcha.com/in.php` och `2captcha.com/res.php`
- **Balans-check:** Före varje solve
- **Retry logic:** Auto-reload vid failures

```typescript
async function solveCaptcha(imageBase64: string): Promise<string> {
  // Submit to 2captcha
  const submitUrl = new URL("https://2captcha.com/in.php");
  submitUrl.searchParams.set("key", TWOCAPTCHA_API_KEY);
  submitUrl.searchParams.set("method", "base64");

  // Poll for result
  const resultUrl = new URL("https://2captcha.com/res.php");
  // ... polling logic
}
```

#### 2. `src/lib/kungorelser/proxy-manager.ts`
- **Proxy Fetching:** Hämtar svenska residential proxies
- **API:** `2captcha.com/api/v1/proxy?country=SE&type=residential`
- **Credentials:** ✅ Nu korrekt implementerad med username/password
- **Rotation:** Smart proxy rotation vid 429 errors
- **Activation:** Auto-aktivering vid blocking

```typescript
async fetchProxies(): Promise<Proxy[]> {
  const url = new URL('https://2captcha.com/api/v1/proxy');
  url.searchParams.set('country', 'SE');
  url.searchParams.set('type', 'residential');
  url.searchParams.set('limit', '10');
  // Returns proxies with login credentials
}
```

#### 3. `src/lib/kungorelser/twocaptcha-stats.ts`
- **Balance:** `getBalance()` - Current account balance
- **Proxy Stats:** `getProxyInfo()` - Traffic usage
- **CAPTCHA Stats:** `getCaptchaStats()` - Hourly solving stats
- **Budget Report:** `getBudgetReport()` - Full cost analysis

## 🎯 Varför INTE Använda Official SDK?

### Nuvarande Approach (Custom):
✅ **Redan fungerande** - inga problem
✅ **Minimal dependencies** - mindre att underhålla
✅ **Full kontroll** - custom för exact use case
✅ **Tight integration** - med proxy manager, stats, etc.
✅ **TypeScript native** - type-safe implementation

### Official 2captcha-javascript SDK:
❌ **Extra dependency** - ytterligare paket att underhålla
❌ **Mer komplext** - supports features vi inte behöver
❌ **Integration work** - måste anpassa till existing code
⚠️ **Overkill** - för simple text CAPTCHAs

**Beslut:** Behåll custom implementation! 🎉

## 📚 2Captcha GitHub Repos - Referens

### Rekommenderade för Framtida Referens:

#### 1. **2captcha-javascript** (73 stars)
- **URL:** https://github.com/2captcha/2captcha-javascript
- **Language:** TypeScript
- **Use Case:** Om vi någonsin behöver lösa reCAPTCHA v2/v3 eller hCaptcha
- **När installera:** Om bolagsverket börjar använda mer advanced CAPTCHAs

#### 2. **cloudflare-demo** (43 stars)
- **URL:** https://github.com/2captcha/cloudflare-demo
- **Language:** JavaScript
- **Use Case:** Om bolagsverket börjar använda Cloudflare Turnstile
- **Technique:** Bypass Cloudflare protection

#### 3. **puppeteer-recaptcha-solver-using-clicks**
- **URL:** https://github.com/2captcha/puppeteer-recaptcha-solver-using-clicks
- **Language:** JavaScript (Puppeteer)
- **Use Case:** Grid-based reCAPTCHA (image selection)
- **Adaptable:** Kan konverteras till Playwright om behövs

### Installation (ENDAST om behövs i framtiden):

```bash
# OM behov av official SDK uppstår:
npm install @2captcha/captcha-solver

# Eller klona exempel:
cd /Users/isak/Desktop/LoopDesk/third_party
git clone https://github.com/2captcha/cloudflare-demo.git
```

## 🔧 Aktuella Förbättringar (Redan Gjorda)

### ✅ Proxy Authentication Fix (2026-01-02)
- **Problem:** Proxy credentials saknades i browser contexts
- **Fix:** Lagt till username/password från proxyManager till alla fetchDetailText calls
- **Result:** Proxy connections fungerar nu korrekt med auth

### ✅ Timeout Increases (2026-01-02)
- **Problem:** Angular app timeout:ade via proxy
- **Fix:** Ökat alla timeouts (15s→30s, 20s→45s, etc.)
- **Result:** Ger Angular app tid att rendera via proxy

### ✅ Detail Link Click (2026-01-02)
- **Problem:** Vissa detail pages kräver click på länk
- **Fix:** Lagt till detail link click logic (from Electron app)
- **Result:** Matchar Electron app behavior

## 📊 2Captcha API Endpoints i Användning

### CAPTCHA Solving:
```
POST https://2captcha.com/in.php
  ?key={API_KEY}
  &method=base64
  &json=1
  &body={base64_image}

GET https://2captcha.com/res.php
  ?key={API_KEY}
  &action=get
  &id={captcha_id}
  &json=1
```

### Proxy Management:
```
GET https://2captcha.com/api/v1/proxy
  ?key={API_KEY}
  &country=SE
  &type=residential
  &limit=10
```

### Balance Check:
```
GET https://2captcha.com/res.php
  ?key={API_KEY}
  &action=getbalance
  &json=1
```

### Stats (Hourly):
```
GET https://2captcha.com/res.php
  ?key={API_KEY}
  &action=getstats
  &date={YYYY-MM-DD}
```

## 💰 Kostnader

### CAPTCHA Solving:
- **Simple Text:** ~$0.001 per solve
- **Estimated:** ~10-50 per scrape session
- **Cost:** ~$0.01-0.05 per session

### Proxy Usage:
- **Swedish Residential:** ~$3/GB
- **Traffic:** ~100-500MB per session
- **Cost:** ~$0.30-1.50 per session

**Total Cost:** ~$0.31-1.55 per scrape session

## 🎯 När Överväga Official SDK

Installera `2captcha-javascript` SDK **ENDAST** om:

1. ❌ Bolagsverket börjar använda **reCAPTCHA v2/v3**
2. ❌ Behov av **hCaptcha** eller **Cloudflare Turnstile**
3. ❌ Behov av **FunCaptcha** eller **GeeTest**
4. ❌ Nuvarande implementation **failar systematiskt**

**Annars:** Behåll custom implementation! ✅

## 📝 Relaterade Filer

- `src/lib/kungorelser/scraper.ts` - CAPTCHA solving
- `src/lib/kungorelser/proxy-manager.ts` - Proxy fetching and rotation
- `src/lib/kungorelser/twocaptcha-stats.ts` - Stats and balance
- `PROXY_AUTH_FIX.md` - Senaste proxy fix
- `DETAIL_LINK_FIX.md` - Detail link fix

## ✅ Slutsats

**Nuvarande 2captcha integration är PERFEKT för LoopDesk:**
- ✅ Fungerar stabilt
- ✅ Minimal complexity
- ✅ Full kontroll
- ✅ Type-safe TypeScript
- ✅ Tight integration med proxy manager

**Ingen action behövs!** 🎉

Keep repos som referens för framtida advanced use cases.
