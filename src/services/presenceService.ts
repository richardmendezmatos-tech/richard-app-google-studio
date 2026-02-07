import { User } from '@/types/types';

export type PresenceStatus = 'online' | 'busy' | 'offline' | 'away';

export interface AgentPresence {
    userId: string;
    userName: string;
    status: PresenceStatus;
    lastActive: number;
    currentPath?: string;
}

// Mock initial data
const MOCK_AGENTS: AgentPresence[] = [
    { userId: 'agent-1', userName: 'Ricardo (AI)', status: 'online', lastActive: Date.now() },
    { userId: 'agent-2', userName: 'Sofia (Sales)', status: 'busy', lastActive: Date.now() - 1000 * 60 },
    { userId: 'agent-3', userName: 'Carlos (Human)', status: 'offline', lastActive: Date.now() - 1000 * 60 * 60 },
];

class PresenceService {
    private presences: Map<string, AgentPresence> = new Map();
    private subscribers: ((presences: AgentPresence[]) => void)[] = [];
    private currentUser: AgentPresence | null = null;

    constructor() {
        // Initialize with mocks
        MOCK_AGENTS.forEach(agent => this.presences.set(agent.userId, agent));

        // Simulate activity periodically
        if (typeof window !== 'undefined') {
            setInterval(() => this.simulateActivity(), 30000);
        }
    }

    public setMyStatus(user: User, status: PresenceStatus, currentPath?: string) {
        if (!user.uid) return;

        const presence: AgentPresence = {
            userId: user.uid,
            userName: user.displayName || 'Agente',
            status,
            lastActive: Date.now(),
            currentPath
        };

        this.currentUser = presence;
        this.presences.set(user.uid, presence);
        this.notifySubscribers();
    }

    public getActiveAgents(): AgentPresence[] {
        return Array.from(this.presences.values())
            .filter(p => p.status !== 'offline')
            .sort((a, b) => b.lastActive - a.lastActive);
    }

    public subscribe(callback: (presences: AgentPresence[]) => void): () => void {
        this.subscribers.push(callback);
        // Initial emit
        callback(this.getActiveAgents());

        return () => {
            this.subscribers = this.subscribers.filter(s => s !== callback);
        };
    }

    private notifySubscribers() {
        const active = this.getActiveAgents();
        this.subscribers.forEach(cb => cb(active));
    }

    private simulateActivity() {
        // Randomly toggle AI agents for "aliveness"
        const ricardo = this.presences.get('agent-1');
        if (ricardo) {
            ricardo.status = Math.random() > 0.8 ? 'busy' : 'online';
            ricardo.lastActive = Date.now();
            this.presences.set('agent-1', ricardo);
            this.notifySubscribers();
        }
    }
}

export const presenceService = new PresenceService();
