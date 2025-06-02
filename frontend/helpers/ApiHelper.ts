// import { useError } from "@/context/ErrorContext";

// export const useGlobloalAPIHelper = () => {
//   const { showError } = useError();

//   const apiCall = async (requestData: any, method: string, url: string) => {
//     try {
//       const response = await fetch(`http://localhost:8080/${url}`, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify(requestData),
//       });

//       const data = await response.json();

//       if (data.error) {
//         showError(data.error.cause || "Unknown error", data.error.code);
//         return null;
//       }

//       return data.data;
//     } catch (err: any) {
//       console.error("API Error:", err);
//       showError(err.message || "Unexpected error", 500);
//       return null;
//     }
//   };

//   return { apiCall };
// };
