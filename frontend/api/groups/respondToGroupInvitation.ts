"use server";

import { cookies } from "next/headers";

const respondToGroupInvitation = async (groupId: number, accept: boolean) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const response = await fetch(
      "http://localhost:8080/respondToGroupInvitation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId,
          accept,
          session: token,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to respond to invitation");
    }

    const data = await response.json();

    if (data.error == "Invalid session") {
      cookieStore.delete("token");
    }

    return data;
  } catch (err) {
    console.error(err);
    return { error: "Failed to respond to invitation" };
  }
};

export default respondToGroupInvitation;
