"use server";

import { cookies } from "next/headers";

const getAvailableUsersToInvite = async (groupId: number) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const response = await fetch("http://localhost:8080/getGroupInviteUsers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupId,
        session: token,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get available users");
    }

    const data = await response.json();

    if (data.error == "Invalid session") {
      cookieStore.delete("token");
    }

    return data;
  } catch (err) {
    console.error(err);
    return { error: "Failed to get available users" };
  }
};

export default getAvailableUsersToInvite;
