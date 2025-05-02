import { GrabPostData } from "./post.js";
import { GrabCommentData } from "./comment.js";
import { userStore } from "./user_store.js";

const pageWrapper = document.querySelector(".page_wrapper");

export const UpdateContent = (categories) => {
  userStore.postid = "";
  RemoveContent();
  const content = document.createElement("div");
  content.id = "content";
  pageWrapper.appendChild(content);

  AddPostForm(categories);

  for (let i = 0; i < categories.length; i++) {
    let category = document.createElement("div");
    category.classList.add("category");
    category.innerText = categories[i].category;

    for (let j = 0; j < categories[i].posts.length; j++) {
      let post = document.createElement("div");
      post.classList.add("post");
      post.innerText = categories[i].posts[j].title;

      let userInfo = document.createElement("div");
      userInfo.classList.add("user_info");
      post.appendChild(userInfo);

      let author = document.createElement("div");
      author.classList.add("author");
      author.innerText = `Author: ${categories[i].posts[j].author}`;
      userInfo.appendChild(author);

      let postDate = document.createElement("div");
      postDate.classList.add("post_date");
      postDate.innerText = `Date: ${categories[i].posts[j].creation_date}`;
      userInfo.appendChild(postDate);

      category.appendChild(post);
      post.addEventListener("click", () => {
        ShowPost(categories, categories[i].posts[j]);
      });
    }
    content.appendChild(category);
  }
};

const AddPostForm = (categories) => {
  const content = document.querySelector("#content");

  let form = document.createElement("form");

  let addPostBlock = document.createElement("div");
  addPostBlock.classList.add("add_post_block");
  form.appendChild(addPostBlock);

  let input = document.createElement("input");
  input.name = "title";
  input.setAttribute("required", "");
  input.setAttribute("minlength", "2");
  input.setAttribute("maxlength", "50");
  input.setAttribute("placeholder", "Title");
  addPostBlock.appendChild(input);

  let select = document.createElement("select");
  select.id = "category_select";
  select.name = "category";
  select.setAttribute("required", "");
  let options = ["Choose a category"];

  for (let i = 0; i < categories.length; i++) {
    options.push(categories[i].category);
  }

  for (let i = 0; i < options.length; i++) {
    let option = document.createElement("option");

    if (i === 0) {
      option.setAttribute("value", "");
      option.setAttribute("selected", "selected");
      option.setAttribute("required", "");
    }

    option.innerText = options[i];
    select.appendChild(option);
  }

  addPostBlock.appendChild(select);

  let textarea = document.createElement("textarea");
  textarea.setAttribute("required", "");
  textarea.setAttribute("minlength", "5");
  textarea.setAttribute("maxlength", "1000");
  textarea.name = "text";
  textarea.setAttribute("placeholder", "Write your text here");
  textarea.setAttribute("rows", "3");
  textarea.setAttribute("cols", "33");
  addPostBlock.appendChild(textarea);

  let button = document.createElement("button");
  button.innerText = "Add Post";
  button.name = "addpost";
  button.setAttribute("data-postButton", "");

  button.addEventListener("click", (event) => {
    event.preventDefault();
    GrabPostData();
  });

  addPostBlock.appendChild(button);

  let postErr = document.createElement("div");
  addPostBlock.appendChild(postErr);

  content.appendChild(form);
};

export const RemoveContent = () => {
  const content = document.querySelector("#content");
  if (content != null) {
    content.remove();
  }
};

export const ShowPost = (categories, post) => {
  if (post == undefined) {
    return;
  }
  userStore.postid = post.id;
  RemoveContent();

  const content = document.createElement("div");
  content.id = "content";

  const button = document.createElement("button");
  button.classList.add("quit_post");
  button.innerText = "Back";
  content.appendChild(button);
  button.addEventListener("click", () => {
    UpdateContent(categories);
  });

  const postTitle = document.createElement("div");
  postTitle.classList.add("post_title");
  postTitle.innerText = post.title;

  let userInfo = document.createElement("div");
  userInfo.classList.add("user_info");
  postTitle.appendChild(userInfo);

  let author = document.createElement("div");
  author.classList.add("author");
  author.innerText = `Author: ${post.author}`;
  userInfo.appendChild(author);

  let postDate = document.createElement("div");
  postDate.classList.add("post_date");
  postDate.innerText = post.creation_date;
  userInfo.appendChild(postDate);

  content.appendChild(postTitle);

  const postText = document.createElement("div");
  postText.classList.add("post_text");
  postText.innerText = post.text;
  content.appendChild(postText);

  for (let i = post.comments.length - 1; i >= 0; i--) {
    const comment = document.createElement("div");
    comment.classList.add("comment");
    comment.innerText = post.comments[i].text;

    let userInfo = document.createElement("div");
    userInfo.classList.add("user_info");
    comment.appendChild(userInfo);

    let author = document.createElement("div");
    author.classList.add("author");
    author.innerText = `Author: ${post.comments[i].author}`;
    userInfo.appendChild(author);

    let postDate = document.createElement("div");
    postDate.classList.add("post_date");
    postDate.innerText = `Date: ${post.comments[i].creation_date}`;
    userInfo.appendChild(postDate);

    content.appendChild(comment);
  }

  const form = document.createElement("form");

  const commentForm = document.createElement("div");
  commentForm.classList.add("comment_form");
  form.appendChild(commentForm);

  let textarea = document.createElement("textarea");
  textarea.setAttribute("required", "");
  textarea.setAttribute("minlength", "5");
  textarea.setAttribute("maxlength", "1000");
  textarea.setAttribute("placeholder", "Write your text here");
  textarea.setAttribute("rows", "3");
  textarea.setAttribute("cols", "33");
  textarea.name = "text";
  commentForm.appendChild(textarea);

  const buttonAddComment = document.createElement("button");
  buttonAddComment.classList.add("add_comment_btn");
  buttonAddComment.innerText = "Add Comment";
  buttonAddComment.addEventListener("click", (event) => {
    event.preventDefault();
    GrabCommentData();
  });
  commentForm.appendChild(buttonAddComment);

  const commentErr = document.createElement("div");
  commentForm.appendChild(commentErr);

  content.appendChild(form);

  pageWrapper.appendChild(content);
};
