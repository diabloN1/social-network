const addGroupPost = async (formData: {
    image: string;
    caption: string;
    groupId?: number;
  }) => {
  try {
    const response = await fetch("http://localhost:8080/addGroupPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({type: "add-group-post", data: formData}),
      credentials: "include",
    });
    const data = await response.json();


    console.log("addGroupPost response:", data);
    if (data.error) {
      throw new Error(data.error);
    }
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

export default addGroupPost