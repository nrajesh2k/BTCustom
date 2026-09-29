# Braintree Custom Integration (Hosted Fields) — Node.js/Express

A fully custom Braintree checkout using [Hosted Fields](https://developer.paypal.com/braintree/docs/guides/hosted-fields/overview) instead of Drop-in — you control every pixel of the card form (card number, expiration, CVV are still hosted in secure Braintree iframes for PCI compliance, but everything else is your own markup/CSS).

## How it works

- `GET /client_token` — server generates a Braintree client token.
- Front-end (`public/index.html` + `public/client.js`) creates a Braintree client, then mounts Hosted Fields into your own styled `<div>` containers.
- On submit, `hostedFieldsInstance.tokenize()` returns a payment method nonce.
- `POST /checkout` — server takes that nonce + amount (+ optional cardholder name) and calls `gateway.transaction.sale()`.

## 1. Run locally

```bash
npm install
cp .env.example .env
# edit .env with your Braintree Sandbox credentials
npm start
```

Visit `http://localhost:3000`.

Get sandbox credentials from the [Braintree Control Panel](https://sandbox.braintreegateway.com/) → Settings → API Keys. Use Braintree's [test card numbers](https://developer.paypal.com/braintree/docs/reference/general/testing/node#test-cards) (e.g. `4111 1111 1111 1111`, any future expiration, any CVV) to test payments in Sandbox.

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Braintree custom Hosted Fields integration"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(`.env` is already git-ignored — never commit real API keys.)

## 3. Deploy to Render

1. In the Render dashboard: **New +** → **Web Service** → connect this GitHub repo.
2. Settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add environment variables under **Environment**:
   - `BT_ENVIRONMENT` = `Sandbox` (or `Production`)
   - `BT_MERCHANT_ID`
   - `BT_PUBLIC_KEY`
   - `BT_PRIVATE_KEY`
   - (Don't set `PORT` — Render injects this automatically and the app reads `process.env.PORT`.)
4. Deploy. Render gives you a public URL — the custom checkout form will be live at `/`.

## Customizing further

- Style the `.hosted-field` containers and pass matching `styles` into `braintree.hostedFields.create()` to match your brand (fonts, colors, invalid-state styling).
- Add 3D Secure by requesting a `three_d_secure` verification during `tokenize()` for stronger fraud protection on card payments.
- If you also want PayPal, Venmo, or Google Pay as payment options here, you'd add their respective Braintree client components (`braintree-web/paypal-checkout`, etc.) alongside Hosted Fields — Hosted Fields itself only covers card entry.
