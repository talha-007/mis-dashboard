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

export const _reports: Report[] = [
  {
    id: 'rpt-001',
    name: 'Monthly Portfolio Report',
    type: 'portfolio',
    description: 'Comprehensive monthly portfolio performance and analysis',
    lastGenerated: '2024-01-25',
    generatedBy: 'Admin User',
    status: 'ready',
    fileSize: '2.4 MB',
    format: 'PDF',
  },
  {
    id: 'rpt-002',
    name: 'Recovery Aging Report',
    type: 'recovery',
    description: 'Detailed aging analysis of outstanding recoveries and overdues',
    lastGenerated: '2024-01-24',
    generatedBy: 'Admin User',
    status: 'ready',
    fileSize: '1.8 MB',
    format: 'Excel',
  },
  {
    id: 'rpt-003',
    name: 'Credit Appraisal Summary',
    type: 'credit',
    description: 'Summary of credit appraisals and risk assessments',
    lastGenerated: '2024-01-23',
    generatedBy: 'Risk Manager',
    status: 'ready',
    fileSize: '3.1 MB',
    format: 'PDF',
  },
  {
    id: 'rpt-004',
    name: 'SECP / SBP Compliance Pack',
    type: 'compliance',
    description: 'Regulatory compliance reports for SECP and State Bank of Pakistan',
    lastGenerated: '2024-01-22',
    generatedBy: 'Compliance Officer',
    status: 'ready',
    fileSize: '5.2 MB',
    format: 'PDF',
  },
  {
    id: 'rpt-005',
    name: 'Monthly Portfolio Report',
    type: 'portfolio',
    description: 'Comprehensive monthly portfolio performance and analysis',
    lastGenerated: '2023-12-25',
    generatedBy: 'Admin User',
    status: 'ready',
    fileSize: '2.3 MB',
    format: 'PDF',
  },
  {
    id: 'rpt-006',
    name: 'Recovery Aging Report',
    type: 'recovery',
    description: 'Detailed aging analysis of outstanding recoveries and overdues',
    lastGenerated: '2023-12-24',
    generatedBy: 'Admin User',
    status: 'ready',
    fileSize: '1.7 MB',
    format: 'Excel',
  },
  {
    id: 'rpt-007',
    name: 'Credit Appraisal Summary',
    type: 'credit',
    description: 'Summary of credit appraisals and risk assessments',
    lastGenerated: '2023-12-23',
    generatedBy: 'Risk Manager',
    status: 'ready',
    fileSize: '2.9 MB',
    format: 'PDF',
  },
  {
    id: 'rpt-008',
    name: 'SECP / SBP Compliance Pack',
    type: 'compliance',
    description: 'Regulatory compliance reports for SECP and State Bank of Pakistan',
    lastGenerated: '2023-12-22',
    generatedBy: 'Compliance Officer',
    status: 'ready',
    fileSize: '4.8 MB',
    format: 'PDF',
  },
];

export const reportCategories = [
  {
    id: 'portfolio',
    name: 'Portfolio Reports',
    description: 'Monthly portfolio performance and metrics',
    icon: '📊',
    count: _reports.filter((r) => r.type === 'portfolio').length,
  },
  {
    id: 'recovery',
    name: 'Recovery Reports',
    description: 'Aging analysis and recovery tracking',
    icon: '💰',
    count: _reports.filter((r) => r.type === 'recovery').length,
  },
  {
    id: 'credit',
    name: 'Credit Reports',
    description: 'Credit appraisal and risk assessment',
    icon: '⚖️',
    count: _reports.filter((r) => r.type === 'credit').length,
  },
  {
    id: 'compliance',
    name: 'Compliance Reports',
    description: 'Regulatory compliance for SECP/SBP',
    icon: '📋',
    count: _reports.filter((r) => r.type === 'compliance').length,
  },
];
