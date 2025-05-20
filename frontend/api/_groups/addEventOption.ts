"use server";

import { cookies } from "next/headers";

const addEventOption = async (groupId: number, eventId: number, option: boolean) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const response = await fetch("http://localhost:8080/addEventOption", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupId,
        eventId,
        option,
        session: token
      }),
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

export default addEventOption;
