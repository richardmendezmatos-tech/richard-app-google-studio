---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking: The Premium Command Center Aesthetic

For Richard Automotive, the MANDATORY aesthetic is the **"Premium Command Center"**. 
- **Purpose**: High-end, Bloomberg-terminal-like interfaces for both Admin and Storefront.
- **Tone**: Dark glassmorphism, luxury fintech, cinematic lighting, and high data density.
- **Core Elements**: 
  - Dark slate themes (`bg-slate-900`, `bg-slate-950`).
  - Extreme glassmorphism (`backdrop-blur-3xl`, `backdrop-blur-xl`, `bg-white/5`).
  - Luminous accents (`shadow-[0_0_15px_rgba(0,174,217,0.4)]`, text-glow effects).
  - Semantic Tailwind v4 color tokens (`text-primary`, `border-primary/20`).
- **Differentiation**: Richard Automotive must look like a high-end enterprise operating system, not a generic dealership site.

**CRITICAL**: NEVER use pastel, playful, brutalist, or light-mode generic themes. Focus entirely on the dark, refined, and glowing Command Center aesthetic.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Implementation Guidelines

Focus on:
- **Typography**: Maintain high-contrast technical typography. Use clean sans-serif bodies with highly legible weights for data rows, and glowing (`text-shadow`) application for key metrics.
- **Color & Theme**: Exclusively use the Richard Automotive Tailwind v4 design system. Rely on `primary`, `emerald`, `purple`, and `rose` CSS variables defined in `index.css`. Maintain extreme consistency across modules.
- **Motion**: Use smooth, cinematic micro-interactions. Example: Button hovers that trigger glowing cyan halos (`hover:shadow-[0_0_20px_rgba(0,174,217,0.3)]`) and subtle lift (`hover:-translate-y-1`). Staggered fades (`fade-in-up`) for table rows.
- **Spatial Composition**: Prioritize data density but mask it with elegant padding and transparency. Use `grid` and `flex` layouts that adapt flawlessly.
- **Backgrounds & Visual Details**: Avoid flat colors like `#1e293b`. Instead use `bg-slate-900/40` layered over radial gradient blobs (`bg-primary/10 blur-[100px]`) to create deep atmospheric depth.

NEVER use generic AI aesthetics (purple gradients on white) or flat light-mode components. 

**IMPORTANT**: Any new UI element must cleanly integrate with the existing `Storefront` or `AdminPanel` ecosystems. Before adding independent CSS, verify if a Tailwind utility or a standard Command Center component already solves the problem.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
