import React,{Component} from 'react';
import * as chatservice from '../../Services/chat/chat-service';

export default class ChatForm extends Component {
    state={
        title: "",
        message: ""
    }

    handleChange = (e) => {
        let name = e.target.name;
		let value = e.target.value;
		this.setState({
            [name]: value,
            message: ""
		})
    }

    addNewDiscussionMessage = async() => {
        // console.log("this.props.messageId",this.props.messageId);
        if(this.state.title === ""){
            this.setState({
                message: "Please enter a message"
            })
        } else {
            let { response, err } = await chatservice.addDiscussionMessage(this.state.title,this.props.subjectId,this.props.messageId);
            if (err) {
                this.setState({
                    message: 'Error : ' + err,
                });
            } else if (response && response.data.err) {
                this.setState({
                    message: 'Error : ' + response.data.err,
                });
            } else {
                // console.log("response.data",response.data);
                this.setState({
                    title: ''
                });
                if(!this.props.messageId){
                    this.props.addDiscussionMsg(response.data);
                } else {
                    this.props.addReplyMessage(response.data, this.props.messageId);
                    this.props.updateState(false,this.props.messageId );
                } 
                
            }
        }
    }

    render() {
        // console.log("this.props.subjectTitle",this.props.subjectTitle);
        return (
            <div>
                <div className = "row">
                    <h3>{this.props.subjectTitle}</h3>    
                </div>
                <div className="row">
                    <span style={{color:"red"}}>{this.state.message}</span>
                    <div className="col-sm-8">
                        <div className="form-group">
                            <textarea className="form-control" placeholder="Enter your message" name='title' value={this.state.title} 
                            onChange={this.handleChange} />
                        </div>
                    </div>
                    <div className="col-sm-offset-11">
                        <button className="btn btn-primary btn-block" onClick={this.addNewDiscussionMessage}>Save</button>
                    </div>
    
                </div>
    
            </div>   
        )
    }
}