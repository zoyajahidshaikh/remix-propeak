import React from 'react';
import '../../app.css';
import MessageList from '../messages/message-list';
import UploadFile from '../upload-file/upload-file';
import AutoCloneType from '../auto-clone/auto-clone-type';
import * as projectservice from "../../Services/project/project-service";
import { Link } from 'react-router-dom';
import Auth from '../../utils/auth';
import Tag from '../tasks/tag';
import * as ObjectId from '../../utils/mongo-objectid';
import config from '../../common/config';
import * as dateUtil from '../../utils/date-util';
import './project.css';
import Calendar from '../../Components/calendar/calendar';

export default class ProjectForm extends React.Component {
    constructor(props) {
        super(props);

        // this.handleTabClick = this.handleTabClick.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onSelectCatChanged = this.onSelectCatChanged.bind(this);
        this.onSelectCompanyChanged = this.onSelectCompanyChanged.bind(this);
        // this.onSelectUserGroupChange = this.onSelectUserGroupChange.bind(this);
        this.onDeleteAssignUsers = this.onDeleteAssignUsers.bind(this);
        this.onDeleteNotifyUsers = this.onDeleteNotifyUsers.bind(this);
        this.onDeleteAssignCategories = this.onDeleteAssignCategories.bind(this);
        this.onDeleteAssignUserGroup = this.onDeleteAssignUserGroup.bind(this);
        this.onSelectUserChanged = this.onSelectUserChanged.bind(this);
        this.onSelectGroupChanged = this.onSelectGroupChanged.bind(this);
        this.addMsg = this.addMsg.bind(this);
        this.deleteMessageById = this.deleteMessageById.bind(this);
        this.deleteFileById = this.deleteFileById.bind(this);
        this.addUploadFile = this.addUploadFile.bind(this);
        this.downCount = -1;
        this.categoryCount = -1;
        this.groupCount = -1;
        this.notifyCount = -1;
    }

    state = {
        labelvalue: '',
        labelsuccessvalue: '',
        title: '',
        description: '',
        userid: '',
        companyId: '',
        companyName: '',
        // userGroupId: '',
        userGroupName: '',
        startdate: dateUtil.DateToString(new Date()),
        enddate: dateUtil.DateToString(new Date().setMonth(new Date().getMonth() + config.monthCount)),
        defaultOption: '',
        assignUser: '',
        notifyUser: '',
        group: '',
        isDeleted: false,
        dropdownHidden: true,
        notifyDropdownHidden: true,
        userGroupDropdownHidden: true,
        allUserDropdowns: [],
        assignCategory: '',
        dropdownHiddenCategory: true,
        allCategoryDropdowns: [],
        notifyUsersDropdown: [],
        allUserGroupsDropdown: [],
        companies: this.props.context.state.companies,
        users: this.props.context.state.users,
        categories: this.props.context.state.categories,
        groups: this.props.context.state.groups,
        project: {},
        assignUsers: [],
        notifiedUsers: [],
        assignCategories: [],
        userGroups: [],
        sendnotification: false,
        messages: [],
        uploadFiles: [],
        statusOptions: [],
        titleFlag: false,
        // downCount: -1,
        // categoryCount:-1,
        // groupCount:-1,
        // notifyCount:-1,
        miscellaneous: false,
        archive: false
    }

    checkSubmit() {
        if (this.state.startdate !== "" && this.state.enddate !== "") {
            if (Date.parse(this.state.startdate) > Date.parse(this.state.enddate)) {
                this.setState({ submitDisabled: true, labelvalue: 'Start Date is Greater Than End Date' });
            }
            else {
                this.setState({ submitDisabled: false, labelvalue: '' });
            }
        }
    }
    onSelectUserChanged(e) {
        let selectedUser = e.target.value;
        let notifyUsers = Object.assign([], this.state.notifiedUsers);
        if (this.state.notifiedUsers && this.state.notifiedUsers.length > 0) {
            if (!notifyUsers.includes(selectedUser)) {
                notifyUsers.push(selectedUser);
            }
        }
        else {
            notifyUsers = [selectedUser];
        }
        this.setState({
            userid: selectedUser,
            notifiedUsers: notifyUsers,
            labelvalue: "",
            labelsuccessvalue: ""
        }, this.checkSubmit);
    }

    onSelectGroupChanged(e) {
        let selectedGroup = e.target.value;
        this.setState({
            group: selectedGroup,
            labelvalue: "",
            labelsuccessvalue: ""
        }, this.checkSubmit);
    }

    onSelectCompanyChanged(e) {
        let selectedCompany = e.target.value;

        let cId = this.props.context.state.companyName && this.props.context.state.companyName[selectedCompany.toLowerCase().replace(/ +/g, "")];

        this.setState({
            companyName: selectedCompany,
            companyId: cId,
            labelvalue: "",
            labelsuccessvalue: ""
        }, this.checkSubmit);
    }

    onSelectCatChanged(e) {
        let selectedCat = e.target.value;
        this.setState({
            defaultOption: selectedCat,
            labelvalue: "",
            labelsuccessvalue: ""
        }, this.checkSubmit);
    }

