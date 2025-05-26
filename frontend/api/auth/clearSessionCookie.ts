"use server";

import { cookies } from "next/headers";

async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();

    // Clear the token cookie
    cookieStore.delete("token");

    // Also clear session cookie if it exists
    cookieStore.delete("session");

    return { success: true };
  } catch (error) {
    console.error("Error clearing session cookie:", error);
    return { success: false, error: error.message };
  }
}

export default clearSessionCookie;
