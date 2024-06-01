import Pubnub from "pubnub";

export const pubnub = new Pubnub({
    publishKey: process.env.PUBNUB_PUBKEY as string,
    subscribeKey:
        (process.env.NEXT_PUBLIC_PUBNUB_SUBKEY as string) ??
        (process.env.PUBNUB_SUBKEY as string),
    secretKey: process.env.PUBNUB_SECRET as string,
    userId: "server",
});
