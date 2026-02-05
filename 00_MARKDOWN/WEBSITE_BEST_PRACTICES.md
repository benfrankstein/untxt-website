

# 1. Global Layout & Constraints

### 1.1 Viewport + base CSS

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
```

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Segoe UI", sans-serif;
  color: #111;
  background: #fafafa;
}
```

### 1.2 Outer layout shell (page width)

* Don’t think “760px”. Think:

  * **Outer max width:** 72–80rem (~1150–1280 px)
  * **Inner reading width:** `~60–75ch` (characters per line)([uxpin.com][1])

```css
:root {
  --page-max: 72rem; /* outer shell */
  --page-pad-inline: clamp(1.5rem, 4vw, 3rem);
  --reading-max: 68ch; /* text column */
}

.page {
  width: min(100% - 2 * var(--page-pad-inline), var(--page-max));
  margin-inline: auto;
}
```

### 1.3 Single column structure

```css
main {
  display: flex;
  flex-direction: column;
  gap: clamp(3rem, 6vh, 5rem);
  padding-block: clamp(2rem, 4vh, 3rem);
}

.section {
  display: flex;
  justify-content: center;
  padding-block: clamp(2rem, 4vh, 4rem);
}

.section-inner {
  width: 100%;
  max-width: var(--page-max);
  padding-inline: var(--page-pad-inline);
}

.main-col {
  max-width: var(--reading-max);
  margin-inline: auto;
}
```

**Idea:**

* `.section-inner` = full logical section.
* `.main-col` = actual **text column**.

---

# 2. Typography System (fluid, not dumb px)

### 2.1 Line length & line height

Modern research + typography people are very consistent:

* **50–75 characters per line** → comfort zone for reading.([uxpin.com][1])
* Many recommend **60–70** as sweet spot.([Piccalilli][2])
* Use `ch` to control that in CSS.([Piccalilli][2])

```css
.main-col,
p {
  max-width: 68ch;
  line-height: 1.5;
}
```

### 2.2 Fluid base font-size

Use `clamp()` for fluid typography, as all modern guides now recommend.([DEV Community][3])

```css
html {
  font-size: clamp(15px, 0.9vw + 11px, 18px);
}
```

### 2.3 Type scale (rem + clamp)

```css
:root {
  --step--1: 0.9rem;
  --step-0: 1rem;
  --step-1: clamp(1.1rem, 1.2vw, 1.25rem);  /* body large */
  --step-2: clamp(1.4rem, 2vw, 1.9rem);     /* h2 */
  --step-3: clamp(2rem, 3vw, 2.6rem);       /* h1 small */
  --step-4: clamp(2.6rem, 4vw, 3.4rem);     /* hero h1 */
}

body {
  font-size: var(--step-0);
}

h1,
h2,
h3 {
  margin: 0 0 0.5em;
  font-weight: 650;
}

h1 {
  font-size: var(--step-4);
  line-height: 1.1;
  max-width: 18ch;  /* very short & punchy */
}

h2 {
  font-size: var(--step-2);
  line-height: 1.25;
  max-width: 28ch;
}

p {
  font-size: var(--step-0);
  line-height: 1.5;
}
```

### 2.4 Container-query based adjustments (future-proof)

Container queries + `ch` are basically the modern pattern.([blog.openreplay.com][4])

```css
.main-col {
  container-type: inline-size;
}

/* When the column is wide enough, bump text slightly */
@container (min-width: 40rem) {
  p {
    font-size: var(--step-1);
  }
}
```

You’re no longer hostage to viewport width – the column itself decides.

---

# 3. Spacing & Vertical Rhythm

Use a consistent **space scale**, wire it everywhere.

```css
:root {
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
}

.stack > * + * {
  margin-top: var(--space-md);
}
```

Usage pattern:

```html
<section class="section">
  <div class="section-inner">
    <div class="main-col stack">
      <h1>Hero headline</h1>
      <p>Intro...</p>
      <div class="actions cluster">
        <!-- buttons -->
      </div>
    </div>
  </div>
</section>
```

```css
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
}
```

---

# 4. Flex / Grid Patterns (even for 1 column)

You *are* still using grid/flex, you’re just collapsing to 1 column on small screens.

### 4.1 Hero with media

```css
.hero {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

@media (min-width: 48rem) {
  .hero {
    grid-template-columns: minmax(0, 1.2fr);
    /* still 1 column: media sits *below* or *above* text */
  }
}

/* If you ever decide to go 2-column at lg, you have the grid already */
@media (min-width: 64rem) {
  .hero {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    align-items: center;
  }
}
```

### 4.2 aspect-ratio for media

```css
.hero-media {
  width: 100%;
  max-width: 48rem;
  margin-inline: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 1.5rem;
}
```

---

# 5. Buttons & CTAs (tap targets, focus, states)

### 5.1 Base button

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;       /* >= 44px tap target */
  padding: 0 1.5rem;
  border-radius: 999px;
  border: none;
  font: inherit;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease;
}

.button--primary {
  background: #ff5a1f;
  color: #fff;
}

.button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.14);
}

.button--primary:active {
  transform: translateY(0);
  box-shadow: none;
}

