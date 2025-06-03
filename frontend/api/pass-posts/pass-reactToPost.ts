const reactToPost = async (postId: number, reaction: boolean | null) => {
  try {
    const response = await fetch("http://localhost:8080/reactToPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "react-to-post",
        data: { postId, reaction },
      }),
      credentials: "include",
    });
    const data = await response.json();

    return data;
  } catch (err) {
    console.error(err);
  }
};

export default reactToPost;
