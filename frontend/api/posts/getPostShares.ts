"use server";

import { User } from "@/types/user";
import { cookies } from "next/headers";

const getPostShares = async (postId: number) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const response = await fetch("http://localhost:8080/getPostShares", {
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
    // console.log(`getPostShares response for post ${postId}:`, data);

    if (data.error === "Invalid session") {
      cookieStore.delete("token");
      return {
        error: "Invalid session",
        data: { currentShares: [], availableUsers: [] },
      };
    }

    // Transform the response to separate current shares from available users
    if (data.allusers) {
      const currentShares = data.allusers.filter(
        (user: User) => user.isaccepted === true
      );
      const availableUsers = data.allusers.filter(
        (user: User) => user.isaccepted === false
      );

      return {
        ...data,
        data: {
          currentShares,
          availableUsers,
        },
      };
    }

    return data;
  } catch (err) {
    console.error(`Error fetching post shares for post ${postId}:`, err);
    return {
      error: "Failed to fetch post shares",
      data: { currentShares: [], availableUsers: [] },
    };
  }
};

export default getPostShares;
