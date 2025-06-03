"use server";

import { cookies } from "next/headers";

const searchUsersForInvite = async (groupId: number, searchTerm: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const response = await fetch("http://localhost:8080/searchUsersForInvite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupId,
        searchTerm,
        session: token,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to search users");
    }

    const data = await response.json();

    if (data.error == "Invalid session") {
      cookieStore.delete("token");
    }

    return data;
  } catch (err) {
    console.error(err);
    return { error: "Failed to search users" };
  }
};

export default searchUsersForInvite;
