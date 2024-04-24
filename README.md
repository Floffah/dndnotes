# DNDNotes

## Future plans

### "sRPC" like API rewrite

I want to rewrite the backend framework to a socket-based rpc system (custom "sRPC"), with a programmatic API similar to the current implementation/tRPC, under-the-hood network implementation similar to a cross between gRPC and Discord's gateway api, and advanced caching capabilities similar to that of Apollo Client but with automatic overwriting of cache entries when returned from a subscription. 

If QUIC and WebTransport has matured when I get to this point, I will use that as the transport layer, otherwise, I will use WebSockets.

Debating whether to implement this in Bun, Rust, or Ruby. (Probably Bun, unless they don't implement QUIC/WebTransport support by the time I get here)

Reasoning for this: I dislike using a REST-like API but then using these path arrays and a single query string that contains the inputs for ALL procedure calls, and also that its limited to just GET and POST.
In my mind a socket-based API is much more efficient and can allow for better DX and more advanced features for an RPC api.
I also dislike running this rest-based RPC api for queries and mutations, but then using a separate service for realtime (Pubnub). I want it all to be using the same API to use less network, to have control over the code, and write less code in the frontend with it all being handled in one place: the backend framework.
Using just REST on its own would still have these issues, and I don't like the idea of GraphQL as it uses FAR more network, doesn't support batching very well, and unless you spend A LOT of time getting it right, the DX is terrible. However, the advanced caching patterns that Apollo provides for GraphQL are VERY attractive, but not enough to make me want to commit to using GraphQL. At least with the way I have it implemented now, I can implement this sRPC system as a drop-in replacement for the current tRPC-like system, and have these caching capabilities I want immediately available in the entirety of both frontends with barely any refactoring. The same cannot be said for GraphQL.

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
cloudflared tunnel route dns discord-activity dndatunnel.floffah.dev # replace domain with your own

cloudflare tunnel create dndnotes-web # create a tunnel named dndnotes-web
cloudflare tunnel route dns dndnotes-web dndnotestunnel.floffah.dev # replace domain with your own

yarn dev # start the dndnotes web dev server (where the api is hosted) and the discord-activity frontend dev server
yarn tunnel # start the cloudflare tunnels
```

Then link these domains to discord. In your developer dashboard, go to the "URL Mappings" tab and add the following mappings: (replace the domains with your own)
- `/` - dndatunnel.floffah.dev
- `/dndnotes` - dndnotestunnel.floffah.dev
- `/icons` - api.iconify.design
- `/pubnub` - ps.pndsn.com

### Environment variables

#### Web

- `DISCORD_CLIENT_SECRET` = discord oauth client secret
- `MONGODB_URI` = mongodb connection string
- `NEXT_PUBLIC_BASE_URL` = base url for the web server, should be `http://localhost:3000` in dev - in prod i have it set to `https://dndnotes.floffah.dev`
- `NEXT_PUBLIC_DISCORD_CLIENT_ID` = discord oauth client id
- `NEXT_PUBLIC_DISCORD_REDIRECT_URI` = discord oauth redirect uri, set to `http://localhost:3000/api/discord/redirect` in dev

#### Server

- `MONGODB_URI_TESTS` = mongodb connection string for tests

#### Discord activity

- `DISCORD_CLIENT_SECRET` = discord oauth client secret
- `NEXT_PUBLIC_DISCORD_CLIENT_ID` = discord oauth client id
- `NEXT_PUBLIC_BASE_URL` = should be set to `https://<discord client id>.discordsays.com` in all environments. discord proxies the prod deployment AND the development cloudflare tunnel
- `NEXT_PUBLIC_FORCE_PROXIED_ICONS` = should always be `true` in all environments - forced iconify to use the iconify api through a discordsays.com proxied url mapping