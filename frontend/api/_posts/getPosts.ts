"use server";

import { cookies } from "next/headers";

const getPosts = async (startId: number) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const response = await fetch("http://localhost:8080/getPosts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startId: startId,
        session: token,
      }),
      cache: "no-store",
    });

    const data = await response.json();
    console.log("getPosts response:", data);

    if (data.error === "Invalid session") {
      cookieStore.delete("token");
    }

    return data;
  } catch (err) {
    console.error("Error fetching posts:", err);
    return { error: "Failed to fetch posts", posts: [] };
  }
};

export default getPosts;
