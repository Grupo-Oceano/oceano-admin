#!/bin/sh

# Start the Qwik Node server in the background with timestamped logs
pnpm run serve | while IFS= read -r line; do printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$line"; done &

# Start nginx with timestamped logs
nginx -g "daemon off;" | while IFS= read -r line; do printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$line"; done &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?