let keyWords = new Set([
    "once",
    "endonce",
    "if",
    "else",
    "endif",
    "do",
    "loop",
    "while",
    "repeat",
    "endwhile",
    "break",
    "return",
    "delay",
]);

let constFunctions = new Set([
    "self",
    "const_acpacketrequestdelay",
    "const_ammo",
    "const_ammoac",
    "const_beamtarget",
    "const_buildcost",
    "const_canrequestammo",
    "const_cellheight",
    "const_cellwidth",
    "const_connectable",
    "const_coordx",
    "const_coordy",
    "const_countsforvictory",
    "const_createpz",
    "const_destroymode",
    "const_destroyondamage",
    "const_healrate",
    "const_health",
    "const_isbuilding",
    "const_isdestroyed",
    "const_islanded",
    "const_maxammo",
    "const_maxammoac",
    "const_maxhealth",
    "const_nullifierdamageamt",
    "const_nullifierdamages",
    "const_packetrequestdelay",
    "const_pixelcoordx",
    "const_pixelcoordy",
    "const_requestacpackets",
    "const_requestpackets",
    "const_showammoacbar",
    "const_showammobar",
    "const_showhealthbar",
    "const_snipertarget",
    "const_sniperignorelos",
    "const_supportsdigitalis",
    "const_takemapspace",
    "const_thortarget",

    "true",
    "false",

    "i",
    "j",
    "k"
]);

function isNumber(str: string) {
    return !Number.isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function error(message: string) {
    message = `Error parsing script: ${message}`;

    console.error(message);
    alert(message);
}

export function produceHighlighted(text: string, el: HTMLElement) {
    // remove all \r
    text = text.replace(/\r/g, "");

    let currentPos = 0;
    let spelling = "";

    let c = text.charAt(currentPos++);

    let scopes = [];
    let scopeCount = 0;

    let groups = new Map<string, { elements: HTMLElement[], func: () => void }>();
    let selectedGroup;

    function addToGroup(name: string, element: HTMLElement) {
        let group;
        if (groups.has(name)) {
            group = groups.get(name);
        } else {
            group = {
                elements: [],
                func() {
                    deselectGroup();
                    for (const el of this.elements) {
                        el.classList.add("highlighted");
                    }
                    selectedGroup = this;
                }
            }
            groups.set(name, group);
        }

        group.elements.push(element);
        element.addEventListener("click", (e) => { group.func(); e.stopPropagation(); });
    }

    function deselectGroup() {
        if (selectedGroup) {
            for (const el of selectedGroup.elements) {
                el.classList.remove("highlighted");
            }
        }
    }

    function pushScope(el: HTMLElement) {
        scopes.push(scopeCount);
        addToGroup("scope" + scopeCount, el);
        scopeCount++;
    }
    function addToScope(el: HTMLElement) {
        if (scopes.length == 0) {
            error("Error parsing script: invalid scope add");
            return;
        } else {
            addToGroup("scope" + scopes[scopes.length - 1], el);
        }
    }
    function popScope(el: HTMLElement) {
        if (scopes.length == 0) {
            error("Error parsing script: invalid scope pop");
            return;
        } else {
            addToGroup("scope" + scopes.pop(), el);
        }
    }

    document.addEventListener("keydown", (e) => {
        if (e.key == "Escape") {
            deselectGroup();
        }
    });
    el.addEventListener("click", (e) => {
        deselectGroup();
    })

    function skip() {
        c = text.charAt(currentPos++);
    }
    function accept() {
        spelling += c;
        skip();
    }

    function pushSpan(text: string, colorClass: string) {
        let span = document.createElement("span");
        span.appendChild(document.createTextNode(text));
        span.classList.add(colorClass);

        el.appendChild(span);

        return span;
    }

    function pushSpelling(colorClass: string) {
        let span = document.createElement("span");
        span.appendChild(document.createTextNode(spelling));
        span.classList.add(colorClass);

        el.appendChild(span);

        return span;
    }

    while (currentPos <= text.length) {
        spelling = "";

        switch (c) {
            case '\n':
                skip();
                el.appendChild(document.createElement("br"));
                break;
            case ' ':
            case '\t':
                while (currentPos <= text.length) {
                    if (c == ' ') {
                        accept();
                    } else if (c == '\t') {
                        spelling += "    ";
                        skip();
                    } else {
                        break;
                    }
                }
                el.appendChild(document.createTextNode(spelling));
                break;
            case '#':
                while (c != '\n' && currentPos <= text.length) {
                    accept();
                }
                pushSpelling("commentColor");
                break;
            case '"':
                accept();
                while (c != '"' && currentPos <= text.length) {
                    accept();
                }
                if (c == '"') {
                    accept();
                }
                pushSpelling("stringColor");
                break;
            case '(':
            case ')':
                el.appendChild(document.createTextNode(c));
                skip();
                break;
            default:
                while (c != ' ' && c != '\n' && c != '\t' && c != '#' && c != '(' && c != ')' && currentPos <= text.length) {
                    accept();
                }
                let lower = spelling.toLowerCase();

                if (keyWords.has(lower)) {
                    let el = pushSpelling("keywordColor");
                    switch (lower) {
                        case "once":
                        case "if":
                        case "do":
                        case "while":
                            pushScope(el);
                            break;
                        case "endonce":
                        case "endif":
                        case "loop":
                        case "endwhile":
                            popScope(el);
                            break;
                        case "else":
                        case "repeat":
                            addToScope(el);
                            break;
                        case "break":
                        default:
                            addToGroup("key" + lower, el);
                            break;
                    }
                } else if (isNumber(spelling)) {
                    pushSpelling("numberColor");
                } else if (spelling.startsWith("$")) {
                    el.appendChild(document.createTextNode("$"));
                    let varName = spelling.substring(1, spelling.indexOf(":"));
                    addToGroup("var" + varName, pushSpan(varName, "varColor"));
                    el.appendChild(document.createTextNode(":"));
                    let val = spelling.substring(spelling.indexOf(":") + 1);

                    if (isNumber(val)) {
                        pushSpan(val, "numberColor");
                    } else if (val.startsWith('"')) {
                        pushSpan(val, "stringColor");
                    } else {
                        console.error("Syntax error"); // Should not be possible
                        pushSpan(val, "numberColor");
                    }
                } else if (spelling.startsWith(":")) {
                    el.appendChild(document.createTextNode(":"));
                    let name = spelling.substring(1);

                    addToGroup("func" + name, pushSpan(name, "functionColor"))
                } else if (spelling.startsWith("@")) {
                    addToGroup("func" + spelling.substring(1), pushSpelling("functionColor"));
                } else if (constFunctions.has(lower)) {
                    addToGroup("const" + lower, pushSpelling("constColor"));
                } else {
                    let starts = ["--", "<-", "->", "-?", "<-!", "->!", "-?!", "--?"];

                    let matched = false;
                    for (const item of starts) {
                        if (spelling.startsWith(item)) {
                            let name = spelling.substring(item.length);

                            el.appendChild(document.createTextNode(item));
                            addToGroup("var" + name, pushSpan(name, "varColor"));

                            matched = true;
                            break;
                        }
                    }

                    if (!matched) {
                        addToGroup("builtIn" + lower, pushSpelling("builtinColor"));
                    }
                }
                break;
        }
    }
}
