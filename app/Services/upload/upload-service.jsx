import {serviceHost } from '../../common/const';
import ServiceRequest from  '../../utils/service-request';

export const getFile = async(taskId) => {
    try {
       
        let response =await ServiceRequest('get','json',serviceHost + `/uploadFiles/${taskId}`);
        return {response, err: null};
    }
    catch (err) {
        if (err) {
            return {response: null, err};
        }
    };
}

export const getFileByProject = async(projectId,taskId) => {
    try {
      
        let response =await ServiceRequest('get','json',serviceHost + `/uploadFiles/project/${projectId}/${taskId}`);
        return {response, err: null};
    }
    catch (err) {
        if (err) {
            return {response: null, err};
        }
    };
}

export const uploadTasksFile = async(file) => {
    try {
       
        let response =await ServiceRequest('post','json',serviceHost + `/uploadFiles/tasksFile`,file);
        return {response, err: null};
    }
    catch (err) {
        if (err) {
            return {response: null, err};
        }
    };
}

export const postFile = async(formData) => {
    try {
        let response =await ServiceRequest('post','json',serviceHost + `/uploadFiles`,formData);
        return {response, err: null};
    }
    catch (err) {
        if (err) {
            return {response: null, err};
        }
    };
}

export const deleteFile = async(obj) => {
    try {
        let response =await ServiceRequest('post','json',serviceHost + `/uploadFiles/delete`,obj);
        return {response, err: null};
    }
    catch (err) {
        if (err) {
            return {response: null, err};
        }
    };
}

export const downloadFile = async(projectId, taskId, filename) => {
    try {
        let response =await ServiceRequest('get','blob',serviceHost + `/uploadFiles/download/${projectId}/${taskId}/${filename}`);
        return {response, err: null};
    }
    catch (err) {
        if (err) {
            return {response: null, err};
        }
    };
}