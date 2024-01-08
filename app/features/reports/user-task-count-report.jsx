import React from 'react';
import '../../app.css';
import * as UserTaskCountReportService from '../../Services/reports/user-task-count-reports-service';
import DataTable from '../../Components/datatable';


export default class UserTaskCountReport extends React.Component {
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

    state = {
        year: -1,//new Date().getFullYear(),
        month: -1,//"0" + new Date().getMonth(),
        userTaskCountReports: 'User Task Count Report',
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
            { title: "User Name", accessor: "userName", index: 1 },
            { title: "Total Task", accessor: "taskCount", index: 2 },
            { title: "Total Story Point", accessor: "storyPoint", index: 3 },
            { title: "Total Working Hours", accessor: "workingHours", index: 4 },
            { title: "Total Working Hours(in %)", accessor:"percentage",index:5}
           
        ],
        years: this.yearList(),
        monthList: [{ name: "January", id: 1 }, { name: "February", id: 2 }, { name: "March", id: 3 }, { name: "April", id: 4 },
        { name: "May", id: 5}, { name: "June", id: 6 }, { name: "July", id: 7 }, { name: "August", id: 8 }, { name: "September", id: 9 },
        { name: "October", id: 10 }, { name: "November", id: '11' }, { name: "December", id: '12' }],
        excelHeaders: [
            { label: 'User Name', key: 'userName' },
            { label: 'Total Task ', key: 'taskCount' },
            { label: 'Total Story Point', key: 'storyPoint' },
            {
                label: 'Total Working Hours', key:'workingHours'
            },
              {
                label: 'Total Working Hours(in %)', key: 'percentage'
            }

        ],
        hiddenUserId: "",
        userNameToId: this.props.context.state.userNameToId,
        project: [],
    }

    async getReportData(e) {
        e.preventDefault();

        let userId = this.state.userNameToId && this.state.userNameToId[this.state.hiddenUserId.toLowerCase().replace(/ +/g, "")];
      
        let reportParams = {
            year: this.state.year,
            month: this.state.month,
            userId: userId
        }
        let { response, err } = await UserTaskCountReportService.getUserTaskCountReport(reportParams);
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
            let keys = Object.keys(response.data.data[0] && response.data.data[0])
            let nameArray=[]
            for (let i = 0; i < keys.length; i++){
                for (let j = 0; j < this.state.users.length; j++){
                    if (keys[i] === this.state.users[j]._id) {
                     let name ={
                         id: keys[i],
                         name: this.state.users[j].name
                        }
                        nameArray.push(name)
                        
                    }
                }
            }
            let dataArray = [];
            for (let i = 0; i < keys.length; i++) {
                let names = nameArray.filter((n) => {
                    return n.id === keys[i];
                })
                response.data.data[0][keys[i]].userName = (names && names.length > 0) ? names[0].name : "";
                dataArray.push(response.data.data[0][keys[i]]);
              
            }   
            this.setState({
                ...this.state,
                data: dataArray
            });
        }
    }

    resetDate() {
        this.setState({
            year: -1,
            month: -1,
            hiddenUserId: '',
            data:[]
        })
    }

    handleInputChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        let msg = '';
        this.setState({
            ...this.state,
            [name]: value,
            message: msg,
            noRecordsMsg: ''

        });
    }
    async componentDidMount() {
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
                title="User StoryPoint Statistics"
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
                userTaskCountReports={this.state.userTaskCountReports}
                excelHeaders={this.state.excelHeaders}
                filename={'userReport_' + dateTime + '.csv'}
                projectName='user_Report'
                noData="No records!" />
        );
        let users = [];
     
            users = this.state.users.map((u) => {
                return <option key={u._id} data-value={u._id}>{u.name}</option>
            });
   

        return (
            <React.Fragment>
               <div className="container bg-white">
                          <h3 className="project-title" >Member's StoryPoint Statistics</h3>
                          <hr/>
                    {this.state.message || this.state.noRecordsMsg ?                 
                    <div className="row">
                        <div className="col-sm-12">
                            <span style={{ color: 'red' }}>{this.state.message}</span>
                            <span style={{ color: 'red' }}>{this.state.noRecordsMsg}</span>

                        </div>
                    </div>
                    :''}
                    <form onSubmit={this.getReportData} className="form-wrapper">
                        <div className="row">
                            <div className="form-group col-sm-4">
                                <label htmlFor="Select User" style={labelStyle}>Select User</label>
                                <input type="text" value={this.state.hiddenUserId} list="data" onChange={this.handleInputChange}
                                    name="hiddenUserId" className="form-control" autoComplete="off" placeholder="Select User" />
                                <datalist id="data" >
                                    {
                                        users
                                    }
                                </datalist>
                            </div>
                        
                            <div className="form-group col-sm-4">
                                <label htmlFor="Year" style={labelStyle}>Year</label><span style={{ color: 'red' }}>*</span>
                                <select onChange={this.handleInputChange} name="year" className="form-control" value={this.state.year}>
                                    <option value="" >Select Year</option>
                                    {years}
                                </select>
                            </div>
                            <div className="form-group  col-sm-4">
                                <label htmlFor="Month" style={labelStyle}>Month</label>
                                <select onChange={this.handleInputChange} name="month" className="form-control" value={this.state.month}>
                                    <option value="" >Select Month</option>
                                    {months}
                                </select>
                            </div>
                        </div>
                        <div className="row">
                        <div className="col-sm-6 col-lg-8"></div>
                            <div className="form-group col-sm-3 col-lg-2">
                                <input type="submit" className="btn btn-info btn-block mt-1" value="Submit"
                                   disabled={this.state.month !== -1 ? this.state.year === -1 ||this.state.year === -1 :
                                        this.state.year === -1}
                                
                                />
                            </div>
                            <div className="col-sm-3 col-lg-2">
                                <input type="button" className="btn btn-default btn-block mt-1" value="Reset" onClick={this.resetDate} />
                            </div>
                        </div>
                    </form>

                    {this.state.isLoaded ?
                        <div className="logo">
                            <img src="/images/loading.svg" alt="loading" />
                        </div>
                        :
                        this.state.data.length > 0 ?
                            <div className="row">
                                <div className="col-sm-12">
                                    {dataTable}
                                </div>
                            </div> : <p className="text-center mt-5"><strong>  Please select a Member to view the report</strong></p>
                    }
                </div>
            </React.Fragment>
        )
    }
}