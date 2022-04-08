let cPrev = -1;
const user = localStorage.getItem("username");
console.log(typeof user);

confirmLogout = () => {
  Swal.fire({
    title: "User Logout",
    text: "Are you sure you want to logout?",
    icon: "warning",
    showCancelButton: true,
    cancelButtonColor: "#dc3546",
    confirmButtonColor: "#27a844",
    confirmButtonText: "Yes, I want to logout",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.setItem("username", "");
      window.open("../../index.html", "_self");
    }
  });
};
sortTableData = (c) => {
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

  if (c !== cPrev) {
    arrTable.sort(function (a, b) {
      if (a[c] === b[c]) {
        return 0;
      } else {
        return a[c] < b[c] ? -1 : 1;
      }
    });
  } else {
    arrTable.reverse();
  }

  cPrev = c;
  arrTable.unshift(th);

  for (ro = 0; ro < rows; ro++) {
    for (co = 0; co < columns; co++) {
      document.getElementById("taskTable").rows[ro].cells[co].innerHTML =
        arrTable[ro][co];
    }
  }
};

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
    // show all rows first
    dataset.show();
    // filter the rows that should be hidden
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

var taskObj = {
  key: "tags",

  deleteTag: function (self) {
    if (self.tag.value == "") {
      swal("Please select a tag to delete");
      return false;
    }
    swal({
      title: "Are you sure?",
      text: "Deleting the tag will also delete the tasks associated with it",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((deleteTag) => {
      if (deleteTag) {
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

  addTag: function () {
    if (document.getElementById("add-tag").value == "") {
      swal("Please enter tag name");
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

  getAllTags: function () {
    if (localStorage.getItem(this.key) == null) {
      localStorage.setItem(this.key, "[]");
    }
    return JSON.parse(localStorage.getItem(this.key));
  },
  loadAllTags: function () {
    var tags = taskObj.getAllTags();
    tags = tags.reverse();
    var html = `<option value='' class="selection">Select Tag</option>`;
    for (var a = 0; a < tags.length; a++) {
      html +=
        "<option value='" + tags[a].id + "'>" + tags[a].name + "</option>";
    }
    document.getElementById("add-task-tag").innerHTML = html;
    document.getElementById("form-task-hour-calculator-all-tags").innerHTML =
      html;
  },
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
    // computedTaskDuration = endDate.getTime() - startDate.getTime();
    // console.log(computedTaskDuration);
    console.log(taskDuration);
    for (let a = 0; a < tags.length; a++) {
      if (tags[a].id == tag) {
        let taskObj = {
          id: tags[a].tasks.length,
          name: task,
          status: isTaskCompleted ? "Completed" : "Not Started",
          isStarted: false,
          duration: isTaskCompleted ? taskDuration : "",
          logs: [],
          started:
            startDate != ""
              ? startDate
              : this.getCurrentTimeInTaskStartEndFormat(),
          ended: endDate != "" ? endDate : "",
        };
        tags[a].tasks.push(taskObj);
        break;
      }
    }
    localStorage.setItem(this.key, JSON.stringify(tags));
    jQuery("#addTaskModal").modal("hide");
    jQuery(".modal-backdrop").remove();
    this.showAllTasks();
    return false;
  },
  getCurrentTimeInTaskStartEndFormat() {
    let current_datetime = new Date();
    var date = current_datetime.getDate();
    date = date < 10 ? "0" + date : date;
    var month = current_datetime.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    var hours = current_datetime.getHours();
    hours = hours < 10 ? "0" + hours : hours;
    var minutes = current_datetime.getMinutes();
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var seconds = current_datetime.getSeconds();
    seconds = seconds < 10 ? "0" + seconds : seconds;
    let formatted_date =
      current_datetime.getFullYear() +
      "-" +
      month +
      "-" +
      date +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds;
    return formatted_date;
  },
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
        var hours = Math.floor(duration / 3600) % 24;
        hours = hours < 10 ? "0" + hours : hours;
        var minutes = Math.floor(duration / 60) % 60;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        var seconds = duration % 60;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        if (tags[a].tasks[b].isStarted) {
          var dataStartedObj = {
            duration: duration,
            tag: tags[a].id,
            task: tags[a].tasks[b].id,
          };
          html +=
            "<td data-started='" +
            JSON.stringify(dataStartedObj) +
            "'>" +
            hours +
            ":" +
            minutes +
            ":" +
            seconds +
            "</td>";
        } else if (
          tags[a].tasks[b].duration != "" &&
          tags[a].tasks[b].status == "Completed"
        ) {
          html += "<td>" + tags[a].tasks[b].duration + "</td>";
        } else {
          html += "<td>" + hours + ":" + minutes + ":" + seconds + "</td>";
        }
        console.log(tags[a].tasks[b].ended);
        if (tags[a].tasks[b].status == "Completed") {
          html += "<td>" + tags[a].tasks[b].started + "</td>";
          html += "<td>" + tags[a].tasks[b].ended + "</td>";
        } else {
          html += "<td>" + tags[a].tasks[b].started + "</td>";
          html += "<td>" + tags[a].tasks[b].ended + "</td>";
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
        html += "<input type='hidden' name='tag' value='" + tags[a].id + "'>";
        html +=
          "<input type='hidden' name='task' value='" +
          tags[a].tasks[b].id +
          "'>";
        html +=
          "<select class='form-control selection' name='status' onchange='taskObj.changeTaskStatus(this);' data-form-id='form-change-task-status-" +
          tags[a].id +
          tags[a].tasks[b].id +
          "'>";
        html += "<option value=''>Update Status</option>";
        if (tags[a].tasks[b].isStarted) {
          html += "<option value='stop'>Stop</option>";
        } else {
          html += "<option value='start'>Start</option>";
        }
        if (tags[a].tasks[b].status == "Paused") {
          html += "<option value='complete'>Mark as Completed</option>";
        } else {
          html += "<option value='progress'>Mark as Started</option>";
          // tags[a].tasks[b].ended = "";
        }
        html += "<option value='edit'>Edit</option>";
        html += "<option value='delete'>Delete</option>";
        html += "</select>";
        html += "</form>";
        html += "</td>";
        html += "</tr>";
      }
    }
    document.getElementById("all-tasks").innerHTML = html;
  },

  editTask: function (form) {
    if (self.value == "") {
      return;
    }
    document.getElementById("editTaskButton").click();
    editedTask = $(this).data("editedTasks");
    console.log(editedTask);
    console.log(form);
  },

  changeTaskStatus: function (self) {
    if (self.value == "") {
      return;
    }
    var formId = self.getAttribute("data-form-id");
    var form = document.getElementById(formId);
    var tags = this.getAllTags();
    for (var a = 0; a < tags.length; a++) {
      if (tags[a].id == form.tag.value) {
        for (var b = 0; b < tags[a].tasks.length; b++) {
          if (tags[a].tasks[b].id == form.task.value) {
            if (self.value == "delete") {
              swal({
                title: "Are you sure?",
                text: "Deleting the task will delete its hours too.",
                icon: "warning",
                buttons: true,
                dangerMode: true,
              }).then((willDelete) => {
                if (willDelete) {
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
              swal({
                title: "Are you sure?",
                text: "This will start the timer.",
                icon: "warning",
                buttons: true,
                dangerMode: true,
              }).then((doStart) => {
                if (doStart) {
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
              swal({
                title: "Are you sure?",
                text: "This will stop the timer.",
                icon: "warning",
                buttons: true,
                dangerMode: true,
              }).then((doStop) => {
                if (doStop) {
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
              swal({
                title: "Are you sure?",
                text: "This will stop the timer.",
                icon: "warning",
                buttons: true,
                dangerMode: true,
              }).then((doEdit) => {
                if (doEdit) {
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
  // document.getElementsByClassName("completed").insertAdjacentHTML(<i class="fa-solid fa-badge-check"></i>)
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
