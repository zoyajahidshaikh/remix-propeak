import React, { Component } from 'react';
import '../../app.css';
import '../../features/category/category.css';
import Auth from '../../utils/auth';
import Dashboard from './dashboard';
import TaskForm from './task-form';
import TaskMenu from './task-menu';
import * as taskservice from "../../Services/task/task-service";
import * as subtaskservice from "../../Services/subtask/subtask-service";
import * as taskcloneservice from "../../Services/task/task-clone-service";
import * as dateUtil from '../../utils/date-util';
import cloneDeep from 'lodash/cloneDeep';
import * as ObjectId from '../../utils/mongo-objectid';
import config from '../../common/config';
import _ from 'lodash';
import '../project/project.css';
// import Modal from '../../features/modal'
import { Link } from 'react-router-dom';
import { reduce } from 'rxjs-compat/operator/reduce';


export default class TaskMain extends Component {
  constructor(props) {
    super(props);

    this.inputSearch = React.createRef();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getUser = this.getUser.bind(this);
    this.onCloneTask = this.onCloneTask.bind(this);
    this.onDeleteTask = this.onDeleteTask.bind(this);
    this.onDeleteSubTask = this.onDeleteSubTask.bind(this);
    this.toggleSubTask = this.toggleSubTask.bind(this);
    this.onToggleSubTask = this.onToggleSubTask.bind(this);
    this.onToggleComplete = this.onToggleComplete.bind(this);
    this.toggleCompleted = this.toggleCompleted.bind(this);
    this.onEditTask = this.onEditTask.bind(this);
    this.onEditTaskDesc = this.onEditTaskDesc.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.onToggleEdit = this.onToggleEdit.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onReorderTask = this.onReorderTask.bind(this);
    this.updateTasksSequence = this.updateTasksSequence.bind(this);
    this.addSubTask = this.addSubTask.bind(this);
    this.onToggleNewSubTask = this.onToggleNewSubTask.bind(this);
    this.onAddSubTask = this.onAddSubTask.bind(this);
    this.onEditSubTask = this.onEditSubTask.bind(this);
    this.onTogglesubTaskEdit = this.onTogglesubTaskEdit.bind(this);
    this.formatTasks = this.formatTasks.bind(this);
    this.keyCheck = this.keyCheck.bind(this);
    this.getProjectTasks = this.getProjectTasks.bind(this);
    this.getAllProjectTasks = this.getAllProjectTasks.bind(this);
    this.addNewTaskWindow = this.addNewTaskWindow.bind(this);
    this.closeTask = this.closeTask.bind(this);
    this.editTaskWindow = this.editTaskWindow.bind(this);
    this.addTask = this.addTask.bind(this);
    this.editTask = this.editTask.bind(this);
    this.addTaskMsg = this.addTaskMsg.bind(this);
    this.deleteMessageTask = this.deleteMessageTask.bind(this);
    this.getMessages = this.getMessages.bind(this);
    this.addUploadTaskFile = this.addUploadTaskFile.bind(this);
    this.deleteTaskFileById = this.deleteTaskFileById.bind(this);
    this.getUploadFiles = this.getUploadFiles.bind(this);
    this.onSelectViewChange = this.onSelectViewChange.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.searchTasks = this.searchTasks.bind(this);
    // this.subTaskKeyUp = this.subTaskKeyUp.bind(this);
    //this.onSubmitSubtask = this.onSubmitSubtask.bind(this);
    this.onCancelSubtask = this.onCancelSubtask.bind(this);
    this.delayedCallback = _.debounce(this.handleChangeCall, config.delayTime);
    this.changeSubtaskSequence = this.changeSubtaskSequence.bind(this);
  }
  state = {
    pTasks: [],
    users: this.props.context.state.users,
    messages: [],
    uploadFiles: [],
    project: {},
    projectId: this.props.projectId,
    tasks: [],
    taskPriorities: this.props.context.state.taskPriorities,
    categories: this.props.context.state.categories,
    isLoaded: true,
    showNewTask: false,
    showEditTask: false,
    editTaskId: "",
    selectedView: "kanbanView",
    taskViews: [
      { id: 'kanbanView', desc: 'Kanban View' },
      { id: 'calendarView', desc: 'Calendar View' },
    ],
    updatedTime: dateUtil.getTime(),
    appLevelAccess: this.props.context.state.appLevelAccess,
    // showAddSubTaskModal: false,
    // showEditSubTaskModal: false,
  }

  handleInputChange(event) {
    event.persist()
    this.delayedCallback(event)

  }
  handleChangeCall(event) {
    if (event.target.value === '') {
      this.setState({
        updatedTime: dateUtil.getTime()
      })
    }

  }

  getUser(userId) {
    var users = this.props.context.state.users;
    var user = users.filter((user) => {
      return user.id === userId;
    });
    return user[0];
  }

  async onCloneTask(taskId) {
    let { response, err } = await taskcloneservice.addCloneTask(this.state.projectId, taskId);
    if (err) {
      this.setState({
        message: 'Error : ' + err,
        labelvalue: 'Error : ' + err,
        updatedTime: dateUtil.getTime()
      });
    } else if (response && response.data.err) {
      this.setState({
        message: 'Error : ' + response.data.err,
        labelvalue: 'Error : ' + response.data.err,
        updatedTime: dateUtil.getTime()
      });
    }
    else {
      this.setState({
        tasks: [...this.state.tasks, response.data],
        updatedTime: dateUtil.getTime()
      })
    }
  }

  async onDeleteTask(taskId) {

    let tasks = this.state.tasks.filter((task) => {
      return task._id === taskId
    });
    let subtaskId = tasks.length > 0 ? tasks[0].subtaskId : ''
    let subtaskData = []
    for (let i = 0; i < this.state.tasks.length; i++) {
      for (let j = 0; j < this.state.tasks[i].subtasks.length; j++) {

        if (subtaskId === this.state.tasks[i].subtasks[j]._id) {
          subtaskData.push(this.state.tasks[i].subtasks[j])
        }
      }
    }

    if (subtaskData.length) {
      let subtask = subtaskData[0];
      let updatedTasks = this.state.tasks && this.state.tasks.map((t) => {

        if (subtask.taskId === t._id) {
          var remainingSubTasks = t.subtasks && t.subtasks.filter((subTask) => {

            if (subTask._id === subtask._id) {
              if (subTask.completed === true) {
                subTask.isDeleted = false;
              }
              else {

                subTask.isDeleted = true;
                this.toggleSubTask(subTask, subtask.taskId, this.state.projectId);
                return false;
              }
            }
            return true;
          })
          t.subtasks = remainingSubTasks;
        }
        return t;
      })


      this.setState({
        tasks: updatedTasks,
        updatedTime: dateUtil.getTime()
      });
    }

    if (tasks && tasks.length > 0) {
      let task = tasks[0];
      task.isDeleted = true;
      this.toggleEdit(task, this.state.projectId);

      let tasks1 = this.state.tasks.filter((t) => {
        return t._id !== task._id;
      });
      this.setState({
        tasks: tasks1,
        updatedTime: dateUtil.getTime()
      })
    }

  }

