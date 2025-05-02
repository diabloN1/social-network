import { socket } from "./websocket.js";
import { userStore } from "./user_store.js";
export const GrabPostData = () => {
  const postForm = document.querySelector(".add_post_block");

  const title = postForm.querySelector('input[name="title"]');
  const text = postForm.querySelector('textarea[name="text"]');
  const category = postForm.querySelector('select[name="category"]');

  if (category.value == "" || title.value == "" || text.value == "") {
    alert("Please fill in all the required fields");
    return;
  }

  const data = {
    type: "addpost",
    userid: userStore.userid,
    title: title.value,
    text: text.value,
    category: category.value,
  };
  socket.send(JSON.stringify(data));
};

export const findPostById = (categories, postid) => {
  for (let i = 0; i < categories.length; i++) {
    for (let j = 0; j < categories[i].posts.length; j++) {
      if (categories[i].posts[j].id == postid) {
        return categories[i].posts[j];
      }
    }
  }
};
