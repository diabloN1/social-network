import { UpdateUsers } from "./users.js";
import { socket } from "./websocket.js";
import { userStore } from "./user_store.js";
export const ShowChat = () => {
  if (document.querySelector("#chat_box") != null) {
    return;
  }
  const pageWrapper = document.querySelector(".page_wrapper");
  const chatBox = document.createElement("div");
  chatBox.id = "chat_box";
  chatBox.classList.remove("hide");
  chatBox.classList.add("show");

  const innerChatbox = document.createElement("div");
  innerChatbox.id = "inner_chatbox";
  chatBox.appendChild(innerChatbox);

  const chatting = document.createElement("div");
  chatting.classList.add("chatting");
  innerChatbox.appendChild(chatting);

  const chatMessages = document.createElement("div");
  chatMessages.classList.add("chat_messages");
  chatMessages.setAttribute("data-chat", "");
  chatting.appendChild(chatMessages);

  const inputSlot = document.createElement("div");
  inputSlot.id = "input_slot";
  chatting.appendChild(inputSlot);

  let textarea = document.createElement("textarea");
  textarea.setAttribute("minlength", "1");
  textarea.setAttribute("maxlength", "1000");
  textarea.setAttribute("placeholder", "Write your text here");
  textarea.setAttribute("rows", "3");
  textarea.setAttribute("cols", "33");
  textarea.setAttribute("disabled", "true");
  textarea.name = "text";
  textarea.id = "message_input";
  inputSlot.appendChild(textarea);

  const buttonSendMessage = document.createElement("button");
  buttonSendMessage.classList.add("add_comment_btn");
  buttonSendMessage.innerText = "Send";

  // Is typing logic
  let isTyping = false;
  let setTimeoutId;
  textarea.addEventListener("input", () => {
    if (isTyping) {
      clearTimeout(setTimeoutId);
    } else {
      // Send socket to brodcast start typing
      console.log("userStartedTyping");

      const data = {
        type: "typing",
        text: "true",
        senderid: userStore.userid,
        recipientid: userStore.partnerid,
      };

      socket.send(JSON.stringify(data));
    }
    isTyping = true;
    setTimeoutId = setTimeout(() => {
      // Send socket to brodcast stop typing
      console.log("userStopedTyping");
      isTyping = false;
      const data = {
        type: "typing",
        text: "false",
        senderid: userStore.userid,
        recipientid: userStore.partnerid,
      };

      socket.send(JSON.stringify(data));
    }, 500);
  });

  buttonSendMessage.addEventListener("click", (event) => {
    if (textarea.value != "" && userStore.partnerid != "") {
      const data = {
        type: "sendmessage",
        text: textarea.value,
        senderid: userStore.userid,
        recipientid: userStore.partnerid,
      };
      textarea.value = "";
      socket.send(JSON.stringify(data));
    }
    event.preventDefault();
  });
  inputSlot.appendChild(buttonSendMessage);

  const userList = document.createElement("div");
  userList.classList.add("user_list");
  innerChatbox.appendChild(userList);

  const strongText = document.createElement("strong");
  strongText.id = "user_select";
  strongText.innerText = "List of users";
  userList.appendChild(strongText);

  const innerUsers = document.createElement("div");
  innerUsers.classList.add("inner_users");
  innerUsers.setAttribute("data-userlist", "");
  userList.appendChild(innerUsers);

  chatBox.classList.add("active");
  pageWrapper.appendChild(chatBox);
  UpdateUsers();
};

export const RemoveChat = (islogout) => {
  userStore.partnerid = "";
  userStore.chosen_one = "";
  const chatBox = document.getElementById("chat_box");
  if (chatBox != null) {
    chatBox.classList.remove("show");
    if (islogout) {
      chatBox.remove();
      return;
    }
    chatBox.classList.add("hide");
    setTimeout(() => {
      chatBox.remove();
    }, 700);
  }
};
