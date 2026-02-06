
import React from 'react';
import { Suspect } from '../types';

interface SuspectCardProps {
  suspect: Suspect;
  onInterrogate: (name: string) => void;
}

const SuspectCard: React.FC<SuspectCardProps> = ({ suspect, onInterrogate }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden hover:border-amber-500/50 transition-all group">
      <div className="h-48 overflow-hidden">
        <img 
          src={suspect.image} 
          alt={suspect.name} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-amber-100 mb-1">{suspect.name}</h3>
        <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">{suspect.role}</p>
        <p className="text-sm text-slate-400 mb-4 line-clamp-2 italic">"{suspect.description}"</p>
        <button 
          onClick={() => onInterrogate(suspect.name)}
          className="w-full py-2 bg-slate-800 hover:bg-amber-900/40 text-amber-100 text-sm font-semibold rounded transition-colors border border-slate-700"
        >
          Interrogate
        </button>
      </div>
    </div>
  );
};

export default SuspectCard;
