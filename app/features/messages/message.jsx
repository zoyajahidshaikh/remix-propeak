import React from 'react';
import moment from 'moment';
import Auth from '../../utils/auth';
import './message.css';
export default class Message extends React.Component {

	render() {
		
		const { message, createdBy } = this.props;
		let userName = Auth.get("userName");
		let userRole = Auth.get("userRole");
		let allowMessageDelete = true;
		if(userRole === 'user' && userName !== createdBy){
			allowMessageDelete = false;
		}

		let createdOn = moment(message.createdOn).fromNow();
		let formattedMessageTitle = (message.title && message.title.length > 0) ? message.title.split("\n").map((m, index) => <p key={message._id + "_" + index + "_" + m.length}>{m}</p>) : "";
		return (
			<React.Fragment>
			

				{/* <div className="container"> */}
					<div className="row">

						<div className="comments-container">

							<ul id="comments-list" className="comments-list pl-3">
								<li>
									<div className="comment-main-level">

										<div className="comment-avatar"><i className="fa fa-user"></i></div>

										<div className="comment-box">
											<div className="comment-head">
												<h6 className="comment-name by-author"><a href="#">{createdBy}</a></h6>
												<span>{createdOn}</span>
												{/* <i className="fa fa-reply"></i> */}
												<i class="fa fa-trash text-danger" title="Delete Message" onClick={this.props.deleteMessage.bind(this, message._id, allowMessageDelete)}></i>
											
											</div>
											<div class="comment-content">
												{formattedMessageTitle}
						</div>
										</div>
									</div>

								</li>


							</ul>
						</div>
					</div>
				{/* </div> */}

	
				</React.Fragment>
		)
	}
}

