import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import getToken from "@/api/auth/getToken";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getToken();


  //dublicated in getToken??
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
