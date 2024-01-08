import React, {
    Component
} from 'react';
import io from "socket.io-client";
import Auth from '../../utils/auth';
import './user-chat.css';
import ChatMessageForm from './chat-message-form';
import ChatMessageList from './chat-message-list';
import GroupChatForm from './group-chat-form';
import {addMessage} from '../../common/add_message';
//import config from '../../common/config'

export default class UserChatForm extends Component {
    constructor(props) {
        super(props);
        this.socket = io.connect("/",{
            secure:true,
            path:'/chat/socket.io'
        });
    //   this.socket = io.connect(window.propeakConfigData.socketPath);

        this.state = {
            group: {
                groupName: '',
                groupMembers: [Auth.get('userId')],
                createdBy: ''
            },
            messages: [],
            groupMessages: [],
            // activeUsers: [],
            users: this.props.context.state.users,
            replyInputBox: false,
            groupsData: [],
            replymessage: '',
            privateUserChat: false,
            toSendMessages: '',
            groupUserChat: false,
            showCreateForm: false,
            tosend: '',
            user: this.props.context.state.user,

            chatWindows: this.props.context.state.chatWindows,
            chatMessages: [],
            activeUsers:this.props.context.state.activeUsers,
            msg:{},
        }


        this.saveMessages = this.saveMessages.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.createPrivatechat = this.createPrivatechat.bind(this);
        this.createGroupchat = this.createGroupchat.bind(this);
        this.showCreateForm = this.showCreateForm.bind(this);
        this.showGroup = this.showGroup.bind(this);
        this.closeWindow = this.closeWindow.bind(this);
        this.onCancel = this.onCancel.bind(this)

        this.socket.on('RECEIVE_MESSAGE', function (data) {
            let userName = Auth.get('userName');
            let userId = Auth.get('userId');
                this.setState({msg:data})
            if (data.groupName === '') {
                if ((data.toUser === userId || userName === data.author)) {
                   
                   addMessage(data,this);  
                }
            }
            else {
                addMessage(data,this);
            }

        }.bind(this));


 

        // const addMessage = (data) => {

        //     let userName = Auth.get('userName');
        //     let userId = Auth.get('userId');
        //     let chatWindows = Object.assign([], this.state.chatWindows);
        //     let messages = Object.assign([], this.state.messages);
        //     let fromUser = this.state.users && this.state.users.filter((u) => {
        //         return u._id === data.toUser

        //     })
        //     let fromUserName = fromUser.length > 0 ? fromUser[0].name : '';
        //     let id = this.state.users && this.state.users.filter((u) => {
        //         return u.name === data.author

        //     })
        //     let uId = id.length > 0 ? id[0]._id : '';
        //     let userCondition = (data.groupName === '') ? userName !== data.author && userId === data.toUser : userName !== data.author

        //     if (userCondition) {
        //         let chatWindow = null,
        //             chatWindowsCount = chatWindows.length;
        //         let isWindowExists = false;

        //         if (chatWindowsCount > 0) {
        //             for (let i = 0; i < chatWindowsCount; ++i) {
        //                 if (data.groupName === chatWindows[i].name || data.author === chatWindows[i].name) {
        //                     isWindowExists = true;
        //                     if (!chatWindows[i].messages || chatWindows[i].messages.length <= 0) {
        //                         chatWindows[i].messages = [];
        //                     }
        //                     for (let j = 0; j < chatWindows[i].messages.length; j++) {
        //                         let userMsgCondition = (data.groupName === '') ?
        //                             ((chatWindows[i].messages[j].chatId === (userId + "-" + uId)) || (chatWindows[i].messages[j].chatId === (uId + "-" + userId)))
        //                             :
        //                             (chatWindows[i].messages[j].chatId === this.state.groupId)
        //                         if (userMsgCondition) {
        //                             let msgObj = {
        //                                 userName: (data.groupName !== "") ? data.author : data.author,
        //                                 msgText: data.message
        //                             }
        //                             chatWindows[i].messages[j].msgList.push(msgObj);

        //                         }
        //                     } if (chatWindows[i].messages.length === 0) {
        //                         let chatObj = {
        //                             chatId: (data.groupName === "") ? userId + "-" + this.state.toSendMessages : data.toUser + '-' + data.groupName,
        //                             msgList: []
        //                         }
        //                         let msgObj = {
        //                             userName: (data.groupName !== "") ? data.author : fromUserName,
        //                             msgText: data.message
        //                         }
        //                         chatObj.msgList.push(msgObj);
        //                         chatWindows[i].messages.push(chatObj);
        //                     }
        //                     messages = chatWindows[i].messages;
        //                 }
        //             }
        //         }

        //         if (!isWindowExists) {

        //             let messagesToAdd = [];
        //             let chatObj = {
        //                 chatId: (data.groupName === "") ? userId + "-" + uId : data.toUser + '-' + data.groupName,
        //                 msgList: []
        //             }
        //             let msgObj = {
        //                 userName: (data.groupName !== "") ? data.author : data.author,
        //                 msgText: data.message
        //             }
        //             chatObj.msgList.push(msgObj);
        //             messagesToAdd.push(chatObj);

        //             chatWindow = {
        //                 name: (data.groupName !== "") ? data.groupName : data.author,
        //                 id: uId,
        //                 messages: messagesToAdd
        //             }
        //             messages = messagesToAdd;
        //             chatWindows.push(chatWindow);
        //         }
        //     } else {
        //         //let chatWindow = null,
        //         let chatWindowsCount = chatWindows.length;
        //         //let isWindowExists = false;
        //         if (chatWindowsCount > 0) {
        //             let fromUser = this.state.users && this.state.users.filter((u) => {
        //                 return u._id === data.toUser
        //             })
        //             let fromUserName = fromUser.length > 0 ? fromUser[0].name : '';
        //             for (let i = 0; i < chatWindowsCount; ++i) {
        //                 if (data.groupName === chatWindows[i].name || fromUserName === chatWindows[i].name) {
        //                     //isWindowExists = true;

        //                     if (!chatWindows[i].messages || chatWindows[i].messages.length <= 0) {
        //                         chatWindows[i].messages = [];
        //                     }
        //                     for (let j = 0; j < chatWindows[i].messages.length; j++) {
        //                         let userMsgCondition = (data.groupName === '') ?
        //                             ((chatWindows[i].messages[j].chatId === (userId + "-" + data.toUser)) || (chatWindows[i].messages[j].chatId === (data.toUser + "-" + userId)))
        //                             : (chatWindows[i].messages[j].chatId === this.state.groupId)
        //                         if (userMsgCondition) {
        //                             let msgObj = {
        //                                 userName: (data.groupName !== "") ? data.author : data.author,
        //                                 msgText: data.message
        //                             }
        //                             chatWindows[i].messages[j].msgList.push(msgObj);

        //                         }
        //                     } if (chatWindows[i].messages.length === 0) {
        //                         let chatObj = {
        //                             chatId: (data.groupName === "") ? userId + "-" + this.state.toSendMessages : data.toUser + '-' + data.groupName,
        //                             msgList: []
        //                         }
        //                         let msgObj = {
        //                             userName: (data.groupName !== "") ? data.author : data.author,
        //                             msgText: data.message
        //                         }
        //                         chatObj.msgList.push(msgObj);
        //                         chatWindows[i].messages.push(chatObj);
        //                     }
        //                     messages = chatWindows[i].messages;
        //                 }
        //             }
        //         }
        //     }
        //     // else{
        //     //     console.log("Thrid User");
        //     // }
        //     this.props.context.actions.updateState("chatWindows", chatWindows)
        //     this.setState({
        //         messages: messages,
        //         chatWindows: chatWindows
        //     });
        // };

        this.socket.on("active", (users) => {
            let userNameArray = []
            for (let i = 0; i < this.state.users.length; i++) {
                for (let j = 0; j < users.length; j++) {
                    if (this.state.users[i]._id.toString() === users[j]) {
                        userNameArray.push(this.state.users[i].name)
                    }
                }
            }

            this.setState({
                activeUsers: userNameArray,
            })
        })

    }

