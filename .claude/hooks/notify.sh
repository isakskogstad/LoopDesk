#!/bin/bash
# macOS notification hook for Claude Code
# Triggers native notifications when Claude needs input

# Read JSON from stdin
INPUT=$(cat)

# Extract notification type and message
NOTIFICATION_TYPE=$(echo "$INPUT" | jq -r '.notification_type // empty')
MESSAGE=$(echo "$INPUT" | jq -r '.message // "Claude Code needs your attention"')

# Truncate message if too long
MESSAGE="${MESSAGE:0:200}"

case "$NOTIFICATION_TYPE" in
  "permission_prompt")
    osascript -e "display notification \"$MESSAGE\" with title \"Claude Code\" subtitle \"Permission Required\" sound name \"Ping\""
    ;;
  "idle_prompt")
    osascript -e "display notification \"$MESSAGE\" with title \"Claude Code\" subtitle \"Waiting for input\" sound name \"Pop\""
    ;;
  *)
    osascript -e "display notification \"$MESSAGE\" with title \"Claude Code\" sound name \"Blow\""
    ;;
esac

exit 0
