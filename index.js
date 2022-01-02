const EMPTY_OBJ = {
};
const EMPTY_ARR = [];
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
function assign(obj, props) {
    for(let i in props)obj[i] = props[i];
    return obj;
}
function removeNode(node) {
    let parentNode = node.parentNode;
    if (parentNode) parentNode.removeChild(node);
}
const slice = EMPTY_ARR.slice;
function _catchError(error, vnode) {
    let component, ctor, handled;
    for(; vnode = vnode._parent;){
        if ((component = vnode._component) && !component._processingException) {
            try {
                ctor = component.constructor;
                if (ctor && ctor.getDerivedStateFromError != null) {
                    component.setState(ctor.getDerivedStateFromError(error));
                    handled = component._dirty;
                }
                if (component.componentDidCatch != null) {
                    component.componentDidCatch(error);
                    handled = component._dirty;
                }
                if (handled) {
                    return component._pendingError = component;
                }
            } catch (e) {
                error = e;
            }
        }
    }
    throw error;
}
const options = {
    _catchError
};
let vnodeId = 0;
function createElement(type, props, children) {
    let normalizedProps = {
    }, key, ref, i;
    for(i in props){
        if (i == "key") key = props[i];
        else if (i == "ref") ref = props[i];
        else normalizedProps[i] = props[i];
    }
    if (arguments.length > 2) {
        normalizedProps.children = arguments.length > 3 ? slice.call(arguments, 2) : children;
    }
    if (typeof type == "function" && type.defaultProps != null) {
        for(i in type.defaultProps){
            if (normalizedProps[i] === undefined) {
                normalizedProps[i] = type.defaultProps[i];
            }
        }
    }
    return createVNode(type, normalizedProps, key, ref, null);
}
function createVNode(type, props, key, ref, original) {
    const vnode = {
        type,
        props,
        key,
        ref,
        _children: null,
        _parent: null,
        _depth: 0,
        _dom: null,
        _nextDom: undefined,
        _component: null,
        _hydrating: null,
        constructor: undefined,
        _original: original == null ? ++vnodeId : original
    };
    if (original == null && options.vnode != null) options.vnode(vnode);
    return vnode;
}
function Fragment(props) {
    return props.children;
}
function diffProps(dom, newProps, oldProps, isSvg, hydrate) {
    let i;
    for(i in oldProps){
        if (i !== "children" && i !== "key" && !(i in newProps)) {
            setProperty(dom, i, null, oldProps[i], isSvg);
        }
    }
    for(i in newProps){
        if ((!hydrate || typeof newProps[i] == "function") && i !== "children" && i !== "key" && i !== "value" && i !== "checked" && oldProps[i] !== newProps[i]) {
            setProperty(dom, i, newProps[i], oldProps[i], isSvg);
        }
    }
}
function setStyle(style, key, value) {
    if (key[0] === "-") {
        style.setProperty(key, value);
    } else if (value == null) {
        style[key] = "";
    } else if (typeof value != "number" || IS_NON_DIMENSIONAL.test(key)) {
        style[key] = value;
    } else {
        style[key] = value + "px";
    }
}
function setProperty(dom, name, value, oldValue, isSvg) {
    let useCapture;
    o: if (name === "style") {
        if (typeof value == "string") {
            dom.style.cssText = value;
        } else {
            if (typeof oldValue == "string") {
                dom.style.cssText = oldValue = "";
            }
            if (oldValue) {
                for(name in oldValue){
                    if (!(value && name in value)) {
                        setStyle(dom.style, name, "");
                    }
                }
            }
            if (value) {
                for(name in value){
                    if (!oldValue || value[name] !== oldValue[name]) {
                        setStyle(dom.style, name, value[name]);
                    }
                }
            }
        }
    } else if (name[0] === "o" && name[1] === "n") {
        useCapture = name !== (name = name.replace(/Capture$/, ""));
        if (name.toLowerCase() in dom) name = name.toLowerCase().slice(2);
        else name = name.slice(2);
        if (!dom._listeners) dom._listeners = {
        };
        dom._listeners[name + useCapture] = value;
        if (value) {
            if (!oldValue) {
                const handler = useCapture ? eventProxyCapture : eventProxy;
                dom.addEventListener(name, handler, useCapture);
            }
        } else {
            const handler = useCapture ? eventProxyCapture : eventProxy;
            dom.removeEventListener(name, handler, useCapture);
        }
    } else if (name !== "dangerouslySetInnerHTML") {
        if (isSvg) {
            name = name.replace(/xlink[H:h]/, "h").replace(/sName$/, "s");
        } else if (name !== "href" && name !== "list" && name !== "form" && name !== "tabIndex" && name !== "download" && name in dom) {
            try {
                dom[name] = value == null ? "" : value;
                break o;
            } catch (e) {
            }
        }
        if (typeof value === "function") {
        } else if (value != null && (value !== false || name[0] === "a" && name[1] === "r")) {
            dom.setAttribute(name, value);
        } else {
            dom.removeAttribute(name);
        }
    }
}
function eventProxy(e) {
    this._listeners[e.type + false](options.event ? options.event(e) : e);
}
function eventProxyCapture(e) {
    this._listeners[e.type + true](options.event ? options.event(e) : e);
}
function Component(props, context) {
    this.props = props;
    this.context = context;
}
function diff(parentDom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating) {
    let tmp, newType = newVNode.type;
    if (newVNode.constructor !== undefined) return null;
    if (oldVNode._hydrating != null) {
        isHydrating = oldVNode._hydrating;
        oldDom = newVNode._dom = oldVNode._dom;
        newVNode._hydrating = null;
        excessDomChildren = [
            oldDom
        ];
    }
    if (tmp = options._diff) tmp(newVNode);
    try {
        outer: if (typeof newType == "function") {
            let c, isNew, oldProps, oldState, snapshot, clearProcessingException;
            let newProps = newVNode.props;
            tmp = newType.contextType;
            let provider = tmp && globalContext[tmp._id];
            let componentContext = tmp ? provider ? provider.props.value : tmp._defaultValue : globalContext;
            if (oldVNode._component) {
                c = newVNode._component = oldVNode._component;
                clearProcessingException = c._processingException = c._pendingError;
            } else {
                if ("prototype" in newType && newType.prototype.render) {
                    newVNode._component = c = new newType(newProps, componentContext);
                } else {
                    newVNode._component = c = new Component(newProps, componentContext);
                    c.constructor = newType;
                    c.render = doRender;
                }
                if (provider) provider.sub(c);
                c.props = newProps;
                if (!c.state) c.state = {
                };
                c.context = componentContext;
                c._globalContext = globalContext;
                isNew = c._dirty = true;
                c._renderCallbacks = [];
            }
            if (c._nextState == null) {
                c._nextState = c.state;
            }
            if (newType.getDerivedStateFromProps != null) {
                if (c._nextState == c.state) {
                    c._nextState = assign({
                    }, c._nextState);
                }
                assign(c._nextState, newType.getDerivedStateFromProps(newProps, c._nextState));
            }
            oldProps = c.props;
            oldState = c.state;
            if (isNew) {
                if (newType.getDerivedStateFromProps == null && c.componentWillMount != null) {
                    c.componentWillMount();
                }
                if (c.componentDidMount != null) {
                    c._renderCallbacks.push(c.componentDidMount);
                }
            } else {
                if (newType.getDerivedStateFromProps == null && newProps !== oldProps && c.componentWillReceiveProps != null) {
                    c.componentWillReceiveProps(newProps, componentContext);
                }
                if (!c._force && c.shouldComponentUpdate != null && c.shouldComponentUpdate(newProps, c._nextState, componentContext) === false || newVNode._original === oldVNode._original) {
                    c.props = newProps;
                    c.state = c._nextState;
                    if (newVNode._original !== oldVNode._original) c._dirty = false;
                    c._vnode = newVNode;
                    newVNode._dom = oldVNode._dom;
                    newVNode._children = oldVNode._children;
                    newVNode._children.forEach((vnode)=>{
                        if (vnode) vnode._parent = newVNode;
                    });
                    if (c._renderCallbacks.length) {
                        commitQueue.push(c);
                    }
                    break outer;
                }
                if (c.componentWillUpdate != null) {
                    c.componentWillUpdate(newProps, c._nextState, componentContext);
                }
                if (c.componentDidUpdate != null) {
                    c._renderCallbacks.push(()=>{
                        c.componentDidUpdate(oldProps, oldState, snapshot);
                    });
                }
            }
            c.context = componentContext;
            c.props = newProps;
            c.state = c._nextState;
            if (tmp = options._render) tmp(newVNode);
            c._dirty = false;
            c._vnode = newVNode;
            c._parentDom = parentDom;
            tmp = c.render(c.props, c.state, c.context);
            c.state = c._nextState;
            if (c.getChildContext != null) {
                globalContext = assign(assign({
                }, globalContext), c.getChildContext());
            }
            if (!isNew && c.getSnapshotBeforeUpdate != null) {
                snapshot = c.getSnapshotBeforeUpdate(oldProps, oldState);
            }
            let isTopLevelFragment = tmp != null && tmp.type === Fragment && tmp.key == null;
            let renderResult = isTopLevelFragment ? tmp.props.children : tmp;
            diffChildren(parentDom, Array.isArray(renderResult) ? renderResult : [
                renderResult
            ], newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating);
            c.base = newVNode._dom;
            newVNode._hydrating = null;
            if (c._renderCallbacks.length) {
                commitQueue.push(c);
            }
            if (clearProcessingException) {
                c._pendingError = c._processingException = null;
            }
            c._force = false;
        } else if (excessDomChildren == null && newVNode._original === oldVNode._original) {
            newVNode._children = oldVNode._children;
            newVNode._dom = oldVNode._dom;
        } else {
            newVNode._dom = diffElementNodes(oldVNode._dom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, isHydrating);
        }
        if (tmp = options.diffed) tmp(newVNode);
    } catch (e) {
        newVNode._original = null;
        if (isHydrating || excessDomChildren != null) {
            newVNode._dom = oldDom;
            newVNode._hydrating = !!isHydrating;
            excessDomChildren[excessDomChildren.indexOf(oldDom)] = null;
        }
        options._catchError(e, newVNode, oldVNode);
    }
}
Component.prototype.setState = function(update, callback) {
    let s;
    if (this._nextState != null && this._nextState !== this.state) {
        s = this._nextState;
    } else {
        s = this._nextState = assign({
        }, this.state);
    }
    if (typeof update == "function") {
        update = update(assign({
        }, s), this.props);
    }
    if (update) {
        assign(s, update);
    }
    if (update == null) return;
    if (this._vnode) {
        if (callback) this._renderCallbacks.push(callback);
        enqueueRender(this);
    }
};
Component.prototype.forceUpdate = function(callback) {
    if (this._vnode) {
        this._force = true;
        if (callback) this._renderCallbacks.push(callback);
        enqueueRender(this);
    }
};
Component.prototype.render = Fragment;
function getDomSibling(vnode, childIndex) {
    if (childIndex == null) {
        return vnode._parent ? getDomSibling(vnode._parent, vnode._parent._children.indexOf(vnode) + 1) : null;
    }
    let sibling;
    for(; childIndex < vnode._children.length; childIndex++){
        sibling = vnode._children[childIndex];
        if (sibling != null && sibling._dom != null) {
            return sibling._dom;
        }
    }
    return typeof vnode.type == "function" ? getDomSibling(vnode) : null;
}
function commitRoot(commitQueue, root) {
    if (options._commit) options._commit(root, commitQueue);
    commitQueue.some((c)=>{
        try {
            commitQueue = c._renderCallbacks;
            c._renderCallbacks = [];
            commitQueue.some((cb)=>{
                cb.call(c);
            });
        } catch (e) {
            options._catchError(e, c._vnode);
        }
    });
}
function diffElementNodes(dom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, isHydrating) {
    let oldProps = oldVNode.props;
    let newProps = newVNode.props;
    let nodeType = newVNode.type;
    let i = 0;
    if (nodeType === "svg") isSvg = true;
    if (excessDomChildren != null) {
        for(; i < excessDomChildren.length; i++){
            const child = excessDomChildren[i];
            if (child && "setAttribute" in child === !!nodeType && (nodeType ? child.localName === nodeType : child.nodeType === 3)) {
                dom = child;
                excessDomChildren[i] = null;
                break;
            }
        }
    }
    if (dom == null) {
        if (nodeType === null) {
            return document.createTextNode(newProps);
        }
        if (isSvg) {
            dom = document.createElementNS("http://www.w3.org/2000/svg", nodeType);
        } else {
            dom = document.createElement(nodeType, newProps.is && newProps);
        }
        excessDomChildren = null;
        isHydrating = false;
    }
    if (nodeType === null) {
        if (oldProps !== newProps && (!isHydrating || dom.data !== newProps)) {
            dom.data = newProps;
        }
    } else {
        excessDomChildren = excessDomChildren && slice.call(dom.childNodes);
        oldProps = oldVNode.props || EMPTY_OBJ;
        let oldHtml = oldProps.dangerouslySetInnerHTML;
        let newHtml = newProps.dangerouslySetInnerHTML;
        if (!isHydrating) {
            if (excessDomChildren != null) {
                oldProps = {
                };
                for(i = 0; i < dom.attributes.length; i++){
                    oldProps[dom.attributes[i].name] = dom.attributes[i].value;
                }
            }
            if (newHtml || oldHtml) {
                if (!newHtml || (!oldHtml || newHtml.__html != oldHtml.__html) && newHtml.__html !== dom.innerHTML) {
                    dom.innerHTML = newHtml && newHtml.__html || "";
                }
            }
        }
        diffProps(dom, newProps, oldProps, isSvg, isHydrating);
        if (newHtml) {
            newVNode._children = [];
        } else {
            i = newVNode.props.children;
            diffChildren(dom, Array.isArray(i) ? i : [
                i
            ], newVNode, oldVNode, globalContext, isSvg && nodeType !== "foreignObject", excessDomChildren, commitQueue, excessDomChildren ? excessDomChildren[0] : oldVNode._children && getDomSibling(oldVNode, 0), isHydrating);
            if (excessDomChildren != null) {
                for(i = excessDomChildren.length; i--;){
                    if (excessDomChildren[i] != null) removeNode(excessDomChildren[i]);
                }
            }
        }
        if (!isHydrating) {
            if ("value" in newProps && (i = newProps.value) !== undefined && (i !== oldProps.value || i !== dom.value || nodeType === "progress" && !i)) {
                setProperty(dom, "value", i, oldProps.value, false);
            }
            if ("checked" in newProps && (i = newProps.checked) !== undefined && i !== dom.checked) {
                setProperty(dom, "checked", i, oldProps.checked, false);
            }
        }
    }
    return dom;
}
function applyRef(ref, value, vnode) {
    try {
        if (typeof ref == "function") ref(value);
        else ref.current = value;
    } catch (e) {
        options._catchError(e, vnode);
    }
}
function unmount(vnode, parentVNode, skipRemove) {
    let r;
    if (options.unmount) options.unmount(vnode);
    if (r = vnode.ref) {
        if (!r.current || r.current === vnode._dom) applyRef(r, null, parentVNode);
    }
    if ((r = vnode._component) != null) {
        if (r.componentWillUnmount) {
            try {
                r.componentWillUnmount();
            } catch (e) {
                options._catchError(e, parentVNode);
            }
        }
        r.base = r._parentDom = null;
    }
    if (r = vnode._children) {
        for(let i = 0; i < r.length; i++){
            if (r[i]) {
                unmount(r[i], parentVNode, typeof vnode.type != "function");
            }
        }
    }
    if (!skipRemove && vnode._dom != null) removeNode(vnode._dom);
    vnode._dom = vnode._nextDom = undefined;
}
function diffChildren(parentDom, renderResult, newParentVNode, oldParentVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating) {
    let i, j, oldVNode, childVNode, newDom, firstChildDom, refs;
    let oldChildren = oldParentVNode && oldParentVNode._children || EMPTY_ARR;
    let oldChildrenLength = oldChildren.length;
    newParentVNode._children = [];
    for(i = 0; i < renderResult.length; i++){
        childVNode = renderResult[i];
        if (childVNode == null || typeof childVNode == "boolean") {
            childVNode = newParentVNode._children[i] = null;
        } else if (typeof childVNode == "string" || typeof childVNode == "number" || typeof childVNode == "bigint") {
            childVNode = newParentVNode._children[i] = createVNode(null, childVNode, null, null, childVNode);
        } else if (Array.isArray(childVNode)) {
            childVNode = newParentVNode._children[i] = createVNode(Fragment, {
                children: childVNode
            }, null, null, null);
        } else if (childVNode._depth > 0) {
            childVNode = newParentVNode._children[i] = createVNode(childVNode.type, childVNode.props, childVNode.key, null, childVNode._original);
        } else {
            childVNode = newParentVNode._children[i] = childVNode;
        }
        if (childVNode == null) {
            continue;
        }
        childVNode._parent = newParentVNode;
        childVNode._depth = newParentVNode._depth + 1;
        oldVNode = oldChildren[i];
        if (oldVNode === null || oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type) {
            oldChildren[i] = undefined;
        } else {
            for(j = 0; j < oldChildrenLength; j++){
                oldVNode = oldChildren[j];
                if (oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type) {
                    oldChildren[j] = undefined;
                    break;
                }
                oldVNode = null;
            }
        }
        oldVNode = oldVNode || EMPTY_OBJ;
        diff(parentDom, childVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating);
        newDom = childVNode._dom;
        if ((j = childVNode.ref) && oldVNode.ref != j) {
            if (!refs) refs = [];
            if (oldVNode.ref) refs.push(oldVNode.ref, null, childVNode);
            refs.push(j, childVNode._component || newDom, childVNode);
        }
        if (newDom != null) {
            if (firstChildDom == null) {
                firstChildDom = newDom;
            }
            if (typeof childVNode.type == "function" && childVNode._children === oldVNode._children) {
                childVNode._nextDom = oldDom = reorderChildren(childVNode, oldDom, parentDom);
            } else {
                oldDom = placeChild(parentDom, childVNode, oldVNode, oldChildren, newDom, oldDom);
            }
            if (typeof newParentVNode.type == "function") {
                newParentVNode._nextDom = oldDom;
            }
        } else if (oldDom && oldVNode._dom == oldDom && oldDom.parentNode != parentDom) {
            oldDom = getDomSibling(oldVNode);
        }
    }
    newParentVNode._dom = firstChildDom;
    for(i = oldChildrenLength; i--;){
        if (oldChildren[i] != null) {
            if (typeof newParentVNode.type == "function" && oldChildren[i]._dom != null && oldChildren[i]._dom == newParentVNode._nextDom) {
                newParentVNode._nextDom = getDomSibling(oldParentVNode, i + 1);
            }
            unmount(oldChildren[i], oldChildren[i]);
        }
    }
    if (refs) {
        for(i = 0; i < refs.length; i++){
            applyRef(refs[i], refs[++i], refs[++i]);
        }
    }
}
function doRender(props, state, context) {
    return this.constructor(props, context);
}
function renderComponent(component) {
    let vnode = component._vnode, oldDom = vnode._dom, parentDom = component._parentDom;
    if (parentDom) {
        let commitQueue = [];
        const oldVNode = assign({
        }, vnode);
        oldVNode._original = vnode._original + 1;
        diff(parentDom, vnode, oldVNode, component._globalContext, parentDom.ownerSVGElement !== undefined, vnode._hydrating != null ? [
            oldDom
        ] : null, commitQueue, oldDom == null ? getDomSibling(vnode) : oldDom, vnode._hydrating);
        commitRoot(commitQueue, vnode);
        if (vnode._dom != oldDom) {
            updateParentDomPointers(vnode);
        }
    }
}
function updateParentDomPointers(vnode) {
    if ((vnode = vnode._parent) != null && vnode._component != null) {
        vnode._dom = vnode._component.base = null;
        for(let i = 0; i < vnode._children.length; i++){
            let child = vnode._children[i];
            if (child != null && child._dom != null) {
                vnode._dom = vnode._component.base = child._dom;
                break;
            }
        }
        return updateParentDomPointers(vnode);
    }
}
let rerenderQueue = [];
const defer = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;
let prevDebounce;
function enqueueRender(c) {
    if (!c._dirty && (c._dirty = true) && rerenderQueue.push(c) && !process._rerenderCount++ || prevDebounce !== options.debounceRendering) {
        prevDebounce = options.debounceRendering;
        (prevDebounce || defer)(process);
    }
}
function process() {
    let queue;
    while(process._rerenderCount = rerenderQueue.length){
        queue = rerenderQueue.sort((a, b)=>a._vnode._depth - b._vnode._depth
        );
        rerenderQueue = [];
        queue.some((c)=>{
            if (c._dirty) renderComponent(c);
        });
    }
}
process._rerenderCount = 0;
function reorderChildren(childVNode, oldDom, parentDom) {
    let c = childVNode._children;
    let tmp = 0;
    for(; c && tmp < c.length; tmp++){
        let vnode = c[tmp];
        if (vnode) {
            vnode._parent = childVNode;
            if (typeof vnode.type == "function") {
                oldDom = reorderChildren(vnode, oldDom, parentDom);
            } else {
                oldDom = placeChild(parentDom, vnode, vnode, c, vnode._dom, oldDom);
            }
        }
    }
    return oldDom;
}
function placeChild(parentDom, childVNode, oldVNode, oldChildren, newDom, oldDom) {
    let nextDom;
    if (childVNode._nextDom !== undefined) {
        nextDom = childVNode._nextDom;
        childVNode._nextDom = undefined;
    } else if (oldVNode == null || newDom != oldDom || newDom.parentNode == null) {
        outer: if (oldDom == null || oldDom.parentNode !== parentDom) {
            parentDom.appendChild(newDom);
            nextDom = null;
        } else {
            for(let sibDom = oldDom, j = 0; (sibDom = sibDom.nextSibling) && j < oldChildren.length; j += 2){
                if (sibDom == newDom) {
                    break outer;
                }
            }
            parentDom.insertBefore(newDom, oldDom);
            nextDom = oldDom;
        }
    }
    if (nextDom !== undefined) {
        oldDom = nextDom;
    } else {
        oldDom = newDom.nextSibling;
    }
    return oldDom;
}
function render(vnode, parentDom, replaceNode) {
    if (options._root) options._root(vnode, parentDom);
    let isHydrating = typeof replaceNode === "function";
    let oldVNode = isHydrating ? null : replaceNode && replaceNode._children || parentDom._children;
    vnode = (!isHydrating && replaceNode || parentDom)._children = createElement(Fragment, null, [
        vnode
    ]);
    let commitQueue = [];
    diff(parentDom, vnode, oldVNode || EMPTY_OBJ, EMPTY_OBJ, parentDom.ownerSVGElement !== undefined, !isHydrating && replaceNode ? [
        replaceNode
    ] : oldVNode ? null : parentDom.firstChild ? slice.call(parentDom.childNodes) : null, commitQueue, !isHydrating && replaceNode ? replaceNode : oldVNode ? oldVNode._dom : parentDom.firstChild, isHydrating);
    commitRoot(commitQueue, vnode);
}
let currentComponent;
let afterPaintEffects = [];
let oldBeforeDiff = options._diff;
let oldBeforeRender = options._render;
let oldAfterDiff = options.diffed;
let oldCommit = options._commit;
let oldBeforeUnmount = options.unmount;
let prevRaf;
options._diff = (vnode)=>{
    currentComponent = null;
    if (oldBeforeDiff) oldBeforeDiff(vnode);
};
options._render = (vnode)=>{
    if (oldBeforeRender) oldBeforeRender(vnode);
    currentComponent = vnode._component;
    const hooks = currentComponent.__hooks;
    if (hooks) {
        hooks._pendingEffects.forEach(invokeCleanup);
        hooks._pendingEffects.forEach(invokeEffect);
        hooks._pendingEffects = [];
    }
};
options.diffed = (vnode)=>{
    if (oldAfterDiff) oldAfterDiff(vnode);
    const c = vnode._component;
    if (c && c.__hooks && c.__hooks._pendingEffects.length) {
        afterPaint(afterPaintEffects.push(c));
    }
    currentComponent = null;
};
options._commit = (vnode, commitQueue)=>{
    commitQueue.some((component)=>{
        try {
            component._renderCallbacks.forEach(invokeCleanup);
            component._renderCallbacks = component._renderCallbacks.filter((cb)=>cb._value ? invokeEffect(cb) : true
            );
        } catch (e) {
            commitQueue.some((c)=>{
                if (c._renderCallbacks) c._renderCallbacks = [];
            });
            commitQueue = [];
            options._catchError(e, component._vnode);
        }
    });
    if (oldCommit) oldCommit(vnode, commitQueue);
};
options.unmount = (vnode)=>{
    if (oldBeforeUnmount) oldBeforeUnmount(vnode);
    const c = vnode._component;
    if (c && c.__hooks) {
        let hasErrored;
        c.__hooks._list.forEach((s)=>{
            try {
                invokeCleanup(s);
            } catch (e) {
                hasErrored = e;
            }
        });
        if (hasErrored) options._catchError(hasErrored, c._vnode);
    }
};
function flushAfterPaintEffects() {
    let component;
    afterPaintEffects.sort((a, b)=>a._vnode._depth - b._vnode._depth
    );
    while(component = afterPaintEffects.pop()){
        if (!component._parentDom) continue;
        try {
            component.__hooks._pendingEffects.forEach(invokeCleanup);
            component.__hooks._pendingEffects.forEach(invokeEffect);
            component.__hooks._pendingEffects = [];
        } catch (e) {
            component.__hooks._pendingEffects = [];
            options._catchError(e, component._vnode);
        }
    }
}
let HAS_RAF = typeof requestAnimationFrame == "function";
function afterNextFrame(callback) {
    const done = ()=>{
        clearTimeout(timeout);
        if (HAS_RAF) cancelAnimationFrame(raf);
        setTimeout(callback);
    };
    const timeout = setTimeout(done, 100);
    let raf;
    if (HAS_RAF) {
        raf = requestAnimationFrame(done);
    }
}
function afterPaint(newQueueLength) {
    if (newQueueLength === 1 || prevRaf !== options.requestAnimationFrame) {
        prevRaf = options.requestAnimationFrame;
        (prevRaf || afterNextFrame)(flushAfterPaintEffects);
    }
}
function invokeCleanup(hook) {
    const comp = currentComponent;
    let cleanup = hook._cleanup;
    if (typeof cleanup == "function") {
        hook._cleanup = undefined;
        cleanup();
    }
    currentComponent = comp;
}
function invokeEffect(hook) {
    const comp = currentComponent;
    hook._cleanup = hook._value();
    currentComponent = comp;
}
function Alice() {
    return createElement("div", null, "Alice");
}
function Bob() {
    return createElement("div", null, "Bob");
}
render(createElement("div", null, createElement(Alice, null), createElement(Bob, null)), document.body);
