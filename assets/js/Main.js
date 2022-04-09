let cPrev = -1;
const user = localStorage.getItem("username");

/* Function for user logout
  @params - none
 */
confirmLogout = () => {
  Swal.fire({
    title: "User Logout",
    text: "Are you sure you want to logout?",
    type: "warning",
    showCancelButton: true,
    cancelButtonColor: "#dc3546",
    confirmButtonColor: "#27a844",
    confirmButtonText: "Yes, I want to logout",
  }).then((result) => {
    console.log(result.value);
    if (result.value) {
      console.log("yey");
      localStorage.setItem("username", "");
      window.open("../../index.html", "_self");
    }
  });
};

/* Function for user logout
  @params columnNo - the column number to sort
 */
sortTableData = (columnNo) => {
  rows = document.getElementById("taskTable").rows.length;
  columns = document.getElementById("taskTable").rows[0].cells.length;
  arrTable = [...Array(rows)].map((e) => Array(columns));

  for (ro = 0; ro < rows; ro++) {
    for (co = 0; co < columns; co++) {
      arrTable[ro][co] =
        document.getElementById("taskTable").rows[ro].cells[co].innerHTML;
    }
  }

  th = arrTable.shift();

  if (columnNo !== cPrev) {
    arrTable.sort(function (a, b) {
      if (a[columnNo] === b[columnNo]) {
        return 0;
      } else {
        return a[columnNo] < b[columnNo] ? -1 : 1;
      }
    });
  } else {
    arrTable.reverse();
  }

  cPrev = columnNo;
  arrTable.unshift(th);

  for (ro = 0; ro < rows; ro++) {
    for (co = 0; co < columns; co++) {
      document.getElementById("taskTable").rows[ro].cells[co].innerHTML =
        arrTable[ro][co];
    }
  }
};

/* Function for filtering tags
  @params - none
 */
filterTable = () => {
  $("#form-task-hour-calculator-all-tags").on("click", function () {
    $("table").show();
    var selection = $("#form-task-hour-calculator-all-tags")
      .find(":selected")
      .text();
    if (selection == "Select Tag") {
      location.reload();
      return;
    }
    var dataset = $("#taskTable tbody").find("tr");
    dataset.show();
    dataset
      .filter((index, item) => {
        return (
          $(item)
            .find("td:nth-child(2)")
            .text()
            .split(",")
            .indexOf(selection) === -1
        );
      })
      .hide();
  });
};

/* Date formatter
  @params - none
 */
formatDate = (date) => {
  var taskDate = date.split("T"),
    day,
    time;
  day = taskDate[0];
  time = taskDate[1];
  return `${day} ${time}:00`;
};

/* Task Object
  @key - tags
 */
