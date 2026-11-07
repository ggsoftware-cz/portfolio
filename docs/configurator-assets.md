# Configurator photography

Local, optimized WebP assets; no third-party image requests at runtime. These are
illustrative photographs, not pictures of real client projects or restaurants.
Downloaded November 7, 2026 under the [Unsplash license](https://unsplash.com/license),
which permits commercial and non-commercial use. Retain this provenance when
replacing or moving assets. No testimonial or endorsement is implied.

| Asset | Original source | Use |
| --- | --- | --- |
| `public/templates/atelier.webp` | https://images.unsplash.com/photo-1600210492486-724fe5c67fb0 | Interior studio sample |
| `public/templates/haven.webp` | https://images.unsplash.com/photo-1611892440504-42a792e24d32 | Hospitality sample |
| `public/templates/forma.webp` | https://images.unsplash.com/photo-1600607687920-4e2a09cf159d | Home services sample |
| `public/templates/savor.webp` | https://images.unsplash.com/photo-1414235077428-338989a2e8c0 | Restaurant sample |

Sources were downloaded at 1400px, quality 82, and encoded as WebP quality 80.
Alt text is localized in `messages/{cs,en}.json`; crops and treatment are controlled
by the validated configuration. The gallery hides its decorative, non-interactive
miniatures from assistive technology; each design's accessible name and selection
action appear directly beneath it.

## Shift shop

- `public/templates/shift.webp`: [KE ATLAS on Unsplash](https://unsplash.com/photos/7PFtrlle6hU),
  downloaded from `https://images.unsplash.com/photo-1512830357865-e3d72b4a32b7` at
  1400px, quality 82, WebP. Illustrative fashion / architecture photograph.
- `public/templates/shift/sneaker.glb`: [Materials Variants Shoe](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe),
  © 2021 Shopify, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
  Original 7,833,592 bytes; textures resized to 1024px JPEG quality 85, geometry
  and three material variants retained. Local asset: 1,453,140 bytes.
  Reproduce compression with `node scripts/prepare-shift-model.mjs source.glb`.
- `public/templates/shift/{beach,midnight,street}.webp`: derived renders of that
  licensed model using the storefront camera / lighting; same attribution.
- `public/templates/shift/credits.txt`: publicly linked attribution, including
  modifications. No Lando Norris assets or identity are reproduced.
- Barlow Condensed: Jeremy Tribby, SIL Open Font License 1.1, served locally
  through `next/font/google`; loading is deferred until the font is used.

`public/templates/thumbs/{atelier,haven,forma,savor,shift}.webp` are 700px,
quality-75 derivatives of the corresponding credited photographs. Gallery
miniatures and image-choice controls use these smaller files; full previews
retain the original 1400px photographs.
