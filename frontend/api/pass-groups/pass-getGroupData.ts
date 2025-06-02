
const getGroupData = async (groupId: number) => {
  try {
    const response = await fetch("http://localhost:8080/getGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "get-group-data",
        data: { groupId },
      }),
      credentials: "include",

    });
    const data = await response.json();

    console.log("getGroupData response:", data);
    if (data.error) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (err) {
    console.error(err);
  }
};

export default getGroupData;
