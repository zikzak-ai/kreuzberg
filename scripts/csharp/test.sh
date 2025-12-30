#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

source "$REPO_ROOT/scripts/lib/tessdata.sh"
setup_tessdata

cd "${REPO_ROOT}/packages/csharp"
dotnet test Kreuzberg.Tests/Kreuzberg.Tests.csproj -c Release
