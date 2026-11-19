import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { backend, type MenuItem } from '../../restaurant.config';
import type { Order, Settings } from './types';

/** True when the shared database is configured in restaurant.config.ts. */
export const backendOn = !!backend.supabaseUrl && !!backend.supabaseKey;

export const supabase = backendOn
  ? createClient(backend.supabaseUrl, backend.supabaseKey, {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    })
  : null;

/* ------------------------------ Row mapping ------------------------------ */

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export function rowToItem(r: Row): MenuItem {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    price: Number(r.price),
    category: r.category,
    photo: r.photo ?? '',
    badge: r.badge ?? undefined,
    saleLabel: r.sale_label ?? undefined,
    wasPrice: r.was_price != null ? Number(r.was_price) : undefined,
    soldOut: !!r.sold_out,
    isAddOn: !!r.is_add_on,
    optionGroupIds: Array.isArray(r.option_group_ids) ? r.option_group_ids : [],
    pairings: Array.isArray(r.pairings) ? r.pairings : [],
  };
}

export function itemToRow(i: MenuItem, sortOrder: number): Row {
  return {
    id: i.id,
    name: i.name,
    description: i.description,
    price: i.price,
    category: i.category,
    photo: i.photo,
    badge: i.badge ?? null,
    sale_label: i.saleLabel ?? null,
    was_price: i.wasPrice ?? null,
    sold_out: i.soldOut,
    is_add_on: !!i.isAddOn,
    option_group_ids: i.optionGroupIds,
    pairings: i.pairings,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  };
}

export function rowToOrder(r: Row): Order {
  return {
    id: r.id,
    number: r.number,
    name: r.name,
    phone: r.phone,
    lines: r.lines ?? [],
    subtotal: Number(r.subtotal),
    discount: Number(r.discount ?? 0),
    tax: Number(r.tax),
    total: Number(r.total),
    payment: r.payment,
    paid: !!r.paid,
    notify: r.notify,
    status: r.status,
    createdAt: Date.parse(r.created_at),
    readyAt: r.ready_at ? Date.parse(r.ready_at) : undefined,
    rewardUsed: !!r.reward_used,
    alertSeen: !!r.alert_seen,
    pushToken: r.push_token ?? undefined,
  };
}

/** Settings that are shared with everyone. PINs stay on the staff phone. */
export function publicSettings(s: Settings) {
  const { staffPin: _a, salesPin: _b, ...rest } = s;
  return rest;
}
