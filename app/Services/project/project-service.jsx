import { serviceHost } from '../../common/const';
import ServiceRequest from '../../utils/service-request';

export const getProjectAuditLog = async (id) => {
    try {
        let data = { id };
        let response = await ServiceRequest('post', 'json', serviceHost + "/projects/AuditLog", data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}

export const getStatusOptions = async () => {
    try {

        let response = await ServiceRequest('get', 'json', serviceHost + "/projects/statusOptions");
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}

export const getDataByProjectId = async (projectId) => {
    try {

        let response = await ServiceRequest('get', 'json', serviceHost + "/projects/data/" + projectId);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}

export const getProjectDataByProjectId = async (projectId) => {
    try {

        let response = await ServiceRequest('get', 'json', serviceHost + "/projects/tasks/data/" + projectId);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}

export const getProjectTasksAndUsers = async (projectId) => {
    try {

        let projects = await ServiceRequest('get', 'json', serviceHost + '/projects/' + projectId);
        return { projects, projectErr: null };
    }
    catch (err) {
        if (err) {
            return { projects: null, projectErr: err };
        }
    };
}

export const addProject = async (newprojects, userName) => {
    try {
        let data = { newprojects, userName }
        //    console.log("data addProject",data);
        let response = await ServiceRequest('post', 'json', serviceHost + `/projects/addProject`, data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}

export const editProject = async (newprojects, id, userName) => {
    try {
        let data = { newprojects, userName, id }

        let response = await ServiceRequest('post', 'json', serviceHost + `/projects/editProject`, data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}

export const deleteProject = async (id) => {
    try {

        let data = { id: id }
        let response = await ServiceRequest('post', 'json', serviceHost + `/projects/deleteProject`, data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}

export const getAllProjectsSummary = async (userId, userRole,showArchive,projectId) => {
    try {
        let data = { userId, userRole ,showArchive,projectId}

        let projects = await ServiceRequest('post', 'json', serviceHost + `/projects/summary`, data);
        return { projects, projectErr: null };
    }
    catch (err) {
        if (err) {
            return { projects: null, projectErr: err };
        }
    };
}

export const updateProjectField = async (project) => {
    try {

        let response = await ServiceRequest('post', 'json', serviceHost + `/projects/updateField`, project);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err: err };
        }
    };
}

export const updateProjectCategory = async (project) => {
    try {

        let response = await ServiceRequest('post', 'json', serviceHost + `/projects/updateCategory`, project);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err: err };
        }
    };
}


export const favoriteProject = async (projectId, userId) => {
    try {
        let data = { projectId, userId }

        let response = await ServiceRequest('post', 'json', serviceHost + `/favoriteprojects`, data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}

export const getAllFavoriteProjects = async (userId, showArchive) => {
    try {
        let data = { userId,showArchive };

        let projects = await ServiceRequest('post', 'json', serviceHost + `/favoriteprojects/projects`, data);
        return { projects, projectErr: null };
    }
    catch (err) {
        if (err) {
            return { projects: null, projectErr: err };
        }
    };
}

export const updateFavoriteProject = async (projectId) => {
    try {

        let data = { projectId: projectId };
        let response = await ServiceRequest('post', 'json', serviceHost + `/favoriteprojects/updatefavoriteprojects`, data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { projects: null, projectErr: err };
        }
    };
}

export const getProjectData = async (projectId) => {
    try {

        let data = { projectId: projectId };
        let response = await ServiceRequest('post', 'json', serviceHost + `/projects/getData`, data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err: err };
        }
    };
}

export const addProjectUsers = async (projectId, projectUsers) => {
    try {
        let data = { projectId: projectId, projectUsers: projectUsers };
        let response = await ServiceRequest('post', 'json', serviceHost + `/projects/addProjectUsers`, data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err: err };
        }
    };
}

export const getUserProject = async (showArchive) => {
    try {
        let data={showArchive:showArchive}
        let response = await ServiceRequest('post', 'json', serviceHost + `/projects/getUserProject`,data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err: err };
        }
    };
}




export const archiveProject = async (projectId,archive) => {
    try {
        let data = { projectId ,archive}

        let response = await ServiceRequest('post', 'json', serviceHost + `/projects/archiveProject`, data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    };
}


