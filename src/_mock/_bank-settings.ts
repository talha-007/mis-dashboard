export interface BankAccessSettings {
  bankId: string;
  bankName: string;
  bankCode: string;
  dashboardAccess: boolean;
  ipWhitelist: string[];
  accessHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  featurePermissions: {
    borrowerManagement: boolean;
    loanApplications: boolean;
    paymentsLedger: boolean;
    creditRatings: boolean;
    reports: boolean;
    recoveryManagement: boolean;
  };
  securitySettings: {
    twoFactorAuth: boolean;
    sessionTimeout: number; // in minutes
    passwordPolicy: boolean;
  };
  dataVisibility: {
    viewOwnDataOnly: boolean;
    allowDataExport: boolean;
  };
}

export const _bankSettings: BankAccessSettings[] = [
  {
    bankId: '1',
    bankName: 'National Microfinance Bank',
    bankCode: 'NMB001',
    dashboardAccess: true,
    ipWhitelist: ['192.168.1.100', '192.168.1.101'],
    accessHours: {
      enabled: false,
      startTime: '09:00',
      endTime: '18:00',
    },
    featurePermissions: {
      borrowerManagement: true,
      loanApplications: true,
      paymentsLedger: true,
      creditRatings: true,
      reports: true,
      recoveryManagement: true,
    },
    securitySettings: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: true,
    },
    dataVisibility: {
      viewOwnDataOnly: true,
      allowDataExport: true,
    },
  },
  {
    bankId: '2',
    bankName: 'Prime Microfinance',
    bankCode: 'PMF002',
    dashboardAccess: true,
    ipWhitelist: [],
    accessHours: {
      enabled: true,
      startTime: '08:00',
      endTime: '20:00',
    },
    featurePermissions: {
      borrowerManagement: true,
      loanApplications: true,
      paymentsLedger: false,
      creditRatings: true,
      reports: false,
      recoveryManagement: true,
    },
    securitySettings: {
      twoFactorAuth: true,
      sessionTimeout: 60,
      passwordPolicy: true,
    },
    dataVisibility: {
      viewOwnDataOnly: true,
      allowDataExport: false,
    },
  },
  {
    bankId: '3',
    bankName: 'Al-Falah Microfinance',
    bankCode: 'AFM003',
    dashboardAccess: false,
    ipWhitelist: [],
    accessHours: {
      enabled: false,
      startTime: '09:00',
      endTime: '18:00',
    },
    featurePermissions: {
      borrowerManagement: false,
      loanApplications: false,
      paymentsLedger: false,
      creditRatings: false,
      reports: false,
      recoveryManagement: false,
    },
    securitySettings: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: true,
    },
    dataVisibility: {
      viewOwnDataOnly: true,
      allowDataExport: false,
    },
  },
];

export interface SystemSettings {
  masterAccessControl: {
    enableAllBanks: boolean;
    maintenanceMode: boolean;
  };
  globalSecurity: {
    requireTwoFactorAuth: boolean;
    defaultSessionTimeout: number;
    enforcePasswordPolicy: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    systemMaintenanceAlerts: boolean;
  };
}

export const _systemSettings: SystemSettings = {
  masterAccessControl: {
    enableAllBanks: true,
    maintenanceMode: false,
  },
  globalSecurity: {
    requireTwoFactorAuth: false,
    defaultSessionTimeout: 30,
    enforcePasswordPolicy: true,
  },
  notifications: {
    emailAlerts: true,
    smsAlerts: false,
    systemMaintenanceAlerts: true,
  },
};
