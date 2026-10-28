# SAUDIA Aircraft AR — enhanced 3D edition

An educational, unofficial SAUDIA-inspired 3D aircraft experience using A-Frame and MindAR image tracking. All geometry is generated in `app.js`; no separate model download is required.

## Included
- `index.html` — Arabic landing page, camera and 3D preview controls.
- `app.js` — more detailed procedural aircraft, rotate/pinch-zoom and five interactive hotspots.
- `assets/saudia-reference.jpg` — image to use as the MindAR tracking target.

## Required before AR camera mode works
1. Visit https://hiukim.github.io/mind-ar-js-doc/tools/compile/ on a computer.
2. Upload `assets/saudia-reference.jpg` and compile.
3. Download the compiled target file and rename it `targets.mind`.
4. Put it at `assets/targets.mind` beside `saudia-reference.jpg`.
5. Upload the **unzipped contents** of this project to the root of a GitHub repository (not the ZIP itself).
6. Under repository Settings > Pages, choose Deploy from a branch, `main`, `/ (root)`; wait for the HTTPS URL.
7. Open the site on a phone, grant camera permission, and aim at the target picture shown on a *different* screen or printed sheet. Test in good lighting.

## 3D preview
Use the “استكشفي الطائرة 3D” button. Drag to rotate, pinch or use buttons to zoom, select parts for information. The preview requires an internet connection for the A-Frame JavaScript CDN.

## Notes
- `targets.mind` is NOT included, so camera-based image tracking will not start until the compilation step is completed.
- This model is a detailed original approximation of a commercial passenger aircraft in SAUDIA-inspired colors, **not** an official or photorealistic licensed SAUDIA aircraft model. The tail emblem is stylized.
- The AR image-tracking and mobile gesture behavior have not been validated on a physical phone. Test after publishing.
- GitHub Pages needs HTTPS for browser camera access. Camera permissions may be denied in embedded app browsers; try Chrome or Safari.
