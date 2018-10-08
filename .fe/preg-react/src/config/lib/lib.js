import 'babel-polyfill';
import 'react';
import 'react-dom';
import 'react-router-dom';
import 'whatwg-fetch';
import { enable } from 'promise/lib/rejection-tracking';
import Promise from 'promise/lib/es6-extensions';

if (typeof Promise === 'undefined') {
    // Rejection tracking prevents a common issue where React gets into an
    // inconsistent state due to an error, but it gets swallowed by a Promise,
    // and the user has no idea what causes React's erratic future behavior.
    // import('promise/lib/rejection-tracking').enable();
    enable();
    // window.Promise = import('promise/lib/es6-extensions.js');
    window.Promise = Promise;
}
