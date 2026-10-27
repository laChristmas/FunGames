import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";
import { ThemeSwitcher, ThemeSync } from "@/components/theme-switcher";

export function SiteHeader() {
  return (
    <header className="site-header">
      <ThemeSync />
      <Link href="/" className="site-brand">
        FunGames
      </Link>
      <div className="header-actions">
        <ThemeSwitcher />
        <AccountMenu />
      </div>
    </header>
  );
}
