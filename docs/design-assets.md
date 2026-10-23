# Storefront design assets

The homepage and product pages follow the "Sitware Home v3" and "Sitware Product v2" designs (October 2026). Text, navigation, cards, FAQ and product details are rendered as HTML, not images. The design export is kept under the ignored `.local/redesign/` directory.

Type: Newsreader (headlines), Geist (body) and Geist Mono (labels), self-hosted with `next/font`. Colours are the design's ink `#1b1317`, paper `#f5f0e9`, sand `#ede6dc` and copper `#a8642f` / `#e0a172`, defined as CSS variables at the top of `apps/storefront/src/styles/sitware.css`.

## Photography

Design imagery lives in `apps/storefront/public/images/sitware/` as WebP copies of the design's assets: the Shift and Shift Pro cut-outs (`shift-cutout`, `shift-pro-cutout`, from the brand strategy deck), workspace photos (`shift`, `shiftpro`, `home`, `creators`, `pros`, `hybrid`, `changed`, `cta`) and the four how-it-works steps (`step1`–`step4`). They illustrate the design direction and are low resolution (300–1000 px wide); replace them with final product photography at 2× size. Real product images uploaded in Medusa take over the product page gallery automatically. Copy for Shift and Shift Pro lives in `apps/storefront/src/lib/workstations.ts`; prices always come from Medusa.

`sitware-hero-v2.webp` was generated using the built-in image generation tool and encoded as WebP for the homepage hero (the design's own hero is a lower-resolution crop of the same image). It is illustrative concept imagery, not final product photography. The original PNG is retained in `.local/design-source-images/` and the tool's generated-images directory.

The social share images `apps/storefront/src/app/opengraph-image.jpg` and `twitter-image.jpg` (1200×630) are a crop of this hero with a dark left gradient and the wordmark and tagline set in Georgia, made with ffmpeg. Replace them when final product photography is available.

Generation prompt:

> Use case: photorealistic-natural. Asset type: website hero background, landscape 16:9. Create a photoreal editorial golden hour home office inspired by the user reference images: premium walnut desk with two black metal desktop sit stand converters, a single tier converter holding a laptop near the center and a larger two tier converter holding a monitor and keyboard on the right. Warm sunlight through tall windows on the right, plants, books, bronze desk lamp, tan leather chair in foreground. Dark walnut shelves and shadowed negative space on left 40 percent to accommodate web heading. Warm copper, dark espresso, cream. Entire desk converter mechanisms must be plausible black scissor lifts with sturdy bases. Calm premium architectural photography, realistic materials, no text, no logos, no UI, no watermark. This is illustrative concept imagery, not final product specifications.

## Content boundaries

The approved tagline is “Designed For Better Work.” Shift and Shift Pro remain the confirmed product direction. No prices, specifications, stock, reviews, delivery promises, contact details or legal terms are invented: the design's sample price for Shift is not hardcoded, and both workstations show "Pricing at launch" until a price is set in Medusa. Specifications read "To be confirmed" until supplied. Footer links point to real sections or existing store routes. Newsletter signup is omitted until a real destination is configured.
