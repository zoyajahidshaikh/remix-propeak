import { serviceHost } from '../../common/const';
import ServiceRequest from  '../../utils/service-request';

export const getAllGroups = async() =>{
    try {
        
        let response =await ServiceRequest('get','json',serviceHost + `/groups`);
        return {response,err:null};
    }
    catch(err)  {
        if (err) {
            return {response:null,err};
        }
    };
}

export const addGroup = async(group) => {
    try {
      
        let response =await ServiceRequest('post','json',serviceHost +  `/groups/addGroup`,group);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}

export const editGroup = async(group) => {
    try {
        let response =await ServiceRequest('post','json',serviceHost + `/groups/editGroup`,group);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}

export const deleteGroup = async(group) => {
    try {
       
        let response =await ServiceRequest('post','json',serviceHost + `/groups/deleteGroup`,group);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}