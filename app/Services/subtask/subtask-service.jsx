import {serviceHost } from '../../common/const';
import ServiceRequest from  '../../utils/service-request';

export const toggleSubTask = async(subTask, taskId, projectId) => {
    try {
        let data={subTask:subTask,taskId:taskId,projectId:projectId};
        let subtasks =await ServiceRequest('post','json',serviceHost + `/subTasks/update/`,data);
        return {subtasks, subtaskserr: null};
    }
    catch(err)  {
        if (err) {
           return {subtasks: null, subtaskserr: err};
       }
    };
}
export const toggleCompleted = async(subTask, taskId, projectId) => {
    let data = {subTask, taskId,projectId}
    try {
        let subtasks =await ServiceRequest('post','json',serviceHost + `/subTasks/subtaskComplete/`,data);
        return {subtasks, subtaskserr: null};
    }
    catch(err)  {
        if (err) {
           return {subtasks: null, subtaskserr: err};
       }
    };
}

export const addSubTask = async(subTask, projectId, taskTitle) => {
    try {
        let data = {subTask, taskTitle}
        let subtasks =await ServiceRequest('post','json',serviceHost + `/subTasks/create/` + projectId,data);
        return {subtasks, subtaskserr: null};
    }
    catch(err)  {
        if (err) {
           return {subtasks: null, subtaskserr: err};
       }
    };
}

export const getAllSubTasks = async(projectId)=>{
    try {
        let subTasks =await ServiceRequest('get','json',serviceHost + `/subTasks/task/${projectId}`);
        return {subTasks,subtaskErr:null};
    }
    catch(err)  {
        if (err) {
                return {subTasks:null,subtaskErr:err};
        }
      };
}

