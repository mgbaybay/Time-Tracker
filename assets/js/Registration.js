validateUserSignin = () => {
  let users = JSON.parse(localStorage.getItem("users")),
    userName = document.getElementById("userName"),
    userPassword = document.getElementById("userPassword"),
    isLoginSuccessful = false;

  if (userName.value.length == 0 || userPassword.value.length == 0) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please input username and password.",
    });
  } else if (users == null || users.length == 0) {
    Swal.fire({
      icon: "error",
      title: "User not found",
    });
  }

  for (let i = 0; i < users.length; i++) {
    if (users[i][0] == userName.value && users[i][1] == userPassword.value) {
      isLoginSuccessful = true;
      break;
    } else {
      isLoginSuccessful = false;
    }
  }

  if (isLoginSuccessful) {
    Swal.fire({
      title: "Login Successful!",
      text: "Redirecting...",
      width: 600,
      padding: "3em",
      color: "#716add",
      backdrop: `
        rgba(0,0,123,0.4)
        url("https://c.tenor.com/-AyTtMgs2mMAAAAj/nyan-cat-nyan.gif")
        left top
        no-repeat
      `,
    }).then(() => {
      localStorage.setItem("username", userName.value);
      window.open("/assets/src/timesheet.html", "_self");
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Login Error",
      text: "Invalid credentials.",
    });
  }
};

createUser = () => {
  let name = document.getElementById("name"),
    password = document.getElementById("password"),
    lowerCaseLetters = /[a-z]/g,
    upperCaseLetters = /[A-Z]/g,
    numbers = /[0-9]/g,
    userData = [],
    user = JSON.parse(localStorage.getItem("users")),
    users = [];

  if (user != null) {
    users.push(user);
  }
  if (name.value.length == 0 || password.value.length == 0) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please input username and password.",
    });
  } else if (
    !password.value.match(numbers) ||
    !password.value.match(upperCaseLetters) ||
    !password.value.match(lowerCaseLetters)
  ) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please use an uppercase letter, a lowercase letter and a number in the password.",
    });
  } else {
    userData.push(name.value, password.value);
    users.push(userData);
    localStorage.setItem("users", JSON.stringify(users));
    name.value = "";
    password.value = "";
    userPasswordConfirmation.value = "";
    Swal.fire({
      icon: "success",
      title: "Account created!",
      text: "You will be redirected to login page.",
    }).then(() => {
      window.open("../../index.html", "_self");
    });
  }
};
