# sRPC

sRPC is a remote procedure call library for creating apis that run over a socket connection. It is a sandwich of the DX of tRPC, network apis of gRPC, and advanced caching capabilities of Apollo GraphQL.

sRPC currently uses websockets as the transport layer, however once Bun/Node supports QUIC and WebTransport, it will be switched to that.

## Roadmap

V0:
- [x] Basic websocket server & client (no typeinfo)
- [x] Error handling

V1:
- [ ] Typeinfo support
- [ ] Caching based on ^
- 