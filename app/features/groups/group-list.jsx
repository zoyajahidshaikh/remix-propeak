import React from 'react';
import './group.css';
import * as validate from '../../common/validate-entitlements';

const GroupList = React.memo((props) => {
	// const GroupList = (props) => {
	// console.log("Grouplist rendered", props);
	let editUserGroup = validate.validateAppLevelEntitlements(props.appLevelAccess, 'User Groups', 'Edit');
	let deleteUserGroup = validate.validateAppLevelEntitlements(props.appLevelAccess, 'User Groups', 'Delete');

	var groupView = props.groups.map((group, index) => {

		return (
			<li className="list-group-item d-flex justify-content-between align-items-center" key={group._id}>
				<div>
					{group.groupName}
				</div>
				<span>
					{editUserGroup ? <span className="btn btn-xs btn-outline-info" title="Edit Group" onClick={props.editGroupWindow.bind(this, group._id, group)}>
						<i className="fas fa-pencil-alt"></i>
					</span> : ""} &nbsp;
					{deleteUserGroup ? <span className="btn btn-xs btn-outline-danger" title="Delete Group" onClick={props.onDelete.bind(this, group._id)}>
						<i className="far fa-trash-alt"></i>
					</span> : ""}
				</span>
			</li>
		)
	});

	return (
		
			<ul className="list-group list-group-flush">
				{groupView}
			</ul>

	);
});

export default GroupList;


