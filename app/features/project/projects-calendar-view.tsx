    import React, { Component } from 'react';
    import FullCalendar from 'fullcalendar-reactwrapper';

    // Define the type/interface for a project
    interface Project {
    _id: string;
    startdate: Date;
    enddate: Date;
    title: string;
    // ...other properties
    }

    // Define the props interface for ProjectsCalendarView
    interface ProjectsCalendarViewProps {
    projects: Project[];
    // Other props if present
    }

    export default class ProjectsCalendarView extends Component<ProjectsCalendarViewProps> {
    render() {
        const { projects } = this.props;

        // Mapping projects to the required format
        const calendarEvents = projects.map((p) => ({
        id: p._id,
        start: p.startdate,
        end: p.enddate,
        title: p.title,
        url: `/project/tasks/${p._id}`,
        // ...other properties
        }));

        return (
        <div id="largeCalendar" className="project-list">
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
            events={calendarEvents}
            />
        </div>
        );
    }
    }
