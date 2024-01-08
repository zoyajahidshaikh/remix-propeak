import React from 'react';
import { Link } from 'react-router-dom';
import * as UserReportService from '../../Services/reports/user-performance-reports-service';
import DataTable from '../../Components/datatable';
import Calendar from '../../Components/calendar/calendar';
import { PieChart, Pie, Legend, Tooltip, Cell } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid ,ResponsiveContainer} from 'recharts';
import './reports.css';
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};
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
                fontSize={12}
                fill="#666"
                transform="rotate(-15)">
                {payload.value}
            </text>
        </g>
    );
};



export default class UserPerformanceReport extends React.Component {
    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.getUserPerformanceReportData = this.getUserPerformanceReportData.bind(this);
        this.resetDate = this.resetDate.bind(this);
        
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
                projectTableData:[],
                data: [],
                leaveData: []

            })
        }
        else {
            this.setState({
                year: -1,
                month: -1,
                projectTableData:[],
                data: [],
                leaveData: []

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
        colors: ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#00C43D', '#C40025', '#9F00C4', '#C4009F'],

        leaveColors: {
            Total: "#5feae4",
            Unapproved: '#f7f38c',
            Unpaid: "#c2f7a5",
            Sick: "#adafa7fc",
            Casual: "#95f9f8",
            Compoff: "#136ec8",
            Maternity:'#b8b3f9',
            Paternity:'#f7baa8'
          },
        year: -1,
        month: -1,
        years: this.yearList(),
        monthList: [{ name: "January", id: 0 }, { name: "February", id: 1 }, { name: "March", id: 2 }, { name: "April", id: 3 },
        { name: "May", id: 4 }, { name: "June", id: 5 }, { name: "July", id: 6 }, { name: "August", id: 7 }, { name: "September", id: 8 },
        { name: "October", id: 9 }, { name: "November", id: 10 }, { name: "December", id: 11 }],
        dateFrom: '',
        dateTo: '',
        isLoaded: true,
        users: this.props.context.state.users,
        hiddenUserId: "",
        userNameToId: this.props.context.state.userNameToId,
        userReports: 'User Performance Report',
        hiddenProjectId: '',
        data: [],
        leaveData: [],
        projectData: this.props.context.state.userProjectData,
        headers: [
            {
                title: "Project Title", accessor: "title", index: 0, cell: row => {
                    let url = "/project/tasks/" + row.projectId;
                    return (
                        <Link to={url} >{row.title} </Link>
                    )
                }
            },
            { title: "Completed Task", accessor: "Completed", index: 1 },
            { title: "Todo Task", accessor: "Todo", index: 2 },
            { title: "In Progress Task", accessor: "Inprogress", index: 3 },
            { title: "Total Storypoint", accessor: "Storypoint", index: 4 },
            { title: "Overdue Task", accessor: "Overdue", index: 5 },

        ],
        leaveHeaders: [{ title: "Total Leaves", accessor: "TotalLeave", index: 6 },
        { title: "Unapproved Leaves ", accessor: "UnapprovedLeaveCount", index: 7 },
        { title: "Sick Leaves", accessor: "SickLeaveCount", index: 8 },
        { title: "Casual Leaves", accessor: "CasualLeaveCount", index: 9 },
        { title: "Compoff Leaves", accessor: "CompoffLeaveCount", index: 10 },
        { title: "Maternity Leaves", accessor: "MaternityLeaveCount", index: 11 },
        { title: "Paternity Leaves", accessor: "PaternityLeaveCount", index: 12 },
        { title: "Unpaid Leaves", accessor: "UnpaidLeaveCount", index: 13 }
        ],
        projectTableData: []

    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            users: nextProps.context.state.users,
            userNameToId: nextProps.context.state.userNameToId,
            projectData: nextProps.context.state.userProjectData
        })
    }
    async componentDidMount() {
        if (this.state.users.length === 0) {
            await this.props.context.actions.setUsers();
        }
        if (this.state.projectData.length === 0) {
            this.props.context.actions.getUserProject();
        }
        if (this.props.userId) {
            let user = this.state.users && this.state.users.filter((u) => {
                return u._id === this.props.userId
            });
            let userName = (user.length > 0) ? user[0].name : '';
            this.setState({
                hiddenUserId: userName
            })

            this.getUserPerformanceReportData()
        }


    }
    resetDate() {
        this.setState({
            year: -1,
            month: -1,
            dateFrom: '',
            dateTo: '',
            hiddenProjectId: '',
            hiddenUserId: '',
            message: '',
            data: [],
            leaveData: [],
            projectTableData: []
        })
    }
    handleInputChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            ...this.state,
            [name]: value,
            message: ''

        });
    }
    dateUpdate = (name, updatedDate) => {
        this.setState({
            ...this.state,
            [name]: updatedDate,
            noRecordsMsg: '',
            message: ''
        }, this.checkSubmit);
    }

    async getUserPerformanceReportData(e) {
        if (e) {
            e.preventDefault()
        }
        let userId = ''
        if (this.props.userId) {
            userId = this.props.userId
        } else {
            userId = this.state.userNameToId && this.state.userNameToId[this.state.hiddenUserId.toLowerCase().replace(/ +/g, "")];
        }

        let project = this.state.projectData.filter((p) => {
            return p.title === this.state.hiddenProjectId
        });

        let projectId = project.length > 0 ? project[0]._id : ''
        let filterData = {
            userId: userId,
            projectId: projectId,
            year: this.state.year,
            month: this.state.month,
            dateFrom: this.state.dateFrom,
            dateTo: this.state.dateTo
        }

        let { response, err } = await UserReportService.getUserPerformanceReportData(filterData);
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

            let projectListData = (response.data && response.data.projectListData && response.data.projectListData.length > 0) ? response.data.projectListData : [];
            let leaveData = (response.data && response.data.leaveData && response.data.leaveData.length > 0) ? response.data.leaveData : [];
            let projectTableData = (response.data && response.data.projectTableData && response.data.projectTableData.length > 0) ? response.data.projectTableData : [];

            this.setState({
                data: projectListData,
                leaveData: leaveData,
                projectTableData: projectTableData
            })

        }
    }

    renderTooltip = (props) => 
{
if (props.active) {
    return (
            <div style={{border:"1px solid #fff"}}>{props.label}:{props.payload[0].value}</div>     
        );
   }
   return;
  }



    render() {
        let users = this.state.users.map((u) => {
            return <option key={u._id} data-value={u._id}>{u.name}</option>
        });
        let projects = []

        if (this.state.projectData.length > 0) {
            for (let i = 0; i < this.state.projectData.length; i++) {
                if (this.state.projectData[i].projectUsers.length > 0) {
                    let projectUsers = this.state.projectData[i].projectUsers;
                    for (let j = 0; j < projectUsers.length; j++) {
                        if (projectUsers[j].name !== undefined && projectUsers[j].name !== null) {
                            if (this.state.hiddenUserId.toLowerCase().replace(/ +/g, "") === projectUsers[j].name.toLowerCase().replace(/ +/g, "")) {
                                projects.push(<option key={this.state.projectData[i]._id} data-value={this.state.projectData[i]._id}>{this.state.projectData[i].title}</option>)

                            }
                        }
                    }
                }
            }
        }
        const years = this.state.years.map((y) => {
            return <option key={y * .5} value={y} >{y}</option>
        });
        const months = this.state.monthList.map((m) => {
            return <option key={m.id + m.name} value={m.id} >{m.name}</option>
        });
        const dataTable = (
            <DataTable className="data-table"
                title="User Project Report"
                keyField="id"
                pagination={{
                    enabled: true,
                    pageLength: 50,
                    type: "long"  // long,short
                }}
                width="100%"
                headers={this.state.headers}
                data={this.state.projectTableData ? this.state.projectTableData : []}
                userReports={this.state.userReports}
                noData="No records!" />
        );

        const dataChart = (
            //  <PieChart width={500} height={350} onMouseEnter={this.onPieEnter}>
             <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }} onMouseEnter={this.onPieEnter}>
                <Pie
                    data={this.state.data ? this.state.data : []}
                    // cx={250}
                    // cy={150}
                   // cx={this.refs.pieChartData ? this.refs.pieChartData.offsetX : 180}
                    //cy={this.refs.pieChartData ? this.refs.pieChartData.offsetY : 120}
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {
                        (this.state.data.length > 0) && this.state.data.map((entry, index) => 
                        <Cell key={index} 
                        fill={this.state.colors[index % this.state.colors.length]} />)
                    }

                </Pie>
                <Legend verticalAlign="bottom" align="center" layout="horizontal" />
                <Tooltip />
            </PieChart>
            </ResponsiveContainer>
        )
        const dataChart1 = (
              <ResponsiveContainer width="100%" height="100%">
            <BarChart
                //width={500} height={350} 
                //width={this.refs.barChartData ? this.refs.barChartData.offsetWidth : 350} height={this.refs.barChartData ? this.refs.barChartData.offsetHeight : 350}

                data={this.state.leaveData ? this.state.leaveData : []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={<TiltedAxisTick />} minTickGap={10} interval={0}/>
                <YAxis />
                <Legend verticalAlign="bottom" align="center" layout="horizontal" />
                <Bar dataKey="count" stackId="a" fill="#49f2f2">
                {
                        (this.state.leaveData.length > 0) && this.state.leaveData.map((entry, index) => 
                        <Cell
            key={index}
            fill={this.state.leaveColors[entry.name]}
          />
                        )
                    }</Bar>
                <Tooltip content={this.renderTooltip} cursor={false}
                wrapperStyle={{ backgroundColor: "#f9f7f7" }}
                />

            </BarChart>
            </ResponsiveContainer>
            )

        return (
            <React.Fragment>
                <div className="">
                    <h3 className="project-title">Member Performance Report</h3>
                    <hr />
                    {this.state.message ?
                        <div className="row">
                            <div className="col-sm-12">
                                <span className="alert alert-danger">
                                    {this.state.message}
                                </span>
                            </div>
                        </div> : ''}

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
                    <div className="form-wrapper">
                        <form onSubmit={this.getUserPerformanceReportData}>
                            <div className="row">
                                <div className="col-sm-6 col-lg-3">
                                    <div className="form-group ">
                                        <label htmlFor="Select User">Select Member</label><span style={{ color: 'red' }}>*</span>
                                        <input type="text" value={this.state.hiddenUserId} list="data" onChange={this.handleInputChange}
                                            name="hiddenUserId" className="form-control" autoComplete="off" placeholder="Select Member" />
                                        <datalist id="data" >
                                            {
                                                users
                                            }
                                        </datalist>
                                    </div>
                                </div>
                                <div className="col-sm-6 col-lg-3">
                                    <div className="form-group ">
                                        <label htmlFor="Select Project">Select Project</label>
                                        <input type="text" value={this.state.hiddenProjectId} list="data1" onChange={this.handleInputChange}
                                            name="hiddenProjectId" className="form-control" autoComplete="off" placeholder="Select Project" />
                                        <datalist id="data1" >
                                            {
                                                projects
                                            }
                                        </datalist>
                                    </div>
                                </div>
                            </div>


                            {this.state.showreport === "monthwise" ?
                                <React.Fragment>
                                    <div className="row">
                                        <div className="col-sm-6 col-lg-3">
                                            <div className="form-group">
                                                <label htmlFor="Year">Year</label>
                                                <select onChange={this.handleInputChange} name="year" className="form-control" value={this.state.year}>
                                                    <option value="" >Select Year</option>
                                                    {years}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-6 col-lg-3">
                                            <div className="form-group">
                                                <label htmlFor="Month">Month</label>
                                                <select onChange={this.handleInputChange} name="month" className="form-control" value={this.state.month}>
                                                    <option value="" >Select Month</option>
                                                    {months}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                                :
                                <React.Fragment>
                                    <div className="row">
                                        <div className="col-sm-6 col-lg-3">
                                            <div className="input-group">
                                                <label htmlFor="Date From" className="w-100">From</label>
                                                <Calendar width='222px' height='225px' className="form-control"
                                                    dateformat={'YYYY-MM-DD'}
                                                    selectedDate={this.state.dateFrom}
                                                    dateUpdate={this.dateUpdate.bind(this, 'dateFrom')}
                                                    id="dateFrom" calendarModalId="dateFromModal"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-6 col-lg-3">
                                            <div className="input-group">
                                                <label htmlFor="Date To" className="w-100">To </label>
                                                <Calendar width='222px' height='225px' className="form-control"
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
                            <div className="row" >
                                <div className="col-sm-6 col-lg-3">
                                    <input type="submit" className="btn btn-info btn-block mt-1" value="Submit"
                                        disabled={!this.state.hiddenUserId} />

                                </div>

                                <div className="col-sm-6 col-lg-3">
                                    <input type="button" className="btn btn-default btn-block mt-1" value="Reset" onClick={this.resetDate} />
                                </div>
                            </div>

                        </form>
                    </div>
                    {this.state.leaveData.length > 0 || this.state.data.length > 0 ?
                        <div className="row" style={{ marginTop: '-5px', marginBottom: '20px' }}>
                            <div className="col-sm-12 col-md-6 col-lg-6 ">
                                <div className="divStyle" >
                                    <h5>Project Report</h5>
                                </div>
                               
                                <div className="row">
                                    <div className="col-sm-12" ref="pieChartData" style={{ height: "300px" }} >
                                        {dataChart}
                                    </div>
                                </div>

                            </div>

                            <div className="col-sm-12 col-lg-6 col-md-6">
                                <div className="divStyle">
                                    <h5>Leave Report</h5>
                                </div>
                               
                                <div className="row " >
                                    <div className="col-sm-12" ref="barChartData" style={{ height: "320px" }}>
                                        {dataChart1}
                                    </div>
                                </div>
                            </div>
                        </div> : ''}
                    {this.state.projectTableData.length > 0 ?
                        <div className="row">
                            <div className="col-sm-12">
                                {dataTable}
                            </div>
                        </div> : <p className="text-center mt-5"><strong> </strong></p>}
                </div>
            </React.Fragment>

        )


    }
}


