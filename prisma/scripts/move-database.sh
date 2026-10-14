#!/usr/bin/env bash
# Copies everything in the current database (DATABASE_URL_UNPOOLED) into the
# new Frankfurt one (NEW_DATABASE_URL_UNPOOLED), both read from .env.local.
# The current database is only read, never changed.
#
#   bash prisma/scripts/move-database.sh           checks both, writes nothing
#   bash prisma/scripts/move-database.sh --apply   copies, then compares row counts
#
# Only the app's own tables (the "public" schema) are copied; Neon's own
# login tables (neon_auth) are left alone on both sides. Connection details
# are never printed.
set -euo pipefail
cd "$(dirname "$0")/../.."

get() { grep "^$1=" .env.local | head -1 | cut -d= -f2- | sed 's/^"//;s/"$//'; }
OLD=$(get DATABASE_URL_UNPOOLED)
NEW=$(get NEW_DATABASE_URL_UNPOOLED)
[ -n "$OLD" ] || { echo "DATABASE_URL_UNPOOLED is missing from .env.local."; exit 1; }
[ -n "$NEW" ] || { echo "NEW_DATABASE_URL_UNPOOLED is missing from .env.local."; exit 1; }
[ "$OLD" != "$NEW" ] || { echo "Both point at the same database. Nothing to do."; exit 1; }

host() { echo "$1" | sed -E 's#^[^@]*@([^/?]*).*#\1#'; }
echo "From: $(host "$OLD")"
echo "To:   $(host "$NEW")"

# pg_dump has to be at least as new as the server it reads from.
OLD_MAJOR=$(psql "$OLD" -Atc "show server_version_num" | cut -c1-2)
NEW_MAJOR=$(psql "$NEW" -Atc "show server_version_num" | cut -c1-2)
BIN=""
for v in "$OLD_MAJOR" 18 17 16; do
  if [ -x "/opt/homebrew/opt/postgresql@$v/bin/pg_dump" ] && [ "$v" -ge "$OLD_MAJOR" ]; then BIN="/opt/homebrew/opt/postgresql@$v/bin/"; break; fi
done
echo "Postgres: current $OLD_MAJOR, new $NEW_MAJOR"
[ -n "$BIN" ] || { echo "Needs pg_dump $OLD_MAJOR or newer. Run: brew install postgresql@$OLD_MAJOR  — then run this again."; exit 1; }

TABLES_SQL="select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by 1"
counts() {
  for t in $(psql "$1" -Atc "$TABLES_SQL"); do
    printf "%s %s\n" "$t" "$(psql "$1" -Atc "select count(*) from public.\"$t\"")"
  done
}

EXISTING=$(psql "$NEW" -Atc "select count(*) from information_schema.tables where table_schema = 'public'")
echo
echo "Current database, rows per table:"
counts "$OLD" | column -t
echo
echo "Tables already in the new database: $EXISTING"

if [ "${1:-}" != "--apply" ]; then
  echo
  echo "Nothing written — run again with --apply to copy."
  exit 0
fi

if [ "$EXISTING" != "0" ]; then
  echo "The new database already has tables, so this won't copy over them. Stopping."
  exit 1
fi

DUMP=$(mktemp -d)/zm-portfolio.dump
echo
echo "Reading the current database…"
"${BIN}pg_dump" "$OLD" --schema=public --no-owner --no-acl --format=custom --file="$DUMP"
echo "Writing to the new database…"
# The new database already has an empty public schema, so its "already exists" notice is expected.
"${BIN}pg_restore" --dbname="$NEW" --no-owner --no-acl "$DUMP" 2>&1 | grep -v 'schema "public" already exists' || true
rm -f "$DUMP"

echo
echo "Comparing row counts:"
diff <(counts "$OLD") <(counts "$NEW") > /dev/null \
  && { counts "$NEW" | column -t; echo; echo "All tables match. The copy is complete."; } \
  || { echo "These differ (current < > new):"; diff <(counts "$OLD") <(counts "$NEW") || true; exit 1; }
