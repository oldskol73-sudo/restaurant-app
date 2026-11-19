import { useCallback, useEffect, useRef, useState } from 'react';
import type { MenuItem } from '../../restaurant.config';
import { backendOn, itemToRow, publicSettings, rowToItem, rowToOrder, supabase } from './backend';
import type { AppState, Order, Settings } from './types';

type SetState = React.Dispatch<React.SetStateAction<AppState>>;

/* ------------------------------ Write helpers ----------------------------- */
// All of these are fire-and-forget: the app updates instantly on the phone and
// the shared database catches up. Errors are logged, never shown as crashes.

const log = (what: string, error: unknown) => {
  if (error) console.warn(`[sync] ${what}:`, (error as { message?: string }).message ?? error);
};

export async function pushMenuItem(item: MenuItem, sortOrder: number) {
  if (!supabase) return;
  const { error } = await supabase.from('menu_items').upsert(itemToRow(item, sortOrder));
  log('save menu item', error);
}
export async function removeMenuItem(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  log('delete menu item', error);
}
export async function pushSoldOut(id: string, soldOut: boolean) {
  if (!supabase) return;
  const { error } = await supabase.from('menu_items').update({ sold_out: soldOut, updated_at: new Date().toISOString() }).eq('id', id);
  log('sold out', error);
}
export async function pushSettings(settings: Settings) {
  if (!supabase) return;
  const { error } = await supabase.from('app_settings').upsert({ id: 1, data: publicSettings(settings), updated_at: new Date().toISOString() });
  log('save settings', error);
}
export async function pushOrderPatch(id: string, patch: { status?: string; paid?: boolean; ready_at?: string | null }) {
  if (!supabase) return;
  const { error } = await supabase.from('orders').update(patch).eq('id', id);
  log('update order', error);
}
export async function pushAlertSeen(id: string) {
  if (!supabase) return;
  const { error } = await supabase.rpc('mark_alert_seen', { order_id: id });
  log('alert seen', error);
}
/** Sends a customer's order to the shared database. Returns the official order number, or null if it failed. */
export async function submitOrder(o: Order, customerRef?: string): Promise<number | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('place_order', {
    p: {
      id: o.id,
      name: o.name,
      phone: o.phone,
      lines: o.lines,
      subtotal: o.subtotal,
      discount: o.discount,
      tax: o.tax,
      total: o.total,
      payment: o.payment,
      paid: o.paid,
      notify: o.notify,
      reward_used: !!o.rewardUsed,
      customer_ref: customerRef ?? null,
      push_token: o.pushToken ?? null,
    },
  });
  if (error) {
    log('place order', error);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return row?.number ?? null;
}
export async function insertTestOrder(o: Order) {
  if (!supabase) return;
  const { error } = await supabase.from('orders').insert({
    id: o.id,
    name: o.name,
    phone: o.phone,
    lines: o.lines,
    subtotal: o.subtotal,
    discount: o.discount,
    tax: o.tax,
    total: o.total,
    payment: o.payment,
    paid: o.paid,
    notify: o.notify,
  });
  log('test order', error);
}

/* ------------------------------ The sync hook ------------------------------ */

