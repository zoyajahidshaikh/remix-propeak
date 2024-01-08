import React, { Component } from 'react';
import Tag from '../tasks/tag';
import Auth from '../../utils/auth';
export default class GroupChatForm extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.AddGroup = this.AddGroup.bind(this);
        this.onDeleteGroupMembers = this.onDeleteGroupMembers.bind(this);
        this.onCancel = this.onCancel.bind(this)

        this.handleInputChange = this.handleInputChange.bind(this);
        this.downCount = -1;
        this.state = {
            group: this.props.group,
            user: this.props.user,
            users: this.props.users,
            selectGroupMembers: "",
            dropdownHidden: true,
            allUserDropdowns: [],
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            users: nextProps.users,
            user: nextProps.user,
            group: nextProps.group,
        });
    }
    componentDidMount() {

    }
    handleChange(e) {
        const value = e.target.value;
        const name = e.target.name;

        if (name === 'selectGroupMembers') {
            this.onSelectDropdown(e.target.value);
        }

        this.setState({
            [name]: value,
        })
    }
    handleInputChange(e) {
        const value = e.target.value;
        const name = e.target.name;

        this.setState({
            group: {
                ...this.state.group,
                [name]: value,
            },
        })
    }

    AddGroup(e) {
        e.preventDefault()
        let data = Object.assign({}, this.state.group);
        // let groupName= this.state.groupName;
        data.createdBy = Auth.get('userId');
        this.props.createGroup(data);
        // this.setState({
        //     groupName: '',
        // })
    }
    onCancel() {
        this.props.onCancel()
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
            let users = (this.state.users.length > 0) && this.state.users.filter((u) => {
                if (this.state.group && this.state.group.groupMembers.length > 0) {
                    for (let i = 0; i < this.state.group.groupMembers.length; i++) {
                        if (u._id === this.state.group.groupMembers[i]) {
                            userAssigned = u._id
                        }
                    }

                }
                return u._id !== userAssigned;
            })

            // if(users.length > 0){
            for (let j = 0; j < users.length; j++) {
                if (users[j].name !== undefined && users[j].name !== null) {
                    if (users[j].name.toLowerCase().indexOf(name1) > -1) {
                        allUserD.push(<li onClick={this.addAssignUser.bind(this, users[j]._id)} value={users[j]._id} key={users[j]._id} id={users[j]._id}
                            style={{ cursor: "pointer", marginLeft: "-20px" }}>{users[j].name}</li>);
                    }
                }
            }
            // }

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
            group: {
                ...this.state.group,
                groupMembers: [...this.state.group.groupMembers, input],

            },
            allUserDropdowns: allUserDropdowns,
            selectGroupMembers: '',
            dropdownHidden: true
        });

    }
    onGroupKeyPress(e) {

        var nodes = document.getElementById('search_groups').childNodes;
        if (nodes.length > 0) {
            if (e.keyCode === 40) {
                if (this.downCount < nodes.length - 1) {
                    this.downCount++;
                }

                for (var i = 0; i < nodes.length; i++) {
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
    onDeleteGroupMembers(tag) {
        let user = this.state.users.filter((u) => {
            return u.name === tag;
        });

        let userId = (user.length > 0) ? user[0]._id : "";
        var groupMembers = this.state.group && this.state.group.groupMembers.filter((t) => {
            return t !== userId;
        });

        this.setState({
            group: {
                ...this.state.group,
                groupMembers: groupMembers
            }

        })
    }
    render() {

        var { selectGroupMembers } = this.state;
        var { groupName, groupMembers } = this.state.group;
        var groupmembers = (groupMembers.length > 0) && groupMembers.map((tag) => {
            let userName = this.state.user && this.state.user[tag];

            return userName ? <Tag key={tag} value={userName} onDeleteTag={this.onDeleteGroupMembers} /> : ""
        });
        return (
            <div className="form-wrapper">
                <form onSubmit={this.AddGroup}>

                    <div className="row">
                        <div className="col-sm-12">
                            <div className="form-group">
                                <input type="text" className="form-control" placeholder="groupname" value={groupName} name='groupName' onChange={this.handleInputChange} />
                            </div>
                        </div>

                    </div>

                    <div className="row">
                        <div className="col-sm-12">
                            <div className="form-group">
                                <label htmlFor="Select Group Members" >Select Group Members</label>
                                <input type="text" value={selectGroupMembers} className="form-control" onKeyDown={this.onGroupKeyPress.bind(this)}
                                    onChange={this.handleChange} placeholder="Select Group Members"
                                    name="selectGroupMembers" autoComplete="off" style={{ position: 'relative' }} />
                                <div style={{
                                    position: 'absolute', left: '15px', top: '69px', width: '94%', border: "1px solid #ccc4c4",
                                    height: "100px", overflowY: "auto", background: '#fff', zIndex: 50
                                }}
                                    hidden={this.state.dropdownHidden}>
                                    <ul type="none" style={{ paddingLeft: '30px' }} id="search_groups">
                                        {this.state.allUserDropdowns}
                                    </ul>
                                </div>
                                {groupmembers}
                            </div>
                        </div>
                    </div>
                    <div className="row mb-1">


                        <div className="col-6 col-sm-6">
                            {/* <button>Create Group</button> */}
                            <input type="submit" className="btn btn-info btn-block mt-1" value="Submit"/>
                        </div>

                        <div className="col-6 col-sm-6">
                            {/* <button>Create Group</button> */}
                            <input type="button" className="btn btn-default btn-block mt-1" value="Cancel" onClick={this.onCancel} />
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}