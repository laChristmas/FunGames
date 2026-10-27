import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?next=/account");

  return (
    <main className="page">
      <h1>{session.user.name}</h1>
      <p>还没有对局。</p>
    </main>
  );
}
