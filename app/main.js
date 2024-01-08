import React, { Component } from 'react';
import axios from 'axios';
import App from './App';
import {serviceHost} from './common/const';
//import Login from './Components/Login';

export class Main extends Component {
  constructor(props){
    super(props);

    this.onLogin = this.onLogin.bind(this);
  }

  state = {
    login: false,
    message: '',
    user: {}
  }

  onLogin(){
    const emailRef = this.refs.email;
    const passwordRef = this.refs.password;
    if (emailRef.value && passwordRef.value) {
      var user = {
        email: emailRef.value,
        password: passwordRef.value
      }
      axios({
        method: 'post',
        responseType: 'json',
        url: serviceHost+'/login/login',
        data: user
      })
      .then((response) => {
        message: 'success';
        if (response.data.err) {
          this.setState({
            login: false,
            message: response.data.err,
            user: {}
          });
        }
        else {
          this.setState({
            login: true,
            user: response.data.user
          });
        }
      })
      .catch((err) => {
        if (err.response) {
          this.setState({
            login: false,
            message: err.response,
            user: {}
          });
        }
      });
    }
  };

  render() {
    return (
      <div>
        {!this.state.login ?
          <div>
            <h4>User Login</h4>
            <input placeholder="email@email.com" ref="email" />
            <input placeholder="password" ref="password" type="password" />
            <button onClick={this.onLogin}>Login</button>
            <div>{this.state.message}</div>
          </div>
          : <App />}
      </div>
    );
  }
}

export default Main;