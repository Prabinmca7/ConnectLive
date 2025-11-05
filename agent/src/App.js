import React, { useState } from "react";
import "./App.css";
import { SocketProvider } from "./context/SocketContext";
import LoginForm from "./components/LoginForm";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

function App() {
  const [agent, setAgent] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);

  if (!agent) {
    return (
      <SocketProvider>
        <LoginForm onLogin={setAgent} />
      </SocketProvider>
    );
  }

  return (
    <SocketProvider>
      <div className="agent-dashboard">
        <Header agent={agent} onLogout={() => setAgent(null)} />
        <main className="main-content">
          <Sidebar setCurrentChat={setCurrentChat} />
          <ChatWindow currentChat={currentChat} />
        </main>
      </div>
    </SocketProvider>
  );
}

export default App;