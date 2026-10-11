'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
};

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Hi there! 👋 How can we help you today with your software project?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Mock AI Response - the system prompt will be integrated later
    setTimeout(() => {
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'bot', 
        text: "Thanks for reaching out! Our AI system is currently being configured to assist you perfectly. In the meantime, feel free to use the WhatsApp button below or the contact form to reach our team." 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: 'calc(100vw - 48px)',
          maxWidth: 360,
          height: 500,
          maxHeight: 'calc(100vh - 120px)',
          background: 'rgba(10, 20, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease forwards',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 212, 255, 0.1))', borderBottom: '1px solid rgba(0, 212, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }} />
              <span style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Cloudexify AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #00d4ff, #00ff88)' : 'rgba(255,255,255,0.05)',
                  color: msg.sender === 'user' ? '#0a1428' : 'rgba(255,255,255,0.9)',
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontWeight: msg.sender === 'user' ? 600 : 400,
                  border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8, background: 'rgba(0,0,0,0.2)' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 24,
                padding: '10px 16px',
                color: 'white',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button type="submit" style={{
              background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0a1428',
              fontSize: 20,
              fontWeight: 800,
            }}>
              ↑
            </button>
          </form>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* WhatsApp Button */}
        <a 
          href="https://wa.me/923411949277" 
          target="_blank" 
          rel="noopener noreferrer"
          title="Chat on WhatsApp"
          style={{
            width: 52, height: 52, borderRadius: '50%', background: '#25D366', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)', color: 'white', textDecoration: 'none',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor">
            <path d="M16.02 0h-.04C7.16 0 0 7.16 0 15.98c0 3.5.11 6.88 3.16 9.87L1.13 32l6.29-1.92c2.8 1.54 5.95 2.37 9.24 2.37h.04c8.82 0 15.98-7.16 15.98-15.98S24.84 0 16.02 0zm0 29.83c-2.8 0-5.55-.77-7.98-2.22l-.57-.33-4.66 1.43 1.45-4.54-.37-.58C2.5 21.32 1.6 18.7 1.6 15.98c0-7.93 6.46-14.38 14.38-14.38 3.84 0 7.46 1.5 10.17 4.22 2.72 2.7 4.22 6.32 4.22 10.16 0 7.93-6.45 14.38-14.35 14.38v-.03zm7.88-10.76c-.43-.22-2.56-1.26-2.96-1.4-.4-.15-.7-.22-1 .22s-1.12 1.4-1.37 1.7c-.26.3-.52.33-.95.12-2.18-1.12-3.8-2.13-5.38-4.83-.22-.38.04-.54.23-.74.18-.18.43-.48.64-.75.22-.26.3-.46.43-.75.14-.3.07-.55-.04-.76-.1-.22-.98-2.4-1.35-3.3-.35-.85-.72-.73-1-.75H9.7c-.3 0-.77.1-1.18.55-.4.43-1.57 1.54-1.57 3.75 0 2.22 1.6 4.36 1.83 4.66.23.3 3.18 4.86 7.7 6.8 3.2 1.36 4.23 1.48 5 1.25.96-.28 2.56-1.04 2.92-2.05.37-1.03.37-1.9.26-2.08-.12-.17-.43-.27-.86-.5z"/>
          </svg>
        </a>

        {/* Chatbot Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          title="Chat with AI"
          style={{
            width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #00ff88)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0, 212, 255, 0.4)', color: '#0a1428', border: 'none', cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isOpen ? (
            <span style={{ fontSize: 28, fontWeight: 'bold' }}>×</span>
          ) : (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              <circle cx="8" cy="9" r="1.5"/>
              <circle cx="12" cy="9" r="1.5"/>
              <circle cx="16" cy="9" r="1.5"/>
            </svg>
          )}
        </button>
      </div>
      
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); transform-origin: bottom right; }
          to { opacity: 1; transform: translateY(0) scale(1); transform-origin: bottom right; }
        }
      `}</style>
    </div>
  );
}
