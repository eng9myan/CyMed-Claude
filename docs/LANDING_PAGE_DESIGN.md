# CyMed Landing Page — Design Specification

## Purpose

The landing page is CyMed's first impression. It must:
1. Communicate the value proposition in 5 seconds
2. Build trust with security/compliance signals
3. Drive demo requests and sign-ins
4. Demonstrate product polish through its own polish

## Information Architecture

```
┌────────────────────────────────────────┐
│ NAV ─ logo · links · Sign In · Demo   │
├────────────────────────────────────────┤
│                                        │
│ HERO                                   │
│ ─ Badge: "Healthcare Operations…"     │
│ ─ Headline: "Enterprise Healthcare…"  │
│ ─ Subhead                              │
│ ─ CTAs: Request Demo · Sign In         │
│ ─ Trust strip: ISO 27001, HIPAA, …    │
│ ─ Right: dashboard preview card        │
├────────────────────────────────────────┤
│ FEATURES (6 cards in 3-col grid)       │
│ Patient · Scheduling · Billing ·       │
│ EMR · Staff · Analytics                │
├────────────────────────────────────────┤
│ SECURITY (dark section, 4 cards)       │
│ Encryption · Zero Trust · Compliance · │
│ Monitoring                             │
├────────────────────────────────────────┤
│ TESTIMONIALS (3 cards)                 │
├────────────────────────────────────────┤
│ PRICING (3 tiers, middle highlighted)  │
├────────────────────────────────────────┤
│ FAQ (accordion, 6 items)               │
├────────────────────────────────────────┤
│ CTA CARD (gradient bg)                 │
├────────────────────────────────────────┤
│ FOOTER (5 columns + social)            │
└────────────────────────────────────────┘
```

## Visual Design Tokens

### Spacing (8px grid)
- Container max-width: 1200px
- Section vertical padding: 128px desktop, 64px mobile
- Card padding: 32px desktop, 24px mobile
- Element gap: 24px (md) / 16px (sm)

### Color usage by zone
| Zone | Background | Text |
|---|---|---|
| Nav | `rgba(255,255,255,0.85)` + backdrop blur | navy |
| Hero | Gradient `#020617 → #0F172A → #1E293B` | white |
| Features section | white | navy |
| Security section | `#0F172A` (dark) | white |
| Testimonials section | white | navy |
| Pricing section | `#F8FAFC` (muted) | navy |
| FAQ section | white | navy |
| CTA card | Gradient hero | white |
| Footer | `#020617` (darkest) | white 70% |

### Typography scale
| Element | Size | Weight | Line height |
|---|---|---|---|
| H1 (hero) | clamp(36px, 5vw, 56px) | 800 | 1.1 |
| H2 (section) | clamp(28px, 4vw, 42px) | 800 | 1.15 |
| H3 (card) | 19px | 700 | 1.3 |
| Body | 16-18px | 400 | 1.6 |
| Caption | 13-14px | 500 | 1.5 |

### Button system
| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| Primary | `#E67E22` | white | none | darker bg + lift |
| Outline | transparent | navy | gray-200 | navy border |
| Ghost (on dark) | transparent | white | white 30% | white bg 10% |

## Responsive Breakpoints

| Width | Layout change |
|---|---|
| ≥1024px | Full 3-column grids, sticky nav, side-by-side hero |
| 768-1023px | Features → 2 cols, pricing stacks, security → 1 col |
| <768px | Nav links collapse (cta visible), hero stacks vertically, footer → 1 col |

## Interaction & Motion

- Hero content: fade-up animation, 100ms staggered
- Feature cards: fade-up on scroll (IntersectionObserver, threshold 0.1)
- Hover on feature card: `translateY(-4px)` + border becomes orange + shadow-md
- FAQ: only one item open at a time (accordion); `+` rotates 45° to `×`
- Nav: sticky with blur backdrop
- Smooth scroll on anchor links (`scrollTo` with offset 80px for nav clearance)

## Accessibility (WCAG 2.1 AA)

- Color contrast: all text passes AA against its background
- Keyboard nav: all interactive elements reachable via Tab, visible focus rings
- Skip link: "Skip to content" before nav
- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<footer>`, `<details>`/`<summary>` for FAQ
- ARIA where needed: `aria-label` on icon-only buttons (social links in footer)
- Reduced motion: respect `prefers-reduced-motion` (disable fade-ups)
- Form labels: explicit `<label>` for each input, required marked with `*`

## SEO

- `<title>`: "CyMed — Enterprise Healthcare ERP"
- `<meta name="description">`: 155-char summary with primary keyword
- Open Graph + Twitter card images
- Structured data: Organization + SoftwareApplication JSON-LD
- Sitemap.xml + robots.txt configured by website module
- Lighthouse target: Performance ≥90, Accessibility ≥95, SEO ≥95

## Code locations

| Concern | File |
|---|---|
| Routes | `cymed_erp/addons/cymed_landing/controllers/main.py` |
| HTML template | `cymed_erp/addons/cymed_landing/views/landing_template.xml` |
| Design tokens | `cymed_erp/addons/cymed_landing/static/src/css/cybercom.css` |
| Layout/components | `cymed_erp/addons/cymed_landing/static/src/css/landing.css` |
| JS interactions | `cymed_erp/addons/cymed_landing/static/src/js/landing.js` |
