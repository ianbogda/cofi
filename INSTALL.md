# Installation

Prérequis : Node.js 22+, PostgreSQL 17+, npm.

```bash
sudo -u postgres createuser --pwprompt cofi
sudo -u postgres createdb -O cofi cofi
psql postgresql://cofi:cofi@127.0.0.1:5432/cofi -f migrations/001_init.sql
npm install
npm run build
```

API :
```bash
DATABASE_URL=postgresql://cofi:cofi@127.0.0.1:5432/cofi PORT=3212 npm run dev:api
```

Web :
```bash
VITE_API_URL=http://localhost:3212/api npm run dev:web
```

En production, faire proxifier `/api/*` vers l'API et servir `apps/web/dist` par Caddy. Le stockage documentaire est `storage/documents` par défaut ; définir `DOCUMENT_STORAGE` pour un chemin persistant dédié.
