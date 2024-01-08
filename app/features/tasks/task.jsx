import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Auth from '../../utils/auth';
import { Link } from 'react-router-dom';
import './task.css';
import * as dateUtil from '../../utils/date-util';
import * as validate from '../../common/validate-entitlements';
import * as leaveApplicationService from "../../Services/leave-service/leave-service";
// import '../../app.css';

// import * as ObjectId from '../../utils/mongo-objectid';
// const isEqual = require("react-fast-compare");

export default class Task extends Component {
    constructor(props) {
        super(props);
        this.onDrop = this.onDrop.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.showEditTaskForm = this.showEditTaskForm.bind(this);
        this.onTaskMenuToggle = this.onTaskMenuToggle.bind(this);
    }

    state = {
        updatedTime: dateUtil.getTime(),
        appLevelAccess: this.props.appLevelAccess,
        task: this.props.task,
        leave: "",
        showContextMenu: false
    }

    handleInputChange(id, e) {
        const target = e.target;
        const value = target.value;
        let subtasks = Object.assign([], this.state.task.subtasks)
        for (let i = 0; i < subtasks.length; i++) {
            if (subtasks[i]._id === id) {
                if (e.target.name === "title") {
                    subtasks[i].title = value
                }
                else if (e.target.name === "hiddenUserName") {
                    subtasks[i].hiddenUserName = value
                }
                else if (e.target.name === "storyPoint") {
                    subtasks[i].storyPoint = value
                } else if (e.target.name === "subtaskhiddenDepName") {
                    subtasks[i].subtaskhiddenDepName = value
                }

            }
        }
        this.setState({
            task: {
                ...this.state.task,
                subtasks: subtasks
            }
        })
    }

    onSubmit(subTask, e) {
        e.preventDefault();
        let project = this.props.project && this.props.project.projectUsers;
        let hiddenName = [];
        for (let i = 0; i < project.length; i++) {
            if (project[i].name !== undefined && project[i].name !== null) {
                if (subTask.hiddenUserName.toLowerCase().replace(/ +/g, "") === project[i].name.toLowerCase().replace(/ +/g, "")) {
                    hiddenName.push(project[i])

                }
            }
        }
        // let hiddenName = this.props.project && this.props.project.projectUsers.filter((u) => {
        //     if (u.name !== undefined && u.name !== null) {
        //         return subTask.hiddenUserName.toLowerCase().replace(/ +/g, "") === u.name.toLowerCase().replace(/ +/g, "")
        //     }

        // })
        let hiddenUsr = (hiddenName.length) ? hiddenName[0].userId : '';
        subTask.hiddenUsrId = hiddenUsr;

        // console.log("subTask", subTask);
        let allSubtasks = Object.assign([], this.state.task.subtasks);
        // console.log("all subtasks", allSubtasks);
        let hiddenDepName = [];
        for (let i = 0; i < allSubtasks.length; i++) {
            if (allSubtasks[i].title !== undefined && allSubtasks[i].title !== null) {
                if (subTask.subtaskhiddenDepName.toLowerCase().replace(/ +/g, "") === allSubtasks[i].title.toLowerCase().replace(/ +/g, "")) {
                    hiddenDepName.push(allSubtasks[i])
                }
            }
        }
        // console.log("hiddenDepName", hiddenDepName);
        let hiddenDepSubtask = (hiddenDepName.length > 0) ? hiddenDepName[0]._id : "";
        // console.log("hiddenDepSubtask", hiddenDepSubtask);
        subTask.subtaskHiddenDepId = hiddenDepSubtask;

        let subtask;
        if (subTask.add === true) {


            let subTasks = this.state.task.subtasks.map((s) => {
                if (s._id === subTask._id) {
                    if (s.add === true) {
                        s.edit = false;
                        s.add = false;
                    }
                }
                subtask = s;
                return s;
            });
            this.setState({
                task: {
                    ...this.state.task,
                    subtasks: subTasks
                }
            });
            // console.log('subtask', subtask);
            this.props.onAddSubTask(subtask)

        }
        else {
            this.props.onEditSubTask(subTask)
            let subTasks = this.state.task.subtasks.map((s) => {
                if (s._id === subTask._id) {
                    if (s.edit === true) {
                        s.edit = false;
                        s.add = false;
                    }
                }
                return s;
            });
            this.setState({
                task: {
                    ...this.state.task,
                    subtasks: subTasks
                }
            });
        }
    }
    // shouldComponentUpdate(nextProps, nextState) {
    //     var update = !(isEqual(this.props.task, nextProps.task) && this.state.updatedTime === nextState.updatedTime);
    //     // console.log("Task shouldComponentUpdate " + update);
    //     return update
    // }

