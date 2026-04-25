#!/usr/bin/env bash
set -euo pipefail

rg -n -S -i --hidden \
  --glob '!.git' \
  --glob '!node_modules' \
  --glob '!.next' \
  --glob '!.next-dev' \
  --glob '!*.md' \
  --glob '!package-lock.json' \
  '(key|secret|token|password|private|signing|DATABASE_URL|NEXT_PUBLIC|WORLD|SUPABASE)' .