export function useBackendSync(state: AppState, setState: SetState) {
  const [staffEmail, setStaffEmail] = useState<string | null>(null);
  const [dbStaff, setDbStaff] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const seeded = useRef(false);

  const checkStaff = useCallback(async () => {
    if (!supabase) return;
    const { data: sess } = await supabase.auth.getSession();
    const email = sess.session?.user?.email ?? null;
    setStaffEmail(email);
    if (!email) {
      setDbStaff(false);
      return;
    }
    const { data } = await supabase.rpc('is_staff');
    setDbStaff(data === true);
  }, []);

  // Who is signed in?
  useEffect(() => {
    if (!supabase || !state.hydrated) return;
    checkStaff();
    const { data } = supabase.auth.onAuthStateChange(() => {
      checkStaff();
    });
    return () => data.subscription.unsubscribe();
  }, [state.hydrated, checkStaff]);

  // Menu + settings: everyone reads them
  const pullPublic = useCallback(async () => {
    if (!supabase) return;
    const [menuRes, setRes] = await Promise.all([
      supabase.from('menu_items').select('*').order('sort_order', { ascending: true }),
      supabase.from('app_settings').select('data').eq('id', 1).maybeSingle(),
    ]);
    if (menuRes.error || setRes.error) {
      log('read menu/settings', menuRes.error ?? setRes.error);
      return;
    }
    const rows = menuRes.data ?? [];
    if (rows.length > 0) {
      setState((s) => ({ ...s, menu: rows.map(rowToItem) }));
    }
    const remote = setRes.data?.data as Partial<Settings> | undefined;
    if (remote && Object.keys(remote).length > 0) {
      setState((s) => ({ ...s, settings: { ...s.settings, ...remote, staffPin: s.settings.staffPin, salesPin: s.settings.salesPin } }));
    }
    // First staff sign-in on an empty database: publish the starting menu + settings.
    if (dbStaff && rows.length === 0 && !seeded.current) {
      seeded.current = true;
      const cur = stateRef.current;
      await supabase.from('menu_items').upsert(cur.menu.map((m, i) => itemToRow(m, i)));
      await pushSettings(cur.settings);
    }
  }, [setState, dbStaff]);

  useEffect(() => {
    if (!supabase || !state.hydrated) return;
    pullPublic();
    const timer = setInterval(pullPublic, 30000);
    const channel = supabase
      .channel('public-menu')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => pullPublic())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, () => pullPublic())
      .subscribe();
    return () => {
      clearInterval(timer);
      supabase?.removeChannel(channel);
    };
  }, [state.hydrated, pullPublic]);

  // Staff: all orders, live
  const pullOrders = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(300);
    if (error) return log('read orders', error);
    const remote = (data ?? []).map(rowToOrder);
    setState((s) => {
      const local = new Map(s.orders.map((o) => [o.id, o]));
      const remoteIds = new Set(remote.map((o) => o.id));
      const merged = remote.map((r) => {
        const l = local.get(r.id);
        return l ? { ...r, mine: l.mine, userId: l.userId, alertSeen: l.alertSeen || r.alertSeen } : r;
      });
      const pending = s.orders.filter((o) => !remoteIds.has(o.id) && o.unsynced);
      const all = [...pending, ...merged].sort((a, b) => b.createdAt - a.createdAt);
      return { ...s, orders: all, orderCounter: Math.max(s.orderCounter, ...all.map((o) => o.number)) };
    });
  }, [setState]);

  useEffect(() => {
    if (!supabase || !dbStaff) return;
    pullOrders();
    const timer = setInterval(pullOrders, 6000); // safety net if live updates drop
    const channel = supabase
      .channel('staff-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => pullOrders())
      .subscribe();
    return () => {
      clearInterval(timer);
      supabase?.removeChannel(channel);
    };
  }, [dbStaff, pullOrders]);

  // Customer phone: retry unsent orders, follow my orders' progress
  useEffect(() => {
    if (!supabase || !state.hydrated) return;
    const tick = async () => {
      const mine = stateRef.current.orders.filter((o) => o.mine);
      for (const o of mine) {
        if (o.unsynced) {
          const number = await submitOrder(o, o.userId);
          if (number != null) setState((s) => ({ ...s, orders: s.orders.map((x) => (x.id === o.id ? { ...x, number, unsynced: false } : x)) }));
        } else if (o.status !== 'completed' && !dbStaff) {
          const { data } = await supabase!.rpc('get_order', { order_id: o.id });
          const row = Array.isArray(data) ? data[0] : data;
          if (row) {
            const r = rowToOrder(row);
            setState((s) => ({
              ...s,
              orders: s.orders.map((x) => (x.id === o.id ? { ...x, status: r.status, paid: r.paid, readyAt: r.readyAt, number: r.number } : x)),
            }));
          }
        }
      }
    };
    const timer = setInterval(tick, 4000);
    return () => clearInterval(timer);
  }, [state.hydrated, dbStaff, setState]);

  const signInStaff = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      if (!supabase) return 'The shared database is not set up.';
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return error.message;
      const { data } = await supabase.rpc('is_staff');
      if (data !== true) {
        await supabase.auth.signOut();
        return 'That login works, but its email is not on the staff list yet. Ask the owner to add it (see supabase/schema.sql, last step).';
      }
      await checkStaff();
      return null;
    },
    [checkStaff],
  );

  const signOutStaff = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    seeded.current = false;
    await checkStaff();
  }, [checkStaff]);

  return { backendOn, staffEmail, dbStaff, signInStaff, signOutStaff };
}
