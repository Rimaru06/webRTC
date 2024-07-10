import { useEffect } from "react";



const Receiver = () => {
        useEffect(() => {
          const socket = new WebSocket("ws://localhost:8080");
          socket.onopen = () => {
            socket.send(JSON.stringify({ type: "receiver" }));
          };
          const video = document.createElement("video");
          video.muted = true;
          document.body.appendChild(video);
          socket.onmessage = async (event)=>{
            const message = JSON.parse(event.data);
            let pc : RTCPeerConnection | null = null;
            if(message.type === 'createOffer')
            {
                pc = new RTCPeerConnection();
                     pc.ontrack = (event) => {
                       console.log(event);
                       video.srcObject = new MediaStream([event.track]);
                       video.play();
                     };
                pc.setRemoteDescription(message.sdp);
                pc.onicecandidate = (event) => {
                    if(event.candidate)
                    {
                        socket.send(JSON.stringify({type : "iceCandidate" , candidate : event.candidate}));
                    }
                }
                const answer = await pc.createAnswer();
               await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({type : "createAnswer" , sdp : pc.localDescription}));
            }
            else if (message.type === "iceCandidate")
            {
                if(pc !== null)
                {
                    // @ts-ignore
                    pc.addIceCandidate(message.candidate);
                }
            }
          }
        }, []);
        
  return (
    <div>
      Receiver
      {/* <video ref={videoRef}></video> */}
    </div>
  );
}

export default Receiver