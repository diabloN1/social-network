"use server";

import { cookies } from "next/headers";

const addGroupEvent = async (formData: {
  title: string;
  description: string;
  option1: string;
  option2: string;
  date: string;
  place: string;
  groupId: number;
  session?: string;
}) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    formData["session"] = token;

    const response = await fetch("http://localhost:8080/addGroupEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
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

export default addGroupEvent;
