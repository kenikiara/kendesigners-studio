# Updating your live site

Your site is a static export, so updating it means rebuilding the `out/`
folder and copying it to your hosting. There are two ways to do it.

## Option 1: One command (recommended)

This builds the site and uploads it straight to your domain over FTP.

**One-time setup**

1. In cPanel, open **FTP Accounts** and note (or create) an FTP account.
   You need the host, username and password.
2. In the project folder, copy `.env.deploy.example` to `.env.deploy`.
3. Open `.env.deploy` and fill in your FTP host, username and password.
   This file is private and is never committed or uploaded.

**Every time you want to update the live site**

```bash
npm run deploy
```

That builds the latest version and uploads it to `public_html`. Your
password stays on your machine; it is only used to connect.

Notes:
- If your host does not support FTPS, set `FTP_SECURE=false` in `.env.deploy`.
- For a subdomain or subfolder, set `FTP_REMOTE_DIR` to that folder.

## Option 2: Zip and upload by hand

If you prefer not to store FTP details:

```bash
npm run build
```

Then zip the contents of the `out/` folder and upload the zip in cPanel
**File Manager**, extract it into `public_html`, and delete the zip.
(Make sure "Show Hidden Files" is on so `.htaccess` is included.)

## Getting the latest code onto your machine

If you are pulling updates from GitHub first:

```bash
git pull
npm install
npm run deploy
```
