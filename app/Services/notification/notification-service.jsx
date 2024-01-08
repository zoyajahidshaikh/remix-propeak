import {serviceHost } from '../../common/const';
import ServiceRequest from  '../../utils/service-request';

export const getAllNotification = async(projectId) =>{
    try {
       
        let response =await ServiceRequest('get','json',serviceHost + `/notifications/notification/`+ projectId);
        return {response,err:null};
    }
    catch(err)  {
        if (err) {
                return {response:null,err};
        }
      };
}

export const addNotification = async(notification,projectId) => {
    try {
       
        let data ={notification,projectId}
        let response =await ServiceRequest('post','json',serviceHost + '/notifications/addNotification',data);
      
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}

export const editNotification = async(notification) => {
    try {
       

        let response =await ServiceRequest('post','json',serviceHost + `/notifications/editNotification`,notification);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}

export const deleteNotification = async(notification) => {
    try {
       
        let response =await ServiceRequest('post','json',serviceHost + `/notifications/deleteNotification`,notification);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}

export const getNotificationById = async(notificationId ) => {
 
    try {
        
        let response =await ServiceRequest('get','json',serviceHost + '/notifications/' + notificationId);
        return {response,err:null};
    }
    catch(err)  {
        if (err) {
                return {response:null,err};
        }
    };
}


export const getAllUnHideNotification = async() =>{
    try {
        let response =await ServiceRequest('get','json',serviceHost + `/notifications/getunhidenotifications/getdata`);
        return {response,err:null};
    }
    catch(err)  {
        if (err) {
                return {response:null,err};
        }
      };
}

export const addHideNotification = async(notificationId,userId) => {
    try {
       
         let notification={notificationId:notificationId,userId:userId}
        let response =await ServiceRequest('post','json',serviceHost + '/notifications/createhidenotification',notification);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}