import { socket } from "./websocket.js";

export const handleRegister = () => {
  const regButton = document.querySelector("[data-registerButton]");
  regButton.addEventListener("click", (event) => {
    event.preventDefault();
    GrabRegisterData();
  });
};

const GrabRegisterData = () => {
  const registerForm = document.querySelector("[data-register]");
  const firstname = registerForm.querySelector('input[name="firstname"]');
  const lastname = registerForm.querySelector('input[name="lastname"]');
  const birth = registerForm.querySelector('input[name="birth"]');
  const gender = registerForm.querySelector('select[name="gender"]');
  const username = registerForm.querySelector('input[name="username"]');
  const email = registerForm.querySelector('input[name="email"]');
  const password = registerForm.querySelector('input[name="password"]');
  const repeatpassword = registerForm.querySelector(
    'input[name="repeatpassword"]'
  );

  const errOutput = document.querySelector("[data-reginput]");
  errOutput.innerText = "";
  if (
    firstname.value === "" ||
    lastname.value === "" ||
    birth.value === "" ||
    gender.value === "" ||
    username.value === "" ||
    email.value === "" ||
    password.value === "" ||
    repeatpassword.value === ""
  ) {
    errOutput.innerText = "Please fill in all the required fields";
  } else if (!CheckFirstnameLength(firstname.value)) {
    errOutput.innerText = "Firstname should be at least 2 characters long";
  } else if (!CheckLastnameLength(lastname.value)) {
    errOutput.innerText = "Lastname should be at least 2 characters long";
  } else if (!CheckUsernameLength(username.value)) {
    errOutput.innerText = "Username should be at least 4 characters long";
  } else if (!CheckAge(birth.value)) {
    errOutput.innerText = "You need to be older. Sorry!";
  } else if (!CheckEmail(email.value)) {
    errOutput.innerText = "You need to enter VALID email!";
  } else if (!CheckPasswordLength(password.value)) {
    errOutput.innerText =
      "Your password length should be at least 6 characters long";
  } else if (!CheckPasswordLength(repeatpassword.value)) {
    errOutput.innerText =
      "Your password length should be at least 6 characters long";
  } else if (CheckPasswordsMismatch(password.value, repeatpassword.value)) {
    errOutput.innerText = "Passwords mismatch!";
  }

  if (errOutput.innerText) {
    errOutput.style.display = "block";
    return;
  }

  const data = {
    type: "register",
    nickname: username.value,
    firstname: firstname.value,
    lastname: lastname.value,
    birth: birth.value,
    email: email.value,
    password: password.value,
  };
  socket.send(JSON.stringify(data));
};

const CheckFirstnameLength = (firstname) =>
  firstname.length >= 2 ? true : false;
const CheckLastnameLength = (lastname) => (lastname.length >= 2 ? true : false);
const CheckUsernameLength = (username) => (username.length >= 4 ? true : false);
const CheckPasswordLength = (password) => (password.length >= 6 ? true : false);
const CheckPasswordsMismatch = (password, repeatpassword) =>
  password != repeatpassword ? true : false;

const CheckAge = (age) => {
  const age_should = "01/01/2020";
  let date1 = new Date(age).getTime();
  let date2 = new Date(age_should).getTime();
  if (date1 <= date2) {
    return true;
  }
  return false;
};

const CheckEmail = (email) => {
  const emailRegex = new RegExp(
    /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/,
    "gm"
  );
  return emailRegex.test(email);
};
