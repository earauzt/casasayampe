# GitHub Pages: HTTPS y dominio

`set_github_pages_https.py` fija por la API de GitHub el `cname` y `https_enforced` del sitio de Pages. Así el siguiente cambio de Pages no depende de un segundo paso en el navegador.

El token se lee de `GITHUB_TOKEN` o `GH_TOKEN` (permiso de administración del repo, o «manage GitHub Pages settings»). No lo pongas en el repositorio ni en un archivo de este directorio.

El único cuerpo que el script puede enviar es `cname` `casasayampe.com` y `https_enforced` `true`. Se niega a correr si eso apagaría Enforce HTTPS, si `PAGES_CNAME` o el archivo `CNAME` no son ese apex, o si Pages ya apunta a otro host. `www` redirige al apex y no es el cname. No toca DNS ni el certificado. Si Pages ya está así, no hace PUT.

```bash
GITHUB_TOKEN=... python3 scripts/set_github_pages_https.py
python3 scripts/set_github_pages_https.py --dry-run
```
