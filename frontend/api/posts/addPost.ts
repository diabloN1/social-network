
const addPost = async (formData: {
  image: string;
  caption: string;
  privacy?: string;
  session?: string;
}) => {
  try {
    const token = "";

    formData["session"] = token;

    const response = await fetch("http://localhost:8080/addPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        type: "add-post",
        data: formData,
      }),
    });
    const data = await response.json();

    return data.data;
  } catch (err) {
    console.error(err);
  }
};

export default addPost;
