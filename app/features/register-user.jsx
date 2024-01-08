import React, { Component } from 'react';
import { serviceHost } from '../common/const';
// import styles from './RegisterForm.css';

export class RegisterUser extends Component {
  onRegister = () => {
    const emailRef = this.refs.email;
    const passwordRef = this.refs.password;
    const nameRef = this.refs.name;
    if (emailRef.value && passwordRef.value) {
      var payload = {
        email: emailRef.value,
        password: passwordRef.value
      }
      axios({
        method: 'post',
        responseType: 'json',
        url: serviceHost+'/users/register',
        data: payload
      })
        .then((response) => {
          message: 'success'
          // console.log('registered successfully');
          // console.log(response.data);

        })
        .catch((err) => {
          if (err.response) {
            // console.log(err);
            //  this.setState({
            //   message: 'warning : ' + 'Something went wrong. ' + err
            // });
          }
        });
    }
  };

  render() {
    return (
      <div>
        <h2>Register yourself</h2>
        <input placeholder="email@email.com" ref="email" />
        <input placeholder="password" ref="password" type="password" />
        <a onClick={this.onRegister}>Submit</a>
      </div >
    );
  }
}



export default RegisterUser;
