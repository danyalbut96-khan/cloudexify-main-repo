'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Mail, MessageSquare, Award, Play, ChevronRight, X, Sliders, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// 1. Custom Node Component to fit nicely in Admin design language
const PipelineNode = ({ data }: any) => {
  const Icon = data.icon;
  const isEmail = data.stageKey === 'email';
  const emailVerified = data.emailVerified;

  return (
    <div className={`px-4 py-3 shadow-md rounded-xl bg-white border ${data.enabled ? 'border-blue-500' : 'border-slate-200'} text-slate-800 text-xs w-[240px]`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-blue-500" />
      
      {/* Node Header */}
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${data.enabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">{data.name}</h4>
            <p className="text-[9px] text-slate-400 font-semibold">{data.leadCount} Prospects</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          {/* Enabled Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isEmail && !emailVerified && !data.enabled) {
                toast.error('Email outreach stage requires domain verification in Settings first.');
                return;
              }
              data.onToggle(data.stageKey, !data.enabled);
            }}
            className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
              data.enabled ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${data.enabled ? 'translate-x-3.5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Model display */}
      {data.stageKey !== 'discovery' && data.stageKey !== 'handoff' && (
        <div className="mb-2 bg-slate-50 rounded-lg p-1.5 flex flex-col space-y-0.5 border border-slate-100 text-[9px] font-semibold text-slate-500">
          <span className="text-slate-400 text-[8px] uppercase tracking-wider">OpenRouter LLM</span>
          <span className="truncate">{data.model.replace('anthropic/', '').replace('openai/', '')}</span>
        </div>
      )}

      {/* Connection warning for email */}
      {isEmail && !emailVerified && (
        <p className="text-[8px] text-rose-500 font-semibold mb-2">⚠️ Domain unverified</p>
      )}

      {/* Node Controls */}
      <div className="flex space-x-1.5 mt-2.5 pt-2 border-t border-slate-50">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            data.onEdit(data.stageKey);
          }}
          className="flex-1 text-[9px] h-7 bg-white"
        >
          <Sliders className="h-3 w-3 mr-0.5" /> Config
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            data.onRun(data.stageKey);
          }}
          isLoading={data.isRunning}
          disabled={data.isRunning || (isEmail && !emailVerified)}
          className="flex-1 text-[9px] h-7"
        >
          <Play className="h-2.5 w-2.5 mr-0.5" /> Run
        </Button>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-500" />
    </div>
  );
};

