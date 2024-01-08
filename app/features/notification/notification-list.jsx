import React from 'react';
import './notification.css';
import { Link } from 'react-router-dom';
// import Auth from '../../utils/auth';

const NotificationList = React.memo((props) => {
	var notificationView = props.notifications.map((notification, index) => {
		return (
			<li className="list-group-item d-flex justify-content-between align-items-center" key={notification._id}>
				{notification.notification}
				<span>
					{props.editNotification ? <span  className=" " title="Edit Notification" >
						<Link to={'/notification/edit/notification/' + notification._id + '/' + props.projectId} className="btn btn-xs btn-outline-info">
							<i className="fas fa-pencil-alt"></i></Link>
					</span> : ""}
					&nbsp;
							{props.deleteNotification ? <span className="btn btn-xs btn-outline-danger" title="Delete Notification"
						onClick={

							props.onDelete.bind(this, notification._id)
						}>
						<i className="far fa-trash-alt"></i>
					</span> : ""}

				</span>
			</li>
		)
	});

	return (
			<ul className="list-group list-group-flush">
				{notificationView}
			</ul>
	);

});

export default NotificationList;


