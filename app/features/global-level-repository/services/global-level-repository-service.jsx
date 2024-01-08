import { serviceHost } from '../../../common/const';
import ServiceRequest from '../../../utils/service-request';

export const postFile = async (formData) => {
    try {
        let response = await ServiceRequest('post', 'json', serviceHost + `/globalLevelRepository/add`, formData);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}

export const getAllRepositoryFile = async (pathData) => {

    let data={pathData}
    try {

        let response = await ServiceRequest('post', 'json', serviceHost + `/globalLevelRepository/getAllFile/`, data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}

export const deleteFile = async (obj) => {
    try {
        let response = await ServiceRequest('post', 'json', serviceHost + `/globalLevelRepository/delete`, obj);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}

export const downloadFile = async (path, filename) => {
    try {
        let data = { filename, path }
        let response = await ServiceRequest('post', 'blob', serviceHost + `/globalLevelRepository/download`, data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}


export const getRepositoryFile = async (fileId) => {
    try {
        let response = await ServiceRequest('get', 'json', serviceHost + `/globalLevelRepository/` + fileId);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}


export const editRepositoryFile = async (formData) => {
    try {
        let response = await ServiceRequest('post', 'json', serviceHost + `/globalLevelRepository/edit`, formData);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}


export const createFolder = async (folderPath) => {
    try {
        let data = { folderPath}
        let response = await ServiceRequest('post', 'json', serviceHost + `/globalLevelRepository/createFolder`, data );
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}