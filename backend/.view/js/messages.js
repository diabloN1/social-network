import { socket } from "./websocket.js";
import { userStore } from "./user_store.js";

export const LoadFirstMessages = (data) => {
  ClearChat();
  let chat = document.querySelector("[data-chat]");
  if (chat != null) {
    chat.remove();
  }
  chat = document.createElement("div");
  chat.classList.add("chat_messages");
  chat.setAttribute("data-chat", "");

  const chatting = document.querySelector(".chatting");
  chatting.prepend(chat);

  chat.addEventListener("scroll", debounce(ScrollChat, 500));

  for (let i = 0; i < data.messages.length; i++) {
    AddNewMessage(data.messages[i]);
  }

};

export const LoadMoreMessages = (messages) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    AddNewIncomingMessage(messages[i]);
  }
};
const ScrollChat = () => {
  const chat = document.querySelector("[data-chat]");
  const offset = 50;
  if (chat.scrollTop * -1 >= chat.scrollHeight - chat.clientHeight - offset) {
    const data = {
      type: "moremessages",
      senderid: userStore.userid,
      recipientid: userStore.partnerid,
      offset: chat.childNodes.length,
    };
    socket.send(JSON.stringify(data));
  }
};

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};
const ClearChat = () => {
  const chat = document.querySelector("[data-chat]");
  while (chat.firstChild) {
    chat.removeChild(chat.firstChild);
  }
};

export const AddNewMessage = (message) => {
  let chat = document.querySelector("[data-chat]");
  if (chat == null) {
    return;
  }
  let messageBlock = document.createElement("div");
  let chatInfo = document.createElement("div");
  chatInfo.classList.add("chat_info");
  let userName = document.createElement("div");
  userName.classList.add("user_nick");
  let messageDate = document.createElement("div");
  messageDate.classList.add("message_date");

  if (message.recipient_id == userStore.userid) {
    messageBlock.classList.add("user_message");
  } else {
    messageBlock.classList.add("friend_message");
  }
  userName.innerText = message.sender_username;
  messageBlock.innerText = message.text;
  messageDate.innerText = message.creation_date;

  chatInfo.appendChild(messageDate);
  chatInfo.appendChild(userName);

  messageBlock.appendChild(chatInfo);
  chat.insertBefore(messageBlock, chat.firstChild);
};
export const AddNewIncomingMessage = (message) => {
  let chat = document.querySelector("[data-chat]");
  if (chat == null) {
    return;
  }
  let messageBlock = document.createElement("div");
  let chatInfo = document.createElement("div");
  chatInfo.classList.add("chat_info");
  let userName = document.createElement("div");
  userName.classList.add("user_nick");
  let messageDate = document.createElement("div");
  messageDate.classList.add("message_date");

  if (message.recipient_id == userStore.userid) {
    messageBlock.classList.add("user_message");
  } else {
    messageBlock.classList.add("friend_message");
  }
  userName.innerText = message.sender_username;
  messageBlock.innerText = message.text;
  messageDate.innerText = message.creation_date;

  chatInfo.appendChild(messageDate);
  chatInfo.appendChild(userName);

  messageBlock.appendChild(chatInfo);
  chat.append(messageBlock);
};

export const UpdateSeenMessage = (message) => {
  if (userStore.partnerid != "") {
    const data = {
      type: "updateseenmessage",
      userid: userStore.userid,
      partnerid: userStore.partnerid,
      senderid: message.sender_id,
      recipientid: message.recipient_id,
    };
    socket.send(JSON.stringify(data));
  }
};
