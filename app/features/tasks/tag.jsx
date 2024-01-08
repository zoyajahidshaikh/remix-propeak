import React from 'react';
const isEqual = require("react-fast-compare");

export default class Tag extends React.Component {
    onDeleteTag(value,e){
        this.props.onDeleteTag(value);
    }
    shouldComponentUpdate(nextProps, nextState) {
        //console.log("Tag shouldComponentUpdate "+(!(isEqual(this.props, nextProps) && isEqual(this.state, nextState))));
        return !(isEqual(this.props, nextProps)) // && isEqual(this.state, nextState)
      }
    render () {
        var tag = (
            <div className="user-tags">
            <span 
            onClick = {this.onDeleteTag.bind(this, this.props.value)}>
               <i className="fas fa-times"></i> &nbsp; 
            </span>
            <span>{this.props.value}</span>
            </div>
        );
            return (
            <React.Fragment>
                {tag}
               
            </React.Fragment>
        )
    }
}