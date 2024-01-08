import React from 'react';
import Auth from '../../../utils/auth';
import * as changepassservice from "../services/login-service";

export default class ChangePassword extends React.Component {
    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.changePassword = this.changePassword.bind(this);
    }

    state = {
        newPassword: '',
        newConfirmPassword: '',
        message: '',
        messagesuccess: '',
        isLoaded: true
    }

    handleInputChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value,
            message: "",
            messagesuccess: ""
        })
    }
    
    async changePass(change, id) {
        let { response, err } = await changepassservice.changePassword(change, id);
        if (err) {
            this.setState({
                message: 'Error: ' + err
            });
        } else {
            if (response.data.err) {
                this.setState({
                    message: response.data.err
                });
            } else {
                this.setState({
                    reset: response.data,
                    messagesuccess: "Password Changed successfully"
                });
            }
        }
    }

    changePassword() {
        var id = Auth.get("userId");
        var change = {
            newPassword: this.state.newPassword,
            newConfirmPassword: this.state.newConfirmPassword
        }
        this.changePass(change, id);

        this.setState({
            newPassword: '',
            newConfirmPassword: '',
            message: ''
        })
    }

    componentDidMount() {
        this.setState({
            isLoaded: false
        })
    }

    render() {
        return (
            <div>
                {this.state.isLoaded ? <div className="logo">
                    <img src="/images/loading.svg" alt="loading" />
                </div> :
                    <div>
                        <div className='changeWrapper bg-white'>
                            <div className="container-fluid">
                                <div className="row">

                                    <div className="col-sm-12 col-md-6 offset-md-3 " >
                                        <div className="form-wrapper mt-5 pa-5" >
                                            <h3 className="mt-3">Change Password</h3>
                                            <hr />
                                            {this.state.messagesuccess ? <span className="alert alert-success">{this.state.messagesuccess}</span> : ''}
                                            {this.state.message ?<span className="alert alert-danger">{this.state.message}</span>
                                            :''}
                                            <form>
                                                <div className="form-group ">
                                                    <label htmlFor="newPassword">New Password</label>
                                                    <input className="form-control " type="password" placeholder="New Password" name="newPassword" value={this.state.newPassword} onChange={this.handleInputChange} />
                                                </div>
                                                <div className="form-group ">
                                                    <label htmlFor="newConfirmPassword">Confirm Password</label>
                                                    <input className="form-control " type="password" placeholder="Confirm Password" name="newConfirmPassword" value={this.state.newConfirmPassword} onChange={this.handleInputChange} />
                                                </div>
                                                <div className='form-group'>
                                                    <div className='row'>
                                                        <div className='col-sm-12'>
                                                            <input type="button" value="Submit" className="btn btn-primary btn-block"
                                                                onClick={this.changePassword} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}
            </div>
        )
    }
}