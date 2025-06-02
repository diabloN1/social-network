import Navbar from "@/components/Navbar";
import getToken from "@/api/auth/getToken";
import { redirect } from "next/navigation";
import { ErrorProvider } from "@/context/ErrorContext";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      <ErrorProvider>
        <Navbar />
        {children}
      </ErrorProvider>
    </>
  );
}
