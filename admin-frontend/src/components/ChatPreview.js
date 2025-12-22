import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Headset, CircleOff } from 'lucide-react';

export default function ChatPreview({ nodes, edges, onClose }) {
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [messages, setMessages] = useState([]); // Stores the conversation ledger
  const [inputValue, setInputValue] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const chatEndRef = useRef(null);

  // 1. Initialize: Show Start Greeting + First Connected Node automatically
  useEffect(() => {
    if (!hasStarted) {
      const startNode = nodes.find(n => n.type === 'startNode');
      
      if (startNode) {
        const firstEdge = edges.find(e => e.source === startNode.id);
        const initialMessages = [];

        // Add Start Node message
        initialMessages.push({ 
          role: 'bot', 
          text: startNode.data?.label || 'Welcome!', 
          type: 'startNode' 
        });

        // Automatically add the next node if it exists
        if (firstEdge) {
          const nextNode = nodes.find(n => n.id === firstEdge.target);
          if (nextNode) {
            const nextText = nextNode.type === 'optionNode' 
              ? nextNode.data.question 
              : nextNode.data.label;
              
            initialMessages.push({ 
              role: 'bot', 
              text: nextText || '...', 
              type: nextNode.type 
            });
            setCurrentNodeId(nextNode.id); // Set interaction focus to the second node
          }
        } else {
          setCurrentNodeId(startNode.id);
        }

        setMessages(initialMessages);
        setHasStarted(true);
      }
    }
  }, [nodes, edges, hasStarted]);

  // 2. Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addBotMessage = (node) => {
    const text = node.type === 'optionNode' ? node.data.question : node.data.label;
    setMessages(prev => [...prev, { 
      role: 'bot', 
      text: text || '...', 
      type: node.type 
    }]);
  };

  const moveNext = (targetId, userText) => {
    if (userText) {
      setMessages(prev => [...prev, { role: 'user', text: userText }]);
    }

    const nextNode = nodes.find(n => n.id === targetId);
    
    if (nextNode) {
      setCurrentNodeId(nextNode.id);
      setTimeout(() => {
        addBotMessage(nextNode);
      }, 400);
    } else {
      setCurrentNodeId(null);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'Conversation ended.', 
        type: 'endNode' 
      }]);
    }
  };

  const handleOptionClick = (idx, text) => {
    const edge = edges.find(e => 
      e.source === currentNodeId && e.sourceHandle === `opt-${idx}`
    );
    if (edge) moveNext(edge.target, text);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const edge = edges.find(e => e.source === currentNodeId);
    if (edge) {
      moveNext(edge.target, inputValue);
      setInputValue('');
    }
  };

  const currentNode = nodes.find(n => n.id === currentNodeId);

  return (
    <div className="preview-overlay">
      <div className="chat-window">
        <div className="chat-header">
          <span>Chat Simulation</span>
          <X onClick={onClose} style={{ cursor: 'pointer' }} size={20} />
        </div>

        <div className="chat-content">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>
              <div className="avatar">
                {m.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
              </div>
              <div className="message-text">
                {m.type === 'agentNode' && (
                  <span style={{ color: '#e11d48', fontWeight: 'bold' }}>[AGENT]: </span>
                )}
                {m.text}
              </div>
            </div>
          ))}

          <div className="chat-actions">
            {/* Options display */}
            {currentNode?.type === 'optionNode' && (
              <div className="options-grid">
                {currentNode.data.options?.map((opt, i) => (
                  <button key={i} onClick={() => handleOptionClick(i, opt)} className="action-btn">
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Input field display */}
            {currentNode?.type === 'inputNode' && (
              <form onSubmit={handleInputSubmit} className="input-form">
                <input 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  placeholder="Type your response..." 
                  autoFocus 
                />
                <button type="submit"><Send size={16} /></button>
              </form>
            )}

            {/* "Continue" button - Only for Message Nodes (Start is now automatic) */}
            {currentNode?.type === 'messageNode' && (
              <button 
                onClick={() => {
                  const edge = edges.find(e => e.source === currentNodeId);
                  moveNext(edge?.target, "Continue");
                }} 
                className="action-btn next"
              >
                Continue
              </button>
            )}

            {currentNode?.type === 'agentNode' && (
              <button 
                onClick={() => {
                  const edge = edges.find(e => e.source === currentNodeId);
                  moveNext(edge?.target, "Connect me");
                }} 
                className="action-btn agent"
              >
                Connect to Live Agent
              </button>
            )}
            
            {currentNode?.type === 'endNode' && (
              <div className="end-badge"><CircleOff size={14}/> Session Finished</div>
            )}
          </div>
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}