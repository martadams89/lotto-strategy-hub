# Agent-readiness scripts

This site is a **Cloudflare Pages** app. Its AI-agent surface — an MCP server,
Markdown content negotiation, Web Bot Auth, Agent Skills index, `auth.md`, and
WebMCP — lives in the site's middleware (`functions/_middleware.js` or
`src/middleware.js`) and **deploys automatically on push**.

The one thing that isn't in the repo is **DNSSEC**, which is a Cloudflare zone
setting. It's required for the **DNS-AID** agent-discovery records to validate
(<https://isitagentready.com> reports "records found, but DNSSEC was not
validated" until it's on).

**No credentials are committed** — supply them via environment variables or a
git-ignored `.env` (copy `.env.example`). Requires `curl` + `jq`.

## Files
| File | What it does |
|---|---|
| `enable-dnssec.sh` | Enables DNSSEC for the zone and prints the DS record. |
| `_cf-auth.sh` | Shared Cloudflare credential resolver (sourced by the script). |
| `.env.example` | Template for the credentials. |

## Setup & run
```bash
cp .env.example .env         # fill in CF_API_TOKEN (or CF_API_EMAIL + CF_API_KEY)
./enable-dnssec.sh <your-zone-domain>
```
On **Cloudflare Registrar** the DS record is published to the registry
automatically — nothing else to do. If the domain is registered elsewhere, paste
the printed DS record into that registrar's DNSSEC panel. See `.env.example` for
the exact token scopes.

> Note: DNSSEC is set on the **registrable zone** (e.g. `example.co.uk`), not on
> a subdomain — for a site served from a subdomain, run this against the parent
> zone (once per zone covers all its subdomains).
