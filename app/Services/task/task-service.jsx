import {serviceHost } from '../../common/const';
import ServiceRequest from  '../../utils/service-request';

export const editTask = async(task, id, email, projectName, ownerEmail, userName,depTaskTitle) => {
    try {
        let data = { task, userName, depTaskTitle, email, projectName, ownerEmail, id}
        // console.log("data editTask",data);
        let tasks =await ServiceRequest('post','json',serviceHost + `/tasks/updateTask`,data);
        return {tasks, taskErr: null};
    }
    catch(err) {
        if (err) {
            return {tasks: null, taskErr: err};
        }
    };
}

export const addTask = async(task, email, userName,projectName,depTaskTitle,multiUsers) => {
    try {
        let data = { task, email, userName, projectName, depTaskTitle,multiUsers}
        // console.log("data addTask",data);
        let tasks =await ServiceRequest('post','json',serviceHost +`/tasks/addTask`,data);
        return {tasks, taskErr: null};
    }
    catch(err) {
        if (err) {
            return {tasks: null, taskErr: err};
        }
    }
}

export const toggleEditTask = async(task,projectId) => {
    try {
        
        let data= {task:task,projectId:projectId}
        // console.log("data toggleEditTask",data);
        let tasks =await ServiceRequest('post','json',serviceHost + `/tasks/updateSubTasks`,data);
        return {tasks, taskErr: null};
    }
    catch(err) {
        if (err) {
            return {tasks: null, taskErr: err};
        }
    }
}

export const updateTasksSequence = async(taskList,projectId) => {
    try {
        let  data= {tasks:taskList,projectId:projectId};
        // console.log("data updateTasksSequence",data);
        let tasks =await ServiceRequest('post','json',serviceHost + `/tasks/updateSequence`,data);
        return {tasks, taskErr: null};
    }
    catch(err) {
        if (err) {
            return {tasks: null, taskErr: err};
        }
    }
}

export const getAllTaskTypes = async()=>{
    try {
        let tasks =await ServiceRequest('get','json',serviceHost + '/taskTypes');
        return {tasks,taskErr:null};
    }
    catch(err)  {
        if (err) {
                return {tasks:null,taskErr:err};
        }
      };
}

export const getAllTasks = async()=>{
    try {
        let tasks =await ServiceRequest('get','json',serviceHost + '/tasks');
        return {tasks,taskErr:null};
    }
    catch(err)  {
        if (err) {
                return {tasks:null,taskErr:err};
        }
      };
}

export const getProjectTasks = async(projectId)=>{
    try {
        let tasks =await ServiceRequest('get','json',serviceHost + `/tasks/projecttasks/${projectId}`);
        return {tasks,taskErr:null};
    }
    catch(err)  {
        if (err) {
                return {tasks:null,taskErr:err};
        }
      };
}

export const getTaskPriorities = async()=>{
    try {
        let tasks =await ServiceRequest('get','json',serviceHost + '/tasks/taskpriorities');
        return {tasks,taskErr:null};
    }
    catch(err)  {
        if (err) {
            return {tasks:null,tasksErr:err};
    }
      };
}
export const getDashboardData = async(projectId,flag,showArchive)=>{
    try {
        let data={projectId:projectId,flag:flag, showArchive:showArchive}
        let tasks =await ServiceRequest('post','json',serviceHost + '/tasks/getDashboardData',data);
        return {tasks,tasksErr:null};
    }
    catch(err)  {
        if (err) {
                return {tasks:null,tasksErr:err};
        }
    };
}


// export const getTodaysTasks = async(projectId)=>{
//     try {
//         let data={projectId}
//         let tasks =await ServiceRequest('post','json',serviceHost + '/tasks/todaystasks',data);
//         return {tasks,tasksErr:null};
//     }
//     catch(err)  {
//         if (err) {
//                 return {tasks:null,tasksErr:err};
//         }
//     };
// }

// export const getTodaysTasksChartData = async (projectId) => {
//     try {
//         let data={ projectId}
//         let tasks = await ServiceRequest('post', 'json', serviceHost + '/tasks/todaysTasksChartData', data);
//         return { tasks, tasksErr: null };
//     }
//     catch (err) {
//         if (err) {
//             return { tasks: null, tasksErr: err };
//         }
//     };
// }


// export const getUserProductivityData = async (userId) => {
//     try {
//         let data={userId}
//         let tasks = await ServiceRequest('post', 'json', serviceHost + '/tasks/getUserProductivity',data);
//         return { tasks, tasksErr: null };
//     }
//     catch (err) {
//         if (err) {
//             return { tasks: null, tasksErr: err };
//         }
//     };
// }

