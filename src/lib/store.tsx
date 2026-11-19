import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  menu as defaultMenu,
  optionGroups,
  palette,
  restaurant,
  rewards as rewardsConfig,
  type MenuItem,
} from '../../restaurant.config';
import { cartTotals, findItem, rewardDiscount, toOrderLine, uid } from './pricing';
import type {
  AppState,
  BagLine,
  CartLine,
  NotifyChoice,
  Order,
  OrderLine,
  OrderStatus,
  PaymentType,
  Settings,
  User,
} from './types';

const STORAGE_KEY = 'restaurant-app-state-v1';

export const defaultSettings = (): Settings => ({
  name: restaurant.name,
  tagline: restaurant.tagline,
  monogram: restaurant.monogram,
  logoUrl: restaurant.logoUrl,
  address: restaurant.address,
  phone: restaurant.phone,
  taxRatePercent: restaurant.taxRatePercent,
  staffPin: restaurant.staffPin,
  salesPin: restaurant.salesPin,
  hours: restaurant.hours.map((h) => ({ ...h })),
  accent: palette.accent,
  wine: palette.wine,
  paused: false,
  rewardsEnabled: rewardsConfig.enabled,
  ordersPerReward: rewardsConfig.ordersPerReward,
  rewardName: rewardsConfig.rewardName,
  pointsPerDollar: rewardsConfig.pointsPerDollar,
});

/** Realistic past orders so Sales Summary looks finished on first launch. */
function seedHistory(menu: MenuItem[], taxPercent: number): Order[] {
  const names = ['Avery', 'Jordan', 'Sam', 'Riley', 'Morgan', 'Casey', 'Taylor', 'Jamie', 'Quinn', 'Drew'];
  const mains = menu.filter((m) => !m.isAddOn && (m.category === 'Entrees' || m.category === 'Sandwiches'));
  const sides = menu.filter((m) => !m.isAddOn && m.category === 'Sides');
  const drinks = menu.filter((m) => m.category === 'Drinks');
  const desserts = menu.filter((m) => m.category === 'Desserts');
  const addons = menu.filter((m) => m.isAddOn);
  // Deterministic pseudo-random so the sample data is stable
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
  const out: Order[] = [];
  const now = Date.now();
  let num = 1;
  for (let day = 6; day >= 0; day--) {
    const count = day === 0 ? 5 : 7 + Math.floor(rnd() * 8);
    for (let i = 0; i < count; i++) {
      const lines: OrderLine[] = [];
      const mk = (it: MenuItem, extras: MenuItem[] = []): OrderLine => ({
        itemId: it.id,
        name: it.name,
        category: it.category,
        qty: 1 + (rnd() > 0.85 ? 1 : 0),
        unitPrice: Math.round((it.price + extras.reduce((s, e) => s + e.price, 0)) * 100) / 100,
        options: [],
        extras: extras.map((e) => ({ id: e.id, name: e.name, price: e.price })),
        note: '',
      });
      lines.push(mk(pick(mains), rnd() > 0.6 ? [pick(addons)] : []));
      if (rnd() > 0.35) lines.push(mk(pick(sides)));
      if (rnd() > 0.4) lines.push(mk(pick(drinks)));
      if (rnd() > 0.78) lines.push(mk(pick(desserts)));
      const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
      const tax = Math.round(subtotal * taxPercent) / 100;
      const hour = 11 + Math.floor(rnd() * 10);
      const created = new Date(now - day * 86400000);
      created.setHours(hour, Math.floor(rnd() * 60), 0, 0);
      out.push({
        id: `demo-${day}-${i}`,
        number: num++,
        name: pick(names),
        phone: '(603) 555-01' + String(10 + Math.floor(rnd() * 80)),
        lines,
        subtotal: Math.round(subtotal * 100) / 100,
        discount: 0,
        tax: Math.round(tax * 100) / 100,
        total: Math.round((subtotal + tax) * 100) / 100,
        payment: rnd() > 0.45 ? 'paypal' : 'cash',
        paid: true,
        notify: 'app',
        status: 'completed',
        createdAt: created.getTime(),
        readyAt: created.getTime() + 15 * 60000,
        alertSeen: true,
        demo: true,
      });
    }
  }
  return out;
}

const freshState = (): AppState => {
  const settings = defaultSettings();
  return {
    hydrated: false,
    settings,
    menu: defaultMenu.map((m) => ({ ...m, pairings: [...m.pairings], optionGroupIds: [...m.optionGroupIds] })),
    cart: [],
    bag: [],
    orders: seedHistory(defaultMenu, settings.taxRatePercent),
    user: null,
    favorites: [],
    orderCounter: 100,
    rewardsRedeemed: 0,
    staffAuthed: false,
  };
};

type PlaceOrderInput = {
  name: string;
  phone: string;
  payment: PaymentType;
  notify: NotifyChoice;
  useReward: boolean;
};

