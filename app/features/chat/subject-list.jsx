import React from 'react';
import { Link } from 'react-router-dom';

const SubjectList = (props) => {

	// console.log("props.subjects",props.subjects);
	var subjectView = props.subjects && props.subjects.map((subject, index) => {
        // console.log("subject",subject);
		return (
			<li  key={subject._id} className = "subject">
				<div className="row">
                    <div className="col-sm-9">
                {subject.edit ? <input type="text" title="Press enter to submit and esc to cancel" className="form-control"
                    placeholder="press enter to add, esc to cancel" value={subject.title}
                    onChange={(e) => { props.onEditSubject(e, subject._id) }}
                    onKeyUp={(e) => {
                        //console.log(e.which, e.keyCode);
                        if (e.which === 13) {
                            //console.log("enter..");
                            props.onToggleSubjectEdit(subject._id,true)
                        } else if (e.which === 27) {
                            props.onToggleSubjectEdit(subject._id,false);
                        }
                    }} />
                    :
                    <span title="Chat" >
                        {props.projectId !== "" ? 
                        <Link to={'/discussionBoard/project/' + props.projectId + '/' + subject._id} className="links">
                            <label>{subject.title}</label>
                        </Link>
                         : 
                        <Link to={'/discussionBoard/' + subject._id} className="links">
                            <label>{subject.title}</label>
                        </Link>}
					</span>
                   }
                    </div>
					 &nbsp;
					<div className="col-sm-2 pull-right">
						<small>
                            <span  onClick={()=>{props.onToggleEdit(subject._id)}}>
                                <i className="fas fa-pencil-alt text-success"></i>
                            </span>
							&nbsp; &nbsp;
						
                            <a title="Delete Company"
                                onClick={() => {
                                    if (window.confirm('Are you sure you wish to delete this Company?'))
                                        props.onDelete(subject._id)
                                }}>
                                <span className="far fa-trash-alt text-danger"></span>
                            </a>
						
						</small>
					</div>
				</div>
			</li>
		)
	});

	return (
		<div>
			<ul className="project-list">
				{subjectView}
			</ul>

		</div>
	);

}
export default SubjectList;


