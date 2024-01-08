import React from 'react';
import FullCalendar from 'fullcalendar-reactwrapper';

//export default class TasksCalendarView extends Component {
const TasksCalendarView = React.memo((props) => {
    // const TasksCalendarView = (props) => {

    // console.log("task calendar view");
    let tasksWithDate = props.tasks.filter((t) => {
        return t.startDate && t.endDate && t.endDate && t.startDate !== undefined && t.endDate !== undefined;
    })
    let tasks = (tasksWithDate.length > 0) && tasksWithDate.map((d) => {
        let task = {
            id: d._id,
            start: d.startDate,
            end: d.endDate,
            title: d.title,
            // url:"/project/tasks/"+ t._id
        }
        return task;
    })

    return (
        <div  id="largeCalendar" className="task-list">
            <FullCalendar
                header={{
                    left: 'prev,next today myCustomButton',
                    center: 'title',
                    right: 'month,basicWeek,basicDay'
                }}
                defaultDate={new Date()}
                navLinks={true} // can click day/week names to navigate views
                editable={true}
                eventLimit={true} // allow "more" link when too many events
                events={tasks}
            />
        </div>
    )

});

export default TasksCalendarView;