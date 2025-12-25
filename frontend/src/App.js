import React, { useState } from "react";
import "./App.css";
import LaunchScreen from "./components/LaunchScreen";
import ChatWindow from "./components/ChatWindow";
import ChatWidgetView from "./components/ChatWidgetView";
import { SocketProvider } from "./context/SocketContext";

function App() {
  const [user, setUser] = useState(null);
  const [agentId, setAgentId] = useState(null);

  const handleChatStart = (userData, agentSocketId) => {
    setUser(userData);
    setAgentId(agentSocketId);
  };

  return (
    <SocketProvider>
      {/* {!user ? (
        <LaunchScreen onChatStart={handleChatStart} />
      ) : (
        <ChatWindow user={user} agentId={agentId}/>
      )} */}
<ChatWidgetView/>
    </SocketProvider>
  );
}

export default App;