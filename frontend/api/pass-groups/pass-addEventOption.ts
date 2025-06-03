const addEventOption = async (groupId: number, eventId: number, option: boolean) => {
  try {
    const response = await fetch("http://localhost:8080/addEventOption", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({type: "add-event-option", data:{
        groupId,
        eventId,
        option,
      }}),
      credentials: "include",
    });
    const data = await response.json();
    console.log("addEventOption response:", data);

    if (data.error) {
      throw new Error(data.error);
    }
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

export default addEventOption;
