import React from 'react';
import '../../app.css';
import * as ActiveUserReportService from '../../Services/reports/active-users-report-service';
import DataTable from '../../Components/datatable';
//import * as dateUtil from '../../utils/date-util';
//import TaskMenu from '../tasks/task-menu';
// import UserReportsCalendarView from './user-reports-calendar-view';
// import * as projectservice from '../../Services/project/project-service';



export default class ActiveUserReport extends React.Component {
    // constructor(props) {
    //     super(props);
    // } 
    state = {
        headers: [
            { title: "Name", accessor: "name", index: 1 },
            { title: "Email ", accessor: "email", index: 2 },
            { title: "Company Name", accessor: "companyName", index: 3 },


        ],
    }
    componentDidMount() {
        this.getActiveUsersReport()
    }

    async getActiveUsersReport() {
        let { response, err } = await ActiveUserReportService.getActiveUsersReport();
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
            // console.log(response);
            if (response.data.length > 0) {
                this.setState({ data: response.data })
            }
        }
    }
    render() {
        const dataTable = (
            <DataTable className="data-table"
                title="Active User Report"
                keyField="id"
                pagination={{
                    enabled: true,
                    pageLength: 50,
                    type: "long"  // long,short
                }}
                width="100%"
                headers={this.state.headers}
                data={this.state.data ? this.state.data : []}
                // dataExcel={dataExcel}
                noData="No records!" />
        );
        return (
            <React.Fragment>
                <div className="container bg-white">
                    {/* <h3 className="project-title project-title mb-3 mt-4">Active User Report</h3> */}
                    <div className="row">
                    <div className="col-sm-12">
                        {dataTable}
                    </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}