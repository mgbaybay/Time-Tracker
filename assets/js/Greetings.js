window.onload = function getDate() {
  let today = new Date();
  const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
  let day = days[today.getDay()],
    date =
      months[today.getMonth()] +
      " " +
      today.getDate() +
      ", " +
      today.getFullYear(),
    hourTime = today.getHours(),
    greetings = "",
    user = localStorage.getItem("username");

  if (hourTime >= 00 && hourTime <= 10) {
    greetings += "Good Morning";
  } else if (hourTime >= 11 && hourTime <= 18) {
    greetings += "Good Afternoon";
  } else if (hourTime >= 19 && hourTime <= 24) {
    greetings += "Good Evening";
  }

  document.getElementById(
    "dateToday"
  ).value = `${greetings}, ${user}! Today is ${day}, ${date}`;
};
