
export enum Role {
  DM = 'DM',
  PLAYER = 'PLAYER',
  SYSTEM = 'SYSTEM'
}

export interface Message {
  role: Role;
  content: string;
  image?: string;
  timestamp: number;
}

export interface Suspect {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
}

export interface Evidence {
  id: string;
  description: string;
  imageUrl?: string;
}

export interface GameState {
  messages: Message[];
  suspects: Suspect[];
  evidence: Evidence[];
  isThinking: boolean;
  gameStarted: boolean;
}
