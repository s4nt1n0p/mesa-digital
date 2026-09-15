// Modelo de pedidos y mesas. En la etapa 2 estas formas salen de Supabase.

export type OrderStatus = "recibido" | "preparando" | "listo" | "entregado";

export const ORDER_FLOW: OrderStatus[] = [
  "recibido",
  "preparando",
  "listo",
  "entregado",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  recibido: "Recibido",
  preparando: "En preparación",
  listo: "Listo",
  entregado: "Entregado",
};

export type OrderItem = {
  dishId: string;
  name: string;
  qty: number;
  unitPrice: number;
  note?: string;
};

export type Order = {
  id: string;
  table: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
};

export type TableStatus = "libre" | "ocupada" | "cuenta";

export type Table = {
  number: number;
  seats: number;
  status: TableStatus;
  /** Momento en que se sentaron; sirve para saber cuánto llevan. */
  openedAt?: number;
  /** Pedido de cuenta desde el celular. */
  billRequested?: boolean;
  /** Llamado al mozo desde el celular. */
  waiterCalled?: boolean;
};

export type ClosedTable = {
  table: number;
  closedAt: number;
  total: number;
  orders: Order[];
};

export function orderTotal(o: Order): number {
  return o.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
}

export function nextStatus(s: OrderStatus): OrderStatus | null {
  const i = ORDER_FLOW.indexOf(s);
  return i >= 0 && i < ORDER_FLOW.length - 1 ? ORDER_FLOW[i + 1] : null;
}

export function minutesSince(ts: number, now = Date.now()): number {
  return Math.max(0, Math.floor((now - ts) / 60000));
}
