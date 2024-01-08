import React, { Component } from 'react';
import Task from './task';
import './task.css';
import * as dateUtil from '../../utils/date-util';

//var taskList = (props) => {
export default class TaskList extends Component {
    constructor(props) {
        super(props);
        this.deleteTask = this.deleteTask.bind(this);
        this.deleteSubTask = this.deleteSubTask.bind(this);
        this.cloneTask = this.cloneTask.bind(this);

    }
    state = {
        updatedTime: dateUtil.getTime()
    }
    // shouldComponentUpdate(nextProps, nextState) {
    //     // console.log("TaskList shouldComponentUpdate " + (!(this.props.updatedTime === nextProps.updatedTime && this.state.updatedTime === nextState.updatedTime)));
    //     return !(this.props.updatedTime === nextProps.updatedTime && this.state.updatedTime === nextState.updatedTime);
    // }
    deleteTask(taskId) {
        if (window.confirm('Are you sure you want to delete this task?'))
            this.props.onDeleteTask(taskId)
    }
    deletePermissionError() {
        window.alert('You do not have permission to delete this task.')
    }
    cloneTask(taskId) {
        if (window.confirm('Are you sure you want to clone this task?')) {
            this.props.onCloneTask(taskId)
        }
    }
    deleteSubTask(taskId, subTaskId, subTaskStatus) {
        if (subTaskStatus === true ?
            window.confirm(' Subtask in Completed Status will not be deleted')
            :
            window.confirm('Are you sure you want to delete this subtask?')) {
            this.props.onDeleteSubTask(subTaskId, taskId)
        }
    }

    // componentWillReceiveProps(nextProps) {
    //     this.setState({
    //         tasks: nextProps.tasks
    //     })
    // }

    render() {
        let tasks = this.props.tasks;
      
        tasks.sort((a, b) => parseInt(a.sequence, 10) > parseInt(b.sequence, 10));
        var taskList = tasks.map((task, i) => {

            return (
                <Task key={task._id} {...this.props} tasksData={this.props.tasksData} task={task} deleteTask={this.deleteTask} deletePermissionError={this.deletePermissionError}
                    index={i} taskPriority={this.props.taskPriority} appLevelAccess={this.props.appLevelAccess}
                    cloneTask={this.cloneTask} deleteSubTask={this.deleteSubTask}
                />
            );
        });

        return (
            <div className="task-list" key={this.props.category}>{taskList}</div>
        );
    }
}
