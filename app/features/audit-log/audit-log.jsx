import React, { Component } from 'react';
import * as projectservice from "../../Services/project/project-service";
import DataTable from '../../Components/datatable';
import TaskMenu from '../tasks/task-menu';
import * as dateUtil from '../../utils/date-util';

export default class AuditLog extends Component {
    state = {
        data: [],
        isLoaded: true,
        headers: [
            { title: 'Entity Type', accessor: 'tableName', index: 0 },
            { title: 'Entity Name', accessor: 'name', index: 1 },
            { title: 'Field Name', accessor: 'fieldName', index: 2 },
            { title: 'Old Value', accessor: 'oldValue', index: 3 },
            { title: 'New Value', accessor: 'newValue', index: 4 },
            { title: 'Updated By', accessor: 'updatedBy', index: 5 },
            { title: 'Updated On', accessor: 'updatedOn', index: 6 }
        ],
        projectId: this.props.projectId,
        projectName: '',
        message: '',
        excelHeaders: [
            { label: 'Entity Type', key: 'tableName' },
            { label: 'Entity Name', key: 'name' },
            { label: 'Field Name', key: 'fieldName' },
            { label: 'Old Value', key: 'oldValue' },
            { label: 'New Value', key: 'newValue' },
            { label: 'Updated By', key: 'updatedBy' },
            { label: 'Updated On', key: 'updatedOn' }
        ],
        // hasError: false
    }

    // static getDerivedStateFromError(error) {
    //     // Update state so the next render will show the fallback UI.
    //     // return { hasError: true };
    //     console.log("error", error);
    //     this.setState({
    //         hasError: true
    //     })
    // }

    formatData(data) {
        // console.log("data",data);
        if (data.result && data.result.length > 0) {
            let dataCopy = [...data.result];
            var oldValueDate = '';
            var newValueDate = '';
            let format = dataCopy.map((d) => {
                let updatedDate = dateUtil.DateToLongString(d.updatedOn);

                if (d.fieldName === 'startDate' || d.fieldName === 'endDate' || d.fieldName === 'dateOfCompletion') {
                    if (d.oldValue === '' || d.oldValue === null) {
                        oldValueDate = d.oldValue;
                        newValueDate = dateUtil.DateToLongString(d.newValue);
                    } else {
                        oldValueDate = dateUtil.DateToLongString(d.oldValue);
                        newValueDate = dateUtil.DateToLongString(d.newValue);
                    }
                }
                else {
                    oldValueDate = d.oldValue;
                    newValueDate = d.newValue;
                }

                let objectData = {
                    tableName: d.tableName,
                    name: d.name,
                    fieldName: d.fieldName,
                    oldValue: oldValueDate,
                    newValue: newValueDate,
                    updatedBy: d.updatedBy,
                    updatedOn: updatedDate
                }

                return objectData;
            })

            this.setState({
                data: format,
                projectName: data.msg
            });
        }
    }

    async  componentDidMount() {
        let { response, err } = await projectservice.getProjectAuditLog(this.state.projectId);
        if (err) {
            this.setState({
                message: err
            });
        }
        else if (response && response.data.err) {
            this.setState({ message: response.data.err });
        } else {
            this.formatData(response.data);
        }
        this.setState({
            isLoaded: false
        })
    }

    render() {
        // var d = new Date();
        // var dateTime = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + '_' + d.getHours() + '-'
        //     + d.getMinutes() + '-' + d.getSeconds();
        // if (this.state.hasError) {
        //     console.log("in here")
        //     // You can render any custom fallback UI
        //     return <h3>Something went wrong.</h3>;
        // }
        const dataTable = (
            <DataTable className="data-table"
                title="Audit Report"
                keyField="_id"
                pagination={{
                    enabled: true,
                    pageLength: 50,
                    type: "long"
                }}
                width="100%"
                headers={this.state.headers}
                data={this.state.data ? this.state.data : []}
                projectName={this.state.projectName}
                excelHeaders={this.state.excelHeaders}
                filename={"auditReport_" + this.state.projectName + "_.csv"}
                noData="No records!" />
        );

        return (
            <React.Fragment>
                {this.state.isLoaded ?
                    <div className="logo">
                        <img src="/images/loading.svg" alt="loading" />
                    </div> :

                    <React.Fragment>
                        <div className="col-sm-12 bg-white">
                        <h3 className="project-title d.inline-block mt-3 mb-3" >
                            {this.state.projectName} - Audit Report </h3>
                        
                            <hr/>
                        <div className="row mt-3 mb-3">
                           
                            <div className="col-sm-12" >
                                <TaskMenu {...this.props} />
                            </div>

                        </div>

                        <div className="row">
                            <div className="col-sm-12">
                                {dataTable}

                            </div>
                            </div>
                        </div>
                    </React.Fragment>
                }
            </React.Fragment>
        )
    }
}