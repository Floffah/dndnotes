# DNDNotes Discord Embedded App

## Design considerations

- Discord states ["Do not trust data coming from the Discord client as truth. It's fine to use this data in your application locally, but assume any data coming from the Discord Client could be falsified"](https://discord.com/developers/docs/activities/development-guides#security-considerations). In this app, this does not apply to information retrieved through the Discord sdk in the client. However, the backend MUST talk to the Discord API to verify permissions. E.g., a user may be able to trick the app into showing the ui to link a campaign to the guild, but the backend must check this based on the Discord API not the client.