var taskObj = {
  key: "tags",

  // Delete a tag
  deleteTag: function (self) {
    if (self.tag.value == "") {
      Swal.fire({
        type: "warning",
        text: "Please select a tag to delete",
      });
      return false;
    }
    Swal.fire({
      title: "Are you sure?",
      text: "Deleting the tag will also delete the tasks associated with it",
      type: "warning",
      showCancelButton: true,
      cancelButtonColor: "#dc3546",
      confirmButtonColor: "#27a844",
      confirmButtonText: "Yes, delete the tag",
    }).then((deleteTag) => {
      if (deleteTag.value) {
        var tags = taskObj.getAllTags();
        for (var a = 0; a < tags.length; a++) {
          if (tags[a].id == self.tag.value) {
            tags.splice(a, 1);
            localStorage.setItem(taskObj.key, JSON.stringify(tags));
            taskObj.loadAllTags();
            taskObj.showAllTasks();
            break;
          }
        }
      } else {
        self.tag.value = "";
      }
    });
    return false;
  },

  // Add a tag
  addTag: function () {
    if (document.getElementById("add-tag").value == "") {
      Swal.fire({
        type: "warning",
        text: "Please enter a tag",
      });
      return false;
    }
    var option = "";
    if (localStorage.getItem(this.key) == null) {
      localStorage.setItem(this.key, "[]");
    }
    var data = JSON.parse(localStorage.getItem(this.key));
    var tag = {
      id: data.length,
      name: `#${document.getElementById("add-tag").value}`,
      tasks: [],
    };
    data.push(tag);
    localStorage.setItem(this.key, JSON.stringify(data));
    this.loadAllTags();
    this.showAllTasks();
  },

  // Get all tags
  getAllTags: function () {
    if (localStorage.getItem(this.key) == null) {
      localStorage.setItem(this.key, "[]");
    }
    return JSON.parse(localStorage.getItem(this.key));
  },

  // Load all tags
  loadAllTags: function () {
    var tags = taskObj.getAllTags(),
      html = `<option value='' class="selection">Select Tag</option>`;
    tags = tags.reverse();
    for (var a = 0; a < tags.length; a++) {
      html +=
        "<option value='" + tags[a].id + "'>" + tags[a].name + "</option>";
    }
    document.getElementById("add-task-tag").innerHTML = html;
    document.getElementById("form-task-hour-calculator-all-tags").innerHTML =
      html;
  },

  // Add a task
  addTask: function (form) {
    let tag = form.tag.value,
      task = form.task.value,
      startDate = form.taskStartDate.value,
      endDate = form.taskEndDate.value,
      taskDuration = form.duration.value,
      tags = this.getAllTags(),
      isTaskCompleted =
        taskDuration == "00:00:00" || (startDate == "" && endDate == "")
          ? false
          : true;
    for (let a = 0; a < tags.length; a++) {
      if (tags[a].id == tag) {
        let taskObj = {
          id: tags[a].tasks.length,
          name: task,
          status: isTaskCompleted ? "Completed" : "Not Started",
          isStarted: false,
          duration: taskDuration != "00:00:00" ? taskDuration : "00:00:00",
          logs: [],
          started:
            startDate != ""
              ? formatDate(startDate)
              : this.getCurrentTimeInTaskStartEndFormat(),
          ended: endDate != "" ? formatDate(endDate) : "",
        };
        tags[a].tasks.push(taskObj);
        form.tag.value = "";
        form.task.value = "";
        form.taskStartDate.value = "";
        form.taskEndDate.value = "";
        break;
      }
    }
    localStorage.setItem(this.key, JSON.stringify(tags));
    jQuery("#addTaskModal").modal("hide");
    jQuery(".modal-backdrop").remove();
    this.showAllTasks();
    return false;
  },

  // Get task duration
  getCurrentTimeInTaskStartEndFormat() {
    var current_datetime = new Date(),
      date = current_datetime.getDate(),
      month = current_datetime.getMonth() + 1,
      date = date < 10 ? "0" + date : date,
      hours = current_datetime.getHours(),
      minutes = current_datetime.getMinutes(),
      seconds = current_datetime.getSeconds();

    month = month < 10 ? "0" + month : month;
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    let formatted_date = `${current_datetime.getFullYear()}-${month}-${date} ${hours}:${minutes}:${seconds}`;
    return formatted_date;
  },

  // Show all tasks
  showAllTasks: function () {
    var html = "",
      tags = this.getAllTags();
    for (var a = 0; a < tags.length; a++) {
      tags[a].tasks = tags[a].tasks.reverse();
      for (var b = 0; b < tags[a].tasks.length; b++) {
        html += `<tr class='align-middle'>`;
        html += `<td>${tags[a].tasks[b].name}</td>`;
        html += `<td>${tags[a].name}</td>`;

        var duration = 0;
        for (var c = 0; c < tags[a].tasks[b].logs.length; c++) {
          var log = tags[a].tasks[b].logs[c];
          if (log.endTime > 0) {
            duration += log.endTime - log.startTime;
          }
        }
        duration = Math.abs((duration / 1000).toFixed(0));

        var hours = Math.floor(duration / 3600) % 24,
          minutes = Math.floor(duration / 60) % 60,
          seconds = duration % 60;

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        if (tags[a].tasks[b].isStarted) {
          var dataStartedObj = {
            duration: duration,
            tag: tags[a].id,
            task: tags[a].tasks[b].id,
          };
          html += `<td data-started='
            ${JSON.stringify(dataStartedObj)}'>
            ${hours}:${minutes}:${seconds}</td>`;
        } else if (tags[a].tasks[b].duration != "Completed") {
          html += `<td>${tags[a].tasks[b].duration}</td>`;
        } else {
          html += `<td>${hours}:${minutes}:${seconds}</td>`;
        }

        html += `<td>${tags[a].tasks[b].started}</td>`;
        if (tags[a].tasks[b].status == "Completed") {
          html += `<td>${tags[a].tasks[b].ended}</td>`;
        } else {
          html += `<td></td>`;
        }

        // html += "<td>" + tags[a].tasks[b].endDate + "</td>";
        if (tags[a].tasks[b].isStarted) {
          html += `<td><label class='in-progress'>In Progress</label></td>`;
        } else if (tags[a].tasks[b].status == "Completed") {
          html += `<td><label class='completed'>
            ${tags[a].tasks[b].status}
            </label></td>`;
        } else if (tags[a].tasks[b].status == "Paused") {
          html += `<td><label class='started'>
            ${tags[a].tasks[b].status}
            </label></td>`;
        } else if (tags[a].tasks[b].status == "Not Started") {
          html += `<td><label class='not-started'>
            ${tags[a].tasks[b].status}
            </label></td>`;
        } else {
          html += `<td>${tags[a].tasks[b].status}</td>`;
        }
        html += `<td>${user}</td>`;
        html += `<td>`;
        html +=
          "<form method='POST' id='form-change-task-status-" +
          tags[a].id +
          tags[a].tasks[b].id +
          "'>";
        html += `<input type='hidden' name='tag' value='${tags[a].id}'>`;
        html += `<input type='hidden' name='task' value='
          ${tags[a].tasks[b].id}
          '>`;
        html +=
          "<select class='form-control selection' name='status' onchange='taskObj.changeTaskStatus(this);' data-form-id='form-change-task-status-" +
          tags[a].id +
          tags[a].tasks[b].id +
          "'>";
        html += `<option value=''>Update Status</option>`;
        if (tags[a].tasks[b].isStarted) {
          html += `<option value='stop'>Stop</option>`;
        } else {
          html += `<option value='start'>Start</option>`;
        }
        if (tags[a].tasks[b].status == "Paused") {
          html += `<option value='complete'>Mark as Completed</option>`;
        } else {
          html += `<option value='progress'>Mark as Started</option>`;
        }
        html += `<option value='edit'>Edit</option>`;
        html += `<option value='delete'>Delete</option>`;
        html += `</select>`;
        html += `</form>`;
        html += `</td>`;
        html += `</tr>`;
      }
    }
    document.getElementById("all-tasks").innerHTML = html;
  },

  // Edit a task
  editTask: function (form) {
    if (self.value == "") {
      return;
    }
    document.getElementById("editTaskButton").click();
    editedTask = $(this).data("editedTasks");
    console.log(editedTask);
    console.log(form);
  },

  // Change a task status
  changeTaskStatus: function (self) {
    if (self.value == "") {
      return;
    }
    var formId = self.getAttribute("data-form-id"),
      form = document.getElementById(formId),
      tags = this.getAllTags();
    for (var a = 0; a < tags.length; a++) {
      if (tags[a].id == form.tag.value) {
        for (var b = 0; b < tags[a].tasks.length; b++) {
          if (tags[a].tasks[b].id == form.task.value) {
            if (self.value == "delete") {
              Swal.fire({
                title: "Are you sure?",
                text: "Deleting the task will delete its hours too.",
                type: "warning",
                showCancelButton: true,
                cancelButtonColor: "#dc3546",
                confirmButtonColor: "#27a844",
                confirmButtonText: "Yes, delete the task",
              }).then((willDelete) => {
                if (willDelete.value) {
                  tags[a].tasks.splice(b, 1);
                  localStorage.setItem(this.key, JSON.stringify(tags));
                  this.showAllTasks();
                } else {
                  self.value = "";
                }
              });
            } else if (self.value == "complete") {
              tags[a].tasks[b].status = "Completed";
              tags[a].tasks[b].isStarted = false;
              tags[a].tasks[b].ended =
                this.getCurrentTimeInTaskStartEndFormat();
              for (var c = 0; c < tags[a].tasks[b].logs.length; c++) {
                if (tags[a].tasks[b].logs[c].endTime == 0) {
                  tags[a].tasks[b].logs[c].endTime = new Date().getTime();
                  break;
                }
              }
            } else if (self.value == "progress") {
              tags[a].tasks[b].status = "Paused";
              tags[a].tasks[b].isStarted = false;
              tags[a].tasks[b].ended = "";
            } else if (self.value == "start") {
              Swal.fire({
                title: "Are you sure?",
                text: "This will start the timer.",
                type: "warning",
                showCancelButton: true,
                cancelButtonColor: "#dc3546",
                confirmButtonColor: "#27a844",
                confirmButtonText: "Yes, start the timer",
              }).then((doStart) => {
                if (doStart.value) {
                  tags[a].tasks[b].isStarted = true;
                  var logObj = {
                    id: tags[a].tasks[b].logs.length,
                    startTime: new Date().getTime(),
                    endTime: 0,
                  };
                  tags[a].tasks[b].logs.push(logObj);
                  localStorage.setItem(this.key, JSON.stringify(tags));
                  this.showAllTasks();
                } else {
                  self.value = "";
                }
              });
            } else if (self.value == "stop") {
              Swal.fire({
                title: "Are you sure?",
                text: "This will stop the timer.",
                type: "warning",
                showCancelButton: true,
                cancelButtonColor: "#dc3546",
                confirmButtonColor: "#27a844",
                confirmButtonText: "Yes, stop the timer",
              }).then((doStop) => {
                if (doStop.value) {
                  tags[a].tasks[b].isStarted = false;
                  tags[a].tasks[b].status = "Paused";
                  for (var c = 0; c < tags[a].tasks[b].logs.length; c++) {
                    if (tags[a].tasks[b].logs[c].endTime == 0) {
                      tags[a].tasks[b].logs[c].endTime = new Date().getTime();
                      break;
                    }
                  }
                  localStorage.setItem(this.key, JSON.stringify(tags));
                  this.showAllTasks();
                } else {
                  self.value = "";
                }
              });
            } else if (self.value == "edit") {
              Swal.fire({
                title: "Are you sure?",
                text: "This will stop the timer.",
                type: "warning",
                showCancelButton: true,
                cancelButtonColor: "#dc3546",
                confirmButtonColor: "#27a844",
                confirmButtonText: "Yes, stop the timer",
              }).then((doEdit) => {
                if (doEdit.value) {
                  tags[a].tasks[b].isStarted = false;
                  this.editTask();
                } else {
                  self.value = "";
                }
              });
            }
            break;
          }
        }
        break;
      }
    }

    if (
      self.value != "delete" ||
      self.value != "start" ||
      self.value != "stop"
    ) {
      localStorage.setItem(this.key, JSON.stringify(tags));
      this.showAllTasks();
    }
  },
};

