# Local Image Arena – vollständiges Root-Paket

Im ZIP sind nur Dateien im Hauptordner:
- index.html
- main.js
- package.json
- vite.config.js
- copy-ort-assets.cjs
- WORKFLOW-INHALT.txt
- README.txt

Nach dem Upload musst du auf GitHub einmal diese Datei anlegen:
.github/workflows/pages.yml

Dazu den kompletten Inhalt aus WORKFLOW-INHALT.txt hineinkopieren.

Danach:
Settings → Pages → Source → GitHub Actions

Wichtig:
GitHub Actions selbst verlangt technisch den Unterordner .github/workflows.
Der Rest des Projekts bleibt komplett im Hauptordner.
