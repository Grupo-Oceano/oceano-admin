#!/bin/sh

# Start the Qwik Node server in the background
pnpm run serve &

# Start nginx in the foreground
nginx -g "daemon off;"
