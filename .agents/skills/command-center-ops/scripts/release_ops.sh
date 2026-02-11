#!/usr/bin/env bash
set -euo pipefail

TARGET="none"
SKIP_TESTS="false"
DRY_RUN="false"

usage() {
  cat <<'EOF'
Usage: release_ops.sh [options]

Options:
  --target <name>   Deploy target:
                    none (default)
                    vercel
                    firebase-functions
                    firebase-rules
                    firebase-indexes
                    firebase-full
  --skip-tests      Skip npm test step
  --dry-run         Print commands without executing them
  -h, --help        Show this help message
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --target" >&2
        exit 1
      fi
      TARGET="$2"
      shift 2
      ;;
    --skip-tests)
      SKIP_TESTS="true"
      shift
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

run_cmd() {
  local cmd="$1"
  if [[ "$DRY_RUN" == "true" ]]; then
    printf '[dry-run] %s\n' "$cmd"
  else
    printf '[run] %s\n' "$cmd"
    eval "$cmd"
  fi
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Required command not found: $cmd" >&2
    exit 1
  fi
}

validate_target() {
  case "$TARGET" in
    none|vercel|firebase-functions|firebase-rules|firebase-indexes|firebase-full)
      ;;
    *)
      echo "Invalid --target: $TARGET" >&2
      usage
      exit 1
      ;;
  esac
}

main() {
  validate_target
  require_cmd npm

  run_cmd "npm run lint"
  if [[ "$SKIP_TESTS" == "false" ]]; then
    run_cmd "npm run test"
  fi
  run_cmd "npm run build"

  case "$TARGET" in
    none)
      echo "Checks completed; no deployment requested."
      ;;
    vercel)
      run_cmd "npm run deploy:vercel"
      ;;
    firebase-functions)
      run_cmd "npm run deploy:firebase:functions"
      ;;
    firebase-rules)
      run_cmd "npm run deploy:firebase:rules"
      ;;
    firebase-indexes)
      run_cmd "npm run deploy:firebase:indexes"
      ;;
    firebase-full)
      run_cmd "npm run deploy:firebase:full"
      ;;
  esac
}

main "$@"
