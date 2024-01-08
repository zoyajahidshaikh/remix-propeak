import React, { Component } from 'react';
import * as projectservice from "../../Services/project/project-service";
import Tag from './tag';
import * as ObjectId from '../../utils/mongo-objectid';

export default class AddProjectUser extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        // this.onSelectUserChanged = this.onSelectUserChanged.bind(this);
        this.onDeleteAssignUsers = this.onDeleteAssignUsers.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.downCount = -1;
    }

    state = {
        assignUser: "",
        dropdownHidden: true,
        allUserDropdowns: [],
        assignUsers: [],
        projectId: this.props.projectId,
        users: this.props.users,
        userNameToId: this.props.userNameToId,
        project: this.props.project,
        user: this.props.user,
        messageErr: '',
        messageSuccess: ''
    }

    handleChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        if (name === 'assignUser') {
            this.onSelectDropdown(e.target.value);
        }

        this.setState({
            [name]: value
        });
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

    addAssignUser(id) {
        let input = id;
        var allUserDropdowns = this.state.allUserDropdowns.filter((u) => {
            return u.props.value !== id;
        })
        if (input.length === 0 || input[0] === "") return;

        this.setState({
            assignUsers: [...this.state.assignUsers, input],
            allUserDropdowns: allUserDropdowns,
            assignUser: '',
            dropdownHidden: true
        });
    }

    onDeleteAssignUsers(tag) {

        let userId = this.state.userNameToId && this.state.userNameToId[tag.toLowerCase().replace(/ +/g, "")];

        var assignUsers = this.state.assignUsers.filter((t) => {
            return t !== userId;
        });

        this.setState({
            assignUsers: assignUsers
        })
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

    componentWillReceiveProps(nextProps) {
        this.setState({
            project: nextProps.project,
            users: nextProps.users,
            userNameToId: nextProps.userNameToId,
            user: nextProps.user
        })
    }

    async onSubmit(e) {
        e.preventDefault();
        //console.log("in on submit", this.state.assignUsers);
        var self = this;
        let projectUsers = [];
        self.state.assignUsers.forEach(function (userids, i) {

            let assignedUserName = self.state.user && self.state.user[userids];

            let newprojectuser = {
                _id: ObjectId.mongoObjectId(),
                name: assignedUserName,
                userId: userids,
            }
            projectUsers.push(newprojectuser);
            return newprojectuser;

        })
        //console.log("projectUsers", projectUsers);
        let { response, err } = await projectservice.addProjectUsers(this.state.projectId, projectUsers);
        if (err) {
            this.setState({
                message: 'Error : ' + err,
                messageErr: 'Error : ' + err,
            });
        } else if (response && response.data.err) {
            this.setState({
                message: 'Error : ' + response.data.err,
                messageErr: 'Error : ' + response.data.err,
            });
        }
        else {
            //console.log("response.data in add project user", response.data);
            this.props.getProjectTasks(this.state.projectId);
            this.setState({
                messageSuccess: response.data.msg
            })
        }
    }

    async componentDidMount() {
        let assignUsers = [];

        
        
        let project = this.state.project;
        // //console.log("project",project);
        assignUsers = project.projectUsers.map((pU) => {
            return pU.userId;
        })
        

        this.setState({
            assignUsers: assignUsers
        })
    }

    render() {
        const labelStyle = {
            fontSize: "small",
        };

        const submitStyle = {
            float: "right",
        };

        var assignUsers = this.state.assignUsers.map((tag) => {

            let userName = this.state.user && this.state.user[tag];

            return userName ? <Tag key={tag} value={userName} onDeleteTag={this.onDeleteAssignUsers} /> : ""
        });

        return (
            <div className="container-fluid" >
                <form onSubmit={this.onSubmit} className="mt-3">
                    <div className="row">
                        {this.state.messageErr ?
                            <span htmlFor="project" style={{ color: 'red' }} value={this.state.messageErr}>
                                {this.state.messageErr}
                            </span>
                            :
                            this.state.messageSuccess ?
                                <span htmlFor="project" className="alert-success" value={this.state.messageSuccess}>
                                    {this.state.messageSuccess}
                                </span>
                                : ""}
                    </div>

                    <div className="row">
                        <div className="col-sm-4">
                            <div className="form-group">
                                <label htmlFor="Assign Users" style={labelStyle}>Project Users</label>
                                <input type="text" value={this.state.assignUser} className="form-control"
                                    onChange={this.handleChange} placeholder="Search Users" onKeyDown={this.onAssignUserKeyPress.bind(this)}
                                    name="assignUser" autoComplete="off" style={{ position: 'relative' }} />
                                <div style={{ position: 'absolute', left: '16px', top: '68px', width: '92%', border: "1px solid #ccc4c4", height: "100px", overflowY: "auto", background: '#fff', zIndex: 50 }}
                                    hidden={this.state.dropdownHidden}>
                                    <ul type="none" style={{ paddingLeft: '30px' }} id="search_list" >
                                        {this.state.allUserDropdowns}
                                    </ul>
                                </div>
                                {assignUsers}
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="form-group">
                                <input type="submit" value="Submit"
                                    className="btn btn-primary mb-3" style={submitStyle} />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}