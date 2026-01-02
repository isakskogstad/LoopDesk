# Railway Environment Variables Cleanup

**Datum:** 2026-01-02
**Status:** Manual action required

## 🗑️ Obsolete Variables att Ta Bort

Efter porten av Electron's IP-whitelisting proxy system använder vi inte längre username/password authentication för proxies. Följande environment variables är **obsolete och bör tas bort**:

### Variables att Ta Bort:
```
PROXY_USERNAME=ub11557c956fd05c3-zone-custom-region-se-session-z7TY3T2RP-sessTime-2
PROXY_PASSWORD=ub11557c956fd05c3
```

## Varför Ta Bort Dem?

1. **Används inte längre** - Efter IP-whitelisting port (commit c449325) använder vi inte credentials
2. **Förvirrande** - Kan ge intryck att de fortfarande behövs
3. **Säkerhet** - Mindre credentials = mindre attack surface
4. **Renlighet** - Håller environment configuration clean

## Hur Ta Bort (Railway Dashboard):

1. Öppna https://railway.app/
2. Välj projekt: **LoopDesk**
3. Gå till **Variables** tab
4. Leta upp och ta bort:
   - `PROXY_USERNAME`
   - `PROXY_PASSWORD`
5. Klicka **Deploy** för att applicera ändringarna

## Alternativ: Railway CLI (GraphQL)

Railway CLI har ingen direkt --delete flag, men du kan använda Railway's GraphQL API:

```bash
# Exempel (kräver Railway API token):
curl -X POST https://backboard.railway.app/graphql \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { variableDelete(input: { projectId: \"PROJECT_ID\", environmentId: \"ENV_ID\", name: \"PROXY_USERNAME\" }) { id } }"
  }'
```

## Nuvarande Variables som BEHÅLLS:

✅ Behåll dessa (används aktivt):
- `TWOCAPTCHA_API_KEY` - För IP-whitelisting proxies
- `PROXY_SERVER` - För fallback static proxy (om "disabled" = ingen proxy)
- `DATABASE_URL` - Neon PostgreSQL
- `AUTH_SECRET`, `AUTH_URL` - Next-Auth
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth
- Alla andra variables

## Verification Efter Borttagning:

1. Deploy kommer lyckas (inga dependencies)
2. Proxy system fortsätter fungera med IP-whitelisting
3. Scraping fortsätter fungera normalt

---

**Action Required:** Ta bort PROXY_USERNAME och PROXY_PASSWORD från Railway Dashboard
