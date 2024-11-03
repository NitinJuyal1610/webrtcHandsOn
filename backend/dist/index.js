"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let senderSocket = null;
let receiverSocket = null;
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        const message = JSON.parse(data);
        if (message.type === 'identify-as-sender') {
            senderSocket = ws;
        }
        else if (message.type === 'identify-as-receiver') {
            receiverSocket = ws;
        }
        else if (message.type === 'create-offer') {
            if (senderSocket && receiverSocket) {
                receiverSocket.send(JSON.stringify({ type: 'create-offer', sdp: message === null || message === void 0 ? void 0 : message.sdp }));
            }
            console.log('offer created ');
        }
        else if (message.type === 'create-answer') {
            if (senderSocket && receiverSocket) {
                senderSocket.send(JSON.stringify({ type: 'create-answer', sdp: message === null || message === void 0 ? void 0 : message.sdp }));
            }
            console.log('answer created ');
        }
        else if (message.type === 'iceCandidate') {
            if (ws === senderSocket) {
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({
                    type: 'iceCandidate',
                    candidate: message === null || message === void 0 ? void 0 : message.candidate,
                }));
            }
            else if (ws === receiverSocket) {
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({
                    type: 'iceCandidate',
                    candidate: message === null || message === void 0 ? void 0 : message.candidate,
                }));
            }
        }
        ``;
    });
    // ws.send('something');
});
