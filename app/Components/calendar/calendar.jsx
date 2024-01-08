import React from 'react';
import moment from 'moment';

import './calendar.css';
import './modal.css'

export default class Calendar extends React.Component {
    constructor(props) {
        super(props);

        this.width = props.width || "250px";
        this.style = props.style || {};
        this.style.width = this.width 
        this.state = {
            dateContext: moment(),
            today: moment(),
            showMonthPopup: false,
            showYearPopup: false,
            selectedDay: this.props.selectedDate ? moment(this.props.selectedDate).format('DD') : "",
            selectedMonth: this.props.selectedDate ? moment(this.props.selectedDate).format('MM') : "",
            selectedYear: this.props.selectedDate ? moment(this.props.selectedDate).format('YYYY') : "",
            selectedDate: moment().format('YYYY-MM-DD'),
            dateValue: this.props.selectedDate ? moment(this.props.selectedDate).format('YYYY-MM-DD') : "",
            toggleModel: false
        }
    }


    weekdays = moment.weekdays(); //["Sunday", "Monday", "Tuesday", "Wednessday", "Thursday", "Friday", "Saturday"]
    weekdaysShort = moment.weekdaysShort(); // ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    months = moment.months();

    year = () => {

        return this.state.dateContext.format("YYYY");
    }
    month = () => {
        return this.state.dateContext.format("MMMM");
    }
    daysInMonth = () => {
        return this.state.dateContext.daysInMonth();
    }
    currentDate = () => {
        // console.log("currentDate: ", this.state.dateContext.get("date"));
        return this.state.dateContext.get("date");
    }
    currentDay = () => {
        return this.state.dateContext.format("DD");
    }

    firstDayOfMonth = () => {
        let dateContext = this.state.dateContext;
        let firstDay = moment(dateContext).startOf('month').format('d'); // Day of week 0...1..5...6
        return firstDay;
    }

