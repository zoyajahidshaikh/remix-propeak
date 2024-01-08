import React, { Component } from 'react';
import TaskMenu from '../tasks/task-menu';
import * as accessrightservice from '../../Services/access-right/access-right-service';
import * as applevelaccessrightservice from '../../Components/Entitlement/services/applevelaccessright-service';

export default class AccessRights extends Component {
    constructor(props) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);
        // this.handleCheck = this.handleCheck.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

    }
    state = {
        projectName: this.props.context.state.projectName,
        project: this.props.context.state.project,
        users: this.props.context.state.users,
        userNameToId: this.props.context.state.userNameToId,
        userName: "",
        label: "",
        entitlements: [
            { id: 1, entitlementId: "edit", group: "Projects", value: false },
            { id: 2, entitlementId: "delete", group: "Projects", value: false },
            { id: 3, entitlementId: "clone", group: "Projects", value: false },
            { id: 4, entitlementId: "view all", group: "Task", value: false },
            { id: 5, entitlementId: "edit all", group: "Task", value: false },
            { id: 6, entitlementId: "view", group: "Task Report", value: false },
            { id: 7, entitlementId: "view", group: "Audit Report", value: false },
            { id: 8, entitlementId: "view", group: "Upload Tasks", value: false },
            { id: 9, entitlementId: "view", group: "Notification", value: false },
            { id: 10, entitlementId: "create", group: "Notification", value: false },
            { id: 11, entitlementId: "edit", group: "Notification", value: false },
            { id: 12, entitlementId: "delete", group: "Notification", value: false }
        ],
        // hasError: false
    }

    // static getDerivedStateFromError(error) {
    //     // Update state so the next render will show the fallback UI.
    //     // return { hasError: true };
    //     console.log("error", error);
    //     this.setState({
    //         hasError: true
    //     })
    // }

    handleInputChange(e) {
        let userName = e.target.value;

        if (userName === "") {
            let entitlementsCopy = Object.assign([], this.state.entitlements);
            let entitlements = entitlementsCopy.map((e) => {
                e.value = false;
                return e;
            })
            this.setState({
                entitlements: entitlements,
                userName: userName,
                label: ""
            })
        } else {
            let userId = this.state.userNameToId && this.state.userNameToId[userName.toLowerCase().replace(/ +/g, "")];
            this.getUserAccessRights(userId);
            this.setState({
                userName: userName,
                label: ""
            })
        }
    }

    async getUserAccessRights(userId) {

        let appLevelAccessRightResponse = await applevelaccessrightservice.getUserAppLevelAccessRights(userId);
        appLevelAccessRightResponse = appLevelAccessRightResponse.response;

        let { response, err } = await accessrightservice.getUserAccessRights(this.props.projectId, userId);
        if (err) {
            this.setState({
                message: 'Error: ' + err
            });
        } else if (response && response.data.err) {
            this.setState({
                message: 'Error: ' + response.data.err
            });
        }
        else {

            if (response.data.length > 0) {
                let getEntitlements = [];
                for (let i = 0; i < response.data.length; i++) {
                    getEntitlements = this.state.entitlements.map((e) => {
                        if (response.data[i].entitlementId === e.entitlementId && response.data[i].group === e.group) {
                            e.value = true;
                        }
                        return e;
                    })
                }

                this.setState({
                    entitlements: getEntitlements
                })
            }
            else if (appLevelAccessRightResponse.data.length > 0) {
                let getEntitlements = [];
                for (let i = 0; i < appLevelAccessRightResponse.data.length; i++) {
                    getEntitlements = this.state.entitlements.map((e) => {
                        if (appLevelAccessRightResponse.data[i].entitlementId.toLowerCase() === e.entitlementId.toLowerCase() && appLevelAccessRightResponse.data[i].group.toLowerCase() === e.group.toLowerCase()) {
                            e.value = true;
                        }
                        return e;
                    })
                }

                this.setState({
                    entitlements: getEntitlements
                })
            }

            else {
                let entitlementsCopy = Object.assign([], this.state.entitlements);
                let entitlements = entitlementsCopy.map((e) => {
                    e.value = false;
                    return e;
                })
                this.setState({
                    entitlements: entitlements
                })
            }
        }
    }

    handleCheck(id, e) {
        const target = e.target;
        const value = target.checked;

        let rights = Object.assign([], this.state.entitlements);
        let userEntitlements = rights.map((r) => {
            if (r.id === id) {
                r.value = value;
            }
            return r;
        })

        this.setState({
            entitlements: userEntitlements
        })
    }

    async onSubmit(e) {
        e.preventDefault();
        // console.log("this.state.userName",this.state.userName);
        // console.log("this.state.userName.toLowerCase()",this.state.userName.toLowerCase().replace(/ +/g, ""));

        let userId = this.state.userNameToId && this.state.userNameToId[this.state.userName.toLowerCase().replace(/ +/g, "")];
        // console.log("this.state.userNameToId",this.state.userNameToId);
        // console.log("userId",userId);
        let userEntitlements = this.state.entitlements.filter((e) => {
            return e.value === true;
        })

        let userAccessRights = {
            userId: userId,
            projectId: this.props.projectId,
            entitlements: userEntitlements
        }

        let { response, err } = await accessrightservice.saveUserAccessRight(userAccessRights);
        if (err) {
            this.setState({
                message: 'Error: ' + err
            });
        } else if (response && response.data.err) {
            this.setState({
                message: 'Error: ' + response.data.err
            });
        }
        else {
            let entitlementsCopy = Object.assign([], this.state.entitlements);
            let entitlements = entitlementsCopy.map((e) => {
                e.value = false;
                return e;
            })
            this.setState({
                label: response.data.msg,
                userName: "",
                entitlements: entitlements
            })
        }
    }

    async componentDidMount() {
        // console.log("in component DiD mount of access rights");
        await this.props.context.actions.getProjectData(this.props.projectId);
        if (this.state.users.length === 0) this.props.context.actions.setUsers();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            project: nextProps.context.state.project,
            users: nextProps.context.state.users,
            userNameToId: nextProps.context.state.userNameToId
        })
    }

    render() {
        // if (this.state.hasError) {
        //     console.log("in here")
        //     // You can render any custom fallback UI
        //     return <h3>Something went wrong.</h3>;
        // }
        let { entitlements } = this.state;
        let projectUsers = this.state.project.projectUsers && this.state.project.projectUsers.map((u) => {
            return (<option key={u.userId}
                data-value={u.userId}>{u.name}</option>)
        })
        let entitlementObject = {};
        if (entitlements.length > 0) {
            for (let i = 0; i < entitlements.length; i++) {
                if (entitlementObject[entitlements[i].group]) {
                    entitlementObject[entitlements[i].group].push(entitlements[i])
                } else {
                    entitlementObject[entitlements[i].group] = [entitlements[i]]
                }
            }
        }

        var keys = Object.keys(entitlementObject);
        let checkBoxes = keys.map((k, index) => {
            let values = entitlementObject[k].map((a) => {
                return (<div key={a.id} className="col-sm-2">
                    <div className="form-group">
                        <input type='checkbox' placeholder=" " onChange={this.handleCheck.bind(this, a.id)} checked={a.value} />
                        &nbsp;
                        <label style={{ fontSize: "small", marginRight: "7px", textTransform: "capitalize" }}>{a.entitlementId}</label>
                    </div>
                </div>)
            })

            return (
                <div className="row" key={index} style={{ marginTop: "10px" }}>
                    <div className="col-sm-2">
                        <div className="form-group">
                            <label htmlFor={k} style={{ fontSize: "small", textTransform: "capitalize" }}>{k}</label>
                        </div>
                    </div>
                    {values}
                </div>

            )
        })


        return (
            <React.Fragment>
             <div className="container content-wrapper">
                    <h3 className="project-title d.inline-block mt-3 mb-3">{this.state.projectName}-Access Rights</h3>
                    <hr/>
              <TaskMenu {...this.props} />
                <form onSubmit={this.onSubmit}>
                    <span style={{ color: 'green' }}>{this.state.label}</span>
                    <div className="row" style={{ marginTop: "10px" }}>
                        <div className="col-sm-4">
                            <label htmlFor="Assigned Users" style={{ fontSize: "small" }}>Project Users : </label>
                            <input type="text" value={this.state.userName} list="assignedUsers" onChange={this.handleInputChange}
                                name="userName" className="form-control" autoComplete="off" placeholder="Select User" />
                            <datalist id="assignedUsers" >
                                {
                                    projectUsers
                                }
                            </datalist>
                        </div>
                    </div>

                    {checkBoxes}

                    <div className="row" style={{ marginTop: "10px" }}>
                        <div className="col-sm-2 float-right">
                            <input type="submit" className="btn btn-primary btn-block" value="Save" disabled={!this.state.userName}
                            />
                        </div>
                    </div>
                </form>
                </div>
            </React.Fragment>
        )
    }
}





