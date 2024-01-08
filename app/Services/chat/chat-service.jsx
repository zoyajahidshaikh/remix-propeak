import { serviceHost } from "../../common/const";
import ServiceRequest from "../../utils/service-request";

export const addSubject = async (subjectTitle, projectId) => {
  try {
    // axios.defaults.headers.common[TOKEN_KEY] = Auth.getToken(TOKEN_KEY);
    // let response = await axios({
    //         method: 'post',
    //         responseType: 'json',
    //         url: serviceHost + `/subjects`,
    //         data: {subjectTitle:subjectTitle, projectId: projectId}
    //     });
    let data = { subjectTitle: subjectTitle, projectId: projectId };
    let response = await ServiceRequest(
      "post",
      "json",
      serviceHost + `/subjects`,
      data
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};

export const getAllSubjects = async () => {
  try {
    // axios.defaults.headers.common[TOKEN_KEY] = Auth.getToken(TOKEN_KEY);
    // let response = await axios({
    //         method: 'get',
    //         responseType: 'json',
    //         url: serviceHost + `/subjects`
    //     });
    let response = await ServiceRequest(
      "get",
      "json",
      serviceHost + `/subjects`
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};

export const getProjectSubjects = async (projectId) => {
  try {
    // axios.defaults.headers.common[TOKEN_KEY] = Auth.getToken(TOKEN_KEY);
    // let response = await axios({
    //         method: 'get',
    //         responseType: 'json',
    //         url: serviceHost + `/subjects/project/${projectId}`
    //     });
    let response = await ServiceRequest(
      "get",
      "json",
      serviceHost + `/subjects/project/${projectId}`
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};

export const deleteSubject = async (subjectId) => {
  try {
    let data = { subjectId: subjectId };
    let response = await ServiceRequest(
      "post",
      "json",
      serviceHost + `/subjects/delete`,
      data
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};

export const editSubject = async (subjectId, subjectTitle) => {
  try {
    // axios.defaults.headers.common[TOKEN_KEY] = Auth.getToken(TOKEN_KEY);
    // var response = await axios ({
    //     method: 'post',
    //     responseType: 'json',
    //     url: serviceHost + `/subjects/edit`,
    //
    // });
    let data = { subjectId: subjectId, subjectTitle: subjectTitle };
    let response = await ServiceRequest(
      "post",
      "json",
      serviceHost + `/subjects/edit`,
      data
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};

export const addDiscussionMessage = async (title, subjectId, messageId) => {
  try {
    // axios.defaults.headers.common[TOKEN_KEY] = Auth.getToken(TOKEN_KEY);
    // let response = await axios({
    //         method: 'post',
    //         responseType: 'json',
    //         url: serviceHost + `/subjects/addMessage`,
    //         data: { title:title, subjectId: subjectId, messageId:messageId }
    //     });
    let data = { title: title, subjectId: subjectId, messageId: messageId };
    let response = await ServiceRequest(
      "post",
      "json",
      serviceHost + `/subjects/addMessage`,
      data
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};

export const getAllDiscussionMessages = async (subjectId) => {
  try {
    // axios.defaults.headers.common[TOKEN_KEY] = Auth.getToken(TOKEN_KEY);
    // let response = await axios({
    //         method: 'get',
    //         responseType: 'json',
    //         url: serviceHost + `/subjects/messages/${subjectId}`,
    //     });
    let response = await ServiceRequest(
      "get",
      "json",
      serviceHost + `/subjects/messages/${subjectId}`
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};

export const deleteDiscussionMessage = async (messageId, subjectId) => {
  try {
    // axios.defaults.headers.common[TOKEN_KEY] = Auth.getToken(TOKEN_KEY);
    // let response = await axios({
    //         method: 'post',
    //         responseType: 'json',
    //         url: serviceHost + `/subjects/deleteMessage`,
    //         data: {messageId: messageId, subjectId: subjectId}
    //     });
    let data = { messageId: messageId, subjectId: subjectId };
    let response = await ServiceRequest(
      "post",
      "json",
      serviceHost + `/subjects/deleteMessage`,
      data
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};
