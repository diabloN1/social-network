"use server";

import { cookies } from "next/headers";

const getToken = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const response = await fetch("http://localhost:8080/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session: token }),
      cache: "no-store",
    });

    const data = await response.json();

    return data;
  } catch (err) {
    console.error(err);
  }
};

export default getToken;
