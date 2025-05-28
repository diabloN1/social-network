"use server";

import { cookies } from "next/headers";

const inviteUserToGroup = async (groupId: number, userId: number) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const response = await fetch("http://localhost:8080/inviteUserToGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupId,
        userId,
        session: token,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to invite user");
    }

    const data = await response.json();

    if (data.error == "Invalid session") {
      cookieStore.delete("token");
    }

    return data;
  } catch (err) {
    console.error(err);
    return { error: "Failed to invite user" };
  }
};

export default inviteUserToGroup;
