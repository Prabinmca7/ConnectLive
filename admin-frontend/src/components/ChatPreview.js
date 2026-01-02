import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, CircleOff } from 'lucide-react';

export default function ChatPreview({ nodes, edges, onClose }) {
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  // Appointment preview state (frontend-only)
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});

  const chatEndRef = useRef(null);

  // ---------------- INIT ----------------
  useEffect(() => {
    if (!hasStarted) {
      const startNode = nodes.find(n => n.type === 'startNode');
      if (!startNode) return;

      const firstEdge = edges.find(e => e.source === startNode.id);
      const initialMessages = [];

      initialMessages.push({
        role: 'bot',
        text: startNode.data?.label || 'Welcome!',
        type: 'startNode'
      });

      if (firstEdge) {
        const nextNode = nodes.find(n => n.id === firstEdge.target);
        if (nextNode) {
          initialMessages.push({
            role: 'bot',
            text:
              nextNode.type === 'optionNode'
                ? nextNode.data.question
                : nextNode.data.label,
            type: nextNode.type
          });
          setCurrentNodeId(nextNode.id);
        }
      } else {
        setCurrentNodeId(startNode.id);
      }

      setMessages(initialMessages);
      setHasStarted(true);
    }
  }, [nodes, edges, hasStarted]);

  // ---------------- AUTOSCROLL ----------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---------------- HELPERS ----------------
  const addBotMessage = (node) => {
    const text =
      node.type === 'optionNode' ? node.data.question : node.data.label;

    setMessages(prev => [
      ...prev,
      { role: 'bot', text: text || '...', type: node.type }
    ]);
  };

  const moveNext = (targetId, userText) => {
    if (userText) {
      setMessages(prev => [...prev, { role: 'user', text: userText }]);
    }

    const nextNode = nodes.find(n => n.id === targetId);

    if (nextNode) {
      setCurrentNodeId(nextNode.id);
      setSelectedDate(null);
      setTimeout(() => addBotMessage(nextNode), 400);
    } else {
      setCurrentNodeId(null);
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: 'Conversation ended.', type: 'endNode' }
      ]);
    }
  };

  const handleOptionClick = (idx, text) => {
    const edge = edges.find(
      e => e.source === currentNodeId && e.sourceHandle === `opt-${idx}`
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

  // ---------------- APPOINTMENT LOGIC ----------------

  // SAFE DEFAULT CONFIG (IMPORTANT FIX)
  const getAppointmentConfig = (node) => ({
    startTime: node?.data?.appointment?.startTime || '09:00',
    endTime: node?.data?.appointment?.endTime || '17:00',
    slotDuration: Number(node?.data?.appointment?.slotDuration) || 30
  });

  const generateSlots = (cfg) => {
    const slots = [];
    const [sh, sm] = cfg.startTime.split(':').map(Number);
    const [eh, em] = cfg.endTime.split(':').map(Number);

    let start = sh * 60 + sm;
    const end = eh * 60 + em;

    while (start < end) {
      const h = Math.floor(start / 60).toString().padStart(2, '0');
      const m = (start % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      start += cfg.slotDuration;
    }
    return slots;
  };

  const bookSlot = (time) => {
    const key = `${selectedDate}_${time}`;
    if (bookedSlots[key]) return;

    setBookedSlots(prev => ({ ...prev, [key]: true }));

    const edge = edges.find(e => e.source === currentNodeId);
    moveNext(edge?.target, `${selectedDate} at ${time}`);
  };

  const currentNode = nodes.find(n => n.id === currentNodeId);

  // ---------------- RENDER ----------------
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
              <div className="message-text">{m.text}</div>
            </div>
          ))}

          <div className="chat-actions">
            {/* OPTIONS */}
            {currentNode?.type === 'optionNode' && (
              <div className="options-grid">
                {currentNode.data.options?.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(i, opt)}
                    className="action-btn"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* INPUT */}
            {currentNode?.type === 'inputNode' && (
              <form onSubmit={handleInputSubmit} className="input-form">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your response..."
                  autoFocus
                />
                <button type="submit">
                  <Send size={16} />
                </button>
              </form>
            )}

            {/* APPOINTMENT NODE */}
            {currentNode?.type === 'appointmentNode' && (
              <div className="appointment-ui">
                {!selectedDate && (
                  <input
                    type="date"
                    onChange={(e) => {
                      const date = e.target.value;
                      setSelectedDate(date);

                      setMessages(prev => [
                        ...prev,
                        {
                          role: 'bot',
                          text: `Available time slots for ${date}:`,
                          type: 'appointmentNode'
                        }
                      ]);
                    }}
                  />
                )}

                {selectedDate && (
                  <div className="options-grid">
                    {generateSlots(
                      getAppointmentConfig(currentNode)
                    ).map(time => {
                      const key = `${selectedDate}_${time}`;
                      return (
                        <button
                          key={time}
                          disabled={bookedSlots[key]}
                          onClick={() => bookSlot(time)}
                          className="action-btn"
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MESSAGE NODE */}
            {currentNode?.type === 'messageNode' && (
              <button
                onClick={() => {
                  const edge = edges.find(e => e.source === currentNodeId);
                  moveNext(edge?.target, 'Continue');
                }}
                className="action-btn next"
              >
                Continue
              </button>
            )}

            {/* AGENT NODE */}
            {currentNode?.type === 'agentNode' && (
              <button
                onClick={() => {
                  const edge = edges.find(e => e.source === currentNodeId);
                  moveNext(edge?.target, 'Connect me');
                }}
                className="action-btn agent"
              >
                Connect to Live Agent
              </button>
            )}

            {/* END NODE */}
            {currentNode?.type === 'endNode' && (
              <div className="end-badge">
                <CircleOff size={14} /> Session Finished
              </div>
            )}
          </div>

          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}
