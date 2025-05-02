import { ShowChat, RemoveChat } from "./chat.js";
import { userStore } from "./user_store.js";

const menu = document.createElement("div");
menu.id = "menu_bar";

const pageWrapper = document.querySelector(".page_wrapper");

const logoutButton = document.createElement("button");
logoutButton.classList.add("top_btn");
logoutButton.setAttribute("data-logoutButton", "");
logoutButton.innerHTML = `<i class="fas fa-sign-out-alt"></i>`;

const profileButton = document.createElement("button");
profileButton.classList.add("top_btn");
profileButton.setAttribute("id", "profile");

const chatButton = document.createElement("button");
chatButton.id = "chat_btn";
chatButton.classList.add("top_btn");
chatButton.innerHTML = `<i class="fas fa-comments"></i>`;
chatButton.addEventListener("click", () => {
  const chatBox = document.getElementById("chat_box");
  if (chatBox == null || chatBox.classList.contains("hide")) {
    ShowChat();
  } else {
    RemoveChat();
  }
});

export const AddMenu = (username) => {
  const notificationBulb = document.createElement("mark");
  if (userStore.totalnotifications > 0) {
    notificationBulb.classList.add("notification");
    notificationBulb.setAttribute("data-notification", "");
    notificationBulb.innerText = userStore.totalnotifications;
  }
  chatButton.appendChild(notificationBulb);

  const div = document.createElement("div");
  div.style.display = "flex";
  div.style.gap = "5px";
  div.appendChild(logoutButton);
  div.appendChild(chatButton);

  profileButton.innerText = username;
  menu.appendChild(profileButton);
  menu.appendChild(div);
  pageWrapper.appendChild(menu);
};
export const RemoveMenu = () => {
  menu.remove();
};

export const UpdateNotifications = () => {
  let notificationBulb = document.querySelector("[data-notification]");
  if (notificationBulb != null) {
    notificationBulb.remove();
  }
  if (userStore.totalnotifications > 0) {
    notificationBulb = document.createElement("mark");
    notificationBulb.classList.add("notification");
    notificationBulb.innerText = userStore.totalnotifications;
    notificationBulb.setAttribute("data-notification", "");
    chatButton.appendChild(notificationBulb);
  }
};
