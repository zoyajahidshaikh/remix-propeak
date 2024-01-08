import React from 'react';
import MessageForm from './message-form';
import Message from './message';
import * as messageservice from '../../Services/message/message-service';

export default class MessageList extends React.Component {

    state = {
        messages: this.props.messages,
        message: ''
    }

    async deleteMessage(e, mesgId, allowMessageDelete) {
        if(allowMessageDelete) {
            if (window.confirm('Are you sure you want to delete this message?')) {

                let message = this.state.messages && this.state.messages.filter((m) => {
                    return m._id === mesgId;
                })[0];
                let updatedMessage = {
                    _id: message._id,
                    title: message.title,
                    isDeleted: true,
                    createdBy: message.createdBy,
                    createdOn: message.createdOn
                }
                let response = await messageservice.deleteMessage(mesgId, this.props.projectId, this.props.taskId, updatedMessage);
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
                    if (this.props.taskId) {
                        this.props.deleteMessageTask(this.props.taskId, mesgId);
                    } else {
                        this.props.deleteMessageById(mesgId);
                    }
                }
            }
        } else {
            window.alert('You do not have permission to delete this message.');
        }

    }

    componentDidMount() {
        this.setState({
            messages: this.props.messages
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            messages: nextProps.messages
        });
    }

    render() {
        var messagelist = this.state.messages && this.state.messages.map((message) => {

            let username = this.props.user && this.props.user[message.createdBy];

            return (<Message message={message} key={message._id} createdBy={username} deleteMessage={this.deleteMessage.bind(this, message._id)} />);
        });

        return (
            <div>
                <div className="row message-margin">
                    <MessageForm taskId={this.props.taskId} projectId={this.props.projectId}
                        addMsg={this.props.addMsg} addTaskMsg={this.props.addTaskMsg} />
                </div>
                <div className="row mt-3 pl-3 pr-2" >
                    <div className="col-sm-12" style={{ border: '1px solid #f5f2f2', height: '370px', overflowY: 'auto' }}>
                        {/* <div className="col-sm-12"> */}
                            <div className="mb-3 mt-3">
                                {messagelist}
                            </div>
                        {/* </div> */}
                    </div>
                </div>
            </div>
        )
    }
}