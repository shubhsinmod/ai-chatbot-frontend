import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('chatHistory', JSON.stringify(history));
  }, [history]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('chatHistory');
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text };
    const currentHistory = [...history, userMessage];
    setHistory(currentHistory);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage.content,
          history: history.map(h => ({ role: h.role, content: h.content }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error connecting to the chatbot");
      }

      const data = await response.json();
      setHistory([...currentHistory, { 
        role: "assistant", 
        content: data.answer,
        sources: data.sources 
      }]);
    } catch (err) {
      setHistory([...currentHistory, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    handleSend(question);
  };

  const quickReplies = [
    "ERP Implementation",
    "POS Solutions",
    "Mobile App Development",
    "Custom Technology Solutions",
    "Food & Bakery Consultancy",
    "Talk to an Expert"
  ];

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '40px auto', fontFamily: 'system-ui, -apple-system, sans-serif', textAlign: 'left' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '80vh'
      }}>
        <div style={{ backgroundColor: '#1f6f4a', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Sigmoss Assistant</h1>
          <button onClick={clearHistory} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Clear Chat</button>
        </div>
        
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f9fafb' }}>
          {history.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                maxWidth: '85%',
                lineHeight: '1.5'
              }}>
                <p style={{ marginTop: 0 }}>👋 Welcome to Sigmoss Systems Pvt. Ltd.!</p>
                <p>We help food and bakery businesses with technology and consulting solutions.</p>
                <p style={{ marginBottom: 0 }}>How can we help you today?</p>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {quickReplies.map((reply, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSend(reply)}
                    disabled={loading}
                    style={{
                      background: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      padding: '8px 12px',
                      borderRadius: '16px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if(!loading) { e.target.style.background = '#bae6fd'; e.target.style.borderColor = '#7dd3fc'; }
                    }}
                    onMouseOut={(e) => {
                      if(!loading) { e.target.style.background = '#e0f2fe'; e.target.style.borderColor = '#bae6fd'; }
                    }}
                  >
                    🔹 {reply}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {history.map((msg, idx) => (
            <div key={idx} style={{ 
              marginBottom: '20px', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: msg.role === 'user' ? '#1f6f4a' : '#ffffff',
                color: msg.role === 'user' ? '#ffffff' : '#1f2937',
                border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb',
                boxShadow: msg.role === 'user' ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
                maxWidth: '85%',
                lineHeight: '1.5'
              }}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                color: '#6b7280',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={sendMessage} style={{ 
          padding: '20px', 
          backgroundColor: '#ffffff', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px'
        }}>
          <input 
            type="text" 
            value={question} 
            onChange={e => setQuestion(e.target.value)} 
            placeholder="Ask about Sigmoss..."
            style={{ 
              flexGrow: 1, 
              padding: '14px', 
              borderRadius: '8px', 
              border: '1px solid #d1d5db',
              fontSize: '1rem',
              outline: 'none'
            }}
            disabled={loading}
          />
          <button 
            type="submit" 
            style={{ 
              padding: '0 24px', 
              borderRadius: '8px', 
              border: 'none', 
              backgroundColor: loading ? '#9ca3af' : '#1f6f4a', 
              color: '#ffffff', 
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }} 
            disabled={loading}
          >
            Send
          </button>
        </form>
      </div>
      <style>{`
        body { background-color: #e5e7eb; margin: 0; }
        .markdown-body p:first-child { margin-top: 0; }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body a { color: #1f6f4a; text-decoration: underline; }
        .markdown-body ul, .markdown-body ol { margin: 8px 0; padding-left: 20px; }
      `}</style>
    </div>
  );
}

export default App;
