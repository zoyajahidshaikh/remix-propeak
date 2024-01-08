import React, { Component } from 'react';
import * as notificationservice from '../../Services/notification/notification-service';
import Auth from '../../utils/auth';
import * as dateUtil from '../../utils/date-util';
import './notification.css';

export default class NotificationDisplay extends Component {
    constructor(props) {
        super(props);
        this.onHide = this.onHide.bind(this);
        this.onClose=this.onClose.bind(this);
    }
    
    state = {
        notifications: this.props.context.state.notifications,
        showNotifcationBox:true
    }

    onClose(){
        
      this.setState({
        showNotifcationBox:false
      })
    }

    async onHide(notificationId) {
        let userId = Auth.get('userId');
        let { response, err } = await notificationservice.addHideNotification(notificationId, userId);
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
            
            let notificationCopy = this.props.context.state.notifications.filter((cat) => {
                return cat._id !== response.data.result._id;
            });
            this.props.context.actions.updateState("notifications", notificationCopy);
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            notifications: nextProps.context.state.notifications
        })
    }


    componentDidMount() {
        if(this.state.notifications.length ===0){
            this.props.context.actions.getAllUnHideNotification();
            
        }
    }

    render() {
        let notifications = (this.state.notifications.length > 0) && this.state.notifications.filter((n) => {
            let date = dateUtil.DateToString(new Date().toISOString());
            return (n.fromDate === date && (n.toDate === date || !n.toDate || n.toDate > date))
                || (n.fromDate < date && (!n.toDate || n.toDate > date || n.toDate === date))
        });

        let filterNotification = notifications && notifications.map((no) => {
            let note = {
                notification: no.notification,
                _id: no._id
            }
            return note;
        });

        let notificationData = '';
        let data = [];

        for (let i = 0; i < filterNotification.length; i++) {
            data.push(<div className="alert alert-info" key={i + 1}>{filterNotification[i]['notification']} &nbsp;
               <span className="float-right close"
                    onClick={() => this.onHide(filterNotification[i]['_id'])} >
                    <small> <i className="fas fa-times"></i></small>
                </span>
            </div>)
        }
        notificationData = data.length > 0 ? <React.Fragment>
            <div className="notification-container m-2">
                <div className="notification-wrapper-outer">
                {this.state.showNotifcationBox ?<div className="notification-wrapper rounded">
                <div className="title mt-2">
                            <h3 className="noti-title">Broadcast   <span className="notification-star"><span className="notification-num">{data.length}</span></span> <span className="float-right close"   onClick={() => this.onClose()}> <small> <i className="fas fa-times"></i></small></span>
</h3>
                </div>
                    {data}</div>:''}
                  
            </div>
            </div>
                        
       
        </React.Fragment> : "";
        return (
            <div className="row">
                {notificationData}
            </div>

            
        )
    }
}