# Local Image Arena – Root Only

Dieses ZIP enthält **keine Unterordner**.

Direkt ins neue GitHub-Repository hochladen:
- index.html
- main.js
- package.json
- vite.config.js
- copy-ort-assets.cjs
- WORKFLOW-INHALT.txt

Wichtig:
GitHub Actions selbst verlangt technisch die Datei:
`.github/workflows/pages.yml`

Da du keine Unterordner hochladen möchtest, ist der Workflow als
`WORKFLOW-INHALT.txt` beigelegt.

Nach dem Upload:
1. GitHub → Add file → Create new file
2. Dateiname: `.github/workflows/pages.yml`
3. Inhalt aus `WORKFLOW-INHALT.txt` komplett hineinkopieren
4. Commit changes
5. Settings → Pages → Source → GitHub Actions

Damit bleibt dein Upload-Paket komplett flach; nur GitHub selbst benötigt
für Actions diese eine Workflow-Datei an seinem vorgeschriebenen Pfad.
