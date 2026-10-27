import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="site-brand">
        FunGames
      </Link>
      <ThemeSwitcher />
    </header>
  );
}