    handleTabClick(name, e) {
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

    handleChange(e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        if (name === 'assignUser') {
            this.onSelectDropdown(e.target.value);
        }
        if (name === 'assignCategory') {
            this.onSelectCategoryDropdown(e.target.value);
        }
        if (name === 'notifyUser') {
            this.onSelectNotifyDropdown(e.target.value);
        }
        if (name === 'userGroupName') {
            this.onSelectUserGroupDropdown(e.target.value);
        }

        this.setState({
            [name]: value,
            labelvalue: "",
            labelsuccessvalue: ""
        }, this.checkSubmit);
    }

    onSelectUserGroupDropdown(selectedUserGroup) {
        if (selectedUserGroup === "") {
            this.setState({
                userGroupDropdownHidden: true
            })
        } else {
            let name1 = selectedUserGroup.toLowerCase();
            var allUserGroupD = [];
            var groupAssigned = "";
            let groups = (this.state.groups.length > 0) && this.state.groups.filter((u) => {
                if (this.state.userGroups.length > 0) {
                    for (let i = 0; i < this.state.userGroups.length; i++) {
                        if (u._id === this.state.userGroups[i]) {
                            groupAssigned = u._id
                        }
                    }
                }
                return u._id !== groupAssigned;
            })

            // if(groups.length > 0){
            for (let j = 0; j < groups.length; j++) {
                if (groups[j].groupName !== undefined && groups[j].groupName !== null) {
                    if (groups[j].groupName.toLowerCase().indexOf(name1) > -1) {
                        allUserGroupD.push(<li onClick={this.addAssignUserGroup.bind(this, groups[j]._id)} value={groups[j]._id} key={groups[j]._id}
                            style={{ cursor: "pointer", marginLeft: "-20px" }} id={groups[j]._id}>{groups[j].groupName}</li>);
                    }
                }
            }
            // }
            this.setState({
                userGroupDropdownHidden: false,
                allUserGroupsDropdown: allUserGroupD
            });
        }

    }

    onSelectNotifyDropdown(selectedUser) {
        if (selectedUser === "") {
            this.setState({
                notifyDropdownHidden: true
            })
        } else {
            let name1 = selectedUser.toLowerCase();
            var notifyUserD = [];
            var userNotified = "";
            let users = this.state.users.filter((u) => {
                this.state.notifiedUsers && this.state.notifiedUsers.filter((n) => {
                    if (u._id === n) {
                        userNotified = u._id;
                    }
                    return n;
                })
                return u._id !== userNotified;
            })
            users.filter((s, i) => {
                if (s.name !== undefined && s.name !== null) {
                    if (s.name.toLowerCase().indexOf(name1) > -1) {
                        notifyUserD.push(<li onClick={this.addNotifyUser.bind(this, s._id)} value={s._id} key={s._id} id={s._id}
                            style={{ cursor: "pointer", marginLeft: "-20px" }}>{s.name}</li>);
                    }
                }
                return s;
            })
            this.setState({
                notifyDropdownHidden: false,
                notifyUsersDropdown: notifyUserD
            });
        }
    }

    onSelectDropdown(userSelected) {
        if (userSelected === "") {
            this.setState({
                dropdownHidden: true
            })
        } else {
            let name1 = userSelected.toLowerCase();
            var allUserD = [];
            var userAssigned = "";
            let users = this.state.users.filter((u) => {
                this.state.assignUsers.filter((a) => {
                    if (u._id === a) {
                        userAssigned = u._id;
                    }
                    return a;
                })
                return u._id !== userAssigned;
            })

            users.filter((s, i) => {
                if (s.name !== undefined && s.name !== null) {
                    if (s.name.toLowerCase().indexOf(name1) > -1) {
                        allUserD.push(<li onClick={this.addAssignUser.bind(this, s._id)} value={s._id} key={s._id} id={s._id}
                            style={{ cursor: "pointer", marginLeft: "-20px" }}>{s.name}</li>);
                    }
                }
                return s;
            })
            this.setState({
                dropdownHidden: false,
                allUserDropdowns: allUserD
            });
        }
    }

    onSelectCategoryDropdown(categorySelected) {
        if (categorySelected === "") {
            this.setState({
                dropdownHiddenCategory: true
            })
        } else {
            let name1 = categorySelected.toLowerCase();
            var allCategory = [];
            var categoryAssigned = "";
            
            let categories = this.state.categories.filter((c) => {
                this.state.assignCategories.filter((a) => {
                    if (c.title === a) {
                        categoryAssigned = c.title;
                    }
                    return a;
                })
                return c.title !== categoryAssigned;
            })
            categories.filter((s, i) => {
                if (s.title.toLowerCase().indexOf(name1) > -1) {
                    allCategory.push(<li onClick={this.addAssignCategory.bind(this, s.title)} value={s._id} key={s._id} id={s.title}
                        style={{ cursor: "pointer", marginLeft: "-20px" }}>{s.title}</li>);
                }
                return s;
            })
            this.setState({
                dropdownHiddenCategory: false,
                allCategoryDropdowns: allCategory
            });
        }
    }

    addNotifyUser(userId) {
        let input = userId;
        var notifyUsersDropdown = this.state.notifyUsersDropdown.filter((u) => {
            return u.props.value !== userId;
        })
        if (input.length === 0 || input[0] === "") return;

        // let notifyU = this.state.notifiedUsers && this.state.notifiedUsers.filter((nUser) => {
        //     return nUser === input;
        // });

        // let notifyUser = (notifyU.length > 0) ? notifyU[0] : "";
        // if (notifyUser) {
        //     input = "";

        // } else {
        let u = this.state.notifiedUsers ? [...this.state.notifiedUsers, input] : [input];
        this.setState({
            notifiedUsers: u,
            notifyUsersDropdown: notifyUsersDropdown,
            notifyUser: '',
            notifyDropdownHidden: true
        });
        // }
    }

    addAssignUserGroup(groupId) {
        let input = groupId;
        var allUserGroupsDropdown = this.state.allUserGroupsDropdown.filter((u) => {
            return u.props.value !== groupId;
        })
        if (input.length === 0 || input[0] === "") return;

        // let assignUserGroup = this.state.userGroups.filter((userG) => {
        //     return userG === input;
        // });

        // let assUserGroup = (assignUserGroup.length > 0) ? assignUserGroup[0] : "";
        // if (assUserGroup) {
        //     input = "";

        // } else {
        this.setState({
            userGroups: [...this.state.userGroups, input],
            allUserGroupsDropdown: allUserGroupsDropdown,
            userGroupName: '',
            userGroupDropdownHidden: true
        });
        // }
    }

    addAssignUser(id) {
        let input = id;
        var allUserDropdowns = this.state.allUserDropdowns.filter((u) => {
            return u.props.value !== id;
        })
        if (input.length === 0 || input[0] === "") return;

        // let assignU = this.state.assignUsers.filter((aUser) => {
        //     return aUser === input;
        // });

        // let assUser = (assignU.length > 0) ? assignU[0] : "";
        // if (assUser) {
        //     input = "";

        // } else {
        this.setState({
            assignUsers: [...this.state.assignUsers, input],
            allUserDropdowns: allUserDropdowns,
            assignUser: '',
            dropdownHidden: true
        });
        // }
    }

    addAssignCategory(title) {
        let input = title;
        var allCategoryDropdowns = this.state.allCategoryDropdowns.filter((c) => {
            return c.props.value !== title;
        })

        if (input.length === 0 || input[0] === "") return;

        // let assignC = this.state.assignCategories.filter((aCategory) => {
        //     return aCategory === input;
        // });

        // let assCategory = (assignC.length > 0) ? assignC[0] : "";
        // if (assCategory) {
        //     input = "";

        // } else {
        this.setState({
            assignCategories: [...this.state.assignCategories, input],
            allCategoryDropdowns: allCategoryDropdowns,
            assignCategory: '',
            dropdownHiddenCategory: true
        });
        // }
    }

    onDeleteNotifyUsers(tag) {

        let userId = this.props.context.state.userNameToId && this.props.context.state.userNameToId[tag.toLowerCase().replace(/ +/g, "")];

        var notifyUsers = this.state.notifiedUsers && this.state.notifiedUsers.filter((t) => {
            return t !== userId;
        });

        this.setState({
            notifiedUsers: notifyUsers
        })
    }

    onDeleteAssignUsers(tag) {

        let userId = this.props.context.state.userNameToId && this.props.context.state.userNameToId[tag.toLowerCase().replace(/ +/g, "")];

        var assignUsers = this.state.assignUsers.filter((t) => {
            return t !== userId;
        });

        this.setState({
            assignUsers: assignUsers
        })
    }

    onDeleteAssignUserGroup(tag) {
        let userGroup = this.state.groups.filter((u) => {
            return u.groupName === tag;
        });

        let userGroupId = (userGroup.length > 0) ? userGroup[0]._id : "";

        var userGroups = this.state.userGroups.filter((g) => {
            return g !== userGroupId;
        });

        this.setState({
            userGroups: userGroups
        })
    }

    onDeleteAssignCategories(tag) {
        var userRole = Auth.get('userRole');
        if (userRole === 'admin' || userRole === "owner") {
            if (tag === '' || tag === '' || tag === '') {
            // if (tag === 'todo' || tag === 'inprogress' || tag === 'completed') {
                window.alert('You do not have permission to delete this Category!')
            } else {
                let categoryTitle = this.state.categories.filter((c) => {
                    return c.title === tag;
                });
                let title = (categoryTitle.length > 0) ? categoryTitle[0].title : "";
                var assignCategories = this.state.assignCategories.filter((t) => {
                    return t !== title;
                });
                this.setState({
                    assignCategories: assignCategories
                })
            }
        }
    }

    async getProjectData() {
        let { response, err } = await projectservice.getDataByProjectId(this.props.projectId);
        if (err) {
            this.setState({
                message: err
            });
        }
        else if (response && response.data.err) {
            this.setState({ message: response.data.err });
        } else {

            // let a = response.data.messages.sort((a, b) => (a.createdOn > b.createdOn));
            response.data.messages.sort((a, b) => -a.createdOn.localeCompare(b.createdOn))

            this.setState({
                project: response.data.data,
                messages: response.data.messages,
                uploadFiles: response.data.uploadFiles
            })
        }
    }

    onSubmit(e) {
        e.preventDefault();
        if (!this.props.projectId) {
            var createdBy = Auth.get('userId');
            var createdOn = new Date();
            var modifiedBy = Auth.get('userId');
            var modifiedOn = new Date();
        } else {
            let project = this.state.project;
            createdBy = project.createdBy;
            createdOn = project.createdOn;
            modifiedBy = Auth.get('userId');
            modifiedOn = new Date();
        }

        let category = [];
        for (let i = 0; i < this.state.assignCategories.length; i++) {
            category.push(this.state.assignCategories[i]);
        }

        var self = this;
        let projectUsers = [];
        let notifyUsers = [];
        let userGroups = [];

        self.state.assignUsers.forEach(function (userids, i) {

            let assignedUserName = self.props.context.state.user && self.props.context.state.user[userids];

            let newprojectuser = {
                _id: ObjectId.mongoObjectId(),
                name: assignedUserName,
                userId: userids,
            }
            projectUsers.push(newprojectuser);
            return newprojectuser;

        })

        self.state.userGroups.forEach(function (groupids, i) {

            let assignedG = self.state.groups.filter((g) => {
                return g._id === groupids;
            });
            if (assignedG.length > 0) {
                let assignedGroupName = (assignedG.length > 0) ? assignedG[0].groupName : "";
                let assignedGroupMembers = (assignedG.length > 0) ? assignedG[0].groupMembers : [];

                let groupMs = assignedGroupMembers.map((a) => {
                    let user = self.state.users.filter((u) => {
                        return u._id === a;
                    })
                    let members = {
                        id: a,
                        name: (user.length > 0) ? user[0].name : ""
                    }
                    return members;
                })

                let newprojectgroup = {
                    _id: ObjectId.mongoObjectId(),
                    groupName: assignedGroupName,
                    groupId: groupids,
                    groupMembers: groupMs
                }
                userGroups.push(newprojectgroup);
                return newprojectgroup;

            }

        })

        self.state.notifiedUsers && self.state.notifiedUsers.forEach(function (userids, i) {

            let notifiedU = self.state.users.filter((n) => {
                return n._id === userids;
            });
            let notifiedUser = (notifiedU.length > 0) ? notifiedU[0] : "";

            let newnotifyuser = {
                _id: ObjectId.mongoObjectId(),
                name: notifiedUser.name,
                emailId: notifiedUser.email,
                userId: userids,
            }
            notifyUsers.push(newnotifyuser);
            return newnotifyuser;
        })

        let newprojects = {
            _id: ObjectId.mongoObjectId(),
            title: this.state.title,
            description: this.state.description,
            startdate: this.state.startdate,
            enddate: this.state.enddate,
            status: this.state.defaultOption,
            category: category,
            sendnotification: this.state.sendnotification,
            userid: this.state.userid,
            group: this.state.group,
            companyId: this.state.companyId,
            userGroups: userGroups,
            createdBy: createdBy,
            createdOn: createdOn,
            modifiedBy: modifiedBy,
            modifiedOn: modifiedOn,
            isDeleted: this.state.isDeleted,
            projectUsers: projectUsers,
            notifyUsers: notifyUsers,
            miscellaneous: this.state.miscellaneous,
            archive: this.state.archive
        }

        // console.log("newprojects", newprojects);

        if (!this.props.projectId) {
            if (newprojects.title !== "" && newprojects.description !== "") {

                let userName = this.props.context.state.user && this.props.context.state.user[newprojects.userid];
                // console.log("newprojects", newprojects);
                this.postNewRecord(newprojects, userName);
            }
        }
        else {
            if (newprojects.title !== "" && newprojects.description !== "") {

                let userName = this.props.context.state.user && this.props.context.state.user[newprojects.userid];

                this.updateRecord(newprojects, userName);
            }
        }
    }

    async postNewRecord(newprojects, userName) {
        // console.log(" postNewRecord newprojects", newprojects);
        let { response, err } = await projectservice.addProject(newprojects, userName);
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
            let assignCategories = [];
            var categories = this.state.categories.filter((category) => {
                return category.title === 'todo' || category.title === 'inprogress' || category.title === 'completed'
            })

            for (let i = 0; i < categories.length; i++) {
                assignCategories.push(categories[i].title);
            }
            this.setState({
                labelsuccessvalue: response.data.msg,
                labelvalue: '',
                title: '',
                description: '',
                userid: '',
                companyId: '',
                companyName: '',
                userGroupName: '',
                userGroups: [],
                group: '',
                startdate: dateUtil.DateToString(new Date()),
                enddate: dateUtil.DateToString(new Date().setMonth(new Date().getMonth() + config.monthCount)),
                defaultOption: '',
                assignUsers: [],
                notifiedUsers: [],
                assignCategories: assignCategories,
                miscellaneous: false,
                archive: false
            });
        }
    }

