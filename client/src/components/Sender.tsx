import { useEffect, useState } from 'react';
function Sender() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'identify-as-sender' }));
      setSocket(socket);
      console.log('WebSocket connection opened');
    };

    return () => {
      socket.close();
    };
  }, []);

  const startSendingMessage = async () => {
    if (!socket) return;
    const rtcPeer = new RTCPeerConnection();

    //events
    rtcPeer.onicecandidate = (event) => {
      if (event?.candidate) {
        socket?.send(
          JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }),
        );
      } else {
        console.log('No more candidates');
      }
    };

    rtcPeer.onnegotiationneeded = async () => {
      //send sdp
      const offer = await rtcPeer.createOffer();
      await rtcPeer.setLocalDescription(offer);
      socket?.send(JSON.stringify({ type: 'create-offer', sdp: offer }));
    };

    rtcPeer.ontrack = (event) => {
      console.log(event, '--track');
      const stream = event.streams[0];
      const videoElement = document.getElementById('video') as HTMLVideoElement;
      videoElement.srcObject = stream;
      videoElement.play();
    };

    socket.onmessage = async (event) => {
      // Receive offer from receiver
      const message = JSON.parse(event.data);
      if (message.type === 'create-answer') {
        const offer = message?.sdp;
        rtcPeer.setRemoteDescription(offer);
      } else if (message.type === 'iceCandidate') {
        rtcPeer.addIceCandidate(message?.candidate);
      }
    };

    //request video and audio permission
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    rtcPeer.addTrack(stream.getVideoTracks()[0]);
  };

  return (
    <div>
      <button onClick={startSendingMessage}>Create Offer</button>
    </div>
  );
}

export default Sender;
