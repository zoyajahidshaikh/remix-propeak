import React, { Component } from 'react';

export default class ChatMessageForm extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.onkeyEnter = this.onkeyEnter.bind(this);
        this.sendMessages = this.sendMessages.bind(this);

        this.state = {
            message: '',
        }

    }

    handleChange(e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({
            [name]: value,

        })
    }

    onkeyEnter(e) {
        if (e.which === 13) {
            this.sendMessages();
        }

    }

    sendMessages(e) {
        if (e !== undefined) {
            e.preventDefault()
        }

        let message = this.state.message;
        this.props.saveMessages(message)
        this.setState({
            message: '',
        })
    }

    render() {
        return (
         
                <form onSubmit={this.sendMessages}>
                    <div className='row'>
                        <div className="col-10 col-sm-10 col-md-9 col-lg-11 pr-0">
                            <div className="form-group mb-0">
                                <textarea className="form-control rounded-0" placeholder="Enter your message" name='message' value={this.state.message}
                                    onChange={this.handleChange} onKeyPress={this.onkeyEnter} />
                            </div>
                        </div>
                        <div className="col-2 col-sm-1  col-md-1  col-lg-1 pl-0">
                            <button className="btn"><span className="" style={{ fontSize: "32px" }}>&#x27A4;</span></button>
                        </div>
                    </div>
                </form>
           
        )
    }
}