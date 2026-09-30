#!/usr/bin/env python3
"""Fija cname y https_enforced del sitio de GitHub Pages por la API.

El token se lee de GITHUB_TOKEN o GH_TOKEN. No se escribe en disco.
El cuerpo del PUT es fijo: cname casasayampe.com y https_enforced true.
Cualquier otro host, o apagar HTTPS, termina el proceso antes de la API.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

OWNER = "earauzt"
REPO = "casasayampe"
PRODUCTION_HOST = "casasayampe.com"
API_VERSION = "2026-03-10"
ROOT = Path(__file__).resolve().parent.parent
CNAME_PATH = ROOT / "CNAME"
PAGES_URL = f"https://api.github.com/repos/{OWNER}/{REPO}/pages"

# Único cuerpo que este script puede enviar. No se arma con argumentos.
PAYLOAD = {"cname": PRODUCTION_HOST, "https_enforced": True}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def refuse(message: str) -> None:
    print(f"Rechazado: {message}", file=sys.stderr)
    raise SystemExit(2)


def normalize_host(value: object) -> str:
    if value is None:
        return ""
    return str(value).strip().lower().rstrip(".")


def https_requested(raw: str | None) -> bool:
    if raw is None or raw.strip() == "":
        return True
    return raw.strip().lower() in {"true", "1", "yes"}


def decide(
    file_host: str,
    requested_host: str,
    requested_https: bool,
    live_host: object,
    live_https: object,
) -> str:
    """Devuelve 'refuse', 'noop' o 'put'. No construye un cuerpo alternativo."""
    if requested_https is not True:
        refuse("este script no desactiva Enforce HTTPS.")
    if normalize_host(file_host) != PRODUCTION_HOST:
        refuse(
            "el archivo CNAME del repositorio no es casasayampe.com. "
            "No se cambia el dominio."
        )
    if normalize_host(requested_host) != PRODUCTION_HOST:
        refuse(
            "el cname tiene que seguir siendo casasayampe.com, "
            "el apex de producción. www no es el cname."
        )
    if set(PAYLOAD) != {"cname", "https_enforced"}:
        refuse("el cuerpo del PUT no es el esperado.")
    if PAYLOAD["cname"] != PRODUCTION_HOST or PAYLOAD["https_enforced"] is not True:
        refuse("el cuerpo del PUT apagaría HTTPS o movería el cname.")

    live = normalize_host(live_host)
    if live and live != PRODUCTION_HOST:
        refuse(
            f"Pages ya tiene el cname {live}. "
            "No se mueve el host de producción."
        )
    if live == PRODUCTION_HOST and live_https is True:
        return "noop"
    return "put"


def read_cname_file() -> str:
    try:
        return CNAME_PATH.read_text(encoding="utf-8").strip()
    except OSError as err:
        refuse(f"no se pudo leer {CNAME_PATH.name}: {err}")
    return ""


def token_from_env() -> str:
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN") or ""
    token = token.strip()
    if not token:
        refuse(
            "falta GITHUB_TOKEN o GH_TOKEN en el entorno. "
            "No guardes el token en el repositorio."
        )
    return token


def github_pages(method: str, token: str, payload: dict | None = None) -> tuple[int, bytes]:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(PAGES_URL, data=data, method=method)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("X-GitHub-Api-Version", API_VERSION)
    req.add_header("User-Agent", "casasayampe-pages-https")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    opener = urllib.request.build_opener(NoRedirect())
    try:
        with opener.open(req, timeout=30) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as err:
        return err.code, err.read()


def load_live(token: str) -> tuple[object, object]:
    status, body = github_pages("GET", token)
    if status != 200:
        detail = body.decode("utf-8", errors="replace")[:300]
        print(f"Error: GET /pages respondió {status}. {detail}", file=sys.stderr)
        raise SystemExit(1)
    try:
        data = json.loads(body.decode("utf-8"))
    except json.JSONDecodeError:
        print("Error: la respuesta de Pages no es JSON.", file=sys.stderr)
        raise SystemExit(1)
    return data.get("cname"), data.get("https_enforced")


def apply_put(token: str) -> None:
    status, body = github_pages("PUT", token, PAYLOAD)
    if status not in (200, 204):
        detail = body.decode("utf-8", errors="replace")[:300]
        print(f"Error: PUT /pages respondió {status}. {detail}", file=sys.stderr)
        raise SystemExit(1)


def main(argv: list[str]) -> None:
    dry_run = False
    for arg in argv:
        if arg == "--dry-run":
            dry_run = True
        elif arg in ("-h", "--help"):
            print(
                "Uso: GITHUB_TOKEN=... python3 scripts/set_github_pages_https.py [--dry-run]\n"
                "Fija cname=casasayampe.com y https_enforced=true. "
                "No acepta otro dominio ni apagar HTTPS."
            )
            return
        else:
            refuse(f"argumento no permitido: {arg}")

    requested_https = https_requested(os.environ.get("PAGES_HTTPS_ENFORCED"))
    requested_host = os.environ.get("PAGES_CNAME", PRODUCTION_HOST)
    file_host = read_cname_file()
    # Las rechazos que no necesitan la red ocurren antes de leer el token
    # solo si ya podemos decidir. El host en vivo se comprueba después del GET.
    if requested_https is not True:
        refuse("este script no desactiva Enforce HTTPS.")
    if normalize_host(file_host) != PRODUCTION_HOST:
        refuse(
            "el archivo CNAME del repositorio no es casasayampe.com. "
            "No se cambia el dominio."
        )
    if normalize_host(requested_host) != PRODUCTION_HOST:
        refuse(
            "el cname tiene que seguir siendo casasayampe.com, "
            "el apex de producción. www no es el cname."
        )

    token = token_from_env()
    live_host, live_https = load_live(token)
    action = decide(file_host, requested_host, True, live_host, live_https)
    if action == "noop":
        print(
            "Pages ya tiene cname casasayampe.com y https_enforced. "
            "No se hizo PUT."
        )
        return
    if dry_run:
        print(json.dumps(PAYLOAD, ensure_ascii=False))
        print("Simulación: no se hizo PUT.")
        return
    apply_put(token)
    print("Pages quedó con cname casasayampe.com y https_enforced true.")


if __name__ == "__main__":
    main(sys.argv[1:])
