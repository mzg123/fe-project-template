import React from 'react';
import ReactDOM from 'react-dom';
// import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import BaseComponent from '../../comp/BaseReact/BaseComponent';
import './Demo.scss';

class Example extends BaseComponent {
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
