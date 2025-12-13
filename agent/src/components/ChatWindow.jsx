import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import MessageInput from "./MessageInput";
import "../styles/ChatWindow.css";
import { FaPhoneAlt } from "react-icons/fa"; // Importing icons

const ChatWindow = ({ currentChat }) => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const peerRef = useRef(null); // To store peer connection
  const [isCallActive, setIsCallActive] = useState(false);
  const remoteAudioRef = useRef(null);
  const localStreamRef = useRef(null);

  // 🧠 Listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    socket.on("receive-message", ({ from, message }) => {
      console.log("📩 Received message from:", from, "Message:", message);
      setMessages((prev) => [...prev, { from, message }]);
    });

    return () => socket.off("receive-message");
  }, [socket]);

  // 🧠 Load chat messages when switching chats
  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages || []);
    }
  }, [currentChat]);

  // 🚀 Send a message to the current customer
  const sendMessage = (msg) => {
    if (!msg.trim()) return;

    if (!currentChat || !currentChat.socketId) {
      console.warn("⚠️ Cannot send: No active customer or socketId missing.");
      alert("Customer is not connected or chat has ended.");
      return;
    }

    console.log("💬 Sending to:", currentChat.socketId, "Message:", msg);

    // 🔥 Send to backend to relay to customer
    socket.emit("send-message", { to: currentChat.socketId, message: msg });

    // ✅ Add to local message list
    setMessages((prev) => [...prev, { from: "You", message: msg }]);
  };

 // Listen for incoming audio offer (when customer calls)
 useEffect(() => {
  if (!socket) return;

  socket.on("audio-offer", ({ from, offer }) => {
    console.log("📞 Incoming audio call from:", from);
    setIncomingCall({ from, offer }); // Set the incoming call state
  });

  // 🧊 Listen for incoming ICE candidates from customer
  socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate && peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("🧊 Added ICE candidate from customer");
        } catch (err) {
          console.error("❌ Error adding ICE candidate:", err);
        }
      }
    });

  return () => socket.off("audio-offer");
}, [socket]);

// Function to accept the audio call
const acceptAudioCall = async () => {
  if (!incomingCall) return;

  const { from, offer } = incomingCall;

  try {
    console.log("✅ Accepting call from:", from);

    // 1️⃣ Create peer connection
    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // 2️⃣ Capture local microphone
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    localStreamRef.current = localStream;

    localStream.getTracks().forEach((track) =>
      peerRef.current.addTrack(track, localStream)
    );

    // 3️⃣ Play remote stream
    peerRef.current.ontrack = (event) => {
      console.log("🎧 Remote audio received!");
      const [remoteStream] = event.streams;
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
      }
    };

    // 4️⃣ Handle ICE candidates (send to customer)
    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: from,
          candidate: event.candidate,
        });
      }
    };

    // 5️⃣ Set remote description (customer’s offer)
    await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));

    // 6️⃣ Create and set local description (agent’s answer)
    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    // 7️⃣ Send answer back to customer
    socket.emit("audio-answer", { to: from, answer });
    console.log("📤 Sent audio answer to:", from);

    setIncomingCall(null);
    setIsCallActive(true);
  } catch (error) {
    console.error("❌ Error accepting audio call:", error);
    alert("Failed to accept call. Check microphone permissions.");
  }
};
// End audio call
const endAudioCall = () => {
  console.log("🛑 Ending call...");

  // Stop local mic
  if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
  }

  // Stop remote audio
  if (remoteAudioRef.current) {
    remoteAudioRef.current.srcObject = null;
  }

  // Close WebRTC connection
  if (peerRef.current) {
    peerRef.current.close();
    peerRef.current = null;
  }

  setIsCallActive(false);

  // Notify customer (optional)
  socket.emit("call-ended", { to: currentChat.socketId });
};
// Function to reject the audio call
const rejectAudioCall = () => {
  if (!incomingCall) return;

  // Notify customer through backend
  socket.emit("call-rejected", { to: incomingCall.from });

  console.log("❌ Rejected call from:", incomingCall.from);
  setIncomingCall(null); // Hide the inline call bar
};

  if (!currentChat) {
    return <div className="chat-window empty">Select a chat to start</div>;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{currentChat.name}</h3>
        <p className="email">{currentChat.email}</p>
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.from}:</strong> {msg.message}
          </div>
        ))}
      </div>

      {incomingCall && (
  <div className="incoming-call-inline">
    <span className="call-text">
      {incomingCall.from} is calling you...
    </span>
    <div className="call-buttons">
      <button className="accept-inline" onClick={acceptAudioCall} title="Accept Call">
        <FaPhoneAlt />
      </button>
      <button className="reject-inline" onClick={rejectAudioCall} title="Reject Call">
        <FaPhoneAlt />
      </button>
    </div>
  </div>
)}

{isCallActive && (
  <div className="call-active-bar">
    <audio ref={remoteAudioRef} autoPlay controls />
    <button className="end-call-btn" onClick={endAudioCall}>
      <FaPhoneAlt /> End Call
    </button>
  </div>
)}

      {currentChat.status === "ended" ? (
        <div className="chat-ended">Chat has ended</div>
      ) : (
        <MessageInput onSend={sendMessage} />
      )}


    </div>

    
  );
};

export default ChatWindow;
