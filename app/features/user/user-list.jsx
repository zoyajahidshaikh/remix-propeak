import React from 'react';
import { Link } from 'react-router-dom';
import './user.css';
import * as validate from '../../common/validate-entitlements';

const UserList = React.memo((props) => {
    // const UserList = (props) => {
    // console.log("userlist rendered");
    let users = props.users;
    var userList = Object.keys(users).map((index) => {
        let user = users[index];

        let editUser = validate.validateAppLevelEntitlements(props.appLevelAccess, 'Users', 'Edit');
        let deleteUser = validate.validateAppLevelEntitlements(props.appLevelAccess, 'Users', 'Delete');

        return (
          <React.Fragment>

<li className="list-group-item d-flex justify-content-between align-items-center"  key={user._id}>
                   
                    <Link  to={'/userPerformanceReports/' + user._id} className="links">
                        <i className="fas fa-user" style={{ fontSize: '15px' }}></i> &nbsp;
                        
                            {user.name}  <small >&nbsp;({user.role.charAt(0).toUpperCase() + user.role.slice(1)})</small>
                       
                    </Link>

                   
          
         

                    <span>

            {editUser ? <span className="btn btn-xs btn-outline-info " title="Edit User" onClick={props.editUserWindow.bind(this, user._id, user)}>
                <i className="fas fa-pencil-alt"></i>
                </span> : ""}
                   &nbsp;
                            {deleteUser ? 
                            <span className="btn btn-xs  btn-outline-danger"  title="Delete User" onClick={props.onDeleteUser.bind(this, user._id)}>
                                    <i className="far fa-trash-alt"></i>
                               </span> : ""} 
                               </span>
                               </li>
                   
                    </React.Fragment>
        );
    });

    return (
        <div>
            <ul className="list-group list-group-flush">
                {userList}
            </ul>
        </div>
    );
});

export default UserList;
