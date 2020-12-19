function flatten(children: any[]) {
    let res = [];

    for (const child of children) {
        if (child instanceof Array) {
            res.push(...flatten(child));
        } else {
            res.push(child);
        }
    }

    return res;
}

interface El {
    tag: string;
    props: Object;
    children: any[];
}

function hyperscript(tag: string, props: Object, ...children: any[]): El {
    if(!props) props = {};
    return { tag, props, children: flatten(children) }
}

/**
 * 
 * @param element element to render
 * @param container parent element
 * @param childIndex at which point to render the element
 */
function domDiff(element: El | string, container: HTMLElement, childIndex: number) {
    // element to replace
    let el = container.childNodes[childIndex];

    if(!element) {
        return;
    }

    if (typeof element == "string" || typeof element == "number") {
        if (el instanceof Text) {
            el.textContent = element;
        } else {
            if (el) container.removeChild(el);
            container.insertBefore(document.createTextNode(element), container.childNodes[childIndex]);
        }
    } else {
        if (!el || el.nodeName.toLowerCase() != element.tag.toLowerCase()) {
            if (el) {
                container.removeChild(el);
            }
            el = document.createElement(element.tag);
            container.insertBefore(el, container.childNodes[childIndex]);

            for (const key in element.props) {
                let item = element.props[key];

                if(key == "onclick") {
                    el.onclick = item;
                } else /*if(key.startsWith("on")) {
                    el.addEventListener(key.substr(2), item);
                } else*/ {
                    el.setAttribute(key, item);
                }
            }
        } else {
            for (const item of el.attributes) {
                if (!element.props.hasOwnProperty(item.nodeName)) {
                    el.removeAttribute(item.nodeName);
                }
            }

            for (const key in element.props) {
                const val = element.props[key];

                if(key == "onclick") {
                    el.onclick = val;
                } else /*if(key.startsWith("on")) {
                    el.addEventListener(key.substr(2), val);
                } else*/ {
                    if (el.getAttribute(key) != val) {
                        el.setAttribute(key, val);
                    }
                }
            }
        }

        let pos = 0;
        for (const item of element.children) {
            if(item) {
                domDiff(item, el, pos);
                pos++;
            }
        }

        while (el.childNodes.length > pos) {
            el.removeChild(el.lastChild);
        }
    }
}

function render(element: El | El[] | string, container: HTMLElement) {
    if (element instanceof Array) {
        for (let i = 0; i < element.length; i++) {
            domDiff(element[i], container, i);
        }

        while (container.children.length > element.length) {
            container.removeChild(container.lastChild);
        }
    } else {
        domDiff(element, container, 0);
    }
}