import React from 'react';
import { Link } from 'react-router-dom';
import '../../app.css';
import * as UserReportService from '../../Services/reports/user-reports-service';
import DataTable from '../../Components/datatable';
import * as dateUtil from '../../utils/date-util';
import TaskMenu from '../tasks/task-menu';
import UserReportsCalendarView from './user-reports-calendar-view';
import * as projectservice from '../../Services/project/project-service';
import Calendar from '../../Components/calendar/calendar';
import './reports.css';

export default class UserReport extends React.Component {
    constructor(props) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.resetDate = this.resetDate.bind(this);
        this.getReportData = this.getReportData.bind(this);
        this.onSelectViewChange = this.onSelectViewChange.bind(this);
    }

    yearList() {
        let d = new Date();
        let currentYear = d.getFullYear();
        let initialYear = 2017;
        let years = [];

        for (let i = initialYear; i <= (currentYear + 1); ++i) {
            years.push(i);
        }
        return years;
    }
    checkReportValue = (e) => {
        if (this.state.showreport === "monthwise") {
            this.setState({
                dateTo: '',
                dateFrom: '',
                data:[],
                hiddenUserId: ""

            })
        }
        else {
            this.setState({
                year: -1,
                month: -1,
                data:[],
                hiddenUserId: ""
            })
        }
    }

    handleRadioChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({
            [name]: value,
            message: ""
        }, this.checkReportValue)


    }

    state = {
        monthwise: "Month",
        datewise: "Date",
        showmonthwise: true,
        showdatewise: false,
        showreport: "monthwise",
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        userReports: 'UserReport',
        dateFrom: '',
        dateTo: '',
        week: "",
        message: "",
        noRecordsMsg: '',
        projectName: this.props.context.state.projectName,
        users: this.props.context.state.users,
        data: [],
        isLoaded: true,
        headers: [
            {
                title: "Project Title", accessor: "projectTitle", index: 0, cell: row => {
                    let url = "/project/tasks/" + row.projectId;
                    return (
                        <Link to={url} >{row.projectTitle} </Link>
                    )
                }
            },
            // {
            //     title: "User Name", accessor: "userName", index: 1, cell: row => {
            //         let url = "/projects/" + row.userId;
            //         return (
            //             <Link to={url} >{row.userName} </Link>
            //         )
            //     }
            // },
            { title: "Task Title", accessor: "title", index: 1 },
            { title: "Start Date", accessor: "startDate", index: 2 },
            { title: "End Date", accessor: "endDate", index: 3 },
            { title: "Status", accessor: "status", index: 4 },
            { title: "Story Point", accessor: "storyPoint", index: 5 },
            { title: "No. of Days Overdue", accessor: "overdueDays", index: 6 },
            { title: "Messages", accessor: "messages", index: 7 },
            // { title: "End Date", accessor: "endDate", index: 8 }
        ],
        years: this.yearList(),
        monthList: [{ name: "January", id: 0 }, { name: "February", id: 1 }, { name: "March", id: 2 }, { name: "April", id: 3 },
        { name: "May", id: 4 }, { name: "June", id: 5 }, { name: "July", id: 6 }, { name: "August", id: 7 }, { name: "September", id: 8 },
        { name: "October", id: 9 }, { name: "November", id: 10 }, { name: "December", id: 11 }],
        excelHeaders: [
            { label: 'Project Title', key: 'projectTitle' },
            // { label: 'User Name', key: 'userName' },
            { label: 'Task Title', key: 'title' },
            { label: 'Start Date', key: 'startDate' },
            { label: 'End Date', key: 'endDate' },
            // { label: 'Task Description', key: 'description' },
            { label: 'Status', key: 'status' },
            { label: 'Story Point', key: 'storyPoint' },
            { label: 'No. of Days Overdue', key: 'overdueDays' },
            { label: 'Messages', key: 'messages' },

        ],
        hiddenUserId: "",
        userNameToId: this.props.context.state.userNameToId,
        project: [],
        userReportViews: [
            { id: 'DatatableView', desc: 'Datatable View' },
            { id: 'calendarView', desc: 'Calendar View' },
        ],
        selectedView: "DatatableView",
    }

    async getReportData(e) {
        e.preventDefault();

        let userId = this.state.userNameToId && this.state.userNameToId[this.state.hiddenUserId.toLowerCase().replace(/ +/g, "")];
        let reportParams = {
            year: this.state.year,
            month: this.state.month,
            dateFrom: this.state.dateFrom,
            dateTo: this.state.dateTo,
            userId: userId
        }

        let projectId = "";
        if (this.props.projectId) {
            projectId = this.props.projectId;
        }
        let { response, err } = await UserReportService.getMonthlyUserReport(reportParams, projectId);
        if (err) {
            this.setState({
                message: 'Error: ' + err
            });
        } else if (response && response.data.err) {
            this.setState({
                message: 'Error: ' + response.data.err
            });
        }
        else {

            let data = response.data.data.map((t) => {
                t.startDate = (t.startDate !== undefined && t.startDate !== '' && t.startDate !== null) ? dateUtil.DateToString(t.startDate) : '';
                t.endDate = (t.endDate !== undefined && t.endDate !== '' && t.endDate !== null) ? dateUtil.DateToString(t.endDate) : '';
                return t;
            });
            this.setState({
                ...this.state,
                data: data
            });
        }
    }

    resetDate() {
        this.setState({
            year: -1,
            month: -1,
            dateFrom: '',
            dateTo: '',
            // dateFrom: dateUtil.DateToString(new Date(new Date().getFullYear(),new Date().getMonth(),1)),
            // dateTo: dateUtil.DateToString(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
            hiddenUserId: '',
            data:[]
        })
    }

    handleInputChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            ...this.state,
            [name]: value,
            noRecordsMsg: ''

        });
    }

    dateUpdate = (name, updatedDate) => {
        this.setState({
            ...this.state,
            [name]: updatedDate,
            noRecordsMsg: ''
        }, this.checkSubmit);
    }

    checkSubmit() {
        if (this.state.dateFrom !== "" && this.state.dateTo !== "") {
            if (Date.parse(this.state.dateFrom) > Date.parse(this.state.dateTo)) {
                this.setState({ message: 'Start Date is Greater Than End Date' });
            }
            else {
                this.setState({ message: '' });
            }
        }
    }

    onSelectViewChange(e) {
        let selectedView = e.target.value;
        this.setState({
            selectedView: selectedView,
            updatedTime: dateUtil.getTime()
        });
    }

    async componentDidMount() {
        if (this.props.projectId) {
            let { response, err } = await projectservice.getDataByProjectId(this.props.projectId);
            if (err) {
                this.setState({
                    message: err
                });
            } else if (response && response.data.err) {
                this.setState({
                    message: response.data.err
                });
            } else {
                await this.setState({
                    project: response.data.data
                })
            }
        }
        if (this.state.users.length === 0) {
            this.props.context.actions.setUsers();
        }

        this.setState({
            isLoaded: false
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            projectName: nextProps.context.state.projectName,
            users: nextProps.context.state.users,
            userNameToId: nextProps.context.state.userNameToId,
        })
    }

    render() {

        const years = this.state.years.map((y) => {
            return <option key={y * .5} value={y} >{y}</option>
        });
        const months = this.state.monthList.map((m) => {
            return <option key={m.id + m.name} value={m.id} >{m.name}</option>
        });
        const labelStyle = {
            fontSize: "small",
        };
        var d = new Date();
        var dateTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '_' + d.getHours() + '-'
            + d.getMinutes() + '-' + d.getSeconds();

        const dataTable = (
            <DataTable className="data-table"
                title="User Report"
                keyField="id"
                pagination={{
                    enabled: true,
                    pageLength: 50,
                    type: "long"  // long,short
                }}
                width="100%"
                headers={this.state.headers}
                data={this.state.data ? this.state.data : []}
                years={this.state.years}
                monthList={this.state.monthList}
                month={this.state.month}
                year={this.state.year}
                userReports={this.state.userReports}
                dateFrom={this.state.dateFrom}
                dateTo={this.state.dateTo}
                excelHeaders={this.state.excelHeaders}
                filename={'userReport_' + dateTime + '.csv'}
                projectName='user_Report'
                // dataExcel={dataExcel}
                noData="No records!" />
        );
        // console.log("this.state.project in render 1",this.state.project);
        let users = [];
        if (this.props.projectId) {
            // console.log("this.state.project in render 2",this.state.project);
            users = this.state.project && this.state.project.projectUsers && this.state.project.projectUsers.map((u) => {
                return <option key={u.userId} data-value={u.userId}>{u.name}</option>
            });
        } else {
            users = this.state.users.map((u) => {
                return <option key={u._id} data-value={u._id}>{u.name}</option>
            });
        }

        let viewList = this.state.userReportViews.map((module, i) => {
            return <option value={module.id} key={module.id}>{module.desc}</option>
        })


        return (
            <React.Fragment>

                <div className="container bg-white">
                    <div className="row">
                        <div className="col-sm-8">
                            {this.props.projectId ? <h3 className="project-title" >
                                {this.state.projectName} Report</h3> : <h3 className="project-title">Member Report by :{this.state.showreport === "monthwise" ? this.state.monthwise : this.state.datewise}</h3>}
                        </div>
                        <div className="col-sm-4">
                            <div className="float-right" >
                                <div className="input-group input-group-sm">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text rounded-0" id="inputGroup-sizing-sm"><i className="far fa-eye"></i></span>
                                    </div>
                                    <select className="form-control" onChange={this.onSelectViewChange}
                                        value={this.state.selectedView} placeholder="Select View">
                                        {viewList}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="row">
                        {this.props.projectId ? <div className="mb-3"><TaskMenu {...this.props} /> </div>: ""}
                    </div>
                    {
                        this.state.message || this.state.noRecordsMsg ?
                            <div className="row">
                                <div className="col-sm-12">
                                    <span className="alert alert-danger">{this.state.message}</span>
                                    <span className="alert alert-danger">{this.state.noRecordsMsg}</span>

                                </div>
                            </div> : ''
                    }
                    <div className="row">
                        <div className="col-sm-12">

                            <div>

                                <label className="input-container">By Month
                                <input type="radio" name="showreport" defaultChecked value="monthwise" onChange={this.handleRadioChange} />
                                    <span className="checkmark"></span>
                                </label>
                                <label className="input-container ml-3">By Date
                                <input type="radio" name="showreport" value="datewise" onChange={this.handleRadioChange} />
                                    <span className="checkmark"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={this.getReportData} className="form-wrapper">
                        <div className="row">
                            <div className="form-group col-sm-3">
                                <label htmlFor="Select User" style={labelStyle}>Select User</label> <span style={{ color: 'red' }}>*</span>
                                <input type="text" value={this.state.hiddenUserId} list="data" onChange={this.handleInputChange}
                                    name="hiddenUserId" className="form-control" autoComplete="off" placeholder="Select User" />
                                <datalist id="data" >
                                    {
                                        users
                                    }
                                </datalist>
                            </div>
                        </div>
                        <div className="row">
                            <div className='col-sm-6'>
                                {this.state.showreport === "monthwise" ?
                                    <React.Fragment>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <label htmlFor="Year" style={labelStyle}>Year</label><span style={{ color: 'red' }}>*</span>
                                                <select onChange={this.handleInputChange} name="year" className="form-control" value={this.state.year}>
                                                    <option value="" >Select Year</option>
                                                    {years}
                                                </select>
                                            </div>
                                            <div className="col-sm-6">
                                                <label htmlFor="Month" style={labelStyle}>Month</label><span style={{ color: 'red' }}>*</span>
                                                <select onChange={this.handleInputChange} name="month" className="form-control" value={this.state.month}>
                                                    <option value="" >Select Month</option>
                                                    {months}
                                                </select>
                                            </div>
                                        </div>
                                    </React.Fragment>

                                    :
                                    <React.Fragment>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div className="input-group">
                                                    <label htmlFor="Date From" className="w-100" style={labelStyle}>From</label>
                                                    <Calendar width='267px' height='225px' className="form-control"
                                                        dateformat={'YYYY-MM-DD'}
                                                        selectedDate={this.state.dateFrom}
                                                        dateUpdate={this.dateUpdate.bind(this, 'dateFrom')}
                                                        id="dateFrom" calendarModalId="dateFromModal"
                                                    />
                                                </div>
                                                </div>

                                                <div className="col-sm-6">
                                                <div className="input-group">
                                                        <label htmlFor="Date To" className="w-100" style={labelStyle}>To</label>

                                                        <Calendar width='267px' height='225px' className="form-control"
                                                            dateformat={'YYYY-MM-DD'}
                                                            selectedDate={this.state.dateTo}
                                                            dateUpdate={this.dateUpdate.bind(this, 'dateTo')}
                                                            id="dateTo" calendarModalId="dateToModal"
                                                        />

                                                    </div>

                                                </div>
                                            </div>
                                      
                                    </React.Fragment>
                                }
                      </div>
                      <div className="col-sm-6 mt-4">
                                    <div className="row">
                                        <div className="col-sm-3 pl-0">
                                            <input type="submit" className="btn btn-info btn-block mt-1" value="Submit"
                                                disabled={(((this.state.year === -1 || this.state.month === -1) ||(this.state.year === "" || this.state.month === "")) && !(this.state.dateFrom && this.state.dateTo))
                                                    || (this.state.message) || !this.state.hiddenUserId} />
                                        </div>
                                        <div className="col-sm-3 pl-0">
                                            <input type="button" className="btn btn-default btn-block mt-1" value="Reset" onClick={this.resetDate} />

                                        </div>
                                    </div>



                                </div>
                            </div>
                    </form>
                        
                        {this.state.isLoaded ?
                            <div className="logo">
                                <img src="/images/loading.svg" alt="loading" />
                            </div>
                            :
                            <div className="row">
                                {this.state.selectedView === "calendarView" && (this.state.data.length > 0) ? <UserReportsCalendarView data={this.state.data} projectId={this.props.projectId} />
                                    :
                                    <div className="col-sm-12">
                                        {dataTable}
                                    </div>}
                            </div>
                        }
               </div>
            </React.Fragment>
                    )
                }
}