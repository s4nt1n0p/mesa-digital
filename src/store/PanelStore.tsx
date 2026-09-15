"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import type { Dish, Menu } from "@/lib/types";
import {
  nextStatus,
  orderTotal,
  type ClosedTable,
  type Order,
  type OrderStatus,
  type Table,
} from "@/lib/orders";

// Estado del panel del local. Hoy vive en memoria (con respaldo en localStorage)
// y tiene un simulador de pedidos para la demo. En la etapa 2 se reemplaza por
// Supabase + Realtime sin cambiar las pantallas.

type State = {
  menu: Menu;
  tables: Table[];
  orders: Order[];
  closed: ClosedTable[];
  demo: boolean;
  /** Pedidos nuevos que todavía no se vieron (para la campana). */
  unseen: string[];
};

type Action =
  | { type: "hydrate"; state: Partial<State> }
  | { type: "order/add"; order: Order }
  | { type: "order/status"; id: string; status: OrderStatus }
  | { type: "order/seen" }
  | { type: "table/close"; table: number }
  | { type: "table/open"; table: number }
  | { type: "table/flag"; table: number; waiterCalled?: boolean; billRequested?: boolean }
  | { type: "dish/update"; id: string; patch: Partial<Dish> }
  | { type: "demo/toggle" };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "hydrate":
      return { ...s, ...a.state };
    case "order/add": {
      const tables = s.tables.map((t) =>
        t.number === a.order.table
          ? { ...t, status: "ocupada" as const, openedAt: t.openedAt ?? a.order.createdAt }
          : t,
      );
      return { ...s, orders: [a.order, ...s.orders], tables, unseen: [...s.unseen, a.order.id] };
    }
    case "order/status":
      return {
        ...s,
        orders: s.orders.map((o) =>
          o.id === a.id ? { ...o, status: a.status, updatedAt: Date.now() } : o,
        ),
      };
    case "order/seen":
      return { ...s, unseen: [] };
    case "table/open":
      return {
        ...s,
        tables: s.tables.map((t) =>
          t.number === a.table ? { ...t, status: "ocupada", openedAt: Date.now() } : t,
        ),
      };
    case "table/flag":
      return {
        ...s,
        tables: s.tables.map((t) =>
          t.number === a.table
            ? {
                ...t,
                waiterCalled: a.waiterCalled ?? t.waiterCalled,
                billRequested: a.billRequested ?? t.billRequested,
                status: a.billRequested ? "cuenta" : t.status,
              }
            : t,
        ),
      };
    case "table/close": {
      const tableOrders = s.orders.filter((o) => o.table === a.table);
      const closedEntry: ClosedTable = {
        table: a.table,
        closedAt: Date.now(),
        total: tableOrders.reduce((sum, o) => sum + orderTotal(o), 0),
        orders: tableOrders,
      };
      return {
        ...s,
        orders: s.orders.filter((o) => o.table !== a.table),
        closed: [closedEntry, ...s.closed],
        tables: s.tables.map((t) =>
          t.number === a.table
            ? { number: t.number, seats: t.seats, status: "libre" }
            : t,
        ),
      };
    }
    case "dish/update":
      return {
        ...s,
        menu: {
          ...s.menu,
          dishes: s.menu.dishes.map((d) => (d.id === a.id ? { ...d, ...a.patch } : d)),
        },
      };
    case "demo/toggle":
      return { ...s, demo: !s.demo };
  }
}

type Ctx = State & {
  addOrder: (table: number, items: Order["items"]) => void;
  advance: (id: string) => void;
  setStatus: (id: string, status: OrderStatus) => void;
  markSeen: () => void;
  closeTable: (table: number) => void;
  openTable: (table: number) => void;
  flagTable: (table: number, f: { waiterCalled?: boolean; billRequested?: boolean }) => void;
  updateDish: (id: string, patch: Partial<Dish>) => void;
  toggleDemo: () => void;
  simulateOrder: () => void;
};

const PanelCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "mesa-digital:panel";

function makeTables(n: number): Table[] {
  return Array.from({ length: n }, (_, i) => ({
    number: i + 1,
    seats: i % 4 === 3 ? 6 : i % 3 === 0 ? 2 : 4,
    status: "libre",
  }));
}

let seq = 1;
const newId = () => `o-${Date.now().toString(36)}-${seq++}`;

const NOTES = ["", "", "", "sin cebolla", "punto jugoso", "sin sal", "para compartir"];

export function PanelProvider({ menu, children }: { menu: Menu; children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    menu,
    tables: makeTables(12),
    orders: [],
    closed: [],
    demo: true,
    unseen: [],
  }));
  const stateRef = useRef(state);
  stateRef.current = state;

  // Respaldo local para que un refresh no borre el servicio.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<State>;
        dispatch({ type: "hydrate", state: { ...saved, menu: menu, unseen: [] } });
      }
    } catch {}
  }, [menu]);

  useEffect(() => {
    try {
      const { tables, orders, closed, demo } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tables, orders, closed, demo }));
    } catch {}
  }, [state]);

  const simulateOrder = useCallback(() => {
    const s = stateRef.current;
    const available = s.menu.dishes.filter((d) => d.available);
    if (available.length === 0) return;
    // Prefiere mesas ya ocupadas (repiten pedido) o abre una libre.
    const occupied = s.tables.filter((t) => t.status === "ocupada");
    const free = s.tables.filter((t) => t.status === "libre");
    const pool = occupied.length > 0 && Math.random() < 0.55 ? occupied : free.length ? free : occupied;
    if (pool.length === 0) return;
    const table = pool[Math.floor(Math.random() * pool.length)].number;
    const n = 1 + Math.floor(Math.random() * 3);
    const items = Array.from({ length: n }, () => {
      const d = available[Math.floor(Math.random() * available.length)];
      const note = NOTES[Math.floor(Math.random() * NOTES.length)];
      return {
        dishId: d.id,
        name: d.name,
        qty: 1 + (Math.random() < 0.25 ? 1 : 0),
        unitPrice: d.price,
        note: note || undefined,
      };
    });
    const now = Date.now();
    dispatch({
      type: "order/add",
      order: { id: newId(), table, items, status: "recibido", createdAt: now, updatedAt: now },
    });
  }, []);

  // Simulador: en modo demo entra un pedido cada 25–50 s.
  useEffect(() => {
    if (!state.demo) return;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      simulateOrder();
      t = setTimeout(tick, 25000 + Math.random() * 25000);
    };
    t = setTimeout(tick, 4000);
    return () => clearTimeout(t);
  }, [state.demo, simulateOrder]);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      addOrder: (table, items) => {
        const now = Date.now();
        dispatch({
          type: "order/add",
          order: { id: newId(), table, items, status: "recibido", createdAt: now, updatedAt: now },
        });
      },
      advance: (id) => {
        const o = stateRef.current.orders.find((x) => x.id === id);
        const next = o && nextStatus(o.status);
        if (next) dispatch({ type: "order/status", id, status: next });
      },
      setStatus: (id, status) => dispatch({ type: "order/status", id, status }),
      markSeen: () => dispatch({ type: "order/seen" }),
      closeTable: (table) => dispatch({ type: "table/close", table }),
      openTable: (table) => dispatch({ type: "table/open", table }),
      flagTable: (table, f) => dispatch({ type: "table/flag", table, ...f }),
      updateDish: (id, patch) => dispatch({ type: "dish/update", id, patch }),
      toggleDemo: () => dispatch({ type: "demo/toggle" }),
      simulateOrder,
    }),
    [state, simulateOrder],
  );

  return <PanelCtx.Provider value={value}>{children}</PanelCtx.Provider>;
}

export function usePanel(): Ctx {
  const ctx = useContext(PanelCtx);
  if (!ctx) throw new Error("usePanel debe usarse dentro de PanelProvider");
  return ctx;
}
