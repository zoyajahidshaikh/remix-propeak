import React, { Component } from 'react';
import './login.css';
import * as userservice from '../services/login-service';
import { Link } from 'react-router-dom';

let buttonStatus = true;
export class ResetForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            useremail: '',
            messageModal: '',
            emailError: false
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.toggleShowForgotModal = this.toggleShowForgotModal.bind(this);
        this.forgotPasswordRequestOnSubmit = this.forgotPasswordRequestOnSubmit.bind(this);
        this.onkeyEnter = this.onkeyEnter.bind(this);
        this.onShowForgotModal = this.onShowForgotModal.bind(this);
        this.toggleShowForgotModal = this.toggleShowForgotModal.bind(this);

    }

    onkeyEnter(e) {
        if (e.which === 13) {
            this.forgotPasswordRequestOnSubmit();
        }
    }

    handleInputChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;
        buttonStatus = false;
        this.setState({
            [name]: value,
            messageModal: '',
            emailError: false
        });
    }

    async forgotPasswordRequestOnSubmit() {
        let email = this.state.useremail;

        if (this.validateEmail(email)) {

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
        else {
            email = 'Please enter a valid email address!'
            this.setState({
                emailError: true
            })
        }

    }

    onShowForgotModal() {
        this.toggleShowForgotModal();
    }

    toggleShowForgotModal() {
        this.setState({
            showForgotPassword: !this.state.showForgotPassword,

            messageModal: ''
        });
    }

    validateEmail(value) {
        let emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);

        return emailValid;
    }

    render() {
        return (
            <React.Fragment>
                <div className="container-fluid ">
                    <div className="row">
                        <div className="col-sm-6 offset-sm-3">
                            <div className="logo-wrapper d-flex justify-content-center mt-5">
                                <img src="/images/proPeakNewLogo.svg" alt="proPeak PMS" style={{ width: '450px' }} />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-8 offset-sm-2" >


                                <div className="reset-wrapper box-shadow  justify-content-center align-items-center" >
                                    {this.state.messageModal ?
                                        <span className="alertposition  reset-alert alert-danger text-center">
                                                {this.state.messageModal}     
                                        </span>
                                        : ""}

                                    {this.state.emailError ?
                                       <span className="alertposition  reset-alert alert-danger text-center" style={{height: '50px'}}>Please enter correct format(email@email.com)</span>
                                       : ""
                                    }
                                    <h4 className='login-title'>Forgot Password</h4>
                                    <hr />

                                    <div className="row">
                                        <div className="col-sm-12 ">
                                            <input className="form-control" type="email" onChange={this.handleInputChange} ref="useremail" value={this.state.useremail}
                                                name="useremail" placeholder="Enter your registered email id" onKeyPress={this.onkeyEnter} />
                                        </div>
                                    </div>
                                    <div className="row mt-3">
                                        <div className="col-sm-12">
                                            <button disabled={buttonStatus} className="btn btn-primary btn-md mt-1 float-right"  onClick={this.forgotPasswordRequestOnSubmit} >Go</button>
                                        </div>
                                    </div>
<hr/>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <small className=''> Login ? <Link to={'/login'} className="links" style={{
                                            lineHeight: "1.3em", color: 'rgb(255, 152, 0)',
                                            fontSize: '15px'
                                        }}>
                                            Click here
                                 </Link></small>
                                    </div>
                                    </div>
                                </div>
                            
                        </div>
                    </div>

                </div>
            </React.Fragment>




        );
    }
}

export default ResetForgotPassword;     