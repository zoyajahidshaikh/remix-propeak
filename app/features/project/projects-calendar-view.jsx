import React,{Component} from 'react';
import FullCalendar from 'fullcalendar-reactwrapper';

export default class ProjectsCalendarView extends Component {
    render() {
        let projects = this.props.projects.map((p) => {
            let project = {
                id:p._id,
                start:p.startdate,
                end:p.enddate,
                title:p.title,
                url:"/project/tasks/"+ p._id
            }
            return project;
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
                events = {projects}	
            />
        </div>
        )
    }
}