  async onDeleteSubTask(subTaskId, taskId) {
    let tasks = cloneDeep(this.state.tasks);
    let taskData = tasks.filter((t) => {
      return t.subtaskId === subTaskId

    })
    let taskid = taskData.length > 0 ? taskData[0]._id : ''
    let updatedTasks = tasks.map((t) => {
      if (taskId === t._id) {
        var remainingSubTasks = t.subtasks.filter((subTask) => {

          if (subTask._id === subTaskId) {
            if (subTask.completed === true) {
              subTask.isDeleted = false;
            }
            else {

              subTask.isDeleted = true;
              this.toggleSubTask(subTask, taskId, this.state.projectId);
              return false;
            }
          }
          return true;
        })
        t.subtasks = remainingSubTasks;
      }
      return t;
    })


    this.setState({
      tasks: updatedTasks,
      updatedTime: dateUtil.getTime()
    });
    if (taskData.length > 0) {
      this.onDeleteTask(taskid)
      // taskData[0].isDeleted
      // task = taskData[0]

      let tasks1 = tasks.filter((t) => {
        return t._id !== taskid;
      });
      this.setState({
        tasks: tasks1,
        updatedTime: dateUtil.getTime()
      })
    }

  }

  async toggleSubTask(subTask, taskId, projectId) {
    let { subtasks, subtaskserr } = await subtaskservice.toggleSubTask(subTask, taskId, projectId);
    if (subtaskserr) {
      this.setState({
        message: 'Error: ' + subtaskserr,
        updatedTime: dateUtil.getTime()
      });
    } else if (subtasks && subtasks.data.err) {
      this.setState({
        message: 'Error: ' + subtasks.data.err,
        updatedTime: dateUtil.getTime()
      });
    }
  }

