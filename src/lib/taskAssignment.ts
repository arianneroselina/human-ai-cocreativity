import { POEM_TASKS } from "@/data/tasks";

const ORDER_STORAGE_PREFIX = "poem_task_order_v6";

function hasWindow() {
  return typeof window !== "undefined";
}

function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;

  if (hasWindow() && "crypto" in window && "getRandomValues" in window.crypto) {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
    while (true) {
      window.crypto.getRandomValues(buf);
      const x = buf[0];
      if (x < limit) return x % maxExclusive;
    }
  }
  return Math.floor(Math.random() * maxExclusive);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function resetTaskOrder(sessionId: string) {
  if (!hasWindow()) return;
  const storageKey = `${ORDER_STORAGE_PREFIX}:${sessionId}`;
  window.localStorage.removeItem(storageKey);
}

export function getOrCreateTaskOrder(sessionId: string): string[] {
  const ids = POEM_TASKS.map((t) => t.id);

  if (!hasWindow()) return ids;

  const storageKey = `${ORDER_STORAGE_PREFIX}:${sessionId}`;
  const raw = window.localStorage.getItem(storageKey);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (
        Array.isArray(parsed) &&
        parsed.length === ids.length &&
        parsed.every((x) => typeof x === "string") &&
        new Set(parsed).size === ids.length &&
        parsed.every((x) => ids.includes(x))
      ) {
        return parsed as string[];
      }
    } catch {
      // ignore
    }
  }

  const order = shuffle(ids);
  window.localStorage.setItem(storageKey, JSON.stringify(order));
  return order;
}

export function getTaskIdForRound(roundIndex: number, sessionId: string): string {
  const order = getOrCreateTaskOrder(sessionId);
  const i = ((roundIndex % order.length) + order.length) % order.length;
  return order[i];
}
