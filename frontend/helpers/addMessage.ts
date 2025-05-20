"use client";

import getToken from "@/api/auth/getToken";
import { socket } from "./webSocket";

export const addMessage = async (
  id: number,
  isGroup: boolean,
  message: string
) => {
  if (!socket) return;
  try {
    const token = (await getToken()).session;
    socket.send(
      JSON.stringify({
        type: "sendmessage",
        session: token ?? "",
        isGroup,
        id,
        message,
      })
    );
  } catch (err) {
    console.error(err);
  }
};
