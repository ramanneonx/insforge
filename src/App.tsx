import React, { useEffect, useState, useRef } from 'react';
import { insforge } from './lib/insforge';
import { LogOut, Send, Bot, User, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<{id: string, role: 'user' | 'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      if (data?.user) {
        setCurrentUser(data.user);
      } else {
        // Purge dead tokens to stop endless 401 polling
        insforge.auth.signOut().catch(() => {});
        setCurrentUser(null);
      }
    }).catch((e) => {
      console.error(e);
      insforge.auth.signOut().catch(() => {});
    });
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadMessages();
    } else {
      // If logged out, clear DB messages (start fresh guest session)
      setMessages([]);
    }
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    const { data } = await insforge.database
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data as {id: string, role: 'user'|'assistant', content: string}[]);
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await insforge.auth.signInWithOAuth({
        provider: 'google',
        redirectTo: window.location.origin,
      });
      if (error) {
        alert(error.message);
      } else if (data?.url) {
        window.location.href = data.url; // Force redirect if SDK does not auto-route
      }
    } catch (e: any) {
      alert("Auth redirect failed: " + e.message);
    }
  };

  const handleLogout = async () => {
    await insforge.auth.signOut();
    setCurrentUser(null);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setIsLoading(true);

    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: userMsg }]);

    try {
      // Only save to DB if authenticated (Full Feature)
      if (currentUser) {
        await insforge.database.from('messages').insert([{ role: 'user', content: userMsg }]);
      }

      const aiRequestMessages = [
        { role: 'system', content: 'You are N.E.O.N., a highly intelligent, slightly cynical cyberpunk AI assistant. Keep responses concise and witty.' },
        ...messages.map(m => ({ role: m.role as 'user'|'assistant', content: m.content })),
        { role: 'user', content: userMsg }
      ];

      const stream = await insforge.ai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: aiRequestMessages as any,
        stream: true
      });

      const aiTempId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiTempId, role: 'assistant', content: '' }]);

      let fullResponse = '';
      for await (const chunk of stream) {
        if (chunk.choices?.[0]?.delta?.content) {
          fullResponse += chunk.choices[0].delta.content;
          setMessages(prev => 
            prev.map(msg => msg.id === aiTempId ? { ...msg, content: fullResponse } : msg)
          );
        }
      }

      // Only save AI response to DB if authenticated (Full Feature)
      if (currentUser) {
        await insforge.database.from('messages').insert([{ role: 'assistant', content: fullResponse }]);
      }
      
    } catch (err: any) {
      console.error(err);
      alert('Error communicating with N.E.O.N. Network failure or token rejection.');
    } finally {
      setIsLoading(false);
      if (currentUser) {
        loadMessages(); // Refresh from DB to get real IDs if authenticated
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-4xl mx-auto h-[100dvh]">
      <div className="glass-panel w-full flex-1 flex flex-col overflow-hidden my-4 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.3)]">
              <Sparkles className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <h2 className="font-bold text-lg neon-text-cyan tracking-wider">N.E.O.N.</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_5px_#0ff]"></span>
                <span className="text-xs text-neon-cyan uppercase tracking-widest">
                  {currentUser ? 'Full Access Online' : 'Guest Mode Active'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            {currentUser ? (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white cursor-pointer"
                title="Disconnect"
              >
                <span className="text-sm hidden sm:block">Disconnect</span>
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white transition-colors cursor-pointer shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                title="Sign in with Google for Full Access"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-semibold tracking-wide">Sync Brain</span>
              </button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
              <span className="text-sm uppercase tracking-widest text-center">
                Waiting for prompt sequence...<br/>
                {!currentUser && <span className="text-neon-pink/70 text-xs mt-2 block">Guest mode active: Memory will not persist.</span>}
              </span>
            </div>
          )}
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/50 shadow-[0_0_10px_rgba(255,0,255,0.3)]' 
                  : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 shadow-[0_0_10px_rgba(0,255,255,0.3)]'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-pink-900/20 border border-neon-pink/30 text-white rounded-tr-none' 
                  : 'bg-black/40 border border-white/10 text-white/90 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan/50 flex flex-shrink-0 items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                <Bot className="w-4 h-4 text-neon-cyan" />
              </div>
              <div className="bg-black/40 border border-white/10 shadow-lg rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-xl relative z-10">
          <form onSubmit={sendMessage} className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Transmit prompt to N.E.O.N..."
              className="w-full bg-black/50 border border-white/20 rounded-full pl-6 pr-14 py-4 text-white placeholder:text-white/30 focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-neon-cyan text-black rounded-full hover:shadow-[0_0_15px_#0ff] disabled:opacity-50 disabled:hover:shadow-none transition-all cursor-pointer"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
