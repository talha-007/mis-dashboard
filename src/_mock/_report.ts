export type Report = {
  id: string;
  name: string;
  type: 'portfolio' | 'recovery' | 'credit' | 'compliance';
  description: string;
  lastGenerated: string;
  generatedBy: string;
  status: 'ready' | 'generating' | 'failed';
  fileSize?: string;
  format: 'PDF' | 'Excel' | 'CSV';
};

export const _reports: Report[] = [];

export const reportCategories = [
  { id: 'portfolio', name: 'Portfolio Reports', description: 'Monthly portfolio performance and metrics', icon: '📊', count: 0 },
  { id: 'recovery', name: 'Recovery Reports', description: 'Aging analysis and recovery tracking', icon: '💰', count: 0 },
  { id: 'credit', name: 'Credit Reports', description: 'Credit appraisal and risk assessment', icon: '⚖️', count: 0 },
  { id: 'compliance', name: 'Compliance Reports', description: 'Regulatory compliance for SECP/SBP', icon: '📋', count: 0 },
];
