
import Auth from '../utils/auth';
export const addMessage = (data,that) => {

    let userName = Auth.get('userName');
    let userId = Auth.get('userId');
    let chatWindows = Object.assign([], that.state.chatWindows);
    let messages = Object.assign([], that.state.messages);
    let fromUser = that.state.users && that.state.users.filter((u) => {
        return u._id === data.toUser

    })
    let fromUserName = fromUser.length > 0 ? fromUser[0].name : '';
    let id = that.state.users && that.state.users.filter((u) => {
        return u.name === data.author

    })
    let uId = id.length > 0 ? id[0]._id : '';
    let userCondition = (data.groupName === '') ? userName !== data.author && userId === data.toUser : userName !== data.author

    if (userCondition) {
        let chatWindow = null,
            chatWindowsCount = chatWindows.length;
        let isWindowExists = false;

        if (chatWindowsCount > 0) {
            for (let i = 0; i < chatWindowsCount; ++i) {
                if (data.groupName === chatWindows[i].name || data.author === chatWindows[i].name) {
                    isWindowExists = true;
                    if (!chatWindows[i].messages || chatWindows[i].messages.length <= 0) {
                        chatWindows[i].messages = [];
                    }
                    for (let j = 0; j < chatWindows[i].messages.length; j++) {
                        let userMsgCondition = (data.groupName === '') ?
                            ((chatWindows[i].messages[j].chatId === (userId + "-" + uId)) || (chatWindows[i].messages[j].chatId === (uId + "-" + userId)))
                            :
                            (chatWindows[i].messages[j].chatId === that.state.groupId)
                        if (userMsgCondition) {
                            let msgObj = {
                                userName: (data.groupName !== "") ? data.author : data.author,
                                msgText: data.message
                            }
                            chatWindows[i].messages[j].msgList.push(msgObj);

                        }
                    } if (chatWindows[i].messages.length === 0) {
                        let chatObj = {
                            chatId: (data.groupName === "") ? userId + "-" + that.state.toSendMessages : data.toUser + '-' + data.groupName,
                            msgList: []
                        }
                        let msgObj = {
                            userName: (data.groupName !== "") ? data.author : fromUserName,
                            msgText: data.message
                        }
                        chatObj.msgList.push(msgObj);
                        chatWindows[i].messages.push(chatObj);
                    }
                    messages = chatWindows[i].messages;
                }
            }
        }

        if (!isWindowExists) {

            let messagesToAdd = [];
            let chatObj = {
                chatId: (data.groupName === "") ? userId + "-" + uId : data.toUser + '-' + data.groupName,
                msgList: []
            }
            let msgObj = {
                userName: (data.groupName !== "") ? data.author : data.author,
                msgText: data.message
            }
            chatObj.msgList.push(msgObj);
            messagesToAdd.push(chatObj);

            chatWindow = {
                name: (data.groupName !== "") ? data.groupName : data.author,
                id: uId,
                messages: messagesToAdd
            }
            messages = messagesToAdd;
            chatWindows.push(chatWindow);
        }
    } else {
        //let chatWindow = null,
        let chatWindowsCount = chatWindows.length;
        //let isWindowExists = false;
        if (chatWindowsCount > 0) {
            let fromUser = that.state.users && that.state.users.filter((u) => {
                return u._id === data.toUser
            })
            let fromUserName = fromUser.length > 0 ? fromUser[0].name : '';
            for (let i = 0; i < chatWindowsCount; ++i) {
                if (data.groupName === chatWindows[i].name || fromUserName === chatWindows[i].name) {
                    //isWindowExists = true;

                    if (!chatWindows[i].messages || chatWindows[i].messages.length <= 0) {
                        chatWindows[i].messages = [];
                    }
                    for (let j = 0; j < chatWindows[i].messages.length; j++) {
                        let userMsgCondition = (data.groupName === '') ?
                            ((chatWindows[i].messages[j].chatId === (userId + "-" + data.toUser)) || (chatWindows[i].messages[j].chatId === (data.toUser + "-" + userId)))
                            : (chatWindows[i].messages[j].chatId === that.state.groupId)
                        if (userMsgCondition) {
                            let msgObj = {
                                userName: (data.groupName !== "") ? data.author : data.author,
                                msgText: data.message
                            }
                            chatWindows[i].messages[j].msgList.push(msgObj);

                        }
                    } if (chatWindows[i].messages.length === 0) {
                        let chatObj = {
                            chatId: (data.groupName === "") ? userId + "-" + that.state.toSendMessages : data.toUser + '-' + data.groupName,
                            msgList: []
                        }
                        let msgObj = {
                            userName: (data.groupName !== "") ? data.author : data.author,
                            msgText: data.message
                        }
                        chatObj.msgList.push(msgObj);
                        chatWindows[i].messages.push(chatObj);
                    }
                    messages = chatWindows[i].messages;
                }
            }
        }
    }
    // else{
    //     console.log("Thrid User");
    // }
    that.props.context.actions.updateState("chatWindows", chatWindows)
    that.setState({
        messages: messages,
        chatWindows: chatWindows
    });
};
