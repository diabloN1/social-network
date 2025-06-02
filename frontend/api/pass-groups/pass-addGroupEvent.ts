const addGroupEvent = async (formData: {
  title: string;
  description: string;
  option1: string;
  option2: string;
  date: string;
  place: string;
  groupId: number;
}) => {
  try {
    const response = await fetch("http://localhost:8080/addGroupEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({type: "add-group-event", data:formData}),
      credentials: "include",
    });
    const data = await response.json();
    console.log("addGroupEvent response:", data);
    if (data.error) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (err) {
    console.error(err);
  }
};

export default addGroupEvent;
