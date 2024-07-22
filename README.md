# DNDNotes

## Development

### Discord activity

> [!NOTE]
> Discord activity development is paused, this section is not necessary

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

(Replace with correct values)

```properties
DISCORD_BOT_TOKEN="token"
DISCORD_CLIENT_SECRET="secret"
NEXT_PUBLIC_BASE_URL="https://dndnotes.app" # no trailing slash
NEXT_PUBLIC_DISCORD_CLIENT_ID="client id"
NEXT_PUBLIC_DISCORD_REDIRECT_URI="https://dndnotes.app/api/auth/callback/discord"
PLANETSCALE_DB_HOST=aws.connect.psdb.cloud
PLANETSCALE_DB_USERNAME=username
PLANETSCALE_DB_PASSWORD=pscale_pw_somepassword
PLANETSCALE_DB=dndnotes
```
#### Server

Only requires credentials for a test database, should NOT be a database used for production or local testing as it will unpredictably wipe data.

```properties
TEST_DB_HOST=aws.connect.psdb.cloud
TEST_DB_USERNAME=username
TEST_DB_PASSWORD=pscale_pw_somepassword
TEST_DB=dndnotes
```
