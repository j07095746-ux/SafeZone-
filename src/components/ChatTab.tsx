import React, { useState } from 'react';
import { Bot, Send, Sparkles, MessageSquare, Trash2, BookOpen } from 'lucide-react';
import { playSound } from '../utils/audio';

interface ChatTabProps {
  soundEnabled: boolean;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const ChatTab: React.FC<ChatTabProps> = ({ soundEnabled }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your Safezone Study & Math Assistant. Ask me anything about algebra, calculus formulas, writing prompts, or school assignments.',
      time: 'Just now'
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputVal.trim();
    if (!clean) return;

    playSound('click', soundEnabled);
    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: clean,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Offline heuristic study assistant response generator
    setTimeout(() => {
      let reply = "Here's a breakdown for that concept: Remember to balance equations by working symmetrically on both sides and checking domain constraints.";
      const lower = clean.toLowerCase();
      if (lower.includes('quadratic') || lower.includes('formula')) {
        reply = 'The quadratic formula is: x = (-b ± √(b² - 4ac)) / (2a). For ax² + bx + c = 0, the discriminant (b² - 4ac) tells you if roots are real or complex!';
      } else if (lower.includes('integral') || lower.includes('derivative')) {
        reply = 'In calculus: The power rule states d/dx [x^n] = n*x^(n-1). For integrals: ∫ x^n dx = (x^(n+1))/(n+1) + C (for n ≠ -1).';
      } else if (lower.includes('pythagorean') || lower.includes('triangle')) {
        reply = 'Pythagorean Theorem: a² + b² = c² in a right triangle, where c is the hypotenuse opposite the right angle.';
      } else if (lower.includes('fnf') || lower.includes('game') || lower.includes('friday night funkin')) {
        reply = 'In Friday Night Funkin, rhythm timing is key! Use D-F-J-K or the arrow keys right as notes hit the top receptors to maintain your combo streak!';
      } else if (lower.includes('help') || lower.includes('hi') || lower.includes('hello')) {
        reply = 'Ready to assist! You can ask for math formulas, essay thesis starters, scientific definitions, or quick unit conversions.';
      }

      const botMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      playSound('score', soundEnabled);
    }, 400);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto h-[78vh] flex flex-col">
      <header className="flex items-center justify-between border-b border-blue-500/15 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Safezone AI Study Assistant
            </h2>
            <p className="text-[11px] text-slate-400">Offline intelligent curriculum solver</p>
          </div>
        </div>

        <button
          onClick={() => {
            playSound('pop', soundEnabled);
            setMessages([
              {
                id: '1',
                sender: 'ai',
                text: 'Chat history cleared. How can I help with your homework or study topics today?',
                time: 'Just now'
              }
            ]);
          }}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          title="Clear messages"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </header>

      {/* Message scroll container */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#0a1222]/80 border border-blue-500/20 rounded-2xl">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-950/40'
                  : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none'
              }`}
            >
              <p>{m.text}</p>
              <span className="block text-[9px] text-right mt-1 opacity-60">{m.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input row */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="Ask a question or request a math formula..."
          className="flex-1 px-4 py-3 bg-[#0a1222] border border-blue-500/25 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400 shadow-inner"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-blue-950/40"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
