import { optionGroups, type MenuItem } from '../../restaurant.config';
import type { CartLine, OrderLine } from './types';

export const money = (n: number) => `$${(Math.round(n * 100) / 100).toFixed(2)}`;
export const round2 = (n: number) => Math.round(n * 100) / 100;

export function findItem(menu: MenuItem[], id: string) {
  return menu.find((m) => m.id === id);
}

export function optionLabels(item: MenuItem, selections: Record<string, string[]>) {
  const out: string[] = [];
  let delta = 0;
  for (const gid of item.optionGroupIds) {
    const g = optionGroups.find((o) => o.id === gid);
    if (!g) continue;
    for (const cid of selections[gid] ?? []) {
      const c = g.choices.find((x) => x.id === cid);
      if (c) {
        out.push(c.label);
        delta += c.price;
      }
    }
  }
  return { labels: out, delta };
}

export function lineUnitPrice(menu: MenuItem[], line: CartLine) {
  const item = findItem(menu, line.itemId);
  if (!item) return 0;
  const { delta } = optionLabels(item, line.selections);
  const extras = line.extraIds.reduce((s, id) => s + (findItem(menu, id)?.price ?? 0), 0);
  return round2(item.price + delta + extras);
}

export function toOrderLine(menu: MenuItem[], line: CartLine): OrderLine | null {
  const item = findItem(menu, line.itemId);
  if (!item) return null;
  const { labels } = optionLabels(item, line.selections);
  return {
    itemId: item.id,
    name: item.name,
    category: item.category,
    qty: line.qty,
    unitPrice: lineUnitPrice(menu, line),
    options: labels,
    extras: line.extraIds
      .map((id) => findItem(menu, id))
      .filter((x): x is MenuItem => !!x)
      .map((x) => ({ id: x.id, name: x.name, price: x.price })),
    note: line.note,
  };
}

/** Discount for redeeming the reward: the cheapest unit in the reward category. */
export function rewardDiscount(menu: MenuItem[], cart: CartLine[], category: string) {
  const prices = cart
    .map((l) => ({ l, item: findItem(menu, l.itemId) }))
    .filter((x) => x.item && x.item.category === category && !x.item.isAddOn)
    .map((x) => lineUnitPrice(menu, x.l));
  return prices.length ? Math.min(...prices) : 0;
}

export function cartTotals(menu: MenuItem[], cart: CartLine[], taxPercent: number, discount = 0) {
  const subtotal = round2(cart.reduce((s, l) => s + lineUnitPrice(menu, l) * l.qty, 0));
  const taxable = Math.max(0, subtotal - discount);
  const tax = round2((taxable * taxPercent) / 100);
  const total = round2(taxable + tax);
  return { subtotal, discount, tax, total };
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
