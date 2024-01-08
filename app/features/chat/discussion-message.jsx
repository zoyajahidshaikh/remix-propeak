import React from 'react';
import moment from 'moment';
import ChatForm from './chat-form'; 
export default class DiscussionMessage extends React.Component {
	// constructor(props){
	// 	super(props);
	// }
	state= {
		// isOpen: this.props.isOpen,
		users: this.props.users
	}

	openReplyBox = (messageId) => {
		// this.setState({
		// 	isOpen: true
		// })
		this.props.updateState(true,messageId);
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			users: nextProps.users,
			isOpen: nextProps.isOpen,
			message: nextProps.message
		})
	
	}

	render() {
		const { message, createdBy } = this.props;
		// console.log("message._id",message._id);
		let createdOn = moment(message.createdOn).fromNow();
		message.replyMessages && message.replyMessages.sort((a,b) => (a.createdOn < b.createdOn));
        let filteredReplyMessages = (message.replyMessages && message.replyMessages.length > 0) && message.replyMessages.filter((m) => {
            return m.isDeleted === false;
        })
		let updatedMessageList = filteredReplyMessages && filteredReplyMessages.map((m) => {
			let username = "";
			let users = this.state.users.filter((user) => {
				return user._id === m.createdBy;
			});
	
			username = (users && users.length>0)?users[0].name:'';
			return (
				<DiscussionMessage message={m} key={m._id} createdBy={username} subjectId={this.props.subjectId} users={this.state.users}
				deleteDiscussionMessage={this.props.deleteDiscussionMessage} addReplyMessage={this.props.addReplyMessage}
				updateState={this.props.updateState}/>
			)
		})
		
		return (
			<div className="container-fluid">

				<div className="row">
					<div className="col-sm-10 message">
						<div className="">
							<h5>{message.title}</h5>
						</div>
					</div>
					<span style={{ display: 'inline-block', marginTop: '14px' }}>
						<a className="text-danger"
							onClick={() => { if (window.confirm('Are you sure you wish to delete this message?')) this.props.deleteDiscussionMessage(message._id) }}
							title="Delete Message">
							<small><i className="far fa-trash-alt text-danger"></i></small>
						</a>
					</span>
					<span style={{marginLeft: "10px"}} onClick={() => this.openReplyBox(message._id)}><i className="fas fa-reply"></i></span>
					{/* onClick={() => {this.props.openReplyBox(message._id)}} */}
					</div>
				<div className="row">
					<div className="col-sm-11 message-desc" >
						<div className="col-sm-12" style={{ textAlign: 'right', fontSize: '10px', color: '#716a6a' }}>
							- submitted by {createdBy} {createdOn}
							{/* {new Date(message.createdOn).toLocaleString()} */}
						</div>
					</div>
				</div>
				
				{message.isOpen ? <ChatForm subjectId={this.props.subjectId} messageId={message._id} addReplyMessage={this.props.addReplyMessage}
				updateState={this.props.updateState}/> : ""}
				
				
				<div className="row" >
                    <div className="col-sm-10 message-list" style={{ height: 'auto', overflowY: 'auto' }}>
                        {updatedMessageList}
                    </div>
                </div>
			</div>
		)
	}
}

