# CV Web

A CV editor with a live A4 preview. Edit on the right, watch the paper on the left,
press Print and get a PDF that looks exactly like the preview.

**[Open the live app →](https://chanasia.github.io/cv-web/)**

```bash
npm install
npm run dev
```

## What it does

- **Real A4 preview** — pages are exactly 210x297mm with `@page { margin: 0 }`, so
  printing is the preview at scale 1. Nothing is re-laid out for print.
- **Automatic pagination** — content that outgrows a page flows onto the next one,
  for as many pages as it takes. Section titles and job titles are never left
  stranded at the foot of a page.
- **Live** — every keystroke re-paginates.
- **Selectable PDF text** — the browser's own "Save as PDF" embeds the font and
  keeps the text real, so an ATS can parse it. No canvas rasterisation.
- **JSON in / out** — back up a CV or keep several tailored versions.
- **Autosave** to `localStorage`, so a refresh costs nothing.

## How pagination works

The hard part is knowing where a page ends before the browser prints it. Four steps,
in `src/lib` and `src/hooks`:

1. **Flatten** (`lib/blocks.ts`) — the document becomes an ordered list of `Block`s,
   each the smallest unit that must not be split: one bullet, one section title, one
   company name.
2. **Measure** (`components/preview/MeasureLayer.tsx`) — every block is rendered
   off-screen at the exact content width of a page and measured with
   `getBoundingClientRect()`. The same `BlockRenderer` draws both the hidden copy and
   the visible page, so the numbers cannot drift from reality.
3. **Pack** (`lib/paginate.ts`) — a greedy fill, then a pass that pulls orphaned
   headings onto the page they introduce.
4. **Scale** (`hooks/useFitScale.ts`) — the sheet is scaled to fit the column on
   screen and reset to 1 for print.

Three things are easy to get wrong here, and each is commented at the point it matters:

- The measuring layer must sit outside any `transform: scale()`, because
  `getBoundingClientRect()` reports post-transform sizes.
- Page height is *measured* from a ruler element, never computed from an assumed DPI.
- Spacing between blocks lives in `gapBefore()` rather than CSS margins. Collapsing
  margins would make a measured height differ from a consumed one, and both the
  paginator and the renderer read the same function, so they cannot disagree.

## Styling

Tailwind v4. `src/index.css` is about 40 lines and holds only what has no utility
equivalent: the `@font-face` rules, the `@theme` tokens, `@custom-variant dark`, and
`@page`. There are no hand-written CSS classes — including the print rules, which use
Tailwind's `print:` variant on the components themselves.

Type sizes are in `pt` because the output is paper. Retune the whole document from the
`@theme` block in `src/index.css`.

## Fonts

Figtree, self-hosted from `public/fonts` (SIL Open Font License, ~61KB). It stands in
for Proxima Nova, which is a commercial typeface and cannot be redistributed here;
Figtree is the closest free match in width, which is what governs how much text fits
on a page. To swap it, drop the files in `public/fonts` and change `--font-cv`.

## Scripts

| | |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | typecheck + production build |
| `npm run typecheck` | types only |
| `npm run lint` | oxlint |

## Deployment

Pushing to `main` builds and publishes to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Set
**Settings → Pages → Source** to **GitHub Actions** once, and the rest is automatic.

`vite.config.ts` sets `base: './'`, so the build works from any path — a project
page, a custom domain, or opened straight off disk — without hardcoding the
repository name.
