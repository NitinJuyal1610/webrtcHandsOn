// import React from 'react'

import { useEffect, useState } from 'react';

function Sender() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    //-------------//
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'identify-as-sender' }));
      setSocket(socket); // Set the socket state
      console.log('WebSocket connection opened');
    };
  }, []);

  //-------------//
  const startSendingMessage = async () => {
    if (!socket) return;
    const rtcPeer = new RTCPeerConnection();

    //events
    rtcPeer.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.send(
          JSON.stringify({ type: 'candidate', message: event.candidate }),
        );
      } else {
        console.log('No more candidates');
      } // Send candidate to receiver
    };

    //send sdp
    const offer = await rtcPeer.createOffer();
    await rtcPeer.setLocalDescription(offer);

    socket?.send(JSON.stringify({ type: 'create-offer', sdp: offer }));

    socket.onmessage = async (event) => {
      // Receive offer from receiver
      const message = JSON.parse(event.data);
      if (message.type === 'create-answer') {
        const offer = message?.message;
        rtcPeer.setRemoteDescription(offer);
      }
    };
  };

  return (
    <div>
      <button onClick={startSendingMessage}>Create Offer</button>
    </div>
  );
}

export default Sender;
