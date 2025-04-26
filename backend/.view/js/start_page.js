import { socket } from "./websocket.js";
import { GetCookieValueByKey } from "./websocket.js";

import { handleForm } from "./form.js";

import { handleRegister } from "./register.js";
import { handleLogin } from "./login.js";

import { handleLogout } from "./logout.js";

import { UpdateContent, RemoveContent } from "./content.js";
import { SetChosenUser, UpdateUsers, RemoveUsers } from "./users.js";
import { AddMenu, RemoveMenu } from "./menu.js";
import { RemoveChat } from "./chat.js";

import { userStore, fillStore } from "./user_store.js";
import { ShowPost } from "./content.js";
import { findPostById } from "./post.js";
import { LoadFirstMessages, LoadMoreMessages } from "./messages.js";
import { UpdateNotifications } from "./menu.js";
import { AddNewMessage, UpdateSeenMessage } from "./messages.js";

const container = document.querySelector(".container");
const errLogOutput = document.querySelector("[data-loginput]");
const errRegOutput = document.querySelector("[data-reginput]");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.session) {
    // Session expires after 7 days
    const date = new Date();
    date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();

    document.cookie = "session=" + data.session + "; expires=" + expires;
  }

  switch (data.type) {
    case "session":
      if (GetCookieValueByKey("session")) {
        fillStore(data);
        container.classList.add("hidden");
        UpdateContent(data.categories);
        AddMenu(data.username);
        UpdateUsers();
        handleLogout();
      }
      break;
    case "login":
      if (data.error) {
        errLogOutput.style.display = "block";
        errLogOutput.innerText = data.error;
        return;
      }
      errLogOutput.innerText = "";
      errRegOutput.innerText = "";
      fillStore(data);
      container.classList.add("hidden");
      UpdateContent(data.categories);
      AddMenu(data.username);
      UpdateUsers();
      handleLogout();
      break;
    case "register":
      if (data.error) {
        errRegOutput.style.display = "block";
        errRegOutput.innerText = data.error;
        return;
      }
      errLogOutput.innerText = "";
      errRegOutput.innerText = "";
      fillStore(data);
      container.classList.remove("active");
      container.classList.add("hidden");
      UpdateContent(data.categories);
      AddMenu(data.username);
      UpdateUsers();
      handleLogout();
      break;
    case "online":
      userStore.allusers = data.allusers;
      UpdateUsers();
      SetChosenUser();
      break;
    case "logout":
      console.log(data);
      fillStore(data);
      container.classList.remove("hidden");
      RemoveContent();
      RemoveUsers();
      RemoveChat(true);
      RemoveMenu();
      break;
    case "categories":
      if (data.error) {
        alert(data.error);
        return;
      }

      if (userStore.postid == "") {
        UpdateContent(data.categories);
      }
    case "updatecomments":
      if (data.error) {
        alert(data.error);
        return;
      }

      if (userStore.postid == data.postid) {
        ShowPost(data.categories, findPostById(data.categories, data.postid));
      }
      break;
    case "loadfirstmessages":
      userStore.userid = data.userid;
      userStore.allusers = data.allusers;
      userStore.partnerid = data.partnerid;
      userStore.totalnotifications = data.totalnotifications;
      console.log(data);
      UpdateNotifications();
      LoadFirstMessages(data);
      break;
    case "loadmoremssages":
      userStore.allusers = data.allusers;
      userStore.totalnotifications = data.totalnotifications;
      UpdateNotifications();
      LoadMoreMessages(data.messages);
      break;
    case "newmessage":
      console.log(data);
      if (data.error) {
        alert(data.error);
        return;
      }

      userStore.totalnotifications = data.totalnotifications;
      if (userStore.partnerid == data.message.sender_id) {
        UpdateSeenMessage(data.message);
        AddNewMessage(data.message);
      }
      if (userStore.userid == data.message.recipient_id) {
        if (userStore.partnerid != data.message.sender_id) {
          UpdateNotifications();
        }
      }
      if (
        userStore.userid == data.message.sender_id &&
        userStore.partnerid == data.message.recipient_id
      ) {
        AddNewMessage(data.message);
      }
      break;
    case "updatetotal":
      userStore.totalnotifications = data.totalnotifications;
      UpdateNotifications();
      break;
    case "updatetyping":
      userStore.totalnotifications = data.totalnotifications;
      const isTypingElement = document.getElementById(data.username);
      if (!isTypingElement) {
        return;
      }

      if (data.data === "true") {
        isTypingElement.style.display = "block";

        if (!isTypingElement.querySelector(".typing-animation")) {
          const typingAnimation = document.createElement("div");
          typingAnimation.className = "typing-animation";
          typingAnimation.innerHTML =
            "<span>.</span><span>.</span><span>.</span>";
          isTypingElement.innerHTML = "";  
          isTypingElement.appendChild(typingAnimation);
        }
      } else {
        isTypingElement.style.display = "none";
      }
      break;
  }
};

handleForm();
handleRegister();
handleLogin();
