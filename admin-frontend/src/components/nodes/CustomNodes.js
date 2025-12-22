import React from 'react';
import { Handle, Position } from 'reactflow';
import { Play, MessageSquare, List, Type, Headset, CircleOff } from 'lucide-react';

const nodeStyle = {
  padding: '12px',
  borderRadius: '8px',
  background: '#fff',
  border: '1px solid #cbd5e1',
  minWidth: '180px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};


export const StartNode = ({ data }) => (
  <div style={{ ...nodeStyle, borderTop: '4px solid #22c55e' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#16a34a' }}>
      <Play size={16} /> START
    </div>
    <div style={{ fontSize: '12px', color: '#475569' }}>{data.label || 'Greeting message...'}</div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export const MessageNode = ({ data }) => (
  <div style={{ ...nodeStyle, borderTop: '4px solid #3b82f6' }}>
    <Handle type="target" position={Position.Top} />
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', marginBottom: '5px' }}>
      <MessageSquare size={16} /> MESSAGE
    </div>
    <div style={{ fontSize: '12px', color: '#475569' }}>
      {data.label || 'Enter message...'}
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export const OptionNode = ({ data }) => (
  <div style={{ ...nodeStyle, borderTop: '4px solid #f59e0b' }}>
    <Handle type="target" position={Position.Top} />
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', marginBottom: '8px' }}>
      <List size={16} /> OPTIONS
    </div>
    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '10px' }}>{data.question || 'Enter question...'}</div>
    {data.options?.map((opt, i) => (
      <div key={i} style={{ position: 'relative', background: '#f8fafc', padding: '6px', margin: '4px 0', borderRadius: '4px', border: '1px solid #e2e8f0', textAlign: 'center', fontSize: '11px' }}>
        {opt}
        <Handle 
          type="source" 
          position={Position.Right} 
          id={`opt-${i}`} 
          style={{ right: '-16px', background: '#f59e0b', width: '10px', height: '10px' }} 
        />
      </div>
    ))}
  </div>
);

export const InputNode = ({ data }) => (
  <div style={{ ...nodeStyle, borderTop: '4px solid #8b5cf6' }}>
    <Handle type="target" position={Position.Top} />
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed', marginBottom: '5px' }}>
      <Type size={16} /> GET INPUT
    </div>
    <div style={{ fontSize: '12px' }}>Request: <strong>{data.label || 'Enter prompt...'}</strong></div>
    <div style={{ fontSize: '10px', marginTop: '4px', color: '#94a3b8' }}>Validation: {data.validationType || 'text'}</div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export const AgentNode = ({ data }) => (
  <div style={{ ...nodeStyle, borderTop: '4px solid #f43f5e' }}>
    <Handle type="target" position={Position.Top} />
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e11d48', marginBottom: '5px' }}>
      <Headset size={16} /> TALK TO AGENT
    </div>
    <div style={{ fontSize: '11px', color: '#64748b' }}>
      {data.label || 'Routing to agent...'}
    </div>
    {/* <Handle type="source" position={Position.Bottom} /> */}
  </div>
);

export const EndNode = () => (
  <div style={{ ...nodeStyle, borderTop: '4px solid #64748b', minWidth: '120px' }}>
    <Handle type="target" position={Position.Top} />
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#475569' }}>
      <CircleOff size={16} /> END FLOW
    </div>
  </div>
);

// Unified Export Object
const CustomNodes = {
  startNode: StartNode,
  messageNode: MessageNode,
  optionNode: OptionNode,
  inputNode: InputNode,
  agentNode: AgentNode,
  endNode: EndNode
};

export default CustomNodes;