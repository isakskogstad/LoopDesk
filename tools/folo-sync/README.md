# Folo Sync Daemon

Synkroniserar RSS-prenumerationer fran Folo desktop-appen till LoopDesk.

## Hur det fungerar

1. **Daemon** - En Node.js-process som kors i bakgrunden
2. **LevelDB Watcher** - Overvakar Folos IndexedDB for andrigar
3. **API Sync** - Skickar nya feeds till LoopDesk API

## Installation

### Forutsattningar

- macOS
- Node.js >= 18
- Folo desktop-appen installerad
- Ett LoopDesk-konto

### Snabbinstallation

```bash
cd /Users/isak/CLAUDE/projects/LoopDesk/tools/folo-sync
npm install
node install.js
```

Installern fragar efter:
- `FOLO_SYNC_API_KEY` - API-nyckel (genereras i LoopDesk)
- `LOOPDESK_USER_EMAIL` - Din LoopDesk e-postadress

### Manuell installation

1. Kopiera filer till `~/.config/folo-sync/`
2. Redigera plist-filen med dina credentials
3. Ladda med `launchctl load`

## Konfiguration

### Miljvariabler

| Variabel | Beskrivning |
|----------|-------------|
| `FOLO_SYNC_API_KEY` | API-nyckel for LoopDesk sync endpoint |
| `LOOPDESK_USER_EMAIL` | Din LoopDesk e-postadress |
| `LOOPDESK_API_URL` | API URL (default: produktion) |
| `DEBUG` | Satt till "true" for debug-loggar |

### API-nyckel

Lagg till i Railway:
```bash
railway variables set FOLO_SYNC_API_KEY="din-hemliga-nyckel"
```

## Anvandning

### Kommandon

```bash
# Kora en gang (test)
npm run sync-once

# Starta daemon manuellt
npm start

# Watch mode
npm run watch

# Installera som launchd-tjant
npm run install-daemon

# Avinstallera
npm run uninstall-daemon
```

### launchctl-kommandon

```bash
# Kolla status
launchctl list | grep folo-sync

# Stoppa daemon
launchctl unload ~/Library/LaunchAgents/com.loopdesk.folo-sync.plist

# Starta daemon
launchctl load ~/Library/LaunchAgents/com.loopdesk.folo-sync.plist

# Visa loggar
tail -f ~/Library/Logs/folo-sync/folo-sync.log
```

## Felskning

### Daemon startar inte

1. Kolla loggar: `tail -f ~/Library/Logs/folo-sync/folo-sync.error.log`
2. Verifiera Node.js-sokv g: `which node`
3. Testa manuellt: `cd ~/.config/folo-sync && node daemon.js --once`

### Feeds synkas inte

1. Verifiera att Folo kors
2. Kolla att du har feeds i Folo
3. Testa API:et manuellt:

```bash
curl -X POST https://loopdesk-production.up.railway.app/api/feeds/sync \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "x-user-email: your@email.com" \
  -d '{"feeds": [{"url": "https://example.com/feed.xml"}]}'
```

### Folo-data hittas inte

Kontrollera att Folo ar installerat:
```bash
ls ~/Library/Containers/is.follow/
```

## Arkitektur

```
+---------------+     +------------------+     +-------------+
|  Folo App     | --> |  Folo Sync       | --> |  LoopDesk   |
|  (Electron)   |     |  Daemon          |     |  API        |
|               |     |                  |     |             |
|  IndexedDB    |     |  - LevelDB read  |     |  /api/feeds |
|  (LevelDB)    |     |  - File watcher  |     |  /sync      |
+---------------+     +------------------+     +-------------+
       |                      |                       |
       v                      v                       v
   ~/Library/           ~/.config/              Railway
   Containers/          folo-sync/              Postgres
   is.follow/           state.json              (Neon)
```

## Sakerhet

- API-nyckeln lagras i launchd plist (endast lasbar av dig)
- State-filen innehaller bara synkade URLs
- Daemon kor med lag prioritet (Nice 10)

## Lokal utveckling

```bash
# Kora med debug
DEBUG=true node daemon.js

# Kora mot lokal server
LOOPDESK_API_URL=http://localhost:3000 node daemon.js --once
```
