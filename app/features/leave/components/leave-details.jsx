import React, { Component } from "react";
import * as leaveApplicationService from "../../../Services/leave-service/leave-service";
import Auth from "../../../utils/auth";
import { Link } from "react-router-dom";

class LeaveDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            leaveDetails: {},
            leaveId: this.props.leaveId,
            errorMessage: "",
            successMessage: "",
            checked: '',

        }
        this.getDetails = this.getDetails.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onSelection = this.onSelection.bind(this);
        this.postApproveReject = this.postApproveReject.bind(this);
        this.redirect = this.redirect.bind(this);
        this.handleCheckBoxChange = this.handleCheckBoxChange.bind(this);
        // this.getDetails = this.getDetails().bind(this);
    }
    async getDetails() {
        let leaveId = this.props.leaveId;
        let { response, err } = await leaveApplicationService.getDetails(leaveId);
        this.setState({
            isLoaded: true
        });

        if (err) {
            this.setState({
                isLoaded: false
            });
        }
        else if (response && response.data.err) {
            this.setState({
                isLoaded: false
            });
        } else {
            this.setState({
                isLoaded: false,
                leaveDetails: response.data.leaveDetails,
                acceptReject: response.data.leaveDetails.status,
                reason: response.data.leaveDetails.rejectionReason

            });
            if (response.data.leaveDetails.status === 'approved') {
                this.setState({
                    checked: 'approved',
                });
            }
            else if (response.data.leaveDetails.status === 'rejected') {
                this.setState({
                    checked: 'rejected'
                });

            }
            else {
                this.setState({
                    checked: ''
                });
            }
        }
    }
    componentDidMount() {
        if (!this.state.leaveDetail) {
            this.getDetails();
        }
    }
    redirect() {
        window.location.href = "/leave";
    }
    onSelection(e) {
        let name = e.target.name;
        let value = e.target.value;

        this.setState({
            ...this.state,
            [name]: value,
            checked: value,
            reason: value === 'approved' ? "" : this.state.reason
        })
    }
    handleChange(e) {
        let name = e.target.name;
        let value = e.target.value;
        if (name === "reason") {
            if (value === "") {
                this.setState({
                    ...this.state,
                    errorMessage: "Please enter reason for rejection"
                });
            }
        }

        this.setState({
            ...this.state,
            [name]: value
        })
    }

    handleCheckBoxChange(e) {
        // let name = e.target.name;
        let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        this.setState({
            leaveDetails: {
                ...this.state.leaveDetails,
                leaveWithoutApproval: value
            }
        })
    }

    onSubmit(e) {
        e.preventDefault();

        let leaveApprovedReject = {
            approvedRejected: this.state.acceptReject,
            leaveId: this.state.leaveId,
            reasonRejection: this.state.reason,
            modifiedBy: Auth.get("userId"),
            modifiedOn: new Date(),
            toEmail: this.state.leaveDetails.fromEmail,
            leaveWithoutApproval: this.state.leaveDetails.leaveWithoutApproval
        }
        this.postApproveReject(leaveApprovedReject);
    }
    async  postApproveReject(leaveApprovedReject) {
        //console.log("Decision made by reporting manager : ", leaveApprovedReject);
        let { response, err } = await leaveApplicationService.ApprovedReject(leaveApprovedReject);
        if (err) {
            this.setState({
                ...this.state,
                errorMessage: err
            });
        } else if (response && response.data.err) {
            this.setState({
                ...this.state,
                errorMessage: response.data.err
            });
        } else {
            this.setState({
                successMessage: response.data.message
            })
            // alert(response.data.message)
            // setTimeout(function () {
            //     window.location.href === "/leave";
            // }, 5000);
            // setTimeout(function () {
            //     window.location.href = "/leave"
            // }, 5000);
        }

    }
    render() {
        // let reasonRejection = "";
        // if (this.state.isRejected) {
        //     reasonRejection = this.state.reasonRejection
        // }
        let userRole = Auth.get("userRole");
        return (

            <div className="container bg-white">
                <div className="row">
                    <div className="col-sm-12">
                        {this.state.errorMessage ?
                            <span htmlFor="project" className="alert alert-danger" value={this.state.labelvalue}>
                                {this.state.errorMessage}
                            </span>
                            :
                            this.state.successMessage ?
                                <span htmlFor="project" className="alert alert-success" value={this.state.labelsuccessvalue}>
                                    {this.state.successMessage}
                                </span>
                                : ""}
                    </div>
                </div>
               
                <div className="row">
                    <div className="col-sm-2"></div>
                    <div className="col-sm-8">
                            <form className=" form-wrapper">
                            <h3 className="project-title">Leave Details</h3>
                       <hr/>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <label htmlFor="Name">Name:</label>
                                                </div>
                                                <div className="col-sm-6">
                                                    <label>{this.state.leaveDetails.userName}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <label htmlFor="LeaveType">Leave Type:</label>
                                                </div>
                                                <div className="col-sm-6">
                                                    <label>{this.state.leaveDetails.leaveType}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <label htmlFor="FromDate">From Date:</label>
                                                </div>
                                                <div className="col-sm-6">
                                                    <label>{this.state.leaveDetails.fromDate}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <label htmlFor="ToDate">To Date:</label>
                                                </div>
                                                <div className="col-sm-6">
                                                    <label>{this.state.leaveDetails.toDate}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <label htmlFor="WorkingDays">Working Days:</label>
                                                </div>
                                                <div className="col-sm-6">
                                                    <label>{this.state.leaveDetails.workingDays}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <label htmlFor="Reason">Reason:</label>
                                                </div>
                                                <div className="col-sm-6">
                                                    <label>{this.state.leaveDetails.reason}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {userRole !== "user" ? <div className="row">
                                    <div className="col-sm-12">
                                        <div className="form-group">
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <label htmlFor="SelectionOfAction">Selection of action:</label>
                                                </div>
                                                <div className="col-sm-6">
                                                    <div className="row">
                                                        <div className="col-sm-6">
                                                            <label htmlFor="Approve">Approve</label>
                                                        </div>
                                                        <div className="col-sm-6">
                                                            <input type="radio" className="form-control" value="approved" name="acceptReject"
                                                                onClick={this.onSelection} checked={this.state.checked === "approved"} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-6">
                                                            <label htmlFor="Reject">Reject</label>
                                                        </div>
                                                        <div className="col-sm-6">
                                                            <input type="radio" className="form-control" value="rejected"
                                                                name="acceptReject" onClick={this.onSelection} checked={this.state.checked === "rejected"} />
                                                        </div>
                                                    </div>
                                                    {this.state.acceptReject === "approved" ?
                                                        <div className="row">
                                                            <div className="col-sm-6">
                                                                <label htmlFor="LeaveWithoutApproval">Leave without approval</label>
                                                            </div>
                                                            <div className="col-sm-6">
                                                                <input type="checkbox" className="form-control"
                                                                    name="leaveWithoutApproval" onChange={this.handleCheckBoxChange} checked={this.state.leaveDetails.leaveWithoutApproval} />
                                                            </div>
                                                        </div>
                                                        : ""}

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> : ""}
                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <label htmlFor="Reason">Reason of Accept /Reject{this.state.acceptReject === 'rejected' ? <span style={{ color: "red" }}>*</span> : ''}</label>
                                                </div>
                                                <div className="col-sm-6">
                                                    <textarea rows="5" className="form-control" name="reason" value={this.state.reason} id="reason" onChange={this.handleChange}></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                               
                                 
                                <div className="row">
                                        <div className="col-sm-6">
                                           
                                                    {
                                                        userRole !== "user" ?

                                                            <input type="button" className="btn btn-info btn-block" disabled={(this.state.acceptReject === 'rejected' && !this.state.reason)} style={{ cursor: "pointer" }} onClick={this.onSubmit} value="Submit" />
                                                            : <span>&nbsp;</span>
                                                    }
                                                    </div>  
                                                    <div className="col-sm-6">
                                                    <Link to="/leave/" className="btn btn-default btn-block">Cancel</Link>
                                                
                                            </div>

                                    
                                </div>
                            </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default LeaveDetails;