window.addEventListener("load", () => {
  taskObj.loadAllTags();
  taskObj.showAllTasks();
  // Show timer
  setInterval(() => {
    let dataStarted = document.querySelectorAll("td[data-started]");
    for (var i = 0; i < dataStarted.length; i++) {
      var dataStartedObj = dataStarted[i].getAttribute("data-started"),
        dataStartedObj = JSON.parse(dataStartedObj);

      dataStartedObj.duration++;

      let hours = Math.floor(dataStartedObj.duration / 3600) % 24,
        minutes = Math.floor(dataStartedObj.duration / 60) % 60,
        seconds = dataStartedObj.duration % 60,
        tags = taskObj.getAllTags();

      hours = hours < 10 ? "0" + hours : hours;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      dataStarted[i].innerHTML = hours + ":" + minutes + ":" + seconds;

      for (let a = 0; a < tags.length; a++) {
        if (tags[a].id == dataStartedObj.tag) {
          for (let b = 0; b < tags[a].tasks.length; b++) {
            if (tags[a].tasks[b].id == dataStartedObj.task) {
              for (let c = 0; c < tags[a].tasks[b].logs.length; c++) {
                if (c == tags[a].tasks[b].logs.length - 1) {
                  tags[a].tasks[b].logs[c].endTime = new Date().getTime();

                  window.localStorage.setItem(
                    taskObj.key,
                    JSON.stringify(tags)
                  );

                  dataStarted[i].setAttribute(
                    "data-started",
                    JSON.stringify(dataStartedObj)
                  );
                  break;
                }
              }
              break;
            }
          }
          break;
        }
      }
    }
  }, 1000);
});
