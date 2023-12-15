# solid-contacts-app
## Notes for marker
- "src/lib/index.ts" contains all the main application logic.
- "routes" contains the pages.
- "lib/components" contains web components.

- Make sure to use http and https correctly when logging in. The application contains bugs that may result in odd behaviour.

## Accessing the deployed application
The application is hosted on vercel [here](https://solid-contacts-app.vercel.app/)

## Self hosting application
This application needs the lts version of node in order to run.

Download node version manager using:
> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

Install node lts:
> nvm install --lts

Use node lts:
> nvm use --lts

Install dependencies:
> npm i

Run app in dev mode:
> npm run dev

It should be hosted at http://localhost:5173. Check your terminal for the address

## Public pod provider
you can get a pod at [solid community](https://solidcommunity.net/).

## Self hosting pod
In a seperate working directory run:
> npx @solid/community-server -c @css:config/file.json -f data/

It should be hosted at http://localhost:3000. Check your terminal for address.
