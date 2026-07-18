<!-- <p align="center">
  <img src="./src/assets/signature.svg" width="300" alt="Gargi Bhardwaj Signature" />
</p> -->

<h1 align="center">
  <code><b>D O S S I E R</b></code>
</h1>

<p align="center">
  <b>An Immersive Design Engineering Portfolio</b>
</p>

<p align="center">
  <a href="https://github.com/gargibhardwaj24/dossier">
    <img src="https://img.shields.io/github/stars/gargibhardwaj24/dossier?style=for-the-badge&color=8A2BE2&logo=github" alt="Stars" />
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React_19-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React 19" />
  </a>
  <a href="https://vite.dev/">
    <img src="https://img.shields.io/badge/Vite_8-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind_v4-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  </a>
  <a href="https://gsap.com/">
    <img src="https://img.shields.io/badge/GSAP_3-%2388CE02.svg?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP 3" />
  </a>
</p>

<p align="center">
  A premium, interactive playground fusing visual storytelling, fluid mechanics, and mathematical layout animations. Designed to feel physical, organic, and alive.
</p>

---

## 🔮 The Core Experience

This dossier is engineered as a tactile journey. Every scroll and cursor interaction triggers a real-time physical reaction, turning standard UI elements into responsive interactive media:

*   🌊 **Fluid Scroll Inertia:** Intercepts native scroll velocity using [Lenis](https://github.com/darkroomengineering/lenis) for smooth, consistent scroll triggers.
*   📐 **Geometric Morphing:** Draws responsive vectors dynamically synced with ScrollTrigger markers.
*   🎭 **Organic Masking:** Distorts layout pixels using SVG turbulence and displacement matrix calculations.
*   ⚡ **Variable Font Proximity:** Bends typography weight and width based on mouse cursor distance.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Framework** | **React 19** | Stateful component logic & unified renderer |
| **Build Engine** | **Vite 8** | Sub-millisecond HMR & optimized production assets |
| **Styling** | **Tailwind CSS v4** | Next-gen post-CSS utility layer with custom theme tokens |
| **Animations** | **GSAP 3 + ScrollTrigger** | Scroll-scrubbed timelines & custom easing controls |
| **Scroller** | **Lenis** | Smooth inertia rendering & custom scroll interpolation |
| **Morphing** | **Flubber** | SVG path morphing calculations |

---

## 🧪 Interactive Mechanics & Math Details

<details>
<summary><b>🎬 1. Spotlight Mask Reveal (click to expand)</b></summary>

### The Mechanics
Hovering over the primary portrait morphs and reveals a hidden underlying layer (casual black jacket reveals a formal suit).
*   **The SVG Distortion Map:** An SVG `<feTurbulence>` filter is paired with a `<feDisplacementMap>` to create an organic "amoeba" shape.
*   **Pointer Tracking:** The center coordinates of the mask circle (`--mx`, `--my`) are continuously updated in CSS variables via cursor movements.

```xml
<filter id="amoebaDistort" x="-60%" y="-60%" width="220%" height="220%">
  <feTurbulence type="turbulence" baseFrequency="0.013" numOctaves="2" seed="4" result="noise">
    <animate attributeName="baseFrequency" dur="12s" values="0.009;0.018;0.012;0.009" repeatCount="indefinite" />
  </feTurbulence>
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="60" xChannelSelector="R" yChannelSelector="G" />
</filter>
```
</details>

<details>
<summary><b>📈 2. Dynamic SVG Scroll Curve (click to expand)</b></summary>

### The Mechanics
As the user scrolls, a curve grows dynamically out of the stem of the standalone letter **"I"** in the Hero headline and winds down into the roles list.
*   **Font Measurement:** Utilizes a canvas context helper to measure the exact rendered width of the "I" glyph.
*   **Scroll-Scrub Timeline:** GSAP's `ScrollTrigger` drives a `strokeDashoffset` from `1` to `0` along a cubic Bezier segment.
*   **Stability Math:** Employs high-frequency `requestAnimationFrame` ticks to adjust the path's starting coordinate offset as the parent elements translate upwards under progressive scroll-blur transforms.
</details>

<details>
<summary><b>✏️ 3. Proximity-Based Variable Typography (click to expand)</b></summary>

### The Mechanics
Headings morph their character weights and widths depending on cursor proximity.
*   **Variable Axes:** Animates the `wght` and `wdth` axes of the **Roboto Flex** variable font.
*   **Proximity Calculations:** Calculates the distance between the mouse $(x_m, y_m)$ and each individual character span center $(x_c, y_c)$:

$$d = \sqrt{(x_m - x_c)^2 + (y_m - y_c)^2}$$

*   **Axis Interpolation:**
    
$$\text{Weight} = \text{BoldWght} + (\text{ThinWght} - \text{BoldWght}) \times \max\left(0, 1 - \frac{d}{\text{Radius}}\right)$$
</details>

---

## 📦 Project Anatomy

```markdown
portfolio_final/
├── src/
│   ├── assets/             # Video loops, SVG vectors & graphics
│   ├── App.jsx             # Main container & Lenis initializations
│   ├── IntroLoader.jsx     # Signature draw-in preloader component
│   ├── HeroReveal.jsx      # Fluid mask layout following the pointer
│   ├── ScrollCurve.jsx     # High-fidelity SVG path generator
│   ├── Roles.jsx           # Hover list supporting custom video cursors
│   ├── FeaturedWorks.jsx   # Project grids and modal showcase
│   ├── Contact.jsx         # Circular reveal email/social section
│   ├── Footer.jsx          # Dynamic viewport-scaling wordmark
│   └── index.css           # Custom theme variables & core post-CSS layers
```

---

## ⚡ Setup & Installation


### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (version `18.x` or higher is recommended).
You can verify your installation by running:
```bash
node --version
npm --version
```

### 2. Steps to Run
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/gargibhardwaj24/dossier.git
    cd dossier
    ```
2.  **Install Project Dependencies:**
    ```bash
    npm install
    ```
3.  **Spin Up Local Dev Server:**
    ```bash
    npm run dev
    ```
    *The app will load at `http://localhost:5173/` by default.*

4.  **Create Optimized Production Bundle:**
    ```bash
    npm run build
    ```

---

## 💼 Featured Work Showcase

*   **[humanOS](https://human-os-two.vercel.app/)** — *[GitHub](https://github.com/gargibhardwaj24/humanOS)*
    An AI personal OS managing focus, habits, and self-growth indices.
*   **[Procrastinator](https://procrastinator-zeta.vercel.app/)** — *[GitHub](https://github.com/gargibhardwaj24/Procrastinator)*
    A productivity platform designed to combat procrastination.
*   **[NanoFactz](https://nanofacts.vercel.app/)** — *[GitHub](https://github.com/gargibhardwaj24/NanoFactz)*
    A micro-learning app delivering bite-sized facts.
*   **HushMeet**
    AI-driven communication converting visual mouth shapes to speech/text outputs.

---

## 📬 Reach Out

<p align="center">
  <a href="mailto:gargibhardwaj2430@gmail.com">
    <img src="https://img.shields.io/badge/Email-gargibhardwaj2430%40gmail.com-blue?style=flat-square&logo=gmail&logoColor=white&color=D14836" alt="Email" />
  </a>
  <a href="https://www.linkedin.com/in/gargibhardwaj24">
    <img src="https://img.shields.io/badge/LinkedIn-gargibhardwaj24-blue?style=flat-square&logo=linkedin&logoColor=white&color=0A66C2" alt="LinkedIn" />
  </a>
  <a href="https://github.com/gargibhardwaj24">
    <img src="https://img.shields.io/badge/GitHub-gargibhardwaj24-blue?style=flat-square&logo=github&logoColor=white&color=24292e" alt="GitHub" />
  </a>
</p>

---
<p align="center">Made with <3 and Math by Gargi Bhardwaj</p>
