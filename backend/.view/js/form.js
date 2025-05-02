export const handleForm = () => {
  const login = document.querySelector(".log_link"),
    regist = document.querySelector(".reg_link"),
    container = document.querySelector(".container");

  login.addEventListener("click", () => {
    container.classList.add("active");
  });

  regist.addEventListener("click", () => {
    container.classList.remove("active");
  });
};