  // Toggle of subtask
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
      subTask.dateOfCompletion = '';
    }

    let mofifiedSubtasks = task && task.subtasks.map((s) => {

      if (s._id === subTask._id) {
        s = subTask;
      }
      return s;
    })

    let taskData = tasks && tasks.filter((t) => {
      return t.subtaskId === subTask._id
    })
    if (taskData.length > 0) {
      taskData[0].completed = subTask.completed;
      if (subTask.completed === true) {
        taskData[0].status = 'completed';
        taskData[0].category = 'completed';
      }
      else {
        taskData[0].status = 'inprogress';
        taskData[0].category = 'inprogress';
      }

      let task = taskData[0]
      this.toggleEdit(task, this.state.projectId);
    }
    task.subtasks = mofifiedSubtasks;

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
    task.dateOfCompletion = '';
    if (markParentTask === true) {
      task.status = "completed";
      task.dateOfCompletion = new Date();
    }

    if (isAllSubTaskCompleted) {
      task.completed = true;
      // task.status = "completed";
      // task.dateOfCompletion = new Date();
    }

    this.toggleEdit(task, this.state.projectId);

    let subTasks = task.subtasks;
    this.setState({
      ...subTasks,
      task,
      updatedTime: dateUtil.getTime()
    });
  }

  // Toggle complete of Task
  onToggleComplete(taskId) {

    let taskS = Object.assign([], this.state.tasks);
    let matchedTasks = taskS.filter((t) => {
      return taskId === t._id;
    })

    let task = (matchedTasks && matchedTasks.length > 0) ? matchedTasks[0] : null;

    let taskData = [];
    for (let i = 0; i < taskS.length; i++) {
      for (let j = 0; j < task.subtasks.length; j++) {
        if (taskS[i].subtaskId === task.subtasks[j]._id) {
          taskData.push(taskS[i])
        }
      }
    }
    let subtaskData = []
    for (let i = 0; i < taskS.length; i++) {
      for (let j = 0; j < taskS[i].subtasks.length; j++) {
        if (task.subtaskId === taskS[i].subtasks[j]._id) {
          subtaskData.push(taskS[i].subtasks[j])
        }
      }
    }
    if (subtaskData.length) {
      let subtask = subtaskData[0]
      //subtask.completed = !subtask.completed;
      this.onToggleSubTask(subtask, subtask.taskId);
    }
    var subTasks = task.subtasks;
    task.dateOfCompletion = '';
    task.completed = !task.completed;
    if (task.completed === true) {
      task.status = "completed";
      // task.category='completed'
      // task.dateOfCompletion = new Date();
      if (task.dateOfCompletion === '') {
        task.dateOfCompletion = new Date();
      }
    }
    else {
      if (task.category === 'inprogress') {
        task.status = 'inprogress';
      }
      else {
        task.status = 'new';
      }
      //task.status = task.category;
      //task.dateOfCompletion = new Date();
    }
    this.toggleEdit(task, this.state.projectId);
    subTasks.map((subTask) => {

      subTask.completed = task.completed;
      this.toggleCompleted(subTask, taskId, this.state.projectId);
      return subTask
    });
    if (taskData.length > 0) {
      // let t1 = taskData[0];
      for (let i = 0; i < taskData.length; i++) {
        if (task.completed === true) {
          taskData[i].completed = true;
          taskData[i].status = "completed";
          if (taskData[i].dateOfCompletion === '') {
            taskData[i].dateOfCompletion = new Date();
          }

        }
        else {
          taskData[i].completed = false;
          // taskData[i].status = taskData[i].category;
          if (taskData[i].category === 'inprogress') {
            taskData[i].status = 'inprogress';
          }
          else {
            taskData[i].status = 'new';
          }
        }
        this.toggleEdit(taskData[i], this.state.projectId);
      }

    }

    this.setState({
      subTasks,
      updatedTime: dateUtil.getTime()
    });
  }
  async toggleCompleted(subTask, subTaskId, projectId) {
    let { subtasks, subtaskserr } = await subtaskservice.toggleCompleted(subTask, subTaskId, projectId);
    if (subtaskserr) {
      this.setState({
        message: 'Error: ' + subtaskserr,
        updatedTime: dateUtil.getTime()
      });
    } else if (subtasks && subtasks.data.err) {
      this.setState({
        message: 'Error: ' + subtasks.data.err,
        updatedTime: dateUtil.getTime()
      });
    }

  }

  onEditTask(taskId, editInput) {
    var tasks = this.state.tasks.map((task) => {
      if (task._id === taskId) {
        task.title = editInput.value

      }
      return task;
    });

    this.setState({
      tasks,
      updatedTime: dateUtil.getTime()
    });
  }

  onEditTaskDesc(taskId, desc) {
    var tasks = this.state.tasks.map((task) => {
      if (task._id === taskId) {
        task.description = desc;
      }
      return task;
    });

    this.setState({
      tasks,
      updatedTime: dateUtil.getTime()
    });

  }

  async toggleEdit(task, projectId) {
    let { tasks, taskErr } = await taskservice.toggleEditTask(task, projectId);
    if (taskErr) {
      this.setState({
        message: 'Error: ' + taskErr,
        updatedTime: dateUtil.getTime()
      });
    } else if (tasks && tasks.data.err) {
      this.setState({
        message: 'Error: ' + tasks.data.err,
        updatedTime: dateUtil.getTime()
      });
    }
    else {
      let tasks = this.state.tasks.map((t) => {
        if (t._id === task._id) {
          t = task;
        }
        return t;
      });
      this.setState({
        tasks,
        updatedTime: dateUtil.getTime()
      });

    }
  }

  onToggleEdit(taskId) {
    var tasks = this.state.tasks.map((task) => {
      if (task.id === taskId) {
        task.edit = !task.edit;
        if (!task.edit) {
          task.projectId = this.state.projectId;
          this.toggleEdit(task, taskId);
        }

      }
      return task;
    });

    this.setState({
      tasks,
      updatedTime: dateUtil.getTime()
    });
  }

  onDragStart(id, ev) {
    ev.dataTransfer.setData("text/plain", ev.target.dataset.id);
  }

  onDrag(id, ev) {
  }

  onDragOver(ev) {
    ev.preventDefault();
  }

  onDrop(cat, ev) {
    ev.preventDefault();
    let userRole = Auth.get('userRole');

    if (userRole === 'user' && cat === "inprogress") {
      let userId = Auth.get('userId');
      let numberOfInprogressTasks = this.state.project.tasks.filter((t) => {
        return t.userId === userId && t.category === cat;
      })
      if (numberOfInprogressTasks.length >= config.maxInprogressTaskCount) {
        return;
      }
    }

    var taskId = ev.dataTransfer.getData("text/plain");
    let tasks = Object.assign([], this.state.tasks);
    let task = tasks.filter((task) => {
      return task._id === taskId;
    });
    // console.log("task", task);
    let subtaskId = task.length > 0 ? task[0].subtaskId : ''
    let subtaskData = []
    for (let i = 0; i < tasks.length; i++) {
      for (let j = 0; j < tasks[i].subtasks.length; j++) {

        if (subtaskId === tasks[i].subtasks[j]._id) {
          subtaskData.push(tasks[i].subtasks[j])
        }
      }
    }
    //console.log("subtaskData", subtaskData);

    if (subtaskData.length > 0) {
      let subtask = subtaskData[0];
      task.category = cat;

      if (cat === "completed") {
        subtask.completed = false;


      } else if (cat === "todo") {
        subtask.completed = true;

      } else {
        subtask.completed = true;

      }
      this.onToggleSubTask(subtask, subtask.taskId);
    }
    let linkedTasks = []
    if (task.length > 0) {
      for (let i = 0; i < task[0].subtasks.length; i++) {
        for (let j = 0; j < tasks.length; j++) {
          if (tasks[j].subtaskId === task[0].subtasks[i]._id) {
            linkedTasks.push(tasks[j])
          }
        }
      }
    }
    // console.log("linkedTask", linkedTasks);
    if (linkedTasks.length > 0) {
      linkedTasks.map((task) => {
        // if (task._id === taskId) {

        task.category = cat;

        let date = dateUtil.DateToString(new Date())
        if (cat === "completed") {
          task.completed = true;
          task.status = cat;
          if (task.dateOfCompletion === '') {
            task.dateOfCompletion = new Date();
          }

          if ((task.startDate === undefined || task.startDate === null || task.startDate === "") || (task.endDate === undefined || task.endDate === null || task.endDate === "")) {
            task.startDate = date;

            task.endDate = date;

          }

        } else if (cat === "todo") {
          task.status = "new";
          task.completed = false;
          task.dateOfCompletion = '';

        } else {
          task.completed = false;

          task.status = cat;
          if ((task.startDate === undefined || task.startDate === null)) {
            task.startDate = date;

          }
        }

        task.modifiedBy = Auth.get("userId");
        // task.modifiedOn = new Date();

        this.toggleEdit(task, this.state.projectId);

        // }
        return task;
      });
    }

    if (task && task.length === 0) { return; }
    if (task && task.length > 0 && task[0].category === cat) { return; }
    else {
      let updatedTasks = tasks.map((task) => {
        if (task._id === taskId) {

          task.category = cat;

          let date = dateUtil.DateToString(new Date())
          if (cat === "completed") {
            task.completed = true;
            task.status = cat;
            if (task.dateOfCompletion === '') {
              task.dateOfCompletion = new Date();
            }
            // task.dateOfCompletion = new Date();
            for (let i = 0; i < task.subtasks.length; i++) {
              task.subtasks[i].completed = true
            }


            if ((task.startDate === undefined || task.startDate === null || task.startDate === "") || (task.endDate === undefined || task.endDate === null || task.endDate === "")) {
              task.startDate = date;

              task.endDate = date;

            }

          } else if (cat === "todo") {
            task.status = "new";
            task.completed = false;
            task.dateOfCompletion = '';
            for (let i = 0; i < task.subtasks.length; i++) {
              task.subtasks[i].completed = false
            }

          } else {
            task.completed = false;
            for (let i = 0; i < task.subtasks.length; i++) {
              task.subtasks[i].completed = false
            }
            task.status = cat;
            if ((task.startDate === undefined || task.startDate === null || task.startDate === "")) {
              task.startDate = date;

            }
          }

          task.modifiedBy = Auth.get("userId");
          // task.modifiedOn = new Date();

          this.toggleEdit(task, this.state.projectId);

        }
        return task;
      });

      this.setState({
        tasks: updatedTasks,
        updatedTime: dateUtil.getTime()
      });
    }
  }

  onReorderTask(srcTaskId, targetTaskId, targetCat) {
    let srcTask = this.state.tasks.filter((t) => {
      return t._id === srcTaskId;
    })[0];
    let targetTask = this.state.tasks.filter((t) => {
      return t._id === targetTaskId;
    })[0];

    if (srcTask.category === targetTask.category) {

      let catTasks = this.state.tasks.filter((t) => {
        return t.category === targetCat;
      });
      let taskS = [...catTasks];//Object.assign([], projectTasks);


      var destIndex = -1;
      for (let i = 0; i < taskS.length; i++) {
        if (taskS[i]._id === targetTaskId) {
          destIndex = i;
          break
        }

      }

      var srcIndex = -1;
      let srcTask = null;

      for (let i = 0; i < taskS.length; i++) {
        if (taskS[i]._id === srcTaskId) {
          srcIndex = i;
          srcTask = Object.assign({}, taskS[i]);

          break;
        }
      }

      if (srcIndex > destIndex) {
        taskS.splice(srcIndex, 1);
        taskS.splice(destIndex, 0, srcTask);
      }
      else if (srcIndex < destIndex) {
        taskS.splice(destIndex + 1, 0, srcTask);
        taskS.splice(srcIndex, 1);
      }
      var taskSequence = taskS.map((task, index) => {
        let t = Object.assign({}, task);
        t.sequence = index + 1;// maxId;

        return t;
      })
      let noncatTasks = this.state.tasks.filter((t) => {
        return t.category !== targetCat;
      });
      let allTasks = [...noncatTasks, ...taskSequence];
      this.updateTasksSequence(taskSequence, this.state.projectId, allTasks);
    }
  }

  async updateTasksSequence(taskList, projectId, allTasks) {
    let { tasks, taskErr } = await taskservice.updateTasksSequence(taskList, projectId);
    if (taskErr) {
      this.setState({
        message: 'Error: ' + taskErr,
        updatedTime: dateUtil.getTime()
      });
    } else if (tasks && tasks.data.err) {
      this.setState({
        message: 'Error: ' + tasks.data.err,
        updatedTime: dateUtil.getTime()
      });

    }
    else {
      this.setState({
        tasks: allTasks,
        updatedTime: dateUtil.getTime()
      });
    }

  }

  async addSubTask(subTask, projectId, taskTitle) {
    // console.log("subTask in addSubtask", subTask);
    let { subtasks, subtaskserr } = await subtaskservice.addSubTask(subTask, projectId, taskTitle);
    if (subtaskserr) {
      this.setState({
        message: 'Error: ' + subtaskserr,
        updatedTime: dateUtil.getTime()
      });
    } else if (subtasks && subtasks.data.err) {
      this.setState({
        message: 'Error: ' + subtasks.data.err,
        updatedTime: dateUtil.getTime()
      });
    }
  }

  onCancelSubtask(taskId, subTaskId) {

    let tasks = this.state.tasks.map((t1) => {
      let t = cloneDeep(t1);
      if (t._id === taskId) {
        let subtasks;
        let subTaskEdit = t.subtasks.filter((f) => {
          return f._id === subTaskId;
        })
        let editvalue = subTaskEdit.length > 0 ? subTaskEdit[0].edit : '';
        if (editvalue === true) {
          subtasks = t.subtasks.map((m) => {
            m.edit = false
            return m;
          })
          t.subtasks = subtasks;
        }
        else {
          subtasks = t.subtasks.filter((m) => {
            return m._id !== subTaskId;
          })
          t.subtasks = subtasks;
        }

      }
      return t;
    })

    this.setState({
      tasks: tasks,

    });
  }
  // if taskSubTaskId present, then edit mode, otherwise new subtask
  onToggleNewSubTask(taskId, hiddenUserName, taskSubTaskId, form) {
    let hiddenid = this.state.project && this.state.project.projectUsers.filter((u) => {
      return hiddenUserName === u.userId
    })
    let hiddenUsr = (hiddenid.length) ? hiddenid[0].name : '';

    let tasks = this.state.tasks.map((t1) => {
      let t = cloneDeep(t1);

      if (taskId === t._id) {
        // console.log("t in toggleNewsUBTASK", t);
        // console.log("taskSubTaskId", taskSubTaskId);
        if (taskSubTaskId < 0) {
          let newSubTask;
          let maxId = 0;
          if (t.subtasks && t.subtasks.length > 0) {
            maxId = Math.max.apply(Math,
              t.subtasks.map((subtask) => {
                if (subtask.sequence === undefined || subtask.sequence === null) {
                  subtask.sequence = 0;
                }
                return subtask.sequence;
              }
              ));
          }

          // console.log("maxId of subtask", maxId);
          if (form === true) {
            newSubTask = {
              taskId: taskId,
              addform: true,
              hiddenUsrId: '',
              storyPoint: 1,
              title: '',
              _id: ObjectId.mongoObjectId(),
              completed: false,
              edit: false,
              hiddenUserName: hiddenUsr,
              dateOfCompletion: '',
              isDeleted: false,
              subtaskhiddenDepName: '',
              sequence: maxId + 1
            };
          }
          else {
            newSubTask = {
              taskId: taskId,
              add: true,
              hiddenUsrId: '',
              storyPoint: 1,
              title: '',
              _id: ObjectId.mongoObjectId(),
              completed: false,
              edit: false,
              hiddenUserName: hiddenUsr,
              dateOfCompletion: '',
              isDeleted: false,
              subtaskhiddenDepName: '',
              sequence: maxId + 1
            };
          }
          // console.log("newSubTask", newSubTask);
          t.subtasks.push(newSubTask);
        }

      }
      return t;
    });
    this.setState({
      tasks: tasks,
      updatedTime: dateUtil.getTime()
    });
  }
  async  onEditSubTask(subtask) {

    this.toggleSubTask(subtask, subtask.taskId, this.state.projectId);
    let updatedTasks = this.state.tasks.map((t1) => {

      let t = cloneDeep(t1);
      if (t._id === subtask.taskId) {

        let subTasks = t.subtasks && t.subtasks.map((s) => {

          if (s._id === subtask._id) {
            s = subtask
          }
          return s;
        });
        t.subtasks = (subTasks && subTasks.length > 0) ? subTasks : [];
      }
      return t;
    });

    this.setState({
      tasks: updatedTasks,
      updatedTime: dateUtil.getTime()
    });

    var userEmail = this.props.context.state.users.filter((user) => {
      return (user._id === subtask.hiddenUsrId);
    });
    let email = (userEmail.length > 0) ? userEmail[0].email : "";
    let userName = (userEmail.length > 0) ? userEmail[0].name : "";
    let projectName = this.state.project.title;
    let projectOwnerId = this.state.project.userid;
    let depTaskTitle = '';
    let ownerEmailInfo;
    ownerEmailInfo = this.props.context.state.users.filter((owner) => {
      return owner._id === projectOwnerId;
    })
    let ownerEmail = ownerEmailInfo.length > 0 ? ownerEmailInfo[0].email : '';
    // let multiUsers = [];

    let taskd = this.state.tasks && this.state.tasks.filter((t1) => {
      return t1.subtaskId === subtask._id
    })

    if (taskd.length > 0) {
      taskd[0].title = subtask.title;
      taskd[0].userId = subtask.hiddenUsrId;
      taskd[0].storyPoint = subtask.storyPoint;
      taskd[0].projectId = this.state.projectId;

      let id = taskd[0]._id;
      let task = taskd[0]
      let { tasks, taskErr } = await taskservice.editTask(task, id, email, projectName, ownerEmail, userName, depTaskTitle);
      if (taskErr) {
        this.setState({
          message: 'Error: ' + taskErr,
          updatedTime: dateUtil.getTime()
        });
      } else if (tasks && tasks.data.err) {
        this.setState({
          message: tasks.data.err,
          updatedTime: dateUtil.getTime()
        });
      } else {
        this.editTask(task);
      }
    }


  }
  //When subtask title changes.. refactor
  async  onAddSubTask(subTask, e) {
    // console.log("subTask", subTask);
    let taskId = subTask.taskId
    let tasks = Object.assign([], this.state.tasks);
    if (tasks.length > 0) {
      // let subtaskObj;
      for (let i = 0; i < tasks.length; i++) {

        if (taskId === tasks[i]._id) {
          if (tasks[i].userId === subTask.hiddenUsrId) {
            this.addSubTask(subTask, this.state.projectId, "");
            let updatedTasks = this.state.tasks.map((t1) => {

              let t = cloneDeep(t1);

              if (t._id === taskId) {

                let subTasks = t.subtasks && t.subtasks.map((s) => {

                  if (s._id === subTask._id) {
                    s = subTask
                  }
                  return s;
                });
                t.subtasks = (subTasks && subTasks.length > 0) ? subTasks : [];
              }
              return t;
            });

            this.setState({
              tasks: updatedTasks,
              updatedTime: dateUtil.getTime()
            });

          }

          else {
            let taskd = this.state.tasks && this.state.tasks.filter((t) => {
              return t._id === subTask.taskId

            })
            this.addSubTask(subTask, this.state.projectId, "");
            let updatedTasks = this.state.tasks.map((t1) => {

              let t = cloneDeep(t1);
              if (t._id === taskId) {

                let subTasks = t.subtasks && t.subtasks.map((s) => {

                  if (s._id === subTask._id) {
                    s = subTask
                  }
                  return s;
                });
                t.subtasks = (subTasks && subTasks.length > 0) ? subTasks : [];
              }
              return t;
            });

            this.setState({
              tasks: updatedTasks,
              updatedTime: dateUtil.getTime()
            });

            let maxId = Math.max.apply(Math,
              this.state.tasks.map((task) => {
                if (task.sequence === undefined || task.sequence === null) {
                  task.sequence = 0;
                }
                return task.sequence;
              }
              ));
            // console.log("maxId", maxId);
            var userEmail = this.props.context.state.users.filter((user) => {
              return (user._id === subTask.hiddenUsrId);
            });
            let email = userEmail.length > 0 ? userEmail[0].email : '';
            let userName = userEmail.length > 0 ? userEmail[0].name : '';
            let projectName = this.state.project.title;
            // let projectOwnerId = this.state.project.userid;
            let depTaskTitle = '';
            // let ownerEmailInfo;
            // ownerEmailInfo = this.props.context.state.users.filter((owner) => {
            //   return owner._id === projectOwnerId;
            // })
            // let ownerEmail = ownerEmailInfo.length > 0 ? ownerEmailInfo[0].email : '';
            let multiUsers = [];


            let task = {
              title: subTask.title,
              description: '',
              completed: false,
              category: 'todo',
              tag: '',
              status: 'new',
              storyPoint: subTask.storyPoint,
              startDate: dateUtil.DateToString(new Date()),
              endDate: taskd.length > 0 ? taskd[0].endDate : '',
              depId: '',
              taskType: 'task',
              priority: 'medium',
              createdBy: Auth.get('userId'),
              createdOn: new Date(),
              modifiedBy: Auth.get('userId'),
              modifiedOn: new Date(),
              userId: subTask.hiddenUsrId,
              isDeleted: false,
              sequence: maxId + 1,
              allowMultipleUsers: false,
              assignUsers: [],
              selectUsers: '',
              dateOfCompletion: '',
              projectId: this.state.projectId,
              subtasks: [],
              messages: [],
              uploadFiles: [],
              subtaskId: subTask._id,
            }

            let { tasks, taskErr } = await taskservice.addTask(task, email, userName, projectName, depTaskTitle, multiUsers);
            if (taskErr) {
              this.setState({
                message: 'Error: ' + taskErr,
                updatedTime: dateUtil.getTime()
              });
            } else if (tasks && tasks.data.err) {
              this.setState({
                message: 'Error: ' + tasks.data.err,
                updatedTime: dateUtil.getTime()
              });
            }
            else {
              this.addTask(tasks.data.result)

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
        let hiddenid, hiddenUsr, hiddendepname, hiddendepid;
        let subTasks = t.subtasks && t.subtasks.map((s) => {

          if (s._id === subTaskId) {
            hiddenid = this.state.project && this.state.project.projectUsers.filter((u) => {
              return s.hiddenUsrId === u.userId
            })
            hiddenUsr = (hiddenid.length) ? hiddenid[0].name : '';
            hiddendepid = t.subtasks && t.subtasks.filter((st) => {
              return s.subtaskHiddenDepId === st._id;
            })
            hiddendepname = (hiddendepid.length > 0) ? hiddendepid[0].title : "";
            if (s.completed === true) {
              s.edit = false;
            }
            else {
              s.edit = true;
              s.hiddenUserName = hiddenUsr;
              s.subtaskhiddenDepName = hiddendepname;
            }
          }
          return s;
        });
        t.subtasks = (subTasks && subTasks.length > 0) ? subTasks : [];
      }
      return t;
    });

    this.setState({
      tasks: updatedTasks,
      updatedTime: dateUtil.getTime()
    });
  }

  formatTasks(tasks) {
    let getId = Auth.get('userId');
    let getRole = Auth.get('userRole');
    let hiddenUserId = "";
    if (getRole === "user") {
      let userId = this.state.users.filter((u) => {
        return getId === u._id
      });
      var users = (userId && userId.length > 0) ? userId[0].name : ""
      hiddenUserId = users;
    }
    var formattedTasks = tasks && tasks.map((task) => {
      if (task.startDate === undefined || task.startDate === null || task.startDate === '') {
        task.startDate = task.startDate;
      } else {
        task.startDate = task.startDate.substr(0, 10);
      }

      if (task.endDate === undefined || task.endDate === null || task.endDate === '') {
        task.endDate = task.endDate;
      } else {
        var date = new Date().toISOString().substr(0, 10);
        task.endDate = task.endDate.substr(0, 10);
        if (date > task.endDate) {
          var checkDate = date > task.endDate;
          task.taskColor = checkDate ? "task-incompleted" : "";
        }
      }

      if (task.depId === undefined || task.depId === null || task.depId === "") {
        task.hiddenDepId = task.depId;
      } else {
        let pTaskTitle = "";
        let pTask = this.state.pTasks && this.state.pTasks.filter((t) => {
          return t.id === task.depId
        })
        pTaskTitle = (pTask && pTask.length > 0) ? pTask[0].title : '';
        task.hiddenDepId = pTaskTitle;
      }

      if (getRole === "user") {
        task.hiddenUserId = hiddenUserId;
      } else {
        if (task.userId === undefined || task.userId === null || task.userId === "") {
          task.hiddenUserId = task.userId;
        } else {
          let userName = "";
          let uName = this.state.project && this.state.project.projectUsers.filter((u) => {
            return u.userId === task.userId
          })
          userName = (uName && uName.length > 0) ? uName[0].name : '';
          task.hiddenUserId = userName;
        }
      }
      return task;
    });
    return formattedTasks;
  }

  updateSearch() {
    this.setState({
      updatedTime: dateUtil.getTime()
    })
  }

  searchTasks(filtertasks) {
    var tagS = [];

    let searchbyTag = (a, searchTag, tasks) => {
      if (a.toLowerCase().indexOf(searchTag) > -1) {
        tagS.push(cloneDeep(tasks));
      }
    }

    if (filtertasks && filtertasks.length > 0) {
      if (this.inputSearch.current) {
        let searchTag = this.inputSearch.current.value.toLowerCase();// this.state.tagSearch.toLowerCase();
        for (let i = 0; i < filtertasks.length; i++) {
          let isFound = false;
          if (filtertasks[i].title.toLowerCase().indexOf(searchTag) > -1) {
            isFound = true;
          } else if (filtertasks[i].description.toLowerCase().indexOf(searchTag) > -1) {
            isFound = true;
          } else if (filtertasks[i].userId !== null && filtertasks[i].userId !== undefined && filtertasks[i].userId !== '') {
            let user = this.state.users.filter((u) => {
              return filtertasks[i].userId === u._id;
            });
            let userName = (user && user.length > 0) ? user[0].name : '';
            if (userName.toLowerCase().indexOf(searchTag) > -1) {
              isFound = true;
            }
          }
          if (!isFound) {
            if (filtertasks[i].tag !== undefined && filtertasks[i].tag !== null && filtertasks[i].tag !== '') {
              filtertasks[i].tag.split(",").filter((a) => {
                searchbyTag(a, searchTag, filtertasks[i])
                return a;
              })
            }


          }
          else {
            tagS.push(cloneDeep(filtertasks[i]));
          }
        }
      }
      else {
        tagS = cloneDeep(filtertasks);
      }
    }
    return tagS;
  }

  keyCheck(e, isClick) {
    if (e.which === 13 || isClick) {
      this.setState({
        updatedTime: dateUtil.getTime()
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      users: nextProps.context.state.users,
      projectId: nextProps.projectId,
      categories: nextProps.context.state.categories,
      taskPriorities: nextProps.context.state.taskPriorities,
      appLevelAccess: nextProps.context.state.appLevelAccess,
      updatedTime: dateUtil.getTime()
    });
  }

  async getProjectTasks(projectId) {
    let { tasks, taskErr } = await taskservice.getProjectTasks(projectId);
    if (taskErr) {
      this.setState({
        message: taskErr,
        updatedTime: dateUtil.getTime()
      });
    } else if (tasks && tasks.data.err) {
      this.setState({
        message: tasks.data.err,
        updatedTime: dateUtil.getTime()
      });
    }
    else {
      this.props.context.actions.updateState("projectName", tasks.data.title);
      this.setState({
        tasks: tasks.data.tasks,
        project: tasks.data,
        updatedTime: dateUtil.getTime()
      });
    }
  }


  getAllProjectTasks() {
    let pTasks = [];

    for (var i = 0; i < this.state.tasks.length; i++) {
      pTasks.push(
        { id: this.state.tasks[i]._id, title: this.state.tasks[i].title }
      );
    }
    pTasks.sort((a, b) => (a.title > b.title));
    this.setState({
      pTasks,
      updatedTime: dateUtil.getTime()
    });
  }

  async componentDidMount() {
    if (this.state.users.length === 0) {
      this.props.context.actions.setUsers();
    }
    if (this.state.categories.length === 0) {
      this.props.context.actions.setCategories();
    }
    if (this.state.taskPriorities.length === 0) {
      this.props.context.actions.setPriorities();
    }
    if (this.state.appLevelAccess.length === 0) {
      this.props.context.actions.getAppLevelAccessRights();
    }
    await this.getProjectTasks(this.state.projectId);
    await this.getAllProjectTasks();
    this.setState({
      isLoaded: false,
      updatedTime: dateUtil.getTime()
    })

  }

  addNewTaskWindow() {
    this.setState({
      editTaskId: "",
      showNewTask: true,
      updatedTime: dateUtil.getTime()
    })
  }

  closeTask() {
    this.getAllProjectTasks();
    this.setState({
      showNewTask: false,
      showEditTask: false,
      editTaskId: "",
      updatedTime: dateUtil.getTime()
    })
  }

  editTaskWindow(taskId) {
    this.setState({
      showEditTask: true,
      editTaskId: taskId,
      updatedTime: dateUtil.getTime()
    })
  }

  addTask(newTasks) {
    let updatedTasks = Object.assign([], this.state.tasks);
    if (newTasks && newTasks.length > 0) {
      for (let i = 0; i < newTasks.length; i++) {
        updatedTasks.push(newTasks[i]);
      }
    }
    this.setState({
      tasks: updatedTasks,
      updatedTime: dateUtil.getTime()
    })
  }

  editTask(task) {
    let taskS = Object.assign([], this.state.tasks);
    let updatedTasks = taskS.map((t) => {
      if (t._id === task._id) {
        t = task;
      }
      return t;
    });
    this.setState({
      tasks: updatedTasks,
      updatedTime: dateUtil.getTime()
    })
  }

  async addTaskMsg(msg) {
    let objTasks = Object.assign([], this.state.tasks);
    let tasks = objTasks.map((t) => {
      if (t._id === msg.taskId) {
        t.messages = [msg, ...t.messages];
      }
      return t;
    })
    this.setState({
      tasks: tasks,
      messages: [msg, ...this.state.messages],
      updatedTime: dateUtil.getTime()
    })

  }

  deleteMessageTask(taskId, messageId) {
    let objTasks = Object.assign([], this.state.tasks);
    let tasks = objTasks.map((t) => {
      if (t._id === taskId) {
        let messages = t.messages.filter((m) => {
          return m._id !== messageId;
        })
        t.messages = messages;
      }
      return t;
    })
    let messages = this.state.messages.filter((m) => {
      return m._id !== messageId;

    })
    this.setState({
      tasks: tasks,
      messages: messages,
      updatedTime: dateUtil.getTime()
    })
  }

  getMessages(messages) {
    this.setState({
      messages: messages,
      updatedTime: dateUtil.getTime()
    })
  }

  addUploadTaskFile(newFile) {
    let objTasks = Object.assign([], this.state.tasks);
    let tasks = objTasks.map((t) => {
      if (t._id === newFile.taskId) {
        t.uploadFiles = [...t.uploadFiles, newFile];
      }
      return t;
    })
    this.setState({
      tasks: tasks,
      uploadFiles: [...this.state.uploadFiles, newFile],
      updatedTime: dateUtil.getTime()
    })
  }

  deleteTaskFileById(taskId, id) {
    let objTasks = Object.assign([], this.state.tasks);
    let tasks = objTasks.map((t) => {
      if (t._id === taskId) {
        let uploadFiles = t.uploadFiles.filter((f) => {
          return f._id !== id;
        })
        t.uploadFiles = uploadFiles;
      }
      return t;
    })
    let uploadFiles = this.state.uploadFiles.filter((f) => {
      return f._id !== id;
    })
    this.setState({
      tasks: tasks,
      uploadFiles: uploadFiles,
      updatedTime: dateUtil.getTime()
    })
  }

  getUploadFiles(uploadFiles) {
    this.setState({
      uploadFiles: uploadFiles,
      updatedTime: dateUtil.getTime()
    })
  }
  onSelectViewChange(e) {
    let selectedView = e.target.value;
    this.setState({
      selectedView: selectedView,
      updatedTime: dateUtil.getTime()
    });
  }

  handleTabClick(e, name) {
    e.preventDefault();
    const eleClass = document.getElementsByClassName('tab-pane');
    for (let i = 0; i < eleClass.length; i++) {
      eleClass[i].style.display = 'none';
      eleClass[i].className = 'tab-pane';
    }
    const liClass = document.getElementsByClassName('li');
    for (let i = 0; i < liClass.length; i++) {
      liClass[i].className = 'li';
    }
    const ele = document.getElementById(name);
    ele.className += ' active';
    ele.style.display = 'block';
    e.target.parentElement.className += ' active';
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   //console.log("TaskMain shouldComponentUpdate "+(!(isEqual(this.props, nextProps) && this.state.updatedTime===nextState.updatedTime)));
  //   return !(isEqual(this.props, nextProps) && this.state.updatedTime===nextState.updatedTime);
  // }

  changeSubtaskSequence(taskId, subtaskId, index, flag) {

    let tasks = cloneDeep(this.state.tasks);
    if (tasks.length > 0) {

      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i]._id === taskId) {
          let updateTaskFlag = false;
          // console.log("tasks[i].subtasks", tasks[i].subtasks);
          if (tasks[i].subtasks.length > 0) {
            let subTasks = tasks[i].subtasks;
            // console.log("subTasks", subTasks);
            for (let j = 0; j < subTasks.length; j++) {
              if (flag === 'up') {
                if (index !== 1) {
                  if (subTasks[j].sequence === index - 1) {
                    subTasks[j].sequence = index;
                  } else if (subTasks[j].sequence === index) {
                    subTasks[j].sequence = index - 1;
                  }
                  updateTaskFlag = true;

                }
              } else if (flag === 'down') {
                if (index !== subTasks.length) {
                  if (subTasks[j].sequence === index) {
                    subTasks[j].sequence = index + 1;
                  } else if (subTasks[j].sequence === index + 1) {
                    subTasks[j].sequence = index;
                  }
                  // this.toggleEdit(tasks[i], this.state.projectId);
                  updateTaskFlag = true;
                }
              }
            }
          }
          if (updateTaskFlag) {
            this.toggleEdit(tasks[i], this.state.projectId);
          }
        }
      }
    }
    // console.log("tasks", tasks);
    this.setState({
      tasks: tasks
    })

  }

  render() {
    var { users } = this.state;
    var projectName = (this.state.project) ? this.state.project.title : "";
    var tasks1 = [];
    let taskClass = 'col-sm-5 contentWrapper';
    let noTaskClass = 'col-sm-12 contentWrapper';

    let user = this.state.users.filter((u) => {
      return u._id === this.props.userId
    })
    let filterdTasks = this.searchTasks(this.state.tasks);
    var uName = (user && user.length > 0) ? user[0].name : '';

    var dashboard = (projectId) => {
      let tasks = filterdTasks.filter((t) => {
        return t.userId === this.props.userId
      });
      let tasksFilter = (tasks && (tasks.length > 0) ? tasks : []);
      tasks1 = !this.props.userId ? this.formatTasks(filterdTasks) : this.formatTasks(tasksFilter);
      return (this.state.project ?

        <Dashboard
          onReorderTask={this.onReorderTask}
          categories={this.state.categories}
          users={users}
          project={this.state.project}
          projectId={projectId}
          tasks={tasks1}
          getUser={this.getUser}
          taskPriorities={this.state.taskPriorities}
          addNewTaskWindow={this.addNewTaskWindow}
          editTaskWindow={this.editTaskWindow}
          onDeleteTask={this.onDeleteTask}
          onCloneTask={this.onCloneTask}
          onToggleComplete={this.onToggleComplete}
          onToggleEdit={this.onToggleEdit}
          onEditTask={this.onEditTask}
          onEditTaskDesc={this.onEditTaskDesc}
          onDragOver={this.onDragOver}
          onDrag={this.onDrag}
          onDragStart={this.onDragStart}
          onDrop={this.onDrop}
          onToggleNewSubTask={this.onToggleNewSubTask}
          onAddSubTask={this.onAddSubTask}
          onDeleteSubTask={this.onDeleteSubTask}
          onToggleSubTask={this.onToggleSubTask}
          showEditTask={this.state.showEditTask}
          showNewTask={this.state.showNewTask}
          onTogglesubTaskEdit={this.onTogglesubTaskEdit}
          onEditSubTask={this.onEditSubTask}
          view={this.state.selectedView}
          updatedTime={this.state.updatedTime}
          subTaskKeyUp={this.subTaskKeyUp}
          onSubmitSubtask={this.onSubmitSubtask}
          onCancelSubtask={this.onCancelSubtask}
          taskPriority={this.props.context.state.taskPriority}
          category={this.props.context.state.category}
          appLevelAccess={this.state.appLevelAccess}
          userNameToId={this.props.context.state.userNameToId}
          changeSubtaskSequence={this.changeSubtaskSequence}
        /> : ''
      )
    };
    let viewList = this.state.taskViews.map((module, i) => {
      return <option value={module.id} key={module.id}>{module.desc}</option>
    })

    return (
      <div className="container-fluid task-main bg-white">
        {this.state.isLoaded ?
          <div className="logo">
            <img src="/images/loading.svg" alt="loading" />
          </div> :
          <React.Fragment>
            <div className="clearfix"> </div>
            {/* <span title="back" className="d.inline-block mr-3"> <Link to={'/projects'} className=""> <i className="fas fa-arrow-left "></i></Link></span> */}

            <h3 className="project-title d.inline-block mb-3" >
              <span title="back" className="d.inline-block"><Link to={'/projects'} className=""> <i className="fas fa-arrow-left "></i></Link> </span> &nbsp; {this.props.userId ?
                <label> <b>{uName}</b> -  {projectName}</label> :
                projectName}
            </h3>

            <hr />

            <div className="row">
              <div className="col-sm-12">
                <div className="input-group input-group-sm ">
                  <TaskMenu {...this.props} updatedTime={this.state.updatedTime} ownerId={this.state.project ? this.state.project.userid : ""} />
                </div>
              </div>
            </div>

            <div className="row" >
              {/* <hr className="visible-xs" /> */}
              <div className="col-sm-3 offset-sm-6">
                {/* <div className="row"> */}
                <div className="input-group input-group-sm ">
                  <div className="input-group-prepend">
                    <span className="input-group-text rounded-0" id="inputGroup-sizing-sm"><i className="far fa-eye"></i></span>
                  </div>
                  <select className="form-control mr-lg-1 rounded-0 " onChange={this.onSelectViewChange}
                    value={this.state.selectedView} placeholder="Select View">
                    {viewList}
                  </select>
                </div>
                {/* </div> */}
              </div>
              <div className="col-sm-3">
                <div className="row input-group input-group-sm ">
                  <input type="text" placeholder="Search Task" name="tagSearch" className="form-control"
                    ref={this.inputSearch} onChange={this.handleInputChange} onKeyPress={this.keyCheck} />
                  <div className="input-group-prepend">
                    <a className="input-group-text" id="inputGroup-sizing-sm" onClick={this.keyCheck.bind(this, 'click')}>
                      <span role="img" aria-labelledby="search">&#x1F50D;</span>
                      {/* <span  className="fa fa-search"></span> */}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              {this.state.showEditTask || this.state.showNewTask ?
              // className="col-sm-7 order-sm-1"
                <div  style={{
                  background: '#fff',
                  zIndex: 10000,
                  position: 'fixed',
                  overflow: 'auto',
                  top: 0,
                  left: 0,
                  height: '100vh',
                }}>
                  <TaskForm key={this.state.editTaskId ? this.state.editTaskId : 1} context={this.props.context} updatedTime={this.state.updatedTime} projectId={this.props.projectId}
                    taskId={this.state.editTaskId} closeTask={this.closeTask} tasks={filterdTasks} project={this.state.project}
                    addTask={this.addTask} editTask={this.editTask} addTaskMsg={this.addTaskMsg}
                    deleteMessageTask={this.deleteMessageTask} messages={this.state.messages} getMessages={this.getMessages} uploadFiles={this.state.uploadFiles}
                    addUploadTaskFile={this.addUploadTaskFile} deleteTaskFileById={this.deleteTaskFileById} getUploadFiles={this.getUploadFiles}
                    pTasks={this.state.pTasks} onTogglesubTaskEdit={this.onTogglesubTaskEdit}
                    onNewSubTask={this.onToggleNewSubTask} onEditSubTask={this.onEditSubTask}
                    onDeleteSubTask={this.onDeleteSubTask}
                    onToggleSubTask={this.onToggleSubTask}
                    subTaskKeyUp={this.subTaskKeyUp}
                    onSubmitSubtask={this.onSubmitSubtask}
                    onCancelSubtask={this.onCancelSubtask}
                    onAddSubTask={this.onAddSubTask} changeSubtaskSequence={this.changeSubtaskSequence}
                    editTaskWindow={this.editTaskWindow} getProjectTasks={this.getProjectTasks}
                  />
                </div> : ""}
              <div className={this.state.showEditTask || this.state.showNewTask ? taskClass : noTaskClass} >
                {dashboard(this.state.projectId)}
              </div>
            </div>
          </React.Fragment>
        }
      </div> // container-fluid
    )
  }
}