
const createGroup = async (formData: {
  title: string;
  description: string;
  image: string;
}) => {
  try {

    const response = await fetch("http://localhost:8080/createGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "create-group", data: formData }),
      credentials: "include",
    });
    const data = await response.json();
    console.log("createGroup response:", data);
    if (data.error) {
      throw new Error(data.error);
    }
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

export default createGroup;
