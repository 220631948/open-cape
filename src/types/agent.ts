export type AgentState = {
  userId: string;
  currentPhase: 1 | 2 | 3 | 4 | 5;
  status: "running" | "waiting_validation" | "failed" | "complete";
  bbox: [number, number, number, number];
  lastUpdated: number;
};
