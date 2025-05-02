"use server"

import { cookies } from "next/headers"

const reactToPost = async (postId: number, reaction: boolean | null) => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value || ""

    const response = await fetch("http://localhost:8080/reactToPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId: postId,
        reaction: reaction,
        session: token,
      }),
    })

    const responseClone = response.clone()
    const responseText = await responseClone.text()

    let data
    try {
      data = responseText ? JSON.parse(responseText) : {}
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.error("Response text:", responseText)
      return { error: "Invalid response from server" }
    }

    if (data.error === "Invalid session") {
      cookieStore.delete("token")
    }

    return data
  } catch (err) {
    console.error("Request error:", err)
    return { error: "Failed to send reaction" }
  }
}

export default reactToPost
