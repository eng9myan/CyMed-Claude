# CyMed Branding Assets

## Logo

| Asset | Location | Use |
|---|---|---|
| Primary logo (SVG) | `cymed_erp/addons/cymed_branding/static/src/img/cymed_logo.svg` | Web, reports, emails |
| Favicon (32×32) | `cymed_erp/addons/cymed_branding/static/src/img/cymed_favicon.png` | Browser tab |
| Apple touch icon (180×180) | `cymed_erp/addons/cymed_branding/static/src/img/cymed_apple_icon.png` | iOS home screen |
| Windows ICO | `electron/assets/cymed.ico` | Windows .exe icon |
| macOS ICNS | `electron/assets/cymed.icns` | macOS .app icon |
| Android adaptive | `mobile/resources/icon.png` (1024×1024) | All Android densities |
| iOS app icon | `mobile/resources/icon.png` (1024×1024) | All iOS sizes |
| Splash screen | `mobile/resources/splash.png` (2732×2732) | Mobile launch |

> Logo specifications: monogram is a "+" inside a 36×36 rounded square with orange gradient (`#E67E22` → `#F39C12`); word-mark uses Inter 700, color `#0F172A` on light, `#FFFFFF` on dark.

## Cybercom Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--cc-primary` | `#0F172A` | Deep navy — primary backgrounds |
| `--cc-primary-light` | `#1E293B` | Surface elevations |
| `--cc-primary-dark` | `#020617` | Deepest depth, footer |
| `--cc-secondary` | `#334155` | Slate — borders, dividers |
| `--cc-secondary-light` | `#475569` | Muted accents |
| `--cc-accent` | `#E67E22` | CyMed orange — primary CTA |
| `--cc-accent-light` | `#F39C12` | Hover state, highlights |
| `--cc-accent-dark` | `#C0651D` | Pressed state |
| `--cc-success` | `#10B981` | Confirmations, healthy state |
| `--cc-warning` | `#F59E0B` | Alerts, pending |
| `--cc-danger` | `#EF4444` | Errors, critical |
| `--cc-info` | `#3B82F6` | Informational |

Complete CSS variable definitions live in
`cymed_erp/addons/cymed_landing/static/src/css/cybercom.css`.

## Typography

| Role | Font | Weight |
|---|---|---|
| Display headings | Inter | 800 |
| Section headings | Inter | 700 |
| Body | Inter | 400 |
| Buttons / labels | Inter | 600 |
| Code / data | JetBrains Mono | 400 |

Loaded via Google Fonts: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap')`.

## Voice & Tone

- **Confident, not boastful:** "Built for the healthcare threat landscape" — not "the best ERP ever"
- **Direct:** short sentences, active voice
- **Specific:** "98.7% SLA compliance" beats "high reliability"
- **Healthcare-respectful:** patients are *people*, not records
- **Saudi-aware where relevant:** ZATCA, NPHIES, GOSI explicit, not abstract

## Brand Guardrails

- Never refer to the platform as "Odoo-based" or "built on Odoo" in customer-facing copy. The underlying engine is an implementation detail.
- Never use stock photos of doctors with stethoscopes. Use abstract dashboards, clean type, geometric graphics.
- Never use trust badges we don't actually hold. Once ISO 27001 / HIPAA / NCA-ECC certificates are issued, link to verification pages.
- Always pair primary orange `#E67E22` with deep navy `#0F172A`. Never put orange on lighter blue or gray — it loses contrast.

## Screenshots & Marketing Assets

Captured screenshots for the landing page and marketing materials live in
`cymed_erp/addons/cymed_landing/static/src/img/screenshots/`:

- `dashboard.png` — Patient command center
- `ehr.png` — Electronic medical record
- `billing.png` — Revenue cycle
- `mobile.png` — Mobile app
- `desktop.png` — Desktop app

Take new screenshots at 1920×1200 with the dark theme active.
