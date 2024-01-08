import { serviceHost } from '../../../common/const';
import ServiceRequest from  '../../../utils/service-request';

export const forgotPassword = async (email) => {
    try {
        let response =await ServiceRequest('get','json',serviceHost + `/login/forgotPassword/` + email);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    }
};

export const login = async (user) => {
    try {
        let response =await ServiceRequest('post','json',serviceHost + '/login/login',user);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    }

};

export const logout = () => {
    try {
        ServiceRequest('post','json',serviceHost + '/login/logout');
    }
    catch (err) {
        
    }
};

export const changePassword = async(change,id) => {
    try {
        let response =await ServiceRequest('post','json',serviceHost + '/login/changePassword/'+id,change);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    };
}

export  const resetPassword = async(reset) => {
    try {
        let response =await ServiceRequest('post','json',serviceHost + `/login/resetPass`,reset);
        return {response, err: null};
    }
    catch(err) {
        if (err) {
            return {response: null, err};
        }
    };
}