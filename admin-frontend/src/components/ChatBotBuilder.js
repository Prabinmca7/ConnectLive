import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  applyEdgeChanges, 
  applyNodeChanges 
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNodes from './nodes/CustomNodes'; 
import ChatPreview from './ChatPreview'; 

const nodeTypes = CustomNodes;

// ID counter for NEW nodes
let id = 0;
const getId = () => `node_${Date.now()}_${id++}`;

const ChatBotBuilder = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodesChange = useCallback((chs) => setNodes((nds) => applyNodeChanges(chs, nds)), []);
  const onEdgesChange = useCallback((chs) => setEdges((eds) => applyEdgeChanges(chs, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // --- LOAD FLOW ---
  useEffect(() => {
    const loadFlow = async () => {
      const flowId = "694919325b172d8248c9b654"; // Replace with dynamic ID later
      try {
        const response = await fetch(`${API_BASE_URL}/api/flows/${flowId}`);
        if (response.ok) {
          const data = await response.json();
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
        }
      } catch (err) {
        console.error("Load Error:", err);
      }
    };
    loadFlow();
  }, []);

  // --- SAVE FLOW ---
  const onSave = useCallback(async () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const payload = {
        id: "694919325b172d8248c9b654",
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport
      };

      try {
        const response = await fetch('${API_BASE_URL}/api/flows/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) alert('Flow saved to FineChat database!');
      } catch (err) {
        alert('Save Failed!');
      }
    }
  }, [reactFlowInstance]);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = {
      id: getId(),
      type,
      position,
      data: { 
        label: type === 'startNode' ? 'Welcome to FineChat!' : 'New Message', 
        question: 'New Question?', 
        options: ['Yes', 'No'], 
        validationType: 'text' 
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance]);

  const updateNodeData = (newData) => {
    setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, ...newData } } : n));
    setSelectedNode(prev => ({ ...prev, data: { ...prev.data, ...newData } }));
  };

  return (
    <div className="builder-view">
      <div className="view-header">
        <div>
          {/* <h1 className="view-title">ChatBot Builder</h1> */}
          <p className="view-subtitle">Design your automated conversation flow</p>
        </div>
        <div className="nav-actions">
          <button className="save-btn" onClick={onSave}>Save Changes</button>
          <button className="test-btn" onClick={() => setShowPreview(true)}>Run Simulation</button>
        </div>
      </div>

      <div className="builder-container" style={{ height: 'calc(100vh - 200px)' }}>
        <aside className="builder-sidebar">
          <p className="sidebar-title">COMPONENTS</p>
          <div className="dndnode" onDragStart={(e) => onDragStart(e, 'startNode')} draggable>Start Node</div>
          <div className="dndnode" onDragStart={(e) => onDragStart(e, 'messageNode')} draggable>Message</div>
          <div className="dndnode" onDragStart={(e) => onDragStart(e, 'optionNode')} draggable>Options</div>
          <div className="dndnode" onDragStart={(e) => onDragStart(e, 'inputNode')} draggable>User Input</div>
          <div className="dndnode agent" onDragStart={(e) => onDragStart(e, 'agentNode')} draggable>Talk to Agent</div>
          <div className="dndnode end" onDragStart={(e) => onDragStart(e, 'endNode')} draggable>End Flow</div>
        </aside>

        <div className="flow-container" ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange} 
            onConnect={onConnect} 
            onInit={setReactFlowInstance} 
            onDrop={onDrop} 
            onDragOver={(e) => e.preventDefault()}
            onNodeClick={(_, node) => setSelectedNode(node)} 
            nodeTypes={nodeTypes} 
            fitView
          >
            <Background color="#cbd5e1" gap={20} />
            <Controls />
          </ReactFlow>
        </div>

        <aside className="builder-sidebar settings">
          {selectedNode ? (
            <div className="settings-panel">
              <p className="sidebar-title">PROPERTIES</p>
              <label>Message Text</label>
              <textarea 
                rows="4"
                value={selectedNode.data.label || selectedNode.data.question} 
                onChange={(e) => updateNodeData({ label: e.target.value, question: e.target.value })} 
              />
              {selectedNode.type === 'optionNode' && (
                <>
                  <label>Buttons (comma separated)</label>
                  <input 
                    value={selectedNode.data.options?.join(', ')} 
                    onChange={(e) => updateNodeData({ options: e.target.value.split(',').map(o => o.trim()) })} 
                  />
                </>
              )}
              <button className="delete-btn" onClick={() => {
                setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
                setSelectedNode(null);
              }}>Delete Node</button>
            </div>
          ) : (
            <div className="empty-state">Select a component to edit</div>
          )}
        </aside>
      </div>

      {showPreview && <ChatPreview nodes={nodes} edges={edges} onClose={() => setShowPreview(false)} />}
    </div>
  );
};

export default ChatBotBuilder;