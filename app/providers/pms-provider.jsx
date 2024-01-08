import {
    Container
} from '../re-stated';
import * as userservice from '../Services/user/user-service';
import * as projectservice from '../Services/project/project-service';
import * as taskservice from '../Services/task/task-service';
import * as companyservice from '../Services/company/company-service';
import * as chatservice from '../Services/chat/chat-service';
import * as categoryservice from '../Services/category/category-service';
import * as groupservice from '../Services/group/group-service';
import Auth from '../utils/auth';
import * as notificationservice from '../Services/notification/notification-service';
import * as leaveService from '../Services/leave-service/leave-service';
import * as accessrightservice from '../Components/Entitlement/services/applevelaccessright-service';

export default class PMSProvider extends Container {
    // constructor() {
    //     super();
    // }
    state = {
        message: "",
        users: [],
        categories: [],
        taskTypes: [],
        project: {},
        projectName: "",
        companies: [],
        subjects: [],
        projectSubjects: [],
        taskPriorities: [],
        favoriteProjects: [],
        notifications: [],
        taskPriority: {},
        category: {},
        user: {},
        userNameToId: {},
        companyId: {},
        companyName: {},
        groups: [],
        leaveTypes: [],
        appLevelAccess: [],
        projectData: [],
        userProjectData: [],
        projectSearch: "",
        projectFilter: [],
        projectsSummary: [],
        activeUsers: [],
        chatWindows: [],
        dataMessage: {},
        totalProjects: [],
        projectStatus:'status',
        totalProjectUsers:0,
        profilePicture: "",
        showArchive:false
    }

    actions = {
        handleError: (response, err) => {
            if (err) {
                this.setState({
                    message: err
                });
            } else if (response && response.data.err) {
                this.setState({
                    message: response.data.err
                });
            }
        },

        setTaskTypes: async () => {
            let { tasks, taskErr } = await taskservice.getAllTaskTypes();
            if (taskErr) {
                this.setState({
                    message: 'Error: ' + taskErr
                });
            } else if (tasks && tasks.data.err) {
                this.setState({
                    message: 'Error: ' + tasks.data.err
                });
            } else {
                this.setState({
                    taskTypes: tasks.data
                });
            }
        },

        // setFavoriteProjects: async () => {
        //     try {
        //         let response = await axios.get('/favoriteproject');
        //         await this.setState({
        //             favoriteProjects: response.data
        //         });
        //     } catch (err) {
        //         if (err) {
        //             this.setState({
        //                 message: err
        //             });
        //         }
        //     }
        // },

        setCategories: async () => {
            let { response, err } = await categoryservice.getAllCategories();
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
                let category = {};
                if (response.data.length > 0) {
                    for (let i = 0; i < response.data.length; i++) {
                        category[response.data[i].title] = response.data[i].displayName;
                    }
                }
                this.setState({
                    categories: response.data,
                    category: category
                });
            }
        },

        setCompanies: async () => {
            let { response, err } = await companyservice.getAllCompanies();
            if (err) {
                this.setState({
                    message: err
                });
            }
            else if (response && response.data.err) {
                this.setState({ message: response.data.err });
            } else {
                let companyId = {};
                let companyName = {}
                if (response.data.length > 0) {
                    for (let i = 0; i < response.data.length; i++) {

                        companyId[response.data[i]._id] = response.data[i].companyName;
                        companyName[response.data[i].companyName.toLowerCase().replace(/ +/g, "")] = response.data[i]._id
                    }
                }

                this.setState({
                    companies: response.data,
                    companyId: companyId,
                    companyName: companyName
                })
            }
        },

        setGroups: async () => {
            let { response, err } = await groupservice.getAllGroups();
            if (err) {
                this.setState({
                    message: err
                });
            }
            else if (response && response.data.err) {
                this.setState({ message: response.data.err });
            } else {
                this.setState({
                    groups: response.data
                })
            }
        },

        setSubjects: async () => {
            let { response, err } = await chatservice.getAllSubjects();
            if (err) {
                this.setState({
                    message: err
                });
            }
            else if (response && response.data.err) {
                this.setState({ message: response.data.err });
            } else {
                this.setState({
                    subjects: response.data,
                })
            }
        },

        getProjectSubjects: async (projectId) => {
            let { response, err } = await chatservice.getProjectSubjects(projectId);
            if (err) {
                this.setState({
                    message: err
                });
            }
            else if (response && response.data.err) {
                this.setState({ message: response.data.err });
            } else {
                this.setState({
                    projectSubjects: response.data,
                })
            }
        },

