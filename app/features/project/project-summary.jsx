import React, { Component } from 'react';
import * as projectservice from "../../Services/project/project-service";
import TaskMenu from "../tasks/task-menu";

export default class ProjectSummary extends Component {
    // constructor(props) {
    //     super(props);
    // }

    state = {
        users: [],
        projectTitle: '',
        tasks: [],
        isLoaded: true
    }

    initialize() {
        var users = this.state.users.map((user) => {
            user.show = false;
            return user;
        });

        this.setState({ users });
    }

    toggleClick(id) {
        var users = this.state.users.map((user) => {
            if (user.userId === id)
                user.show = !user.show;
            return user;
        });
        this.setState({
            users
        })
    }

    async getTasksAndUsers() {
        let { projects, projectErr } = await projectservice.getProjectTasksAndUsers(this.props.projectId);
        if (projectErr) {
            this.setState({
                message: projectErr
            });
        } else if (projects && projects.data.err) {
            this.setState({ message: projects.data.err });
        }
        else {
            this.setState({
                users: projects.data.users,
                tasks: projects.data.tasks,
                projectTitle: projects.data.title
            });
        }
    }

    async componentDidMount() {
        await this.getTasksAndUsers();
        this.initialize();
        this.setState({
            isLoaded: false
        })
    }

    render() {
        const userStyle = {
            font: "bold 14px/30px Arial,sans-serif",
        };

        const projectUsers = this.state.users.map((user) => {
            var tasksPerUser = this.state.tasks.filter((task) => {
                return task.userId === user.userId;
            });

            return (
                user.show ?
                    <div key={user._id} className="col-sm-12"><span onClick={this.toggleClick.bind(this, user.userId) } >
                        <span className="fas fa-minus"> </span></span>
                        <span style={userStyle} > {user.name} </span>
                        {tasksPerUser.length > 0 ?
                            tasksPerUser.map((task) => {
                                let date = new Date().toISOString();
                                if ((task.startDate < date) && (task.endDate > date) && !task.completed)
                                    return <div key={task._id} className="col-sm-12">{task.title} -- Ongoing Task </div>
                                else if ((task.startDate < date) && (task.endDate < date) && !task.completed)
                                    return <div key={task._id} className="col-sm-12">{task.title} -- Incomplete Task </div>
                                else if ((task.startDate === date) && task.completed)
                                    return <div key={task._id} className="col-sm-12">{task.title} -- Today's Task completed </div>
                                else if ((task.startDate === date) && !task.completed)
                                    return <div key={task._id} className="col-sm-12">{task.title} -- Today's Task </div>
                                else return null;
                            }) : ' - No Task Assigned'}

                    </div>
                    :
                    <div key={user._id} className="col-sm-12"><span onClick={ this.toggleClick.bind(this, user.userId) } >
                        <span className="fas fa-plus">  </span></span>
                        <span style={userStyle} > {user.name} </span>
                        {tasksPerUser.length === 0 ? ' - No Task Assigned' : ''}
                    </div>
            );
        });

        return (
            <div>
                {this.state.isLoaded ? 
                    <div className="logo">
                        <img src="/images/loading.svg" alt="loading" />
                    </div> : 
                    <div>
                        <h3 style={{ textTransform: "uppercase" }}>{this.state.projectTitle}</h3>
                        <hr/>
                        <div className="row mb-5">
                            <div className="col-sm-12">
                                <TaskMenu {...this.props} />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-sm-12">
                                <ul className="col-sm-5 card">
                                    {projectUsers}
                                </ul>
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}


