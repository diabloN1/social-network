"use server"

import { cookies } from "next/headers"

const getGroupPostData = async (postId: number) => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value || ""

    const response = await fetch("http://localhost:8080/getGroupPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify({
        postId: postId,
        session: token,
      }),
      cache: "no-store",
    })

    const data = await response.json()
    console.log(`getGroupPostData response for post ${postId}:`, data)

    if (data.error === "Invalid session") {
      cookieStore.delete("token")
      return { error: "Invalid session", posts: [] }
    }

    return data
  } catch (err) {
    console.error(`Error fetching group post data for post ${postId}:`, err)
    return { error: "Failed to fetch post data", posts: [] }
  }
}

export default getGroupPostData
