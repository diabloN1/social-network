import { socket } from "./websocket.js";

export const handleLogin = () => {
  const logButton = document.querySelector("[data-loginButton]");
  logButton.addEventListener("click", (event) => {
    event.preventDefault();
    GrabLoginData();
  });
};

const GrabLoginData = () => {
  const loginForm = document.querySelector("[data-login]");
  const username = loginForm.querySelector('input[name="username"]');
  const password = loginForm.querySelector('input[name="password"]');
  if (username.value === "" || password.value === "") {
    const errOutput = document.querySelector("[data-loginput]");
    errOutput.style.display = 'block'
    errOutput.innerText = "Please fill in all the required fields";
    return;
  }

  const data = {
    type: "login",
    nickname: username.value,
    password: password.value,
  };
  socket.send(JSON.stringify(data));
};
