"use server";

import { cookies } from "next/headers";

const getPostData = async (postId: number) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const response = await fetch("http://localhost:8080/getPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify({
        type: "get-post",
        data: { postId: postId, session: token },
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (data.error === "Invalid session") {
      cookieStore.delete("token");
      return { error: "Invalid session", post: null };
    }

    console.log(data)
    return data.data;
  } catch (err) {
    console.error(`Error fetching post data for post ${postId}:`, err);
    return { error: "Failed to fetch post data", post: null };
  }
};

export default getPostData;
