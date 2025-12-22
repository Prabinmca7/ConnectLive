import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  ReactFlowProvider, 
  applyEdgeChanges, 
  applyNodeChanges 
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNodes from './components/nodes/CustomNodes'; 
import ChatPreview from './components/ChatPreview'; 
import './App.css';

const nodeTypes = CustomNodes;

// ID counter for NEW nodes created during the session
let id = 0;
const getId = () => `node_${Date.now()}_${id++}`;

const FlowBuilder = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodesChange = useCallback((chs) => setNodes((nds) => applyNodeChanges(chs, nds)), []);
  const onEdgesChange = useCallback((chs) => setEdges((eds) => applyEdgeChanges(chs, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  // --- 1. FIXED LOAD LOGIC ---
  useEffect(() => {
    const loadFlow = async () => {
      const flowId = "694919325b172d8248c9b654"; 
      if (!flowId) return;

      try {
        const response = await fetch(`http://localhost:5000/api/flows/${flowId}`);
        if (!response.ok) throw new Error("Failed to fetch");
        
        const data = await response.json();

        if (data) {
          // Use functional updates to ensure state is set correctly
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          console.log("Data loaded successfully");
        }
      } catch (err) {
        console.error("Load Error:", err);
      }
    };
    
    loadFlow();
  }, []); // Empty dependency array means this runs ONCE on mount

  // --- 2. FIXED SAVE LOGIC ---
  const onSave = useCallback(async () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      
      // We pass 'id' if we want to update the specific record
      const payload = {
        id: "694919325b172d8248c9b654", // Hardcoded for your test
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport
      };

      try {
        const response = await fetch('http://localhost:5000/api/flows/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const savedData = await response.json();
        alert('Flow Saved Successfully!');
        console.log('Saved result:', savedData);
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
        label: type === 'startNode' ? 'Welcome to our bot!' : 'New Message', 
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
    <div className="main-wrapper">
      <header className="navbar">
        <h2>BotArchitect 1.0</h2>
        <div className="nav-actions">
          <button className="save-btn" onClick={onSave}>Save Flow</button>
          <button className="test-btn" onClick={() => setShowPreview(true)}>Run Simulation</button>
        </div>
      </header>

      <div className="builder-container">
        <aside className="sidebar">
          <p className="sidebar-title">COMPONENTS</p>
          <div className="dndnode" onDragStart={(e) => onDragStart(e, 'startNode')} draggable>Start Node</div>
          <div className="dndnode" onDragStart={(e) => onDragStart(e, 'messageNode')} draggable>Message</div>
          <div className="dndnode" onDragStart={(e) => onDragStart(e, 'optionNode')} draggable>Options</div>
          <div className="dndnode" onDragStart={(e) => onDragStart(e, 'inputNode')} draggable>User Input</div>
          <div className="dndnode agent" onDragStart={(e) => onDragStart(e, 'agentNode')} draggable>Talk to Agent</div>
          <div className="dndnode end" onDragStart={(e) => onDragStart(e, 'endNode')} draggable>End Flow</div>
        </aside>

        <div className="flow-container" ref={reactFlowWrapper}>
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

        <aside className="sidebar settings">
          {selectedNode ? (
            <div className="settings-panel">
              <p className="sidebar-title">NODE PROPERTIES</p>
              <label>Text Content</label>
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
              {selectedNode.type === 'inputNode' && (
                <>
                  <label>Data Validation</label>
                  <select 
                    value={selectedNode.data.validationType} 
                    onChange={(e) => updateNodeData({ validationType: e.target.value })}
                  >
                    <option value="text">Any Text</option>
                    <option value="email">Email</option>
                    <option value="number">Numbers/Phone</option>
                  </select>
                </>
              )}
              <button className="delete-btn" onClick={() => {
                setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
                setSelectedNode(null);
              }}>Delete Node</button>
            </div>
          ) : (
            <div className="empty-state">Select a node to edit its properties.</div>
          )}
        </aside>
      </div>

      {showPreview && <ChatPreview nodes={nodes} edges={edges} onClose={() => setShowPreview(false)} />}
    </div>
  );
};

export default function App() { 
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  ); 
}