export default function WorkflowPage() {
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningStage, setRunningStage] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  // Console Log Streaming state
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: string; message: string; timestamp: string }>>([]);
  const [activeConsoleTask, setActiveConsoleTask] = useState<string | null>(null);
  const [consoleRunning, setConsoleRunning] = useState(false);
  const logEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  // Edit Drawer state
  const [editingStageKey, setEditingStageKey] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editConfig, setEditConfig] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchStages = async () => {
    try {
      const res = await fetch('/api/leadgen/workflow');
      if (!res.ok) throw new Error('Failed to load workflow pipeline stages');
      const data = await res.json();
      setStages(data);

      // Check email domain verification status
      const settingsRes = await fetch('/api/leadgen/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        const emailCreds = settingsData.find((c: any) => c.provider === 'email_smtp');
        if (emailCreds) {
          setEmailVerified(emailCreds.is_verified);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Error fetching workflow stages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  const handleToggleStage = async (stageKey: string, newEnabled: boolean) => {
    const stage = stages.find(s => s.stage_key === stageKey);
    if (!stage) return;

    try {
      const res = await fetch('/api/leadgen/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: stage.id,
          enabled: newEnabled,
          openrouter_model: stage.openrouter_model,
          system_prompt: stage.system_prompt,
          config: stage.config
        })
      });

      if (!res.ok) throw new Error('Failed to toggle stage state');
      toast.success(`${stageKey.toUpperCase()} stage ${newEnabled ? 'enabled' : 'disabled'}!`);
      fetchStages();
    } catch (err: any) {
      toast.error(err.message || 'Error toggling stage');
    }
  };

  const handleRunStage = async (stageKey: string) => {
    setRunningStage(stageKey);
    setActiveConsoleTask(stageKey);
    setConsoleLogs([
      {
        type: 'info',
        message: `Initializing stream connection for Agent "${stageKey.toUpperCase()}"...`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setConsoleOpen(true);
    setConsoleRunning(true);

    try {
      const response = await fetch(`/api/leadgen/${stageKey}/run?stream=true`, { method: 'POST' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Readable stream not supported by browser.');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsedLog = JSON.parse(line);
            setConsoleLogs(prev => [...prev, parsedLog]);
          } catch {
            setConsoleLogs(prev => [
              ...prev,
              {
                type: 'info',
                message: line,
                timestamp: new Date().toLocaleTimeString()
              }
            ]);
          }
        }
      }
    } catch (err: any) {
      setConsoleLogs(prev => [
        ...prev,
        {
          type: 'error',
          message: err.message || 'Stream processing failed.',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      toast.error(err.message || 'Stage execution failed');
    } finally {
      setConsoleRunning(false);
      setRunningStage(null);
      fetchStages();
    }
  };

  const handleOpenEdit = (stageKey: string) => {
    const stage = stages.find(s => s.stage_key === stageKey);
    if (!stage) return;
    setEditingStageKey(stageKey);
    setEditPrompt(stage.system_prompt || '');
    setEditModel(stage.openrouter_model || 'anthropic/claude-3.5-sonnet');
    setEditConfig(JSON.stringify(stage.config || {}, null, 2));
  };

  const handleSaveEdit = async () => {
    const stage = stages.find(s => s.stage_key === editingStageKey);
    if (!stage) return;

    let parsedConfig = {};
    try {
      parsedConfig = JSON.parse(editConfig);
    } catch {
      toast.error('Invalid Config format. Please specify a valid JSON object.');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch('/api/leadgen/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: stage.id,
          enabled: stage.enabled,
          openrouter_model: editModel,
          system_prompt: editPrompt,
          config: parsedConfig
        })
      });

      if (!res.ok) throw new Error('Failed to update stage parameters');
      toast.success(`${editingStageKey?.toUpperCase()} stage parameters updated!`);
      setEditingStageKey(null);
      fetchStages();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save modifications');
    } finally {
      setSavingEdit(false);
    }
  };

  // 2. Define Node types for React Flow
  const nodeTypes = useMemo(() => ({
    pipelineNode: PipelineNode
  }), []);

  // 3. Construct React Flow node values from Supabase state
  const nodes = useMemo(() => {
    if (stages.length === 0) return [];
    
    const stageKeys = ['discovery', 'email', 'whatsapp', 'handoff'];
    const names = {
      discovery: '1. Discovery & Triage',
      email: '2. Email Outreach',
      whatsapp: '3. WhatsApp Outreach',
      handoff: '4. Sales Handoff'
    };
    const icons = {
      discovery: Search,
      email: Mail,
      whatsapp: MessageSquare,
      handoff: Award
    };

    return stageKeys.map((key, index) => {
      const dbStage = stages.find(s => s.stage_key === key) || {
        enabled: false,
        openrouter_model: 'anthropic/claude-3.5-sonnet',
        system_prompt: '',
        config: {},
        lead_count: 0
      };

      return {
        id: key,
        type: 'pipelineNode',
        position: { x: index * 290 + 30, y: 150 },
        data: {
          stageKey: key,
          name: names[key as keyof typeof names],
          icon: icons[key as keyof typeof icons],
          enabled: dbStage.enabled,
          model: dbStage.openrouter_model,
          leadCount: dbStage.lead_count || 0,
          isRunning: runningStage === key,
          emailVerified: emailVerified,
          onToggle: handleToggleStage,
          onEdit: handleOpenEdit,
          onRun: handleRunStage
        }
      };
    });
  }, [stages, runningStage, emailVerified]);

  // 4. Connect 5 nodes in sequence
  const edges = useMemo(() => {
    const stageKeys = ['discovery', 'email', 'whatsapp', 'handoff'];
    const list = [];
    for (let i = 0; i < stageKeys.length - 1; i++) {
      const source = stageKeys[i];
      const target = stageKeys[i + 1];
      const sourceStage = stages.find(s => s.stage_key === source);
      const isFlowActive = sourceStage?.enabled;

      list.push({
        id: `e-${source}-${target}`,
        source,
        target,
        animated: isFlowActive,
        style: { stroke: isFlowActive ? '#3b82f6' : '#cbd5e1', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isFlowActive ? '#3b82f6' : '#cbd5e1'
        }
      });
    }
    return list;
  }, [stages]);

  return (
    <PageWrapper title="Acquisition Pipeline Workflow">
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
        {/* Info panel */}
        <Card className="mb-6 p-4 border-l-4 border-l-blue-500">
          <div className="flex items-start space-x-3.5">
            <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs leading-relaxed text-slate-500">
              <h3 className="font-bold text-slate-800 mb-0.5">Linear Stage Pipeline</h3>
              <p>
                Configure models, toggle automatic cron jobs, and run individual stages manually for testing. The stages feed into one another chronologically: Discovery & Triage gathers leads, checks social metrics, and drafts factual observations → Email sends outreach → WhatsApp follows up if no reply → Sales handoff logs qualified targets.
              </p>
            </div>
          </div>
        </Card>

        {/* React Flow Canvas */}
        <div className="h-[440px] border border-slate-100 rounded-2xl bg-slate-900/5 shadow-inner overflow-hidden relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
            nodesDraggable={false}
            nodesConnectable={false}
            zoomOnScroll={false}
            panOnDrag={true}
          >
            <Background color="#cbd5e1" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
      </div>

      {/* Edit side drawer */}
      {editingStageKey && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setEditingStageKey(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workflow Parameters</span>
                <h3 className="text-base font-black text-slate-950 mt-1">Configure Stage: {editingStageKey.toUpperCase()}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingStageKey(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 p-6 space-y-5 overflow-y-auto text-xs">
              {/* LLM Model Swapper */}
              {editingStageKey !== 'handoff' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 font-bold uppercase tracking-wider">OpenRouter LLM Model</label>
                  <select
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white font-semibold cursor-pointer"
                  >
                    <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Recommended)</option>
                    <option value="openai/gpt-4o">GPT-4o (Premium)</option>
                    <option value="openai/gpt-4o-mini">GPT-4o Mini (Cost-Efficient)</option>
                    <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B Instruct</option>
                  </select>
                </div>
              )}

              {/* System Prompt Customizer */}
              {editingStageKey !== 'handoff' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 font-bold uppercase tracking-wider">System Prompt Template</label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white font-medium"
                    rows={8}
                    placeholder="Enter system prompts guiding OpenRouter output generation..."
                  />
                </div>
              )}

              {/* Config JSON custom settings */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 font-bold uppercase tracking-wider">Advanced Config variables (JSON)</label>
                <textarea
                  value={editConfig}
                  onChange={(e) => setEditConfig(e.target.value)}
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white font-mono"
                  rows={6}
                  placeholder="{}"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                  {editingStageKey === 'discovery' && 'e.g. { "city": "Islamabad", "categories": ["restaurant", "clinic", "beauty_salon"] }'}
                  {editingStageKey === 'email' && 'e.g. { "daily_send_limit": 30 }'}
                  {editingStageKey === 'whatsapp' && 'e.g. { "followup_delay_days": 3 }'}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end space-x-3.5 bg-slate-50/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingStageKey(null)}
                className="bg-white"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                isLoading={savingEdit}
              >
                Save Configurations
              </Button>
            </div>
          </div>
        </>
      )}
      {/* Real-time Agent Console Log Modal */}
      {consoleOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90]" onClick={() => !consoleRunning && setConsoleOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-950 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden z-[100] flex flex-col h-[480px]">
            {/* Terminal Header */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 font-mono pl-2 tracking-wider">
                  agent_outreach_console ~ active_stage:{activeConsoleTask}
                </span>
              </div>
              <button 
                onClick={() => setConsoleOpen(false)} 
                disabled={consoleRunning}
                className="text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-5 overflow-y-auto font-mono text-[11px] space-y-2 bg-slate-950 text-slate-100 select-text">
              {consoleLogs.map((log, idx) => {
                let colorClass = 'text-slate-300';
                let prefix = '⚙';
                if (log.type === 'success') {
                  colorClass = 'text-emerald-400 font-semibold';
                  prefix = '✔';
                } else if (log.type === 'warn') {
                  colorClass = 'text-amber-400 font-semibold';
                  prefix = '⚠';
                } else if (log.type === 'error') {
                  colorClass = 'text-rose-400 font-semibold';
                  prefix = '✖';
                }

                return (
                  <div key={idx} className="flex items-start space-x-2 leading-relaxed">
                    <span className="text-slate-600 shrink-0 font-semibold pr-1">[{log.timestamp}]</span>
                    <span className={`${colorClass} shrink-0 pr-1`}>{prefix}</span>
                    <span className={colorClass}>{log.message}</span>
                  </div>
                );
              })}
              <div ref={logEndRef} />
            </div>

            {/* Terminal Footer */}
            <div className="bg-slate-900/50 px-5 py-3.5 border-t border-slate-800/80 flex justify-between items-center">
              <div className="flex items-center space-x-2.5">
                {consoleRunning ? (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider font-mono">EXECUTION IN PROGRESS...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider font-mono">FINISHED</span>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600 font-mono text-[10px]"
                onClick={() => setConsoleOpen(false)}
                disabled={consoleRunning}
              >
                Close Console
              </Button>
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
