import React from 'react';
import DailyForm from './daily-form';
import * as autocloneservice from '../../Services/autoclone/auto-clone-service';

export default class AutoCloneType extends React.Component {
    constructor(props) {
        super(props);
        this.onSelectPeriodChanged = this.onSelectPeriodChanged.bind(this);
        this.onAddAutoClone = this.onAddAutoClone.bind(this);
        this.onUpdateAutoClone = this.onUpdateAutoClone.bind(this);
    }
    state = {
        period: '',
        periodList: [
            { id: 5, value: 'custom', displayName: 'Custom' }
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

    onSelectPeriodChanged(e) {
        let selectedPeriod = e.target.value;
        this.setState({
            period: selectedPeriod
        });
    }

    async onAddAutoClone(period) {

        let { response, err } = await autocloneservice.addAutoClone(period);
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
                messagesuccess: response.data.msg
            })
        }
    }

    async onUpdateAutoClone(period) {

        let { response, err } = await autocloneservice.updateAutoClone(period);
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
                messagesuccess: response.data.msg
            })
        }
    }

    render() {
        // if (this.state.hasError) {
        //     console.log("in here")
        //     // You can render any custom fallback UI
        //     return <h3>Something went wrong.</h3>;
        // }
        var { period } = this.state;
        const labelStyle = {
            fontSize: "small",
        };

        let timeList = [];
        timeList.push(<option value='' key="mod">Select Period</option>)
        this.state.periodList.forEach(function (period, i) {
            timeList.push(<option value={period.value} key={period.value}>{period.displayName}</option>)
        })
        return (
            <div className="container-fluid" >
                <form onSubmit={this.onSubmit} className="mt-3">

                    <div className="row">
                        <div className="col-sm-6">
                            <div className="form-group">

                                <label style={labelStyle}>Period/Time</label>
                                <select className="form-control" onChange={this.onSelectPeriodChanged}
                                    value={period}>
                                    {timeList}
                                </select>
                            </div>

                        </div>
                    </div>
                </form>
                {this.state.period === 'custom' ?
                    <DailyForm projectId={this.props.projectId} onAddAutoClone={this.onAddAutoClone} onUpdateAutoClone={this.onUpdateAutoClone}
                        messagesuccess={this.state.messagesuccess} message={this.state.message}
                    /> : ''
                }
            </div>
        );
    }
}