        setPriorities: async () => {
            let { tasks, taskErr } = await taskservice.getTaskPriorities();
            if (taskErr) {
                this.setState({
                    message: 'Error: ' + taskErr
                });
            } else if (tasks && tasks.data.err) {
                this.setState({
                    message: 'Error: ' + tasks.data.err
                });
            } else {
                let taskPriority = {};
                if (tasks.data.length > 0) {
                    for (let i = 0; i < tasks.data.length; i++) {
                        taskPriority[tasks.data[i].priority] = tasks.data[i].displayName;
                    }
                }
                this.setState({
                    taskPriorities: tasks.data,
                    taskPriority: taskPriority
                });
            }
        },

        getAllUnHideNotification: async () => {
            let { response, err } = await notificationservice.getAllUnHideNotification();
            if (err) {
                this.setState({
                    message: err
                });
            }
            else if (response && response.data.err) {
                this.setState({ message: response.data.err });
            } else {
                this.setState({
                    notifications: response.data
                })
            }
        },

        setUsers: async () => {
            let {
                response,
                err
            } = await userservice.getAllUsers();
            if (err) {
                this.setState({
                    message: err
                });
            } else if (response && response.data.err) {
                this.setState({
                    message: response.data.err
                });
            } else {
                let user = {};
                let userNameToId = {};
                if (response.data.length > 0) {
                    for (let i = 0; i < response.data.length; i++) {
                        console.log("response.data length",response.data.length)
                        console.log("full response.data",response.data)
                        console.log("response.data",response.data[i].name)
                        user[response.data[i]._id] = response.data[i].name;
                        userNameToId[response.data[i].name.toLowerCase().replace(/ +/g, "")] = response.data[i]._id;
                    }
                }
                this.setState({
                    users: response.data,
                    user: user,
                    userNameToId: userNameToId
                });
            }
        },

        updateState: async (stateName, s) => {
            this.setState({
                ...this.state,
                [stateName]: s
            });
        },

        getAppLevelAccessRights: async () => {
            let userId = Auth.get('userId');
            let { response } = await accessrightservice.getUserAppLevelAccessRights(userId);
            // let entitlements = response.data;
            //return appLevelAccess;
            // console.log("appLevelAccess in pms provider",response.data);
            this.setState({
                appLevelAccess: response.data
            })
        },


        // getTaskTypes: async () => {
        //     let {
        //         tasks,
        //         taskErr
        //     } = await taskservice.getAllTaskTypes();
        //     if (taskErr) {
        //         this.setState({
        //             message: 'Error: ' + taskErr
        //         });
        //     } else if (tasks && tasks.data.err) {
        //         this.setState({
        //             message: 'Error: ' + tasks.data.err
        //         });
        //     } else {
        //         this.setState({
        //             taskTypes: tasks.data
        //         })
        //     }
        // },

        getProjectData: async (projectId) => {
            let {
                response,
                err
            } = await projectservice.getDataByProjectId(projectId);
            if (err) {
                this.setState({
                    message: err
                });
            } else if (response && response.data.err) {
                this.setState({
                    message: response.data.err
                });
            } else {
                // console.log("project",response.data.data);
                this.setState({
                    project: response.data.data

                })
            }
        },

        getProjectDetails: async (projectId) => {
            let {
                response,
                err
            } = await projectservice.getProjectData();
            if (err) {
                this.setState({
                    message: err
                });
            } else if (response && response.data.err) {
                this.setState({
                    message: response.data.err
                });
            } else {
                //console.log("projectData",response.data);
                this.setState({
                    projectData: response.data

                })
            }
        },
        //get project 
        getUserProject: async () => {
            let {
                response,
                err
            } = await projectservice.getUserProject(this.state.showArchive);
            if (err) {
                this.setState({
                    message: err
                });
            } else if (response && response.data.err) {
                this.setState({
                    message: response.data.err
                });
            } else {
                this.setState({
                    userProjectData: response.data

                })
            }
        },


        //SET the leave type
        setLeaveType: async () => {
            let { response, err } = await leaveService.getAllLeaves();
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

                this.setState({
                    leaveTypes: response.data

                });
            }
        },
        getAllProjectsSummary: async (projectId) => {
            // let userId = Auth.get('userId');
            // let userRole= Auth.get('userRole')
            let userId='',userRole='' ,show=false;
            let { projects, projectErr } = await projectservice.getAllProjectsSummary(userId, userRole,this.state.showArchive,projectId);
            if (projectErr) {
                this.setState({
                    message: projectErr
                });
            } else if (projects && projects.data.err) {
                this.setState({ message: projects.data.err });
            }
            else {
                this.setState({
                    totalProjects: projects.data.data,
                    totalProjectUsers:projects.data.count

                });
            }
        }
    }
    render() {
        return super.render();
    }
}