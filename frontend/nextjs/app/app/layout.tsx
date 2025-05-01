import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "../_components/Navbar";
import Navbar from "../_components/Navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    redirect("/auth");
  }

  const res = await fetch("http://localhost:8080/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session: token }),
    cache: "no-store",
  });

  const data = await res.json();

  if (!data.session) {
    redirect("/auth");
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