    setMonth = (month) => {
        let monthNo = this.months.indexOf(month);
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).set("month", monthNo);
        this.setState({
            dateContext: dateContext,
            selectedMonth: dateContext.format('MM'),
            dateValue: dateContext.format('YYYY-MM-DD'),
            selectedDate: dateContext.format('YYYY-MM-DD')
        }, () => {
            // console.log('States : ' + this.state);
            this.props.dateUpdate(this.state.selectedDate);
        })
    }

    nextMonth = () => {
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).add(1, "month");
        this.setState({
            dateContext: dateContext
        });
        this.props.onNextMonth && this.props.onNextMonth();
    }

    prevMonth = () => {
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).subtract(1, "month");
        this.setState({
            dateContext: dateContext
        });
        this.props.onPrevMonth && this.props.onPrevMonth();
    }

    onSelectChange = (e, data) => {
        this.setMonth(data);
        this.props.onMonthChange && this.props.onMonthChange(e, this.state.selectedDay, data, this.state.selectedYear);
    }

    SelectList = (props) => {
        let popup = props.data.map((data) => {
            return (
                <div key={data}>
                    <a onClick={(e) => { this.onSelectChange(e, data) }}>
                        {data}
                    </a>
                </div>
            );
        });

        return (
            <div className="month-popup">
                {popup}
            </div>
        );
    }

    onChangeMonth = (e, day, month, year) => {
        this.setState({
            showMonthPopup: !this.state.showMonthPopup
        });
    }

    MonthNav = () => {
        return (
            <span className="label-month"
                onClick={(e) => { this.onChangeMonth(e, this.month()) }}>
                {this.month()}
                {this.state.showMonthPopup &&
                    <this.SelectList data={this.months} />
                }
            </span>
        );
    }

    showYearEditor = () => {
        this.setState({
            showYearNav: true
        });
    }

    setYear = (year) => {
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).set("year", year);
        let selectedDate = dateContext.format('YYYY-MM-DD')
        this.setState({
            dateContext: dateContext,
            selectedYear: year,
            dateValue: dateContext.format('YYYY-MM-DD')
        })
        // console.log("slectedDate in set year", selectedDate);
        this.props.dateUpdate(selectedDate);

    }
    onYearChange = (e) => {
        this.setYear(e.target.value);
        this.props.onYearChange && this.props.onYearChange(e, this.state.selectedDay, this.state.SelectedMonth, e.target.value);
    }

    onKeyUpYear = (e) => {
        if (e.which === 13 || e.which === 27) {
            this.setYear(e.target.value);
            this.setState({
                showYearNav: false
            })
        }
    }

    YearNav = () => {
        return (
            this.state.showYearNav ?
                <input
                    defaultValue={this.year()}
                    className="editor-year"
                    ref={(yearInput) => { this.yearInput = yearInput }}
                    onKeyUp={(e) => this.onKeyUpYear(e)}
                    onChange={(e) => this.onYearChange(e)}
                    type="number"
                    placeholder="year" />
                :
                <span
                    className="label-year"
                    onDoubleClick={(e) => { this.showYearEditor() }}>
                    {this.year()}
                </span>
        );
    }

    onDayClick = (e, day, month, year) => {
        month = (this.state.dateContext).format('MM');
        year = (this.state.dateContext).format('YYYY');
        let selectedDate = `${year}-${month}-${day}`;
        // let selectedDate = `${day}-${month}-${year}`

        // console.log("slectedDate", selectedDate);
        let dateContext = moment(selectedDate);
        // console.log("dateContext", dateContext);
        this.setState({
            selectedDay: day,
            dateContext: dateContext,
            selectedMonth: dateContext.format('MM'),
            selectedYear: dateContext.format('YYYY'),
            selectedDate: selectedDate,
            dateValue: moment(selectedDate).format('YYYY-MM-DD')
        }, () => {
            // console.log('States : ' + this.state);
            this.props.dateUpdate(this.state.dateValue);
            this.hideCalendarModal();
        });
        //  this.props.dateUpdate(moment(selectedDate));
    }
    //--------------------------- Date Change in Text Box----------------------------
    changeDate = (e) => {
        if (!e.target.value) {
            this.props.dateUpdate('');
            // this.setState({
            //     selectedDate: selectedDate,
            //     dateValue: 'YYYY-MM-DD',
            //     dateContext: moment(selectedDate)
            // })
        }
        else {
            let date = moment(e.target.value, [this.props.dateformat, 'YYYY-MM-DD'], true);
            // let selectedDate = `${this.state.selectedYear}-${this.state.selectedMonth}-${this.state.selectedDay}`

            // console.log("selectedDate", selectedDate);
            if ((!date.isValid()) === true) {
                alert(`Please Enter ${this.props.id} in correct Format`);
                this.props.dateUpdate('');
                // this.setState({
                //     selectedDate: selectedDate,
                //     dateValue: moment(selectedDate).format('YYYY-MM-DD'),
                //     dateContext: moment(selectedDate)
                // })
            }
            else {
                let updateDate = e.target.value;
                this.setState({
                    selectedDay: moment(updateDate).format('DD'),
                    selectedMonth: moment(updateDate).format('MM'),
                    selectedYear: moment(updateDate).format('YYYY'),
                    selectedDate: moment(updateDate).format('YYYY-MM-DD'),
                    dateContext: moment(updateDate)

                }, () => {
                    // console.log('States : ' + this.state);
                    this.props.dateUpdate(this.state.selectedDate);
                })
                //this.props.dateUpdate(this.state.selectedDate);

            }
        }
    }

    //-------------------  OnTExtChange---------------------------------
    onTextChange = (e) => {
        this.setState({
            dateValue: e.target.value
        })
    }
    //--------------------- Toggle Hide and show------------------------------

    selectedDate = (day, month, year) => {
        var tbl = document.getElementById("monthDays");
        var monthHead = document.getElementById('cal-head-month').innerText;
        var yearHead = document.getElementById('cal-head-year').innerText;
        var valfound = false
        if (tbl != null & monthHead != null & yearHead !== null) {

            for (var i = 1; i < tbl.rows.length; i++) {

                for (var j = 0; j < tbl.rows[i].cells.length; j++) {

                    let cell = tbl.rows[i].cells[j]
                    if (day === cell.innerText.trim() && monthHead === this.state.selectedMonth) {
                        cell.setAttribute('class', 'day selected-day')
                        valfound = !valfound;
                    }
                    else {
                        cell.setAttribute('class', 'day')
                    }
                }

            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
            this.setState({
                selectedDay: nextProps.selectedDate ? moment(nextProps.selectedDate).format('DD') : "",
                selectedMonth: nextProps.selectedDate ? moment(nextProps.selectedDate).format('MM') : "",
                selectedYear: nextProps.selectedDate ? moment(nextProps.selectedDate).format('YYYY') : "",
                // selectedDate: nextProps.selectedDate ? moment().format('YYYY-MM-DD') : "",
                dateValue: nextProps.selectedDate ? moment(nextProps.selectedDate).format('YYYY-MM-DD') : "",
            })
        }

    }


    //------------------Component Did Mount ------------------------

    componentDidUpdate(prevState) {
        // if (this.state.selectedDate) {
        let date = moment(this.state.selectedDate);
        let day = moment(date).format('DD');
        let month = (moment(date).format('MM'));
        let year = moment(date).format('YYYY');

        this.selectedDate(day, month, year)
        // } else {
        //     this.selectedDate("","", "")
        // }

    }
    //-------------------------------- Model Show and Hide --------------------
    hideCalendarModal = () => {
        var modal = document.getElementById(`${this.props.calendarModalId}`);
        modal.style.display = '';
    }

    ShowCalendarModel = (e) => {
        e.preventDefault();
        // console.log("this.props.calendarModalId", this.props.calendarModalId);
        var modal = document.getElementById(`${this.props.calendarModalId}`);
        var calendarPosition = document.getElementById(`${this.props.id}`);
        // alert(JSON.stringify(calendarPosition.getBoundingClientRect()))
        modal.style.display = "block";
        modal.style.right = `${calendarPosition.getBoundingClientRect().left}px`
        modal.style.marginTop = '68px';
        modal.style.marginLeft = '15px';

    }

    //-                   Render function------------------------------

    render() {

        // console.log("this.state.dateValue", this.state.dateValue);
        //ModelCode
        // console.log("moment", moment());
        // Map the weekdays i.e Sun, Mon, Tue etc as <td>
        let weekdays = this.weekdaysShort.map((day) => {
            return (
                <td key={day} className="week-day">{day}</td>
            )
        });

        let blanks = [];
        for (let i = 0; i < this.firstDayOfMonth(); i++) {
            blanks.push(<td key={i * 80} className="emptySlot">
                {""}
            </td>
            );
        }

        // console.log("blanks: ", blanks);

        let daysInMonth = [];
        for (let d = 1; d <= this.daysInMonth(); d++) {
            // let className = (d === this.currentDay() ? "day current-day": "day");
            // let selectedClass = (d === this.state.selectedDay ? " selected-day " : "")
            daysInMonth.push(
                <td key={d} className={'day'}>
                    <span onClick={(e) => { this.onDayClick(e, d, this.state.selectedMonth, this.state.selectedYear) }}>{d}</span>
                </td>
            );
        }


        // console.log("days: ", daysInMonth);

        var totalSlots = [...blanks, ...daysInMonth];
        let rows = [];
        let cells = [];

        totalSlots.forEach((row, i) => {
            if ((i % 7) !== 0) {
                cells.push(row);
            } else {
                let insertRow = cells.slice();
                rows.push(insertRow);
                cells = [];
                cells.push(row);
            }
            if (i === totalSlots.length - 1) {
                let insertRow = cells.slice();
                rows.push(insertRow);
            }
        });

        let trElems = rows.map((d, i) => {
            return (
                <tr key={i * 100}>
                    {d}
                </tr>
            );
        })


        return (<React.Fragment>
            <input type="text" id={this.props.id} className={`input-display input-cal ${this.props.className}`} value={this.state.dateValue} onChange={this.onTextChange}
                onBlur={this.changeDate} autoComplete="off" placeholder={this.props.dateformat}
                dateformat={this.props.dateformat} disabled={this.props.disabled}
            />
            <button onClick={this.ShowCalendarModel} className='input-display btn-cal'><i className="far fa-calendar-alt"></i></button>
            <div id={this.props.calendarModalId} className='modal'>
                <div className="modal-content"  id="small-calendar">
                    <span className="close pr-2" onClick={this.hideCalendarModal}>&times; </span>

                    <div className="calendar-container" style={this.style}>
                        <table className="calendar">
                            <thead>
                                <tr className="calendar-header">
                                    <td colSpan="5" >
                                        <span id='cal-head-month'><this.MonthNav /></span>
                                        {" "}
                                        <span id='cal-head-year'><this.YearNav /></span>
                                    </td>
                                    <td colSpan="2" className="nav-month" >
                                        <i className="prev fa fa-fw fa-chevron-left"
                                            onClick={(e) => { this.prevMonth() }}>
                                        </i>
                                        <i className="prev fa fa-fw fa-chevron-right"
                                            onClick={(e) => { this.nextMonth() }}>
                                        </i>

                                    </td>
                                </tr>
                            </thead>
                            <tbody id='monthDays'>
                                <tr>
                                    {weekdays}
                                </tr>
                                {trElems}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </React.Fragment>
        );
    }
}
