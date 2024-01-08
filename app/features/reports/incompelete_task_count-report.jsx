import React from 'react';
import '../../app.css';
import * as IncompeleteTaskReportsService from '../../Services/reports/incompelete_task_reports-service';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from 'recharts';


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

export default class IncompeleteTaskCountReport extends React.Component {
    constructor(props) {
        super(props);
        this.getReportData = this.getReportData.bind(this);
    }
    state = {
        users: this.props.context.state.users,
        data: [],
        isLoaded: true,
        userNameToId: this.props.context.state.userNameToId,
        project: [],
    }

    async getReportData() {
        let { response, err } = await IncompeleteTaskReportsService.getIncompleteTaskCountReport();
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
            let keys = Object.keys(response.data && response.data.data[0])
            let nameArray = []
            for (let i = 0; i < keys.length; i++) {
                for (let j = 0; j < this.state.users.length; j++) {
                    if (keys[i] === this.state.users[j]._id) {
                        let name = {
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



    async componentDidMount() {
        if (this.state.users.length === 0) {
            this.props.context.actions.setUsers();
        }
        this.getReportData()
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
        const CustomLabelList = (props) => {

            const { x, y, stroke, value, payload } = props;

            return (
                //   <text x={x} y={y} fontSize={12} width={20}  angle={45} >{value}</text>
                <g transform={`translate(${x},${y})`}>
                    <text
                        x={0}
                        y={0}
                        width={20}
                        scaleToFit={true}
                        fontSize={12}
                        fill="#666"
                        transform="rotate(-45)">
                        {payload.value}
                    </text>
                </g>
            )
        };

        const dataChart = (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={this.state.data ? this.state.data : []}

                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    {/* <CartesianGrid strokeDasharray="3 3" /> */}
                    {/* <XAxis dataKey="userName" padding={{ left: 10 }} minTickGap={10}   tick={<TiltedAxisTick />} height={100}/> */}
                    {/* angle={-50}tick={<CustomizedAxisTick />}  */}
                    <XAxis dataKey="userName" tick={<TiltedAxisTick />} minTickGap={10} interval={0} />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" position="middle" />
                    <Bar name=" New Task Count" dataKey="newtaskCount" stackId="a" fill="#00C49F" ></Bar>
                    <Bar name=" Inprogress Task Count" dataKey="inprogresstaskCount" stackId="a" fill="#FFBB28" />
                    {/* <LabelList dataKey="userName" position="top" angle="45"  content={<CustomLabelList/>}/></Bar> */}
                </BarChart>
            </ResponsiveContainer>
        )

        return (
            <React.Fragment>
                <div className="">

                    <h3 className="project-title" >Member Incomplete Task Count Report</h3>
                    <hr />


                    {this.state.isLoaded ?
                        <div className="logo">
                            <img src="/images/loading.svg" alt="loading" />
                        </div>
                        :
                        <div>
                            <div className="row ">
                            <div className="col-lg-9 col-sm-12 col-md-12 " style={{ height: "350px" }}>
                                        {dataChart}
                                    </div>
                                </div>
                           
                        </div>
                    }
                </div>
            </React.Fragment>
        )
    }
}
