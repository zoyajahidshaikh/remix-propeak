import { serviceHost } from "../../common/const";
import ServiceRequest from "../../utils/service-request";

export const getAllLeaves = async () => {
  try {
    let response = await ServiceRequest("get", "json", serviceHost + "/leaves");
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};

export const saveLeaveApplication = async (leaveApplication, userName) => {
  try {
    let data = { leaveApplication, userName };
    let response = await ServiceRequest(
      "post",
      "json",
      serviceHost + "/leaves",
      data
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};
export const getAllAppliedLeaves = async (flag) => {
  try {
    let data = { flag: flag };
    let response = await ServiceRequest(
      "post",
      "json",
      serviceHost + "/leaves/getAllLeaves",
      data
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};
//Details
export const getDetails = async (leaveId) => {
  try {
    let response = await ServiceRequest(
      "get",
      "json",
      serviceHost + "/leaves/getDetails/" + leaveId
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};
//Approved Rejected
export const ApprovedReject = async (leaveApprovedReject) => {
  try {
    let data = leaveApprovedReject;
    let response = await ServiceRequest(
      "post",
      "json",
      serviceHost + "/leaves/approveReject",
      data
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};
//edit request
export const editLeaveApplication = async (leaveApplication) => {
  try {
    let data = leaveApplication;
    let response = await ServiceRequest(
      "post",
      "json",
      serviceHost + "/leaves/editLeave",
      data
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};
//deleteLeave
export const deleteLeave = async (leaveId) => {
  try {
    let data = { leaveId: leaveId };
    let response = await ServiceRequest(
      "post",
      "json",
      serviceHost + "/leaves/deleteLeave",
      data
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};

//approveLeave
export const approveLeave = async (leaveId) => {
  try {
    let data = { leaveId: leaveId };
    let response = await ServiceRequest(
      "post",
      "json",
      serviceHost + "/leaves/approveLeave",
      data
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};

//get holidays for the current month
export const getHolidays = async () => {
  try {
    let response = await ServiceRequest(
      "get",
      "json",
      serviceHost + "/leaves/getHolidays/"
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};

//check for eligiblity
export const checkEligibility = async (leaveApplication) => {
  try {
    let data = leaveApplication;
    let response = await ServiceRequest(
      "post",
      "json",
      serviceHost + "/leaves/checkEligibility/",
      data
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};
//getAllLeavesForCalendar
export const getAllLeavesForCalendar = async () => {
  try {
    let response = await ServiceRequest(
      "get",
      "json",
      serviceHost + "/leaves/getAllLeavesForCalendar/"
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};

export const getAllAppliedLeavesforAdmin = async () => {
  try {
    let response = await ServiceRequest(
      "get",
      "json",
      serviceHost + "/leaves/getAllAppliedLeavesforAdmin/"
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};

export const getUserOnLeaveDetails = async (userId) => {
  try {
    let data = { userId };
    let response = await ServiceRequest(
      "post",
      "json",
      serviceHost + "/leaves/getUserOnLeaveDetails/",
      data
    );
    return { response, err: null };
  } catch (err) {
    if (err) {
      return { response: null, err };
    }
  }
};
