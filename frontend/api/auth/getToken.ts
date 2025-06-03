"use server";

import { cookies } from "next/headers";

const getToken = async () => {
    const cookieStore = await cookies();
    return cookieStore.get("token")?.value || "";
};

export default getToken;
