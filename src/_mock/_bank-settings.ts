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

export const _bankSettings: BankAccessSettings[] = [];

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
  masterAccessControl: { enableAllBanks: false, maintenanceMode: false },
  globalSecurity: {
    requireTwoFactorAuth: false,
    defaultSessionTimeout: 30,
    enforcePasswordPolicy: true,
  },
  notifications: { emailAlerts: false, smsAlerts: false, systemMaintenanceAlerts: false },
};
