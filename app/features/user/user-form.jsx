import React, { Component } from 'react';
import * as userservice from "../../Services/user/user-service";
import FormErrors from '../tasks/form-errors';
// import * as dateUtil from '../../utils/date-util';
import Calendar from '../../Components/calendar/calendar';
import Auth from '../../utils/auth';
import Tabs from './Tabs';
require('./styles.css');

export default class UserForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.user,
            userRoles: [],
            companies: this.props.companies,
            users: this.props.users,
            formValid: (this.props.userId) ? true : false,
            nameValid: false,
            formErrors: {},
            checkMsg: false,
            emailValid: false,
            companyNameValid: false,
            passwordValid: false,
            errMessage: "",
            contactNumber: this.props.contactNumber,
            gender: this.props.gender,
            dob: this.props.dob,
            userId: this.props.userId,
            labelsuccessvalue: this.props.labelsuccessvalue,
            panValid: false,
            addharValid: false,
            passportValid: false,
            passportExpiryDateValid: false,
            passportIssueDateValid: false,
            message: this.props.message
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        //this.onSelection = this.onSelection.bind(this);
        this.onSelectCompanyChanged = this.onSelectCompanyChanged.bind(this);
        this.onSelectUserChanged = this.onSelectUserChanged.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    async componentDidMount() {
        await this.getAllUserRoles();

        this.setState({
            isLoaded: false
        })
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            userId: nextProps.userId,
            user: nextProps.user,
            labelsuccessvalue: nextProps.labelsuccessvalue,
            message: nextProps.message
        })
    }

    async getAllUserRoles() {
        let { response, err } = await userservice.getAllUserRoles();
        if (err) {
            this.setState({
                message: 'Error: ' + err
            });
        } else if (response && response.data.err) {
            this.setState({
                message: 'Error: ' + response.data.err
            });
        } else {
            this.setState({
                userRoles: response.data
            })
        }
    }

    handleChange(e) {
        let user = Object.assign({}, this.state.user);
        user.gender = e.target.value;
        this.setState({
            user: user,
            gender: e.target.value,
            message: ''
        },
        );
    }


    handleInputChange(e) {
        //const value = e.target.value;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        const name = e.target.name;
        this.setState({
            user: {
                ...this.state.user,
                [name]: value,

            },
            checkMsg: false,
            labelsuccessvalue: '',
            errMessage: '',
            message: ''
        },
            this.validateField.bind(this, name, value)

        );

    }

    dateUpdate = (name, updatedDate) => {
        this.setState({
            user: {
                ...this.state.user,
                [name]: updatedDate,
            },
            checkMsg: false,
            labelsuccessvalue: '',
            errMessage: ''
        }, this.validateField.bind(this, name, updatedDate));
    }



    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;
        let nameValid = this.state.nameValid;
        let emailValid = this.state.titleValid;
        let companyNameValid = this.state.emailValid;
        let passwordValid = this.state.passwordValid;
        let reportingManagerValid = this.state.reportingManagerValid;
        let contactNumberValid = this.state.contactNumberValid;
        let alternateNumberValid = this.state.alternateNumberValid;
        let panValid = this.state.panValid;
        let addharValid = this.state.addharValid;
        let passportValid = this.state.passportValid;
        let passportIssueDateValid = this.state.passportIssueDateValid;
        let passportExpiryDateValid = this.state.passportExpiryDateValid
        // let todayDate = dateUtil.DateToString(new Date())
        switch (fieldName) {
            case 'name':
                nameValid = value.length !== 0;
                fieldValidationErrors.name = nameValid ? '' : ' Please fill the';
                break;
            case 'companyName':
                companyNameValid = value.length !== 0;
                fieldValidationErrors['Contact Name'] = companyNameValid ? '' : ' Please fill the';
                break;
            case 'password':
                passwordValid = value.length !== 0 && value.match(/^[a-zA-Z0-9\s]+$/);
                fieldValidationErrors.password = passwordValid ? '' : ' Please fill the';
                break;
            case 'email':
                emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
                fieldValidationErrors.email = emailValid ? '' : ' Please enter correct format(email@email.com) for';
                break;
            case 'reportingManager':
                reportingManagerValid = value.length !== 0;
                fieldValidationErrors.reportingManager = reportingManagerValid ? '' : ' Please fill the';
                break;
            case 'contactNumber':
                contactNumberValid = value.match(/^\d{10}$/);
                fieldValidationErrors['Contact Number'] = contactNumberValid ? '' : ' Please fill the valid';
                break;

            case 'alternateNumber':
                alternateNumberValid = value.match(/^\d{10}$/);
                fieldValidationErrors['Alternate Contact'] = alternateNumberValid ? '' : 'Please fill the valid';
                break;
            case 'panNo':
                panValid = value.match(/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/); //value.length !== 0 &&
                fieldValidationErrors['PAN Number'] = panValid ? '' : ' Please fill the Correct Format';
                break;
            case 'addharNo':
                addharValid = value.match(/^\d{4}\s\d{4}\s\d{4}$/); //value.length !== 0 &&
                fieldValidationErrors['Addhar Number'] = addharValid ? '' : ' Please fill the Correct Format(1234 1234 1234) of';
                break;
            case 'passportNo':
                passportValid = value.match(/^[a-zA-Z]{1}[0-9]{7}$/); //value.length !== 0 &&
                fieldValidationErrors['Passport Number'] = passportValid ? '' : ' Please fill the Correct Format(H1234567) of';
                break;
            case 'passportissueDate':
                passportIssueDateValid = new Date(value.split('-')[0], (parseInt(value.split('-')[1], 10) - 1), value.split('-')[2]) > new Date() ? true : false // value.match(/^[a-zA-Z]{1}[0-9]{7}$/); //value.length !== 0 &&
                fieldValidationErrors['Passport Issue Date'] = !passportIssueDateValid ? '' : 'Please select Valid';
                break;
            case 'passportexpiryDate':
                passportExpiryDateValid = new Date(value.split('-')[0], (parseInt(value.split('-')[1], 10) - 1), value.split('-')[2]) < new Date() ? true : false //value.match(/^[a-zA-Z]{1}[0-9]{7}$/); //value.length !== 0 &&
                fieldValidationErrors['Passport Expiry Date'] = passportExpiryDateValid ? 'Please select Valid ' : '';
                break;
            default:
                break;
        }

        this.setState({
            formErrors: fieldValidationErrors,
            nameValid: nameValid,
            companyNameValid: companyNameValid,
            emailValid: emailValid,
            passwordValid: passwordValid,
            reportingManagerValid: reportingManagerValid,
            contactNumberValid: contactNumberValid,
            alternateNumberValid: alternateNumberValid,
            panValid: panValid,
            addharValid: addharValid,
            passportValid: passportValid,
            passportExpiryDateValid: passportExpiryDateValid,
            passportIssueDateValid: passportIssueDateValid


        }, this.validateForm(this.props.userId));
    }

    validateForm(userId) {
        if (userId) {
            this.setState({ formValid: true });
        }
    }


    onSelectUserChanged(e) {
        let selectedUser = e.target.value;
        //const name = e.target.name;

        let userId = this.state.users.filter((u) => {
            return u.name === selectedUser;
        });
        let uId = (userId && userId.length > 0) ? userId[0]._id : '';
        this.setState({
            user: {
                ...this.state.user,
                reportingManager: selectedUser,
                reportingManagerId: uId
            }
        })

        //this.validateField.bind(this, name, selectedUser));

    }

    onSelectCompanyChanged(e) {
        let selectedCompany = e.target.value;
        const name = e.target.name;
        // let companyId = this.state.companies.filter((cId) => {
        //     return cId.companyName === selectedCompany;
        // });
        // let cId = (companyId && companyId.length > 0) ? companyId[0]._id : '';

        let cId = this.props.companyName && this.props.companyName[selectedCompany.toLowerCase().replace(/ +/g, "")];
        this.setState({
            user: {
                ...this.state.user,
                companyName: selectedCompany,
                companyId: cId
            }
        }, this.validateField.bind(this, name, selectedCompany));
    }

    onSubmit(e) {
        e.preventDefault();
        // console.log("this.state.user",this.state.user)
        var users = this.props.users.filter((u) => {
            return u.email === this.state.user.email;
        })
        if (users.length > 0 && !this.props.user._id) {
            this.setState({
                errMessage: "The email entered already exists, please enter another email."
            })
        } else {
            let data = Object.assign({}, this.state.user);
            data.gender = this.state.gender;
            // console.log('data',data)
            if (this.props.user._id) {
                this.props.oneditUserSubmit(data);
                this.setState({

                    checkMsg: true,
                    message: '',
                    labelsuccessvalue: '',
                    //gender: e.target.value,
                    errMessage: ''
                })
            }
            else {
                this.props.onAddUserSubmit(data);
                this.setState({
                    user: {
                        ...this.state.user,
                        name: '',
                        role: "user",
                        password: '',
                        email: '',
                        companyName: '',
                        companyId: '',
                        isDeleted: false,
                        reportingManager: '',
                        reportingManagerId: '',
                        isActive: true,
                        contactNumber: '',
                        alternateNumber: '',
                        gender: '',
                        dob: '',
                        isLocked: false,
                        dateOfJoining: "",
                        designation: "",
                        bloodGroup: "",
                        currentAddress: "",
                        permanentAddress: "",
                        panNo: "",
                        addharNo: "",
                        passportNo: "",
                        passportName: "",
                        passportissueDate: "",
                        passportexpiryDate: "",
                        placeOfIssue: "",
                        createdBy: Auth.get('userId'),
                        createdOn: new Date(),
                        modifiedBy: Auth.get('userId'),
                        modifiedOn: new Date()

                    },
                    checkMsg: true,
                    message: '',
                    errMessage: '',
                    labelsuccessvalue: ''
                })

            }

        }
    }

    render() {
        // console.log('this.state.user', this.state.user);
        var { name,
            role,
            password,
            email,
            companyName,
            reportingManager,
            isActive,
            contactNumber,
            alternateNumber,
            dob,
            dateOfJoining,
            designation,
            bloodGroup,
            currentAddress,
            permanentAddress,
            panNo,
            addharNo,
            passportNo,
            passportName,
            passportissueDate,
            passportexpiryDate,
            placeOfIssue
        } = this.state.user;
        var { checkMsg } = this.state;

        let filteredUser = this.state.users && this.state.users.filter((u) => {
            return u.role !== 'user'
        })
        // console.log("filteredUser",filteredUser);
        return (
            <div style={{ marginTop: "10px" }}>
                <span onClick={this.props.closeUser} className="float-right mr-3">
                    <i className="fas fa-times close"></i>
                </span>

                {this.props.user._id ?
                    <h4 className="sub-title"> Edit Member</h4> :
                    <h4 className="sub-title"> Add  Member</h4>}


                <hr />
                <div className="row">
                    <div className="col-sm-12 text-center">
                        {this.state.labelsuccessvalue || this.state.message || this.state.formErrors || this.state.errMessage ?
                            <div>
                                {checkMsg && this.state.message ?
                                    <span className="alert alert-danger">{this.state.message}</span>
                                    :
                                    this.state.errMessage ? <span className="alert alert-danger"> {this.state.errMessage} </span> : ""}
                                {this.state.formErrors ?
                                    <FormErrors formErrors={this.state.formErrors} />
                                    : ""
                                }


                                {this.state.labelsuccessvalue ?
                                    <div className="alert alert-success">
                                        {this.state.labelsuccessvalue}
                                    </div>
                                    : ''
                                }</div>
                            : ''}

                    </div>

                </div>

                <div className="container">

                    <div className="form-group ">
                        <form onSubmit={this.onSubmit}>

                            <div className="row">
                                <div className="col-sm-12">
                                    <Tabs>
                                        <div label="Member Info">

                                            <div className="row">
                                                <div className="col-sm-4">
                                                    <div className="">
                                                        <label htmlFor="name" >Name</label><span style={{ color: 'red' }}>*</span>
                                                        <input className="form-control" type="text" value={name} onChange={this.handleInputChange}
                                                            name="name" placeholder="Name" autoComplete="off" />

                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="">
                                                        <label htmlFor="email" >Email</label><span style={{ color: 'red' }}>*</span>
                                                        <input className="form-control" type="email" id='txtEmail' value={email} autoComplete="off"
                                                            onChange={this.handleInputChange} name="email" placeholder="Email" disabled={this.props.user._id ? true : false} />
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="">
                                                        <label htmlFor="contactNumber" >Contact Number</label><span style={{ color: 'red' }}>*</span>
                                                        <input className="form-control" type="text" value={contactNumber} onChange={this.handleInputChange}
                                                            name="contactNumber" placeholder="Contact Number" maxLength={10} autoComplete="off" />

                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">

                                                {this.props.user._id ?
                                                    '' :
                                                    <div className="col-sm-4">
                                                        <label htmlFor="password" >Password</label><span style={{ color: 'red' }}>*</span>
                                                        <input className="form-control" type="password" value={password} id='txtPassword'
                                                            onChange={this.handleInputChange} name="password" placeholder="Password" /><br />
                                                    </div>}

                                                <div className="col-sm-4">
                                                    <label>Gender</label>
                                                    <ul>
                                                        <label>
                                                            <input
                                                                type="radio"
                                                                value="male"
                                                                name="gender"
                                                                checked={this.state.user.gender === "male"}
                                                                onChange={this.handleChange}
                                                            />
                                                            Male
                                        </label> &nbsp; &nbsp; &nbsp;
                                        <label>
                                                            <input
                                                                type="radio"
                                                                value="female"
                                                                name="gender"
                                                                checked={this.state.user.gender === "female"}
                                                                onChange={this.handleChange}
                                                            />
                                                            Female
                                        </label>
                                                    </ul>

                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="input-group">
                                                        <label htmlFor="dob" >Date of Birth</label>
                                                        <Calendar width='200px' height='225px' className="form-control"
                                                            dateformat={'YYYY-MM-DD'}
                                                            selectedDate={dob}
                                                            dateUpdate={this.dateUpdate.bind(this, 'dob')}
                                                            id="dob" calendarModalId="dobModal"
                                                        />
                                                        {/* <input className="form-control" type="Date" value={dob}
                                            onChange={this.handleInputChange} name="dob" placeholder="DOB" /> */}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-sm-4">
                                                    <div className="form-group">
                                                        <label htmlFor="role">Role</label><span style={{ color: 'red' }}>*</span>
                                                        <select value={role} onChange={this.handleInputChange} name="role" className="form-control">
                                                            <option value="" disabled>Select Role</option>
                                                            {
                                                                this.state.userRoles.map((role1) => {
                                                                    return <option key={role1._id}
                                                                        value={role1.role}>{role1.displayName}</option>;
                                                                })
                                                            }
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="form-group">
                                                        <label htmlFor="Company Name">Company Name</label> <span style={{ color: 'red' }}>*</span>
                                                        <input type="text" value={companyName} list="data" onChange={this.onSelectCompanyChanged}
                                                            name='companyName' className="form-control" autoComplete="off" placeholder="Company Name" />
                                                        <datalist id="data" >
                                                            {
                                                                this.state.companies.map((c) => {
                                                                    return <option data-value={c._id} key={c._id}>{c.companyName}</option>
                                                                })
                                                            }
                                                        </datalist>
                                                    </div>
                                                </div>

                                                <div className="col-sm-4">
                                                    <div className="form-group">
                                                        <label htmlFor="Reporting Manager" >Reporting Manager</label>{this.state.user.role !== 'admin' ? <span style={{ color: 'red' }}>*</span> : ''}

                                                        <input type="text" value={reportingManager} list="data1" onChange={this.onSelectUserChanged}
                                                            name='reportingManager' className="form-control" autoComplete="off" placeholder="Select User" />
                                                        <datalist id="data1" >
                                                            {
                                                                filteredUser && filteredUser.map((c) => {
                                                                    return <option data-value={c._id} key={c._id}>{c.name}</option>
                                                                })
                                                            }
                                                        </datalist>
                                                    </div>

                                                </div>
                                            </div>

                                        </div>
                                        <div label="Additional Info">

                                            <div className="row">

                                                <div className="col-sm-4">
                                                    <div className="">
                                                        <label htmlFor="alternateNumber" >Alternate Contact</label>
                                                        <input className="form-control" type="text" value={alternateNumber}
                                                            onChange={this.handleInputChange} name="alternateNumber" placeholder="Alternate Contact" autoComplete="off" />
                                                    </div>
                                                </div>

                                                <div className="col-sm-4">
                                                    <div className="input-group">
                                                        <label htmlFor="dateOfJoining" >Date Of Joining</label>
                                                        <Calendar width='200px' height='225px' className="form-control"
                                                            dateformat={'YYYY-MM-DD'}
                                                            selectedDate={dateOfJoining}
                                                            dateUpdate={this.dateUpdate.bind(this, 'dateOfJoining')}
                                                            id="dateOfJoining" calendarModalId="dateOfJoiningModal"
                                                        />
                                                        {/* <input className="form-control" type="Date" value={dateOfJoining} onChange={this.handleInputChange}
                                            name="dateOfJoining" placeholder="Date Of Joining" /> */}

                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="">
                                                        <label htmlFor="designation" >Designation</label>
                                                        <input className="form-control" type="text" value={designation} autoComplete="off"
                                                            onChange={this.handleInputChange} name="designation" placeholder="Designation" />
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="row">
                                                <div className="col-sm-4">
                                                    <div className="">
                                                        <label htmlFor="bloodGroup" >Blood Group</label>
                                                        <input className="form-control" type="text" value={bloodGroup} onChange={this.handleInputChange}
                                                            name="bloodGroup" placeholder="Blood Group" autoComplete="off" />

                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="">
                                                        <label htmlFor="currentAddress" >Current Address</label>
                                                        <input className="form-control" type="text" value={currentAddress}
                                                            onChange={this.handleInputChange} name="currentAddress" placeholder="Current Address" autoComplete="off" />
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="">
                                                        <label htmlFor="permanentAddress" >Permanent Address</label>
                                                        <input className="form-control" type="text" value={permanentAddress} onChange={this.handleInputChange}
                                                            name="permanentAddress" placeholder="Permanent Address" autoComplete="off" />

                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">

                                                <div className="col-sm-4">
                                                    <div className="">
                                                        <label htmlFor="panNo" >PAN No</label>
                                                        <input className="form-control" type="text" value={panNo}
                                                            onChange={this.handleInputChange} name="panNo" placeholder="PAN No" autoComplete="off" />
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="">
                                                        <label htmlFor="addharNo" >Addhar No</label>
                                                        <input className="form-control" type="text" value={addharNo} onChange={this.handleInputChange}
                                                            name="addharNo" placeholder="Addhar No" autoComplete="off" />

                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="">
                                                        <label htmlFor="passportNo" >Passport No</label>
                                                        <input className="form-control" type="text" value={passportNo}
                                                            onChange={this.handleInputChange} name="passportNo" placeholder="Passport No" autoComplete="off" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-sm-4">
                                                    <div className="">
                                                        <label htmlFor="passportName" >Passport Name</label>
                                                        <input className="form-control" type="text" value={passportName} onChange={this.handleInputChange}
                                                            name="passportName" placeholder="Passport Name" autoComplete="off" />

                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="input-group">
                                                        <label htmlFor="passportissueDate" >Passport Issue Date</label>
                                                        <Calendar width='200px' height='225px' className="form-control"
                                                            dateformat={'YYYY-MM-DD'}
                                                            selectedDate={passportissueDate}
                                                            dateUpdate={this.dateUpdate.bind(this, 'passportissueDate')}
                                                            id="passportissueDate" calendarModalId="passportissueDateModal"
                                                        />
                                                        {/* <input className="form-control" type="Date" value={passportissueDate}
                                            onChange={this.handleInputChange} name="passportissueDate" placeholder="Passport Issue Date" /> */}
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="input-group">
                                                        <label htmlFor="passportexpiryDate" >Passport Expiry Date</label>
                                                        <Calendar width='200px' height='225px' className="form-control"
                                                            dateformat={'YYYY-MM-DD'}
                                                            selectedDate={passportexpiryDate}
                                                            dateUpdate={this.dateUpdate.bind(this, 'passportexpiryDate')}
                                                            id="passportexpiryDate" calendarModalId="passportexpiryDateModal"
                                                        />
                                                        {/* <input className="form-control" type="Date" value={passportexpiryDate} onChange={this.handleInputChange}
                                            name="passportexpiryDate" placeholder="Passport Expiry Date" /> */}

                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-sm-4">
                                                    <div className="">
                                                        <label htmlFor="placeOfIssue" >Place Of Issue</label>
                                                        <input className="form-control" type="text" value={placeOfIssue}
                                                            onChange={this.handleInputChange} name="placeOfIssue" placeholder="Place Of Issue" autoComplete="off" />
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <label htmlFor="isActive" >Active</label> &nbsp;
                                    <input type='checkbox' placeholder=" " onChange={this.handleInputChange} name='isActive' value={isActive} checked={isActive} />
                                                </div>
                                            </div>

                                        </div>
                                    </Tabs>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-sm-2 offset-sm-10">
                                    <div className="form-group">
                                        <input type="submit" value="Submit" className="btn btn-info btn-block"
                                            disabled=
                                            {this.props.user._id ?
                                                (this.state.user.role === 'owner' || this.state.user.role === 'user') ? !(this.state.user.name && this.state.user.email && this.state.user.companyName
                                                    && this.state.user.reportingManager && this.state.user.contactNumber) : !(this.state.user.name && this.state.user.email && this.state.user.companyName && this.state.user.contactNumber)
                                                :
                                                (this.state.user.role === 'owner' || this.state.user.role === 'user') ? !(this.state.user.name &&
                                                    this.state.user.password && this.state.user.email && this.state.user.companyName
                                                    && this.state.user.reportingManager && this.state.user.contactNumber) : !(this.state.user.name &&
                                                        this.state.user.password && this.state.user.email && this.state.user.companyName && this.state.user.contactNumber)


                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}