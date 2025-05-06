"use server";

import { cookies } from "next/headers";

const reactToPost = async (postId: number, reaction: boolean | null) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const response = await fetch("http://localhost:8080/reactToPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId, reaction, session: token }),
    });
    const data = await response.json();

    console.log(data);

    if (data.error == "Invalid session") {
      cookieStore.delete("token");
    }
    return data;
  } catch (err) {
    console.error(err);
  }
};

export default reactToPost;
