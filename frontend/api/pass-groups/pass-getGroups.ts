
const getGroups = async () => {
  try {
    const response = await fetch("http://localhost:8080/getGroups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "get-groups" }),
      credentials: "include",
    });
    const data = await response.json();

    console.log("getGroups response:", data);
    if (data.error) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (err) {
    console.error(err);
  }
};

export default getGroups;
