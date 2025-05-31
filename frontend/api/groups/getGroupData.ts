"use server";

import { cookies } from "next/headers";

const getGroupData = async (groupId: number) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    token;

    const response = await fetch("http://localhost:8080/getGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session: token, groupId: groupId }),
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

export default getGroupData;
