import { useEffect, useState } from "react"


const Sender = () => {
    const [socket , setsocket] = useState<WebSocket | null>(null);
    useEffect(()=>{
        const socket = new WebSocket('ws://localhost:8080')
        setsocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({type : "sender"}))
        }
        
    },[])
    async function startSendingVideos()
    {
        if(!socket) return ;
        const pc = new RTCPeerConnection();
        pc.onnegotiationneeded = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.send(JSON.stringify({type : "createOffer" , sdp : pc.localDescription}));
        }
        pc.onicecandidate = (event) => {
            if(event.candidate)
            {
                socket.send(JSON.stringify({type : "iceCandidate" , candidate : event.candidate}));
            }
        }

        socket.onmessage =   (event) => {
            const data = JSON.parse(event.data);
            if(data.type === "createAnswer")
            {
                 pc.setRemoteDescription(data.sdp);
            }
            else if (data.type === "iceCandidate")
            {
                pc.addIceCandidate(data.candidate);
            }

        }
        const stream = await navigator.mediaDevices.getUserMedia({video : true , audio : false});
        pc.addTrack(stream.getTracks()[0]);
        const video = document.createElement("video");
        document.body.appendChild(video);
        video.srcObject = stream;
        video.play();

    }
  return (
    <div>Sender
        <button onClick={startSendingVideos}>Send video</button>
    </div>
  )
}

export default Sender