.button:focus-visible {
  outline: 2px solid #111;
  outline-offset: 3px;
}
```

### 5.2 Button layout

```css
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
```

---

# 6. Breakpoints & Responsiveness

Modern guidance → **mobile-first**, `min-width` media queries.([Medium][5])

Recommended basic set for a landing page:

```css
/* base: phones (≤ 640px) */

@media (min-width: 40rem) {   /* ~640px: small tablets / large phones */
  /* small layout tweaks */
}

@media (min-width: 56rem) {   /* ~896px: main desktop break */
  /* adjust spacing, maybe media sizes */
}

@media (min-width: 72rem) {   /* ~1152px: wide screens */
  /* cap container width; you already do via min/max */
}
```

**Rules:**

* Use **as few global breakpoints as possible**.
* Big layout changes: 2–3 breakpoints max.
* Local fine-tuning = `@container` rules on components.

---

# 7. Accessibility Tech (WCAG 2.2 / EAA-ish)

Tech stuff that matters:

* **Color contrast:** at least **WCAG 2.1/2.2 AA** for text (4.5:1 for normal text).
* **Line length:** keep under ~80 chars for accessibility (WCAG / dyslexia org guidance).([Pimp my Type][6])
* **Keyboard navigation:**

  * natural tab order
  * skip link

```html
<a href="#main" class="skip-link">Skip to content</a>
<main id="main">...</main>
```

```css
.skip-link {
  position: absolute;
  left: -999px;
  top: 0;
  padding: 0.5rem 1rem;
  background: #000;
  color: #fff;
  z-index: 1000;
}

.skip-link:focus {
  left: 0.5rem;
  top: 0.5rem;
}
```

* **Focus states**: custom, clearly visible (don’t remove outlines).
* **Motion:** respect `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto !important;
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

# 8. Media Handling (images / video)

### 8.1 Images

Use modern formats (AVIF/WebP), fluid & lazy:

```html
<picture>
  <source srcset="/hero.avif" type="image/avif">
  <source srcset="/hero.webp" type="image/webp">
  <img src="/hero.jpg" class="hero-media" loading="lazy" alt="Describe the actual content">
</picture>
```

```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

Targets:

* Hero image: ~120–250 KB.
* Other images: as small as possible; lazy-load everything below the fold.

### 8.2 Video

* Autoplay only if **muted + `playsinline`**, and offer a pause.
* Use `poster` and keep files short & compressed.

```html
<video
  class="hero-media"
  autoplay
  muted
  loop
  playsinline
  poster="/poster.jpg"
>
  <source src="/hero.webm" type="video/webm">
  <source src="/hero.mp4" type="video/mp4">
</video>
```

---

# 9. Performance Budget & Metrics

Modern responsive-design guides talk about **page weight & fluid CSS** as first-class concerns.([DEV Community][7])

Aim for:

* **Total page weight:** ≲ 1–1.2 MB.
* **First contentful paint:** < 1.5–2s on 4G.
* JS bundle: ideally **< 100 KB gzipped** on a static landing.

Technical steps:

```html
<link rel="preload" as="font" type="font/woff2" crossorigin href="/font.woff2">
<link rel="preconnect" href="https://fonts.googleapis.com">
```

```html
<script src="/bundle.js" type="module" defer></script>
```

* Use `defer` for JS.
* No blocking CSS beyond critical.
* Avoid bloated animation libs when CSS can do it.

---

# 10. Legal / Security Tech Hooks (EU / DE reality)

You’ll wire these in on the tech side:

### 10.1 Cookies & consent

* Only show a consent banner if you actually set **non-essential cookies** (tracking, advertising, 3rd party analytics).
* Implement a consent state → only load tracking scripts after consent.

Pseudo-pattern:

```html
<!-- In your HTML -->
<script>
  window.appConsent = { analytics: false };
</script>
```

```js
// After user clicks "accept"
function enableAnalytics() {
  window.appConsent.analytics = true;
  const s = document.createElement("script");
  s.src = "https://www.googletagmanager.com/gtm.js?id=GTM-XXXX";
  s.async = true;
  document.head.appendChild(s);
}
```

### 10.2 Security headers (server-side)

Configure (nginx, etc.):

* `Content-Security-Policy`
* `Strict-Transport-Security`
* `X-Frame-Options` / `frame-ancestors`
* `Referrer-Policy`
* `Permissions-Policy`

All of that is boring, but **mandatory** for 2025+ “serious” SaaS.

---

# 11. Minimal Example Skeleton

Just to show how all of this plugs together:

```html
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <div class="page">
    <header class="section">
      <div class="section-inner">
        <div class="main-col stack hero">
          <div>
            <p class="eyebrow">Tagline</p>
            <h1>Ultra-clear hero headline.</h1>
            <p>One short paragraph that explains what this does in human language.</p>
            <div class="actions">
              <a href="#cta" class="button button--primary">Primary CTA</a>
              <a href="#more" class="button button--ghost">Secondary</a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main id="main">
      <section class="section" id="more">
        <div class="section-inner">
          <div class="main-col stack">
            <h2>Why this matters</h2>
            <p>3–5 lines of copy max.</p>
          </div>
        </div>
      </section>

      <!-- more sections using the same pattern -->

      <section class="section" id="cta">
        <div class="section-inner">
          <div class="main-col stack">
            <h2>Ready?</h2>
            <a class="button button--primary" href="/signup">Start now</a>
          </div>
        </div>
      </section>
    </main>
  </div>
</body>
```

