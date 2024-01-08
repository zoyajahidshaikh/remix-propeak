import React,{Component} from 'react';
import { Link } from 'react-router-dom';
import '../../app.css';
import config from '../../common/config.jsx';
import Auth from "../../utils/auth.js";

export default class UserMenu extends Component {
    state = {
		profilePicture:this.props.context.state.profilePicture,
		userId: Auth.get("userId"),
	    userMenu: [ 
			{ title: "Change Password", url: "/changePassword", active: false },
			{title: "Profile Picture", url:"/profilePicture", active: false},
			{ title: "Log Out", url: "/logout", active: false }
		]
	};
	componentWillReceiveProps(nextProps){
		this.setState({
			profilePicture:nextProps.context.state.profilePicture})
	}
    render () {
		let UserPicUrl = "";
		if (this.state.profilePicture) {
			UserPicUrl = `${config.profileUrl}${this.state.userId}/${this.state.profilePicture}`;
		  } 
        var links = this.state.userMenu.map((m) => {
            let loc=window.location.pathname;
            
			let isActive=false;
		
            if(m.url!=="/" && loc.indexOf(m.url)>-1){
				isActive=true;
			}
		
			m.active=isActive;
			var activeClass = m.active ? "menu-active" : "";
			
			return (
				<li className="list-group-item"  key={m.title}>
					<Link to={m.url} className={m.url == '/logout' ? 'text-danger mt-2' : '' }>{m.title} </Link>
				</li>
			);
		})

        return (
			<React.Fragment>
				<div className="card userDetails" id="userDetails">

					<div className ="user-triangle-up"></div>

					<div className="mt-2 mb-1 user-avatar">
					{this.state.profilePicture?
                	<img src={UserPicUrl} alt="User Profile" className="user-profile-img" /> :
						<i className="fa fa-user"> </i>}
					</div>
					<div className="username">{this.props.user}</div>
					<div className="dropdown-divider"></div>
					<ul className="list-group list-group-flush">
					
						{links}
					</ul>
				</div>  

			</React.Fragment>
        );
    }
}