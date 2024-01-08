import React, { Component } from 'react';
import UserForm from './user-form';
import UserList from './user-list';
import * as userservice from "../../Services/user/user-service";
import * as validate from '../../common/validate-entitlements';
import _ from 'lodash';
import Auth from '../../utils/auth';

export default class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {
                name: '',
                role: "user",
                password: '',
                email: '',
                companyName: '',
                companyId: '',
                isDeleted: false,
                reportingManager: '',
                reportingManagerId: '',
                isActive: true,
                contactNumber: '',
                alternateNumber: '',
                gender: '',
                dob: '',
                isLocked: false,
                dateOfJoining: "",
                designation: "",
                bloodGroup: "",
                currentAddress: "",
                permanentAddress: "",
                panNo: "",
                addharNo: "",
                passportNo: "",
                passportName: "",
                passportissueDate: "",
                passportexpiryDate: "",
                placeOfIssue: "",
                createdBy: Auth.get('userId'),
                createdOn: new Date(),
                modifiedBy: Auth.get('userId'),
                modifiedOn: new Date()

            },
            companies: this.props.context.state.companies,
            users: this.props.context.state.users,
            userSearch: '',
            isLoaded: true,
            userFilter: [],
            showNewUser: false,
            showEditUser: false,
            editUserId: "",
            labelsuccessvalue: "",
            labelvalue: "",
            appLevelAccess: this.props.context.state.appLevelAccess
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.editUserWindow = this.editUserWindow.bind(this);
        this.addNewUserWindow = this.addNewUserWindow.bind(this);
        this.keyCheck = this.keyCheck.bind(this);
        this.onDeleteUser = this.onDeleteUser.bind(this);
        this.searchByUsers = this.searchByUsers.bind(this);
        this.closeUser = this.closeUser.bind(this);
        this.onAddUserSubmit = this.onAddUserSubmit.bind(this);
        this.oneditUserSubmit = this.oneditUserSubmit.bind(this);
        this.delayedCallback = _.debounce(this.handleChangeCall, 500)
    }

    componentDidMount() {
        if (this.state.companies.length === 0) {
            this.props.context.actions.setCompanies();
        }
        if (this.state.users.length === 0) {
            this.props.context.actions.setUsers();
        }
        if (this.state.appLevelAccess.length === 0) {
            this.props.context.actions.getAppLevelAccessRights();
        }
        this.setState({
            isLoaded: false
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            users: nextProps.context.state.users,
            companies: nextProps.context.state.companies,
            appLevelAccess: nextProps.context.state.appLevelAccess
        })
    }

    async onDeleteUser(id) {
        if (window.confirm('Are you sure you want to delete this Member?')) {
            let { response, err } = await userservice.deleteUser(id);
            if (err) {
                this.setState({
                    message: err
                });
            }
            if (response && response.data.err) {
                this.setState({ message: response.data.err });
            }
            await this.props.context.actions.setUsers();
        }

    }

    keyCheck(e) {
        if (e.which === 13) {
            this.searchByUsers();
        }
    }

    searchByUsers() {
        var userFilter = Object.assign([], this.props.context.state.users);

        let searchUser = this.state.userSearch.toLowerCase();
        var users = userFilter.filter((user) => {
            return user.name.toLowerCase().indexOf(searchUser) > -1 || user.role.toLowerCase() === searchUser;
        })

        this.setState({
            userFilter: users
        })
    }

    handleChangeCall(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        // console.log("name", name);
        // console.log("value", value);
        if (name === "userSearch") {
            this.setState({
                userSearch: value
            })
            if (value === '') {
                this.setState({
                    userFilter: this.props.context.state.users
                })
            }
        }

        this.setState({
            [name]: value,
        });

    }

    handleInputChange(event) {
        event.persist()
        this.delayedCallback(event)
    }

    addNewUserWindow() {
        this.setState({
            showNewUser: true,
            //editUserId: "",
            user: {
                _id: '',
                name: '',
                role: "user",
                password: '',
                email: '',
                companyName: '',
                companyId: '',
                reportingManager: '',
                reportingManagerId: '',
                isDeleted: false,
                isActive: true,
                contactNumber: '',
                alternateNumber: '',
                gender: '',
                dob: '',
                isLocked: false,
                dateOfJoining: "",
                designation: "",
                bloodGroup: "",
                currentAddress: "",
                permanentAddress: "",
                panNo: "",
                addharNo: "",
                passportNo: "",
                passportName: "",
                passportissueDate: "",
                passportexpiryDate: "",
                placeOfIssue: "",
                createdBy: Auth.get('userId'),
                createdOn: new Date(),
                modifiedBy: Auth.get('userId'),
                modifiedOn: new Date()
            },
            labelsuccessvalue: '',
            message:''
        })
    }

    closeUser() {
        this.setState({
            showNewUser: false,
            showEditUser: false,
            editUserId: "",
            labelsuccessvalue: '',
            labelvalue: '',
            message:''
        })
    }

    editUserWindow(userId, user) {
        let companyName = this.props.context.state.companyId && this.props.context.state.companyId[user.companyId];
        user.companyName = companyName;
        let uName = this.state.users.filter((u) => {
            return u._id === user.reportingManagerId;
        });
        let userName = (uName && uName.length > 0) ? uName[0].name : '';
        this.setState({
            showEditUser: true,
            editUserId: userId,

            user: {
                _id: user._id,
                name: user.name,
                role: user.role,
                email: user.email,
                isDeleted: user.isDeleted,
                companyId: user.companyId,
                companyName: user.companyName,
                reportingManager: userName,
                reportingManagerId: user.reportingManagerId,
                isActive: user.isActive,
                contactNumber: user.contactNumber || '',
                alternateNumber: user.alternateNumber || '',
                gender: user.gender,
                dob: user.dob,
                isLocked: user.isLocked,
                dateOfJoining: user.dateOfJoining,
                designation: user.designation,
                bloodGroup: user.bloodGroup,
                currentAddress: user.currentAddress,
                permanentAddress: user.permanentAddress,
                panNo: user.panNo,
                addharNo: user.addharNo,
                passportNo: user.passportNo,
                passportName: user.passportName,
                passportissueDate: user.passportissueDate,
                passportexpiryDate: user.passportexpiryDate,
                placeOfIssue: user.placeOfIssue,
                createdBy: user.createdBy,
                createdOn: user.createdOn,
                modifiedBy: user.modifiedBy,
                modifiedOn: user.modifiedOn

            },
            labelsuccessvalue: '',
            message:''
        })
    }

    async onAddUserSubmit(user) {
        let { response, err } = await userservice.addUser(user);
        if (err) {
            this.setState({
                message: err
            });
        }
        else if (response && response.data.err) {
            this.setState({ message: response.data.err });
        } else {
            this.setState({

                submitDisabled: true,
                labelsuccessvalue: response.data.msg
            });
            let users = Object.assign([], this.props.context.state.users);
            users.push(response.data.result);
            this.props.context.actions.updateState("users", users);
        }
    }

    async oneditUserSubmit(user) {
      let userId=Auth.get('userId')
      let date=new Date()
        user.modifiedBy=userId
        user.modifiedOn=date
        let { response, err } = await userservice.updateUser(user);
        if (err) {
            this.setState({
                message: err
            });
        }
        else if (response && response.data.err) {
            this.setState({ message: response.data.err });
        } else {
            this.setState({
                labelsuccessvalue: response.data.msg,
                user: {
                    _id: user._id,
                    name: user.name,
                    role: user.role,
                    email: user.email,
                    isDeleted: user.isDeleted,
                    companyId: user.companyId,
                    companyName: user.companyName,
                    isActive: user.isActive,
                    contactNumber: user.contactNumber,
                    alternateNumber: user.alternateNumber,
                    gender: user.gender,
                    dob: user.dob,
                    isLocked: user.isLocked,
                    dateOfJoining: user.dateOfJoining,
                    designation: user.designation,
                    bloodGroup: user.bloodGroup,
                    currentAddress: user.currentAddress,
                    permanentAddress: user.permanentAddress,
                    panNo: user.panNo,
                    addharNo: user.addharNo,
                    passportNo: user.passportNo,
                    passportName: user.passportName,
                    passportissueDate: user.passportissueDate,
                    passportexpiryDate: user.passportexpiryDate,
                    placeOfIssue: user.placeOfIssue,
                    createdBy: user.createdBy,
                    createdOn: user.createdOn,
                    modifiedBy: user.modifiedBy,
                    modifiedOn: user.modifiedOn


                }
            });
            let users = this.props.context.state.users.map((c) => {
                if (c._id === user._id) {
                    c = user;
                }
                return c;
            });
            this.props.context.actions.updateState("users", users);
        }
    }

    render() {
        // console.log("user",this.state.user);
        //var { userSearch } = this.state;
        let userClass = 'col-sm-12 col-md-12 col-lg-4 contentWrapper';
        let noUserClass = 'col-sm-12 col-md-9 col-lg-7 contentWrapper';
       
        let users = this.state.userFilter.length > 0 ? this.state.userFilter : this.props.context.state.users;

        let addUser = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Users', 'Create');

        let userList = <UserList users={users}
            editUserWindow={this.editUserWindow}
            onDeleteUser={this.onDeleteUser}
            appLevelAccess={this.state.appLevelAccess} />

        return (
            <div className="container bg-white">
                {this.state.isLoaded ?
                    <div className="logo">
                        <img src="/images/loading.svg" alt="loading" />
                    </div> :
                    <React.Fragment>
                        <div className="row" >
                            <div className="col-sm-7" >
                                <div className="row" >

                            <div className="col-sm-8" >



                            <div className="row" >
                                <div className="col-sm-6" >
                                    <h4 className="sub-title ml-3 mt-3">
                                        Members ({this.state.users.length})
                                    </h4>
                                </div>
                          
                            </div>

                               
                                
                            </div>
                            <div className="col-sm-4">
                            <h4 className="mt-3">
                                    {addUser ? <span title="New User" onClick={this.addNewUserWindow}
                                       className="btn btn-xs btn-info float-right">
                                        Add Member &nbsp;<i className="fas fa-plus"></i>
                                    </span> : ""}
                                </h4>
                            </div>
                        </div>
                            </div>
                            
                            <div className="col-sm-5">
                                <div className="row">
                                    <div className="col-sm-6 offset-sm-6">
                                        <div className="input-group input-group-sm mt-1 mb-3" >

                                            <input type="text" placeholder="Search Users" name="userSearch" className="form-control mt-2 rounded-0 project-search "
                                                onChange={this.handleInputChange} onKeyPress={this.keyCheck} />


                                            <div className="input-group-prepend">
                                                <button className="input-group-text " onClick={this.searchByUsers} style={{  marginTop: '8px' }} >
                                                    <span role="img" aria-label="Search">
                                                        &#x1F50D;
                                                </span>
                                                </button>


                                            </div>
                                        </div>
</div>
                                </div>
                               

</div>

                        </div>


                        <hr />
                        <div className="row">
                            {this.state.showEditUser || this.state.showNewUser ?
                                <div className="col-sm-12 col-md-12 col-lg-8 order-lg-1 form-wrapper" >
                                {/* <div className="col-sm-8 order-sm-1 form-wrapper" > */}
                                    <UserForm companies={this.props.context.state.companies}
                                        users={this.props.context.state.users}
                                        user={this.state.user}
                                        userId={this.state.editUserId}
                                        closeUser={this.closeUser}
                                        labelsuccessvalue={this.state.labelsuccessvalue}
                                        onAddUserSubmit={this.onAddUserSubmit}
                                        oneditUserSubmit={this.oneditUserSubmit}
                                        labelvalue={this.state.labelvalue}
                                        companyId={this.props.context.state.companyId}
                                        companyName={this.props.context.state.companyName}
                                        message={this.state.message}
                                    >

                                    </UserForm>
                                </div> : ""}
                            <div className={this.state.showEditUser || this.state.showNewUser ? userClass : noUserClass} >
                                <div className="scroll">
                                    {userList}
                                </div>
                              
                            </div>
                        </div>

                    </React.Fragment>
                }
            </div>
        )
    }
}