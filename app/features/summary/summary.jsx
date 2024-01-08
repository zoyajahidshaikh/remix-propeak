import React, { Component } from "react";
import Auth from "../../utils/auth";
import "./summary.css";
import { Link } from "react-router-dom";
import DataTable from '../../Components/datatable';
import * as taskService from "../../Services/task/task-service";
import * as dateUtil from "../../utils/date-util";
import config from "../../common/config";
import {PieChart,Pie,Legend, Tooltip,Cell,ResponsiveContainer,} from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default class Summary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      chartData: [],
      userProductivityData: [],
      overDueData: [],
      todayData: 0,
      colors: {
        New: "#5feae4",
        Running: "#ffff00",
        Completed: "#4bef41",
        OnHold: "#adafa7fc",
        Overdue: "#ea2b2b",
        FutureTask: "#136ec8",
      },
      
      projectData: [],
      isLoaded: true,
      headers: [
        {
          title: "Project Title",
          accessor: "projectTitle",
          index: 0,
          cell: (row) => {
            let url = `/project/tasks/${row.projectId}`;
            return <Link to={url}>{row.projectTitle} </Link>;
          },
        },
        {
          title: "User Name",
          accessor: "userName",
          index: 1,
          cell: (row) => {
            let url = `/userPerformanceReports/${row.userId}`;
            return <Link to={url}>{row.userName} </Link>;
          },
        },
        { title: "Task Title", accessor: "title", index: 2 },
        { title: "Start Date", accessor: "startDate", index: 3 },
        { title: "End Date", accessor: "endDate", index: 4 },
      ],
      hightlightRow: {
        accessor: "status",
        className: "errorRow",
      },
      hiddenProjectId: "",
      totalProjects: [],
      flag: "duetoday",
      projectStatus: null,
      totalProjectUsers: null,
      showArchive: null,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.reset = this.reset.bind(this);
    this.submit = this.submit.bind(this);
  }
  async handleInputChange(e) {
    const target = e.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      ...this.state,
      [name]: value,
    });
    if (e.target.value === "") {
      await this.setState({
        hiddenProjectId: "",
      });
      this.getDashboardData(this.state.flag, this.state.showArchive);
      this.props.context.actions.getAllProjectsSummary();
    }
  }

  async reset(e) {
    if (e) {
      e.preventDefault();
    }
    await this.setState({
      hiddenProjectId: "",
    });
    this.getDashboardData(this.state.flag, this.state.showArchive);
    this.props.context.actions.getAllProjectsSummary();
  }

  async submit(e) {
    if (e) {
      e.preventDefault();
    }
    await this.getDashboardData(this.state.flag, this.state.showArchive);
    let project = this.state.projectData.filter((p) => {
      return p.title === this.state.hiddenProjectId;
    });

    let projectId = project.length > 0 ? project[0]._id : "";
    this.props.context.actions.getAllProjectsSummary(projectId);
  }

  async componentDidMount() {
    this.setState({
      isLoaded: false,
    });
    await this.getDashboardData(this.state.flag, this.state.showArchive);
    this.props.context.actions.getAllProjectsSummary();
    if (this.state.projectData.length === 0) {
      this.props.context.actions.getUserProject();
    }
  }
  async getDashboardData(flag, showArchive, e) {
    if (e) {
      e.preventDefault();
    }
    let project = this.state.projectData.filter((p) => {
      return p.title === this.state.hiddenProjectId;
    });

    let projectId = project.length > 0 ? project[0]._id : "";
    let { tasks, tasksErr } = await taskService.getDashboardData(
      projectId,
      flag,
      showArchive
    );
    if (tasksErr) {
      this.setState({
        message: tasksErr,
      });
    } else if (tasks && tasks.data.err) {
      this.setState({ message: tasks.data.err });
    } else {
      let chartData = [];
      let todayData = 0;
      if (
        tasks.data.data.todaysTasksChartData &&
        tasks.data.data.todaysTasksChartData.length > 0
      ) {
        for (let i = 0; i < tasks.data.data.todaysTasksChartData.length; i++) {
          if (tasks.data.data.todaysTasksChartData[i].name !== "TodaysTask") {
            chartData.push(tasks.data.data.todaysTasksChartData[i]);
          } else {
            todayData = tasks.data.data.todaysTasksChartData[i].value;
          }
        }
      }
      let UserProductivityData =
        tasks.data.data.userProductivityData &&
        tasks.data.data.userProductivityData.length > 0
          ? tasks.data.data.userProductivityData[0]
          : [];
      let date = dateUtil.DateToString(new Date().toISOString());
      if (tasks.data.data.UsersTodaysTasks.length > 0) {
        let data = tasks.data.data.UsersTodaysTasks.map((task) => {
          task.startDate =
            task.startDate !== undefined &&
            task.startDate !== "" &&
            task.startDate !== null
              ? dateUtil.DateToString(task.startDate)
              : "";
          task.endDate =
            task.endDate !== undefined &&
            task.endDate !== "" &&
            task.endDate !== null
              ? dateUtil.DateToString(task.endDate)
              : "";
          if (tasks.status === "new") {
            task.status = "New ";
          } else if (tasks.status === "inprogress") {
            task.status = "Inprogress ";
          } else if (
            task.startDate < date &&
            task.endDate > date &&
            !task.completed
          ) {
            task.status = "Ongoing ";
          } else if (task.startDate === date && task.completed) {
            task.status = "Todays task completed";
          } else if (task.startDate === date && !task.completed) {
            task.status = "Todays task";
          }
          if (this.state.flag === "overdue") {
            task.status = "Incomplete ";
          }
          return task;
        });
        let oneDay = 0;
        let twoDay = 0;
        let threeDay = 0;
        let fourDay = 0;
        let fiveDay = 0;
        let moreThanFiveDay = 0;
        let overDueArray = [];
        let overDue = "";
        let obj1 = {};
        let obj2 = {};
        let obj3 = {};
        let obj4 = {};
        let obj5 = {};
        let obj6 = {};

        for (let i = 0; i < tasks.data.data.UsersTodaysTasks.length; i++) {
          overDue = parseInt(
            (new Date() -
              new Date(tasks.data.data.UsersTodaysTasks[i].endDate)) /
              (1000 * 60 * 60 * 24),
            10
          );

          if (overDue === 1) {
            oneDay++;
            obj1 = {
              day: "1 Day",
              count: oneDay,
            };
          } else if (overDue === 2) {
            twoDay++;
            obj2 = {
              day: "2 Days",
              count: twoDay,
            };
          } else if (overDue === 3) {
            threeDay++;
            obj3 = {
              day: "3 Days",
              count: threeDay,
            };
          } else if (overDue === 4) {
            fourDay++;
            obj4 = {
              day: "4 Days",
              count: fourDay,
            };
          } else if (overDue === 5) {
            fiveDay++;
            obj5 = {
              day: "5 Days",
              count: fiveDay,
            };
          } else if (overDue > 5) {
            moreThanFiveDay++;
            obj6 = {
              day: "5+ Days",
              count: moreThanFiveDay,
            };
          } else {
          }
        }
        if (Object.keys(obj1).length > 0) {
          overDueArray.push(obj1);
        }
        if (Object.keys(obj2).length > 0) {
          overDueArray.push(obj2);
        }
        if (Object.keys(obj3).length > 0) {
          overDueArray.push(obj3);
        }
        if (Object.keys(obj4).length > 0) {
          overDueArray.push(obj4);
        }
        if (Object.keys(obj5).length > 0) {
          overDueArray.push(obj5);
        }
        if (Object.keys(obj6).length > 0) {
          overDueArray.push(obj6);
        }

        this.setState({
          isdataLoaded: false,
          data: data,
          overDueData: overDueArray,
        });
      } else {
        this.setState({
          isdataLoaded: false,
          data: [],
          overDueData: [],
        });
      }
      //console.log("todayData",todayData)
      this.setState({
        chartData: chartData,
        UserProductivityData: UserProductivityData,
        todayData: todayData,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      projectData: nextProps.context.state.userProjectData,
      totalProjects: nextProps.context.state.totalProjects,
      projectStatus: nextProps.context.state.projectStatus,
      totalProjectUsers: nextProps.context.state.totalProjectUsers,
      showArchive: nextProps.context.state.showArchive,
    });
  }

  async showTabData(flag) {
    this.setState({
      flag: flag,
      data: [],
      isdataLoaded: true,
    });
    this.getDashboardData(flag, this.state.showArchive);
  }

  renderTooltip = (props) => {
    if (props.active) {
      return (
        <div style={{ border: "1px solid #fff" }}>
          {props.label}:{props.payload[0].value}
        </div>
      );
    }
    return;
  };

  render() {
    const labelStyle = {
      fontSize: "small",
    };
    let projects = [];
    let totalProjects = [];
    let totalTask = 0;
    let incompeleteTask = 0;
    let overdueTask = 0;
    let onHoldTask = 0;
    let holdProjectCount = 0;
    let projectUserCount = 0;

    let allProjects = this.state.projectData && this.state.projectData;
    for (let i = 0; i < allProjects.length; i++) {
      projects.push(
        <option key={allProjects[i]._id} data-value={allProjects[i]._id}>
          {allProjects[i].title}
        </option>
      );
    }
    if (this.state.totalProjects.length > 0) {
      for (let i = 0; i < this.state.totalProjects.length; i++) {
        totalTask = totalTask + this.state.totalProjects[i].totalTasks;

        if (this.state.totalProjects[i].status === "onHold") {
          holdProjectCount++;
        }
        overdueTask = overdueTask + this.state.totalProjects[i].overDueTasks;
        onHoldTask = onHoldTask + this.state.totalProjects[i].onHoldTasks;
        incompeleteTask =
          incompeleteTask + this.state.totalProjects[i].incompleteTasks;
      }
    }

    let deletedTaskCount = 0,
      completeTaskCount = 0,
      inprogressTaskCount = 0,
      ovedueTaskCount = 0,
      onHOldTaskCount = 0,
      openTask = 0,
      newTask = 0,
      futureTaskCount = 0;
    if (this.state.chartData.length > 0) {
      for (let i = 0; i < this.state.chartData.length; i++) {
        if (this.state.chartData[i].name === "Completed") {
          completeTaskCount = this.state.chartData[i].value;
        }
        if (this.state.chartData[i].name === "Running") {
          inprogressTaskCount = this.state.chartData[i].value;
        }
        if (this.state.chartData[i].name === "Overdue") {
          ovedueTaskCount = this.state.chartData[i].value;
        }
        if (this.state.chartData[i].name === "OnHold") {
          onHOldTaskCount = this.state.chartData[i].value;
        }
        if (this.state.chartData[i].name === "All") {
          openTask = this.state.chartData[i].value;
        }
        if (this.state.chartData[i].name === "New") {
          newTask = this.state.chartData[i].value;
        }
        if (this.state.chartData[i].name === "FutureTask") {
          futureTaskCount = this.state.chartData[i].value;
        }
      }
    }
    let headers = [];
    for (let i = 0; i < this.state.headers.length; i++) {
      if (this.state.flag === "futureTask") {
        if (
          this.state.headers[i].accessor !== "startDate" &&
          this.state.headers[i].accessor !== "endDate"
        ) {
          headers.push(this.state.headers[i]);
        }
      } else {
        headers.push(this.state.headers[i]);
      }
    }

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
        headers={headers}
        data={this.state.data}
        hightlightRow={this.state.hightlightRow}
        noData="No records!"
        show={config.Export}
      />
    );

    const dataChart = (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart
          margin={{ top: 10, right: 3, left: 5, bottom: 20 }}
          onMouseEnter={this.onPieEnter}
        >
          {/* width={this.refs.pieChartData ? this.refs.pieChartData.offsetWidth : 300} height={this.refs.pieChartData ? this.refs.pieChartData.offsetHeight : 300} onMouseEnter={this.onPieEnter}> */}
          <Pie
            data={this.state.chartData}
            labelLine={false}
            label={renderCustomizedLabel}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={0}
            // minAngle={20}
            //cx={this.refs.pieChartData ? this.refs.pieChartData.offsetX : 100}
            //cy={this.refs.pieChartData ? this.refs.pieChartData.offsetY : 120}
            fill="#8884d8"
            dataKey="value"
          >
            {this.state.chartData.map((entry, index) => (
              <Cell key={index} fill={this.state.colors[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );

    const TiltedAxisTick = (props) => {
      const { x, y, stroke, payload } = props;
      return (
        <g transform={`translate(${x},${y})`}>
          <text
            x={0}
            y={0}
            dy={10}
            textAnchor="middle"
            width={20}
            scaleToFit={true}
            fontSize={9}
            fill="#666"
            transform="rotate(-15)"
          >
            {payload.value}
          </text>
        </g>
      );
    };

    const dataChartBar = this.state.chartData.length > 0 && (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          margin={{ top: 10, right: 3, left: 5, bottom: 20 }}
          data={this.state.chartData}
          width="100%"
          height="100%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={<TiltedAxisTick />}
            minTickGap={10}
            interval={0}
          />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="bottom" align="center" layout="horizontal" />

          <Bar dataKey="value" stackId="a" name="Task Progress">
            {this.state.chartData.length > 0 &&
              this.state.chartData.map((entry, index) => (
                <Cell key="value" fill={this.state.colors[entry.name]} />
              ))}
          </Bar>

          <Tooltip
            content={this.renderTooltip}
            cursor={false}
            wrapperStyle={{ backgroundColor: "#f9f7f7" }}
          />
        </BarChart>
      </ResponsiveContainer>
    );

    const dataChart1 = this.state.overDueData.length > 0 && (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={this.state.overDueData ? this.state.overDueData : []}
          margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" padding={{ left: 10 }} minTickGap={10} />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="bottom" />
          <Bar
            name=" Overdue Task Count"
            dataKey="count"
            stackId="a"
            fill="#8884d8"
          />
        </BarChart>
      </ResponsiveContainer>
    );
    var percentageTask =
      this.state.UserProductivityData &&
      this.state.UserProductivityData.WorkingHours !== 0
        ? (
            (this.state.UserProductivityData.Storypoint /
              this.state.UserProductivityData.WorkingHours) *
            100
          )
            .toString()
            .match(/^-?\d+(?:\.\d{0,2})?/)
        : 0;
    const numericTotalTask = parseFloat(totalTask);

    return (
      <React.Fragment>
        {this.state.isLoaded ? (
          <div className="logo">
            <img src="/images/loading.svg" alt="loading" />
          </div>
        ) : (
          <React.Fragment>
            {/* form start */}
            <div className="row page-summary">
              <div className="col-sm-12 col-lg-12 ">
                {Auth.get("userRole") !== "user" ? (
                  <form>
                    <div className="">
                      <div className=" mt-2">
                        <div className="d-flex justify-content-end">
                          <div className="flex-item">
                            <div className="form-group">
                              <input
                                type="text"
                                value={this.state.hiddenProjectId}
                                list="data"
                                onChange={this.handleInputChange}
                                name="hiddenProjectId"
                                className="form-control select-project rounded-0"
                                autoComplete="off"
                                placeholder="Select Project"
                              />
                              <datalist id="data">{projects}</datalist>
                            </div>
                          </div>
                          <div className="flex-item">
                            <div className="form-group">
                              <button
                                onClick={this.submit}
                                type="submit"
                                className="btn btn-md btn-default rounded-0 border-0"
                                value=""
                                disabled={!this.state.hiddenProjectId}
                              >
                                <span role="img" aria-labelledby="Search">
                                  &#x1F50D;
                                </span>
                              </button>
                            </div>
                          </div>
                          <div className="flex-item ml-0">
                            <button
                              onClick={this.reset}
                              className="btn btn-md btn-danger  border-0"
                            >
                              X
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="dashboard box-wrapper d-flex justify-content-between align-self-center mb-2">
              <div className="summary-box  default-task-border">
                <span>
                  <span className="lbl-no">
                    {this.state.totalProjects.length}
                  </span>
                  <small style={{ color: "red" }} title="Hold Project">
                    ({holdProjectCount}){" "}
                  </small>{" "}
                </span>
                <div className="lbl-text">Projects</div>
              </div>

              <div className="summary-box default-task-border">
                <div className="lbl-no">
                  {!isNaN(numericTotalTask) ? numericTotalTask : 0}
                </div>
                <div className="lbl-text">All Tasks</div>
              </div>

              <div className="summary-box running-task-border">
                <div className="lbl-no">{incompeleteTask}</div>
                <div className="lbl-text">Running Tasks</div>
              </div>

              <div className="summary-box  overdue-task-border">
                <div className="lbl-no">{overdueTask}</div>
                <div className="lbl-text">Overdue Tasks</div>
              </div>

              <div className="summary-box onhold-task-border">
                <div className="lbl-no">{onHoldTask}</div>
                <div className="lbl-text">OnHold Tasks</div>
              </div>

              <div className="summary-box default-task-border">
                <div className="lbl-no">{this.state.totalProjectUsers}</div>
                <div className="lbl-text">Project Member</div>
              </div>
            </div>

            <div className="row equal-height-container">
              <div className="col-sm-12 col-lg-9 first">
                <h6 className="task-title  mb-3 mt-2 bb-dotted ">Tasks Info</h6>
                <nav>
                  <div
                    className="nav nav-tabs nav-fill"
                    id="myTab"
                    role="tablist" >
                    <a
                      onClick={this.showTabData.bind(this, "duetoday")}
                      className="nav-item nav-link active"
                      id="assigned-tab"
                      data-toggle="tab"
                      href="#todays"
                      role="tab"
                      aria-controls="todays"
                      aria-selected="true"
                    >
                      Today's{" "}
                      <span
                        style={{ color: "rgb(255, 152, 0)" }}
                        className="task-count"
                      >
                        (
                        {this.state.flag === "duetoday" && this.state.data
                          ? this.state.data.length
                          : 0}
                        )
                      </span>
                    </a>
                    <a
                      onClick={this.showTabData.bind(this, "newTask")}
                      className="nav-item nav-link"
                      id="profile-tab"
                      data-toggle="tab"
                      href="#newtask"
                      role="tab"
                      aria-controls="newtask"
                      aria-selected="false"
                    >
                      New{" "}
                      <span style={{ color: "rgb(255, 152, 0)" }}>
                        ({newTask})
                      </span>
                    </a>
                    <a
                      onClick={this.showTabData.bind(this, "inprogress")}
                      className="nav-item nav-link"
                      id="overdue-tab"
                      data-toggle="tab"
                      href="#runningtask"
                      role="tab"
                      aria-controls="runningtask"
                      aria-selected="false"
                    >
                      Running{" "}
                      <span style={{ color: "rgb(255, 152, 0)" }}>
                        ({inprogressTaskCount})
                      </span>
                    </a>
                    <a
                      onClick={this.showTabData.bind(this, "overdue")}
                      className="nav-item nav-link"
                      id="overduetask-tab"
                      data-toggle="tab"
                      href="#overduetask"
                      role="tab"
                      aria-controls="overduetask"
                      aria-selected="false"
                    >
                      Overdue{" "}
                      <span style={{ color: "rgb(255, 152, 0)" }}>
                        ({ovedueTaskCount})
                      </span>
                    </a>
                    <a
                      onClick={this.showTabData.bind(this, "onhold")}
                      className="nav-item nav-link"
                      id="onhold-tab"
                      data-toggle="tab"
                      href="#onhold"
                      role="tab"
                      aria-controls="onhold"
                      aria-selected="false"
                    >
                      OnHold{" "}
                      <span style={{ color: "rgb(255, 152, 0)" }}>
                        ({onHOldTaskCount})
                      </span>
                    </a>
                    <a
                      onClick={this.showTabData.bind(this, "futureTask")}
                      className="nav-item nav-link"
                      id="futuretask-tab"
                      data-toggle="tab"
                      href="#futureTask"
                      role="tab"
                      aria-controls="futureTask"
                      aria-selected="false"
                    >
                      Future Task{" "}
                      <span style={{ color: "rgb(255, 152, 0)" }}>
                        ({futureTaskCount})
                      </span>
                    </a>
                  </div>
                </nav>

                <div className="tab-content" id="myTabContent">
                  <div
                    className="tab-pane fade show active"
                    id="todays"
                    role="tabpanel"
                    aria-labelledby="todays-tab"
                  >
                    {this.state.isdataLoaded && this.state.data.length === 0 ? (
                      <div className="datalogo">
                        <img src="/images/loading.svg" alt="loading" />
                      </div>
                    ) : (
                      <div> {dataTable}</div>
                    )}
                  </div>
                  <div
                    className="tab-pane fade"
                    id="newtask"
                    role="tabpanel"
                    aria-labelledby="newtask-tab"
                  >
                    {this.state.isdataLoaded && this.state.data.length === 0 ? (
                      <div className="datalogo">
                        <img src="/images/loading.svg" alt="loading" />
                      </div>
                    ) : (
                      <div> {dataTable}</div>
                    )}
                  </div>
                  <div
                    className="tab-pane fade"
                    id="runningtask"
                    role="tabpanel"
                    aria-labelledby="runningtask-tab"
                  >
                    {this.state.isdataLoaded && this.state.data.length === 0 ? (
                      <div className="datalogo">
                        <img src="/images/loading.svg" alt="loading" />
                      </div>
                    ) : (
                      <div> {dataTable}</div>
                    )}
                  </div>
                  <div
                    className="tab-pane fade"
                    id="overduetask"
                    role="tabpanel"
                    aria-labelledby="overduetask-tab"
                  >
                    {this.state.isdataLoaded && this.state.data.length === 0 ? (
                      <div className="datalogo">
                        <img src="/images/loading.svg" alt="loading" />
                      </div>
                    ) : (
                      <div> {dataTable}</div>
                    )}
                  </div>
                  <div
                    className="tab-pane fade"
                    id="onhold"
                    role="tabpanel"
                    aria-labelledby="onhold-tab"
                  >
                    {this.state.isdataLoaded && this.state.data.length === 0 ? (
                      <div className="datalogo">
                        <img src="/images/loading.svg" alt="loading" />
                      </div>
                    ) : (
                      <div> {dataTable}</div>
                    )}
                  </div>
                  <div
                    className="tab-pane fade"
                    id="cancelled"
                    role="tabpanel"
                    aria-labelledby="cancelled-tab"
                  >
                    {this.state.isdataLoaded && this.state.data.length === 0 ? (
                      <div className="datalogo">
                        <img src="/images/loading.svg" alt="loading" />
                      </div>
                    ) : (
                      <div> {dataTable}</div>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="col-sm-12 col-lg-3 second"
                style={{ background: "white" }}
              >
                <h6 className="task-title  mb-2 mt-2 bb-dotted">
                  Task Statistics
                </h6>
                <div
                  className=" reportscrollbar"
                  ref="pieChartData"
                  style={{ height: "225px" }}
                >
                  {dataChartBar}
                </div>
                <div className="row">
                  <div className="col-xs-12 col-sm-6 col-md-6 col-lg-12">
                    <ul className="summary-list list-group list-group-flush task-status-right mb-2 mt-1">
                      <li
                        className="list-group-item d-flex justify-content-between"
                        style={{ borderLeft: "5px solid #5feae4" }}
                      >
                        <span>
                          <strong>New </strong>
                        </span>{" "}
                        <span>
                          <strong>{newTask}</strong>
                        </span>{" "}
                      </li>
                      <li
                        className="list-group-item d-flex justify-content-between"
                        style={{ borderLeft: "5px solid #ffff00" }}
                      >
                        <span>
                          <strong>Running </strong>
                        </span>{" "}
                        <span>{inprogressTaskCount}</span>{" "}
                      </li>
                      <li
                        className="list-group-item d-flex justify-content-between"
                        style={{ borderLeft: "5px solid #ea2b2b" }}
                      >
                        <span>
                          <strong>Overdue</strong>
                        </span>{" "}
                        <span>{ovedueTaskCount}</span>{" "}
                      </li>
                      <li
                        className="list-group-item d-flex justify-content-between"
                        style={{ borderLeft: "5px solid #adafa7fc" }}
                      >
                        <span>
                          <strong>OnHold</strong>
                        </span>{" "}
                        <span>{onHOldTaskCount}</span>{" "}
                      </li>
                      <li
                        className="list-group-item d-flex justify-content-between"
                        style={{ borderLeft: "5px solid #4bef41" }}
                      >
                        <span>
                          <strong>Completed </strong>
                        </span>{" "}
                        <span>{completeTaskCount}</span>{" "}
                      </li>
                      <li
                        className="list-group-item d-flex justify-content-between"
                        style={{ borderLeft: "5px solid #136ec8" }}
                      >
                        <span>
                          <strong>Future Task </strong>
                        </span>{" "}
                        <span>{futureTaskCount}</span>{" "}
                      </li>
                    </ul>
                  </div>
                  <div
                    className="col-xs-12 col-sm-6 col-md-6 col-lg-12"
                    style={{ height: "250px" }}
                  >
                    {dataChart1}
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
