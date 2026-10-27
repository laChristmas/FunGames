"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await authClient.signIn.email({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    if (result.error) {
      setError(result.error.message ?? "登录失败");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="page">
      <h1>登录</h1>
      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          邮箱
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          密码
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit">登录并进入目录</button>
        <Link href="/register">没有账号，去注册</Link>
      </form>
    </main>
  );
}
