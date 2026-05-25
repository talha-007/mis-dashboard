import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appTagline: string;
  appVersion: string;
};

export const CONFIG: ConfigValue = {
  appName: 'MIS',
  appTagline: 'Microfinance Intelligent System',
  appVersion: packageJson.version,
};
