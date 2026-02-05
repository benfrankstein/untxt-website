Here is a **clean, modern, production-ready style guide** derived directly from your color swatches.
No fluff, no branding poetry — only the technical system you can plug into a design system or codebase.

---

# **GENAI STYLEGUIDE v1.0**

*(derived from your swatches: #ffffff, #f3f0e7, #aeaa97, #3a2a28, #d3813f)*

---

# **1. Color System**

## **1.1 Brand Palette**

| Role                     | Hex       | Usage                                                         |
| ------------------------ | --------- | ------------------------------------------------------------- |
| **Primary Background**   | `#f3f0e7` | Default page background. Soft, warm, high-end neutral.        |
| **Surface / Cards**      | `#ffffff` | Panels, cards, modals, elevated surfaces.                     |
| **Neutral Midtone**      | `#aeaa97` | Subtle dividers, secondary buttons, borders, muted UI chrome. |
| **Text / Contrast Dark** | `#3a2a28` | Primary text color, headings, icons.                          |
| **Accent / Action**      | `#d3813f` | Primary CTA, interactive highlights, emphasis.                |

---

## **1.2 Accessible Color Usage**

**Primary text:** `#3a2a28` on `#f3f0e7` → passes WCAG AA comfortably.
**CTA text:** white (`#ffffff`) on `#d3813f` → passes contrast.

**Do NOT** use the midtone `#aeaa97` for body text — contrast is too weak.

---

# **2. Typography System**

### **2.1 Font Choices (recommended)**

To fit the palette’s aesthetic (warm minimalism meets utilitarian clarity):

* **Sans-serif:** `Inter`, `Söhne`, `SF Pro Text`, or `Neue Haas Grotesk`
* **Serif optional (premium):** `Ivar Text`, `Georgia`, `Lora`

### **2.2 Type Scale (Clamp-based, 2026 standard)**

```css
:root {
  --step--1: 0.9rem;
  --step-0: 1rem;
  --step-1: clamp(1.1rem, 1.2vw, 1.25rem);
  --step-2: clamp(1.4rem, 2vw, 1.9rem);
  --step-3: clamp(2rem, 3vw, 2.6rem);
  --step-4: clamp(2.6rem, 4vw, 3.4rem);
}
```

### **2.3 Text Specs**

* **Body (default):** `var(--step-0)` / line-height `1.5` / color `#3a2a28`
* **H1:** `var(--step-4)` / line-height `1.1` / max-width `18ch`
* **H2:** `var(--step-2)` / line-height `1.25` / max-width `28ch`
* **Caption:** `var(--step--1)` / `#3a2a28` at 70% opacity

---

# **3. Spacing System**

Use an 8-based scale:

```css
:root {
  --space-1: 0.5rem;  /* 8px */
  --space-2: 1rem;    /* 16px */
  --space-3: 1.5rem;  /* 24px */
  --space-4: 2rem;    /* 32px */
  --space-5: 3rem;    /* 48px */
}
```

Core patterns:

* Vertical rhythm between sections: `var(--space-5)`
* Spacing inside components: `var(--space-3)`
* Tight stacks (text blocks): `var(--space-2)`

---

# **4. UI Components**

## **4.1 Buttons**

### **Primary Button**

* **Background:** `#d3813f`
* **Text:** `#ffffff`
* **Shape:** pill (`border-radius: 9999px`)
* **Shadow:** subtle lift on hover

```css
.button-primary {
  background: #d3813f;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: none;
  font-weight: 600;
  min-height: 3rem;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease;
}
.button-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.14);
}
```

### **Secondary Button**

* **Border:** `1px solid #aeaa97`
* **Text:** `#3a2a28`
* **Background:** `transparent`

```css
.button-secondary {
  background: transparent;
  color: #3a2a28;
  border: 1px solid #aeaa97;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
}
```

---

# **5. Layout Rules**

### **5.1 Page Background**

Use **#f3f0e7** as the default. It’s warm, premium, avoids hospital white.

### **5.2 Surfaces & Cards**

Cards sit on `#ffffff` with:

* **Border:** `1px solid #aeaa97` at 40% opacity
* **Radius:** `12–16px`
* **Shadow:** very soft (0 4px 16px rgba(0,0,0,0.06))

### **5.3 Single-Column Max Width**

Use `ch` for readability.

```css
.main-col {
  max-width: 68ch;
  margin-inline: auto;
}
```

### **5.4 Accent Areas**

To highlight a block:

* Use **light wash** of the accent:
  `background: color-mix(in srgb, #d3813f 6%, #ffffff);`

OR

* Use a **top border** in the accent color:
  `border-top: 3px solid #d3813f;`

---

# **6. Interaction & Motion**

### **6.1 Hover States**

* Buttons lift: transform + shadow
* Links use a **subtle underline grow animation**
* Cards elevate on hover by 2–4px

### **6.2 Active States**

* Button press: `transform: scale(0.97);`
* Remove shadows to mimic tactile feedback

### **6.3 Reduced Motion Support**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

# **7. Iconography**

* Stroke color: `#3a2a28`
* Stroke width: 1.75–2.0
* Corner radius: **soft**, not geometric brutalist
* Filled icons rare; use outlined for cleanliness

Accent icons:

* Use `#d3813f` *only* for positive actions or navigational cues.

---

# **8. Gradients (Optional)**

To soften the brand look:

```css
background: linear-gradient(
  180deg,
  #f3f0e7 0%,
  #ffffff 100%
);
```

Accent gradient (CTA background alternative):

```css
background: linear-gradient(
  135deg,
  #d3813f 0%,
  color-mix(in srgb, #d3813f, #3a2a28 20%) 100%
);
```

---

# **9. Shadows**

Use warm, subtle shadows fitting the palette:

```css
--shadow-soft: 0 4px 14px rgba(58,42,40,0.08);
--shadow-medium: 0 10px 24px rgba(58,42,40,0.12);
```

Avoid heavy black shadows — they conflict with the warm neutrals.

---

# **10. Form Elements**

### Inputs

* Background: `#ffffff`
* Border: `1px solid #aeaa97`
* Text: `#3a2a28`
* Radius: `8–10px`
* Focus ring: `2px solid #d3813f` (WCAG compliant)

```css
input, textarea {
  background: #fff;
  border: 1px solid #aeaa97;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font: inherit;
}
input:focus {
  outline: 2px solid #d3813f;
  outline-offset: 2px;
}
