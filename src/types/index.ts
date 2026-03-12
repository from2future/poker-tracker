export interface Room {
    id: string;
    name: string;
    createdAt: string;
}

export interface Player {
    id: string;
    roomId: string; // Reference to Room
    name: string;
    createdAt: string; // ISO string
}

export interface Session {
    id: string;
    roomId: string; // Reference to Room
    date: string; // ISO string
    location: string;
    notes?: string;
    createdAt: string; // ISO string
}

export interface SessionPlayerResult {
    sessionId: string;
    playerId: string;
    buyIn: number; // Total buy-in amount (initial + rebuys)
    cashOut: number; // Final amount when leaving
    // We might want to track if they are still playing? 
    // For now assume finished or live update.
}

// Derived type for convenient display
export interface PlayerSessionStats extends SessionPlayerResult {
    profit: number; // cashOut - buyIn
}

export interface PlayerLifetimeStats {
    playerId: string;
    totalSessions: number;
    totalProfit: number;
    totalBuyIn: number;
    totalCashOut: number;
    bestSession?: number;
    worstSession?: number;
    winRate: number; // Percentage of sessions won
}
