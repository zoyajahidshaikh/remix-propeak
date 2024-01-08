import React from 'react';
import Auth from '../../utils/auth';
import * as messageservice from '../../Services/message/message-service';
import * as ObjectId from '../../utils/mongo-objectid';

export default class MessageForm extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.addNewMessage = this.addNewMessage.bind(this);
	}

	state = {
		message: '',
		title: ''
	}

	async addNewMessage() {
		if (this.state.title.trim() === '')
			return;

		var newMsg = {
			_id: ObjectId.mongoObjectId(),
			projectId: this.props.projectId,
			taskId: this.props.taskId,
			title: this.state.title,
			createdBy: Auth.get('userId'),
			createdOn: new Date(),
			isDeleted: false
		}
		let { messages, messagesErr } = await messageservice.addMessage(newMsg);
		if (messagesErr) {
			this.setState({
				message: 'Error : ' + messagesErr,
			});
		} else if (messages && messages.data.err) {
			this.setState({
				message: 'Error : ' + messages.data.err,
			});
		}
		else {

			this.setState({
				title: '',
			});
			if (this.props.taskId) {
				this.props.addTaskMsg(newMsg);
			}
			else {
				this.props.addMsg(newMsg);
			}

		}
	}

	handleChange(e) {
		let name = e.target.name;
		let val = e.target.value;
		this.setState({
			[name]: val
		})

	}

	render() {

		return (
			<React.Fragment>
				<div className="col-sm-12 mt-3 mr-2">

					<div className="input-group">

						<textarea rows="3" className="form-control rounded" placeholder="Enter your message" name='title' value={this.state.title}
							onChange={this.handleChange} />

						<div className="input-group-prepend">
							<a className="input-group-text" onClick={this.addNewMessage}>Send</a>
						</div>
					</div>

				</div>

			</React.Fragment>
		)
	}
}