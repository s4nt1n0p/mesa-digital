import { notFound } from "next/navigation";
import { getMenu } from "@/lib/menu";
import { MenuView } from "@/components/menu/MenuView";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mesa?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const menu = getMenu(slug);
  return { title: menu ? `${menu.restaurant.name} · Carta` : "Mesa Digital" };
}

export default async function MenuPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { mesa } = await searchParams;
  const menu = getMenu(slug);
  if (!menu) notFound();
  return <MenuView menu={menu} table={mesa ?? null} />;
}
