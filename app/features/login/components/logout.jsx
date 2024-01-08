import React, { Component } from 'react';
import Auth from '../../../utils/auth';
import '../../../app.css';
import * as loginservice from '../services/login-service';
import io from "socket.io-client";

// import Login from './login';
export default class Logout extends Component {
	constructor(props) {
        super(props);

     
        this.socket =  io.connect("/",{
            secure:true,
            path:'/chat/socket.io'
        });
		// this.socket = io.connect(window.propeakConfigData.socketPath);
	}
	logout() {

		loginservice.logout();
		//this.socket.emit('disconnect');
		this.socket.emit('forceDisconnect',Auth.get('userId'));
	
		Auth.clearAppStorage();
		// Auth.clear(TOKEN_KEY);
		// Auth.clear(REFRESH_TOKEN);
		// Auth.clear('userId');
		// Auth.clear('userRole');
		// Auth.clear('userName');  
		// Auth.clear('access');

		
		
	
	
	}

	componentDidMount() {
		this.logout();
	}

	render() {
		this.logout();
		return (
			<div className="container-fluid ">
			<div className="row">
				<div className="col-sm-6 offset-sm-3">
					<div className="logo-wrapper d-flex justify-content-center mt-5">
						<img src="/images/proPeakNewLogo.svg" alt="proPeak PMS" style={{ height: "70px" ,marginBottom: "57px" }} />
					</div>
				</div>
			</div>
			<div className="row" >
                        <div className="col-sm-8 offset-sm-2" >
						<div className="reset-wrapper box-shadow  justify-content-center align-items-center" >
								
						<div className="row">
                                    <div className="col-sm-8 offset-sm-2"><h4 style={{textAlign: "center"}}>You have successfully logged out!</h4>
								
								</div> 
								</div>
								
                                <div className="row">
                                    <div className="col-sm-6 offset-sm-3" style={{textAlign:"center"}}>
                                         <small> Click here to &nbsp;</small>
										<a href="/login"  style={{
                                            lineHeight: "1.3em", color: 'rgb(255, 152, 0)',
                                            fontSize: '15px'
                                        }}>Login</a>
                                           
                
                                    </div>
                                    </div>
							</div>
						</div>
					</div>
				</div>
		
		)
	}
}