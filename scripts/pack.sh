#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd -- "$ROOT_DIR"

if ! command -v zip >/dev/null 2>&1; then
  echo "错误：未找到 zip 命令，请先安装 zip。" >&2
  exit 1
fi

VERSION="$(node -e 'const m = JSON.parse(require("fs").readFileSync("manifest.json", "utf8")); process.stdout.write(m.version || "1.0.0");')"
OUT_DIR="dist"
OUT_ZIP="./${OUT_DIR}/chrome-bookmark-ai-v${VERSION}.zip"

mkdir -p -- "$OUT_DIR"
rm -f -- "$OUT_ZIP"

zip -r -q "$OUT_ZIP" manifest.json LICENSE src/

echo "打包完成: ${ROOT_DIR}/${OUT_ZIP}"