    componentWillUnmount(){
        this.socket.emit('chatDisconnect');
    }

    handleChange(e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({
            [name]: value,

        })
    }


    componentWillReceiveProps(nextProps) {
        this.setState({
            users: nextProps.context.state.users,
            user: nextProps.context.state.user,
            activeUsers:nextProps.context.state.activeUsers,
            chatWindows:nextProps.context.state.chatWindows,
        })
    }
   
    async componentDidMount() {
        if (this.state.users.length === 0) {
            await this.props.context.actions.setUsers();
        }
        if(this.state.activeUsers.length===0){
          this.activeUsers();
        }
    
        this.showGroup();
    }

    activeUsers() {

        let userId = Auth.get('userId');
        this.socket.emit('new user', userId)
        this.socket.on('userId', (userId) => {
            //console.log("users Acive", userId)
        })

        this.socket.on("showUsers", (users) => {

            let userNameArray = []
            for (let i = 0; i < this.state.users.length; i++) {
                for (let j = 0; j < users.length; j++) {
                    if (this.state.users[i]._id.toString() === users[j]) {
                        userNameArray.push(this.state.users[i].name)
                    }
                }
            }
            this.props.context.actions.updateState("activeUsers", userNameArray);
            this.setState({
                activeUsers: userNameArray
            })
        })

    }


