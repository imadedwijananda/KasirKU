#!/usr/bin/env python3
"""Decode scripts/icons-b64.json into favicon.ico and icons/*.png."""
import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "scripts" / "icons-b64.json"
PNG_MAGIC = b"\x89PNG\r\n\x1a\n"
ICO_MAGIC = b"\x00\x00\x01\x00"

def main() -> None:
    data = json.loads(SRC.read_text())
    for rel, b64 in data.items():
        path = ROOT / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        raw = base64.b64decode(b64)
        if path.suffix.lower() == ".png" and not raw.startswith(PNG_MAGIC):
            raise SystemExit("bukan PNG: " + rel)
        if path.suffix.lower() == ".ico" and not raw.startswith(ICO_MAGIC):
            raise SystemExit("bukan ICO: " + rel)
        path.write_bytes(raw)
        print("tulis %s (%d byte)" % (rel, len(raw)))

if __name__ == "__main__":
    main()
