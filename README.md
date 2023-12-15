# solid-contacts-app
"src/lib/index.ts" contains all the main application logic. "routes" contains the pages. "lib/components" contains web components.

## Running the contacts application
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

## Self hosting a pod
In a seperate working directory run:
> npx @solid/community-server -c @css:config/file.json -f data/

It should be hosted at http://localhost:3000. Check your terminal for address
Alternatively get a pod at [solid community](https://solidcommunity.net/)

Note: Both addresses are http not https. The application contains bugs that may result in odd behaviour.
