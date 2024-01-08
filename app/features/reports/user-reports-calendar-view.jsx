import React,{Component} from 'react';
import FullCalendar from 'fullcalendar-reactwrapper';

export default class UserReportsCalendarView extends Component {
    render() {
            let userReportsData = this.props.data.map((d) => {
               let info = {
                   id: d.taskId,
                   start: d.startDate,
                   end: d.endDate,
                   title: d.title,
                   url: "/project/task/edit/"+d.projectId+"/"+d.taskId
               }
               return info;
            })
     
        return(
        <div id="largeCalendar" className="project-list">
           <FullCalendar
                header = {{
                    left: 'prev,next today myCustomButton',
                    center: 'title',
                    right: 'month,basicWeek,basicDay'
                }}
                defaultDate= {new Date()}
                navLinks= {true} // can click day/week names to navigate views
                editable= {true}
                eventLimit= {true} // allow "more" link when too many events
                events = {userReportsData}	
            />
        </div>
        )
    }
}