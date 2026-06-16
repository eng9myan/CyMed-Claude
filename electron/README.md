# CyMed Desktop (Electron)

Native Windows / macOS / Linux wrapper around the CyMed web client.

## Quick start

```bash
cd electron
npm install
npm start                  # launch dev mode
npm run build:win          # produce Windows .exe installer (NSIS + portable)
```

## Output

Built artifacts go to `electron/dist/`:

| File | Description |
|---|---|
| `CyMed-1.0.0-x64.exe` | NSIS installer (recommended for distribution) |
| `CyMed-Portable-1.0.0.exe` | Portable single-file binary |

## Configuration

Set `CYMED_URL` to point at your CyMed server. Defaults to `https://cymed.cy-com.com`.

```bash
$env:CYMED_URL = "https://cymed.your-domain.com"
npm start
```

## Branding

All CyMed visual identity — icon, splash, menu labels, About dialog. Zero
upstream vendor references in the user interface.

## Code signing (production)

Before public distribution, sign the `.exe` with an Authenticode certificate:

```powershell
signtool sign /f cert.pfx /p PASSWORD /tr http://timestamp.sectigo.com /td sha256 /fd sha256 CyMed-1.0.0-x64.exe
```
