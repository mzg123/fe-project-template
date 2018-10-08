/**
 * 业务逻辑对象基类
 * 封装了对this.root的初始化和校验
 * 提供了一系列取值赋值接口
 */
class BaseLogic {
    constructor(root) {
        if (!root) {
            throw new Error('实例化BaseLogic必须传入root组件对象.');
        }
        this.root = root;
    }

    getRoot() {
        return this.root;
    }

    getState() {
        return this.root.state;
    }

    setState(state, cb) {
        this.root.setState(state, cb);
    }

    /* getRefs() {
        return this.root.refs;
    } */

    getProps() {
        return this.root.props;
    }
}
export default BaseLogicObj;
