
const axios = require('axios');
const express = require('express');
var schedule = require('node-schedule');
const config = require('./config');
const nodemailer = require('nodemailer');
const {
    logError,
    logInfo
} = require('../server/common/logger.js');
const {
    sendEmail
} = require('../server/common/mailer');

const dateUtil = require('../server/utils/date-util');
var moment = require('moment');

var j = schedule.scheduleJob(config.projectAutoCloneSchedule, function () {
    logInfo('Project Auto Clone Scheduler started');
    axios({
                method: 'get',
                responseType: 'json',
                headers: {
                    'token': config.tokenKey
                  },
                url: config.url + '/projectAutoCloneScheduler/getdata',
              
            })
    .then((response) => {
       
        if(response.data.result !== undefined){
            let result =response.data.result;
            
            for (var i = 0; i < result.length; i++) {
                if (result[i].periodType === "day") {
                    let currentDate= dateUtil.DateToString(new Date());
                
                    let startDate= dateUtil.DateToString(result[i].startDate);
                
                    currentDate =new Date(currentDate)
                    startDate =new Date(startDate);
                    let dateDiff= currentDate - startDate;
                    let dayDiff =Math.ceil(dateDiff / (1000 * 3600 * 24));
                

                    let noOfOccurence = dayDiff / result[i].repeat;

                    if(!!result[i].endOnDate){
                        if(currentDate > new Date(result[i].endOnDate)){
                            continue ;
                        }
                    }

                    if(!!result[i].endAfterOccurances){
                        if(noOfOccurence >= result[i].endAfterOccurances){
                            continue;
                        }
                    }
                    if(dayDiff % result[i].repeat === 0){
                        check=true;
                        cloneProject(result[i].projectId);

                        }
                
                } else if (result[i].periodType === "week") {
                    let currentDate= dateUtil.DateToString(new Date());
                
                    let startDate= dateUtil.DateToString(result[i].startDate);
                
                    currentDate =new Date(currentDate)
                    startDate =new Date(startDate);
                    let dateDiff= currentDate - startDate;
                    let dayDiff =Math.ceil(dateDiff / (1000 * 3600 * 24));
                    
                    if(dayDiff < 0){
                        continue ;
                    }

                    let noOfOccurence =  dayDiff/ (result[i].repeat * 7);

                    if(!!result[i].endOnDate){
                        if(currentDate > new Date(result[i].endOnDate)){
                            continue ;
                        }
                    }

                    if(!!result[i].endAfterOccurances){
                        if(noOfOccurence >= result[i].endAfterOccurances){
                            continue ;
                        }
                    }
                    if(dayDiff % (result[i].repeat * 7) === 0){
                        cloneProject(result[i].projectId);

                    }
                } else if(result[i].periodType === "year") {
                    let currentDate= dateUtil.DateToString(new Date());
                    
                    let startDate= dateUtil.DateToString(result[i].startDate);
                
                    currentDate =new Date(currentDate)
                    startDate =new Date(startDate);
                    if(startDate.getDate() !==currentDate.getDate()){
                        continue;
                    }
                    if(startDate.getMonth() !== currentDate.getMonth()){
                        continue;
                    }
                    let dateDiff= currentDate - startDate;
                    let yearDiff = Math.round((currentDate - startDate)/(1000*60*60*24*365.242199));   
                    
                    if(yearDiff < 0){
                        continue;
                    }

                    var noOfOccurence = yearDiff / result[i].repeat;

                    if(!!result[i].endOnDate){
                        if(currentDate > new Date(result[i].endOnDate)){;
                            continue ;
                        }
                    }

                    if(!!result[i].endAfterOccurances){
                        if(noOfOccurence >= result[i].endAfterOccurances){
                        
                            continue;
                        }
                    }
                    if(yearDiff % result[i].repeat === 0){

                        cloneProject(result[i].projectId);
                    }

                } else {
                    let currentDate= dateUtil.DateToString(new Date());
                    let startDate= dateUtil.DateToString(result[i].startDate);
                    currentDate =new Date(currentDate)
                    startDate =new Date(startDate);
                    

                    if(result[i].monthlyType === "repeatondate"){
                        let dayDiff = (currentDate.getMonth()+1) - (startDate.getMonth()+1);
                        if(parseInt(result[i].repeatOnDateValue) !== currentDate.getDate()){
                            continue;

                        } 
                        if(dayDiff < 0){
                            continue;
                        }

                        var noOfOccurence = dayDiff / result[i].repeat;

                        if(!!result[i].endOnDate){
                            if(currentDate > new Date(result[i].endOnDate)){
                                continue ;
                            }
                        }

                        if(!!result[i].endAfterOccurances){
                            if(noOfOccurence >= result[i].endAfterOccurances){
                                
                                continue;
                            }
                        }
                            if(dayDiff % result[i].repeat === 0  ){
                            
                            cloneProject(result[i].projectId);
            
                        }

                    } else {
                        var weekday;
                        let dayDiff;
                        let cdate;
                    
                        if(!result[i].monthRepeatOnDayValue && !result[i].monthRepeatOnDayValueOccurance){
                            continue;
                        }
                        else{
                            weekday =  getNthDaysDate(result[i].monthRepeatOnDayValue,parseInt(result[i].monthRepeatOnDayValueOccurances))    
                            cdate=dateUtil.DateToString(currentDate)
                        
                        }
                        let weekdate=dateUtil.DateToString(weekday)
                        let ctDate =new Date(cdate)
                        dayDiff = (ctDate.getMonth()+1) - (startDate.getMonth()+1);
                        if(dayDiff < 0){
                            continue;
                        }

                        var noOfOccurence = dayDiff / result[i].repeat;

                        if(!!result[i].endOnDate){
                            if(currentDate > new Date(result[i].endOnDate)){
                                continue ;
                            }
                        }

                        if(!!result[i].endAfterOccurances){
                            if(noOfOccurence >= result[i].endAfterOccurances){
                                
                                continue;
                            }
                        }
                        if((dayDiff % result[i].repeat === 0) && weekdate === cdate){
                            cloneProject(result[i].projectId);
                        }
                    }   
                } 
            }
        }
                           
    }) .catch((err) => {
        // console.log(err);
        logInfo(err, 'ProjectAutoCloneScheduler error exception ');
    });
})

cloneProject=(projectId)=>{
    axios({
        method: 'post',
        responseType: 'json',
        url: config.url + `/cloneprojects/autoclone/${projectId}`,
    })
    .then((res1) => {
        // console.log("res1", res1.data);
    })
    .catch((err) => {
        // console.log(err);
        logInfo(err, 'ProjectAutoCloneScheduler exception ');
    });
}



 getNthDaysDate=(day,Nth)=> {
  
 var d = new Date(),

        month = d.getMonth(),
        all = [];
        
       var num;
switch (day) {
    case "Sunday":
        num = 0;
        break;
    case "Monday":
        num =1 ;
        break;
    case "Tuesday":
        num = 2;
        break;
    case "Wednesday":
        num = 3;
        break;
    case "Thursday":
        num = 4;
        break;
    case  "Friday":
        num = 5;
        break;
    case  "Saturday":
        num = 6;
}

    d.setDate(1);

    // Get the first Monday in the month
    while (d.getDay() !== num) {
        d.setDate(d.getDate() + 1);
    }

    // Get all the other Mondays in the month
    while (d.getMonth() === month) {
        all.push(new Date(d.getTime()));
        d.setDate(d.getDate() + 7);
    }

    return all[Nth-1];
}

