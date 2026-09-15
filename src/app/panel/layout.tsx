import type { Metadata } from "next";
import { getMenu } from "@/lib/menu";
import { PanelProvider } from "@/store/PanelStore";
import { PanelShell } from "@/components/panel/PanelShell";

export const metadata: Metadata = { title: "Panel · Mesa Digital" };

// El panel del local. Por ahora atado al restaurante de demo; con login
// (etapa 4) cada dueño ve el suyo.
export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  const menu = getMenu("fuego-lento");
  if (!menu) throw new Error("Falta el menú de demo");
  return (
    <PanelProvider menu={menu}>
      <PanelShell>{children}</PanelShell>
    </PanelProvider>
  );
}
