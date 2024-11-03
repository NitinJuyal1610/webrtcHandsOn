import { useEffect, useRef } from 'react';

function Receiver() {
  const rtcPeerRef = useRef<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'identify-as-receiver' }));
      console.log('WebSocket connection opened');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'create-offer') {
        const offer = message.sdp;
        rtcPeerRef.current = new RTCPeerConnection();

        rtcPeerRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.send(
              JSON.stringify({
                type: 'iceCandidate',
                candidate: event.candidate,
              }),
            );
          } else {
            console.log('No more candidates');
          }
        };

        rtcPeerRef.current.ontrack = (event) => {
          console.log(event.track, '--track');

          if (videoRef.current) {
            videoRef.current.srcObject = new MediaStream([event?.track]);
            videoRef.current.play();
          }
        };

        rtcPeerRef.current
          .setRemoteDescription(new RTCSessionDescription(offer))
          .then(() => {
            return rtcPeerRef.current?.createAnswer();
          })
          .then((answer) => {
            return rtcPeerRef.current?.setLocalDescription(answer);
          })
          .then(() => {
            socket.send(
              JSON.stringify({
                type: 'create-answer',
                sdp: rtcPeerRef.current?.localDescription,
              }),
            );
          })
          .catch((error) => {
            console.error('Error during offer handling:', error);
          });
      } else if (message.type === 'iceCandidate') {
        console.log(message.candidate, 'received candidate');
        rtcPeerRef.current
          ?.addIceCandidate(new RTCIceCandidate(message.candidate))
          .catch((error) => {
            console.error('Error adding received ice candidate:', error);
          });
      }
    };

    return () => {
      socket.close();
      rtcPeerRef.current?.close();
    };
  }, []);

  return (
    <div>
      <div>Receiver</div>
      {/* video element */}
      <video id="video" autoPlay muted ref={videoRef}></video>
    </div>
  );
}

export default Receiver;
