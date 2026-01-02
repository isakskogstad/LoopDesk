# Proxy Cost Separation Strategy

**Datum:** 2026-01-02
**Status:** Rekommendation för framtida optimering

## 🎯 Nuvarande Situation

LoopDesk använder **2captcha för BÅDE**:
1. **Proxies** (IP-whitelisting, residential Swedish proxies)
2. **CAPTCHA solving** (base64 image recognition)

**Problem:**
- Samma `TWOCAPTCHA_API_KEY` för både services
- Om balance är låg påverkas BÅDE proxies OCH CAPTCHA solving
- Svårt att separera kostnader för proxies vs CAPTCHA
- Ingen fallback om 2captcha proxies är upptagna/dyra

## 💰 Kostnadsjämförelse

### 2captcha Pricing (aktuell):
- **Proxies**: ~$1.50 per 1000 requests (residential SE)
- **CAPTCHA**: ~$2.99 per 1000 solves (image CAPTCHA)
- **Total cost**: Kombinerad på samma konto

### Alternativa Proxy Providers:
| Provider | Type | Cost | Pros | Cons |
|----------|------|------|------|------|
| **Bright Data** | Residential | $8.40/GB | Högkvalitet, stor pool | Dyrare |
| **Smartproxy** | Residential | $7/GB | Bra för SE, unlimiterad concurrent | Premium pris |
| **Oxylabs** | Residential | $8/GB | Enterprise-grade | Dyrt |
| **ProxyScrape** | Residential | $49/month | Unlimited bandwidth | Variabel kvalitet |
| **IPRoyal** | Residential | $7/GB | Bra SE coverage | Mindre provider |

## 📊 Rekommenderad Strategy

### Option 1: Behåll 2captcha för ALLT (nuvarande)
**Fördelar:**
- ✅ Enkel integration (redan implementerad)
- ✅ En API key att hantera
- ✅ IP-whitelisting fungerar perfekt med Railway
- ✅ Bevisat fungerande (Electron app använder samma)

**Nackdelar:**
- ❌ Ingen cost separation
- ❌ Single point of failure
- ❌ Om balance är låg stannar allt

**När använda:** Small scale, låg volym (< 1000 searches/day)

---

### Option 2: Separera Proxies och CAPTCHA
**Setup:**
```env
# 2captcha för CAPTCHA solving ENDAST
TWOCAPTCHA_API_KEY=xxx

# Dedikerad proxy provider (t.ex. Bright Data, Smartproxy)
PROXY_PROVIDER=brightdata
PROXY_API_KEY=yyy
PROXY_USERNAME=customer-xxx
PROXY_PASSWORD=yyy
```

**Fördelar:**
- ✅ Tydlig cost separation
- ✅ Kan optimera varje service separat
- ✅ Fallback möjlighet
- ✅ Skalbar för högre volym

**Nackdelar:**
- ❌ Mer komplex setup
- ❌ Fler API keys att hantera
- ❌ Behöver ändra ProxyManager (stöd för andra providers)

**När använda:** High scale, > 1000 searches/day, behöver detaljerad cost tracking

---

### Option 3: Hybrid Approach (smart fallback)
**Setup:**
```env
# Primary: 2captcha för proxies + CAPTCHA
TWOCAPTCHA_API_KEY=xxx

# Fallback: Static proxy eller annan provider
PROXY_FALLBACK_PROVIDER=brightdata
PROXY_FALLBACK_USERNAME=xxx
PROXY_FALLBACK_PASSWORD=yyy
```

**Logic:**
1. Använd 2captcha proxies by default
2. Vid 2captcha balance < $1: Switch till fallback
3. Vid 2captcha proxies failed (rate limit): Switch till fallback
4. CAPTCHA använder ALLTID 2captcha

**Fördelar:**
- ✅ Best of both worlds
- ✅ Resilience mot 2captcha outages
- ✅ Fortsatt fungerande även om 2captcha balance är låg
- ✅ Kan välja billigaste option dynamiskt

**Nackdelar:**
- ❌ Mest komplex implementation
- ❌ Behöver ProxyManager refactor för multi-provider support

**När använda:** Medium-high scale, production-critical, behöver high availability

