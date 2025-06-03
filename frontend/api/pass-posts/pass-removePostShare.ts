const removePostShare = async (postId: number, userId: number) => {
  try {
    const response = await fetch("http://localhost:8080/removePostShare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify({
        type: "remove-post-share",
        data: {
          postId: postId,
          userId: userId,
        },
      }),
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.json();

    return data.data;
  } catch (err) {
    console.error(
      `Error removing post share for post ${postId}, user ${userId}:`,
      err
    );
    return { error: "Failed to remove post share" };
  }
};

export default removePostShare;
