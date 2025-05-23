"use server";

import { cookies } from "next/headers";


const getUnreadChatCount = async () => {
  try {
   
    
    const cookieStore = await cookies();
    

  
    
    const token = cookieStore.get("token")?.value || "";

   
    
     const response = await fetch("http://localhost:8080/getUnreadMessagesCount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({session: token,}), 
      });

    const data = await response.json();

    console.log("count unreadmessages  ",data);

    if (data.error == "Invalid session") {
      cookieStore.delete("token");
    }
    return data;
  } catch (err) {
    console.error(err);
     return { count: 0 };
  }
};

export default getUnreadChatCount;



