# Astra Play Demo

This repo contains a single-page React-in-the-browser prototype that mirrors the standalone `index.html`. Because everything is self-contained you can serve the preview from any static host.

## Local preview

```bash
python -m http.server 4173 --bind 0.0.0.0
```

Then open `http://localhost:4173/index.html` in your browser.

## Sharing a temporary URL

If you need to hand someone else a quick link without deploying to Vercel/GitHub Pages yet, you can wrap the local server in a tunnel:

* [`localhost.run`](https://localhost.run):
  ```bash
  ssh -o StrictHostKeyChecking=no -R 80:localhost:4173 nokey@localhost.run
  ```
* [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/run-tunnel/trycloudflare/):
  ```bash
  cloudflared tunnel --url http://localhost:4173
  ```

Both commands will print a public HTTPS URL that forwards back to the running dev server. Hit `Ctrl+C` in that terminal to tear down the tunnel when you are done. For a production-grade URL, deploy the repo to Vercel (a `vercel.json` file is already included), Netlify, or any static host.
