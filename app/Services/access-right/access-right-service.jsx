import {serviceHost } from '../../common/const';
import ServiceRequest from  '../../utils/service-request';

export const saveUserAccessRight = async(userAccessRights) => {
    try {
      
        let response =await ServiceRequest('post','json',serviceHost + '/accessRights',userAccessRights);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}

export const getUserAccessRights = async(projectId, userId) => {
    try {
       
        let data={projectId: projectId, userId: userId}

        let response =await ServiceRequest('post','json',serviceHost + '/accessRights/get',data);
      
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}