export let userStore={
  userid: "",
  username: "",
  postid: "",
  allusers: "",
  totalnotifications: "",
  partnerid: "",
  chosen_one: ""
}
export const fillStore=(data)=>{
  userStore.userid = data.userid
  userStore.username = data.username
  userStore.allusers = data.allusers
  userStore.totalnotifications = data.totalnotifications
}
