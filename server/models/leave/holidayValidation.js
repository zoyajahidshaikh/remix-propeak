const config = require("../../config/config");
const Holiday = require("../../models/leave/holiday-model");
var $app = "";
var holidayList = [];
var output = {
    success: false,
    message: "",
    day: "",
    forleaveReduction: [],
    totalCasualLeaves: 0,
    totalSickLeaves: 0,
    date: "",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    saturday: []
}
var input = [];
var holidayValidation = {
    init: function (inputDate, totalCasualLeaves, totalSickLeaves) {
        $app = this;
        output.totalCasualLeaves = totalCasualLeaves;
        output.totalSickLeaves = totalSickLeaves;
        let totalDays = new Date(inputDate.getFullYear(), inputDate.getMonth(), 0).getDate();

        for (let i = 1; i < totalDays; i++) {
            var newDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), i);
            if (newDate.getDay() === 6) {
                output.saturday.push(newDate.getDate());
            }
        }
        this.getHolidayList();
    },
    getHolidayList: function () {
        Holiday.find().then((result) => {
            result.map((value, index) => {
                $app.holidayList.push(value._doc);
                config.holidayList.push(value._doc);
            });
        }).catch((err) => {
        })
    },
    checkHolidays: function (inputDate, holidayList) {
        if (month < 10) {
            month = "0" + month;
        }
        output.date = inputDate.getDate() + "-" + month + "-" + inputDate.getFullYear();
        let response = "";
        if (newLeaveApplication.workingDays > 1) {

            for (var i = 0; i < newLeaveApplication.workingDays; i++) {
                let newDate = new Date(year, month, date);
                for (var i = 0; i < holidayList.length; i++) {
                    validationResult = holidayValidation.checkHolidays(newDate, holidayList[i]);
                    if (validationResult.success) {
                        message += validationResult.message + " ";
                    }
                }
                date -= 1
            }

        }
        else {
            for (var i = 0; i < holidayList.length; i++) {
                let newDate = new Date(year, month, date);
                validationResult = holidayValidation.checkHolidays(newDate, holidayList[i]);
                if (validationResult.success) {
                    break;
                }
            }
        }
        response = $app.checkForHoliday(inputDate, holidayList);
        if (!response.success) {
            response = $app.checkForSunday(inputDate, holidayList);
            if (!response.sucess) {
                response = $app.checkForSaturday(inputDate, holidayList);
            }
        }
        return response;
    },
    checkForHoliday: function (inputDate, holidayList) {
        if (holidayList.date === inputDate.getDate() && holidayList.month === output.months[inputDate.getFullMonth()]) {
            output.success = true;
            output.message = "The selected date " + output.date + " is holiday ";

        }
        return output;
    },
    checkForSunday: function (inputDate, holidayList) {

        if (holidayList.day === inputDate.getDay() + 1) {
            output.success = true;
            if (holidayList.day === "1") {
                isSunday = true
            }

            output.message = "The selected date " + output.date + " is sunday ";

        }
        return output;
    },
    checkForSaturday: function (inputDate, holidayList) {
        if (holidayList.type.toLowerCase() === "even" && (output.saturday.indexOf(inputDate.getDate()) === 1 || output.saturday.indexOf(inputDate.getDate()) === 3)) {
            output.success = true;
            output.message = "The selected date " + output.date + " is non-working saturday  ";
        } else if ((output.saturday.indexOf(inputDate.getDate()) === 0 || output.saturday.indexOf(inputDate.getDate()) === 2)) {
            output.success = true;
            output.message = "The selected date " + output.date + " is working saturday  ";
        }

        return output;
    },
}
module.exports = holidayValidation;