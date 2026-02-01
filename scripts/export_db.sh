#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./export_db.sh [PRISMA_DATABASE_URL] [OUT_DIR]

if [[ -n "${1:-}" ]]; then
  DB_URL="$1"
else
  DB_URL="${PRISMA_DATABASE_URL:-}"
fi

if [[ -z "$DB_URL" ]]; then
  echo "PRISMA_DATABASE_URL not set."
  echo
  echo "Either:"
  echo "  ./export_db.sh postgres://..."
  echo "or:"
  echo "  source .env && ./export_db.sh"
  exit 1
fi

OUT_DIR="${2:-exports}"
mkdir -p "$OUT_DIR"

echo "Exporting database to CSV → $OUT_DIR"
echo

declare -A COUNTS
TOTAL_ROWS=0

run_copy() {
  local label="$1"
  local sql="$2"

  printf "%-25s " "$label"

  local output
  output=$(psql "$DB_URL" -c "$sql")

  local rows
  rows=$(echo "$output" | awk '/COPY/ {print $2}')

  COUNTS["$label"]="$rows"
  TOTAL_ROWS=$((TOTAL_ROWS + rows))

  echo ": $rows rows"
}

run_copy "Session" \
  '\copy "Session" TO '"$OUT_DIR"'/Session.csv CSV HEADER'

run_copy "Round" \
  '\copy "Round" TO '"$OUT_DIR"'/Round.csv CSV HEADER'

run_copy "RoundFeedback" \
  '\copy "RoundFeedback" TO '"$OUT_DIR"'/RoundFeedback.csv CSV HEADER'

run_copy "Feedback" \
  '\copy "Feedback" TO '"$OUT_DIR"'/Feedback.csv CSV HEADER'

run_copy "AiChat" \
  '\copy "AiChat" TO '"$OUT_DIR"'/AiChat.csv CSV HEADER'

run_copy "AiChatMessage" \
  '\copy "AiChatMessage" TO '"$OUT_DIR"'/AiChatMessage.csv CSV HEADER'

# AiChatMessage flattened
run_copy "AiChatMessage_flat" \
  '\copy (
    SELECT
      s.id            AS "sessionId",
      s."participantId",
      r.index         AS "roundIndex",
      r.workflow,
      r."taskId",
      m.role,
      m.content,
      m.selected,
      m.action,
      m."createdAt"
    FROM "AiChatMessage" m
    JOIN "AiChat" c  ON c.id = m."chatId"
    JOIN "Round" r   ON r.id = c."roundId"
    JOIN "Session" s ON s.id = r."sessionId"
    ORDER BY s.id, r.index, m."createdAt"
  ) TO '"$OUT_DIR"'/AiChatMessage_flat.csv CSV HEADER'

# RoundFeedback flattened
run_copy "RoundFeedback_flat" \
  '\copy (
    SELECT
      s.id AS session_id,
      s."participantId",
      r.index AS "roundIndex",
      rf.workflow,
      rf."taskId",

      rf."mentalDemand",
      rf."physicalDemand",
      rf."temporalDemand",
      rf.performance,
      rf.effort,
      rf.frustration,

      rf."aiUnderstanding",
      rf."aiCollaboration",
      rf."aiCreativitySupport",
      rf."aiPerformanceOverall",

      rf."rulesConfidence",
      rf."satisfactionResult",
      rf.comment,
      rf."createdAt"
    FROM "RoundFeedback" rf
    JOIN "Round" r
      ON r."sessionId" = rf."sessionId"
     AND r.index = rf."roundIndex"
    JOIN "Session" s
      ON s.id = r."sessionId"
    ORDER BY s.id, r.index
  ) TO '"$OUT_DIR"'/RoundFeedback_flat.csv CSV HEADER'

# ---- Summary ----
echo "-----------------------------------"
echo "Total rows exported       : $TOTAL_ROWS"
echo
echo "Export complete!"
echo "Files written to: $OUT_DIR/"
