import React, { useState, useRef, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import "../styles/Chat.css";
import { FaPhoneAlt, FaVideo, FaPaperclip, FaDesktop } from "react-icons/fa";

const ChatHeader = ({ currentChat }) => {
  const socket = useSocket();
  const streamRef = useRef(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [callRejected, setCallRejected] = useState(false);

  // 🎧 Start WebRTC Audio Call
  const startAudioCall = async () => {
    try {
      if (!currentChat?.agentSocketId) {
        alert("No connected agent to call.");
        return;
      }

      console.log("🎧 Starting audio call with agent:", currentChat.agentSocketId);

      // 1️⃣ Create PeerConnection
      peerRef.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // 2️⃣ Capture mic audio
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      setLocalStream(stream);
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
        await localAudioRef.current.play();
      }

      // 3️⃣ Add local tracks to connection
      stream.getTracks().forEach((track) => peerRef.current.addTrack(track, stream));

      // 4️⃣ Handle ICE candidates
      peerRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: currentChat.agentSocketId,
            candidate: event.candidate,
          });
        }
      };

      // 5️⃣ Create and send SDP offer
      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);
      socket.emit("audio-offer", {
        to: currentChat.agentSocketId,
        offer,
      });

      console.log("📤 Sent audio offer to agent");
      setIsCallActive(true);
    } catch (err) {
      console.error("❌ Error starting audio call:", err);
      alert("Unable to start audio call. Please check mic permissions.");
    }
  };

  // 🛑 End Audio Call
  const endAudioCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localAudioRef.current) {
      localAudioRef.current.srcObject = null;
    }

    setIsCallActive(false);
    console.log("🛑 Audio call ended");
  };


  useEffect(() => {
    if (!socket) return;
  
    socket.on("call-rejected", ({ from }) => {
      console.log("🚫 Call rejected by agent:", from);
      alert("Agent rejected your call."); // or show a small UI message
  
      // Stop local audio preview
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
  
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = null;
      }
  
      setIsCallActive(false);
    });
  
    return () => socket.off("call-rejected");
  }, [socket]);

  //Auto-hide the "Call Rejected" banner after a few seconds
  useEffect(() => {
    if (callRejected) {
      const timer = setTimeout(() => setCallRejected(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [callRejected]);


  useEffect(() => {
    if (!socket) return;
  
    socket.on("audio-answer", async ({ answer }) => {
      console.log("🎧 Received audio answer from agent");
  
      if (!peerRef.current) {
        console.warn("⚠️ Peer connection not ready yet. Ignoring early audio-answer.");
        return;
      }

      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("✅ Call connected!");
        setIsCallActive(true);
      }
    });

    // 🎧 Handle remote audio stream (agent speaking)
    if (peerRef.current) {
peerRef.current.ontrack = (event) => {
    console.log("🎧 Received remote (agent) audio stream");
    const [remoteStream] = event.streams;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      //remoteAudioRef.current.play().catch((err) => console.warn("Playback error:", err));
    }
  };
} else {
    console.warn("⚠️ peerRef.current not initialized yet.");
  }
  
    return () => socket.off("audio-answer");
  }, [socket]);

// 6️⃣ Handle incoming ICE candidates from the agent
useEffect(() => {
  if (!socket) return;

  socket.on("ice-candidate", async ({ candidate }) => {
    if (candidate && peerRef.current) {
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("🌐 Added ICE candidate from agent");
      } catch (err) {
        console.error("❌ Error adding ICE candidate:", err);
      }
    }
  });

  return () => socket.off("ice-candidate");
}, [socket]);

// Agent Ended the audio call
useEffect(() => {
  if (!socket) return;

  socket.on("call-ended", () => {
    console.log("📴 Agent ended the call");
    alert("Agent ended the call");

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    setIsCallActive(false);
  });

  return () => socket.off("call-ended");
}, [socket, localStream]);

  return (
    <header className="chat-header">
      <h3>Chat with Support</h3>

      <div className="chat-actions">
        {isCallActive ? (
          <FaPhoneAlt
            title="End Audio Call"
            style={{ color: "red", cursor: "pointer" }}
            onClick={endAudioCall}
          />
        ) : (
          <FaPhoneAlt
            title="Start Audio Call"
            style={{ color: "green", cursor: "pointer" }}
            onClick={startAudioCall}
          />
        )}
        <FaVideo title="Video Call" />
        <FaDesktop title="Screen Share" />
        <FaPaperclip title="Attach File" />
      </div>

      {/* 🎧 Local Audio Preview (hidden when not in use) */}
      <audio
        ref={localAudioRef}
        autoPlay
        muted
        controls
        style={{ display: isCallActive ? "block" : "none" }}
      />
      
      {/* 🎧 Remote (agent) audio */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        controls
        style={{ display: isCallActive ? "block" : "none" }}
      />

      {!isCallActive && callRejected && (
        <div className="call-rejected-banner">
          <p>Call rejected by the agent.</p>
        </div>
      )}
    </header>
  );
};

export default ChatHeader;
