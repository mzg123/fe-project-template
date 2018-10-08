import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './Demo.scss';

class Example extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div>
                Hello Word!
            </div>
        );
    }
}
ReactDOM.render((
    <Example />
), document.getElementById('root'));
