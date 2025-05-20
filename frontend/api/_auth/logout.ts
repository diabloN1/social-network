'use server'

import { cookies } from 'next/headers'

const logout = async () => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || ''

    const response = await fetch("http://localhost:8080/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session: token }),
    });
    const data = await response.json();

    cookieStore.delete('token');
    console.log(data);
    return data;
  } catch (err) {
    console.error(err);
  }
};

export default logout