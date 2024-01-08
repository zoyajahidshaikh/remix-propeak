import React from 'react';
import './auto-clone.css';
import * as autocloneservice from '../../Services/autoclone/auto-clone-service';

export default class DailyForm extends React.Component {
    constructor(props) {
        super(props);
        this.onSelectPeriodChanged = this.onSelectPeriodChanged.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleCheckbox = this.handleCheckbox.bind(this);
        this.onSelectMonthDayChanged = this.onSelectMonthDayChanged.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    state = {
        periodType: '',
        repeat: '1',
        endNever: true,
        endOnDate: '',
        endAfterOccurances: '',
        repeatOnDate: '',
        repeatOn: '',
        monthlyType: '',
        end: 'endNever',
        day: [],
        projectId: this.props.projectId,
        startDate: '',
        repeatOnDateValue: '',
        monthRepeatOnDayValue: '',
        monthRepeatOnDayValueOccurances: '',
        checkMsg: false,
        message: this.props.message,
        periodList: [
            { id: 1, value: 'day', displayName: 'Day' },
            { id: 2, value: 'week', displayName: 'Week' },
            { id: 3, value: 'month', displayName: 'Month' },
            { id: 4, value: 'year', displayName: 'Year' }
        ],

        repeatOnDay: [
            { id: 1, day: "sunday", value: false },
            { id: 2, day: "monday", value: false },
            { id: 3, day: "tuesday", value: false },
            { id: 4, day: "wednesday", value: false },
            { id: 5, day: "thursday", value: false },
            { id: 6, day: "friday", value: false },
            { id: 7, day: "saturday", value: false }

        ],

        monthRepeatOnDay: [
            { id: 1, day: "sunday", displayName: 'Sunday' },
            { id: 2, day: "monday", displayName: "Monday" },
            { id: 3, day: "tuesday", displayName: 'Tuesday' },
            { id: 4, day: "wednesday", displayName: 'Wednesday' },
            { id: 5, day: "thursday", displayName: 'Thursday' },
            { id: 6, day: "friday", displayName: 'Friday' },
            { id: 7, day: "saturday", displayName: 'Saturday' }
        ],

        MonthOptionList: [
            { id: 1, value: 'repeatondate', displayName: 'Repeat On Date' },
            { id: 2, value: 'repeatonday', displayName: 'Repeat On Day' },
        ],
    }

    // static getDerivedStateFromError(error) {
    //     // Update state so the next render will show the fallback UI.
    //     // return { hasError: true };
    //     console.log("error", error);
    //     this.setState({
    //         hasError: true
    //     })
    // }

    componentDidMount() {
        this.getAutoClonByProjectId()
    }

    async getAutoClonByProjectId() {
        let { response, err } = await autocloneservice.getAutoClonByProjectId(this.props.projectId);
        if (err) {
            this.setState({
                message: err
            });
        }
        else if (response && response.data.err) {
            this.setState({ message: response.data.err });
        } else {
            if (response.data.length > 0) {
                if (response.data[0].day !== undefined && response.data[0].day !== null) {
                    let days = response.data[0].day.split(",");

                    for (let i = 0; i < days.length; i++) {
                        for (let j = 0; j < this.state.repeatOnDay.length; j++) {
                            if (this.state.repeatOnDay[j].day === days[i]) {
                                this.state.repeatOnDay[j].value = true;
                            }
                        }
                    }
                }
                if (response.data[0].endNever !== undefined && response.data[0].endNever !== null) {
                    this.setState({
                        end: 'endNever'
                    })
                }
                if (response.data[0].endOnDate !== undefined && response.data[0].endOnDate !== null) {
                    this.setState({
                        end: 'endAfter'
                    })
                }
                if (response.data[0].endAfterOccurances !== undefined && response.data[0].endAfterOccurances !== null) {
                    this.setState({
                        end: 'endOn'
                    })
                }

                this.setState({
                    _id: response.data[0]._id,
                    projectId: response.data[0].projectId,
                    periodType: response.data[0].periodType,
                    repeat: response.data[0].repeat,
                    endNever: response.data[0].endNever,
                    endOnDate: response.data[0].endOnDate,
                    endAfterOccurances: response.data[0].endAfterOccurances,
                    monthlyType: response.data[0].monthlyType,
                    day: response.data[0].day,
                    repeatOnDateValue: response.data[0].repeatOnDateValue,
                    monthRepeatOnDayValue: response.data[0].monthRepeatOnDayValue,
                    monthRepeatOnDayValueOccurances: response.data[0].monthRepeatOnDayValueOccurances,
                    startDate: response.data[0].startDate

                })
            }
        }
    }

    onSelectPeriodChanged(e) {
        let selectedPeriod = e.target.value;
        const name = e.target.name
        if (name === 'periodType') {
            let repeatOnDay = this.state.repeatOnDay && this.state.repeatOnDay.map((a) => {
                if (a.value === true) {
                    a.value = false
                }
                return a;


            });
            this.setState({
                end: 'endNever',
                endOnDate: '',
                endAfterOccurances: '',
                repeatOnDay: repeatOnDay
            });
        }


        if (this.state.monthlyType === 'repeatonday') {
            this.setState({
                monthRepeatOnDayValueOccurances: '',
                monthRepeatOnDayValue: '',


            })
        }
        else {
            this.setState({

                repeatOnDateValue: ''
            })
        }

        this.setState({
            [name]: selectedPeriod,
            checkMsg: false
        });
    }
    handleInputChange(e) {
        const value = e.target.value;
        const name = e.target.name;
        if (name === 'end') {
            if (this.state.end === 'endAfter') {
                this.setState({
                    endAfterOccurances: '',
                    endNever: false
                })
            }
            if (this.state.end === 'endOn') {
                this.setState({
                    endOnDate: '',
                    endNever: false
                })

            }
            if (this.state.end === 'endNever') {
                this.setState({
                    endNever: true,
                    endOnDate: '',
                    endAfterOccurances: ''
                })
            }
        }

        this.setState({
            [name]: value,
            checkMsg: false
        });
    }

    handleCheck(e) {
        const name = e.target.name;
        const value = e.target.type === 'radio' ? e.target.checked : e.target.value;
        this.setState({
            [name]: value,
            checkMsg: false
        });
    }

    handleCheckbox(e, id) {
        const target = e.target;
        const value = target.checked;

        let checkDay = Object.assign([], this.state.repeatOnDay);
        let day = checkDay.map((r) => {
            if (r.id === id) {
                r.value = value;
            }
            return r;
        })

        this.setState({
            repeatOnDay: day,
            checkMsg: false
        })
    }
    onSelectMonthDayChanged(e) {
        let selectedPeriod = e.target.value;
        const name = e.target.name
        this.setState({
            [name]: selectedPeriod,
            checkMsg: false
        })
    }

    onSubmit(e) {
        e.preventDefault();
        let values = this.state.repeatOnDay && this.state.repeatOnDay.filter((r) => {
            return r.value === true;
        });
        let day = [];
        let startDateId;
        let startDate;
        if (values.length > 0) {
            for (let i = 0; i < values.length; i++) {
                day.push(values[i].day)
            }
        }
        if (this.state.periodType === 'week') {
            if (values.length > 0) {
                for (let i = 0; i < values.length; i++) {
                    startDateId = values[i].id - 1
                }
            }
            var currentDt = new Date();
            var a = currentDt.getDay();
            var b = startDateId - a;
            startDate = new Date();
            startDate.setDate(startDate.getDate() + b);

        }
        else {
            startDate = new Date();
            if (this.state._id) {
                startDate = this.state.startDate;
            }
        }



        let period = {}
        if (this.state._id) {
            period = {
                _id: this.state._id,
                projectId: this.props.projectId,
                periodType: this.state.periodType,
                repeat: this.state.repeat,
                endNever: this.state.endNever,
                endOnDate: this.state.endOnDate,
                endAfterOccurances: this.state.endAfterOccurances,
                monthlyType: this.state.monthlyType,
                day: day,
                repeatOnDateValue: this.state.repeatOnDateValue,
                monthRepeatOnDayValue: this.state.monthRepeatOnDayValue,
                monthRepeatOnDayValueOccurances: this.state.monthRepeatOnDayValueOccurances,
                startDate: startDate

            }

            this.props.onUpdateAutoClone(period)
            this.setState({
                checkMsg: true,
            }
            )
        }
        else {
            period = {
                projectId: this.props.projectId,
                periodType: this.state.periodType,
                repeat: this.state.repeat,
                endNever: this.state.endNever,
                endOnDate: this.state.endOnDate,
                endAfterOccurances: this.state.endAfterOccurances,
                monthlyType: this.state.monthlyType,
                day: day,
                repeatOnDateValue: this.state.repeatOnDateValue,
                monthRepeatOnDayValue: this.state.monthRepeatOnDayValue,
                monthRepeatOnDayValueOccurances: this.state.monthRepeatOnDayValueOccurances,
                startDate: startDate
            }

            this.props.onAddAutoClone(period)
            this.setState({
                periodType: '',
                repeat: '1',
                endNever: false,
                endOnDate: '',
                endAfterOccurances: '',
                repeatOnDate: '',
                repeatOn: '',
                monthlyType: '',
                end: 'endNever',
                day: [],
                projectId: this.props.projectId,
                startDate: '',
                repeatOnDateValue: '',
                monthRepeatOnDayValue: '',
                monthRepeatOnDayValueOccurances: '',
                checkMsg: true,
            })
        }

    }

    render() {
        // if (this.state.hasError) {
        //     console.log("in here")
        //     // You can render any custom fallback UI
        //     return <h3>Something went wrong.</h3>;
        // }
        var { endOnDate, monthRepeatOnDayValueOccurances, repeatOnDateValue, monthRepeatOnDayValue, repeat, periodType, endAfterOccurances,
            monthlyType, end
        } = this.state;
        const labelStyle = {
            fontSize: "small",
        };
        const submitStyle = {
            float: "right",
        };

        let timeList = [];
        timeList.push(<option value='' key="mod">Select </option>)
        this.state.periodList.forEach(function (period, i) {
            timeList.push(<option value={period.value} key={period.value}>{period.displayName}</option>)
        })
        let monthList = [];
        monthList.push(<option value='' key="mod">Select </option>)
        this.state.MonthOptionList.forEach(function (month, i) {
            monthList.push(<option value={month.value} key={month.value}>{month.displayName}</option>)
        })
        let repeatOnDateData = []
        repeatOnDateData.push(<option value='' key="mod">Select Date</option>)
        for (let i = 1; i <= 31; i++) {

            repeatOnDateData.push(<option value={i} key={i}>{i}</option>)
        }
        let repeatOnDayDropdown = [];
        repeatOnDayDropdown.push(<option value='' key="mod">Select </option>)
        for (let i = 1; i < 6; i++) {

            repeatOnDayDropdown.push(<option value={i} key={i}>{i}</option>)
        }

        let values = this.state.repeatOnDay.map((a) => {
            return (
                <span  key={a.id}>
                  

                            <input type='checkbox' placeholder=" " onChange={(e) => { this.handleCheckbox(e, a.id) }} checked={a.value} /> &nbsp;
                    <label style={{ fontSize: "small", marginRight: "7px", textTransform: "capitalize" }}>{a.day}</label>
                      
                </span>)
        })

        let monthRepeatOnDayArray = [];
        monthRepeatOnDayArray.push(<option value='' key="mod">Select</option>)
        this.state.monthRepeatOnDay.forEach(function (day, i) {
            monthRepeatOnDayArray.push(<option value={day.value} key={i}>{day.displayName}</option>)
        })
        return (
            <div className="container" >
                {this.state.checkMsg ? <div><span className="alert alert-success">{this.props.messagesuccess}</span>
                </div> : ""}
                {this.state.message ? <span className="alert alert-danger">{this.state.message}</span> : ""}
                <form onSubmit={this.onSubmit} >

                    <div className="row">
                        <div className="col-sm-6 col-md-4">
                            <div className="form-group">
                                <label htmlFor="repeat" style={labelStyle}>Repeat Every</label>

                                <input type="number" name="repeat" className="form-control"
                                    min="1"
                                    value={repeat}
                                    onChange={this.handleInputChange} />
                            </div>
                        </div>
                        <div className="col-sm-6 col-md-4">
                            <div className="form-group">

                                <label style={labelStyle}>Period/Time</label>
                                <select className="form-control" onChange={this.onSelectPeriodChanged}
                                    value={periodType} name='periodType'>
                                    {timeList}
                                </select>
                            </div>

                        </div>
                    </div>

                    {this.state.periodType === 'week' ?
                        <div>
                            <span> <strong htmlFor="ends" style={labelStyle}>Repeat On : &nbsp;  </strong></span>

                            {values}</div>
                        : ''
                    }

                    {this.state.periodType === 'month' ?
                        <div className="row">

                            <div className="col-sm-6 col-md-4">
                                <div className="form-group">
                                    <label style={labelStyle}>Monthly Select</label>
                                    <select className="form-control" onChange={this.onSelectPeriodChanged}
                                        name='monthlyType'
                                        value={monthlyType}>
                                        {monthList}
                                    </select>
                                </div>
                            </div>
                        </div>


                        : ''
                    }
                    {this.state.periodType === 'month' &&
                        this.state.monthlyType === 'repeatondate' ?
                        <div className="row">

                            <div className="col-sm-6 col-md-4">
                                <div className="form-group">
                                    <select className="form-control" onChange={this.onSelectPeriodChanged}
                                        name='repeatOnDateValue'
                                        value={repeatOnDateValue}>
                                        {repeatOnDateData}
                                    </select>
                                </div>
                            </div>
                        </div>
                        : ''
                    }
                    {this.state.periodType === 'month' && this.state.monthlyType === 'repeatonday' ?
                        <div className="row">
                            <div className="col-sm-6 col-md-4">
                                <div className="form-group">
                                    <select className="form-control" onChange={this.onSelectPeriodChanged}
                                        name='monthRepeatOnDayValue' value={monthRepeatOnDayValue}>
                                        {monthRepeatOnDayArray}
                                    </select>
                                </div>
                            </div>
                        </div> : ''
                    }
                    <br />
                    {this.state.periodType === 'month' && this.state.monthRepeatOnDayValue !== '' ?
                        <div className="row">
                            <div className="col-sm-6 col-md-4">
                                <div className="form-group">
                                    <select className="form-control" onChange={this.onSelectMonthDayChanged}
                                        name='monthRepeatOnDayValueOccurances' value={monthRepeatOnDayValueOccurances}>
                                        {repeatOnDayDropdown}
                                    </select>
                                </div>

                            </div>
                        </div> : ''
                    }


                    <div className="row">
                        <label htmlFor="ends" style={labelStyle}>End</label>
                        <div className="col-sm-6 col-md-4">
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-sm-6 col-md-4">
                                        <div className="form-group">
                                            <input type="radio" checked={end === "endNever" ? true : false} onChange={this.handleInputChange} value="endNever" name="end" /> Never &nbsp;
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-4 col-md-4">
                                        <div className="form-group">
                                            <input type="radio" checked={end === "endOn" ? true : false} onChange={this.handleInputChange} value="endOn" name="end" /> On &nbsp;
                                        </div>
                                    </div>
                                    <div className="col-sm-8 col-md-8">
                                        <div className="form-group">
                                            <input className="form-control" type='Date' name="endOnDate"
                                                onChange={this.handleInputChange} value={endOnDate} disabled={this.state.end === 'endOn' ? false : true} />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-4 col-md-4">
                                        <div className="form-group">

                                            <input type="radio" checked={end === "endAfter" ? true : false} onChange={this.handleInputChange} value="endAfter" name="end" /> After &nbsp;

                                </div>
                                    </div>
                                    <div className="col-sm-6 col-md-6">
                                        <div className="form-group">
                                            <input type="number" name="endAfterOccurances" className="form-control" min="1"
                                                value={endAfterOccurances} onChange={this.handleInputChange} disabled={this.state.end === 'endAfter' ? false : true} />
                                        </div>
                                    </div>
                                    <div className="col-sm-2 col-md-2">
                                        <div className="form-group">
                                            Occurances
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="form-group">
                                <input type="submit" value="Save"
                                    className="btn btn-info btn-md mb-3" style={submitStyle} />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}