---

## 🔧 Implementation Plan för Option 3 (Recommended)

### Steg 1: Utöka ProxyManager med Multi-Provider Support
```typescript
// src/lib/kungorelser/proxy-manager.ts
interface ProxyProvider {
  name: string;
  fetchProxies(): Promise<Proxy[]>;
  checkBalance(): Promise<number>;
}

class TwoCaptchaProvider implements ProxyProvider {
  // Current implementation
}

class BrightDataProvider implements ProxyProvider {
  // New implementation for fallback
}

class ProxyManager {
  private providers: ProxyProvider[] = [];
  private currentProvider: ProxyProvider;

  async selectProvider(): Promise<ProxyProvider> {
    // 1. Check 2captcha balance
    // 2. If low, switch to fallback
    // 3. Return best available provider
  }
}
```

### Steg 2: Environment Variables
```env
# Primary proxy provider (2captcha)
PROXY_PRIMARY_PROVIDER=2captcha
TWOCAPTCHA_API_KEY=xxx

# Fallback proxy provider (optional)
PROXY_FALLBACK_PROVIDER=brightdata
PROXY_FALLBACK_USERNAME=customer-xxx
PROXY_FALLBACK_PASSWORD=xxx

# Balance threshold for fallback ($)
PROXY_FALLBACK_THRESHOLD=1.0
```

### Steg 3: Smart Provider Selection
```typescript
async function selectProxyProvider(): Promise<ProxyProvider> {
  // Check 2captcha balance
  const balance = await twoCaptchaProvider.checkBalance();

  if (balance < PROXY_FALLBACK_THRESHOLD) {
    console.log(`[ProxyManager] Balance low ($${balance}), switching to fallback`);
    return fallbackProvider;
  }

  // Check if 2captcha proxies are working
  const proxyStatus = await twoCaptchaProvider.getStatus();
  if (proxyStatus.failed > proxyStatus.total * 0.5) {
    console.log('[ProxyManager] Too many failed proxies, switching to fallback');
    return fallbackProvider;
  }

  return twoCaptchaProvider;
}
```

### Steg 4: Cost Tracking
```typescript
interface ProxyCostTracking {
  provider: string;
  requests: number;
  estimatedCost: number;
  date: string;
}

// Log costs to database for analysis
await prisma.proxyCostLog.create({
  data: {
    provider: 'brightdata',
    requests: 100,
    estimatedCost: 0.15,
    date: new Date(),
  }
});
```

---

## 💡 Nuvarande Rekommendation

**För LoopDesk just nu:**
→ **Behåll Option 1** (2captcha för allt)

**Varför:**
1. Fungerar perfekt med nuvarande volym
2. Enkel att underhålla
3. Bevisat fungerande (Electron app)
4. IP-whitelisting är optimal för Railway

**När byta till Option 3:**
1. Searches > 1000/day
2. 2captcha costs > $50/month
3. Need for high availability (SLA krav)
4. Behöver detaljerad cost analytics

---

## 📈 Cost Monitoring

För att besluta när det är dags att separera, monitora:

1. **Monthly 2captcha spend**
   - Check via 2captcha dashboard
   - Alert om > $50/month

2. **Proxy vs CAPTCHA ratio**
   - Track antal proxy requests vs CAPTCHA solves
   - Om proxies > 70% av cost → överväg separation

3. **Failure rate**
   - Track proxy failure rate
   - Om > 20% failures → överväg fallback

4. **Search volume**
   - Track searches per day
   - Om > 500/day → överväg Option 3

---

## ✅ Action Items

1. **Now**: Behåll nuvarande setup (2captcha för allt)
2. **Monitor**: Sätt upp cost tracking i Railway logs
3. **Alert**: Skapa alert för 2captcha balance < $5
4. **Review**: Utvärdera cost separation efter 1 månad production data

---

**Relaterade Dokument:**
- `ELECTRON_PROXY_PORT_COMPLETE.md` - Nuvarande proxy implementation
- `src/lib/kungorelser/proxy-manager.ts` - Proxy manager code
- `src/lib/kungorelser/proxy-init.ts` - Auto-refresh system
