import madul from "@bsgbryan/madul"

import params from "./params"

const rz = await madul('+RogueZero', params, `${__dirname}/..`)

Bun.serve({
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/chat") {
      console.log(`upgrade!`);
      return server.upgrade(req) ?
        new Response("Welcome! 🎉")
        :
        new Response("WebSocket upgrade error", { status: 400 });
    }

    return new Response("Rebelions are built on hope!");
  },
  websocket: {
    perMessageDeflate: true,
    // TypeScript: specify the type of ws.data like this
    // data: {} as { username: string },
    open(ws) {
      // const msg = `${ws.data.username} has entered the chat`;
      // ws.subscribe("the-group-chat");
      // server.publish("the-group-chat", msg);
    },
    message(ws, message) {
      // this is a group chat
      // so the server re-broadcasts incoming message to everyone
      // server.publish("the-group-chat", `${ws.data.username}: ${message}`);

      // inspect current subscriptions
      console.log(ws.subscriptions); // ["the-group-chat"]
    },
    close(ws) {
      // const msg = `${ws.data.username} has left the chat`;
      // ws.unsubscribe("the-group-chat");
      // server.publish("the-group-chat", msg);
    },
  },
});
