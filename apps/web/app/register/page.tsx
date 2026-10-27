"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!displayName) {
      setError("请填写显示名");
      return;
    }
    if (password.length < 8) {
      setError("密码至少 8 位");
      return;
    }
    const result = await authClient.signUp.email({
      email,
      password,
      name: displayName,
    });
    if (result.error) {
      setError(result.error.message ?? "注册失败");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="page">
      <h1>注册</h1>
      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          显示名
          <input name="displayName" autoComplete="nickname" required />
        </label>
        <label>
          邮箱
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          密码
          <input name="password" type="password" autoComplete="new-password" required minLength={8} />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit">注册并进入目录</button>
        <Link href="/login">已有账号，去登录</Link>
      </form>
    </main>
  );
}