type Store = {
  state: AppState;
  // cart
  addToCart: (line: Omit<CartLine, 'key'>) => void;
  updateQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  updateLine: (key: string, patch: Partial<CartLine>) => void;
  clearCart: () => void;
  // store bag
  addToBag: (line: Omit<BagLine, 'key'>) => void;
  updateBagQty: (key: string, qty: number) => void;
  clearBag: () => void;
  // orders
  placeOrder: (input: PlaceOrderInput) => Order;
  setStatus: (orderId: string, status: OrderStatus) => void;
  markPaid: (orderId: string) => void;
  markAlertSeen: (orderId: string) => void;
  addTestOrder: () => void;
  reorder: (order: Order) => number;
  // account
  signIn: (u: Omit<User, 'id'>) => void;
  signOut: () => void;
  toggleFavorite: (itemId: string) => void;
  // staff
  staffLogin: (pin: string) => boolean;
  staffLogout: () => void;
  upsertItem: (item: MenuItem) => void;
  deleteItem: (id: string) => void;
  setSoldOut: (id: string, soldOut: boolean) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
  // derived
  rewardsInfo: () => { orders: number; points: number; earned: number; available: number; toNext: number; progress: number };
  discountFor: (useReward: boolean) => number;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(freshState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved data once
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<AppState>;
          setState((s) => ({
            ...s,
            ...saved,
            settings: { ...s.settings, ...(saved.settings ?? {}) },
            staffAuthed: false,
            hydrated: true,
          }));
          return;
        }
      } catch {
        // ignore — start fresh
      }
      setState((s) => ({ ...s, hydrated: true }));
    })();
  }, []);

  // Save (debounced) whenever things change
  useEffect(() => {
    if (!state.hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const { hydrated: _h, staffAuthed: _s, ...rest } = state;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rest)).catch(() => {});
    }, 250);
  }, [state]);

  const rewardsInfo = useCallback(() => {
    const { orders, user, settings, rewardsRedeemed } = state;
    const mine = orders.filter((o) => user && o.userId === user.id);
    const count = mine.length;
    const points = Math.round(mine.reduce((s, o) => s + o.total, 0) * settings.pointsPerDollar);
    const per = Math.max(1, settings.ordersPerReward);
    const earned = Math.floor(count / per);
    const available = Math.max(0, earned - rewardsRedeemed);
    return { orders: count, points, earned, available, toNext: per - (count % per), progress: (count % per) / per };
  }, [state]);

  const discountFor = useCallback(
    (useReward: boolean) =>
      useReward ? rewardDiscount(state.menu, state.cart, rewardsConfig.rewardCategory) : 0,
    [state.menu, state.cart],
  );

  const store = useMemo<Store>(
    () => ({
      state,
      addToCart: (line) =>
        setState((s) => ({ ...s, cart: [...s.cart, { ...line, key: uid() }] })),
      updateQty: (key, qty) =>
        setState((s) => ({
          ...s,
          cart: qty <= 0 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty } : l)),
        })),
      removeLine: (key) => setState((s) => ({ ...s, cart: s.cart.filter((l) => l.key !== key) })),
      updateLine: (key, patch) =>
        setState((s) => ({ ...s, cart: s.cart.map((l) => (l.key === key ? { ...l, ...patch } : l)) })),
      clearCart: () => setState((s) => ({ ...s, cart: [] })),
      addToBag: (line) => setState((s) => ({ ...s, bag: [...(s.bag ?? []), { ...line, key: uid() }] })),
      updateBagQty: (key, qty) =>
        setState((s) => ({
          ...s,
          bag: (s.bag ?? []).flatMap((l) => (l.key !== key ? [l] : qty <= 0 ? [] : [{ ...l, qty }])),
        })),
      clearBag: () => setState((s) => ({ ...s, bag: [] })),

      placeOrder: (input) => {
        const s = state;
        const discount = input.useReward ? rewardDiscount(s.menu, s.cart, rewardsConfig.rewardCategory) : 0;
        const totals = cartTotals(s.menu, s.cart, s.settings.taxRatePercent, discount);
        const number = s.orderCounter + 1;
        const lines = s.cart.map((l) => toOrderLine(s.menu, l)).filter((l): l is OrderLine => !!l);
        const order: Order = {
          id: uid(),
          number,
          userId: s.user?.id,
          name: input.name.trim(),
          phone: input.phone.trim(),
          lines,
          ...totals,
          payment: input.payment,
          paid: input.payment === 'paypal',
          notify: input.notify,
          status: 'received',
          createdAt: Date.now(),
          rewardUsed: discount > 0,
          mine: true,
        };
        setState((p) => ({
          ...p,
          orders: [order, ...p.orders],
          orderCounter: number,
          cart: [],
          rewardsRedeemed: p.rewardsRedeemed + (discount > 0 ? 1 : 0),
        }));
        return order;
      },
      setStatus: (orderId, status) =>
        setState((s) => ({
          ...s,
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  readyAt: status === 'ready' ? Date.now() : o.readyAt,
                  // cash is collected when the order is handed over
                  paid: status === 'completed' ? true : o.paid,
                }
              : o,
          ),
        })),
      markPaid: (orderId) =>
        setState((s) => ({ ...s, orders: s.orders.map((o) => (o.id === orderId ? { ...o, paid: true } : o)) })),
      markAlertSeen: (orderId) =>
        setState((s) => ({ ...s, orders: s.orders.map((o) => (o.id === orderId ? { ...o, alertSeen: true } : o)) })),
      addTestOrder: () => {
        const s = state;
        const pool = s.menu.filter((m) => !m.isAddOn && !m.soldOut);
        const main = pool.filter((m) => m.category === 'Entrees' || m.category === 'Sandwiches');
        const sides = pool.filter((m) => m.category === 'Sides');
        const drinks = pool.filter((m) => m.category === 'Drinks');
        const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
        const cartLines: CartLine[] = [pick(main), pick(sides), pick(drinks)]
          .filter(Boolean)
          .map((it) => ({
            key: uid(),
            itemId: it.id,
            qty: 1,
            selections: Object.fromEntries(
              it.optionGroupIds.map((g) => [g, [firstChoice(g)]]),
            ),
            extraIds: [],
            note: Math.random() > 0.6 ? 'No onions, please' : '',
          }));
        const totals = cartTotals(s.menu, cartLines, s.settings.taxRatePercent, 0);
        const number = s.orderCounter + 1;
        const cash = Math.random() > 0.5;
        const names = ['Alex P.', 'Maria G.', 'Chris L.', 'Dana W.', 'Kai R.'];
        const order: Order = {
          id: uid(),
          number,
          name: pick(names),
          phone: '(603) 555-0199',
          lines: cartLines.map((l) => toOrderLine(s.menu, l)).filter((l): l is OrderLine => !!l),
          ...totals,
          payment: cash ? 'cash' : 'paypal',
          paid: !cash,
          notify: cash ? 'text' : 'both',
          status: 'received',
          createdAt: Date.now(),
        };
        setState((p) => ({ ...p, orders: [order, ...p.orders], orderCounter: number }));
      },
      reorder: (order) => {
        let added = 0;
        const s = state;
        const newLines: CartLine[] = [];
        for (const l of order.lines) {
          const item = findItem(s.menu, l.itemId);
          if (!item || item.soldOut) continue;
          newLines.push({
            key: uid(),
            itemId: l.itemId,
            qty: l.qty,
            selections: restoreSelections(item, l.options),
            extraIds: l.extras.map((e) => e.id).filter((id) => !!findItem(s.menu, id)),
            note: l.note,
          });
          added++;
        }
        setState((p) => ({ ...p, cart: [...p.cart, ...newLines] }));
        return added;
      },

      signIn: (u) =>
        setState((s) => {
          const user: User = { id: s.user?.id ?? uid(), ...u };
          // Link past guest orders placed with the same phone number
          const digits = (x: string) => x.replace(/\D/g, '');
          return {
            ...s,
            user,
            orders: s.orders.map((o) =>
              !o.userId && !o.demo && digits(o.phone) && digits(o.phone) === digits(u.phone)
                ? { ...o, userId: user.id }
                : o,
            ),
          };
        }),
      signOut: () => setState((s) => ({ ...s, user: null })),
      toggleFavorite: (itemId) =>
        setState((s) => ({
          ...s,
          favorites: s.favorites.includes(itemId) ? s.favorites.filter((f) => f !== itemId) : [...s.favorites, itemId],
        })),

      staffLogin: (pin) => {
        if (pin === state.settings.staffPin) {
          setState((s) => ({ ...s, staffAuthed: true }));
          return true;
        }
        return false;
      },
      staffLogout: () => setState((s) => ({ ...s, staffAuthed: false })),
      upsertItem: (item) =>
        setState((s) => ({
          ...s,
          menu: s.menu.some((m) => m.id === item.id) ? s.menu.map((m) => (m.id === item.id ? item : m)) : [...s.menu, item],
        })),
      deleteItem: (id) =>
        setState((s) => ({
          ...s,
          menu: s.menu.filter((m) => m.id !== id).map((m) => ({ ...m, pairings: m.pairings.filter((p) => p !== id) })),
          cart: s.cart.filter((l) => l.itemId !== id).map((l) => ({ ...l, extraIds: l.extraIds.filter((e) => e !== id) })),
        })),
      setSoldOut: (id, soldOut) =>
        setState((s) => ({ ...s, menu: s.menu.map((m) => (m.id === id ? { ...m, soldOut } : m)) })),
      updateSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      resetAll: () => {
        const f = freshState();
        setState({ ...f, hydrated: true, staffAuthed: true });
      },

      rewardsInfo,
      discountFor,
    }),
    [state, rewardsInfo, discountFor],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

function firstChoice(groupId: string): string {
  return optionGroups.find((g) => g.id === groupId)?.choices[0]?.id ?? '';
}

function restoreSelections(item: MenuItem, labels: string[]) {
  const out: Record<string, string[]> = {};
  for (const gid of item.optionGroupIds) {
    const g = optionGroups.find((o) => o.id === gid);
    if (!g) continue;
    const match = g.choices.filter((c) => labels.includes(c.label)).map((c) => c.id);
    out[gid] = match.length ? match : g.required ? [g.choices[0].id] : [];
  }
  return out;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStore must be used inside <StoreProvider>');
  return c;
}
