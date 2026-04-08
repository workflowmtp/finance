import { create } from 'zustand';

interface AppState {
  // Navigation
  currentModule: string;
  currentScreen: string;
  sidebarCollapsed: boolean;
  
  // Theme
  theme: 'dark' | 'light';
  
  // Chat IA
  chatMessages: { role: 'user' | 'assistant'; content: string; time: string }[];
  chatMode: 'daf' | 'dg' | 'pedagogique' | 'audit' | 'action';

  // Actions
  navigate: (module: string, screen: string) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  addChatMessage: (role: 'user' | 'assistant', content: string) => void;
  clearChat: () => void;
  setChatMode: (mode: AppState['chatMode']) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentModule: 'dashboard',
  currentScreen: 'dashboard_general',
  sidebarCollapsed: false,

  // Theme
  theme: (typeof window !== 'undefined' && localStorage.getItem('fa_theme') as 'dark' | 'light') || 'dark',

  // Chat
  chatMessages: [
    {
      role: 'assistant',
      content: '**Bonjour ! Je suis FinanceAdvisor** 🤖, votre assistant financier intelligent pour MULTIPRINT S.A.\n\nJ\'ai accès en temps réel à l\'ensemble de vos données financières.\n\n**Situation flash — Mars 2025 :**\n• CA mars : 1,2 Md FCFA (+8,2%)\n• Trésorerie : 520M — ⚠️ Tension S15\n• Anomalies critiques : 6\n• Clôture : 6% — DSF : 68%\n\nPosez votre question ou utilisez les suggestions ci-dessous.',
      time: new Date().toLocaleString('fr-FR'),
    },
  ],
  chatMode: 'daf',

  // Actions
  navigate: (module, screen) =>
    set({ currentModule: module, currentScreen: screen }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('fa_theme', next);
        document.documentElement.setAttribute('data-theme', next);
      }
      return { theme: next };
    }),

  addChatMessage: (role, content) =>
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        { role, content, time: new Date().toLocaleString('fr-FR') },
      ],
    })),

  clearChat: () =>
    set({
      chatMessages: [
        {
          role: 'assistant',
          content: 'Conversation effacée. Comment puis-je vous aider ?',
          time: new Date().toLocaleString('fr-FR'),
        },
      ],
    }),

  setChatMode: (mode) => set({ chatMode: mode }),
}));
