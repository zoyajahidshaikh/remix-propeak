import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as resetpassservice from "../services/login-service";
import './reset-password.css';
import Recaptcha from 'react-recaptcha';
import config from '../../../common/config';
import './login.css';

export default class ResetPassword extends Component {
    constructor(props) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.setNewPassword = this.setNewPassword.bind(this);
        this.recaptchaLoaded = this.recaptchaLoaded.bind(this);
        this.verifyCallback = this.verifyCallback.bind(this);

    }

    getToken() {
        let loc = window.location.pathname.split('/');
        let token = loc[loc.length - 1];
        return token;
    }

    state = {
        password: '',
        confirmPassword: '',
        passChanged: false,
        message: '',
        passwordValid: false,
        formErrors: { password: '' },
        token: this.getToken(),
        isVerified: false,
        isDisableField:''
    }

    handleInputChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({

            [name]: value,
            message: ""

        }, this.validateField.bind(this, name, value));
    }


    async setNewPassword() {
        // console.log("this.state.isVerified", this.state.isVerified);
        if (!this.state.isVerified) {

            // alert("Please verify that you are a human");
            this.setState({
                message: "Please verify that you are a human"
            })
        } else {
            var reset = {
                password: this.state.password,
                confirmPassword: this.state.confirmPassword,
                token: this.state.token
            }
            let { response, err } = await resetpassservice.resetPassword(reset);
            if (err) {
                this.setState({
                    message: 'Error: ' + err
                });
            } else {
                if (response.data.err) {
                    // //console.log("response.data.err", response.data.err);
                    this.recaptchaInstance.reset();
                    this.setState({
                        message: response.data.err,
                        isVerified: false
                    });
                } else {
                    // //console.log('login successful');
                    this.setState({
                        passChanged: true,
                        reset: response.data
                    });
                }
            }
            this.recaptchaInstance.reset();
            this.setState({
                password: '',
                confirmPassword: '',
                isDisableField:'ok'
            })
        }
    }

    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;
        let passwordValid = this.state.passwordValid;

        switch (fieldName) {
            case 'password':
                passwordValid = value.length >= 4;
                fieldValidationErrors.password = passwordValid ? '' : ' is too short';
                break;
            default:
                break;
        }
        this.setState({
            formErrors: fieldValidationErrors,
            passwordValid: passwordValid
        }, this.validateForm);
    }

    validateForm() {
        this.setState({ formValid: this.state.passwordValid });
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
        let passChanged = this.state.passChanged;

        return (
            <React.Fragment>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-6 offset-sm-3 text-center">
                            <img src="/images/proPeak.png" alt="proPeak PMS" style={{ width: '200px', display: 'inline-block', textAlign: 'center', marginTop: '30px',marginBottom:'30px'}} />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-6 offset-sm-3">
                        <div className="reset-wrapper reset-box-shadow  justify-content-center align-items-center" >
                               
                                {this.state.message ? <span className="resetpass-alert alert-danger">{this.state.message}</span>:''}
                                <h4 className='login-title'>Reset Password</h4>
                                <hr />
                                <form>
                                    {this.state.isDisableField !== 'ok' ?
                                        <span>
                                            <div className="form-group ">
                                                <label htmlFor="Enter Password">Enter Password</label>

                                                <input className="form-control " type="password" placeholder="Enter Password" name="password"
                                                    value={this.state.password} onChange={this.handleInputChange} />
                                            </div>

                                            <div className="form-group ">
                                                <label htmlFor="Confirm Password">Confirm Password</label>

                                                <input className="form-control " type="password" placeholder="Confirm Password" name="confirmPassword"
                                                    value={this.state.confirmPassword} onChange={this.handleInputChange} />

                                            </div>
                                            <div className="form-group">
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
                                                <input type="button" value="Save" className="btn btn-primary btn-block"
                                                    onClick={this.setNewPassword} />
                                            </div>
                                        </div>
                                    </div>
                                    </span> : ''}
                                    <div className='form-group'></div>
                                    <div className='row'>
                                        <div className='col-sm-12'>

                                            <div className="login">
                                                {passChanged ? <p className="mt-2">Your password has been changed! &nbsp;<Link to={"/"} className="links" style={{
                                                    lineHeight: "1.3em", color: 'rgb(255, 152, 0)',
                                                    fontSize: '15px'
                                                }}>Click here to login yourself.</Link></p> : ''}
                                            </div>
                                        </div>
                                    </div>

                                </form>
                            </div> </div>
                </div>
                </div>
                </React.Fragment>
        )
    }
}