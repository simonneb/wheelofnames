
# Random Name Spinner (GitHub Pages ready)

A tiny, no-dependencies web app that lets you paste a list of names and spin a colorful wheel to pick one at random. Designed to run entirely on GitHub Pages—no backend, no build step.

## ✨ Features
- **Easy list updates**: paste names (one per line), load from `names.json`, or store in your browser.
- **Deterministic UI**: spins for the duration you set (default 10s) and lands on a random name.
- **No frameworks**: plain HTML/CSS/JS. Works on desktop and mobile.
- **Accessible**: keyboard-friendly controls, visible focus, and winner announced via ARIA live region.

## 🚀 Quick start (GitHub Pages)
1. Create a new GitHub repo and enable **GitHub Pages**:
   - Go to **Settings → Pages**.
   - **Source**: choose `main` (or `master`) branch and `/ (root)`.
   - Save. GitHub will give you a Pages URL (e.g., `https://<you>.github.io/<repo>`).
2. Upload these files to the repo root:
   - `index.html`
   - `style.css`
   - `app.js`
   - `names.json` (optional—used on load if present)
3. Visit your Pages URL to use the app.

## 📝 Updating the list of names
You have three options:

**A) Edit `names.json` in the repo** (recommended for sharing):
```json
[
  "Name One",
  "Name Two",
  "Name Three"
]
```
- Commit your change; refresh the page. The app fetches `names.json` on load.

**B) Paste into the textbox and click _Use text_**
- This updates the in-memory list only (not the repo).
- Click **Export names.json** to download a file you can commit.

**C) Save to your browser**
- Click **Save to browser** to store the list in `localStorage` on your device.

## 🛠 Local development
Open `index.html` in a local server (recommended) to avoid `fetch` restrictions:

- With Python 3:
  ```bash
  python3 -m http.server 8000
  ```
  Then open `http://localhost:8000`.

(Opening directly as `file://` may block `fetch('names.json')` in some browsers.)

## ♿ Accessibility notes
- Contrast-aware styling.
- Keyboard focus states.
- Winner announced in a `<div aria-live="polite">` region.

## 📄 License
MIT – do whatever you like, just keep the license when you share.
