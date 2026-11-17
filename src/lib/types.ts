import type { DayHours, MenuItem } from '../../restaurant.config';

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed';
export type PaymentType = 'paypal' | 'cash';
export type NotifyChoice = 'app' | 'text' | 'both';

export type CartLine = {
  key: string;
  itemId: string;
  qty: number;
  /** groupId -> chosen choice ids */
  selections: Record<string, string[]>;
  /** add-on item ids (sauces, extras) attached to this line */
  extraIds: string[];
  note: string;
};

export type OrderLine = {
  itemId: string;
  name: string;
  category: string;
  qty: number;
  unitPrice: number;
  options: string[];
  extras: { id: string; name: string; price: number }[];
  note: string;
};

export type Order = {
  id: string;
  number: number;
  userId?: string;
  name: string;
  phone: string;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: PaymentType;
  paid: boolean;
  notify: NotifyChoice;
  status: OrderStatus;
  createdAt: number;
  readyAt?: number;
  rewardUsed?: boolean;
  /** Customer has seen the "ready" alert */
  alertSeen?: boolean;
  demo?: boolean;
  /** Placed from this phone (so this phone shows its status + alerts) */
  mine?: boolean;
};

export type User = { id: string; name: string; phone: string; email: string };

export type Settings = {
  name: string;
  tagline: string;
  monogram: string;
  logoUrl: string;
  address: string;
  phone: string;
  taxRatePercent: number;
  staffPin: string;
  hours: DayHours[];
  accent: string;
  wine: string;
  paused: boolean;
  rewardsEnabled: boolean;
  ordersPerReward: number;
  rewardName: string;
  pointsPerDollar: number;
};

export type AppState = {
  hydrated: boolean;
  settings: Settings;
  menu: MenuItem[];
  cart: CartLine[];
  orders: Order[];
  user: User | null;
  favorites: string[];
  orderCounter: number;
  rewardsRedeemed: number;
  staffAuthed: boolean;
};
