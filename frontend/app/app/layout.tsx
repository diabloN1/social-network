import Navbar from "@/components/Navbar";
import getToken from "@/api/auth/getToken";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getToken();
  if (!data || data.error) {
    redirect("/auth");
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
