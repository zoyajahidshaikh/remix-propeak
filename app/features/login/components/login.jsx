import React, { Component } from 'react';
import axios from 'axios';
import Auth from '../../../utils/auth';
import { ACCESS_TOKEN } from '../../../common/const';
import './reset-password.css';
import ResetPassword from './reset-forgot-password';
import * as userservice from '../services/login-service';
import config from '../../../common/config';
import { Link } from 'react-router-dom';
import Recaptcha from 'react-recaptcha';

// let recaptchaInstance;

export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: Auth.get('userId') ? true : false,
      message: '',
      messageModal: '',
      user: {},
      showForgotPassword: false,
      email: '',
      useremail: '',
      domain: '',
      isVerified: false
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.checkKey = this.checkKey.bind(this);
    this.forgotPasswordRequestOnSubmit = this.forgotPasswordRequestOnSubmit.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onkeyEnter = this.onkeyEnter.bind(this);
    this.recaptchaLoaded = this.recaptchaLoaded.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);

  }

  handleInputChange(e) {
    const target = e.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value,
      message: ""
    });
  }


  onkeyEnter(e) {
    if (e.which === 13) {
      this.forgotPasswordRequestOnSubmit();
    }

  }

  async forgotPasswordRequestOnSubmit() {
    let email = this.state.useremail;

    let { response, err } = await userservice.forgotPassword(email);
    if (err) {
      this.setState({
        messageModal: err
      });
    }
    else if (response && response.data.err) {
      this.setState({
        messageModal: response.data.err,
      });
    }
    else {

      this.setState({
        messageModal: response.data.msg,
        useremail: ''
      })
    }

  }

  checkKey(e) {

    if (e.which === 13) {
      this.onLogin();
    }
  }

  async onLogin() {
    //console.log("this.state.isVerified", this.state.isVerified);
    if (!this.state.isVerified) {

      // alert("Please verify that you are a human");
      this.setState({
        message: "Please verify that you are a human"
      })
    } else {
      const emailRef = this.refs.email.value.trim().toLowerCase();
      const passwordRef = this.refs.password;
      let captcha = document.querySelector('#g-recaptcha-response').value;
      if (emailRef && passwordRef.value) {
        var user = {
          email: emailRef,
          password: passwordRef.value,
          captcha: captcha
        }
        let { response, err } = await userservice.login(user);
        if (err) {
          this.recaptchaInstance.reset();

          this.setState({
            login: false,
            message: err,
            labelvalue: err,
            user: {},
            isVerified: false
          });
        }
        else if (response && response.data.err) {
          this.recaptchaInstance.reset();

          this.setState({
            login: false,
            message: response.data.err,
            user: {},
            isVerified: false
          });
        }
        else if (response && response.data) {

          Auth.set('userId', response.data.user._id);
          Auth.set('userRole', response.data.user.role);
          Auth.set('userName', response.data.user.name);
          Auth.set('access', response.data.user.access);
          Auth.set('profilePicture', response.data.user.profilePicture)

          this.setState({
            login: true,
            message: 'Login Successful!',
            user: response.data.user
          });

          this.redirectUser();
        }
      }
    }
  }

  redirectUser() {
    if (this.props.location.state === undefined) {
      this.props.history.push('/');
    } else {
      this.props.history.push(this.props.location.state.from);
    }

  }

  setAxiosAuthHeader(token) {
    if (token) {

      axios.defaults.headers.common[ACCESS_TOKEN] = token;
    } else {
      axios.defaults.headers.common[ACCESS_TOKEN] = null;
    }
  }

  recaptchaLoaded() {
    // console.log("Captcha has loaded");
  }

  verifyCallback(response) {
    // console.log("response", response);
    if (response) {
      this.setState({
        isVerified: true,
        message: ""
      })
    }
  }


  render() {
    let domainArray = [];
    window.propeakConfigData.domain.forEach(function (domain, i) {
      domainArray.push(
        <option value={domain} key={domain}>{domain}</option>)
    })

    return (
      <React.Fragment>
        <div className="container-fluid justify-content-center align-items-center" id="loginpage">
          <div className="row" >
            <div className="col-sm-5 offset-sm-1 logo-container" >
              <div className="logo-wrapper d-flex flex-column justify-content-center ">
                <img src="/images/proPeakNewLogo.svg" alt="proPeak PMS" />

              </div>
            </div>

            <div className="col-sm-5 d-flex flex-column justify-content-center" >

              <div className='loginWrapper justify-content-center align-items-center'>


                <div className="loginBox  justify-content-center align-items-center" >

                  <h4 className='login-title'>LOGIN</h4>
                  <hr />
                  {this.state.message ?
                    <span className="login-alert alert-danger">{this.state.message}</span>
                    : ''}


                  <form action="" id="loginForm">
                    <div className="form-group ">
                      <label>Username</label>
                      <div className='row'>
                        <div className="col-sm-12">

                          <input type="text" className=" form-control username" placeholder="email" ref="email" onKeyPress={this.checkKey} />

                        </div>

                      </div>
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input className="form-control password text-muted" placeholder="password" ref="password" type="password" onKeyPress={this.checkKey} />
                    </div>
                    <div className="form-group">
                      {/* <div className="g-recaptcha" data-sitekey={config.sitekey} id="a"></div> */}
                      <Recaptcha
                        sitekey={config.sitekey}
                        render="explicit"
                        onloadCallback={this.recaptchaLoaded}
                        verifyCallback={this.verifyCallback}
                        ref={e => this.recaptchaInstance = e}
                      />
                    </div>
                    <div className='form-group'>
                      <div className='row'>
                        <div className='col-sm-12'>
                          <button type="button" onClick={this.onLogin} className="btn btn-primary btn-block">Login</button>
                        </div>
                        <div className='col-sm-12 reset-link'>
                          <small className='text-muted'>Forgot Password? <Link to={'/resetPassword'} className="links" style={{
                            lineHeight: "1.3em", color: 'rgb(255, 152, 0)',
                            fontSize: '15px'
                          }}>
                            Click here
                                </Link></small>
                        </div>
                      </div>
                    </div>
                  </form>

                </div>

              </div>






            </div>
          </div>


        </div>
      </React.Fragment>

    );
  }
}

export default Login;