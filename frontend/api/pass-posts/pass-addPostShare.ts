
const addPostShare = async (postId: number, userId: number) => {
  try {

    const response = await fetch("http://localhost:8080/addPostShare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      credentials: "include",

      body: JSON.stringify({
        type: "add-post-share",
        data: {
          postId: postId,
          userId: userId,
        },
      }),
      cache: "no-store",
    });

    const data = await response.json();

    return data.data;
  } catch (err) {
    return { error: "Failed to add post share" };
  }
};

export default addPostShare;
