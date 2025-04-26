import { socket } from "./websocket.js";
import { userStore } from "./user_store.js";

export const GrabCommentData = () => {
  const commentForm = document.querySelector(".comment_form");
  const text = commentForm.querySelector('textarea[name="text"]');

  if (text.value == "") {
    alert("Please write a comment");
    return;
  }

  const data = {
    type: "addcomment",
    userid: userStore.userid,
    postid: userStore.postid,
    text: text.value,
  };
  socket.send(JSON.stringify(data));
};
