
import React, { useState, useEffect, useRef } from 'react';
import { Role, Message, Suspect, Evidence, GameState } from './types';
import { getDMResponse } from './services/geminiService';
import SuspectCard from './components/SuspectCard';

const INITIAL_SUSPECTS: Suspect[] = [
  {
    id: '1',
    name: 'Arthur',
    role: 'The Butler',
    description: 'A man of few words, his hands slightly tremble when he pours the tea.',
    image: 'https://picsum.photos/seed/butler/400/400'
  },
  {
    id: '2',
    name: 'Evelyn',
    role: 'The Niece',
    description: 'Dripping in diamonds but drowning in gambling debts. She looks bored by the tragedy.',
    image: 'https://picsum.photos/seed/niece/400/400'
  },
  {
    id: '3',
    name: 'Dr. Aris',
    role: 'The Partner',
    description: 'Adjusting his spectacles constantly. He carries a leather briefcase he refuses to open.',
    image: 'https://picsum.photos/seed/doctor/400/400'
  }
];

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    messages: [],
    suspects: INITIAL_SUSPECTS,
    evidence: [],
    isThinking: false,
    gameStarted: false
  });
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

  const startGame = async () => {
    setState(prev => ({ ...prev, isThinking: true }));
    const introMsg: Message = {
      role: Role.SYSTEM,
      content: "Setting the scene at Vanguard Estate...",
      timestamp: Date.now()
    };
    
    // Initial prompt to DM to set the stage
    const initialPrompt: Message = {
      role: Role.PLAYER,
      content: "Introduce the crime scene at Vanguard Estate and the three suspects present.",
      timestamp: Date.now()
    };

    const dmResponse = await getDMResponse([initialPrompt]);
    
    const responseMsg: Message = {
      role: Role.DM,
      content: dmResponse,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [responseMsg],
      isThinking: false,
      gameStarted: true
    }));
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const userMsg: Message = {
      role: Role.PLAYER,
      content: inputText || (selectedImage ? "I found this clue at the scene. What do you make of it?" : ""),
      image: selectedImage || undefined,
      timestamp: Date.now()
    };

    const newMessages = [...state.messages, userMsg];
    setState(prev => ({ 
      ...prev, 
      messages: newMessages,
      isThinking: true 
    }));
    setInputText('');
    setSelectedImage(null);

    const dmResponse = await getDMResponse(newMessages, selectedImage || undefined);
    
    const responseMsg: Message = {
      role: Role.DM,
      content: dmResponse,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [...newMessages, responseMsg],
      isThinking: false
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInterrogate = (name: string) => {
    setInputText(`Interrogate ${name}: `);
  };

  if (!state.gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1590483734724-38817540c89e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center p-8 max-w-2xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-amber-100 tracking-tighter drop-shadow-lg">MIDNIGHT MANOR</h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 italic serif">"The rain hasn't stopped, and neither has the pulse of the killer among us."</p>
          <button 
            onClick={startGame}
            className="px-12 py-4 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-2xl border-2 border-amber-900/50"
          >
            Enter the Manor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-200">
      {/* Sidebar: Suspects & Evidence */}
      <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto max-h-screen">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-amber-500 serif">Suspects</h2>
          <div className="text-xs text-slate-500 uppercase tracking-widest">Case #1924-A</div>
        </div>
        
        <div className="grid gap-4">
          {state.suspects.map(suspect => (
            <SuspectCard key={suspect.id} suspect={suspect} onInterrogate={handleInterrogate} />
          ))}
        </div>

        <div className="mt-4 p-4 bg-amber-950/20 border border-amber-900/30 rounded-lg">
          <h3 className="text-amber-500 font-bold mb-2 uppercase text-xs tracking-widest">Case Objective</h3>
          <p className="text-sm text-slate-400 italic">
            Gather evidence, interrogate the household, and present an Accusation Report to the DM when you're ready to close the case.
          </p>
        </div>
      </div>

      {/* Main Investigation Area */}
      <div className="flex-1 flex flex-col h-screen relative">
        {/* Chat Feed */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 noir-gradient"
        >
          {state.messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === Role.PLAYER ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${msg.role === Role.PLAYER ? 'bg-amber-900/20 border border-amber-900/30 p-4 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' : ''}`}>
                <div className={`text-xs font-bold mb-2 uppercase tracking-widest ${msg.role === Role.PLAYER ? 'text-amber-500 text-right' : 'text-slate-500'}`}>
                  {msg.role === Role.PLAYER ? 'The Detective' : 'Dungeon Master'}
                </div>
                <div className="prose prose-invert prose-amber max-w-none">
                  {msg.content.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-2 leading-relaxed text-slate-300">
                      {line}
                    </p>
                  ))}
                </div>
                {msg.image && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-amber-500/30 shadow-xl max-w-sm">
                    <img src={msg.image} alt="Clue" className="w-full h-auto grayscale sepia-[.2]" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {state.isThinking && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 text-slate-500 italic">
                <span className="clue-pulse">Writing the next chapter...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-slate-900/80 backdrop-blur-md border-t border-slate-800">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex flex-col gap-3">
            {selectedImage && (
              <div className="relative inline-block w-24 h-24 mb-2">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-lg border-2 border-amber-500" />
                <button 
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-lg"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-amber-500 rounded-lg border border-slate-700 transition-all flex-shrink-0"
                title="Search for Clue (Image)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Question a suspect or theorize..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button 
                type="submit"
                disabled={state.isThinking || (!inputText.trim() && !selectedImage)}
                className="px-6 py-3 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center gap-2"
              >
                <span>Send</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
