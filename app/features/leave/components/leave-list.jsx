import React, { Component } from "react";
import DataTable from "../../../Components/datatable";
import config from "../../../common/config";
import { Link } from "react-router-dom";
//import axios from 'axios';
import * as leaveApplicationService from "../../../Services/leave-service/leave-service";
import Auth from "../../../utils/auth";
import FullCalendar from "fullcalendar-reactwrapper";
import "./leave.css";

class LeaveList extends Component {
  constructor(props) {
    super(props);
    this.onSelectViewChange = this.onSelectViewChange.bind(this);
    this.state = {
      leaveApplication: {},
      isLoaded: false,
      leaveDetails: {},
      leaveId: this.props.leaveId,
      errorMessage: "",
      successMessage: "",
      checked: "",

      appliedLeaveheaders: [
        { title: "Leave Title", accessor: "leaveType", index: 1 },
        { title: "From Date", accessor: "fromDate", index: 2 },
        { title: "To Date", accessor: "toDate", index: 3 },
        { title: "Duration", accessor: "workingDays", index: 4 },
        { title: "Application Date", accessor: "createdOn", index: 5 },
        { title: "Status", accessor: "status", index: 6 },
        {
          title: "Action",
          index: 7,
          cell: (row) => {
            // let url = "/projects/" + row.userId;
            // let l;
            if (row.status === "pending" || row.status === "rejected") {
              let url = "/leave-edit/" + row.leaveId;
              return (
                <div>
                  <Link className="btn btn-xs btn-outline-info" to={url}>
                    <i className="fas fa-pencil-alt"></i>
                  </Link>
                  <span>&nbsp;</span>
                  {/* <Link to="#" ><i className="fas fa-trash"></i></Link> */}
                  <span
                    className="btn btn-xs btn-outline-danger mr-1"
                    title="Delete"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you wish to delete this entry?"
                        )
                      )
                        this.onDeleteListId(row.leaveId);
                    }}
                  >
                    <i className="far fa-trash-alt"></i>
                  </span>

                  <span>&nbsp;</span>
                  {Auth.get("userRole") === "admin" ? (
                    <span
                      className="btn btn-xs btn-outline-success mr-1"
                      title="Approve"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you wish to Approve this entry?"
                          )
                        )
                          this.onApproveListId(row.leaveId);
                      }}
                    >
                      <i className="far fa-trash-alt"></i>
                    </span>
                  ) : (
                    ""
                  )}

                  {/* <span>&nbsp;</span> */}
                  {Auth.get("userRole") === "admin" ? (
                    <span
                      className="btn btn-xs btn-outline-dark mr-1"
                      title="Reject"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you wish to reject this entry?"
                          )
                        )
                          this.onRejectListId(row.leaveId);
                      }}
                    >
                      <i className="far fa-trash-alt"></i>
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              );
            } else {
              let url = "/leave-details/" + row.leaveId;
              return (
                <div>
                  {Auth.get("userRole") !== "support" ? (
                    <span title="Details">
                      <Link className="btn btn-xs btn-outline-warning" to={url}>
                        <i
                          className="far fa-file"
                          style={{ fontSize: "10px" }}
                        ></i>
                      </Link>
                    </span>
                  ) : (
                    ""
                  )}
                  <span>&nbsp;</span>
                  {/* <Link to="#" ><i className="fas fa-trash"></i></Link> */}
                  {Auth.get("userRole") !== "support" ? (
                    <span
                      className="btn btn-xs btn-outline-danger"
                      title="Delete"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you wish to delete this entry?"
                          )
                        )
                          this.onDeleteListId(row.leaveId);
                      }}
                    >
                      <i className="far fa-trash-alt"></i>
                    </span>
                  ) : (
                    ""
                  )}

                  <span>&nbsp;</span>
                  {Auth.get("userRole") === "admin" ? (
                    <span
                      className="btn btn-xs btn-outline-success mr-1"
                      title="Approve"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you wish to Approve this entry?"
                          )
                        )
                          this.onApproveListId(row.leaveId);
                      }}
                    >
                      <i className="far fa-check-square"></i>
                    </span>
                  ) : (
                    ""
                  )}
                  {/* <span>&nbsp;</span> */}

                  {Auth.get("userRole") === "admin" ? (
                    <span
                      className="btn btn-xs btn-outline-dark mr-1"
                      title="Reject"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you wish to Reject this entry?"
                          )
                        )
                          this.onRejectListId(row.leaveId);
                      }}
                    >
                      <i className="far fa-ban"></i>
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              );
            }
          },
        },
      ],
      userAppliedLeaveheaders: [
        { title: "Leaves Applied Reportees", accessor: "userName", index: 1 },
        { title: "Leave Title", accessor: "leaveType", index: 2 },
        { title: "From Date", accessor: "fromDate", index: 3 },
        { title: "To Date", accessor: "toDate", index: 4 },
        { title: "Duration", accessor: "workingDays", index: 5 },
        { title: "Application Date", accessor: "createdOn", index: 6 },
        { title: "Status", accessor: "status", index: 7 },
        {
          title: "Actions",
          index: 8,
          cell: (row) => {
            let url = "/leave-details/" + row.leaveId;
            return (
              <div>
                {Auth.get("userRole") !== "support" ? (
                  <Link className="btn btn-xs btn-outline-warning" to={url}>
                    <i className="far fa-file"></i>
                  </Link>
                ) : (
                  ""
                )}
                <span>&nbsp;</span>
                {/* <Link to="#" ><i className="fas fa-trash"></i></Link> */}
                {Auth.get("userRole") !== "support" ? (
                  <a
                    className="btn btn-xs btn-outline-danger"
                    title="Delete"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you wish to delete this entry?"
                        )
                      )
                        this.onDeleteListId(row.leaveId);
                    }}
                  >
                    <i className="far fa-trash-alt "></i>
                  </a>
                ) : (
                  ""
                )}

                <span>&nbsp;</span>
                {Auth.get("userRole") === "admin" ? (
                  <a
                    className="btn btn-xs btn-outline-success mr-1"
                    title="Approve"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you wish to Approve this entry?"
                        )
                      )
                        this.onApproveListId(row.leaveId);
                    }}
                  >
                    <i className="far fa-trash-alt"></i>
                  </a>
                ) : (
                  ""
                )}

                <span>&nbsp;</span>
                {Auth.get("userRole") === "admin" ? (
                  <a
                    className="btn btn-xs btn-outline-dark mr-1"
                    title="Reject"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you wish to Reject this entry?"
                        )
                      )
                        this.onRejectListId(row.leaveId);
                    }}
                  >
                    <i className="far fa-trash-alt"></i>
                  </a>
                ) : (
                  ""
                )}
              </div>
            );
          },
        },
      ],
      appliedLeave: [],
      appliedLeaveByUsers: [],
      allappliedleave: [],
      calendarData: [],
      selectedView: "DatatableView",
    };
  }
  async onDeleteListId(leaveId) {
    await leaveApplicationService.deleteLeave(leaveId);
    let appliedLeave =
      this.state.appliedLeave.length > 0 &&
      this.state.appliedLeave.filter((al) => {
        return al.leaveId !== leaveId;
      });

    let appliedLeaveByUsers =
      this.state.appliedLeaveByUsers.length > 0 &&
      this.state.appliedLeaveByUsers.filter((al) => {
        return al.leaveId !== leaveId;
      });
    this.setState({
      appliedLeave: appliedLeave,
      appliedLeaveByUsers: appliedLeaveByUsers,
    });
  }

  async onRejectListId(leaveId) {
    await this.getDetails(leaveId, "rejected");

    let leaveApprovedReject = {
      approvedRejected: this.state.acceptReject,
      leaveId: leaveId,
      reasonRejection: this.state.reason,
      modifiedBy: Auth.get("userId"),
      modifiedOn: new Date(),
      toEmail: this.state.leaveDetails.fromEmail,
      leaveWithoutApproval: this.state.leaveDetails.leaveWithoutApproval,
    };

    await this.postApproveReject(leaveApprovedReject);

    for (let i = 0; i < this.state.appliedLeave.length; i++) {
      if (this.state.appliedLeave[i].leaveId == leaveId) {
        this.state.appliedLeave[i].status = "Rejected";
      }
    }

    for (let i = 0; i < this.state.appliedLeaveByUsers.length; i++) {
      if (this.state.appliedLeaveByUsers[i].leaveId == leaveId) {
        this.state.appliedLeaveByUsers[i].status = "Rejected";
      }
    }

    this.setState({
      appliedLeave: this.state.appliedLeave,
      appliedLeaveByUsers: this.state.appliedLeaveByUsers,
    });
  }

  async onApproveListId(leaveId) {
    await this.getDetails(leaveId, "approved");

    let leaveApprovedReject = {
      approvedRejected: this.state.acceptReject,
      leaveId: leaveId,
      reasonRejection: this.state.reason,
      modifiedBy: Auth.get("userId"),
      modifiedOn: new Date(),
      toEmail: this.state.leaveDetails.fromEmail,
      leaveWithoutApproval: this.state.leaveDetails.leaveWithoutApproval,
    };

    await this.postApproveReject(leaveApprovedReject);

    for (let i = 0; i < this.state.appliedLeave.length; i++) {
      if (this.state.appliedLeave[i].leaveId == leaveId) {
        this.state.appliedLeave[i].status = "Approved";
      }
    }

    for (let i = 0; i < this.state.appliedLeaveByUsers.length; i++) {
      if (this.state.appliedLeaveByUsers[i].leaveId == leaveId) {
        this.state.appliedLeaveByUsers[i].status = "Approved";
      }
    }

    this.setState({
      appliedLeave: this.state.appliedLeave,
      appliedLeaveByUsers: this.state.appliedLeaveByUsers,
    });
  }

  async getDetails(leaveId, approverejected) {
    let { response, err } = await leaveApplicationService.getDetails(leaveId);
    this.setState({
      isLoaded: true,
    });

    if (err) {
      this.setState({
        isLoaded: false,
      });
    } else if (response && response.data.err) {
      this.setState({
        isLoaded: false,
      });
    } else {
      //console.log("response.data.leaveDetails",response.data.leaveDetails)
      if (approverejected === "rejected") {
        response.data.leaveDetails.status = "rejected";
      } else {
        response.data.leaveDetails.status = "approved";
      }
      this.setState({
        isLoaded: false,
        leaveDetails: response.data.leaveDetails,
        acceptReject: response.data.leaveDetails.status,
        reason: response.data.leaveDetails.rejectionReason,
      });
    }
  }

  async postApproveReject(leaveApprovedReject) {
    let { response, err } = await leaveApplicationService.ApprovedReject(
      leaveApprovedReject
    );
    if (err) {
      this.setState({
        ...this.state,
        errorMessage: err,
      });
    } else if (response && response.data.err) {
      this.setState({
        ...this.state,
        errorMessage: response.data.err,
      });
    } else {
      this.setState({
        successMessage: response.data.message,
      });
    }
  }
  componentDidMount() {
    this.setAppliedLeaves("applied");
    if (this.state.calendarData.length === 0) {
      this.getAllLeavesForCalendar();
    }
    if (!this.state.appliedLeave) {
      this.setState({ appliedLeave: [] });
    }
    if (!this.state.appliedLeaveByUsers) {
      this.setState({ appliedLeaveByUsers: [] });
    }
  }
  //   componentDidMount() {
  //     // if (this.state.appliedLeave.length === 0 && this.state.appliedLeaveByUsers.length === 0) {
  //     this.setAppliedLeaves("applied");
  //     // }
  //     if (this.state.calendarData.length === 0) {
  //       this.getAllLeavesForCalendar();
  //     }
  //   }

  async getAllLeavesForCalendar() {
    let { response, err } =
      await leaveApplicationService.getAllLeavesForCalendar();
    this.setState({
      isLoaded: true,
    });

    if (err) {
      this.setState({
        isLoaded: false,
      });
    } else if (response && response.data.err) {
      this.setState({
        isLoaded: false,
      });
    } else {
      if (response.data.result.length > 0) {
        this.setState({
          isLoaded: false,
          calendarData: response.data.result,
        });
      }
    }
  }
  async setAppliedLeaves(flag) {
    let { response, err } = await leaveApplicationService.getAllAppliedLeaves(
      flag
    );

    if (err) {
      this.setState({
        isLoaded: false,
      });
    } else if (response && response.data.err) {
      this.setState({
        isLoaded: false,
      });
    } else {
      let role = Auth.get("userRole");
      if (role === "user") {
        if (response.data && response.data.appliedLeaves.length > 0) {
          this.setState({
            appliedLeave: response.data.appliedLeaves,
            isLoaded: false,
          });
        }
      } else {
        if (response.data) {
          this.setState({
            appliedLeave: response.data.appliedLeaves,
            appliedLeaveByUsers: response.data.userAppliedLeaves,
            isLoaded: false,
          });
        }
      }
    }
  }
  async getAllAppliedLeavesforAdmin() {
    let { response, err } =
      await leaveApplicationService.getAllAppliedLeavesforAdmin();

    if (err) {
      this.setState({
        isLoaded: false,
      });
    } else if (response && response.data.err) {
      this.setState({
        isLoaded: false,
      });
    } else {
      // console.log("getAllAppliedLeavesforAdmin", response.data);
      if (response.data) {
        this.setState({
          appliedLeaveByUsers: response.data,
          appliedLeave: [],
          isLoaded: false,
        });
      }
    }
  }
  onSelectViewChange(e) {
    let selectedView = e.target.value;
    this.setState({
      selectedView: selectedView,
    });
  }

  render() {
    //console.log("this.state.leaveDetails",this.state.leaveDetails);
    let viewList = window.propeakConfigData.calenderViews.map((module, i) => {
      return (
        <option value={module.id} key={module.id}>
          {module.desc}
        </option>
      );
    });
    // console.log("appliedLeaveByUsers", this.state.appliedLeaveByUsers);
    const dataTable = (
      <DataTable
        className="data-table"
        title=""
        keyField="_id"
        pagination={{
          enabled: true,
          pageLength: 50,
          type: "long",
        }}
        width="100%"
        headers={
          this.state.appliedLeave.length > 0
            ? this.state.appliedLeaveheaders
            : this.state.userAppliedLeaveheaders
        }
        data={
          this.state.appliedLeave.length > 0
            ? this.state.appliedLeave
            : this.state.appliedLeaveByUsers.length > 0
            ? this.state.appliedLeaveByUsers
            : []
        }
        hightlightRow={this.state.hightlightRow}
        noData="No records!"
        show={config.Export}
      />
    );

    return (
      <React.Fragment>
        <div className="container bg-white">
          {this.state.isLoaded ? (
            <div className="logo">
              <img src="/images/loading.svg" alt="loading" />
            </div>
          ) : (
            <div>
              <div className="row">
                <div className="col">
                  <h4 className="project-total mt-2">
                    Leaves &nbsp;
                    {Auth.get("userRole") !== "support" ? (
                      <span title="apply leave">
                        <Link
                          to={"/leave/create"}
                          className="links "
                          style={{
                            lineHeight: "1.3em",
                            color: "rgb(255, 152, 0)",
                            fontSize: "20px",
                          }}
                        >
                          <i className="fas fa-plus"></i>
                        </Link>
                      </span>
                    ) : (
                      ""
                    )}
                  </h4>
                </div>
              </div>

              <div className="row">
                {this.state.selectedView === "calendarView" ? (
                  <div className="col-sm-10"></div>
                ) : (
                  <div className="col-sm-10">
                    <nav>
                      <div
                        className="nav nav-tabs nav-fill"
                        id="pills-tab"
                        role="tablist"
                      >
                        <a
                          onClick={this.setAppliedLeaves.bind(this, "applied")}
                          className="nav-link active"
                          id="applied-tab"
                          data-toggle="pill"
                          href="#applied"
                          role="tab"
                          aria-controls="applied"
                          aria-selected="true"
                        >
                          Applied Leaves
                        </a>
                        {Auth.get("userRole") !== "user" ? (
                          <a
                            onClick={this.setAppliedLeaves.bind(
                              this,
                              "pending"
                            )}
                            className="nav-link"
                            id="pending-tab"
                            data-toggle="pill"
                            href="#pending"
                            role="tab"
                            aria-controls="pending"
                            aria-selected="false"
                          >
                            Pending Leaves
                          </a>
                        ) : (
                          ""
                        )}
                        {Auth.get("userRole") !== "user" ? (
                          <a
                            onClick={this.setAppliedLeaves.bind(this, "all")}
                            className="nav-link"
                            id="all-leaves-tab"
                            data-toggle="pill"
                            href="#all-leaves"
                            role="tab"
                            aria-controls="all-leaves"
                            aria-selected="false"
                          >
                            Leaves Applied By Users
                          </a>
                        ) : (
                          ""
                        )}
                        {Auth.get("userRole") === "admin" ||
                        Auth.get("userRole") === "support" ? (
                          <a
                            onClick={this.getAllAppliedLeavesforAdmin.bind(
                              this
                            )}
                            className="nav-link"
                            id="all-user-leaves-tab"
                            data-toggle="pill"
                            href="#all-user-leaves"
                            role="tab"
                            aria-controls="all-leaves"
                            aria-selected="false"
                          >
                            All Leaves Applied By Users
                          </a>
                        ) : (
                          ""
                        )}
                      </div>
                    </nav>
                  </div>
                )}
                <div className="col-sm-2">
                  <div className="float-right">
                    <div className="input-group input-group-sm ">
                      <div className="input-group-prepend">
                        <span
                          className="input-group-text rounded-0"
                          id="inputGroup-sizing-sm"
                        >
                          <i className="far fa-eye"></i>
                        </span>
                      </div>
                      <select
                        style={{ fontSize: "11px" }}
                        className="form-control"
                        onChange={this.onSelectViewChange}
                        value={this.state.selectedView}
                        placeholder="Select View"
                      >
                        {viewList}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div id="largeCalendar">
                  {this.state.selectedView === "calendarView" ? (
                    <FullCalendar
                      header={{
                        left: "prev,next today myCustomButton",
                        center: "title",
                        right: "month,basicWeek,basicDay",
                      }}
                      defaultDate={new Date()}
                      navLinks={true} // can click day/week names to navigate views
                      editable={true}
                      eventLimit={true} // allow "more" link when too many events
                      events={
                        this.state.calendarData ? this.state.calendarData : []
                      }
                    />
                  ) : (
                    <div className="leave-div">
                      <h3 className="project-title d.inline-block mt-3">
                        Leave Status
                      </h3>
                      <div
                        className="tab-content leave-table"
                        id="pills-tabContent"
                      >
                        <div
                          className="tab-pane fade show active"
                          id="applied"
                          role="tabpanel"
                          aria-labelledby="applied-tab"
                        >
                          {" "}
                          {dataTable}
                        </div>
                        <div
                          className="tab-pane fade"
                          id="pending"
                          role="tabpanel"
                          aria-labelledby="pending-tab"
                        >
                          {dataTable}
                        </div>
                        <div
                          className="tab-pane fade"
                          id="all-leaves"
                          role="tabpanel"
                          aria-labelledby="all-leaves-tab"
                        >
                          {dataTable}
                        </div>
                        <div
                          className="tab-pane fade"
                          id="all-user-leaves"
                          role="tabpanel"
                          aria-labelledby="all-user-leaves-tab"
                        >
                          {dataTable}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}
export default LeaveList;
