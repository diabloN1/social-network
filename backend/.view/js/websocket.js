const socket = new WebSocket("ws://localhost:8080/");
export { socket };

socket.addEventListener("open", () => {
  CheckSession();
});

const CheckSession = () => {
  const session = GetCookieValueByKey("session");

  const data = {
    type: "session",
    session: session,
  };
  socket.send(JSON.stringify(data));
};

export const GetCookieValueByKey = (key) => {
  let elements = document.cookie.split(`; ${key}`);
  elements = elements.pop();
  elements = elements.split(";");
  elements = elements.shift();
  if (elements.split("=").length == 2) {
    return elements.split("=")[1];
  }
  return "";
};
