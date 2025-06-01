const getComments = async (postId: number) => {
  try {
    const response = await fetch("http://localhost:8080/getComments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify({
        type: "get-comments",
        data: {
          postId: postId,
        },
      }),
      cache: "no-store",
      credentials: "include",
    });

    const data = await response.json();
    console.log("Get comments response:", data);

    return data.data;
  } catch (err) {
    console.error(`Error getting comments for post ${postId}:`, err);
    return { error: "Failed to get comments" };
  }
};

export default getComments;
