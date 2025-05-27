"use server";

import { cookies } from "next/headers";

async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("token");

    return { success: true };
  } catch (error) {
    console.error("Error clearing session cookie:", error);
  }
}

export default clearSessionCookie;
