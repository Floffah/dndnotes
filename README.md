# DNDNotes

## Development

You need to have corepack enabled in your current node installation.
Make sure you have node 21 installed and run the following in your terminal:

```bash
npm uninstall yarn -g
corepack enable
corepack install
yarn exec env # <-- This should output a path to the yarn binary rather than a list of environment variables - if it doesn't consult the yarn docs https://yarnpkg.com/corepack
yarn
```

### Discord activity

To get tunnels set up for your discord activity, you need to do the following:

```shell
brew install cloudflared # install cloudflare tunnel service
cloudflared login # login to your cloudflare account - make sure to give it access to one of your domains here

cloudflared tunnel create discord-activity # create a tunnel named dndnotes
cloudflared tunnel route dns discord-activity dnda.tunnel.floffah.dev # replace domain with your own

cloudflare tunnel create dndnotes-web # create a tunnel named dndnotes-web
cloudflare tunnel route dns dndnotes-web dndnotes.tunnel.floffah.dev # replace domain with your own

yarn dev # start the dndnotes web dev server (where the api is hosted) and the discord-activity frontend dev server
yarn tunnel # start the cloudflare tunnels
```

Then link these domains to discord. In your developer dashboard, go to the "URL Mappings" tab and add the following mappings:
- `/` - dnda.tunnel.floffah.dev
- `/api` - dndnotes.tunnel.floffah.dev/api
- `/icons` - api.iconify.design