import React from 'react';
import FormErrors from '../tasks/form-errors';
import * as notificationservice from '../../Services/notification/notification-service';
import TaskMenu from '../tasks/task-menu';
import * as ObjectId from '../../utils/mongo-objectid';
import { Link } from 'react-router-dom';
import Calendar from '../../Components/calendar/calendar';

const labelStyle = {
    fontSize: "small",
};


export default class NotificationForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.onSubmit=this.onSubmit.bind(this);
    }
    state = {
        notificationObject: {
            notification: '',
            toDate: '',
            fromDate: '',
            isDeleted: false
        },
        formValid: (this.props.notificationId) ? true : false,
        titleCheck: false,
        checkMsg: false,
        message: '',
        messagesuccess: '',
        formErrors: {},
        notificationValid: '',
        fromDateValid:'',
        projectName: this.props.context.state.projectName,
        notifications: this.props.context.state.notifications
    }
    async componentDidMount (){
        
        if(this.state.notifications.length === 0) {
            this.props.context.actions.getAllUnHideNotification();
        }
        if (this.props.notificationId && this.props.projectId) {
            this.getNotificationById();
        }
    }

    async getNotificationById () {
        let { response, err } = await notificationservice.getNotificationById(this.props.notificationId);
        if (err) {
            this.setState({
                message: err
            });
        }
        else if (response && response.data.err) {
            this.setState({ message: response.data.err });
        } else {
           
            this.setState({
                notificationObject: response.data.data[0],
            })
        }
    }
    handleInputChange  (e) {
        const value = e.target.value;
        const name = e.target.name;
        this.setState({
            notificationObject: {
                ...this.state.notificationObject,
                [name]: value,
            },
            checkMsg: false
        },
             this.validateField.bind(this,name, value) );
    }


    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;
        let notificationValid = this.state.notificationValid;
        let fromDateValid = this.state.fromDateValid;

        switch (fieldName) {
            case 'notification':
            notificationValid = value.length !== 0;
                fieldValidationErrors.notification = notificationValid ? '' : ' Please fill the';
                break;
                case 'fromDate':
                fromDateValid = value.length !== 0;
                    fieldValidationErrors.fromDate = fromDateValid ? '' : ' Please fill the';
                    break;
            default:
                break;
        }

       

        this.setState({
            formErrors: fieldValidationErrors,
            notificationValid: notificationValid,
            fromDateValid:fromDateValid
        }, this.validateForm(this.props.notificationId));
    }

    validateForm(notificationId) {
        if (notificationId) {
            this.setState({ formValid: true });
        }
    }
    
    dateUpdate = (name, updatedDate) => {
        this.setState({
            notificationObject: {
                ...this.state.notificationObject,
            [name]: updatedDate,
        },
        checkMsg: false
        },  this.validateField.bind(this,name, updatedDate) )
    }


    onSubmit (e) {
        e.preventDefault();
        let data = Object.assign({}, this.state.notificationObject);
       
        if (this.props.notificationId && this.props.projectId) {
            this.editNotification(data);
        }
        else{
            data._id= ObjectId.mongoObjectId();
            this.onNotificationSubmit(data,this.props.projectId);
        }
        this.setState({
                notificationObject: {
                    notification: '',
                    toDate: '',
                    fromDate: '',
                    isDeleted: false
                },
            checkMsg: true,
            message: ''

        })
    }

    async onNotificationSubmit  (notification,projectId){
        let { response, err } = await notificationservice.addNotification(notification,projectId);
        if (err) {
            this.setState({
                message: 'Error: ' + err
            });
        } else if (response && response.data.err) {
            this.setState({
                message: 'Error: ' + response.data.err
            });
        }
        else {
            let notificationsCopy = Object.assign([],this.state.notifications);
            notificationsCopy.push(notification);
            this.setState({
                messagesuccess: response.data.msg
            })
            this.props.context.actions.updateState("notifications", notificationsCopy);
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            notifications: nextProps.context.state.notifications
        })
    }

    async editNotification  (notification) {
        let { response, err } = await notificationservice.editNotification(notification);
        if (err) {
            this.setState({
                message: 'Error: ' + err
            });
        } else if (response && response.data.err) {
            this.setState({
                message: 'Error: ' + response.data.err
            });
        }
        else {
            let notificationsCopy = Object.assign([],this.state.notifications);
            let updatedNotifications = notificationsCopy.map( (n)=> {
                if (n._id === notification._id) {
                    n = notification;
                }
                return n;
            });
          
            this.setState({
                messagesuccess: response.data.msg
            })
            this.props.context.actions.updateState("notifications", updatedNotifications);
        }
    }
    
    render() {
        var {
            notification,toDate,fromDate} = this.state.notificationObject;
       
        var { checkMsg } = this.state;
        return (
            <div>
            { this.props.projectId !== '000' ? 
            <h4 className="sub-title ml-3">{this.state.projectName}</h4> : ""}
            <hr/>
            <div className = "row">
                {this.props.projectId !== '000' ? <TaskMenu {...this.props} /> : ""}
            </div>
                  
                    <div className="container bg-white">
                    <form className="form-wrapper" onSubmit={this.onSubmit}>
                        <div className="form-group">
                            <div className="row">
                                <div className="col-sm-12 ">
                                    {this.props.notificationId ?
                                        <h4 className="sub-title"> Edit Broadcast</h4> :
                                        <h4 className="sub-title"> Broadcast</h4>}
                                 <hr/>
                                  
                                </div>
                            </div>
                        </div>
                        { this.state.errUserMessage ||this.state.formErrors || this.state.errMessage ||this.state.messagesuccess ?   
                 <div>
                                        {this.state.checkUser ? this.state.errUserMessage && this.state.errMessage : 
                                                    this.state.errUserMessage || this.state.errMessage }
                                        {this.state.errUserMessage ? this.state.errUserMessage : this.state.errMessage}
                                       {this.state.message && checkMsg  ?
                                            <span  className="alert alert-danger">{this.state.message}</span>
                                         : ""}
                                      
                                        {this.state.formErrors?
                                            <FormErrors formErrors={this.state.formErrors} /> :''
                                        } 
                                  
                       { this.state.messagesuccess && this.state.checkMsg ?
                            <span className="alert alert-success">
                                {this.state.messagesuccess}
                            </span>
                            : ''}
                            </div>
                        
                        :""}

                        <div className="row">
                            <div className="col-sm-4">
                                <div className="form-group" >
                                    <label htmlFor="Notification" style={labelStyle}>Notification</label>
                                    <span style={{ color: 'red' }}>*</span>
                                    <input type="text" name="notification" className="form-control"
                                        placeholder="notification"
                                        value={notification}
                                        onChange={this.handleInputChange} autoComplete="off"/>
                                </div>
                            </div>
                            <div className="col-sm-4">
                                        <div className="input-group">
                                            <label htmlFor="FromDate" style={labelStyle}>From Date</label>
                                            <span style={{ color: 'red' }}>*</span> 
                                            {/* <input className="form-control" type='Date' placeholder="From Date" 
                                            name="fromDate"
                                                onChange={this.handleInputChange} value={fromDate} /> */}
                                                <Calendar width='267px' height='225px' className="form-control"
                                                    dateformat={'YYYY-MM-DD'}
                                                    selectedDate={fromDate}
                                                    dateUpdate={this.dateUpdate.bind(this, 'fromDate')}
                                                    id="fromDate" calendarModalId="dateFromModal"
                                                />
                                        </div>
                                    </div>
                            <div className="col-sm-4">
                                        <div className="input-group">
                                            <label htmlFor="ToDate" style={labelStyle}>To Date</label>
                                           &nbsp;&nbsp;
                                            {/* <span style={{ color: 'red' }}>*</span> */}
                                            {/* <input className="form-control" type='Date' placeholder="To Date"
                                             name="toDate"
                                                onChange={this.handleInputChange} value={toDate} /> */}
                                                <Calendar className="form-control" width='267px' height='225px'
                                                    dateformat={'YYYY-MM-DD'}
                                                    selectedDate={toDate}
                                                    dateUpdate={this.dateUpdate.bind(this, 'toDate')}
                                                    id="toDate" calendarModalId="dateToModal"
                                                />
                                        </div>
                                    </div>
                        </div>
                     
                        <div className="row">
                            <div className="col-sm-2 offset-sm-8 ">
                                <input type="submit" className="btn btn-info btn-block"
                                    value="Submit" disabled = {this.state.formValid ? "" : !(notification && fromDate)}/>
                            </div>
                            <div className="col-sm-2 offset-sm-12">
                                 {
                                    this.props.projectId !== '000' ?
                                    <Link to={"/notification/"+ this.props.projectId} className="btn btn-default btn-block">Cancel</Link> :
                                    <Link to="/notification/000" className="btn btn-default btn-block">Cancel</Link> 
                                   
                                 }                                                             
                                                                                              
                                                                                                    
                   </div>
                        </div>

                    </form>
                </div>
            </div>
        )
    }
}