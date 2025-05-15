import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "../_components/Navbar";
import getToken from "../api/_auth/getToken";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const data = await getToken()

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
