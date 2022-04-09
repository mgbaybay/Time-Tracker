//Function to validate user signin
validateUserSignin = () => {
  let users = JSON.parse(localStorage.getItem("users")),
    userName = document.getElementById("userName"),
    userPassword = document.getElementById("userPassword"),
    isLoginSuccessful = false;

  if (userName.value.length == 0 || userPassword.value.length == 0) {
    Swal.fire({
      type: "error",
      title: "Oops...",
      text: "Please input username and password.",
    });
    return;
  } else if (users == null || users.length == 0) {
    Swal.fire({
      type: "error",
      title: "User not found",
    });
    return;
  }

  // Check if user exists from users list
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
      window.open("./assets/src/timesheet.html", "_self");
    });
  } else {
    Swal.fire({
      type: "error",
      title: "Login Error",
      text: "Invalid credentials.",
    });
  }
};

// Function to create new users
// Currently, there is no validation to check if the user already exists.
createUser = () => {
  let name = document.getElementById("name"),
    password = document.getElementById("password"),
    lowerCaseLetters = /[a-z]/g,
    upperCaseLetters = /[A-Z]/g,
    numbers = /[0-9]/g,
    userData = [],
    user = JSON.parse(localStorage.getItem("users")),
    users = [];

  if (user === null || users == "" || users === undefined) {
  } else {
    users.push(user);
  }
  console.log(users);
  // Validations
  if (name.value.length == 0 || password.value.length == 0) {
    Swal.fire({
      type: "error",
      title: "Oops...",
      text: "Please input username and password.",
    });
  } else if (
    !password.value.match(numbers) ||
    !password.value.match(upperCaseLetters) ||
    !password.value.match(lowerCaseLetters)
  ) {
    Swal.fire({
      type: "error",
      title: "Oops...",
      text: "Please use an uppercase letter, a lowercase letter and a number in the password.",
    });
  } else if (password.value != userPasswordConfirmation.value) {
    Swal.fire({
      type: "error",
      title: "Oops...",
      text: "Password confirmation does not match the password set.",
    });
  } else if (name.value.length && password.value.length) {
    userData.push(name.value, password.value);
    console.log(userData);
    users.push(userData);
    console.log(users);
    localStorage.setItem("users", JSON.stringify(users));
    name.value = "";
    password.value = "";
    userPasswordConfirmation.value = "";
    Swal.fire({
      type: "success",
      title: "Account created!",
      text: "You will be redirected to login page.",
    }).then(() => {
      window.open("../../index.html", "_self");
    });
  }
};