    saveMessages(message) {

        let groupname;
        if (this.state.group.groupName) {

            groupname = this.state.group.groupName
        } else {
            groupname = ''
        }
        this.socket.emit('SEND_MESSAGE', {
            author: Auth.get('userName'),
            message: message,
            toUser: this.state.toSendMessages,
            groupName: groupname
        });
        // let msgSend={
        //     author: Auth.get('userName'),
        //     message: message,
        //     toUser: this.state.toSendMessages,
        //     groupName: groupname
           
        // }
    }

    createGroup(groupInfo) {
        let groupName = groupInfo;
        this.socket.emit("create Group", groupName);
        this.showGroup();

    }
    showGroup() {
        this.socket.on("showGroups", (groups) => {
            this.setState({
                groupsData: groups,
                showCreateForm: false
            })

        })
    }



    async createPrivatechat(userName) {
        this.socket.emit("join Group", this.state.groupLinkId);
        let users = this.state.users && this.state.users.filter((u) => {
            return u.name === userName
        })

        let roomId = (users.length > 0) ? users[0]._id : this.state.groupLinkId;
        let groupName = (users.length > 0) ? '' : userName
        //let chatRoom = userName;
        let chatWindows = Object.assign([], this.state.chatWindows);
        let chatWindow = null,
            chatWindowsCount = chatWindows.length;
        let isWindowExists = false;
        if (chatWindowsCount > 0) {
            for (let i = 0; i < chatWindowsCount; ++i) {
                if (userName === chatWindows[i].name) {
                    isWindowExists = true;
                    this.setState({
                        messages: chatWindows[i].messages,

                    })

                }
            }
        }
        if (!isWindowExists) {
            chatWindow = {
                name: userName,
                id: roomId,
                messages: []
            }
            chatWindows.push(chatWindow);
        }
        await this.props.context.actions.updateState("dataMessage", {})
        this.props.context.actions.updateState("chatWindows", chatWindows); 
        let id = this.state.groupLinkId + '-' + userName
        this.setState({
            privateUserChat: true,
            toSendMessages: roomId,
            group: {
                ...this.state.group,
                groupName: groupName
            },
            groupId: id,
            chatWindows: chatWindows,
            windowName: userName,
            msg:{}
        })
        this.socket.emit("joinRoom", roomId);

    }

    async createGroupchat(groupId, groupname) {
        this.socket.emit("join Group", groupId);
        //let chatRoom = groupname;
        let chatWindows = Object.assign([], this.state.chatWindows);
        let chatWindow = null,
            chatWindowsCount = chatWindows.length;
        let isWindowExists = false;
        let id = groupId + '-' + groupname
        //console.log('id ingroup', id)
        if (chatWindowsCount > 0) {
            for (let i = 0; i < chatWindowsCount; ++i) {
                if (groupname === chatWindows[i].name) {
                    isWindowExists = true;
                }
            }
        }
        if (!isWindowExists) {
            chatWindow = {
                name: groupname,
                id: id,
                messages: []
            }
            chatWindows.push(chatWindow);
            this.setState({
                messages: []
            })

        }
        await this.props.context.actions.updateState("dataMessage", {})
        this.props.context.actions.updateState("chatWindows", chatWindows); 
       // console.log("this.props.context in private function",this.props.context.state)

        this.setState({
            groupUserChat: true,
            privateUserChat: false,
            toSendMessages: groupId,
            groupId: id,
            groupLinkId: groupId,

            group: {
                ...this.state.group,
                groupName: groupname
            },
            chatWindows: chatWindows,
            // messages: []
        })
    }

    showCreateForm() {
      
        this.setState({
            showCreateForm: true,

        })
    }
    onCancel() {
        this.setState({
            showCreateForm: false,

        })
    }

    closeWindow() {
        this.setState({
            privateUserChat: false,
            groupUserChat: false,
            group: {
                ...this.state.group,
                groupName: ''
            }

        })
    }

