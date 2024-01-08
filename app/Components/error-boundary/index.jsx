import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            // error: ""
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        // console.log("error", error);

        //save errors in db --> TODO
        return { hasError: true };

        // this.setState({
        //     hasError: true,
        //     error
        // })
    }

    // componentDidCatch(error, info) {
    //     this.setState({ error, info });
    // }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h3>Something went wrong.</h3>;
            // return <h3>this.state.error.toString()</h3>
        }

        return this.props.children;
    }
}