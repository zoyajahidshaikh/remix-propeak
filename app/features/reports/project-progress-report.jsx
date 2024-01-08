import React from 'react';
import '../../app.css';
import './reports.css';
import * as ProjectProgressReportsService from '../../Services/reports/project-progress-reports-service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,ResponsiveContainer } from 'recharts';
//import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';

export default class ProjectProgressReport extends React.Component {
    constructor(props) {
        super(props);
        this.getReportData = this.getReportData.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.reset=this.reset.bind(this)
    }
    state = {
        projectData: this.props.context.state.projectData,
        data: [],
        isLoaded: true,
        hiddenProjectId: "",
    }
    async getReportData(e) {
        e.preventDefault()
        let project = this.state.projectData.filter((p) => {
            return p.title === this.state.hiddenProjectId
        });

        let projectId = project.length > 0 ? project[0]._id : ''

        let { response, err } = await ProjectProgressReportsService.getProjectProgressReport(projectId);
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
           
            this.setState({
                data: response.data && response.data.data
            })
        }

    }
    async componentDidMount() {
        if (this.state.projectData.length === 0) {
            this.props.context.actions.getProjectDetails();
        }
        this.setState({
            isLoaded: false
        })

    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            projectData: nextProps.context.state.projectData
        })
    }
    handleInputChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;


        this.setState({
            ...this.state,
            [name]: value,

        });
    }
    reset(){
        this.setState({
            data: [],
            hiddenProjectId: ''
        })
    }

    render() {
        let projects = [];
        const labelStyle = {
            fontSize: "small",
        };
        // console.log("data", this.state.data);
        projects = this.state.projectData.map((u) => {
            return <option key={u._id} data-value={u._id}>{u.title}</option>
        });
        const dataChart = (
            <ResponsiveContainer width="100%" height="100%">
            <LineChart  className="datachart" data={this.state.data ? this.state.data : []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend className="reportscrollbar" verticalAlign="bottom" align="center" layout="horizontal"/>
                <Line type="monotone" name=" Todo" dataKey="todo" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" name=" Inprogress" dataKey="inprogress" stroke="#ffc658" />
                <Line type="monotone" name=" Completed" dataKey="completed" stroke="#82ca9f" />
            </LineChart>
            </ResponsiveContainer>
        )
       
        const dataChart1 = (
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={this.state.data ? this.state.data : []}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend className="reportscrollbar" verticalAlign="bottom" align="center" layout="horizontal"/>
                <Line type="monotone" name=" Todo SP" dataKey="todoStoryPoint" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" name=" Inprogress SP" dataKey="inprogressStoryPoint" stroke="#ffc658" />
                <Line type="monotone" name=" Completed SP" dataKey="completedStoryPoint" stroke="#82ca9f" />
            </LineChart>
            </ResponsiveContainer>
        )

        return (
            <React.Fragment>
               <div className="">
                            <h3 className="project-title" >Project Progress Report</h3>
                            <hr/>
                    <form onSubmit={this.getReportData} className="form-wrapper">
                        <div className="row">
                            <div className="form-group col-sm-6 col-lg-3">
                                <input type="text" value={this.state.hiddenProjectId} style={labelStyle} list="data" onChange={this.handleInputChange}
                                    name="hiddenProjectId" className="form-control" autoComplete="off" placeholder="Select Project" />
                               { this.state.hiddenProjectId && 
                                <span onClick={this.reset} className="fa fa-times-circle rounded-0 close-circle" style={{position: 'absolute', top: '11px', right: '50px', cursor: 'pointer'}}></span>
                            }                           
                               <datalist id="data" >
                                    {
                                        projects
                                    }
                                </datalist>
                            </div>
                            <div className="form-group col-sm-3 col-lg-2">
                                <input type="submit" className="btn btn-info btn-block" value="Submit" style={{height:'35px'}}
                                    disabled={!this.state.hiddenProjectId} />
                            </div>
                        </div>
                    </form>

                    {this.state.isLoaded ?
                        <div className="logo">
                            <img src="/images/loading.svg" alt="loading" />
                        </div>
                        :
                        <div>
                            {this.state.data.length>0 ? 
                            <div><span className="mb-1">(SP:Storypoint)</span>
                                <div className="row" >
                                    <div className="col-lg-6 col-sm-12 col-md-9" style={{ height: "300px" }}>
                                      
                                            {dataChart}
                                        
                                    </div>
                                    <div className="col-lg-6 col-sm-12 col-md-9 " style={{ height: "300px" }}>
                                            
                                            {dataChart1}
                                      
                                    </div>
                                </div> </div>: 
                                <p className="text-center mt-5"><strong>  Please select a project to view the report</strong></p>
                                }


                        </div>
                    }
                </div>
            </React.Fragment>
        )
    }
}