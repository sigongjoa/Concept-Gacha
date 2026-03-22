# Design System Document: The Gamified Intellectual

## 1. Overview & Creative North Star
**The Creative North Star: "The Curated Collector"**
This design system moves away from the sterile, repetitive nature of traditional flashcard apps. Instead, it treats educational content as a premium "collectible" experience. By blending the excitement of a high-end Gacha mechanic with the prestige of a modern editorial magazine, we create an environment where learning feels like a rewarding acquisition rather than a chore.

**Breaking the Template:**
To achieve a "Signature" look, we reject the rigid, centered grid. We utilize **intentional asymmetry**—offsetting card titles, using varied spacing increments (e.g., a `3.5` unit gap next to a `6` unit gap), and allowing "Glass" elements to overlap content layers. This creates a sense of tactile depth and curated chaos that feels alive and premium.

---

## 2. Colors & Surface Philosophy
The palette balances the high energy of `primary` (Orange) with the grounded stability of `surface-container` tiers.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** Do not use 1px solid lines to separate content. Boundaries must be defined through:
1.  **Background Color Shifts:** Placing a `surface-container-lowest` card on a `surface-container-low` background.
2.  **Tonal Transitions:** Using the `surface-dim` token to subtly define the edge of a scrollable area.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent materials.
*   **Base Layer:** `surface` (#f7f9fb)
*   **Content Sections:** `surface-container-low` (#f2f4f6)
*   **Interactive Cards:** `surface-container-lowest` (#ffffff)
*   **Floating/Active Elements:** `surface-bright` with Glassmorphism.

### The "Glass & Gradient" Rule
To elevate the "Gacha" experience, use **Glassmorphism** for floating action buttons and navigation bars.
*   **Token:** `surface-container-lowest` @ 70% opacity + 20px Backdrop Blur.
*   **Signature Textures:** For high-value CTAs (like "Reveal Card"), apply a linear gradient from `primary` (#9d4300) to `primary-container` (#f97316) at a 135-degree angle. This adds "soul" and a tactile, liquid feel to the brand colors.

---

## 3. Typography: Editorial Authority
We pair **Plus Jakarta Sans** for display (modern, slightly wide, premium) with **Inter** for functional reading (high legibility).

| Level | Token | Font | Size | Weight | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Plus Jakarta Sans | 3.5rem | 700 | -0.02em |
| **Headline** | `headline-md` | Plus Jakarta Sans | 1.75rem | 600 | -0.01em |
| **Title** | `title-lg` | Inter | 1.375rem | 600 | 0 |
| **Body** | `body-lg` | Inter | 1rem | 400 | 0.01em |
| **Label** | `label-md` | Inter | 0.75rem | 500 | 0.05em |

**Hierarchy Note:** Use `display-lg` for card results (the "Concept" name) to make the moment of discovery feel monumental. Use `label-md` in all-caps with the `primary` color for category tags.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** and **Ambient Light**, not structural shadows.

*   **The Layering Principle:** A "Correct" flashcard should be placed on a `tertiary-container` background to feel "embedded" in success, rather than just having a green border.
*   **Ambient Shadows:** Use only for the highest level of hierarchy (e.g., a card being "pulled").
    *   *Spec:* `0px 20px 40px rgba(88, 66, 55, 0.06)`. Note the use of `on-surface-variant` (#584237) for the shadow tint instead of pure black.
*   **The "Ghost Border" Fallback:** If a divider is strictly necessary for accessibility, use `outline-variant` (#e0c0b1) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### The "Hero" Card (Flashcard)
*   **Radius:** `xl` (3rem) for the outer container, `lg` (2rem) for inner content.
*   **Styling:** No borders. Use `surface-container-lowest`.
*   **Interaction:** On tap/flip, transition the background from `white` to a subtle gradient of `surface-container-high`.

### Buttons (The "Gacha" Pull)
*   **Primary:** Gradient of `primary` to `primary-container`. `full` (9999px) roundness. High-gloss finish.
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No shadow.
*   **States:** On press, scale down to 96% and increase the backdrop blur of underlying elements.

### Progress & Stats (Learning Momentum)
*   **Chips:** Use `secondary-container` (#6063ee) with `on-secondary-container` text for "Series" or "Collection" tags.
*   **The Progress Bar:** Forbid the standard gray track. Use `surface-container-high` for the track and a `tertiary` (#006c49) to `tertiary-container` (#00b07a) gradient for the fill.

### Inputs & Fields
*   **Style:** Minimalist. Use `surface-container-low` as a solid fill.
*   **Focus:** Do not use a blue glow. Shift the background color to `surface-container-lowest` and add a 2px `primary` "Ghost Border" (20% opacity).

---

## 6. Do’s and Don’ts

### Do
*   **Do** use the `spacing-8` (2.75rem) and `spacing-10` (3.5rem) values to create generous "white space" around key concepts.
*   **Do** overlap a `label-sm` tag over the edge of a card to break the "contained" box look.
*   **Do** use `tertiary` (Emerald) for "Mastered" states and `secondary` (Indigo) for "New Discovery" states.

### Don't
*   **Don't** use `error` (#ba1a1a) for "Wrong" answers in a way that feels punishing. Instead, use `error_container` with `on_error_container` text to keep the "Playful Professional" tone.
*   **Don't** use a standard list divider. Use a `spacing-4` vertical gap or a subtle shift from `surface` to `surface-container-low`.
*   **Don't** use 100% black text. Always use `on-surface` (#191c1e) to maintain the premium, soft-editorial look.