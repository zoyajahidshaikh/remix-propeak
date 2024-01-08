import {
    serviceHost
} from '../../common/const';
import ServiceRequest from '../../utils/service-request';

export const getAllUserRoles = async () => {
    try {
        let response = await ServiceRequest('get', 'json', serviceHost + '/userRoles');
        return {
            response,
            err: null
        };
    } catch (err) {
        if (err) {
            return {
                response: null,
                err
            };
        }
    };
}

export const getAllUsers = async () => {
    try {
        let response = await ServiceRequest('get', 'json', serviceHost + '/users');
        return {
            response,
            err: null
        };
    } catch (err) {
        if (err) {
            return {
                response: null,
                err
            };
        }
    };
}

export const getUser = async (id) => {
    try {
        let response = await ServiceRequest('get', 'json', serviceHost + '/users' + id);
        return {
            response,
            err: null
        };
    } catch (err) {
        if (err) {
            return {
                response: null,
                err
            };
        }
    };
}


export const updateUser = async (user) => {
    try {
        let response = await ServiceRequest('post', 'json', serviceHost + `/users/editUser`, user);
        return {
            response,
            err: null
        };
    } catch (err) {
        if (err) {
            return {
                response: null,
                err
            };
        }
    };
}

export const addUser = async (user) => {
    try {
        let response = await ServiceRequest('post', 'json', serviceHost + `/users/addUser`, user);
        return {
            response,
            err: null
        };
    } catch (err) {
        if (err) {
            return {
                response: null,
                err
            };
        }
    };
}

export const deleteUser = async (id) => {
    try {
        let data = {
            id
        }
        let response = await ServiceRequest('post', 'json', serviceHost + `/users/deleteUser`, data);
        return {
            response,
            err: null
        };
    } catch (err) {
        if (err) {
            return {
                response: null,
                err
            };
        }
    };
}

export const getProfilePicture = async (userId) => {
    try {
        let data = {
            userId
        }
        let response = await ServiceRequest('post', 'json', serviceHost + `/users/getProfilePicture`, data);
        return {
            response,
            err: null
        };
    } catch (err) {
        if (err) {
            return {
                response: null,
                err
            };
        }
    };
}