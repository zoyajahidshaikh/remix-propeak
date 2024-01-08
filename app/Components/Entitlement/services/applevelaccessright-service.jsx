
import { serviceHost } from '../../../common/const';
import ServiceRequest from  '../../../utils/service-request';

export const getAppLevelAccessState = async() => {
    try {
        let response =await ServiceRequest('get','json',serviceHost + '/appLevelAccessRight',"");
        return {accessRightData : response.data, err: null};
      
    }
    catch(err) {
        if (err) {
            return {accessRightData: null, err};
        }
    }
}


export const saveUserAppLevelAccessRight = async(userAccessRights) => {
    try {
     
        let response =await ServiceRequest('post','json',serviceHost + '/appLevelAccessRight/save',userAccessRights);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}

export const getUserAppLevelAccessRights = async(userId) => {
    try {
      
        let data={userId: userId}

        let response =await ServiceRequest('post','json',serviceHost + '/appLevelAccessRight/get',data);
      
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    }
}