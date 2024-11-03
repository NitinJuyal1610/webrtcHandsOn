// import React from 'react'

import { useEffect } from 'react';

function Receiver() {
  // const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    //-------------//
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'identify-as-receiver' }));
      // setSocket(socket); // Set the socket state
      console.log('WebSocket connection opened');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      console.log(message, '=msg');
      if (message.type === 'create-offer') {
        const offer = message?.message;
        const rtcPeer = new RTCPeerConnection();
        rtcPeer.setRemoteDescription(offer);
        rtcPeer.createAnswer().then((answer) => {
          rtcPeer.setLocalDescription(answer);
          socket?.send(JSON.stringify({ type: 'create-answer', sdp: answer }));
        });
      }
    };
  }, []);

  return (
    <div>
      <div>Receiver</div>
    </div>
  );
}

export default Receiver;
