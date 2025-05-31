'use server'

import { cookies } from 'next/headers'

const createGroup = async (formData: {
    title: string;
    description: string;
    image: string;
    session?: string;
  }) => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || ''

    formData['session'] = token

    const response = await fetch("http://localhost:8080/createGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();

    // console.log(data);

    if (data.error == "Invalid session") {
        cookieStore.delete('token');
    }
    return data;
  } catch (err) {
    console.error(err);
  }
};

export default createGroup