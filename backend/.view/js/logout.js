import { socket } from "./websocket.js";
import { GetCookieValueByKey } from "./websocket.js";

export const handleLogout = () => {
  const logoutButton = document.querySelector("[data-logoutbutton]");
  logoutButton.addEventListener("click", (event) => {
    event.preventDefault();
    Logout();
  });
};

const Logout = () => {
  const data = {
    type: "logout",
    session: GetCookieValueByKey("session"),
  };
  document.cookie =
    "session=" +
    GetCookieValueByKey(data.session) +
    "; expires=" +
    "Thu, 01 Jan 1970 00:00:00 UTC";
  document.querySelector(".container").classList.remove("active");
  socket.send(JSON.stringify(data));
};
