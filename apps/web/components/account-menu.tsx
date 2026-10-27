"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AccountMenu() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  if (isPending) return <span className="header-link">…</span>;
  if (!data) {
    return (
      <Link className="header-link" href="/login">
        登录
      </Link>
    );
  }

  return (
    <span className="account-menu">
      <Link className="header-link" href="/account">
        {data.user.name}
      </Link>
      <button
        type="button"
        onClick={async () => {
          await authClient.signOut();
          router.refresh();
        }}
      >
        登出
      </button>
    </span>
  );
}
