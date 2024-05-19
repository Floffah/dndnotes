# sRPC

sRPC is a remote procedure call library for creating apis that run over a socket connection. It is a sandwich of the DX of tRPC, network apis of gRPC, and advanced caching capabilities of Apollo GraphQL.

sRPC currently uses websockets as the transport layer, however once Bun/Node supports QUIC and WebTransport, it will be switched to that.

## Roadmap

V0:
- [x] Basic websocket server & client (no typeinfo)
- [x] Error handling

Future plans:
- [ ] Typeinfo support
- [ ] Caching based on ^
- [ ] Remove concept of query and mutation. Everything is either a callable or streamable procedure
- [ ] Add support for QUIC/WebTransport once supported by Bun/Node/Web (faster & smaller packets)
- [ ] Add support for REST based procedure calling (for serverless setups or clients that don't support websockets e.g. nextjs, discord activities)
- [ ] Add support for streamed xhr requests for subscriptions (for serverless setups or clients that don't support websockets e.g. nextjs, discord activities)