'use server'

let socket: WebSocket | null = null;

export const connectWebSocket = async () => {
  if (socket) return socket;

  socket = new WebSocket("ws://localhost:8080/ws");

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received notification:", data);
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
    socket = null;
  };

  return socket;
};
