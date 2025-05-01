

'use server'

import { cookies } from 'next/headers'

const setPravicy = async (state: boolean) => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || ''

    const response = await fetch("http://localhost:8080/setPrivacy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        state: state,
        session: token
      }),
    });
    
    const data = await response.json();

    if (data.error == "Invalid session") {
        cookieStore.delete('token');
    }
    
    console.log(data)
    return data;
  } catch (err) {
    console.error(err);
  }
};

export default setPravicy