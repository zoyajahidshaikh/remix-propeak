import React from 'react';
import { Link } from 'react-router-dom';
import '../../app.css';
import * as TaskReportService from '../../Services/reports/task-reports-service';
import DataTable from '../../Components/datatable';
import * as DateUtil from '../../utils/date-util';
import TaskMenu from '../tasks/task-menu';
import Calendar from '../../Components/calendar/calendar';
import './reports.css';
// var dateFromValue = '';
// var dateToValue = '';

export default class TaskReport extends React.Component {
    constructor(props) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.resetDate = this.resetDate.bind(this);
        this.getReportData = this.getReportData.bind(this);
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
                data:[]

            })
        }
        else {
            this.setState({
                year: -1,
                month: -1,
                data:[]

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
        year: -1,
        month: -1,
        taskreports: 'TaskReport',
        dateFrom: '',
        dateTo: '',
        week: "",
        message: "",
        noRecordsMsg: '',
        projectName: this.props.context.state.projectName,
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
            {
                title: "User Name", accessor: "userName", index: 1, cell: row => {
                    let url = "/projects/" + row.userId;
                    return (
                        <Link to={url} >{row.userName} </Link>
                    )
                }
            },
            { title: "Task Title", accessor: "title", index: 2 },
            { title: "Task Description", accessor: "description", index: 3 },
            { title: "Category", accessor: "category", index: 4 },
            { title: "Status", accessor: "status", index: 5 },
            { title: "Story Point", accessor: "storyPoint", index: 6 },
            { title: "Start Date", accessor: "startDate", index: 7 },
            { title: "End Date", accessor: "endDate", index: 8 }
        ],
        years: this.yearList(),
        monthList: [{ name: "January", id: 0 }, { name: "February", id: 1 }, { name: "March", id: 2 }, { name: "April", id: 3 },
        { name: "May", id: 4 }, { name: "June", id: 5 }, { name: "July", id: 6 }, { name: "August", id: 7 }, { name: "September", id: 8 },
        { name: "October", id: 9 }, { name: "November", id: 10 }, { name: "December", id: 11 }],
        excelHeaders: [
            { label: 'Project Title', key: 'projectTitle' },
            { label: 'User Name', key: 'userName' },
            { label: 'Task Title', key: 'title' },
            { label: 'Task Description', key: 'description' },
            { label: 'Category', key: 'category' },
            { label: 'Status', key: 'status' },
            { label: 'Story Point', key: 'storyPoint' },
            { label: 'Start Date', key: 'startDate' },
            { label: 'End Date', key: 'endDate' },
        ]

    }

    async getReportData(e) {
        e.preventDefault();
        let reportParams = {
            year: this.state.year,
            month: this.state.month,
            dateFrom: this.state.dateFrom,
            dateTo: this.state.dateTo
        }
        let projectId = "";
        if (this.props.projectId) {
            projectId = this.props.projectId;
        }
        let { response, err } = await TaskReportService.getMonthlyTaskReport(reportParams, projectId);
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
            let data = (response.data.data && response.data.data.length > 0) && response.data.data.map((t) => {
                t.startDate = (t.startDate !== undefined && t.startDate !== '' && t.startDate !== null) ? DateUtil.DateToString(t.startDate):'';
                t.endDate = (t.endDate !== undefined && t.endDate !== '' && t.endDate !== null) ? DateUtil.DateToString(t.endDate):'';
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
            data:[]
        })
    }

    handleInputChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        // let msg = '';
        // if (name === 'dateFrom') {
        //     dateFromValue = value;
        // }
        // if (name === 'dateTo') {
        //     dateToValue = value;

        //     if (dateToValue < dateFromValue) {
        //         msg = 'From date cannot be greater than to date';
        //     } else {
        //         msg = '';
        //     }
        // }

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


    componentDidMount() {
        this.setState({
            isLoaded: false
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            projectName: nextProps.context.state.projectName
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
        var dateTime = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + '_' + d.getHours() + '-'
            + d.getMinutes() + '-' + d.getSeconds();
        // let dataExcel = this.state.data.map((d) => {
        //     let excelData = {
        //         projectTitle: d.projectTitle,
        //         userName: d.userName,
        //         title: d.title,
        //         description: d.description,
        //         category: d.category,
        //         status: d.status,
        //         storyPoint: d.storyPoint,
        //         startDate: d.startDate,
        //         endDate: d.endDate
        //     }
        //     return excelData;
        // })
        const dataTable = (
            <DataTable className="data-table"
                title="Task Report"
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
                taskreports={this.state.taskreports}
                dateFrom={this.state.dateFrom}
                dateTo={this.state.dateTo}
                excelHeaders={this.state.excelHeaders}
                filename={'taskReport_' + dateTime + '.csv'}
                projectName='task_Report'
                // dataExcel={dataExcel}
                noData="No records!" />
        );




        return (
            <React.Fragment>
               <div className="container bg-white">
                {this.props.projectId ? <h3 className="project-title" >
                    {this.state.projectName} Report</h3> : <h3 className="project-title">Task Report by :  {this.state.showreport === "monthwise" ? this.state.monthwise : this.state.datewise}</h3>}

                
                <hr/>
                    <div className="row" >
                        {this.props.projectId ? <TaskMenu {...this.props} /> : ""}
                    </div>
                    {this.state.message || this.state.noRecordsMsg ?
                    <div className="row">
                        <div className="col-sm-12">
                            <span style={{ color: 'red' }}>{this.state.message}</span>
                            <span style={{ color: 'red' }}>{this.state.noRecordsMsg}</span>

                        </div>
                    </div>
                    :''
                }
                <div className="row">
                    <div className="col-sm-12">
                      
                            <div className="mt-3">
                            
                            <label className="input-container">By Month
  <input type="radio" name="showreport" defaultChecked value="monthwise" onChange={this.handleRadioChange}  />
                                    <span className="checkmark"></span>
</label>
                            <label className="input-container ml-3">By Date
  <input type="radio" name="showreport" value="datewise" onChange={this.handleRadioChange} />
                                    <span className="checkmark"></span>
</label>
 

                                
</div>
                        
                        {/* <h5>

                            <input type="radio" name="showreport" defaultChecked value="monthwise" onChange={this.handleRadioChange} /> <label className="lbl-radio">Monthwise &nbsp; 
                            </label>   
                            <input type="radio" name="showreport" value="datewise" onChange={this.handleRadioChange} /> <label className="lbl-radio">Datewise</label>
                        </h5> */}



                    </div>
                </div>



              
                    <form onSubmit={this.getReportData} className="form-wrapper">
                        
                    <div className="row">
                        
                        <div className="col-sm-6">
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
                                        <div className=" col-sm-6">
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
                                                <label className="w-100" htmlFor="Date From" style={labelStyle}>From &nbsp;</label>
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
                                                <label className="w-100" htmlFor="Date To" style={labelStyle}>To &nbsp;&nbsp;&nbsp;</label>
                                                <Calendar className="form-control" width='267px' height='225px'
                                                    dateformat={'YYYY-MM-DD'}
                                                    selectedDate={this.state.dateTo}
                                                    dateUpdate={this.dateUpdate.bind(this, 'dateTo')}
                                                    id="dateTo" calendarModalId="dateToModal"
                                                />
                                                {/* <input type="date" name="dateTo" className="form-control"
                                                value={this.state.dateTo}
                                                onChange={this.handleInputChange} /> */}
                                            </div>
                                        </div>
                                    </div>

                                </React.Fragment>
                    }
                    
                        </div> 

                        <div className="col-sm-6  mt-4">
                            <div className="row">
                                <div className="col-sm-3 pl-0">
                                  
                                    <input type="submit" className=" btn btn-info btn-block mt-1" value="Submit"
                                        disabled={((this.state.year === -1 || this.state.month === -1) && !(this.state.dateFrom && this.state.dateTo))
                                            || (this.state.message)} />
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
                            <div className="col-sm-12">
                                {dataTable}
                            </div>
                        </div>
                    }
               </div> 
            </React.Fragment>
        )
    }
}