    render() {
    //    console.log("chatWindows", this.state.chatWindows);
      // console.log("context state", this.props.context.state);
        let userfilter = this.state.activeUsers && this.state.activeUsers.filter((u) => {
            return u !== Auth.get('userName');
        })
     
        //let incomingMesage=this.state.users && this.state.users.filter((user)=>{
        //     return user._id === this.state.msg.toUser;

        // })
      //  let incomingMesageuserName=(incomingMesage.length>0) ?incomingMesage[0].name:''

        return (<div className="container bg-white">
            <div className='row ' style={{padding: '5px 10px 1px 10px'}} >
                <div className="col-12  col-sm-12 col-md-6 col-lg-3 pl-0 sidebar" >
                    <div className="card-header create-group pt-0 pb-0">
                        <p className="user-cursor line-height mb-0"  onClick={
                            this.showCreateForm
                        } > <i className="fas fa-user-plus"></i> Create Group </p> {
                            this.state.showCreateForm === true ?
                                <GroupChatForm createGroup={
                                    this.createGroup
                                }
                                    users={
                                        this.state.users
                                    }
                                    group={
                                        this.state.group
                                    }
                                    user={
                                        this.state.user
                                    }
                                    onCancel={this.onCancel}
                                />

                                :
                                ''
                        } </div>



                    <div className="row border-bottom mb-3 pt-2 pl-3">
                        <div className="col-sm-12">
                            <h6 className="font-weight-bold"><i className="fa fa-user"></i> Users </h6>


                            {userfilter.length === 0 ? <label className='label-text'>No Online User</label> :
                                <ul className="list-unstyled"> {
                                    userfilter && userfilter.map((user, i) => (<li className="user-cursor" key={
                                        i
                                    }
                                        type='none' > < span className='online' > </span>
                                        <span className={(this.state.msg.author === user && this.state.msg.toUser === Auth.get("userId"))?"user-highlight blinking":""} onClick={this.createPrivatechat.bind(this, user)}>{user}</span >
                                        {/* className={(this.state.msg.author === user || this.state.msg.toUser ===Auth.get("userId"))?"user-highlight":""} */}
                                    </li>
                                    ))
                                } </ul>}


                        </div>
                    </div>
                    <div className='row border-bottom mt-3 mb-3 pl-3'>
                        <div className="col-sm-12">
                            <h6 className="font-weight-bold"><i className="fa fa-users"></i> Groups </h6>
                            {this.state.groupsData.length === 0 ? <label className='label-text'>No Group</label> :
                                <ul className="list-unstyled">

                                    {
                                        this.state.groupsData && this.state.groupsData.map((group, i) => {
                                            for (let i = 0; i < group.groupMembers.length; i++) {
                                                if (group.groupMembers[i] === Auth.get('userId')) {
                                                    return (
                                                        <li className="user-cursor" key={
                                                            group.groupName
                                                        }
                                                            type='none' > 
                                                            <span className={(this.state.msg.groupName === group.groupName)?"user-highlight blinking":""} onClick={
                                                                this.createGroupchat.bind(this, group.createdBy, group.groupName)
                                                            } > {
                                                                    group.groupName
                                                                } </span>

                                                        </li>)
                                                }
                                            }
                                            return true;
                                        }
                                        )
                                    }
                                </ul>
                            }

                        </div>
                    </div>
                    <div className='row mt-3 mb-3 pl-3'>
                        <div className="col-sm-12">
                            <h6 className="font-weight-bold"><i className="fa fa-comment-alt"></i> Chats </h6>
                            {this.state.chatWindows.length === 0 ? <label className='label-text'>No Chats</label> :
                            
                                <ul className="list-unstyled"> {
                                   

                                    this.state.chatWindows.map((win, i) =>
                                        (<li className="user-cursor" key={
                                            win.name
                                        }
                                            type='none' > < span onClick={
                                                this.createPrivatechat.bind(this, win.name)
                                            } > {
                                                    win.name
                                                } </span>

                                        </li>
                                        )

                                    )
                                } </ul>
                            }
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-12 col-md-6 col-lg-9" style={{border: '1px solid lightblue'}} > {
                    this.state.privateUserChat === true || this.state.groupUserChat === true ?
                        <div className='row pt-2 pb-2 user-chat-header' >
                            < div className='col-9 col-sm-9 col-md-9 col-lg-10' ><h6 className="font-weight-bold"> {
                                this.state.privateUserChat ? this.state.windowName : this.state.group.groupName
                            }</h6> 
                            </div>
                            <div className="col-2 col-sm-2  col-md-2  col-lg-2" >
                                < span onClick={
                                    this.closeWindow
                                }
                                className="float-right mr-1" >
                                    <i className="fas fa-times close" > </i> </span >
                            </div>
                        </div > : ''
                }

                    {
                        this.state.privateUserChat === true || this.state.groupUserChat === true ? (<
                            React.Fragment >
                            <ChatMessageList messages={this.state.messages} toSendMessages={this.state.toSendMessages}
                                users={this.state.users} groupId={this.state.groupId} />

                            <ChatMessageForm saveMessages={
                                this.saveMessages
                            } /> </React.Fragment >
                        ) :
                            ''
                    }

                </div>
           
            </div>

           
        </div>

        )
    }
}