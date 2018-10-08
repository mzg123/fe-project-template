import React from 'react';
// import PropTypes from 'prop-types';
// import AC from '../appContext/appContext';

window.$$BBT_APP_CONTEXT = new Map();
class AppContext {
    static get(key) {
        return window.$$BBT_APP_CONTEXT.get(key);
    }

    static set(key, root) {
        window.$$BBT_APP_CONTEXT.set(key, root);
    }

    static delete(key) {
        return window.$$BBT_APP_CONTEXT.delete(key);
    }
}

class RootManager {
    static getKey() {
        return 'PageRoot';
    }

    static getRoot() {
        return AppContext.get(this.getKey());
    }

    static setRoot(root) {
        AppContext.set(this.getKey(), root);
    }

    static clearRoot() {
        return AppContext.delete(this.getKey());
    }
}

class BaseComponent extends React.Component {
    getProps() {
        return this.props;
    }

    getState() {
        return this.state;
    }

    /* getRefs() {
        return this["refs"];
    } */

    // root不保证一定有
    getRoot() {
        // if (this.props.root) {
        //    return this.props.root;
        // }
        return RootManager.getRoot();
    }

    setRoot() {
        RootManager.setRoot(this);
    }

    setRootState(state, cb) {
        if (!this.getRoot()) {
            throw new Error('root is not defined!');
        }

        this.getRoot().setState(state, cb);
    }

    getRootState() {
        if (!this.getRoot()) {
            // throw new Error('root is not defined!');
            return null;
        }

        return this.getRoot().state;
    }

    getRootProps() {
        if (!this.getRoot()) {
            // throw new Error('root is not defined!');
            return null;
        }

        return this.getRoot().props;
    }

    /* getRootRefs() {
        if (!this.getRoot()) {
            // throw new Error('root is not defined!');
            return null;
        }

        return this.getRoot().refs;
    } */

    getRootObj() {
        if (!this.getRoot()) {
            // throw new Error('root is not defined!');
            return null;
        }

        return this.getRoot().obj;
    }

    clearRoot(root) {
        if (root === this) {
            return RootManager.clearRoot();
        }
        return false;
    }
}

export default BaseComponent;
