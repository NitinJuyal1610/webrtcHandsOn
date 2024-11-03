import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;
wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data: any) {
    const message = JSON.parse(data);
    console.log(
      message,
      '-msg',
      senderSocket && receiverSocket
        ? 'both'
        : senderSocket
        ? 'sender'
        : receiverSocket
        ? 'receiver'
        : 'none',
    );
    if (message.type === 'identify-as-sender') {
      senderSocket = ws;
    } else if (message.type === 'identify-as-receiver') {
      receiverSocket = ws;
    } else if (message.type === 'create-offer') {
      if (senderSocket && receiverSocket) {
        receiverSocket.send(
          JSON.stringify({ type: 'create-offer', message: message.sdp }),
        );
      }
      console.log('offer created ');
    } else if (message.type === 'create-answer') {
      if (senderSocket && receiverSocket) {
        senderSocket.send(
          JSON.stringify({ type: 'create-answer', message: message.sdp }),
        );
      }
      console.log('answer created ');
    } else if (message.type === 'iceCandidate') {
      if (ws === senderSocket) {
        receiverSocket?.send(
          JSON.stringify({ type: 'candidate', message: message.candidate }),
        );
      } else if (ws === receiverSocket) {
        senderSocket?.send(
          JSON.stringify({ type: 'candidate', message: message.candidate }),
        );
      }
      console.log('candidate created ');
    }
    ``;
  });

  // ws.send('something');
});
