# exmar_front

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-p1adn4av)

Site vitrine **EXMAR-OI** (front public) **+** application back-office d'expertise
maritime, réunis dans un seul dépôt et un seul déploiement.

## Structure

| Zone | URL | Code | Description |
|------|-----|------|-------------|
| Site public | `/` | `src/` | Vitrine marketing (accueil, plaisance, pêche, commerce, contact). |
| Back-office | `/admin` | `src/admin/` | Application d'expertise maritime (dossiers, rapports `.docx`, IA, auth experts). |

Les deux applications partagent **un seul projet Supabase** (variables `.env` communes)
et un seul build Vite (multi-page). Le bouton « Administrateur » de l'en-tête renvoie
vers `/admin`. L'app admin utilise `basename="/admin"` : toutes ses routes internes sont
automatiquement préfixées, aucune réécriture de liens nécessaire.

## Configuration

Créer un fichier `.env` à la racine avec les identifiants du **projet Supabase Exmar** :

```
VITE_SUPABASE_URL=https://<votre-projet>.supabase.co
VITE_SUPABASE_ANON_KEY=<clé anon>
```

### Base de données

Le projet Supabase Exmar contient déjà le schéma d'expertise (migrations
`supabase/migrations/2025…`–`2026012…`). Une seule migration supplémentaire est à
appliquer pour le formulaire de contact du site public :

- `supabase/migrations/20260318112033_create_contact_submissions.sql`

## Développement

```
npm install
npm run dev        # site sur / , admin sur /admin
npm run build      # build multi-page (dist/index.html + dist/admin/index.html)
```

## Déploiement

Le routage SPA des deux apps nécessite des règles de réécriture (fournies) :
`public/_redirects` (Netlify / Cloudflare Pages) et `vercel.json` (Vercel).
