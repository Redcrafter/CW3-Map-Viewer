function flatten(children) {
    let res = [];
    for (const child of children) {
        if (child instanceof Array) {
            res.push(...flatten(child));
        }
        else {
            res.push(child);
        }
    }
    return res;
}
function hyperscript(tag, props, ...children) {
    if (!props)
        props = {};
    return { tag, props, children: flatten(children) };
}
function addProps(el, props) {
    for (const key in props) {
        let item = props[key];
        if (key == "oninput") {
            el.oninput = item;
        }
        else if (key == "onclick") {
            el.onclick = item;
        }
        else {
            el.setAttribute(key, item);
        }
    }
}
function domDiff(element, container, childIndex) {
    let el = container.childNodes[childIndex];
    if (!element) {
        return;
    }
    if (typeof element == "string" || typeof element == "number") {
        if (el instanceof Text) {
            el.textContent = element;
        }
        else {
            if (el)
                container.removeChild(el);
            container.insertBefore(document.createTextNode(element), container.childNodes[childIndex]);
        }
    }
    else {
        if (!el || el.nodeName.toLowerCase() != element.tag.toLowerCase()) {
            if (el) {
                container.removeChild(el);
            }
            el = document.createElement(element.tag);
            container.insertBefore(el, container.childNodes[childIndex]);
            addProps(el, element.props);
        }
        else {
            for (const item of el.attributes) {
                if (!element.props.hasOwnProperty(item.nodeName)) {
                    el.removeAttribute(item.nodeName);
                }
            }
            addProps(el, element.props);
        }
        let pos = 0;
        for (const item of element.children) {
            if (item) {
                domDiff(item, el, pos);
                pos++;
            }
        }
        while (el.childNodes.length > pos) {
            el.removeChild(el.lastChild);
        }
    }
}
function render(element, container) {
    if (element instanceof Array) {
        for (let i = 0; i < element.length; i++) {
            domDiff(element[i], container, i);
        }
        while (container.children.length > element.length) {
            container.removeChild(container.lastChild);
        }
    }
    else {
        domDiff(element, container, 0);
    }
}
function createElements(element) {
    function create(element) {
        if (typeof element === "string") {
            return document.createTextNode(element);
        }
        else {
            let el = document.createElement(element.tag);
            addProps(el, element.props);
            for (const item of element.children) {
                el.appendChild(create(item));
            }
            return el;
        }
    }
    if (element instanceof Array) {
        let ret = [];
        for (const item of element) {
            ret.push(create(item));
        }
        return ret;
    }
    else {
        return create(element);
    }
}
