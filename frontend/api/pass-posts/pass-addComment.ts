
const addComment = async (postId: number, text: string, image?: string) => {
  try {
    const response = await fetch("http://localhost:8080/addComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify({
        type: "add-comment",
        data: {
          postId: postId,
          text: text,
          image: image || "",
        },
      }),
      cache: "no-store",
      credentials: "include",
    });

    const data = await response.json();

    console.log("Add comment response:", data);
    return data;
  } catch (err) {
    console.error(`Error adding comment to post ${postId}:`, err);
    return { error: "Failed to add comment" };
  }
};

export default addComment;
