# MJML Email System

MJML-based workflow for building and previewing responsive HTML email templates.

This repository demonstrates a simple, real-world email development setup using MJML, including compilation, local preview, and file watching.

The `ember-north` template in this repo is currently a test implementation for validating the npm-based workflow.

Main scripts:

- `build`: compile one MJML template into HTML
- `dev`: build, serve with BrowserSync, and watch for changes

## Requirements

- Node.js `~24`
- npm

## Install

```bash
npm install
```

## Project Structure

```text
src/<slug>/index.mjml        # main template
src/<slug>/partials/         # reusable MJML components

dist/<slug>/index.html       # compiled output

screenshots/<slug>/          # preview images (desktop/mobile)

dev.config.json              # optional defaults for dev script
```

## Scripts

### Build

Build a specific email template by slug:

```bash
npm run build -- <slug>
```

Example:

```bash
npm run build -- email-1
```

Notes:

The build script requires the slug as a CLI argument and does not use `dev.config.json`.

### Dev

Start a local BrowserSync server for one slug, run an initial build, and watch `src/<slug>` for `.mjml` and `.json` changes:

```bash
npm run dev -- <slug>
```

or use `dev.config.json`:

```json
{
  "slug": "email-1",
  "browser": "chrome"
}
```

When `slug` is set in `dev.config.json`, you can run:

```bash
npm run dev
```

The browser will automatically reload when changes are made to `.mjml` or `.json` files.

## Browser Option (`dev.config.json`)

Set `browser` to any BrowserSync-compatible browser name. Common values:

- Chrome: `"chrome"`
- Edge: `"msedge"`
- Firefox: `"firefox"`

## Template Design Notes

- `src/ember-north/readme.md` contains the design guide for the `ember-north` email (palette, subject line, preview line, and polish notes).
