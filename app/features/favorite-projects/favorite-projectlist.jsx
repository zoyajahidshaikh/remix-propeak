import React, { Component } from 'react';
import * as projectservice from "../../Services/project/project-service";
import * as projectcloneservice from "../../Services/project/project-clone-service";
import Auth from '../../utils/auth';
import { Link } from 'react-router-dom';
import '../../features/project/project.css'
import * as validate from '../../common/validate-entitlements';


export default class FavoriteProjectList extends Component {
    state = {
        favoriteProjects: this.props.context.state.favoriteProjects,
        projects: [],
        categories: this.props.context.state.categories,
        users: this.props.context.state.users,
        appLevelAccess: this.props.context.state.appLevelAccess
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            favoriteProjects: nextProps.context.state.favoriteProjects,
            categories: nextProps.context.state.categories,
            users: nextProps.context.state.users,
            appLevelAccess: nextProps.context.state.appLevelAccess
        })
    }


    
	onMenuIconClick = (id) => {
        var obj = document.getElementById(id);
        obj.className = (obj.className === "hide-project-menu") ? "project-icon-container  proj-icons-wrapper  justify-content-between show-project-menu" : "hide-project-menu";
}


    async getAllProjects() {
        let userId = Auth.get('userId');
        let { projects, projectErr } = await projectservice.getAllFavoriteProjects(userId);
        if (projectErr) {
            this.setState({
                message: projectErr
            });
        } else if (projects && projects.data.err) {
            this.setState({ message: projects.data.err });
        }
        else {
            this.setState({
                projects: projects.data.data
            });
        }
    }

    async componentDidMount() {
       
        if (this.state.categories.length === 0) {
            this.props.context.actions.setCategories();
        }
        if (this.state.users.length === 0) {
            this.props.context.actions.setUsers();
        }
        if(this.state.appLevelAccess.length === 0){
            this.props.context.actions.getAppLevelAccessRights();
        }
        this.getAllProjects();
    }

    async onCloneProject(projectId) {
        if (window.confirm('Are you sure you want to clone this project?')) {
            let { response, err } = await projectcloneservice.addCloneProject(projectId);
            if (err) {
                this.setState({
                    message: 'Error : ' + err,
                    labelvalue: 'Error : ' + err,
                });
            } else if (response && response.data.err) {
                this.setState({
                    message: 'Error : ' + response.data.err,
                    labelvalue: 'Error : ' + response.data.err,
                });
            }
            else {
                //   this.getAllProjects();
            }
        }

    }

    async onDeleteProjectById(id) {
        if (window.confirm('Are you sure you wish to delete this project?')) {
            let { response, err } = await projectservice.deleteProject(id);
            if (err) {
                this.setState({
                    message: 'Error : ' + err,
                    labelvalue: 'Error : ' + err
                });
            } else if (response && response.data.err) {
                this.setState({
                    message: 'Error : ' + response.data.err,
                    labelvalue: 'Error : ' + response.data.err,
                });
            } else {
                let projects = this.state.projects.filter((f) => {
                    return id !== f._id
                });

                this.setState({
                    projects: projects
                })
                //   this.loadData();
            }
        }
    }

    async onClickRemoveFavoriteProject(projectId) {

        let { response, err } = await projectservice.updateFavoriteProject(projectId);
        if (err) {
            this.setState({
                message: 'Error : ' + err,
                labelvalue: 'Error : ' + err
            });
        } else if (response && response.data.err) {
            this.setState({
                message: 'Error : ' + response.data.err,
                labelvalue: 'Error : ' + response.data.err,
                isFavorite: false
            });
        } else {
            //   this.loadData();
            let favoriteProject = this.state.projects.filter((f) => {
                return projectId !== f._id
            });
            this.setState({
                projects: favoriteProject
            })
        }

    }


    render() {
        const ON_HOLD = "onHold";

        // let userRole = Auth.get('userRole');
        var projectView = this.state.projects && this.state.projects.map((project) => {
            var users = project.projectUsers;
            let totalTasks = project.totalTasks;
            var taskCompleted = project.completedTasks;
            var taskInProgress = project.inProgressTasks;
            var proTitle = this.state.categories === undefined && this.state.categories.filter((category) => {
                if (project.status !== undefined && project.status !== null && project.status !== "") {
                    return project.status === category._id;
                }
                return category;
            })[0].title;

            var dateToday = new Date();
            var projectEnddate = new Date(project.enddate);
            var utc1 = Date.UTC(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate());
            var utc2 = Date.UTC(projectEnddate.getFullYear(), projectEnddate.getMonth(), projectEnddate.getDate())
            var diffDays = parseInt((utc2 - utc1) / (1000 * 60 * 60 * 24), 10);
            var percentageProject = ((taskCompleted / project.totalTasks) * 100).toString().match(/^-?\d+(?:\.\d{0,2})?/);
            let status = project.status;
            let attachments = project.attachments;

            let accessRights = Auth.get('access');

            let editProject = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Projects', 'Edit');
            let deleteProject = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Projects', 'Delete');
            let showClone = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Projects', 'Clone');
            let auditReportShow = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Audit Report', 'View');
            let favouritesShow = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Favorite Projects', 'View');
              
            if(accessRights !== null && accessRights !== undefined && accessRights.length > 0) {
                deleteProject = validate.validateEntitlements(accessRights, project._id, 'Projects', 'delete');
                auditReportShow = validate.validateEntitlements(accessRights, project._id, 'Audit Report', 'view');
                showClone = validate.validateEntitlements(accessRights, project._id, 'Projects', 'clone');	
            }
            return (
                <li className="project-nogroup" key={project._id}>
                    <div className='project-border'>
                        <div className="project-body" style={{ position: "relative" }}>
                            
<div className="project-menu-box" onClick={this.onMenuIconClick.bind(this, project._id) } >
                                

                    <i className="fas fa-bars mt-2"></i>
                                <div id={project._id}  className="project-icon-container  proj-icons-wrapper  justify-content-between hide-project-menu">
                                    

                    {editProject ? <Link to={'/project/edit/' + project._id} className="" title="Edit project" >
                                        <i className="fas fa-pencil-alt text-success"></i>
                                    </Link> : ""}
    
                                    {deleteProject ? <a className="mr-1" title="Delete project" onClick={() => {
                                        if (window.confirm('Are you sure you wish to delete this project?'))
                                            this.onDeleteProjectById(project._id)
                                    }}><i className="far fa-trash-alt text-danger"></i>
                                    </a> : ""}
    
                                    {auditReportShow ? <Link to={'/auditReport/' + project._id} title="Audit Report"
                                        className="mr-1">
                                        <i className="fas fa-clipboard-list"></i>
                                    </Link> : ""}
    
                                    {showClone ? <a className="" title="Clone project"
                                        onClick={this.onCloneProject.bind(this,project._id)
                                        }>
                                        <i className="far fa-copy"></i>
                                    </a> : ""}
    
                                    {attachments > 0 ?
                                        <a className='' title={attachments} >
                                            <i className="fas fa-paperclip"></i> </a>
                                        : ""}
    
                                    {favouritesShow ? 
                                        
                                       
                                            <a className="" title="Favorite project" onClick={
                                                this.onClickRemoveFavoriteProject.bind(this,project._id)
                                            } >
                                                <i className="fas fa-star text-warning"></i>
                                            </a>
                                            : ""
                                    }
                    
                    </div>
                    </div>

                        <div className="image-wrapper d-flex">
                        <div className="d-flex flex-column left mt-3">
                        <div className="d-flex flex-column align-content-start pr-2">
                        <Link to={'/project/tasks/' + project._id} className="project-title">{project.title}</Link>
                                        <h4 className="proj-desc show__overflow_dots">{project.description}</h4>
								</div>
                            <div className="mt-auto">
                                <Link to={'/projectUsers/' + project._id} className="userlinks">

                                    <span className="assignees" title="users">
                                        <span className="user-no">{users.length}  </span>
                                        {users.length > 0 &&
                                            users.length > 1 ?
                                            <i className="fas fa-users" style={{ color:"#CDDC39"}}></i>
                                            :
                                            <i className="fas fa-user" style={{ color:"#CDDC39"}}></i>


                                        }
                                    </span>


                                </Link>
                            </div>
</div>
                            </div>
                            <div className="progress mt-3 mb-2">
                                <div className="progress-bar bg-warning progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="50"
                                    aria-valuemin="0" aria-valuemax="100" style={{ width: `${percentageProject}%` }}>
                                    {percentageProject}% Complete
                                </div>
                            </div>

                            <div className=" d-flex justify-content-around bottom-box">
                                <div className="d-flex flex-column align-self-left align-items-center bottom-box-boxes">
                                    <span  className="valueno">{totalTasks} </span>
                                    <span className="fas fa-tasks"></span>
                                </div>

                                <div className="d-flex flex-column  align-self-left align-items-center bottom-box-boxes" title="Task Completed">
                                    <span className="valueno">{taskCompleted} </span>
                                    <span className="far fa-check-circle text-success"></span>
						        </div>

                                <div className="d-flex flex-column align-self-left align-items-center bottom-box-boxes" title="In Progress">
                                    <span className="valueno">{taskInProgress} </span>
                                    <span className="fas fa-spinner text-warning"></span>
							    </div>

                                {status === ON_HOLD ? (<div className="d-flex align-self-left align-items-center" title="Days left"><span>On</span><span>Hold</span></div>) 
                                : (proTitle !== "completed" && project.enddate !== '') ? <div className="d-flex flex-column align-self-left align-items-center bottom-box-boxes" title="Days left">
                                    <span className="valueno">{diffDays} </span>
                                    <span className="far fa-clock text-danger"> </span>
                                </div> : ""}
                            </div>

                            </div>
                    </div>
                </li>

            );
        });

        return (
            <div className="project-list-scroll p-2">
                <h4 className="project-total mt-2 pb-3">Favourite Projects</h4>
                <ul className="project-List-scroll d-flex flex-wrap justify-content-start" >
                    {projectView}
                </ul>

            </div>
        )
    }
}