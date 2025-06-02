"use server";

import { cookies } from "next/headers";

const getMessages = async (id: number, isGroup: boolean) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const response = await fetch("http://localhost:8080/getMessages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: token,
        id: id,
        isGroup,
      }),
    });
    const data = await response.json();

    // console.log(data);

    if (data.error == "Invalid session") {
      cookieStore.delete("token");
    }
    return data;
  } catch (err) {
    console.error(err);
  }
};

export default getMessages;
