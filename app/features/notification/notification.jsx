import React,{Component} from 'react' ;
import { Link } from 'react-router-dom';
import NotificationList from './notification-list';
import * as notificationservice from '../../Services/notification/notification-service';
import Auth from '../../utils/auth';
import * as validate from '../../common/validate-entitlements';
import TaskMenu from '../tasks/task-menu';


export default class Notification extends Component {
    constructor(props){
        super(props);
        this.onDelete=this.onDelete.bind(this);
    }
    state = {
        isLoaded: true,
        notifications: [],
        projectId: this.props.projectId,
        projectName: this.props.context.state.projectName,
        appLevelAccess: this.props.context.state.appLevelAccess  
    }

    componentDidMount() {
        this.getNotifications();
        if(this.state.appLevelAccess.length === 0){
            this.props.context.actions.getAppLevelAccessRights();
        }
        this.setState({
            isLoaded: false
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            projectName: nextProps.context.state.projectName,
            appLevelAccess: nextProps.context.state.appLevelAccess
        })
    }

    async getNotifications(){
        let { response, err } = await notificationservice.getAllNotification(this.props.projectId);
        if (err) {
            this.setState({
                message: err
            });
        }
        else if (response && response.data.err) {
            this.setState({ message: response.data.err });
        } else {
          
            this.setState({
                notifications: response.data
            })
        }
    }

    onDelete (notificationId) {
        if (window.confirm('Are you sure you want to delete this Notification?')){
            let filteredNotification = this.state.notifications && this.state.notifications.filter((notification) => {
                return notification._id === notificationId
            })
            filteredNotification[0].isDeleted = true;
            this.deleteNotification(filteredNotification);
        }
       
    }

    async deleteNotification (notification){
        let { response, err } = await notificationservice.deleteNotification(notification);
        if (err) {
            this.setState({
                message: 'Error : ' + err,
                labelvalue: 'Error : ' + err
            });
        } else if (response && response.data.err) {
            this.setState({
                message: response.data.err,
                labelvalue: response.data.err,
            });
        } else {
            let notifications = this.state.notifications && this.state.notifications.filter((notification) => {
                return notification._id !== response.data.result._id;
            });
            this.setState({
                notifications:notifications
            });
        //    this.props.context.actions.updateState("notifications",notifications);
            this.props.context.actions.getAllUnHideNotification();
        }
    }

    
    render() {
        // let userRole = Auth.get('userRole');
        let addNotification = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Notification', 'Create');
        let editNotification = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Notification', 'Edit');
        let deleteNotification = validate.validateAppLevelEntitlements(this.state.appLevelAccess, 'Notification', 'Delete');
        
        let accessRights = Auth.get('access');

        if(this.props.projectId !== '000' && accessRights && accessRights.length > 0){
            addNotification = validate.validateEntitlements(accessRights, this.props.projectId,'Notification','create');
            editNotification = validate.validateEntitlements(accessRights, this.props.projectId,'Notification','edit');
            deleteNotification = validate.validateEntitlements(accessRights, this.props.projectId,'Notification','delete');
        }
    
        var notificationList = <NotificationList
        notifications={this.state.notifications} onDelete={this.onDelete} projectId={this.props.projectId} editNotification={editNotification}
        deleteNotification={deleteNotification}/>
     
        return (
            <div className="container bg-white">
                {this.state.isLoaded ? <div className="logo">
                    <img src="/images/loading.svg" alt="loading" />
                </div> :
                    <React.Fragment>
                        
                        {this.props.projectId !== '000' ? 
                            <span><h3 className="project-title d.inline-block mt-3 mb-3" >{this.state.projectName}-Broadcast
                            </h3>  <hr/>
                            </span>
                        : ""}
                       
                        <div className = "row">
                            {this.props.projectId !== '000' ? <TaskMenu {...this.props} /> : ""}
                        </div>
                        <div className="row" >
                            <div className="col-sm-7">
                                <div className="row">
                                    <div className="col-sm-6">
                                        <h4 className="sub-title ml-3 mt-3">
                                            Broadcast
                                </h4>
                                    </div>
                                    <div className="col-sm-6">
                                        <h4 className="mt-3">
                                            {addNotification ?


                                                this.props.projectId !== '000' ?
                                                    <Link to={`/notification/` + this.props.projectId + '/create/notification'} className="btn btn-xs btn-info float-right">
                                                        Add Broadcast &nbsp; <i className="fas fa-plus"></i>

                                                    </Link>
                                                    :
                                                    <Link to={`/notification/create/notification/` + this.props.projectId} className="btn btn-xs btn-info float-right">
                                                        Add Broadcast &nbsp; <i className="fas fa-plus"></i>
                                                    </Link>
                                                : ""}
                                        </h4>
                                    </div>
                                </div>
                              
                             
                            </div>
                        
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-7 contentWrapper">
                                {/* <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button> */}
                                <div className="scroll">
                                    {notificationList}
                                </div>
                            </div>
                         </div>   
                           
                    </React.Fragment>}
            </div>
        )
    }
}