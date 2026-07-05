#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Enable DNSSEC on one or more Cloudflare zones and print the DS record.
#
# WHY: DNS-AID (agent discovery) records must be DNSSEC-signed so validating
# resolvers return authenticated data (AD=true). Without it, isitagentready.com
# reports "DNS-AID records found, but DNSSEC was not validated".
#
# WHAT: activates DNSSEC per zone (idempotent) and prints the DS record. If the
# domain is registered with Cloudflare Registrar the DS is published to the
# registry AUTOMATICALLY — nothing else to do. If it's registered elsewhere,
# paste the printed DS record into that registrar's DNSSEC panel.
#
# HOW:  CF_API_TOKEN=… ./enable-dnssec.sh example.com [another.com …]
#   or: put creds in .env (see .env.example) and: ./enable-dnssec.sh example.com
#   or: set CF_DOMAINS="a.com b.com" in .env and run with no args.
#
# Requires: curl + jq. Credentials via env or .env (never committed).
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
[ -f "$HERE/.env" ] && { set -a; . "$HERE/.env"; set +a; }
# shellcheck source=_cf-auth.sh
. "$HERE/_cf-auth.sh"

DOMAINS=("$@")
if [ ${#DOMAINS[@]} -eq 0 ] && [ -n "${CF_DOMAINS:-}" ]; then IFS=' ' read -r -a DOMAINS <<< "$CF_DOMAINS"; fi
if [ ${#DOMAINS[@]} -eq 0 ]; then
  echo "✗ No domains given. Usage: $0 <zone-domain> [zone-domain…]  (or set CF_DOMAINS in .env)" >&2
  exit 2
fi

for DOMAIN in "${DOMAINS[@]}"; do
  echo "════════════════════════════════════════════════════════════════"
  echo "  ${DOMAIN}"
  ZONE=$(curl -sS "${API}/zones?name=${DOMAIN}" "${AUTH[@]}" | jq -r '.result[0].id // empty')
  if [ -z "$ZONE" ]; then
    echo "  ✗ zone not found. DNSSEC is set on the registrable zone (e.g. example.co.uk)," >&2
    echo "    not on a subdomain — pass the parent zone instead." >&2
    continue
  fi
  curl -sS -X PATCH "${API}/zones/${ZONE}/dnssec" "${AUTH[@]}" \
    -H "Content-Type: application/json" --data '{"status":"active"}' >/dev/null || true
  DS=$(curl -sS "${API}/zones/${ZONE}/dnssec" "${AUTH[@]}")
  echo "  DNSSEC status: $(echo "$DS" | jq -r '.result.status')"
  echo "  ── DS record (auto-published on Cloudflare Registrar; else paste at your registrar): ──"
  echo "$DS" | jq -r '.result | "    Key Tag:     \(.key_tag)\n    Algorithm:   \(.algorithm)\n    Digest Type: \(.digest_type)\n    Digest:      \(.digest)\n    DS record:   \(.ds)"'
done

echo
echo "Once the DS record is live at the registry, DNSSEC validates within"
echo "minutes–48h. Re-run the isitagentready.com DNS-AID check after that."
