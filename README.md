# KUPOO Web Gallery

KUPOO is a playful web gallery for the unofficial drawing circle at the University of Aizu.
It is built with Next.js App Router and keeps the public site fast by reading local content files instead of calling the GitHub API on every page view.

## What It Does

- Shows KUPOO artworks in a noisy, bright, drawing-circle style gallery.
- Supports artwork detail pages with title, author, date, materials, image, and description.
- Filters the artwork list by author.
- Includes KUPOO intro, contact, and member pages.
- Uses the KUPOO favicon/logo assets in `public/`.
- Lets admins update artworks, site text, and members through GitHub API commits.

## Content Structure

- `content/paintings/*.md`: artwork metadata and descriptions.
- `content/site.json`: text used on the home, about, contact, and member pages.
- `content/members.json`: member list and member icon paths.
- `public/images/paintings/`: uploaded artwork images.
- `public/favicon.svg`, `public/kupoo-logo.svg`, `public/kupoo-mascot.svg`: KUPOO visual assets.

Normal site pages read these local files. GitHub API access is only used from admin actions such as loading/saving editable content or uploading works.

## Admin

The admin page is available at:

```txt
/admin
```

Admin features:

- Add, edit, and delete artworks.
- Select artwork authors from the member list, with `製作者不明` as a fallback option.
- Edit site text stored in `content/site.json`.
- Add, edit, and delete members stored in `content/members.json`.

Required environment variables:

```txt
ADMIN_PASSWORD=
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_TOKEN=
GITHUB_BRANCH=main
```

Admin edits commit directly to GitHub. Vercel redeploys from those new commits.

## Development

Install dependencies:

```sh
npm install
```

Run locally:

```sh
npm run dev
```

Build:

```sh
npm run build
```

## Pushing local changes

Admin edits can add commits to `content/**` and `public/images/**` directly on GitHub. To push local code changes without manually fixing those remote-managed files every time, use:

```sh
npm run sync:push
```

The script fetches `origin/main`, rebases local commits, accepts the GitHub version for conflicts under `content/` and `public/images/`, then pushes.

Typical flow:

```sh
git add .
git commit -m "Update KUPOO site"
npm run sync:push
```
