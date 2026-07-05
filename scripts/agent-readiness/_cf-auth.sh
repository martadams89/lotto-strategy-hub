# Shared: resolve Cloudflare credentials into $AUTH (a curl header array) and
# set $API. Sourced by the other scripts. No secrets are stored in this file —
# they come from the environment or an (uncommitted) .env next to the script.
#
# Provide ONE of:
#   CF_API_TOKEN                         — a scoped API token (recommended)
#   CF_API_EMAIL + CF_API_KEY            — account email + Global API Key
API="https://api.cloudflare.com/client/v4"

if [ -n "${CF_API_TOKEN:-}" ]; then
  AUTH=(-H "Authorization: Bearer ${CF_API_TOKEN}")
elif [ -n "${CF_API_EMAIL:-}" ] && [ -n "${CF_API_KEY:-}" ]; then
  AUTH=(-H "X-Auth-Email: ${CF_API_EMAIL}" -H "X-Auth-Key: ${CF_API_KEY}")
else
  cat >&2 <<'MSG'
✗ No Cloudflare credentials found.

  Set ONE of the following — as environment variables, or in a `.env` file next
  to this script (copy .env.example → .env; .env is git-ignored):

  • CF_API_TOKEN  — a scoped API token (recommended). Create at
      https://dash.cloudflare.com/profile/api-tokens
      Scopes needed:
        - enable-dnssec.sh      : Zone › DNSSEC › Edit, Zone › Zone › Read
        - deploy-agent-worker.sh: Account › Workers Scripts › Edit,
                                  Zone › Workers Routes › Edit, Zone › Zone › Read

  • CF_API_EMAIL + CF_API_KEY  — your account email + Global API Key
      (Cloudflare dashboard › My Profile › API Tokens › Global API Key).
MSG
  exit 2
fi

command -v jq >/dev/null 2>&1 || { echo "✗ jq is required (macOS: brew install jq)" >&2; exit 2; }
