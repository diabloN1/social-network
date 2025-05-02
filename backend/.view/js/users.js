import { userStore } from "./user_store.js";
import { socket } from "./websocket.js";

export const UpdateUsers = () => {
  const chatBox = document.getElementById("chat_box");
  if (userStore.allusers.length == null || chatBox == null) {
    return;
  }
  const usersList = document.querySelector(".user_list");

  RemoveUsers();
  const users = document.createElement("div");
  users.id = "users";
  usersList.appendChild(users);

  for (let i = 0; i < userStore.allusers.length; i++) {
    if (userStore.username != userStore.allusers[i].username) {
      const user = document.createElement("div");
      user.innerHTML =
        userStore.allusers[i].username +
        "<br/><div id=" +
        userStore.allusers[i].username +
        ' style="display: none;">&#128221;</div>';
      user.classList.add("user");

      if (userStore.chosen_one === userStore.allusers[i].username) {
        user.classList.add("chosen_one");
      }

      const notificationBulb = document.createElement("mark");
      if (userStore.allusers[i].totalnotifications > 0) {
        notificationBulb.classList.add("notification_user");
        notificationBulb.innerText = userStore.allusers[i].totalnotifications;
        user.appendChild(notificationBulb);
      }

      if (userStore.allusers[i].online == true) {
        user.classList.add("online_user");
      }
      user.addEventListener("click", () => {
        document.getElementById("message_input").removeAttribute("disabled");

        const allUsers = document.querySelectorAll(".user");
        allUsers.forEach((u) => u.classList.remove("chosen_one"));

        user.classList.add("chosen_one");

        userStore.chosen_one = userStore.allusers[i].username;
        userStore.partnerid = userStore.allusers[i].id;
        GetPartnerMessages(userStore.allusers[i]);
        document.getElementById("message_input").value = "";
      });
      users.appendChild(user);
    }
  }
};

const GetPartnerMessages = (partner) => {
  const data = {
    type: "getmessages",
    userid: userStore.userid,
    recipientid: userStore.userid,
    senderid: partner.id,
  };
  socket.send(JSON.stringify(data));
};

export const RemoveUsers = () => {
  const usersList = document.getElementById("users");
  if (usersList != null) {
    usersList.remove();
  }
};

export const SetChosenUser = () => {
  const users = document.querySelector("#users");
  if (users == null) {
    return;
  }
  for (let i = 0; i < users.children.length; i++) {
    if (users.children[i].innerText == userStore.chosen_one) {
      users.children[i].classList.add("chosen_one");
    }
  }
};
