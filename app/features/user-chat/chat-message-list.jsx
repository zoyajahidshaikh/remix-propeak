import React,{Component} from 'react';
import Auth from '../../utils/auth';

export default class chatMessageList extends Component {
    constructor(props) {
        super(props);
        this.state={
            messages: this.props.messages,
            toSendMessages: this.props.toSendMessages,
            users: this.props.users,
            groupId: this.props.groupId
        }     
    }

    componentWillReceiveProps(nextProps){
        this.setState({
            messages: nextProps.messages,
            toSendMessages: nextProps.toSendMessages,
            users: nextProps.users,
            groupId: nextProps.groupId
        })
    }
    render() {
     
        return (
            <div>
                <div className='row'> 
                <div className="col-sm-12">
                   
                        <ul className="chat-message-list">
                                        
                            {(this.state.messages !== null) && this.state.messages.map((m, i) => {
                                let messageList
                               
                                if ((m.chatId === this.state.toSendMessages + "-" + Auth.get('userId')) || (m.chatId === Auth.get('userId') + "-" + this.state.toSendMessages) || m.chatId === this.state.groupId) {
                                    messageList= m.msgList.map((msg,i) => { 
                                    
                            return (<div>
                                    <li key={i} type='none' className={msg.userName=== Auth.get('userName')?'outgoing_msg':'received_msg'}>
                                    <span className={msg.userName=== Auth.get('userName')?'sent_msg':'received_withd_msg'} ><p> <b>{msg.userName}</b>: {msg.msgText}</p>&nbsp;  
                                    </span><span>&nbsp;</span></li>
                           </div>)
                                })
                                }  
                                return messageList
                            })} 
                    </ul>    
                 </div> 
             </div>
            </div>
        )
    }
}
 
