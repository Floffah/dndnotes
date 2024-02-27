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