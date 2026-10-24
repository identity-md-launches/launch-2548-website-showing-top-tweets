# Submission path and size budget

The submission limit is 8,388,608 bytes. The project uses this explicit budget before adding its ignore file:

| Included paths | Maximum budget |
| --- | ---: |
| `src/` | 160 KiB |
| `public/` (original vector artwork, share PNG, four local author avatars) | 512 KiB |
| `dist/` (complete production HTML, JavaScript, CSS, local fonts and images) | 1,024 KiB |
| `scripts/` | 100 KiB |
| `docs/`, `README.md`, `DESIGN.md` | 160 KiB |
| `package.json`, `package-lock.json`, TypeScript/Vite configuration, `index.html` | 160 KiB |
| `.gitignore` | 512 bytes |

The budget is under 2.1 MiB, leaving over 6 MiB of headroom. No runtime dependency archives or source font copies are included; Vite emits the fonts the export needs. The npm lockfile supports rebuilding from the public registry.

The root `.gitignore` excludes only generated dependencies and disposable caches at any nesting level (`node_modules/`, `.npm/`, `.vite/`, `.cache/`), and the disposable validation path `/test/scratch/`. It does **not** exclude `dist/`, `public/`, source, configuration, documentation, or the lockfile. No edits to `.git/`, `.github/`, `.env` files, or dependency contents are part of the submission.

Actual final sizes are recorded in `docs/VALIDATION.md` after building.
