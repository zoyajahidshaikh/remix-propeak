import React, { Component } from 'react';
import './group.css';
import GroupList from './group-list';
import GroupForm from './group-form';
import * as groupservice from '../../Services/group/group-service';
import * as validate from '../../common/validate-entitlements';

export default class Groups extends Component {
    constructor(props) {
        super(props);

        this.addNewGroupWindow = this.addNewGroupWindow.bind(this);
        this.closeGroup = this.closeGroup.bind(this);
        this.editGroupWindow = this.editGroupWindow.bind(this);
        this.onGroupSubmit = this.onGroupSubmit.bind(this);
        this.editGroup = this.editGroup.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }

    state = {
        isLoaded: true,
        group: {
            groupName: '',
            groupMembers: [],
            isDeleted: false
        },
        groups: this.props.context.state.groups,
        users: this.props.context.state.users,
        user: this.props.context.state.user,
        userNameToId: this.props.context.state.userNameToId,
        showNewGroup: false,
        showEditGroup: false,
        editGroupId: "",
        labelsuccessvalue: "",
        appLevelAccess: this.props.context.state.appLevelAccess
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            groups: nextProps.context.state.groups,
            users: nextProps.context.state.users,
            user: nextProps.context.state.user,
            userNameToId: nextProps.context.state.userNameToId,
            appLevelAccess: nextProps.context.state.appLevelAccess
        });
    }

    addNewGroupWindow() {
        this.setState({
            showNewGroup: true,
            group: {
                groupName: '',
                groupMembers: [],
                isDeleted: false
            },
            labelsuccessvalue: ''
        })
    }

    closeGroup() {
        this.setState({
            showNewGroup: false,
            showEditGroup: false,
            editGroupId: "",
            labelsuccessvalue: ''
        })
    }

    editGroupWindow(groupId, group) {
        this.setState({
            showEditGroup: true,
            editGroupId: groupId,
            group: group,
            labelsuccessvalue: ''
        })
    }

    async onGroupSubmit(group) {

        let { response, err } = await groupservice.addGroup(group);
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
            let groups = Object.assign([], this.props.context.state.groups);
            groups.push(response.data.result);
            this.props.context.actions.updateState("groups", groups);
            this.setState({
                labelsuccessvalue: response.data.msg
            })
        }
    }

    async editGroup(group) {
        let { response, err } = await groupservice.editGroup(group);
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
            let groups = this.props.context.state.groups.map((g) => {
                if (g._id === group._id) {
                    g = group;
                }
                return g;
            });
            this.props.context.actions.updateState("groups", groups);
            this.setState({
                labelsuccessvalue: response.data.msg,
                group: group
            })
        }
    }


    onDelete(groupId) {
        if (window.confirm('Are you sure you want to delete this Group?')) {
            let filteredGroup = this.state.groups && this.state.groups.filter((group) => {
                return group._id === groupId
            })
            filteredGroup[0].isDeleted = true;
            this.deleteGroup(filteredGroup);
        }

    }

    async deleteGroup(group) {
        let { response, err } = await groupservice.deleteGroup(group);
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
            let groups = this.props.context.state.groups.filter((group) => {
                return group._id !== response.data.result._id;
            });
            this.props.context.actions.updateState("groups", groups);
        }
    }

    componentDidMount() {
        this.props.context.actions.setGroups();
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

    render() {
        // let groupClass = 'col-sm-7 contentWrapper';
        // let noGroupClass = 'col-sm-7 contentWrapper';
        let groupClass = 'col-sm-12 col-md-6  col-lg-7 contentWrapper';
        let noGroupClass = 'col-sm-12 col-md-9  col-lg-7 contentWrapper';
        let addUserGroup = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'User Groups', 'Create');

        var groupList = <GroupList
            groups={this.state.groups} onDelete={this.onDelete}
            editGroupWindow={this.editGroupWindow}
            appLevelAccess={this.state.appLevelAccess} />

        return (
            <div className="container bg-white">
                {this.state.isLoaded ? <div className="logo">
                    <img src="/images/loading.svg" alt="loading" />
                </div> :
                    <div>
                        <div className="row" >
                            <div className="col-sm-7" >
                                <div className="row">
                                    <div className="col-sm-6">
                                        

                                <h4 className="sub-title ml-3 mt-3">Groups ({this.state.groups.length})
                            &nbsp;
                               
                                </h4>
                                    </div>
                                    <div className="col-sm-6">
                                        <h4 className="mt-3">
                                            {addUserGroup ? <span className="btn btn-xs btn-info float-right" title="Add Group" onClick={this.addNewGroupWindow}>
                                                {/* <i className="fas fa-plus-square"></i> */}
                                                Add Group &nbsp;<i className="fas fa-plus"></i>
                                            </span> : ""}
                                        </h4>
                                    </div>
                                </div>

                            </div>
                         

                        </div>
                        <hr />
                        <div className="row">
                            {this.state.showEditGroup || this.state.showNewGroup ?
                                <div className="col-sm-12 col-md-5 col-lg-5 order-lg-1 order-md-1 form-wrapper" >
                                {/* <div className="col-sm-5 order-sm-1 form-wrapper" > */}
                              
                                    <GroupForm groups={this.state.groups} onGroupSubmit={this.onGroupSubmit} userNameToId={this.state.userNameToId}
                                        group={this.state.group} users={this.state.users} user={this.state.user}
                                        editGroup={this.editGroup} groupId={this.state.editGroupId} closeGroup={this.closeGroup}
                                        labelsuccessvalue={this.state.labelsuccessvalue} labelvalue={this.state.labelvalue} >
                                    </GroupForm>
                                </div> : ""}
                            <div className={this.state.showEditGroup || this.state.showNewGroup ? groupClass : noGroupClass} >
                               <div className="scroll">
                                  {groupList}
                               </div>
                            </div>
                        </div>
                    </div>}
            </div>
        )
    }
}

