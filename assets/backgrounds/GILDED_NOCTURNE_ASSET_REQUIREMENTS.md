# Gilded Nocturne background asset requirements

The requested look depends on photographic or rendered metallic artwork. CSS may position and shade finished artwork, but should not be used to simulate the gold sculpture, foil, or suspended particles.

## Shared art direction

- Create an original, photorealistic luxury beauty-campaign environment with suspended, flowing metallic ribbons that suggest hair and abstract petals.
- Use dark antique gold, burnished gold, and controlled reflective highlights against obsidian plum (`#171014`), dark velvet (`#291B20`), and muted plum (`#49303A`).
- Include sparse, irregular foil fragments and fine metallic dust. Keep particles subtle and physically textured; do not use dots, emoji, cartoon sparkles, or broad yellow glow.
- Keep the overall image predominantly dark. Reserve quiet, low-detail areas behind page text, buttons, hairstyle cards, and photos.
- Do not include people, faces, hair models, words, logos, UI, or watermarks in the background artwork.

## Page artwork

1. **Homepage — Gilded Entrance:** a dramatic, legible hero composition with one memorable sculptural gold ribbon and restrained floating foil. Keep the central text and buttons readable.
2. **Photo preparation — Golden Veil:** gold foil and ribbons frame the page edges, leaving a dark, calm center behind the upload, camera, and photo-check controls.
3. **Hairstyle collection — Gilded Collection:** a restrained dark editorial environment with metallic forms near the outer edges. Keep the central grid area quiet so hairstyle cards remain prominent.
4. **Preview — Golden Transformation:** a subtle gold halo or ribbon around the content area, with clear dark space behind both the user's actual photo and the selected hairstyle.

## Delivery format

- Supply four distinct desktop background images, landscape, at approximately 2400 × 1600 pixels or larger.
- Supply portrait mobile crops for compositions where a desktop crop would hide the sculpture or intrude on content. Keep the upload page's controls clear in the mobile composition.
- Deliver optimized WebP or AVIF files; provide PNG only when real transparency is needed for a separate overlay layer.
- Target roughly 500 KB or less per optimized background where visual quality permits. Keep source-quality masters separately if available.
- Use descriptive filenames: `gilded-nocturne-home`, `gilded-nocturne-upload`, `gilded-nocturne-collection`, and `gilded-nocturne-preview`, with `-mobile` for portrait crops.

## Integration checks

- The homepage's inline `body` background shorthand currently overrides the shared stylesheet's background image. Remove or replace that override when integrating final artwork.
- The other three pages currently use the old shared architectural background. Update only background-related styling and artwork references.
- Use CSS for responsive image selection and positioning, restrained dark overlays, and optional subtle reflection movement. Respect `prefers-reduced-motion` and avoid heavy animation libraries or video.
- Inspect each page at desktop and mobile widths. Confirm text contrast and ensure upload, camera, photo checks, hairstyle cards, and both preview photos remain unobstructed.
