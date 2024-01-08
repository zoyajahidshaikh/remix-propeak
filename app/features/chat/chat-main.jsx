import React,{Component} from 'react';
import ChatForm from './chat-form';
import TaskMenu from '../tasks/task-menu';
import DiscussionMessage from './discussion-message';
import * as chatservice from '../../Services/chat/chat-service';

export default class ChatMain extends Component {
    state = {
        subjectId : this.props.subjectId,
        discussionMessages: [],
        users: this.props.context.state.users,
        subjects: this.props.projectId ? this.props.context.state.projectSubjects : this.props.context.state.subjects,
        subjectTitle: "",
        projectName: this.props.context.state.projectName
        // isOpen: false
    }

   

    getDiscussionMessages = async() => {
        let { response } = await chatservice.getAllDiscussionMessages(this.props.subjectId);
        if (response.err) {
            this.setState({
                message: 'Error : ' + response.err
            });
        } else if (response.messages && response.messages.data.err) {

            this.setState({
                message: 'Error : ' + response.messages.data.err,
            });
        } else {
        // console.log("response.data in pms provider",response.data);
        response.data.sort((a,b) => (a.createdOn < b.createdOn));
            this.setState({
                discussionMessages: response.data,
            })
        }
    }

    deleteMessage=(messages,id)=>{
        // console.log("messages",messages);
        for(let i=0;i<messages.length;++i){

            // console.log("messages[i]._id",messages[i]._id);
            // console.log("id",id);
            if(messages[i]._id.toString()===id)
            {
                messages[i].isDeleted = true;
                //return messages[i];
                break;
            }
            else if(messages[i].replyMessages && messages[i].replyMessages.length > 0)
            {
                let replyMessages = messages[i].replyMessages.filter((r) => {
                    return r.isDeleted === false;
                })
                messages[i].replyMessages = this.deleteMessage(replyMessages,id);
                //return messages[i];
                // break;
            } 
        }
        return messages;
    }

    deleteDiscussionMessage = async(messageId) => {
        // console.log("messageId",messageId);
        let response = await chatservice.deleteDiscussionMessage(messageId, this.props.subjectId);
        if (response.err) {
            this.setState({
                message: 'Error : ' + response.err
            });
        } else if (response.messages && response.messages.data.err) {

            this.setState({
                message: 'Error : ' + response.messages.data.err,
            });
        }
        else {

            let messages = Object.assign([], this.state.discussionMessages);
            let discussionMessages = (messages && messages.length > 0) && messages.filter((r) => {
                return r.isDeleted === false;
            })
            let updatedMessages = this.deleteMessage(discussionMessages,messageId);

            this.setState({
                discussionMessages: updatedMessages
            })
            
        }
    }

    addMessage = (discussionMessages,messageId,newMsg ) => {
        for(let i=0;i<discussionMessages.length;++i){
            if(discussionMessages[i]._id === messageId)
            {
                (discussionMessages[i].replyMessages && discussionMessages[i].replyMessages.length > 0) ? 
                discussionMessages[i].replyMessages.push(newMsg) 
                : 
                (discussionMessages[i].replyMessages=[newMsg]);
                //return messages[i];
                break;
            }
            else if(discussionMessages[i].replyMessages && discussionMessages[i].replyMessages.length > 0)
            {
                let replyMessages = discussionMessages[i].replyMessages.filter((r) => {
                    return r.isDeleted === false;
                })
                discussionMessages[i].replyMessages= this.addMessage(replyMessages,messageId,newMsg);
                //return messages[i];
                // break;
            }
        }
        return discussionMessages;
    }

    addDiscussionMsg = (message) => {
        // console.log("message",message);
        // console.log("message",message);
        this.setState({
            discussionMessages: [message, ...this.state.discussionMessages]
        })  
    }

    addReplyMessage = (message, messageId) => {
        let messages = Object.assign([],this.state.discussionMessages);
            let discussionMessages = (messages && messages.length > 0) && messages.filter((r) => {
                return r.isDeleted === false;
            })
            // message.isOpen = false;
           let addedReplyMessages = this.addMessage(discussionMessages,messageId,message);

        // console.log("addedReplyMessages",addedReplyMessages);
        this.setState({
            discussionMessages: addedReplyMessages
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            users: nextProps.context.state.users,
            subjects: nextProps.context.state.subjects
        })
    }

    getSubjectTitle = () => {
        let subject = this.state.subjects.filter((s) => {
            return s._id === this.props.subjectId;
        })
        let subjectTitle = (subject.length > 0) ? subject[0].title : "";
        this.setState({
            subjectTitle: subjectTitle
        })
    }

    componentDidMount = async() => {
        if(this.state.users.length === 0 ){
            this.props.context.actions.setUsers();
        }
        if(this.state.subjects.length === 0 ){
            await this.props.context.actions.setSubjects();
        }
        this.getDiscussionMessages();
        this.getSubjectTitle();
    }

    setIsOpen = (messages, messageId, state) => {
        for(let i=0;i<messages.length;++i){
            if(messages[i]._id === messageId)
            {
                messages[i].isOpen = state;
                //return messages[i];
                break;
            }
            else if(messages[i].replyMessages && messages[i].replyMessages.length > 0)
            {
                let replyMessages = messages[i].replyMessages.filter((r) => {
                    return r.isDeleted === false;
                })
                messages[i].replyMessages= this.setIsOpen(replyMessages,messageId,state);
                //return messages[i];
                // break;
            }
        }
        return messages;
    }

    updateState = (state,messageId) => {
        let messages = Object.assign([],this.state.discussionMessages)
        let updatedIsOpen = this.setIsOpen(messages,messageId, state);
    
		this.setState({
			discussionMessages: updatedIsOpen
		})
	}

    getMessages = (message) => {
        let username = "";
        let users = this.state.users.filter((user) => {
            return user._id === message.createdBy;
        });

        username = (users && users.length>0)?users[0].name:'';

        return (
            <DiscussionMessage message={message} key={message._id} createdBy={username} subjectId={this.props.subjectId} users ={this.state.users}
                deleteDiscussionMessage={this.deleteDiscussionMessage} addReplyMessage={this.addReplyMessage}  
                updateState={this.updateState}/>
        );
    }

    render () {
        let filteredDiscussionMessages = (this.state.discussionMessages && this.state.discussionMessages.length > 0) && this.state.discussionMessages.filter((m) => {
            return m.isDeleted === false;
        })
        var chatList = (filteredDiscussionMessages.length > 0) && filteredDiscussionMessages.map((message) => {
            let messages = this.getMessages(message);
            return messages;
        });  

        return(
            <div>
                <div className="row" >
                    {this.props.projectId ? <h3 style={{textAlign: "left", textTransform: "capitalize"}}>{this.state.projectName}</h3> : ""}
                </div>
                
                    {this.props.projectId ? <div className="row" ><TaskMenu {...this.props} /></div> : ""}
                
                <div className="row message-margin">
                    <ChatForm subjectId={this.props.subjectId} addDiscussionMsg={this.addDiscussionMsg} subjectTitle={this.state.subjectTitle}/>
                </div> 
                <div className="row" >
                    <div className="col-sm-10 message-list" style={{ height: '420px', overflowY: 'auto' }}>
                        {chatList}
                    </div>
                </div>
            </div>
        )
    }
}