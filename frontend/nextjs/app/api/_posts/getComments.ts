"use server";

import { cookies } from "next/headers";

const getComments = async (postId: number) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    console.log(`Getting comments for post ${postId}`);

    const response = await fetch("http://localhost:8080/getComments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify({
        postId: postId,
        session: token,
      }),
      cache: "no-store",
    });

    const data = await response.json();
    console.log(`Get comments response for post ${postId}:`, data);

    if (data.error === "Invalid session") {
      cookieStore.delete("token");
    }

    return data;
  } catch (err) {
    console.error(`Error getting comments for post ${postId}:`, err);
    return { error: "Failed to get comments" };
  }
};

export default getComments;