    async updateRecord(newprojects, userName) {
        let { response, err } = await projectservice.editProject(newprojects, this.props.projectId, userName);
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
        }
        else {
            this.setState({
                labelsuccessvalue: response.data.msg,
                labelvalue: response.data.msgErr
            });
        }
    }

    async addMsg(msg) {
        this.setState({
            messages: [msg, ...this.state.messages]
        })
    }

    addUploadFile(newFile) {
        this.setState({
            uploadFiles: [...this.state.uploadFiles, newFile]
        })
    }

    deleteFileById(id) {
        let uploadFiles = this.state.uploadFiles.filter((f) => {
            return f._id !== id;
        })
        this.setState({
            uploadFiles: uploadFiles
        })
    }

    deleteMessageById(messageId) {
        let messages = this.state.messages.filter((m) => {
            return m._id !== messageId;

        })
        this.setState({
            messages: messages
        })
    }

    async getStatusOptions() {
        let { response, err } = await projectservice.getStatusOptions();
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
        }
        else {
            this.setState({
                statusOptions: response.data
            });
        }
    }

    async componentDidMount() {
        if (this.state.users.length === 0) {
            this.props.context.actions.setUsers();
        }
        if (this.state.categories.length === 0) {
            this.props.context.actions.setCategories();
        }

        if (this.state.companies.length === 0) {
            this.props.context.actions.setCompanies();
        }

        if (this.state.groups.length === 0) {
            this.props.context.actions.setGroups();
        }

        await this.getStatusOptions();

        let assignUsers = [];
        let assignCategories = [];
        let notifiedUsers = [];
        let userGroups = [];
        if (this.props.projectId) {
            await this.getProjectData();
            let project = this.state.project;
            // console.log("project",project);
            assignUsers = project.projectUsers.map((pU) => {
                return pU.userId;
            })

            userGroups = project.userGroups.map((u) => {
                return u.groupId;
            });

            let companyName = this.props.context.state.companyId && this.props.context.state.companyId[project.companyId];

            assignCategories = project.category.split(",");

            notifiedUsers = project.notifyUsers && project.notifyUsers.map((n) => {
                return n.userId;
            })
            // console.log("project",project);
            this.setState({
                title: project.title,
                description: project.description,
                startdate: project.startdate,
                enddate: project.enddate,
                status: project.status,
                defaultOption: project.status,
                group: project.group,
                userid: project.userid,
                companyId: project.companyId,
                companyName: companyName,
                userGroups: project.userGroups,
                // userGroupName: userGroupName,
                sendnotification: project.sendnotification,
                isDeleted: project.isDeleted,
                projectUsers: project.projectUsers,
                notifyUsers: project.notifyUsers,
                submitDisabled: false,
                titleFlag: true,
                miscellaneous: project.miscellaneous,
                archive: project.archive
            })
        } else {
            assignUsers = [];
            notifiedUsers = [];
            // console.log("userGroups",userGroups);
            var categories = this.props.context.state.categories.filter((category) => {
                return category.title === 'todo' || category.title === 'inprogress' || category.title === 'completed'
            })
            const myData = [].concat(categories)
            .sort((a, b) => a.sequence < b.sequence).reverse();

            for (let i = 0; i < myData.length; i++) {

                assignCategories.push(myData[i].title);
            }
        }
        this.setState({
            assignUsers: assignUsers,
            assignCategories: assignCategories,
            notifiedUsers: notifiedUsers,
            userGroups: userGroups
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            users: nextProps.context.state.users,
            categories: nextProps.context.state.categories,
            companies: nextProps.context.state.companies,
            groups: nextProps.context.state.groups
        });
    }

    onAssignUserKeyPress(e) {

        var nodes = document.getElementById('search_list').childNodes;
        if (nodes.length > 0) {
            if (e.keyCode === 40) {
                if (this.downCount < nodes.length - 1) {
                    this.downCount++;
                }

                for (let i = 0; i < nodes.length; i++) {
                    if (this.downCount === i) {
                        nodes[i].style.background = "lightblue";
                    }
                    else {
                        nodes[i].style.background = "";
                    }
                }
            }
            else if (e.keyCode === 38) {
                // var nodes = document.getElementById('search_list').childNodes;
                if (this.downCount > 0) {
                    this.downCount--;
                }

                for (let i = 0; i < nodes.length; i++) {

                    if (this.downCount === i) {
                        nodes[i].style.background = "lightblue";
                    }
                    else {
                        nodes[i].style.background = "";
                    }
                }

            } else if (e.keyCode === 13) {
                e.preventDefault();
                this.addAssignUser(nodes[this.downCount].id);
            }
        }

    }

    onAssignCategoryKeyPress(e) {
        var nodes = document.getElementById('search_category_list').childNodes;
        if (nodes.length > 0) {
            if (e.keyCode === 40) {
                if (this.categoryCount < nodes.length - 1) {
                    this.categoryCount++;
                }

                for (let i = 0; i < nodes.length; i++) {
                    if (this.categoryCount === i) {
                        nodes[i].style.background = "lightblue";
                    }
                    else {
                        nodes[i].style.background = "";
                    }
                }
            }
            else if (e.keyCode === 38) {
                if (this.categoryCount > 0) {
                    this.categoryCount--;
                }

                for (let i = 0; i < nodes.length; i++) {
                    if (this.categoryCount === i) {
                        nodes[i].style.background = "lightblue";
                    }
                    else {
                        nodes[i].style.background = "";
                    }
                }

            } else if (e.keyCode === 13) {
                e.preventDefault();
                this.addAssignCategory(nodes[this.categoryCount].id);
            }
        }
    }

    onAssignGroupKeyPress(e) {
        var nodes = document.getElementById('search_groups_list').childNodes;
        if (nodes.length > 0) {
            if (e.keyCode === 40) {

                if (this.groupCount < nodes.length - 1) {
                    this.groupCount++;
                }

                for (let i = 0; i < nodes.length; i++) {
                    if (this.groupCount === i) {
                        nodes[i].style.background = "lightblue";
                    }
                    else {
                        nodes[i].style.background = "";
                    }
                }
            }
            else if (e.keyCode === 38) {

                if (this.groupCount > 0) {
                    this.groupCountt--;
                }

                for (let i = 0; i < nodes.length; i++) {
                    if (this.groupCount === i) {
                        nodes[i].style.background = "lightblue";
                    }
                    else {
                        nodes[i].style.background = "";
                    }
                }
            } else if (e.keyCode === 13) {
                e.preventDefault();
                this.addAssignUserGroup(nodes[this.groupCount].id);
            }
        }
    }

    onNotifyKeyPress(e) {
        var nodes = document.getElementById('search_notify_list').childNodes;
        if (nodes.length > 0) {
            if (e.keyCode === 40) {

                if (this.notifyCount < nodes.length - 1) {
                    this.notifyCount++;
                }

                for (let i = 0; i < nodes.length; i++) {

                    if (this.notifyCount === i) {
                        nodes[i].style.background = "lightblue";
                    }
                    else {
                        nodes[i].style.background = "";
                    }
                }

            }
            else if (e.keyCode === 38) {
                if (this.notifyCount > 0) {
                    this.notifyCount--;
                }

                for (let i = 0; i < nodes.length; i++) {

                    if (this.notifyCount === i) {
                        nodes[i].style.background = "lightblue";
                    }
                    else {
                        nodes[i].style.background = "";
                    }
                }
            } else if (e.keyCode === 13) {
                e.preventDefault();
                this.addNotifyUser(nodes[this.notifyCount].id);
            }
        }
    }

    dateUpdate = (name, updatedDate) => {
        // console.log("updatedDate", updatedDate);
        // console.log("name", name);
        // this.setState({
        //     [name]: updatedDate
        // });

        this.setState({
            [name]: updatedDate,
            labelvalue: "",
            labelsuccessvalue: ""
        }, this.checkSubmit);
        // console.log(`updated Date after setState ${name}`, this.state.startdate)
    }


    render() {
        // console.log("updated Date at render startdate", this.state.startdate);
        // console.log("updated Date at render enddate", this.state.enddate);

        var { title, description, startdate, enddate, userid, companyName, group, defaultOption, userGroupName, miscellaneous } = this.state;

        const labelStyle = {
            fontSize: "small",
        };

        const submitStyle = {
            float: "right",
        };

        var userRole = Auth.get('userRole');

        let displayCheckBox = [];
        if (this.state.sendnotification === null || this.state.sendnotification === false) {
            displayCheckBox = <input name="sendnotification" type="checkbox" checked={false} onChange={this.handleChange} />
        }
        else if (this.state.sendnotification === true || this.state.sendnotification === "true") {
            displayCheckBox = <input name="sendnotification" type="checkbox" checked={true} onChange={this.handleChange} />
        }

        let newUsers = this.state.users.filter(function (u) {
            if (u.role === 'owner' || u.role === 'admin') {
                return u.role;
            }
            else { return null; }
        });

        let userDropdown = [];
        userDropdown.push(<option value='0' key="mod">Select owner</option>)
        newUsers.forEach(function (module, i) {
            userDropdown.push(<option value={module._id} key={"mod" + i}>{module.name}</option>)
        })

        let groups = [];
        groups.push(<option value='' key="mod">Select Group</option>)
        this.state.categories.forEach(function (module, i) {
            groups.push(<option value={module.title} key={"mod" + i}>{module.displayName}</option>)
        })



        let catdropdown = [];
        catdropdown.push(<option value='0' key="mod">Select Status</option>)
        this.state.statusOptions.forEach(function (module, i) {
            catdropdown.push(<option value={module.title} key={module.title}>{module.displayName}</option>)
        })


        var assignUsers = this.state.assignUsers.map((tag) => {

            let userName = this.props.context.state.user && this.props.context.state.user[tag];

            return userName ? <Tag key={tag} value={userName} onDeleteTag={this.onDeleteAssignUsers} /> : ""
        });

        var userGroups = this.state.userGroups.map((tag) => {

            let userGroupAssigned = this.state.groups.filter((group) => {
                return group._id === tag;
            });
            let userGroupName = (userGroupAssigned.length > 0) ? userGroupAssigned[0].groupName : "";

            return userGroupName ? <Tag key={tag} value={userGroupName} onDeleteTag={this.onDeleteAssignUserGroup} /> : ""
        });

        var notifyUsers = (this.state.notifiedUsers) && this.state.notifiedUsers.map((tag) => {

            let notifyUserName = this.props.context.state.user && this.props.context.state.user[tag];
            return notifyUserName ? <Tag key={tag} value={notifyUserName} onDeleteTag={this.onDeleteNotifyUsers} /> : ""
        });


        var assignCategories = this.state.assignCategories.map((tag) => {
            let categoryAssigned = this.state.categories.filter((category) => {
                return category.title === tag;
            });
            let ctitle = (categoryAssigned.length > 0) ? categoryAssigned[0].title : "";
            return <Tag key={tag} value={ctitle} onDeleteTag={this.onDeleteAssignCategories} />
        });

        return (


            <div className="container">
            <div className="row">
                    <div className="col-sm-12 content-wrapper">
              
                {this.state.titleFlag ?
                    <span className="mt-3 mb-3 d.inline-block project-title" >
                        <Link to={'/project/tasks/' + this.state.project._id} className="">{this.state.project.title}</Link>
                    </span>
                    :
                    // <h4>New Project</h4>
                    <span className="mt-3 mb-3 d.inline-block project-title" >Add New Project</span>
                }


                        <span className="d.inline-block mr-3 float-right" title="back"> <Link to={'/projects'} className=""> &nbsp; <i className="fas fa-arrow-left "></i></Link></span>
                        <div className="clearfix"></div>
                {this.props.projectId ?
                    <nav>
                    <div className="nav nav-tabs nav-fill" role="tablist">
                            <a className="nav-item nav-link active" href="#editProject" aria-controls="editProject"
                                data-height="true" role="tab" data-toggle="tab" onClick={this.handleTabClick.bind(this, 'editProject')}>
                                Project
                            </a>

                      
                             <a className="nav-item nav-link "  href="#messages" aria-controls="messages" role="tab"
                                data-height="true" data-toggle="tab" onClick={this.handleTabClick.bind(this, 'messages')}>
                                Messages <span className="text-warning"> ({this.state.messages.length})</span>
                            </a>
                    

                      
                             <a className="nav-item nav-link "  href="#uploads" aria-controls="uploads" role="tab" data-height="true"
                                data-toggle="tab" onClick={this.handleTabClick.bind(this, 'uploads')}>
                                Attachment(s) <span className="text-warning"> ({this.state.uploadFiles.length})</span>
                            </a>
                       

                        {userRole === 'user' ? '' :
                            
                                 <a className="nav-item nav-link "  href="#autoclone" aria-controls="autoclone" role="tab" data-height="true"
                                    data-toggle="tab" onClick={this.handleTabClick.bind(this, 'autoclone')}>
                                    Auto Clone
                            </a>
                           }
                    </div>
                    </nav>
                    : ''}

                <div className="tab-content" id="projectTabs" >
                    <div role="tabpanel" className="tab-pane active" id="editProject" >
                        
                                <div className="form-wrapper">
                            <form onSubmit={this.onSubmit} className="mt-3">

                                <div className="row">
                                    <div className="col-sm-12">
                                        {this.state.labelvalue ?
                                            <span htmlFor="project" className="alert alert-danger" value={this.state.labelvalue}>
                                                {this.state.labelvalue}
                                            </span>
                                            :
                                            this.state.labelsuccessvalue ?
                                                <span htmlFor="project" className="alert alert-success" value={this.state.labelsuccessvalue}>
                                                    {this.state.labelsuccessvalue}
                                                </span>
                                                : ""}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-sm-3">
                                        <div className="form-group">
                                            <label style={labelStyle}>Title</label><span style={{ color: 'red' }}>*</span>
                                            <input className="form-control" type='text' placeholder="Title" name="title"
                                                onChange={this.handleChange} value={this.state.title} autoComplete="off"/>
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="form-group">
                                            <label style={labelStyle}>Description</label><span style={{ color: 'red' }}>*</span>
                                            <input className="form-control" type='text' placeholder="Description" name="description"
                                                onChange={this.handleChange} value={this.state.description} autoComplete="off"/>
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="form-group">
                                            <label style={labelStyle}>Project Owner</label><span style={{ color: 'red' }}>*</span>
                                            <select className="form-control" onChange={this.onSelectUserChanged}
                                                value={this.state.userid}>
                                                {userDropdown}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="form-group">
                                            <label htmlFor="Group" style={labelStyle}>Group</label> <span style={{ color: 'red' }}>*</span>
                                            <select className="form-control" onChange={this.onSelectGroupChanged}
                                                value={this.state.group}>
                                                {groups}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-sm-3">
                                        <div className="input-group">
                                            <label style={labelStyle}>Start Date</label><span style={{ color: 'red' }}>*</span>
                                            <Calendar width='267px' height='225px' className="form-control"
                                                dateformat={'YYYY-MM-DD'}
                                                selectedDate={this.state.startdate}
                                                dateUpdate={this.dateUpdate.bind(this, 'startdate')}
                                                id="startdate" calendarModalId="startdateModal"
                                            />

                                            {/* <input className="form-control" type='Date' placeholder="Start Date" name="startdate"
                                                onChange={this.handleChange} value={this.state.startdate} /> */}
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="input-group">
                                            <label style={labelStyle}>End Date</label><span style={{ color: 'red' }}>*</span>
                                            <Calendar width='267px' height='225px' className="form-control"
                                                dateformat={'YYYY-MM-DD'}
                                                selectedDate={this.state.enddate}
                                                dateUpdate={this.dateUpdate.bind(this, 'enddate')}
                                                id="enddate" calendarModalId="enddateModal"
                                            />
                                            {/* <input className="form-control" type='Date' placeholder="End Date" name="enddate"
                                                onChange={this.handleChange} value={this.state.enddate} /> */}
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="form-group">
                                            <label style={labelStyle}>Status</label><span style={{ color: 'red' }}>*</span>
                                            <select className="form-control" onChange={this.onSelectCatChanged}
                                                value={this.state.defaultOption} placeholder="Select Status" >
                                                {catdropdown}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="form-group">
                                            <label htmlFor="Company Name" style={labelStyle}>Company Name</label> <span style={{ color: 'red' }}>*</span>
                                            <input type="text" value={companyName} list="data" onChange={this.onSelectCompanyChanged}
                                                name='companyName' className="form-control" autoComplete="off" placeholder="Company Name" />
                                            <datalist id="data" >
                                                {
                                                    this.state.companies.map((c) => {
                                                        return <option data-value={c._id} key={c._id}>{c.companyName}</option>
                                                    })
                                                }
                                            </datalist>
                                        </div>
                                    </div>
                                </div>


                                <div className="row">
                                    <div className="col-sm-3">
                                        <div className="form-group">
                                            <label htmlFor="Assign Users" style={labelStyle}>Project Members</label>
                                            <input type="text" value={this.state.assignUser} className="form-control"
                                                onChange={this.handleChange} placeholder="Search Users" onKeyDown={this.onAssignUserKeyPress.bind(this)}
                                                name="assignUser" autoComplete="off" style={{ position: 'relative' }} />
                                            <div className="project-typeahead"
                                            //  style={{ position: 'absolute', left: '16px', top: '68px', width: '90%', border: "1px solid #ccc4c4", height: "100px", overflowY: "auto", background: '#fff', zIndex: 50 }}
                                                hidden={this.state.dropdownHidden}>
                                                <ul type="none" style={{ paddingLeft: '30px' }} id="search_list" >
                                                    {this.state.allUserDropdowns}
                                                </ul>
                                            </div>
                                            {assignUsers}
                                        </div>
                                    </div>

                                            {userRole === 'admin' || userRole === "owner" ?
                                    <div className="col-sm-3">
                                        <div className="form-group">
                                            <label style={labelStyle}>Task Groups</label>

                                           
                                                <div>
                                                    <input type="text" value={this.state.assignCategory} onKeyDown={this.onAssignCategoryKeyPress.bind(this)}
                                                        className="form-control" onChange={this.handleChange} placeholder="Search Task Groups"
                                                        name="assignCategory" autoComplete="off" />
                                                    {assignCategories}
                                                    <div className="project-typeahead"
                                                    // style={{ position: 'absolute', left: '16px', top: '68px', width: '90%', border: "1px solid #ccc4c4", height: "100px", overflowY: "auto", background: '#fff', zIndex: 50 }}
                                                        hidden={this.state.dropdownHiddenCategory}>
                                                        <ul type="none" id="search_category_list">
                                                            {this.state.allCategoryDropdowns}
                                                        </ul>
                                                    </div>
                                                </div> 
                                        </div>
                                    </div>

                                                : ''}

                                    {userRole === 'user' ? '' :
                                        <div className="col-sm-3">
                                            <div className="form-group">
                                                <label htmlFor="Notify Users" style={labelStyle}>Notify Me</label>

                                                <input type="text" value={this.state.notifyUser} className="form-control"
                                                    onChange={this.handleChange} placeholder="Search Users" onKeyDown={this.onNotifyKeyPress.bind(this)}
                                                    name="notifyUser" autoComplete="off" />

                                                {notifyUsers}
                                                <div className="project-typeahead"
                                                // style={{
                                                //     position: 'absolute', left: '16px', top: '68px', width: '90%', border: "1px solid #ccc4c4",
                                                //     height: "100px", overflowY: "auto", background: '#fff', zIndex: 50
                                                // }}
                                                    hidden={this.state.notifyDropdownHidden}>
                                                    <ul type="none" id="search_notify_list">
                                                        {this.state.notifyUsersDropdown}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    <div className="col-sm-3">
                                        <div className="form-group">
                                            {/* <label htmlFor="Assign Users" style={labelStyle}>Project Users</label> */}
                                            <label htmlFor="User Groups" style={labelStyle}>Member Groups</label>

                                            <input type="text" value={userGroupName} style={{ position: 'relative' }} onChange={this.handleChange}
                                                name='userGroupName' className="form-control" autoComplete="off" placeholder="User Groups"
                                                onKeyDown={this.onAssignGroupKeyPress.bind(this)} />
                                            <div className="project-typeahead"
                                            // style={{ position: 'absolute', left: '16px', top: '68px', width: '90%', border: "1px solid #ccc4c4", height: "100px", overflowY: "auto", background: '#fff', zIndex: 50 }}
                                                hidden={this.state.userGroupDropdownHidden}>
                                                <ul type="none" style={{ paddingLeft: '30px' }} id="search_groups_list">
                                                    {this.state.allUserGroupsDropdown}
                                                </ul>
                                            </div>
                                            {userGroups}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">

                                    <div className="col-sm-3">
                                        {config.showIsMiscellaneous ?
                                            <div className="form-group">
                                                <input type='checkbox' name="miscellaneous" onChange={this.handleChange} checked={miscellaneous} />
                                                &nbsp;
                                            <label style={{ fontSize: "small", marginRight: "7px", textTransform: "capitalize" }}>Muted</label>
                                            </div> : ""}
                                    </div>
                                    {this.props.projectId ? '' :
                                        <div className="col-sm-3">
                                                <div className="form-group ">
                                                 <label className="pull-right" style={labelStyle}>
                                                        {displayCheckBox}
                                                        &nbsp;  Send Notification? </label></div>
                                                
                                            
                                        </div>}
                                </div>

                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="form-group">
                                            <input type="submit" value="Submit" disabled={!(title && startdate && description && enddate && userid && companyName && group && defaultOption)}
                                                className="btn btn-info mb-3" style={submitStyle} />
                                        </div>
                                    </div>
                                </div>

                            </form>
                                </div>
                            <div>
                          
                        </div>
                    </div>
                    {this.props.projectId ? <div role="tabpanel" className="tab-pane" id="messages">
                        <MessageList messages={this.state.messages} projectId={this.props.projectId} context={this.props.context}
                            users={this.state.users} addMsg={this.addMsg} deleteMessageById={this.deleteMessageById} user={this.props.context.state.user} />
                    </div> : ""}
                    {this.props.projectId ? <div role="tabpanel" className="tab-pane" id="uploads" >
                        <UploadFile uploadFiles={this.state.uploadFiles} projectId={this.props.projectId} deleteFileById={this.deleteFileById}
                            context={this.props.context} addUploadFile={this.addUploadFile} />
                    </div> : ""}

                    {this.props.projectId ? <div role="tabpanel" className="tab-pane" id="autoclone" >
                        <AutoCloneType projectId={this.props.projectId}
                        />
                    </div> : ""}
                </div>
            </div>
       
            </div>
            </div>
       
        );
    }
}