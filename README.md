# ServiceHub Marketplace

A React and Vite website connecting people in Meru, Kenya, with local tradespeople and their products. The layout follows the supplied ServiceHub reference, including its photography, colours, contractor cards, product showcase and mobile navigation.

## Features

- Browse contractors by trade and search services, locations and products.
- Compare sample profiles, ratings and starting prices, with working rating and price sorting.
- Bookmark contractors and view the saved-only directory during the current visit.
- Explore each contractor's sample products and submit service or product enquiries.
- Submit a contractor listing request for review.
- Sign in, register, confirm an email address and reset a password through Netlify Identity.

## Local development

Install dependencies with `npm install`, then use `netlify dev --port 8889`. This runs Vite together with Netlify's local integrations. `npm run dev` runs only the frontend and does not provide Netlify services.

## Netlify deployment

`netlify.toml` retains the project's existing `npm run build` command and `dist` publish directory. Netlify performs the build during deployment. The SPA redirect supports direct navigation, while real static files remain accessible.

Netlify Forms and Netlify Identity activation markers are included. The static form in `public/__forms.html` registers the enquiry fields at deploy time. The React form posts to `/__forms.html` with a honeypot and reports submission failures without discarding the message. Received enquiries and listing requests are available in the site's Netlify Forms dashboard; they are not automatically forwarded to contractors or published as listings.

Identity signups require email confirmation unless the site's Identity settings enable automatic confirmation. Authentication callbacks and password recovery are handled by `@netlify/identity`.

## Sample content

The contractor profiles, verification badges, ratings and products are demonstration content, not verified businesses or live stock. Replace them with approved details before offering real transactions. Placeholder WhatsApp numbers were removed to avoid sending visitors to unverified contacts. Enquiries do not confirm a booking or purchase, and this site does not take payments.

Bookmarks are held only for the current page session; personal enquiry details are not saved in browser storage. The reference photographs are served locally from `public/images`, with a replacement for the broken refrigeration image.
