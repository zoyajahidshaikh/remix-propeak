import React from "react";
import FormErrors from "./form-errors";
import Tag from "./tag";
import Auth from "../../utils/auth";
import * as taskservice from "../../Services/task/task-service";
import MessageList from "../messages/message-list";
import UploadFile from "../upload-file/upload-file";
import ModalSmall from "../modal-small";
import * as dateUtil from "../../utils/date-util";
import * as validate from "../../common/validate-entitlements";
import cloneDeep from "lodash/cloneDeep";
import * as ObjectId from "../../utils/mongo-objectid";
import * as subtaskservice from "../../Services/subtask/subtask-service";
import config from "../../common/config";
import "../project/project.css";
import AddProjectUser from "./add-project-user";
import Calendar from "../../Components/calendar/calendar";
import { Link } from "react-router-dom";
import "./task.css";

// var sd = '';
// var ed = '';

const labelStyle = {
  fontSize: "small",
};

export default class TaskForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onDeleteAssignUsers = this.onDeleteAssignUsers.bind(this);
    this.getProjectTasks = this.getProjectTasks.bind(this);
    this.addUploadTaskFile = this.addUploadTaskFile.bind(this);
    this.deleteTaskFileById = this.deleteTaskFileById.bind(this);
    this.addTaskMsg = this.addTaskMsg.bind(this);
    this.deleteMessageTask = this.deleteMessageTask.bind(this);
    // this.onSubmitSubtask=this.onSubmitSubtask.bind(this);
    // this.onCancelSubtask = this.onCancelSubtask.bind(this);
    this.handlesubTaskInputChange = this.handlesubTaskInputChange.bind(this);
    this.onSubmitSubtask = this.onSubmitSubtask.bind(this);
    this.onCloseSubtask = this.onCloseSubtask.bind(this);
    this.userDownCount = -1;
  }
  state = {
    task: {
      title: "",
      description: "",
      tag: "",
      status: "new",
      storyPoint: config.minStoryPonit,
      startDate: "",
      endDate: "",
      depId: "",
      taskType: "task",
      priority: "medium",
      hiddenDepId: "",
      // createdOn: '',
      createdBy: "",
      // modifiedOn: '',
      modifiedBy: "",
      userId: "",
      hiddenUserId: "",
      completed: false,
      isDeleted: false,
      sequence: 0,
      category: "",
      allowMultipleUsers: false,
      assignUsers: [],
      selectUsers: "",
      dateOfCompletion: "",
      subtaskId: "",
    },
    editTitle: "",
    projectId: this.props.projectId,
    tasks: this.props.tasks,
    project: this.props.project,
    taskTypes: this.props.context.state.taskTypes,
    taskPriorities: this.props.context.state.taskPriorities,
    pTasks: this.props.pTasks,
    messages: this.props.messages,
    uploadFiles: this.props.uploadFiles,
    formValid: this.props.taskId || this.props.taskParamsId ? true : false,
    descriptionValid: false,
    storyPointValid: false,
    taskTypeValid: false,
    checkMsg: false,
    currentUser: false,
    errMessage: "",
    formErrors: {},
    message: "",
    messagesuccess: "",
    titleCheck: false,
    users: this.props.context.state.users,
    checkValid: false,
    isOpen: false,
    taskId: this.props.taskId,
    dropdownHidden: true,
    projectUsersDropdown: [],
    // userDownCount: -1,
    updatedTime: new Date().getTime(),
    taskParamsId: this.props.taskParamsId,
    projectParamsId: this.props.projectParamsId,
    paramsTasks: [],
    paramsProject: {},
    usersAndGroups: [],
    isAddUserModalOpen: false,
    userNameToId: this.props.context.state.userNameToId,
    user: this.props.context.state.user,
    submitDisabled: false,
  };

  componentDidMount = async () => {
    if (this.state.users.length === 0) {
      this.props.context.actions.setUsers();
    }
    if (this.state.taskTypes.length === 0) {
      this.props.context.actions.setTaskTypes();
    }
    if (this.state.taskPriorities.length === 0) {
      this.props.context.actions.setPriorities();
    }
    this.currentUserCheck();

    if (this.state.taskId) {
      let task = this.state.tasks.filter((t) => {
        return t._id === this.state.taskId;
      });
      task.length > 0 && this.formatTasks(task[0]);
    } else if (this.props.taskParamsId) {
      await this.getProjectTasks();
      await this.getAllProjectTasks();
      let task = this.state.tasks.filter((t) => {
        return t._id === this.state.taskParamsId;
      });
      task.length > 0 && this.formatTasks(task[0]);
    }
    if (this.props.paramsMessages) {
      this.handleTabClick("messages", "messagesTab");
    }
  };

  getAllProjectTasks() {
    let pTasks = [];

    for (var i = 0; i < this.state.tasks.length; i++) {
      pTasks.push({
        id: this.state.tasks[i]._id,
        title: this.state.tasks[i].title,
      });
    }
    pTasks.sort((a, b) => a.title > b.title);
    this.setState({
      pTasks,
      updatedTime: dateUtil.getTime(),
    });
  }

  async getProjectTasks() {
    let { tasks, taskErr } = await taskservice.getProjectTasks(
      this.props.projectParamsId
    );
    if (taskErr) {
      this.setState({
        message: taskErr,
        //updatedTime:dateUtil.getTime()
      });
    } else if (tasks && tasks.data.err) {
      this.setState({
        message: tasks.data.err,
        //updatedTime:dateUtil.getTime()
      });
    } else {
      this.setState({
        tasks: tasks.data.tasks,
        project: tasks.data,
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    //console.log("TaskForm shouldComponentUpdate "+(!(isEqual(this.props, nextProps) && isEqual(this.state, nextState))));
    return true; //!(isEqual(this.props, nextProps) && isEqual(this.state, nextState));
  }

  formatTasks = (task) => {
    if (!task.startDate) {
      task.startDate = undefined;
    } else {
      task.startDate = task.startDate.substr(0, 10);
    }

    if (!task.endDate) {
      task.endDate = undefined;
    } else {
      var date = new Date().toISOString().substr(0, 10);
      task.endDate = task.endDate.substr(0, 10);
      if (date > task.endDate) {
        var checkDate = date > task.endDate;
        task.taskColor = checkDate ? "task-incompleted" : "";
      }
    }
    let pTaskTitle = "";
    let pTask =
      this.state.pTasks &&
      this.state.pTasks.filter((t) => {
        return t.id === task.depId;
      });

    pTaskTitle = pTask && pTask.length > 0 ? pTask[0].title : "";
    task.hiddenDepId = pTaskTitle;
    let accessRights = Auth.get("access");
    let editAll = false;
    editAll = validate.validateEntitlements(
      accessRights,
      this.props.projectId,
      "Task",
      "edit all"
    );
    let getRole = Auth.get("userRole");
    if (getRole === "user" && !editAll) {
      var users = this.state.users.filter((u) => {
        return task.userId === u._id;
      })[0];
      task.hiddenUserId = users && users.name;
    } else {
      if (
        task.userId === undefined ||
        task.userId === null ||
        task.userId === ""
      ) {
        task.hiddenUserId = task.userId;
      } else {
        let userName = "";
        userName =
          this.state.project &&
          this.state.project.projectUsers.filter((u) => {
            return u.userId === task.userId;
          });
        task.hiddenUserId =
          userName && userName.length > 0 ? userName[0].name : "";
      }
    }

    let taskMessages =
      task.messages &&
      task.messages.filter((m) => {
        return m.isDeleted === false;
      });
    taskMessages.sort((a, b) => -a.createdOn.localeCompare(b.createdOn));
    this.props.getMessages && this.props.getMessages(taskMessages);

    let taskUploadFiles = task.uploadFiles.filter((u) => {
      return u.isDeleted === false;
    });
    this.props.getUploadFiles && this.props.getUploadFiles(taskUploadFiles);

    this.setState({
      task: Object.assign({}, task),
      editTitle: task.title,
      titleCheck: true,
      checkMsg: false,
      //updatedTime: dateUtil.getTime()
      messages: taskMessages,
      uploadFiles: taskUploadFiles,
    });
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.taskId !== this.state.taskId) {
      let task = nextProps.tasks.filter((t) => {
        return t._id === nextProps.taskId;
      });
      if (task.length > 0) {
        this.formatTasks(task[0]);
      } else {
        let userRole = Auth.get("userRole");
        let userName = Auth.get("userName");
        let accessRights = Auth.get("access");
        let editAll = false;
        editAll = validate.validateEntitlements(
          accessRights,
          this.props.projectId,
          "Task",
          "edit all"
        );
        let hiddenUserId = "";
        if (userRole !== "user" || editAll === true) {
          hiddenUserId = "";
        } else {
          hiddenUserId = userName;
        }
        this.setState({
          task: {
            title: "",
            description: "",
            tag: "",
            status: "new",
            storyPoint: config.minStoryPonit,
            startDate: "",
            endDate: "",
            depId: "",
            taskType: "task",
            priority: "medium",
            hiddenDepId: "",
            hiddenUserId: hiddenUserId,
            // createdOn: '',
            createdBy: "",
            // modifiedOn: '',
            modifiedBy: "",
            completed: false,
            isDeleted: false,
            allowMultipleUsers: false,
            assignUsers: [],
            selectUsers: "",
            // selectGroups: '',
            //assignUserGroups: [],
            dateOfCompletion: "",
            subtaskId: "",
          },
          titleCheck: false,
          checkMsg: false,
        });
      }
    }
    this.setState({
      users: nextProps.context.state.users,
      categories: nextProps.context.state.categories,
      taskTypes: nextProps.context.state.taskTypes,
      taskPriorities: nextProps.context.state.taskPriorities,
      taskId: nextProps.taskId,
      tasks: nextProps.tasks,
      taskParamsId: nextProps.taskParamsId,
      projectParamsId: nextProps.projectParamsId,
      project: nextProps.project,
      messages: nextProps.messages,
      uploadFiles: nextProps.uploadFiles,
      pTasks: nextProps.pTasks,
      updatedTime: dateUtil.getTime(),
      userNameToId: nextProps.context.state.userNameToId,
      user: nextProps.context.state.user,
    });
  }

  handleInputChange = (e) => {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    // if (name === "startDate") {
    //     sd = new Date(target.value);
    // }

    // if (name === "endDate") {
    //     ed = new Date(target.value);

    //     if (ed < sd) {
    //         this.setState({
    //             errMessage: 'End date should be greater than start date',
    //             updatedTime: dateUtil.getTime()
    //         })
    //     } else {
    //         this.setState({
    //             errMessage: '',
    //             updatedTime: dateUtil.getTime()
    //         })
    //     }
    // }
    if (name === "hiddenDepId") {
      if (value === "") {
        this.setState({
          errMessage: "",
          updatedTime: dateUtil.getTime(),
        });
      }
    }
    if (name === "hiddenUserId") {
      if (value === "") {
        this.setState({
          errUserMessage: "",
          updatedTime: dateUtil.getTime(),
        });
      }
    }

    if (name === "selectUsers") {
      this.onSelectDropdown(value);
    }

    this.setState(
      {
        task: {
          ...this.state.task,
          [name]: value,
        },
        checkMsg: false,
        updatedTime: dateUtil.getTime(),
        messagesuccess: "",
        message: "",
      },
      this.validateField.bind(this, name, value)
    );
  };

  onSelectDropdown(selectedUser) {
    let userGroupsWithUsers = [];
    if (selectedUser === "") {
      this.setState({
        dropdownHidden: true,
      });
    } else {
      let name1 = selectedUser.toLowerCase();
      var projectUserD = [];
      if (this.state.project) {
        var userAssigned = "";

        if (this.state.project.projectUsers.length > 0) {
          for (let x = 0; x < this.state.project.projectUsers.length; x++) {
            if (
              this.state.project.projectUsers[x].name !== undefined &&
              this.state.project.projectUsers[x].name !== null
            ) {
              userGroupsWithUsers.push({
                id: this.state.project.projectUsers[x].userId,
                name: this.state.project.projectUsers[x].name,
              });
            }
          }
        }

        if (this.state.project.userGroups.length > 0) {
          for (let x = 0; x < this.state.project.userGroups.length; x++) {
            userGroupsWithUsers.push({
              id: this.state.project.userGroups[x].groupId,
              name: this.state.project.userGroups[x].groupName,
            });
          }
        }

        let projUsers = userGroupsWithUsers.filter((u) => {
          if (
            this.state.task.assignUsers !== undefined &&
            this.state.task.assignUsers.length > 0
          ) {
            for (let j = 0; j < this.state.task.assignUsers.length; j++) {
              if (u.id === this.state.task.assignUsers[j]) {
                userAssigned = u.id;
              }
            }
          }

          if (
            this.state.task.hiddenUserId !== undefined &&
            this.state.task.hiddenUserId !== null &&
            this.state.task.hiddenUserId !== ""
          ) {
            let usersId = "";
            if (
              this.state.task.hiddenUserId.toLowerCase().replace(/ +/g, "") ===
              u.name.toLowerCase().replace(/ +/g, "")
            ) {
              usersId = u.id;
            }
            return u.id !== userAssigned && u.id !== usersId;
          } else {
            return u.id !== userAssigned;
          }
        });

        for (let i = 0; i < projUsers.length; i++) {
          if (projUsers[i].name !== undefined && projUsers[i].name !== null) {
            if (projUsers[i].name.toLowerCase().indexOf(name1) > -1) {
              projectUserD.push(
                <li
                  key={projUsers[i].id}
                  style={{ cursor: "pointer", marginLeft: "-20px" }}
                  onClick={this.addAssignUser.bind(this, projUsers[i].id)}
                  id={projUsers[i].id}
                  value={projUsers[i].id}
                >
                  {projUsers[i].name}
                </li>
              );
            }
          }
        }
      }

      this.setState({
        dropdownHidden: false,
        projectUsersDropdown: projectUserD,
        usersAndGroups: userGroupsWithUsers,
      });
    }
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let titleValid = this.state.titleValid;
    let descriptionValid = this.state.descriptionValid;
    let storyPointValid = this.state.storyPointValid;
    let taskTypeValid = this.state.taskTypeValid;
    // let startDateValid = this.state.startDateValid;
    // let endDateValid = this.state.endDateValid;

    switch (fieldName) {
      case "title":
        titleValid = value.length !== 0;
        fieldValidationErrors.title = titleValid ? "" : " Please fill the";
        break;
      case "description":
        descriptionValid = value.length !== 0;
        fieldValidationErrors.description = descriptionValid
          ? ""
          : " Please fill the";
        break;
      case "storyPoint":
        storyPointValid = value.length !== 0;
        fieldValidationErrors.storyPoint = storyPointValid
          ? ""
          : " Please fill the";
        break;
      case "taskType":
        taskTypeValid = value.length !== 0;
        fieldValidationErrors.taskType = taskTypeValid
          ? ""
          : " Please fill the";
        break;
      // case 'startDate':
      //     startDateValid = value.length !== 0;
      //     fieldValidationErrors.startDate = startDateValid ? '' : ' Please fill the';
      //     break;
      // case 'endDate':
      // endDateValid = value.length !== 0;
      //     fieldValidationErrors.endDate = endDateValid ? '' : ' Please fill the';
      //     break;

      default:
        break;
    }

    this.setState(
      {
        formErrors: fieldValidationErrors,
        titleValid: titleValid,
        descriptionValid: descriptionValid,
        storyPointValid: storyPointValid,
        taskTypeValid: taskTypeValid,
        updatedTime: dateUtil.getTime(),
        // endDateValid:endDateValid,
        // startDateValid:startDateValid
      },
      this.validateForm(this.state.task._id)
    );
  }

  validateForm(taskId) {
    if (taskId) {
      this.setState({
        formValid: true,
        updatedTime: dateUtil.getTime(),
      });
    }
  }

  onKeyUp = (e) => {
    if (e.which === 188) {
      let val = e.target.value.trim();
      if (val === "," || val === "") {
        e.target.value = "";
        return;
      }
      let input = val.split(",");

      var tagsArr = this.state.task.tag ? this.state.task.tag.split(",") : [];
      if (
        tagsArr &&
        Array.isArray(tagsArr) &&
        (tagsArr[0] === "" || tagsArr[0] === ",")
      ) {
        tagsArr = [];
      }

      if (tagsArr.length !== 0) {
        for (let i = 0; i < tagsArr.length; i++) {
          if (tagsArr[i].indexOf(input[0]) !== -1) return;
        }
      }
      if (tagsArr.length >= 1) {
        var tag = tagsArr.concat(input[0]).join(",");
      } else {
        tag = input[0];
      }

      this.setState({
        task: {
          ...this.state.task,
          tag,
        },
        checkMsg: false,
        updatedTime: dateUtil.getTime(),
      });
      e.target.value = " ";
    }
  };

  onDeleteTag = (tags) => {
    var tag = this.state.task.tag
      .split(",")
      .filter((t) => {
        return t !== tags;
      })
      .join(",");

    this.setState({
      task: {
        ...this.state.task,
        tag: tag,
      },
      updatedTime: dateUtil.getTime(),
    });
  };

  onSubmit = (e) => {
    e.preventDefault();
    var { pTasks, project } = this.state;

    var { hiddenDepId, hiddenUserId } = this.state.task;
    let depTask =
      pTasks &&
      pTasks.filter((dTask) => {
        return dTask.title === hiddenDepId;
      });
    let taskUser =
      project.projectUsers &&
      project.projectUsers.filter((pUser) => {
        return pUser.name === hiddenUserId;
      });

    if (hiddenDepId !== "" && hiddenUserId !== "") {
      if (depTask.length !== 0 && taskUser.length === 0) {
        this.setState({
          errUserMessage: "No such user found",
          updatedTime: dateUtil.getTime(),
        });
      } else if (depTask.length === 0 && taskUser.length !== 0) {
        this.setState({
          errMessage: "No such dependency task found",
          updatedTime: dateUtil.getTime(),
        });
      } else if (depTask.length === 0 && taskUser.length === 0) {
        this.setState({
          errUserMessage: "No such user found",
          errMessage: "No such dependency task found",
          updatedTime: dateUtil.getTime(),
        });
      } else {
        if (
          this.state.task.title !== "" &&
          this.state.task.description !== "" &&
          this.state.task.status !== "" &&
          this.state.task.storyPoint !== ""
        ) {
          this.submitCheck(this.state.task);
        }
      }
    } else if (hiddenDepId === "" && hiddenUserId !== "") {
      if (taskUser.length === 0) {
        this.setState({
          errUserMessage: "No such user found",
          updatedTime: dateUtil.getTime(),
        });
      } else {
        if (
          this.state.task.title !== "" &&
          this.state.task.description !== "" &&
          this.state.task.status !== "" &&
          this.state.task.storyPoint !== ""
        ) {
          this.submitCheck(this.state.task);
        }
      }
    } else if (hiddenDepId !== "" && hiddenUserId === "") {
      if (depTask.length === 0) {
        this.setState({
          errMessage: "No such dependency task found",
          updatedTime: dateUtil.getTime(),
        });
      } else {
        if (
          this.state.task.title !== "" &&
          this.state.task.description !== "" &&
          this.state.task.status !== "" &&
          this.state.task.storyPoint !== ""
        ) {
          this.submitCheck(this.state.task);
        }
      }
    } else {
      if (
        this.state.task.title !== "" &&
        this.state.task.description !== "" &&
        this.state.task.taskType !== "" &&
        this.state.task.priority !== "" &&
        this.state.task.status !== "" &&
        this.state.task.storyPoint !== ""
      ) {
        this.submitCheck(this.state.task);
      }
    }
  };

  submitCheck = (task) => {
    this.onTaskSubmit(task);
    if (!this.state.taskId && !this.state.taskParamsId) {
      let userRole = Auth.get("userRole");
      let userName = Auth.get("userName");
      let accessRights = Auth.get("access");
      let editAll = false;
      editAll = validate.validateEntitlements(
        accessRights,
        this.props.projectId,
        "Task",
        "edit all"
      );
      let hiddenUserId = "";
      if (userRole !== "user" || editAll === true) {
        hiddenUserId = "";
      } else {
        hiddenUserId = userName;
      }
      this.setState({
        task: {
          title: "",
          description: "",
          tag: "",
          status: "new",
          storyPoint: config.minStoryPonit,
          startDate: "",
          endDate: "",
          depId: "",
          taskType: "task",
          priority: "medium",
          hiddenDepId: "",
          hiddenUserId: hiddenUserId,
          // createdOn: '',
          createdBy: "",
          // modifiedOn: '',
          modifiedBy: "",
          completed: false,
          isDeleted: false,
          allowMultipleUsers: false,
          assignUsers: [],
          selectUsers: "",
          // selectGroups: '',
          // assignUserGroups: [],
          dateOfCompletion: "",
          subtaskId: "",
        },
        formValid: false,
        descriptionValid: false,
        storyPointValid: false,
        taskTypeValid: false,
        checkMsg: true,
        message: "",
        updatedTime: dateUtil.getTime(),
      });
    } else {
      this.setState({
        checkMsg: true,
        message: "",
        updatedTime: dateUtil.getTime(),
      });
    }
  };

  onTaskSubmit = (task) => {
    let getId = Auth.get("userId");
    let getRole = Auth.get("userRole");
    let accessRights = Auth.get("access");
    let editAll = false;
    editAll = validate.validateEntitlements(
      accessRights,
      this.props.projectId,
      "Task",
      "edit all"
    );

    if (
      task.hiddenDepId === undefined ||
      task.hiddenDepId === null ||
      task.hiddenDepId === ""
    ) {
      task.depId = "";
    } else {
      let pTaskId =
        this.state.pTasks &&
        this.state.pTasks.filter((pId) => {
          return pId.title === task.hiddenDepId;
        })[0].id;
      task.depId = pTaskId;
    }

    if (getRole === "user" && !editAll) {
      var users =
        this.state.project &&
        this.state.project.projectUsers.filter((u) => {
          return getId === u.userId;
        })[0];
      task.userId = users.userId;
      task.hiddenUserId = users && users.name;
    } else {
      if (
        task.hiddenUserId === undefined ||
        task.hiddenUserId === null ||
        task.hiddenUserId === ""
      ) {
        task.userId = "";
      } else {
        let uTaskId =
          this.state.project &&
          this.state.project.projectUsers.filter((uId) => {
            return uId.name === task.hiddenUserId;
          })[0].userId;
        task.userId = uTaskId;
      }
    }

    if (this.state.taskId || this.state.taskParamsId) {
      task.modifiedBy = Auth.get("userId");
      // task.modifiedOn = new Date().toISOString();
    } else {
      let maxId = Math.max.apply(
        Math,
        this.state.tasks.map((task) => {
          if (task.sequence === undefined || task.sequence === null) {
            task.sequence = 0;
          }
          return task.sequence;
        })
      );

      task.sequence = maxId + 1;
      task.createdBy = Auth.get("userId");
      // task.createdOn = new Date();
      task.modifiedBy = Auth.get("userId");
      // task.modifiedOn = new Date();
    }

    var email = "";
    var userName = "";
    if (
      task.userId === undefined ||
      task.userId === null ||
      task.userId === ""
    ) {
      email = "XX";
      userName = "";
    } else {
      var userEmail = this.props.context.state.users.filter((user) => {
        return user._id === task.userId;
      });
      if (userEmail && userEmail.length > 0) {
        email = userEmail[0].email;
        userName = userEmail[0].name;
      } else {
        email = "";
        userName = "";
      }
    }

    if (this.state.taskId || this.state.taskParamsId) {
      let id = !this.state.taskId ? this.state.taskParamsId : this.state.taskId;

      var projectName = this.state.project.title;
      var projectOwnerId = this.state.project.userid;

      var ownerEmailInfo;
      ownerEmailInfo = this.props.context.state.users.filter((owner) => {
        return owner._id === projectOwnerId;
      });

      var ownerEmail;
      ownerEmail = ownerEmailInfo[0].email;

      if (task.status === "completed") {
        task.completed = true;
        task.category = "completed";
        task.dateOfCompletion = new Date();
      } else if (task.status === "inprogress") {
        task.category = "inprogress";
        task.dateOfCompletion = "";
      } else if (task.status === "new") {
        task.category = "todo";
        task.dateOfCompletion = "";
      }

      task.projectId = this.state.projectId;
      let depTaskTitle = task.hiddenDepId;
      // console.log('task in edit',task);
      this.editTask(
        task,
        id,
        email,
        projectName,
        ownerEmail,
        userName,
        depTaskTitle
      );
    } else {
      if (task.status === "completed") {
        task.completed = true;
        task.category = "completed";
        task.dateOfCompletion = new Date();
      } else if (task.status === "inprogress") {
        task.category = "inprogress";
        task.dateOfCompletion = "";
      } else {
        task.category = "todo";
        task.dateOfCompletion = "";
      }

      projectName = this.state.project.title;

      let depTaskTitle = task.hiddenDepId;

      task.projectId = this.state.projectId;
      task.subtasks = [];
      task.messages = [];
      task.uploadFiles = [];
      // task.dateOfCompletion = '';

      let multiUsers = [];
      if (task.assignUsers.length > 0) {
        for (let i = 0; i < task.assignUsers.length; i++) {
          let user =
            this.state.users.length > 0 &&
            this.state.users.filter((u) => {
              return u._id === task.assignUsers[i];
            });
          if (user.length > 0) {
            let users = {
              id: task.assignUsers[i],
              name: user.length > 0 ? user[0].name : "",
            };
            multiUsers.push(users);
          }

          let matchUserGroup =
            this.state.project &&
            this.state.project.userGroups.length > 0 &&
            this.state.project.userGroups.filter((g) => {
              return task.assignUsers[i] === g.groupId;
            });
          let groupMembers =
            matchUserGroup.length > 0 ? matchUserGroup[0].groupMembers : [];
          if (groupMembers.length > 0) {
            for (let k = 0; k < groupMembers.length; k++) {
              multiUsers.push({
                id: groupMembers[k].id,
                name: groupMembers[k].name,
              });
            }
          }
        }
      }
      // console.log('task in Add',task);
      this.addTask(
        task,
        email,
        userName,
        projectName,
        depTaskTitle,
        multiUsers
      );
    }
  };

  addTask = async (
    task,
    email,
    userName,
    projectName,
    depTaskTitle,
    multiUsers
  ) => {
    let { tasks, taskErr } = await taskservice.addTask(
      task,
      email,
      userName,
      projectName,
      depTaskTitle,
      multiUsers
    );
    if (taskErr) {
      this.setState({
        message: "Error: " + taskErr,
        updatedTime: dateUtil.getTime(),
      });
    } else if (tasks && tasks.data.err) {
      this.setState({
        message: "Error: " + tasks.data.err,
        updatedTime: dateUtil.getTime(),
      });
    } else {
      this.props.addTask(tasks.data.result);
      this.setState({
        messagesuccess: tasks.data.msg,
        message: "",
        updatedTime: dateUtil.getTime(),
      });
    }
  };

  editTask = async (
    task,
    id,
    email,
    projectName,
    ownerEmail,
    userName,
    depTaskTitle
  ) => {
    let { tasks, taskErr } = await taskservice.editTask(
      task,
      id,
      email,
      projectName,
      ownerEmail,
      userName,
      depTaskTitle
    );
    if (taskErr) {
      this.setState({
        message: "Error: " + taskErr,
        updatedTime: dateUtil.getTime(),
      });
    } else if (tasks && tasks.data.err) {
      this.setState({
        message: tasks.data.err,
        updatedTime: dateUtil.getTime(),
      });
    } else {
      if (this.state.taskId) {
        this.props.editTask(task);
      }

      this.setState({
        messagesuccess: tasks.data.msg,
        message: "",
        updatedTime: dateUtil.getTime(),
      });
    }
  };

  handleTabClick = (name, e) => {
    if (e.target !== undefined) {
      e.preventDefault();
    }

    const eleClass = document.getElementsByClassName("tab-pane");
    for (let i = 0; i < eleClass.length; i++) {
      eleClass[i].style.display = "none";
      eleClass[i].className = "tab-pane";
    }
    const liClass = document.getElementsByClassName("li");
    for (let i = 0; i < liClass.length; i++) {
      liClass[i].className = "li";
    }
    const ele = document.getElementById(name);
    ele.className += " active";
    ele.style.display = "block";
    if (e.target) {
      e.target.parentElement.className += " active";
    } else {
      const element = document.getElementById(e);
      element.className += " active";
      element.style.display = "block";
    }
  };

  currentUserCheck = () => {
    var userRoleLoggedIn = Auth.get("userRole");
    var userName = Auth.get("userName");
    let accessRights = Auth.get("access");
    let editAll = false;
    editAll = validate.validateEntitlements(
      accessRights,
      this.props.projectId,
      "Task",
      "edit all"
    );
    if (userRoleLoggedIn === "user" && !editAll) {
      this.setState({
        currentUser: true,
        task: {
          ...this.state.task,
          hiddenUserId: userName,
        },
        updatedTime: dateUtil.getTime(),
      });
    }
  };

  onShowTaskModal = (taskId) => {
    this.toggleModal(taskId);
  };

  toggleModal = (taskId) => {
    this.setState({
      isOpen: !this.state.isOpen,
      updatedTime: dateUtil.getTime(),
    });
  };

  onShowAddUserModal = (taskId) => {
    this.toggleAddUserModal(taskId);
  };

  toggleAddUserModal = (taskId) => {
    this.setState({
      isAddUserModalOpen: !this.state.isAddUserModalOpen,
      updatedTime: dateUtil.getTime(),
    });
  };

  addAssignUser(id) {
    let input = id;
    var projectUsersDropdown = this.state.projectUsersDropdown.filter((u) => {
      return u.props.value !== id;
    });
    if (input.length === 0 || input[0] === "") return;

    this.setState({
      projectUsersDropdown: projectUsersDropdown,
      task: {
        ...this.state.task,
        selectUsers: "",
        assignUsers: [...this.state.task.assignUsers, input],
      },
      dropdownHidden: true,
    });
  }

  onDeleteAssignUsers(tag) {
    let userI = this.state.usersAndGroups.filter((u) => {
      return (
        u.name.toLowerCase().replace(/ +/g, "") ===
        tag.toLowerCase().replace(/ +/g, "")
      );
    });

    let id = userI.length > 0 ? userI[0].id : "";
    var assignUsers = this.state.task.assignUsers.filter((t) => {
      return t !== id;
    });

    this.setState({
      task: {
        ...this.state.task,
        assignUsers: assignUsers,
      },
    });
  }

  onUserKeyPress(e) {
    var nodes = document.getElementById("search_users").childNodes;
    if (nodes.length > 0) {
      if (e.keyCode === 40) {
        if (this.userDownCount < nodes.length - 1) {
          this.userDownCount++;
        }

        for (let i = 0; i < nodes.length; i++) {
          if (this.userDownCount === i) {
            nodes[i].style.background = "lightblue";
          } else {
            nodes[i].style.background = "";
          }
        }
      } else if (e.keyCode === 38) {
        if (this.userDownCount > 0) {
          this.userDownCount--;
        }

        for (let i = 0; i < nodes.length; i++) {
          if (this.userDownCount === i) {
            nodes[i].style.background = "lightblue";
          } else {
            nodes[i].style.background = "";
          }
        }
      } else if (e.keyCode === 13) {
        e.preventDefault();
        this.addAssignUser(nodes[this.userDownCount].id);
      }
    }
  }

  onToggleNewSubTask(taskId, taskSubTaskId) {
    let task =
      this.state.tasks &&
      this.state.tasks.filter((t) => {
        return taskId === t._id;
      });
    let userId = task.length > 0 ? task[0].userId : "";
    let hiddenid =
      this.state.project &&
      this.state.project.projectUsers.filter((u) => {
        return userId === u.userId;
      });
    let hiddenUsr = hiddenid.length ? hiddenid[0].name : "";
    let tasks = this.state.tasks.map((t1) => {
      let t = cloneDeep(t1);
      if (taskId === t._id) {
        if (taskSubTaskId < 0) {
          let maxId = 0;
          if (t.subtasks && t.subtasks.length > 0) {
            maxId = Math.max.apply(
              Math,
              t.subtasks.map((subtask) => {
                if (
                  subtask.sequence === undefined ||
                  subtask.sequence === null
                ) {
                  subtask.sequence = 0;
                }
                return subtask.sequence;
              })
            );
          }
          var newSubTask = {
            taskId: taskId,
            add: true,
            hiddenUsrId: "",
            storyPoint: 1,
            title: "",
            _id: ObjectId.mongoObjectId(),
            completed: false,
            edit: false,
            hiddenUserName: hiddenUsr,
            dateOfCompletion: "",
            isDeleted: false,
            sequence: maxId + 1,
          };
          // console.log("newSubTask", newSubTask);
          t.subtasks.push(newSubTask);
        }
      }
      return t;
    });
    this.setState({
      tasks: tasks,
      updatedTime: dateUtil.getTime(),
    });
  }
  async addSubTask(subTask, projectId, taskTitle) {
    let { subtasks, subtaskserr } = await subtaskservice.addSubTask(
      subTask,
      projectId,
      taskTitle
    );
    if (subtaskserr) {
      this.setState({
        message: "Error: " + subtaskserr,
        // updatedTime:dateUtil.getTime()
      });
    } else if (subtasks && subtasks.data.err) {
      //   this.setState({
      //     message: 'Error: ' + subtasks.data.err,
      //     updatedTime:dateUtil.getTime()
      //   });
    }
  }
  async toggleSubTask(subTask, taskId, projectId) {
    let { subtasks, subtaskserr } = await subtaskservice.toggleSubTask(
      subTask,
      taskId,
      projectId
    );
    if (subtaskserr) {
      this.setState({
        message: "Error: " + subtaskserr,
        updatedTime: dateUtil.getTime(),
      });
    } else if (subtasks && subtasks.data.err) {
      this.setState({
        message: "Error: " + subtasks.data.err,
        updatedTime: dateUtil.getTime(),
      });
    }
  }

  onEditSubTask(subTaskId, taskId, e) {
    var target = e.target;
    let updatedTasks = this.state.tasks.map((t1) => {
      let t = cloneDeep(t1);
      if (t._id === taskId) {
        let subTasks =
          t.subtasks &&
          t.subtasks.map((s) => {
            if (s._id === subTaskId) {
              s.title = target.value;
            }
            return s;
          });
        t.subtasks = subTasks && subTasks.length > 0 ? subTasks : [];
      }
      return t;
    });

    this.setState({
      tasks: updatedTasks,
      // updatedTime:dateUtil.getTime()
    });
  }

  async onSubTaskEdit(subtask) {
    this.toggleSubTask(subtask, subtask.taskId, this.state.projectParamsId);
    let updatedTasks = this.state.tasks.map((t1) => {
      let t = cloneDeep(t1);
      if (t._id === subtask.taskId) {
        let subTasks =
          t.subtasks &&
          t.subtasks.map((s) => {
            if (s._id === subtask._id) {
              s = subtask;
            }
            return s;
          });
        t.subtasks = subTasks && subTasks.length > 0 ? subTasks : [];
      }
      return t;
    });

    this.setState({
      tasks: updatedTasks,
      updatedTime: dateUtil.getTime(),
    });
    var userEmail = this.props.context.state.users.filter((user) => {
      return user._id === subtask.hiddenUsrId;
    });
    let email = userEmail[0].email;
    let userName = userEmail[0].name;
    let projectName = this.state.project.title;
    let projectOwnerId = this.state.project.userid;
    let depTaskTitle = "";
    let ownerEmailInfo;
    ownerEmailInfo = this.props.context.state.users.filter((owner) => {
      return owner._id === projectOwnerId;
    });
    let ownerEmail = ownerEmailInfo.length > 0 ? ownerEmailInfo[0].email : "";
    // let multiUsers = [];

    let taskd1 =
      this.state.tasks &&
      this.state.tasks.filter((t1) => {
        return t1.subtaskId === subtask._id;
      });
    let taskd = taskd1.length > 0 ? taskd1 : [];

    if (taskd.length > 0) {
      taskd[0].title = subtask.title;
      taskd[0].userId = subtask.hiddenUsrId;
      taskd[0].storyPoint = subtask.storyPoint;
      taskd[0].projectId = this.state.projectId;
      let id = taskd[0]._id;
      let task = taskd[0];
      let { tasks, taskErr } = await taskservice.editTask(
        task,
        id,
        email,
        projectName,
        ownerEmail,
        userName,
        depTaskTitle
      );
      if (taskErr) {
        this.setState({
          message: "Error: " + taskErr,
          updatedTime: dateUtil.getTime(),
        });
      } else if (tasks && tasks.data.err) {
        this.setState({
          message: tasks.data.err,
          updatedTime: dateUtil.getTime(),
        });
      } else {
        //this.editTask(task);
      }
    }
  }

  onToggleSubTask(subTask, taskId) {
    var markParentTask;

    // Get all subtasks for a particular task

    let tasks = cloneDeep(this.state.tasks);
    let task = tasks.filter((t) => {
      return taskId === t._id;
    })[0];

    subTask.completed = !subTask.completed;
    if (subTask.completed) {
      subTask.dateOfCompletion = new Date();
    } else {
      subTask.dateOfCompletion = "";
    }

    let mofifiedSubtasks =
      task &&
      task.subtasks.map((s) => {
        if (s._id === subTask._id) {
          s = subTask;
        }
        return s;
      });

    task.subtasks = mofifiedSubtasks;
    let taskData =
      tasks &&
      tasks.filter((t) => {
        return t.subtaskId === subTask._id;
      });
    if (taskData.length > 0) {
      taskData[0].completed = subTask.completed;
      if (subTask.completed === true) {
        taskData[0].status = "completed";
        taskData[0].category = "completed";
      } else {
        taskData[0].status = "inprogress";
        taskData[0].category = "inprogress";
      }

      let task = taskData[0];
      this.toggleEdit(task, this.state.projectParamsId);
    }

    var isAllSubTaskCompleted = true;
    for (let i = 0; i < task.subtasks.length; i++) {
      if (!task.subtasks[i].completed) {
        isAllSubTaskCompleted = false;
        break;
      }
    }

    markParentTask = isAllSubTaskCompleted;

    //if subtask has been unchecked, then parent should be unchecked, otherwise default.
    task.completed = markParentTask === false ? false : task.completed;
    if (isAllSubTaskCompleted) {
      task.completed = true;
    }

    this.toggleEdit(task, this.state.projectParamsId);
    //let subTasks = task.subtasks;
    // this.setState({
    //   ...subTasks,
    //   task,
    //   updatedTime:dateUtil.getTime()
    // });
  }

  async toggleEdit(task, projectId) {
    let { tasks, taskErr } = await taskservice.toggleEditTask(task, projectId);
    if (taskErr) {
      this.setState({
        message: "Error: " + taskErr,
        updatedTime: dateUtil.getTime(),
      });
    } else if (tasks && tasks.data.err) {
      this.setState({
        message: "Error: " + tasks.data.err,
        updatedTime: dateUtil.getTime(),
      });
    } else {
      let tasks = this.state.tasks.map((t) => {
        if (t._id === task._id) {
          t = task;
        }
        return t;
      });
      this.setState({
        tasks,
        // updatedTime:dateUtil.getTime()
      });
    }
  }

  async onDeleteSubTask(subTaskId, taskId) {
    let tasks = cloneDeep(this.state.tasks);
    let taskData = tasks.filter((t) => {
      return t.subtaskId === subTaskId;
    });
    let taskid = taskData.length > 0 ? taskData[0]._id : "";
    let updatedTasks = tasks.map((t) => {
      if (taskId === t._id) {
        var remainingSubTasks = t.subtasks.filter((subTask) => {
          if (subTask._id === subTaskId) {
            if (subTask.completed === true) {
              subTask.isDeleted = false;
            } else {
              subTask.isDeleted = true;
              this.toggleSubTask(subTask, taskId, this.state.projectParamsId);
              return false;
            }
          }
          return true;
        });
        t.subtasks = remainingSubTasks;
      }
      return t;
    });

    this.setState({
      tasks: updatedTasks,
      //updatedTime:dateUtil.getTime()
    });
    if (taskData.length > 0) {
      this.onDeleteTask(taskid);
      // taskData[0].isDeleted
      // task = taskData[0]

      let tasks1 = tasks.filter((t) => {
        return t._id !== taskid;
      });
      this.setState({
        tasks: tasks1,
        updatedTime: dateUtil.getTime(),
      });
    }
  }

  deleteTaskFileById(taskId, id) {
    let objTasks = Object.assign([], this.state.tasks);
    let tasks = objTasks.map((t) => {
      if (t._id === taskId) {
        let uploadFiles = t.uploadFiles.filter((f) => {
          return f._id !== id;
        });
        t.uploadFiles = uploadFiles;
      }
      return t;
    });
    let uploadFiles = this.state.uploadFiles.filter((f) => {
      return f._id !== id;
    });
    this.setState({
      tasks: tasks,
      uploadFiles: uploadFiles,
      //   updatedTime:dateUtil.getTime()
    });
  }

  addUploadTaskFile(newFile) {
    let objTasks = Object.assign([], this.state.tasks);
    let tasks = objTasks.map((t) => {
      if (t._id === newFile.taskId) {
        t.uploadFiles = [...t.uploadFiles, newFile];
      }
      return t;
    });
    this.setState({
      tasks: tasks,
      uploadFiles: [...this.state.uploadFiles, newFile],
      //updatedTime:dateUtil.getTime()
    });
  }

  // async addTaskMsg(msg) {
  //   let objTasks = Object.assign([], this.state.tasks);
  //   let tasks = objTasks.map((t) => {
  //     if (t._id === msg.taskId) {
  //       t.messages = [msg, ...t.messages];
  //     }
  //     return t;
  //   });
  //   this.setState({
  //     tasks: tasks,
  //     messages: [msg, ...this.state.messages],
  //     //updatedTime:dateUtil.getTime()
  //   });
  // }
  async addTaskMsg(msg) {
    let objTasks = Object.assign([], this.state.tasks);
    let tasks = objTasks.map((t) => {
      if (t._id === msg.taskId) {
        t.messages = [msg, ...(t.messages || [])]; // Ensure messages is an array or use an empty array as default
      }
      return t;
    });
  
    let newMessages = [msg];
    if (Array.isArray(this.state.messages)) {
      newMessages = newMessages.concat(this.state.messages);
    } else {
      newMessages = [msg]; // Set a default value if messages is not an array
    }
  
    this.setState({
      tasks: tasks,
      messages: newMessages,
      //updatedTime: dateUtil.getTime()
    });
  }
  
  deleteMessageTask(taskId, messageId) {
    let objTasks = Object.assign([], this.state.tasks);
    let tasks = objTasks.map((t) => {
      if (t._id === taskId) {
        let messages = t.messages.filter((m) => {
          return m._id !== messageId;
        });
        t.messages = messages;
      }
      return t;
    });
    let messages = this.state.messages.filter((m) => {
      return m._id !== messageId;
    });
    this.setState({
      tasks: tasks,
      messages: messages,
      //updatedTime:dateUtil.getTime()
    });
  }

  handlesubTaskInputChange(id, taskId, e) {
    const target = e.target;
    const value = target.value;

    let task =
      this.state.tasks !== undefined &&
      this.state.tasks.filter((t) => {
        return t._id === taskId;
      });
    if (task.length > 0) {
      let subtasks = task[0].subtasks;
      for (let i = 0; i < subtasks.length; i++) {
        if (subtasks[i]._id === id) {
          if (e.target.name === "subtaskTitle") {
            subtasks[i].title = value;
          } else if (e.target.name === "hiddenUserName") {
            subtasks[i].hiddenUserName = value;
          } else if (e.target.name === "subtaskStoryPoint") {
            subtasks[i].storyPoint = value;
          } else if (e.target.name === "subtaskhiddenDepName") {
            subtasks[i].subtaskhiddenDepName = value;
          }
        }
      }
      task[0].subtasks = subtasks;
      if (task[0]._id === taskId) {
        this.setState({
          ...this.state.tasks,
          task,
        });
      }
    }
  }
  onSubmitSubtask(subTask, e) {
    e.preventDefault();
    // console.log("subtask on submit subtask", subTask);
    let project = this.state.project && this.state.project.projectUsers;
    let hiddenName = [];
    for (let i = 0; i < project.length; i++) {
      if (project[i].name !== undefined && project[i].name !== null) {
        if (
          subTask.hiddenUserName.toLowerCase().replace(/ +/g, "") ===
          project[i].name.toLowerCase().replace(/ +/g, "")
        ) {
          hiddenName.push(project[i]);
        }
      }
    }
    // let hiddenName = this.state.project && this.state.project.projectUsers.filter((u) => {
    //     if (u.name !== undefined && u.name !== null) {
    //         return subTask.hiddenUserName.toLowerCase().replace(/ +/g, "") === u.name.toLowerCase().replace(/ +/g, "")
    //     }

    // })
    let hiddenUsr = hiddenName.length ? hiddenName[0].userId : "";
    subTask.hiddenUsrId = hiddenUsr;

    let task = this.state.tasks.filter((t) => {
      return t._id === this.state.taskId;
    });

    // console.log("subTask", subTask);
    let allSubtasks = [];
    if (task && task.length > 0) {
      allSubtasks = cloneDeep(task[0].subtasks);
    }
    // console.log("all subtasks", allSubtasks);
    let hiddenDepName = [];
    if (allSubtasks.length > 0) {
      for (let i = 0; i < allSubtasks.length; i++) {
        if (
          allSubtasks[i].title !== undefined &&
          allSubtasks[i].title !== null
        ) {
          if (
            subTask.subtaskhiddenDepName.toLowerCase().replace(/ +/g, "") ===
            allSubtasks[i].title.toLowerCase().replace(/ +/g, "")
          ) {
            hiddenDepName.push(allSubtasks[i]);
          }
        }
      }
    }

    // console.log("hiddenDepName", hiddenDepName);
    let hiddenDepSubtask = hiddenDepName.length > 0 ? hiddenDepName[0]._id : "";
    // console.log("hiddenDepSubtask", hiddenDepSubtask);
    subTask.subtaskHiddenDepId = hiddenDepSubtask;

    let tasks = Object.assign([], this.state.tasks);
    if (subTask.add === true || subTask.addform === true) {
      if (this.state.taskParamsId) {
        this.onAddSubTask(subTask);
      } else {
        this.props.onAddSubTask(subTask);
      }

      if (tasks.length > 0) {
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i]._id === subTask.taskId) {
            let subTasks = tasks[i].subtasks.map((s) => {
              if (s._id === subTask._id) {
                if (s.add === true || s.addform === true) {
                  s.edit = false;
                  s.add = false;
                  s.addform = false;
                }
              }
              return s;
            });
            tasks[i].subtasks = subTasks;
            this.setState({
              tasks: tasks,
            });
          }
        }
      }
    } else {
      if (this.state.taskParamsId) {
        this.onSubTaskEdit(subTask);
      } else {
        this.props.onEditSubTask(subTask);
      }

      if (tasks.length > 0) {
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i]._id === subTask.taskId) {
            let subTasks = tasks[i].subtasks.map((s) => {
              if (s._id === subTask._id) {
                if (s.edit === true || s.addform === true) {
                  s.edit = false;
                  s.add = false;
                  s.addform = false;
                }
              }
              return s;
            });
            tasks[i].subtasks = subTasks;
            this.setState({
              tasks: tasks,
            });
          }
        }
      }
    }
  }
  onCloseSubtask(taskId, subtaskId, e) {
    e.preventDefault();
    let subtasks = [];
    let tasks = Object.assign([], this.state.tasks);
    if (tasks.length > 0) {
      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i]._id === taskId) {
          let subTaskEdit = tasks[i].subtasks.filter((f) => {
            return f._id === subtaskId;
          });

          let editvalue = subTaskEdit.length > 0 ? subTaskEdit[0].edit : "";
          if (editvalue === true) {
            subtasks = tasks[i].subtasks.map((m) => {
              m.edit = false;
              return m;
            });
            tasks[i].subtasks = subtasks;
          } else {
            subtasks = tasks[i].subtasks.filter((m) => {
              return m._id !== subtaskId;
            });
            tasks[i].subtasks = subtasks;
          }
        }
      }
    }

    this.props.onCancelSubtask(taskId, subtaskId);
    this.setState({
      tasks: tasks,
    });
  }
  async onAddSubTask(subTask, e) {
    let taskId = subTask.taskId;
    let tasks = Object.assign([], this.state.tasks);
    if (tasks.length > 0) {
      //let subtaskObj
      for (let i = 0; i < tasks.length; i++) {
        if (taskId === tasks[i]._id) {
          if (tasks[i].userId === subTask.hiddenUsrId) {
            this.addSubTask(subTask, this.state.projectParamsId, "");

            let updatedTasks = this.state.tasks.map((t1) => {
              let t = cloneDeep(t1);

              if (t._id === taskId) {
                let subTasks =
                  t.subtasks &&
                  t.subtasks.map((s) => {
                    if (s._id === subTask._id) {
                      s = subTask;
                    }
                    return s;
                  });
                t.subtasks = subTasks && subTasks.length > 0 ? subTasks : [];
              }
              return t;
            });

            this.setState({
              tasks: updatedTasks,
              //updatedTime: dateUtil.getTime()
            });
          } else {
            this.addSubTask(subTask, this.state.projectParamsId, "");

            let updatedTasks = this.state.tasks.map((t1) => {
              let t = cloneDeep(t1);
              if (t._id === taskId) {
                let subTasks =
                  t.subtasks &&
                  t.subtasks.map((s) => {
                    if (s._id === subTask._id) {
                      s = subTask;
                    }
                    return s;
                  });
                t.subtasks = subTasks && subTasks.length > 0 ? subTasks : [];
              }
              return t;
            });

            this.setState({
              tasks: updatedTasks,
              // updatedTime: dateUtil.getTime()
            });
            let taskd =
              this.state.tasks &&
              this.state.tasks.filter((t) => {
                return t._id === subTask.taskId;
              });
            let maxId = Math.max.apply(
              Math,
              this.state.tasks.map((task) => {
                if (task.sequence === undefined || task.sequence === null) {
                  task.sequence = 0;
                }
                return task.sequence;
              })
            );
            var userEmail = this.props.context.state.users.filter((user) => {
              return user._id === subTask.hiddenUsrId;
            });
            let email = userEmail.length > 0 ? userEmail[0].email : "";
            let userName = userEmail.length > 0 ? userEmail[0].name : "";
            let projectName = this.state.project.title;
            //let projectOwnerId = this.state.project.userid;
            let depTaskTitle = "";

            let multiUsers = [];

            let task = {
              title: subTask.title,
              description: subTask.title,
              completed: false,
              category: "todo",
              tag: "",
              status: "new",
              storyPoint: subTask.storyPoint,
              startDate: dateUtil.DateToString(new Date()),
              endDate: taskd.length > 0 ? taskd[0].endDate : "",
              depId: "",
              taskType: "task",
              priority: "medium",
              createdBy: Auth.get("userId"),
              createdOn: new Date(),
              modifiedBy: Auth.get("userId"),
              modifiedOn: new Date(),
              userId: subTask.hiddenUsrId,
              isDeleted: false,
              sequence: maxId + 1,
              allowMultipleUsers: false,
              assignUsers: [],
              selectUsers: "",
              dateOfCompletion: "",
              projectId: this.state.projectParamsId,
              subtasks: [],
              messages: [],
              uploadFiles: [],
              subtaskId: subTask._id,
            };

            let { tasks, taskErr } = await taskservice.addTask(
              task,
              email,
              userName,
              projectName,
              depTaskTitle,
              multiUsers
            );
            if (taskErr) {
              this.setState({
                message: "Error: " + taskErr,
                updatedTime: dateUtil.getTime(),
              });
            } else if (tasks && tasks.data.err) {
              this.setState({
                message: "Error: " + tasks.data.err,
                updatedTime: dateUtil.getTime(),
              });
            } else {
              // this.addTask(tasks.data.result)
              let updatedTasks = Object.assign([], this.state.tasks);
              if (tasks.data.result.length > 0) {
                for (let i = 0; i < tasks.data.result.length; i++) {
                  updatedTasks.push(tasks.data.result[i]);
                }
              }
              this.setState({
                tasks: updatedTasks,
                updatedTime: dateUtil.getTime(),
              });
            }
          }
        }
      }
    }
  }

  onTogglesubTaskEdit(subTaskId, taskId) {
    let updatedTasks = this.state.tasks.map((t1) => {
      let t = cloneDeep(t1);
      if (t._id === taskId) {
        let hiddenid, hiddenUsr, hiddendepid, hiddendepname;
        let subTasks =
          t.subtasks &&
          t.subtasks.map((s) => {
            if (s._id === subTaskId) {
              hiddenid =
                this.state.project &&
                this.state.project.projectUsers.filter((u) => {
                  return s.hiddenUsrId === u.userId;
                });
              hiddenUsr = hiddenid.length ? hiddenid[0].name : "";
              hiddendepid =
                t.subtasks &&
                t.subtasks.filter((st) => {
                  return s.subtaskHiddenDepId === st._id;
                });
              hiddendepname =
                hiddendepid.length > 0 ? hiddendepid[0].title : "";
              // console.log("hiddendepname", hiddendepname);
              if (s.completed === true) {
                s.edit = false;
              } else {
                s.edit = true;
                s.hiddenUserName = hiddenUsr;
                s.subtaskhiddenDepName = hiddendepname;
              }
            }
            return s;
          });
        t.subtasks = subTasks && subTasks.length > 0 ? subTasks : [];
      }
      return t;
    });

    this.setState({
      tasks: updatedTasks,
      updatedTime: dateUtil.getTime(),
    });
  }

  dateUpdate = (name, updatedDate) => {
    this.setState(
      {
        task: {
          ...this.state.task,
          [name]: updatedDate,
        },
      },
      this.checkSubmit
    );
    // console.log(`updated Date after setState ${name}`, this.state.startdate)
  };

  checkSubmit() {
    if (this.state.task.startDate !== "" && this.state.task.endDate !== "") {
      if (
        Date.parse(this.state.task.startDate) >
        Date.parse(this.state.task.endDate)
      ) {
        this.setState({
          submitDisabled: true,
          errMessage: "Start Date is Greater Than End Date",
        });
      } else {
        this.setState({ submitDisabled: false, errMessage: "" });
      }
    }
  }

  changeSubtaskSequence(taskId, subtaskId, index, flag) {
    let tasks = cloneDeep(this.state.tasks);
    if (tasks.length > 0) {
      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i]._id === taskId) {
          let updateTaskFlag = false;
          if (tasks[i].subtasks.length > 0) {
            let subTasks = tasks[i].subtasks;

            for (let j = 0; j < subTasks.length; j++) {
              if (flag === "up") {
                if (index !== 1) {
                  if (subTasks[j].sequence === index - 1) {
                    subTasks[j].sequence = index;
                  } else if (subTasks[j].sequence === index) {
                    subTasks[j].sequence = index - 1;
                  }

                  updateTaskFlag = true;
                }
              } else if (flag === "down") {
                if (index !== subTasks.length) {
                  if (subTasks[j].sequence === index) {
                    subTasks[j].sequence = index + 1;
                  } else if (subTasks[j].sequence === index + 1) {
                    subTasks[j].sequence = index;
                  }

                  updateTaskFlag = true;
                }
              }
            }
          }
          if (updateTaskFlag) {
            this.toggleEdit(tasks[i], this.state.projectParamsId);
          }
        }
      }
    }
    // console.log("tasks", tasks);
    this.setState({
      tasks: tasks,
    });
  }

  render() {
    let projectTitle = "";
    let projectLinkId = "";
    if (this.state.project) {
      projectTitle = this.state.project.title;
      projectLinkId = this.state.project._id;
    }

    var {
      title,
      description,
      tag,
      status,
      storyPoint,
      startDate,
      endDate,
      hiddenDepId,
      hiddenUserId,
      taskType,
      priority,
      allowMultipleUsers,
      selectUsers,
      assignUsers,
    } = this.state.task;
    var { currentUser, pTasks, taskTypes, checkMsg, taskPriorities, project } =
      this.state;
    var listTag = tag && tag.length > 0 && tag.split(",");
    if (listTag) {
      var tags = listTag.map((t) => {
        return <Tag key={t} value={t} onDeleteTag={this.onDeleteTag} />;
      });
    } else {
      tags = [];
    }
    let formattedDesc =
      description && description.length > 0
        ? description.split("\n").map((t) => <p key={t}>{t}</p>)
        : "";

    var assignusers =
      assignUsers !== undefined &&
      assignUsers.length > 0 &&
      assignUsers.map((tag) => {
        let userAssigned = this.state.usersAndGroups.filter((user) => {
          return user.id === tag;
        });
        let userName = userAssigned.length > 0 ? userAssigned[0].name : "";

        return userName ? (
          <Tag
            key={tag}
            value={userName}
            onDeleteTag={this.onDeleteAssignUsers}
          />
        ) : (
          ""
        );
      });

    let task = [];
    if (this.state.taskId) {
      task =
        this.state.tasks !== undefined &&
        this.state.tasks.filter((t) => {
          return t._id === this.state.taskId;
        });
    } else if (this.state.taskParamsId) {
      task =
        this.state.tasks !== undefined &&
        this.state.tasks.filter((t) => {
          return t._id === this.state.taskParamsId;
        });
    }
    let taskUserId = task.length > 0 ? task[0].userId : "";

    var uCreatedBy = "";
    for (let i = 0; i < this.state.users.length; ++i) {
      if (task && task.length > 0) {
        if (this.state.users[i]._id === task[0].createdBy) {
          uCreatedBy = this.state.users[i].name;
        }
      }
    }

    let uCreatedOn =
      task && task.length > 0
        ? dateUtil.DateToLongString(task[0].createdOn)
        : "";
    if (this.state.taskId || this.state.taskParamsId) {
      if (task.length > 0 && task[0].subtasks && task[0].subtasks.length > 0) {
        task[0].subtasks.sort((a, b) => a.sequence - b.sequence);
      }

      var subTasksView =
        task.length > 0 &&
        task[0].subtasks &&
        task[0].subtasks.map((subTask) => {
          var edit = subTask.edit;
          var add = subTask.add;
          var subTaskchecked = subTask.completed ? "checked" : "";
          let taskData =
            this.state.tasks &&
            this.state.tasks.filter((f) => {
              return f.subtaskId === subTask._id;
            });
          let taskId = taskData.length > 0 ? taskData[0]._id : "";

          let tsubtasks = [];

          for (var i = 0; i < task[0].subtasks.length; i++) {
            if (task[0].subtasks[i]._id !== subTask._id) {
              tsubtasks.push({
                id: task[0].subtasks[i]._id,
                title: task[0].subtasks[i].title,
              });
            }
          }

          // console.log("tsubtasks", tsubtasks);
          return (
            <li key={subTask._id}>
              {subTask.addform || add ? (
                <div className="container">
                  <form>
                    <div className="row">
                      <div className="col-sm-6 col-md-9">
                        <div className="form-group">
                          <label htmlFor="Title" style={labelStyle}>
                            Title
                          </label>
                          <span style={{ color: "red" }}>*</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="press enter to add, esc to cancel"
                            value={subTask.title}
                            onChange={
                              this.state.taskParamsId
                                ? this.handlesubTaskInputChange.bind(
                                    this,
                                    subTask._id,
                                    this.state.taskParamsId
                                  )
                                : this.handlesubTaskInputChange.bind(
                                    this,
                                    subTask._id,
                                    this.state.taskId
                                  )
                            }
                            name="subtaskTitle"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-6 col-md-6">
                        <div className="form-group">
                          <label htmlFor="Select User" style={labelStyle}>
                            Select Memeber
                          </label>
                          <span style={{ color: "red" }}>*</span>
                          {Auth.get("userRole") === "user" ? (
                            <input
                              type="text"
                              value={subTask.hiddenUserName}
                              list="usersData"
                              onChange={this.handleInputChange.bind(
                                this,
                                subTask._id
                              )}
                              name="hiddenUserId"
                              className="form-control"
                              autoComplete="off"
                              disabled
                            />
                          ) : (
                            <input
                              type="text"
                              value={subTask.hiddenUserName}
                              list="usersData"
                              onChange={
                                this.state.taskParamsId
                                  ? this.handlesubTaskInputChange.bind(
                                      this,
                                      subTask._id,
                                      this.state.taskParamsId
                                    )
                                  : this.handlesubTaskInputChange.bind(
                                      this,
                                      subTask._id,
                                      this.state.taskId
                                    )
                              }
                              name="hiddenUserName"
                              className="form-control"
                              autoComplete="off"
                              placeholder="Select User"
                            />
                          )}
                          <datalist id="usersData">
                            {this.state.project &&
                              this.state.project.projectUsers.map((u) => {
                                return (
                                  <option key={u.userId} data-value={u.userId}>
                                    {u.name}
                                  </option>
                                );
                              })}
                          </datalist>
                        </div>
                      </div>
                      <div className="col-sm-6 col-md-6">
                        <div className="form-group">
                          <label htmlFor="Storypoint" style={labelStyle}>
                            Storypoint
                          </label>
                          <span style={{ color: "red" }}>*</span>
                          <input
                            type="number"
                            name="subtaskStoryPoint"
                            className="form-control"
                            placeholder="Story Point"
                            min="1"
                            value={subTask.storyPoint}
                            onChange={
                              this.state.taskParamsId
                                ? this.handlesubTaskInputChange.bind(
                                    this,
                                    subTask._id,
                                    this.state.taskParamsId
                                  )
                                : this.handlesubTaskInputChange.bind(
                                    this,
                                    subTask._id,
                                    this.state.taskId
                                  )
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-12 col-md-12">
                        <div className="form-group">
                          <label
                            htmlFor="Dependency Subtask"
                            style={labelStyle}
                          >
                            Subtask Dependency
                          </label>
                          <input
                            type="text"
                            value={subTask.subtaskhiddenDepName}
                            list="data1"
                            onChange={
                              this.state.taskParamsId
                                ? this.handlesubTaskInputChange.bind(
                                    this,
                                    subTask._id,
                                    this.state.taskParamsId
                                  )
                                : this.handlesubTaskInputChange.bind(
                                    this,
                                    subTask._id,
                                    this.state.taskId
                                  )
                            }
                            name="subtaskhiddenDepName"
                            className="form-control"
                            autoComplete="off"
                            placeholder="Subtask Dependency"
                          />
                          <datalist id="data1">
                            {tsubtasks &&
                              tsubtasks.map((t) => {
                                return (
                                  <option key={t.id} data-value={t.id}>
                                    {t.title}
                                  </option>
                                );
                              })}
                          </datalist>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-6 col-md-6">
                        <input
                          type="submit"
                          value="Save"
                          className="btn btn-info btn-block"
                          onClick={this.onSubmitSubtask.bind(this, subTask)}
                          disabled={!subTask.title}
                        />
                      </div>
                      <div className="col-sm-6 col-md-6">
                        <button
                          value="cancel"
                          className="btn btn-secondary btn-block"
                          onClick={this.onCloseSubtask.bind(
                            this,
                            this.state.taskId,
                            subTask._id
                          )}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="subtask-title">
                  <span className={subTask.completed ? "task-deco" : ""}>
                    {edit ? (
                      <div className="container">
                        <form>
                          <div className="row">
                            <div className="col-sm-6 col-md-9">
                              <div className="form-group">
                                <label htmlFor="Title" style={labelStyle}>
                                  Title
                                </label>
                                <span style={{ color: "red" }}>*</span>
                                <input
                                  type="text"
                                  title="enter to submit"
                                  className="form-control"
                                  placeholder="press enter to add, esc to cancel"
                                  value={subTask.title}
                                  onChange={
                                    this.state.taskParamsId
                                      ? this.handlesubTaskInputChange.bind(
                                          this,
                                          subTask._id,
                                          this.state.taskParamsId
                                        )
                                      : this.handlesubTaskInputChange.bind(
                                          this,
                                          subTask._id,
                                          this.state.taskId
                                        )
                                  }
                                  name="title"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-sm-6 col-md-6">
                              <div className="form-group">
                                <label htmlFor="Select User" style={labelStyle}>
                                  Select User
                                </label>
                                <span style={{ color: "red" }}>*</span>
                                {Auth.get("userRole") === "user" ? (
                                  <input
                                    type="text"
                                    value={subTask.hiddenUserName}
                                    list="usersData"
                                    onChange={this.handleInputChange.bind(
                                      this,
                                      subTask._id
                                    )}
                                    name="hiddenUserId"
                                    className="form-control"
                                    autoComplete="off"
                                    disabled
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={subTask.hiddenUserName}
                                    list="usersData"
                                    onChange={
                                      this.state.taskParamsId
                                        ? this.handlesubTaskInputChange.bind(
                                            this,
                                            subTask._id,
                                            this.state.taskParamsId
                                          )
                                        : this.handlesubTaskInputChange.bind(
                                            this,
                                            subTask._id,
                                            this.state.taskId
                                          )
                                    }
                                    name="hiddenUserName"
                                    className="form-control"
                                    autoComplete="off"
                                    placeholder="Select User"
                                  />
                                )}
                                <datalist id="usersData">
                                  {this.props.project &&
                                    this.props.project.projectUsers.map((u) => {
                                      return (
                                        <option
                                          key={u.userId}
                                          data-value={u.userId}
                                        >
                                          {u.name}
                                        </option>
                                      );
                                    })}
                                </datalist>
                              </div>
                            </div>
                            <div className="col-sm-6 col-md-6">
                              <div className="form-group">
                                <label htmlFor="Storypoint" style={labelStyle}>
                                  Storypoint
                                </label>
                                <span style={{ color: "red" }}>*</span>
                                <input
                                  type="number"
                                  name="storyPoint"
                                  className="form-control"
                                  placeholder="Story Point"
                                  min="1"
                                  value={subTask.storyPoint}
                                  onChange={
                                    this.state.taskParamsId
                                      ? this.handlesubTaskInputChange.bind(
                                          this,
                                          subTask._id,
                                          this.state.taskParamsId
                                        )
                                      : this.handlesubTaskInputChange.bind(
                                          this,
                                          subTask._id,
                                          this.state.taskId
                                        )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-sm-12 col-md-12">
                              <div className="form-group">
                                <label
                                  htmlFor="Dependency Subtask"
                                  style={labelStyle}
                                >
                                  Subtask Dependency
                                </label>
                                <input
                                  type="text"
                                  value={subTask.subtaskhiddenDepName}
                                  list="data1"
                                  onChange={
                                    this.state.taskParamsId
                                      ? this.handlesubTaskInputChange.bind(
                                          this,
                                          subTask._id,
                                          this.state.taskParamsId
                                        )
                                      : this.handlesubTaskInputChange.bind(
                                          this,
                                          subTask._id,
                                          this.state.taskId
                                        )
                                  }
                                  name="subtaskhiddenDepName"
                                  className="form-control"
                                  autoComplete="off"
                                  placeholder="Subtask Dependency"
                                />
                                <datalist id="data1">
                                  {tsubtasks &&
                                    tsubtasks.map((t) => {
                                      return (
                                        <option key={t.id} data-value={t.id}>
                                          {t.title}
                                        </option>
                                      );
                                    })}
                                </datalist>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-sm-6 col-md-6">
                              <input
                                type="submit"
                                value="Save"
                                className="btn btn-info btn-block"
                                onClick={this.onSubmitSubtask.bind(
                                  this,
                                  subTask
                                )}
                                disabled={!subTask.title}
                              />
                            </div>
                            <div className="col-sm-6 col-md-6">
                              <button
                                value="cancel"
                                className="btn btn-info btn-block"
                                onClick={this.onCloseSubtask.bind(
                                  this,
                                  this.state.taskId,
                                  subTask._id
                                )}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <span>
                        <input
                          className=""
                          type="checkbox"
                          checked={subTaskchecked}
                          onChange={
                            this.state.taskParamsId
                              ? this.onToggleSubTask.bind(
                                  this,
                                  subTask,
                                  this.state.taskParamsId
                                )
                              : this.props.onToggleSubTask.bind(
                                  this,
                                  subTask,
                                  this.state.taskId
                                )
                          }
                        />
                        &nbsp;
                        <span
                          title={subTask.title}
                          className="show__overflow_dots subtask_title"
                        >
                          {subTask.title}
                        </span>
                      </span>
                    )}
                  </span>
                  <span className="subtask-actions">
                    <span
                      onClick={
                        this.state.taskParamsId
                          ? this.changeSubtaskSequence.bind(
                              this,
                              this.state.taskParamsId,
                              subTask._id,
                              subTask.sequence,
                              "up"
                            )
                          : this.props.changeSubtaskSequence.bind(
                              this,
                              this.props.taskId,
                              subTask._id,
                              subTask.sequence,
                              "up"
                            )
                      }
                    >
                      <i className="fas fa-arrow-up"></i>
                    </span>
                    <span
                      onClick={
                        this.state.taskParamsId
                          ? this.changeSubtaskSequence.bind(
                              this,
                              this.state.taskParamsId,
                              subTask._id,
                              subTask.sequence,
                              "down"
                            )
                          : this.props.changeSubtaskSequence.bind(
                              this,
                              this.props.taskId,
                              subTask._id,
                              subTask.sequence,
                              "down"
                            )
                      }
                    >
                      <i className="fas fa-arrow-down"></i>
                    </span>
                    {subTask.completed === false ? (
                      <span
                        onClick={
                          this.state.taskParamsId
                            ? this.onTogglesubTaskEdit.bind(
                                this,
                                subTask._id,
                                this.state.taskParamsId
                              )
                            : this.props.onTogglesubTaskEdit.bind(
                                this,
                                subTask._id,
                                this.props.taskId
                              )
                        }
                      >
                        <i className="fas fa-pencil-alt text-success"></i>
                      </span>
                    ) : (
                      ""
                    )}
                    <span
                      onClick={() => {
                        subTask.completed === true
                          ? window.confirm(
                              " Subtask in Completed Status will not be deleted"
                            )
                          : window.confirm(
                              "Are you sure you want to delete this subtask?"
                            );

                        this.state.taskParamsId
                          ? this.onDeleteSubTask(
                              subTask._id,
                              this.state.taskParamsId
                            )
                          : this.props.onDeleteSubTask(
                              subTask._id,
                              this.state.taskId
                            );
                      }}
                    >
                      <i className="far fa-trash-alt text-danger"></i>
                    </span>
                  </span>
                </div>
              )}
            </li>
          );
        });
    }

    let accessRights = Auth.get("access");
    let userRole = Auth.get("userRole");

    let editAll = false;
    editAll = validate.validateEntitlements(
      accessRights,
      this.props.projectId,
      "Task",
      "edit all"
    );
    // console.log("this.state.task.startDate", this.state.task.startDate);
    // console.log("this.state.task.endDate", this.state.task.endDate);

    return (
      <div style={{ border: "1px solid #EEE" }}>
        {!this.state.taskParamsId ? (
          <span
            onClick={this.props.closeTask}
            className="float-right mr-3 mt-2"
          >
            <i className="fas fa-times close"></i>
          </span>
        ) : (
          ""
        )}
        {this.state.taskParamsId ? (
          <h3 className="project-title">
            <Link to={"/project/tasks/" + projectLinkId} className="">
              {projectTitle}
            </Link>
          </h3>
        ) : (
          ""
        )}
        {this.state.titleCheck ? (
          <h4 className="sub-title ml-3 mt-2">{this.state.editTitle}</h4>
        ) : (
          <h4 className="sub-title ml-3 mt-2">Add Task</h4>
        )}
        <hr />

        {this.state.taskId || this.state.taskParamsId ? (
          <div className="nav nav-tabs nav-fill" role="tablist">
            <a
              className="nav-item nav-link active"
              href="#editTask"
              aria-controls="editTask"
              data-height="true"
              role="tab"
              data-toggle="tab"
              onClick={this.handleTabClick.bind(this, "editTask")}
            >
              Task
            </a>

            <a
              className="nav-item nav-link "
              href="#messages"
              aria-controls="messages"
              role="tab"
              data-height="true"
              data-toggle="tab"
              onClick={this.handleTabClick.bind(this, "messages")}
            >
              Messages{" "}
              <span className="text-warning">
                (
                {this.state.taskParamsId
                  ? this.state.messages !== undefined &&
                    this.state.messages.length
                  : this.props.messages !== undefined &&
                    this.props.messages.length}
                )
              </span>
            </a>

            <a
              className="nav-item nav-link "
              href="#uploads"
              aria-controls="uploads"
              role="tab"
              data-height="true"
              data-toggle="tab"
              onClick={this.handleTabClick.bind(this, "uploads")}
            >
              Attachment(s){" "}
              <span className="text-warning">
                (
                {this.state.taskParamsId
                  ? this.state.uploadFiles !== undefined &&
                    this.state.uploadFiles.length
                  : this.props.uploadFiles !== undefined &&
                    this.props.uploadFiles.length}
                )
              </span>
            </a>
          </div>
        ) : (
          ""
        )}

        <div className="tab-content">
          <div role="tabpanel" className="tab-pane active" id="editTask">
            <div className="form-wrapper">
              <form onSubmit={this.onSubmit} id="task">
                <div className="form-group">
                  {this.state.formErrors ? (
                    <FormErrors formErrors={this.state.formErrors} />
                  ) : (
                    ""
                  )}
                  {this.state.errUserMessage || this.state.errMessage ? (
                    <span className="alert alert-danger">
                      {this.state.errUserMessage
                        ? this.state.errUserMessage
                        : this.state.errMessage}
                    </span>
                  ) : (
                    ""
                  )}

                  {checkMsg && this.state.messagesuccess ? (
                    <div className="alert alert-success">
                      {this.state.messagesuccess}
                    </div>
                  ) : (
                    <div>{this.state.message}</div>
                  )}
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="Task Name" style={labelStyle}>
                        Task Name
                      </label>
                      <span style={{ color: "red" }}>*</span>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        autoComplete="off"
                        placeholder="Task Name"
                        value={title}
                        onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="Status" style={labelStyle}>
                        Status
                      </label>
                      <span style={{ color: "red" }}>*</span>
                      <select
                        value={status}
                        onChange={this.handleInputChange}
                        name="status"
                        className="form-control"
                      >
                        <option value="" disabled>
                          Select Status
                        </option>
                        <option value="new">New</option>
                        <option value="inprogress">In Progress</option>
                        <option value="onHold">On hold</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="Dependency Task" style={labelStyle}>
                        Task Dependency
                      </label>
                      <input
                        type="text"
                        value={hiddenDepId}
                        list="data"
                        onChange={this.handleInputChange}
                        name="hiddenDepId"
                        className="form-control"
                        autoComplete="off"
                        placeholder="Task Dependency"
                      />
                      <datalist id="data">
                        {pTasks &&
                          pTasks.map((t) => {
                            return (
                              <option key={t.id} data-value={t.id}>
                                {t.title}
                              </option>
                            );
                          })}
                      </datalist>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="StoryPoint" style={labelStyle}>
                        Story Point ({config.storyPoint})
                      </label>
                      <span style={{ color: "red" }}>*</span>
                      <input
                        type="number"
                        name="storyPoint"
                        className="form-control"
                        placeholder="Story Point"
                        min="1"
                        value={storyPoint}
                        onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="input-group">
                      <label htmlFor="Start Date" style={labelStyle}>
                        Start Date
                      </label>
                      {this.state.task.status === "inprogress" ||
                      this.state.task.status === "completed" ? (
                        <span style={{ color: "red" }}>*</span>
                      ) : (
                        ""
                      )}

                      <Calendar
                        width="235px"
                        height="225px"
                        className="form-control"
                        dateformat={"YYYY-MM-DD"}
                        selectedDate={startDate ? startDate : ""}
                        dateUpdate={this.dateUpdate.bind(this, "startDate")}
                        id="startDate"
                        calendarModalId="startDateModal"
                        disabled={
                          currentUser && !editAll && this.state.taskId
                            ? true
                            : false
                        }
                      />
                      {/* <input type="date" name="startDate" className="form-control"
                                                placeholder="Start Date"
                                                value={startDate ? startDate : ""}
                                                onChange={this.handleInputChange}
                                                disabled={currentUser && !editAll && this.state.taskId ? true : false} /> */}
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="input-group">
                      <label htmlFor="End Date" style={labelStyle}>
                        End Date
                      </label>
                      {this.state.task.status === "inprogress" ||
                      this.state.task.status === "completed" ? (
                        <span style={{ color: "red" }}>*</span>
                      ) : (
                        ""
                      )}
                      &nbsp; &nbsp; &nbsp;
                      <Calendar
                        width="235px"
                        height="225px"
                        className="form-control"
                        dateformat={"YYYY-MM-DD"}
                        selectedDate={endDate ? endDate : ""}
                        dateUpdate={this.dateUpdate.bind(this, "endDate")}
                        id="endDate"
                        calendarModalId="endDateModal"
                        disabled={
                          currentUser && !editAll && this.state.taskId
                            ? true
                            : false
                        }
                      />
                      {/* <input type="date" name="endDate" className="form-control"
                                                placeholder="End Date"
                                                value={endDate ? endDate : ""}
                                                onChange={this.handleInputChange}
                                                disabled={currentUser && !editAll && this.state.taskId ? true : false} /> */}
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="Task Type" style={labelStyle}>
                        Task Type
                      </label>
                      <span style={{ color: "red" }}>*</span>
                      <select
                        value={taskType}
                        onChange={this.handleInputChange}
                        name="taskType"
                        className="form-control"
                      >
                        <option value="" disabled>
                          Select Task Type
                        </option>
                        {taskTypes.map((t) => {
                          return (
                            <option key={t.title} value={t.title}>
                              {t.displayName}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="Select User" style={labelStyle}>
                        Select Member:
                      </label>
                      {currentUser && !editAll ? (
                        ""
                      ) : (
                        <span
                          title="Add users to project"
                          onClick={() => {
                            this.onShowAddUserModal(this.state.taskId);
                          }}
                          style={{ marginLeft: "10px", color: "#FF9800" }}
                        >
                          <i className="fas fa-plus-square"></i>
                        </span>
                      )}
                      {currentUser && !editAll ? (
                        <input
                          type="text"
                          value={hiddenUserId}
                          list="usersData"
                          onChange={this.handleInputChange}
                          name="hiddenUserId"
                          className="form-control"
                          autoComplete="off"
                          disabled
                        />
                      ) : (
                        <input
                          type="text"
                          value={hiddenUserId}
                          list="usersData"
                          onChange={this.handleInputChange}
                          name="hiddenUserId"
                          className="form-control"
                          autoComplete="off"
                          placeholder="Select User"
                        />
                      )}
                      <datalist id="usersData">
                        {project &&
                          project.projectUsers.map((u) => {
                            return (
                              <option key={u.userId} data-value={u.userId}>
                                {u.name}
                              </option>
                            );
                          })}
                      </datalist>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="Task Priority" style={labelStyle}>
                        Task Priority
                      </label>
                      <span style={{ color: "red" }}>*</span>
                      <select
                        value={priority}
                        onChange={this.handleInputChange}
                        name="priority"
                        className="form-control"
                      >
                        <option value="" disabled>
                          Select Task Priority
                        </option>
                        {taskPriorities &&
                          taskPriorities.map((t) => {
                            return (
                              <option key={t._id} value={t.priority}>
                                {t.displayName}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-12">
                    <div className="form-group">
                      <label htmlFor="Description" style={labelStyle}>
                        Description
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      {this.state.taskId ? (
                        <span
                          className="pull-right"
                          onClick={() => {
                            this.onShowTaskModal(this.state.taskId);
                          }}
                          title="Show Description"
                          style={{ cursor: "pointer" }}
                        >
                          <small>
                            &nbsp; <i className="fas fa-external-link-alt"></i>
                          </small>
                        </span>
                      ) : (
                        ""
                      )}
                      <textarea
                        name="description"
                        className="form-control"
                        value={description}
                        placeholder="Description"
                        onChange={this.handleInputChange}
                        style={{ height: "75px" }}
                      />
                    </div>
                  </div>
                </div>

                {!this.state.taskId &&
                !this.state.taskParamsId &&
                (userRole !== "user" || editAll === true) ? (
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label
                          style={{
                            fontSize: "small",
                            marginRight: "7px",
                            textTransform: "capitalize",
                          }}
                        >
                          Replicate for multiple Members
                        </label>
                        &nbsp;
                        <input
                          type="checkbox"
                          name="allowMultipleUsers"
                          onChange={this.handleInputChange}
                          checked={allowMultipleUsers}
                        />
                      </div>
                    </div>

                    {allowMultipleUsers === true ? (
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label htmlFor="Select Users" style={labelStyle}>
                            Select Members
                          </label>
                          <input
                            type="text"
                            value={selectUsers}
                            className="form-control"
                            onKeyDown={this.onUserKeyPress.bind(this)}
                            onChange={this.handleInputChange}
                            placeholder="Select Members"
                            name="selectUsers"
                            autoComplete="off"
                            style={{ position: "relative" }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              left: "16px",
                              top: "64px",
                              width: "92%",
                              border: "1px solid #ccc4c4",
                              height: "100px",
                              overflowY: "auto",
                              background: "#fff",
                              zIndex: 50,
                            }}
                            hidden={this.state.dropdownHidden}
                          >
                            <ul
                              type="none"
                              style={{ paddingLeft: "30px" }}
                              id="search_users"
                            >
                              {this.state.projectUsersDropdown}
                            </ul>
                          </div>
                          {assignusers}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ) : (
                  ""
                )}

                <div className="row">
                  <div className="col-sm-12">
                    <div className="form-group">
                      <label htmlFor="Tag" style={labelStyle}>
                        Tag
                      </label>
                      <input
                        type="text"
                        name="tag"
                        className="form-control"
                        placeholder="Press comma to add Tag"
                        onKeyUp={(e) => this.onKeyUp(e)}
                      />
                      {tags && tags.length > 0 ? (
                        <div
                          style={{
                            height: "45px",
                            overflowY: "auto",
                            overflowX: "hidden",
                          }}
                        >
                          <i className="fas fa-tags mytags"></i> &nbsp; {tags}
                        </div>
                      ) : (
                        <span>
                          <i className="fas fa-tags mytags"></i> &nbsp;{" "}
                          <small className="text-muted">Tags...</small>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row mb-5">
                  <div className="col-sm-12">
                    <input
                      type="submit"
                      className="btn btn-info btn-block"
                      value="Submit"
                      //      disabled={this.state.formValid ? this.state.errMessage :
                      //     (!(this.state.titleValid &&
                      //         this.state.descriptionValid) || this.state.errMessage)
                      // }
                      disabled={
                        this.state.task.status === "inprogress" ||
                        this.state.task.status === "completed"
                          ? !(
                              title &&
                              description &&
                              startDate &&
                              endDate &&
                              !this.state.submitDisabled
                            )
                          : !(
                              title &&
                              description &&
                              !this.state.submitDisabled
                            )
                      }
                    />
                  </div>
                </div>
              </form>
              {this.state.taskId || this.state.taskParamsId ? (
                <div>
                  <span
                    style={{
                      marginLeft: "6px",
                      fontSize: "15px",
                      fontWeight: "bold",
                    }}
                  >
                    Sub Tasks
                  </span>
                  <span
                    title="New Subtask"
                    onClick={
                      this.state.taskParamsId
                        ? this.onToggleNewSubTask.bind(
                            this,
                            this.state.taskParamsId,
                            -1
                          )
                        : this.props.onNewSubTask &&
                          this.props.onNewSubTask.bind(
                            this,
                            this.state.taskId,
                            taskUserId,
                            -1,
                            true
                          )
                    }
                  >
                    &nbsp;{" "}
                    <span className="label label-info float-right">
                      <i className="fas fa-plus "></i>
                    </span>
                  </span>
                </div>
              ) : (
                ""
              )}

              {this.state.taskId || this.state.taskParamsId ? (
                <div>
                  <div className="row">
                    <div className="col-sm-12">
                      <ol id="subtask-list">{subTasksView}</ol>
                    </div>
                  </div>
                  <footer className="task-footer">
                    Created by {uCreatedBy} on {uCreatedOn}
                  </footer>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>

          {this.state.taskId ? (
            <ModalSmall
              show={this.state.isOpen}
              onClose={this.toggleModal}
              title="Task Description"
            >
              {formattedDesc}
            </ModalSmall>
          ) : (
            ""
          )}

          <ModalSmall
            show={this.state.isAddUserModalOpen}
            onClose={this.toggleAddUserModal}
            title="Add users to project"
          >
            <AddProjectUser
              projectId={this.state.projectId}
              users={this.state.users}
              userNameToId={this.state.userNameToId}
              user={this.state.user}
              getProjectTasks={this.props.getProjectTasks}
              project={this.state.project}
            />
          </ModalSmall>

          <div role="tabpanel" className="tab-pane" id="messages">
            <MessageList
              messages={this.state.messages}
              projectId={
                !this.state.projectId
                  ? this.state.projectParamsId
                  : this.state.projectId
              }
              deleteMessageTask={
                this.state.taskParamsId
                  ? this.state.deleteMessageTask
                  : this.props.deleteMessageTask
              }
              taskId={
                !this.state.taskId ? this.state.taskParamsId : this.state.taskId
              }
              users={this.props.context.state.users}
              addTaskMsg={
                this.state.taskParamsId
                  ? this.addTaskMsg
                  : this.props.addTaskMsg
              }
              user={this.props.context.state.user}
            />
          </div>

          <div role="tabpanel" className="tab-pane" id="uploads">
            <UploadFile
              uploadFiles={this.state.uploadFiles}
              projectId={
                !this.state.projectId
                  ? this.state.projectParamsId
                  : this.state.projectId
              }
              taskId={
                !this.state.taskId ? this.state.taskParamsId : this.state.taskId
              }
              addUploadTaskFile={
                this.state.taskParamsId
                  ? this.addUploadTaskFile
                  : this.props.addUploadTaskFile
              }
              deleteTaskFileById={
                this.state.taskParamsId
                  ? this.deleteTaskFileById
                  : this.props.deleteTaskFileById
              }
            />
          </div>
        </div>
      </div>
    );
  }
}