    showSubTask(id) {
        var obj = document.getElementById(id);
        obj.className = (obj.className === "hide-subtask") ? "show-subtask" : "hide-subtask";
    }

    onDrop(targetTaskId, targetCat, e) {
        e.preventDefault();
        var srcTaskId = e.dataTransfer.getData("text/plain");

        if (this.props.onReorderTask) this.props.onReorderTask(srcTaskId, targetTaskId, targetCat);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            task: nextProps.task
        })
    }

    onCancelSubtask(taskId, subtaskId, e) {
        e.preventDefault();
        let subtasks = []
        let subTaskEdit = this.state.task.subtasks.filter((f) => {
            return f._id === subtaskId;
        })
        let editvalue = subTaskEdit.length > 0 ? subTaskEdit[0].edit : '';
        if (editvalue === true) {
            subtasks = this.state.task.subtasks.map((m) => {
                m.edit = false
                return m;
            })
            //this.state.task.subtasks = subtasks;
        }
        else {
            subtasks = this.state.task.subtasks.filter((m) => {
                return m._id !== subtaskId;
            })
            //this.state.task.subtasks = subtasks;
        }

        this.props.onCancelSubtask(taskId, subtaskId)
        this.setState({
            task: {
                ...this.state.task,
                subtasks: subtasks
            }
        })

    }
    showEditTaskForm(id) {
        // console.log("id", id);

        // console.log("taskData", taskData);
        // if (taskData.length > 0) {
        //     this.props.editTaskWindow.bind(this, taskData[0]._id)
        // }


    }
    async getLeaveDetails(name) {
        // console.log("name", name);
        // console.log("this.props.userNameToId", this.props.userNameToId);
        let userId = this.props.userNameToId && this.props.userNameToId[name.toLowerCase().replace(/ +/g, "")];

        let { response, err } = await leaveApplicationService.getUserOnLeaveDetails(userId);


        if (err) {
            this.setState({
                isLoaded: false
            });
        }
        else if (response && response.data.err) {
            this.setState({
                isLoaded: false
            });
        }
        else {
            // console.log("response.data", response.data);
            let data = response.data.data
            this.setState({
                leave: data
            })
        }


    }
    onMouseOut() {
        this.setState({
            leave: ''
        })
    }

    /* Show task context menu */
    onTaskMenuToggle () {
        this.setState((prevState, props) => {
            return {
                showContextMenu: !prevState.showContextMenu
            }
        })
    }

    editTaskWindow (taskId) {
        this.props.editTaskWindow(taskId);
        this.onTaskMenuToggle();
    }

    cloneTask(taskId) {
        this.props.cloneTask(taskId);
        this.onTaskMenuToggle();
    }

    render() {
        var labelStyle = {
            fontSize: "small",
        };
        var { task } = this.state;
        let subTasks = task.subtasks;

        var checked = task.completed ? "checked" : "";
        var bodyClass = task.completed ? "task-body task-completed" : "task-body " + task.taskColor;
        var userId = task.userId;
        var userRole = Auth.get("userRole");
        var getUserId = Auth.get("userId");
        var uAssignedName = "";
        var uCreatedBy = "";
        var uId = "";
        let attachments = (task.uploadFiles.length > 0) ? true : false;
        let filteredUploadFilesCount = 0;
        for (let i = 0; i < task.uploadFiles.length; ++i) {
            if (task.uploadFiles[i].isDeleted === false) {
                filteredUploadFilesCount++;
            }
        }

        // console.log("task.createdOn", task.createdOn);
        // let uCreatedOn = moment(task.createdOn).fromNow();
        let uCreatedOn = dateUtil.DateToLongString(task.createdOn);
        let displayNamePriority = this.props.taskPriority && this.props.taskPriority[task.priority];

        for (let i = 0; i < this.props.users.length; ++i) {
            if (this.props.users[i]._id === task.createdBy) {
                uCreatedBy = this.props.users[i].name;
                uId = this.props.users[i]._id;
            }
            if (this.props.users[i]._id === task.userId) {
                uAssignedName = this.props.users[i].name;
            }
        }


        // console.log("subTasks", subTasks);


        // pTasks.sort((a, b) => (a.title > b.title));
        // this.setState({
        //     pTasks,
        //     updatedTime: dateUtil.getTime()
        // });
        // let tsubtasks = [];
        // let filteredSubtasks = 
        subTasks.sort((a, b) => (a.sequence - b.sequence));
        var subTasksView = subTasks.map((subTask) => {
            var edit = subTask.edit;
            var add = subTask.add;
            var subTaskchecked = subTask.completed ? "checked" : "";
            let taskData = this.props.tasksData && this.props.tasksData.filter((f) => { return f.subtaskId === subTask._id })
            let taskId = taskData.length > 0 ? taskData[0]._id : '';

            let tsubtasks = [];

            for (var i = 0; i < subTasks.length; i++) {
                if (subTasks[i]._id !== subTask._id) {
                    tsubtasks.push(
                        { id: subTasks[i]._id, title: subTasks[i].title }
                    );
                }
            }
            return (
                <li key={subTask._id}  >
                    {add ? <div className="container">
                        <form >
                            <div className="row">
                                <div className="col-sm-6 col-md-9">
                                    <div className="form-group">
                                        <label htmlFor="Title" style={labelStyle}>Title</label>
                                        <span style={{ color: 'red' }}>*</span>
                                        <input type="text" className="form-control"

                                            value={subTask.title}
                                            onChange={this.handleInputChange.bind(this, subTask._id)}
                                            name="title"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6 col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="Select User" style={labelStyle}>Select User</label>
                                        <span style={{ color: 'red' }}>*</span>
                                        {Auth.get('userRole') === 'user' ?
                                            <input type="text" value={subTask.hiddenUserName} list="usersData"
                                                onChange={this.handleInputChange.bind(this, subTask._id)}
                                                name="hiddenUserName" className="form-control" autoComplete="off" disabled />
                                            :
                                            <input type="text" value={subTask.hiddenUserName} list="usersData"
                                                onChange={this.handleInputChange.bind(this, subTask._id)}
                                                name="hiddenUserName" className="form-control" autoComplete="off" placeholder="Select User" />}
                                        <datalist id="usersData" >
                                            {
                                                this.props.project && this.props.project.projectUsers.map((u) => {
                                                    return <option key={u.userId}
                                                        data-value={u.userId}>{u.name}</option>;
                                                })
                                            }
                                        </datalist>
                                    </div>
                                </div>
                                <div className="col-sm-6 col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="Storypoint" style={labelStyle}>Storypoint</label>
                                        <span style={{ color: 'red' }}>*</span>
                                        <input type="number" name="storyPoint" className="form-control"
                                            placeholder="Story Point" min="1"
                                            value={subTask.storyPoint}
                                            onChange={this.handleInputChange.bind(this, subTask._id)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12 col-md-12">
                                    <div className="form-group">
                                        <label htmlFor="Dependency Subtask" style={labelStyle}>Subtask Dependency</label>
                                        <input type="text" value={subTask.subtaskhiddenDepName} list="data" onChange={this.handleInputChange.bind(this, subTask._id)}
                                            name="subtaskhiddenDepName" className="form-control" autoComplete="off" placeholder="Subtask Dependency" />
                                        <datalist id="data" >
                                            {
                                                tsubtasks && tsubtasks.map((t) => {
                                                    return <option key={t.id} data-value={t.id}>{t.title}</option>
                                                })
                                            }
                                        </datalist>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6 col-md-6">
                                    <input type="submit" value="Save" className="btn btn-primary btn-block" onClick={this.onSubmit.bind(this, subTask)} disabled={!subTask.title} />
                                </div>
                                <div className="col-sm-6 col-md-6">
                                    <button value='cancel' className="btn btn-secondary btn-block" onClick={this.onCancelSubtask.bind(this, task._id, subTask._id)}>
                                        Cancel</button>
                                </div >
                            </div>
                        </form>
                    </div>

                        :
                        <div className="subtask-title">
                            <span className={subTask.completed ? "task-deco" : ""} >
                                {edit ?
                                    <div className="container">
                                        <form >
                                            <div className="row">
                                                <div className="col-sm-6 col-md-9">
                                                    <div className="form-group">
                                                        <label htmlFor="Title" style={labelStyle}>Title</label>
                                                        <span style={{ color: 'red' }}>*</span>
                                                        <input type="text" title="enter to submit" className="form-control"
                                                            placeholder="press enter to add, esc to cancel"
                                                            value={subTask.title}
                                                            onChange={this.handleInputChange.bind(this, subTask._id)}
                                                            name="title"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-6 col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="Select User" style={labelStyle}>Select User</label>
                                                        <span style={{ color: 'red' }}>*</span>
                                                        {Auth.get('userRole') === 'user' ?
                                                            <input type="text" value={subTask.hiddenUserName} list="usersData"
                                                                onChange={this.handleInputChange.bind(this, subTask._id)}
                                                                name="hiddenUserId" className="form-control" autoComplete="off" disabled />
                                                            :
                                                            <input type="text" value={subTask.hiddenUserName} list="usersData"
                                                                onChange={this.handleInputChange.bind(this, subTask._id)}
                                                                name="hiddenUserName" className="form-control" autoComplete="off" placeholder="Select User" />}
                                                        <datalist id="usersData" >
                                                            {
                                                                this.props.project && this.props.project.projectUsers.map((u) => {
                                                                    return <option key={u.userId}
                                                                        data-value={u.userId}>{u.name}</option>;
                                                                })
                                                            }
                                                        </datalist>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="Storypoint" style={labelStyle}>Storypoint</label>
                                                        <span style={{ color: 'red' }}>*</span>
                                                        <input type="number" name="storyPoint" className="form-control"
                                                            placeholder="Story Point" min="1"
                                                            value={subTask.storyPoint}
                                                            onChange={this.handleInputChange.bind(this, subTask._id)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-12 col-md-12">
                                                    <div className="form-group">
                                                        <label htmlFor="Dependency Subtask" style={labelStyle}>Subtask Dependency</label>
                                                        <input type="text" value={subTask.subtaskhiddenDepName} list="data" onChange={this.handleInputChange.bind(this, subTask._id)}
                                                            name="subtaskhiddenDepName" className="form-control" autoComplete="off" placeholder="Subtask Dependency" />
                                                        <datalist id="data" >
                                                            {
                                                                tsubtasks && tsubtasks.map((t) => {
                                                                    return <option key={t.id} data-value={t.id}>{t.title}</option>
                                                                })
                                                            }
                                                        </datalist>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-6 col-md-6">
                                                    <input type="submit" value="Save" className="btn btn-primary btn-block" onClick={this.onSubmit.bind(this, subTask)} disabled={!subTask.title} />
                                                </div>
                                                <div className="col-sm-6 col-md-6">
                                                    <button value='cancel' className="btn btn-primary btn-block" onClick={this.onCancelSubtask.bind(this, task._id, subTask._id)}>
                                                        Cancel</button>
                                                </div >
                                            </div>
                                        </form>
                                    </div>
                                    :

                                    <span>
                                  
                                            <input className="" type="checkbox" checked={subTaskchecked}
                                                onChange={this.props.onToggleSubTask.bind(this, subTask, task._id)} />
                                       &nbsp;  
                                        
                                        <span title={subTask.title} className="show__overflow_dots">{subTask.title}</span></span>
                                    
                                    }

                            </span>
                            {
                                userRole !== "support" ?
                                    <span className="subtask-actions" >
                                        <span onClick={this.props.changeSubtaskSequence.bind(this, task._id, subTask._id, subTask.sequence, 'up')}>
                                            <i className="fas fa-arrow-up"></i>
                                        </span>
                                        <span onClick={this.props.changeSubtaskSequence.bind(this, task._id, subTask._id, subTask.sequence, 'down')}>
                                            <i className="fas fa-arrow-down"></i>
                                        </span>
                                     

                                        <span
                                            onClick={this.props.deleteSubTask.bind(this, task._id, subTask._id, subTask.completed)}><i className="far fa-trash-alt text-danger"></i>
                                        </span>
                                        {
                                            subTask.completed === false ?
                                                <span onClick={this.props.onTogglesubTaskEdit.bind(this, subTask._id, task._id)}>
                                                    <i className="fas fa-pencil-alt text-success">
                                                    </i>
                                                </span>
                                                : ''
                                        }
                                        {/* <span style={{ paddingTop: '2px', verticalAlign: 'bottom' }}>
                                            <input className="" type="checkbox" checked={subTaskchecked}
                                                onChange={this.props.onToggleSubTask.bind(this, subTask, task._id)} />
                                        </span> */}
                                    </span> : ''}
                        </div>

                    }
                </li>
            );
        })

        let formattedDesc = (task.description && task.description.length > 0)
            ? task.description.split("\n").map((t, index) => <p key={task._id + "_" + index + "_" + t.length}>{t}</p>) : "";

        let formattedTaskTitle = (task.title && task.title.length > 70) ?
            task.title.substring(0, 70) + ' ...' : task.title;

        let editTask = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Task', 'Edit');
        let deleteTask = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Task', 'Delete');
        let cloneTask = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Task', 'Clone');

        return (

            <div key={task._id}
                data-id={task._id}
                data-sequence={task.sequence}
                
                draggable={userRole === "user" && task.category === 'completed' ? 'false' : "true"}
                onDragOver={this.props.onDragOver.bind(this)}
                onDrop={this.onDrop.bind(this, task._id, task.category)}
                onDragStart={this.props.onDragStart.bind(this, task._id)}
                onDrag={this.props.onDrag.bind(this, task._id)}

            >

                <header className={bodyClass}>
                    <div className="row">
                        <div className="col-sm-12">
                            <div className='maintask-title' >
                                <div className="task-menu-box">
                                    <i className="fas fa-bars mt-2" onClick={this.onTaskMenuToggle}></i>
                                    {this.state.showContextMenu &&
                                    <div className="task-icon-container" >
                                        {deleteTask ? userRole === "user" && uId !== getUserId ?
                                            <span className="text-danger" title="Delete Task"
                                                onClick={this.props.deletePermissionError}><i className="far fa-trash-alt text-danger"></i>
                                            </span>
                                            :
                                            <span className="text-danger" title="Delete Task"
                                                onClick={this.props.deleteTask.bind(this, task._id)}><i className="far fa-trash-alt text-danger"></i>
                                            </span> : ""
                                        }

                                        {cloneTask ? <span className="text-info" title="Clone Task" onClick={this.cloneTask.bind(this, task._id)}>
                                            <i className="far fa-copy"></i></span> : ""}

                                        {attachments ? <span>
                                            <i title={filteredUploadFilesCount} className="fas fa-paperclip"></i></span>
                                            : ""}
                                        {!this.props.modal && editTask 
                                            ? <span onClick={this.editTaskWindow.bind(this, task._id)}>
                                                 <i className="fas fa-pencil-alt text-success"></i>
                                            </span> : ""
                                        }
                                    </div>
                                    }

                                </div>

                                <span className={'task_priority ' + (task.priority)} title={displayNamePriority}></span>

                                <span className="task-title" onClick={this.showSubTask.bind(this, task._id)}>

                                    {formattedTaskTitle}
                                    &nbsp;
                                    {task.status === "new" ?
                                        <i className="fa fa-hourglass-start" title="New"></i> : task.status === "completed" ?
                                            <i className="fa fa-hourglass-end" title="Completed"></i> : task.status === "onHold" ?
                                                <i className="fa fa-hourglass" title="On Hold"></i> : <i className="fa fa-hourglass-half" title="In Progress"></i>
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    {uAssignedName ? <div className="task-user">

                        <i className="fas fa-user" ></i> &nbsp; <span >
                            <Link to={'/projects/' + userId} draggable={false}>
                                <span onMouseOver={this.getLeaveDetails.bind(this, uAssignedName)} onMouseOut={this.onMouseOut.bind(this)} title={this.state.leave ? this.state.leave : ''}>{uAssignedName}</span>
                            </Link></span></div> : ""}

                    {task.endDate ? <div className="lbl-smtext"> <i className="text-danger fas fa-calendar-alt">
                    </i> &nbsp;  <span className="text-danger">{task.endDate}</span></div> : ""}

                    {task.tag ? <div className="lbl-smtext"><i className="fas fa-tags mytags"></i>
                        &nbsp; <span className="text-warning">&nbsp;{task.tag}&nbsp;</span></div> : ""}
                </header>

                <div id={task._id} className="hide-subtask">
                    <div >
                        <span className={task.completed ? "task-desc task-deco " : "task-desc"}>
                            {formattedDesc}
                        </span>
                        {userRole !== "support" ? <span className='float-right mt-2' style={{ fontSize: 'xx-small' }}>
                            Mark as completed &nbsp; &nbsp;
                                <input type="checkbox" checked={checked} className=" "
                                style={{ verticalAlign: 'bottom' }}
                                onChange={this.props.onToggleComplete.bind(this, task._id)} />
                        </span> : ''}
                    </div>

                    <div className='clearfix'></div>

                    <div className="sub-tasks" style={{ fontSize: "14px" }} >
                        <div className="row">
                            <div className="col-sm-12 ">
                                <hr style={{ marginTop: '5px', marginBottom: '5px', }} />
                                <span style={{ marginLeft: '6px', fontSize: '12px', fontWeight: 'bold' }} >
                                    Sub Tasks </span>&nbsp;
                                {userRole !== "support" ? <span onClick={this.props.onToggleNewSubTask.bind(this, task._id, task.userId, -1, false)}>
                                    &nbsp; <span className="label label-info float-right">
                                        <i className='fas fa-plus '></i></span></span> : ''}
                                <hr style={{ marginTop: '5px', marginBottom: '5px', }} />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-sm-12">
                                <ol id='subtask-list'>
                                    {subTasksView}
                                </ol>
                            </div>
                        </div>
                    </div>
                    <footer className="task-footer">Created by {uCreatedBy} on {uCreatedOn}</footer>
                </div>
            </div>
        );
    }
}

Task.propTypes = {
    onDeleteTask: PropTypes.func.isRequired,
    onEditTask: PropTypes.func.isRequired
}

