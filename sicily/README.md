# Sicily 2026 — private trip page

A password-protected itinerary for Alex & Seb's Trapani trip (7–11 July 2026).

## How it works

`index.html` is fully self-contained. The trip content is **encrypted**
(AES-256-GCM, key derived from the password with PBKDF2 / SHA-256, 250k
iterations). The published page contains only ciphertext — the booking
references, hotel PIN, phone numbers and names are **not** readable in the
page source. Entering the correct password decrypts the content in the
browser and renders the full itinerary.

> Note: GitHub Pages on a free plan serves this file publicly, so the
> password is what keeps the *content* private. Anyone with the link sees
> only the unlock screen until they enter the password.

## Viewing

Open the deployed URL and enter the password. (Ask Alex.)

## Regenerating (e.g. to change the password or edit the trip)

You need the plaintext source HTML (kept private, not committed here):

```sh
node build.mjs <plaintext.html> index.html "<new-password>"
```

The page sets `noindex, nofollow` so search engines won't list it.
