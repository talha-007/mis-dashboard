/**
 * Placeholder data - replace with API data when integrating.
 */

export const _myAccount = {
  displayName: '',
  email: '',
  photoURL: '',
};

export const _users: {
  id: string;
  name: string;
  company: string;
  isVerified: boolean;
  avatarUrl: string;
  status: string;
  role: string;
}[] = [];

export const _posts: {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  totalViews: number;
  totalComments: number;
  totalShares: number;
  totalFavorites: number;
  postedAt: string;
  author: { name: string; avatarUrl: string };
}[] = [];

export const _products: {
  id: string;
  price: number;
  name: string;
  priceSale: number | null;
  coverUrl: string;
  colors: string[];
  status: string;
}[] = [];

export const _langs = [
  { value: 'en', label: 'English', icon: '/assets/icons/flags/ic-flag-en.svg' },
  { value: 'de', label: 'German', icon: '/assets/icons/flags/ic-flag-de.svg' },
  { value: 'fr', label: 'French', icon: '/assets/icons/flags/ic-flag-fr.svg' },
];

export const _timeline: { id: string; title: string; type: string; time: string }[] = [];

export const _traffic: { value: string; label: string; total: number }[] = [];

export const _tasks: { id: string; name: string }[] = [];

export const _notifications: {
  id: string;
  title: string;
  description: string;
  avatarUrl: string | null;
  type: string;
  postedAt: string;
  isUnRead: boolean;
}[] = [];
