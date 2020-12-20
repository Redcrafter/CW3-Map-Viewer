import * as cw3 from "./cw3.js";
import * as cw4 from "./cw4.js";
import { mapEditor } from "./mapEditor.js";
let currentPage = 0;
let pageSize = 20;
let cw3Data = null;
let cw4Data = null;
let displayedData = [];
let searchEl = document.getElementById("search");
let orderEl = document.getElementById("order");
let gameEl = document.getElementById("gameSelect");
searchEl.addEventListener("input", updateData);
orderEl.addEventListener("input", updateData);
gameEl.addEventListener("input", () => {
    while (orderEl.firstChild) {
        orderEl.removeChild(orderEl.firstChild);
    }
    let elements;
    switch (gameEl.value) {
        case "cw3":
            elements = ["Newest", "Rating", "Scores", "Average Time", "Size", "Random"];
            break;
        case "cw4":
            elements = ["Newest", "Rating", "Size", "Random"];
            break;
        default: throw "Unknown game type";
    }
    for (const item of elements) {
        let el = document.createElement("option");
        el.innerText = item;
        orderEl.appendChild(el);
    }
    currentPage = 0;
    updateData();
});
async function updateData() {
    let map;
    let filterMap;
    switch (gameEl.value) {
        case "cw3":
            if (!cw3Data) {
                cw3Data = await cw3.fetchMapList();
            }
            displayedData = cw3Data;
            map = {
                "Newest": x => x.UnixTime,
                "Rating": x => x.Rating,
                "Scores": x => x.Scores,
                "Average Time": x => x.ClearTicks,
                "Size": x => x.Width * x.Height,
                "Random": x => Math.random()
            };
            filterMap = (map) => {
                for (const property of ["Name", "Author", "Description"]) {
                    if (map[property].toLowerCase().includes(searchText)) {
                        return true;
                    }
                }
                return false;
            };
            break;
        case "cw4":
            if (!cw4Data) {
                cw4Data = await cw4.fetchMapList();
            }
            displayedData = cw4Data;
            map = {
                "Newest": x => x.UnixTime,
                "Rating": x => x.Thumbs,
                "Size": x => x.Width * x.Height,
                "Random": x => Math.random()
            };
            filterMap = (map) => {
                for (const property of ["Name", "Author"]) {
                    if (map[property].toLowerCase().includes(searchText)) {
                        return true;
                    }
                }
                for (const tag of map.Tags) {
                    if (tag.toLowerCase().includes(searchText)) {
                        return true;
                    }
                }
                return false;
            };
            break;
        default: throw "Unknown game type";
    }
    let searchText = searchEl.value.toLowerCase();
    if (searchText != "") {
        displayedData = displayedData.filter(filterMap);
    }
    let measure = orderEl.value;
    let fn = map[measure];
    displayedData.sort((a, b) => fn(b) - fn(a));
    updatePage();
}
function changePage(i) {
    if (i >= 0 && currentPage != i) {
        currentPage = i;
        updatePage();
    }
}
async function loadMap(map) {
    mapEditor.loadMap(await map.download());
    colonialSpace.display(false);
    mapEditor.display(true);
    mapEditor.onClose = () => {
        colonialSpace.display(true);
        mapEditor.display(false);
    };
}
function showCW3(data) {
    let children = [];
    for (let i = 0; i < pageSize && i + currentPage * pageSize < data.length; i++) {
        const item = data[i + currentPage * pageSize];
        children.push(hyperscript("div", { class: "mapInfo", onclick: () => loadMap(item) },
            hyperscript("div", { class: "left" },
                hyperscript("div", { class: "label" }, "Map #:"),
                hyperscript("div", null, item.Id),
                hyperscript("div", null,
                    "[",
                    item.Width,
                    "x",
                    item.Height,
                    "]"),
                hyperscript("div", { class: "label" }, "Title:"),
                hyperscript("div", { class: "asdf" }, item.Name),
                hyperscript("div", { class: "label" }, "Author:"),
                hyperscript("div", { class: "asdf" }, item.Author),
                hyperscript("div", { class: "label" }, "~Time:"),
                hyperscript("div", { class: "asdf" }, item.ClearTicks),
                hyperscript("div", { class: "label" }, "Rating:"),
                hyperscript("div", null, item.Rating),
                hyperscript("div", null,
                    hyperscript("span", { class: "label" }, "Num:"),
                    " ",
                    item.Ratings),
                hyperscript("div", { class: "label" }, "Scores:"),
                hyperscript("div", { class: "asdf" }, item.Scores),
                hyperscript("div", { class: "label" }, "DLoads:"),
                hyperscript("div", { class: "asdf" }, item.Downloads),
                hyperscript("div", { class: "label" }, "Desc:"),
                item.Description && hyperscript("pre", { class: "asdf" }, item.Description)),
            hyperscript("div", { class: "right" },
                hyperscript("img", { src: item.imageUrl }))));
    }
    render(hyperscript("div", { class: "mapList" }, children), document.querySelector("#container"));
}
function showCW4(data) {
    let children = [];
    for (let i = 0; i < pageSize && i + currentPage * pageSize < data.length; i++) {
        const item = data[i + currentPage * pageSize];
        children.push(hyperscript("div", { class: "cw4mapInfo", onclick: () => loadMap(item) },
            hyperscript("div", null, item.Name),
            hyperscript("div", { class: "grid" },
                hyperscript("div", { class: "end wide" },
                    "[",
                    item.Width,
                    "x",
                    item.Height,
                    "]"),
                hyperscript("div", null, item.Thumbs ?? ""),
                hyperscript("div", { class: "end objective" },
                    (item.Objective & 1) && hyperscript("div", { class: "nullify" }),
                    (item.Objective & 2) && hyperscript("div", { class: "totems" }),
                    (item.Objective & 4) && hyperscript("div", { class: "reclaim" }),
                    (item.Objective & 8) && hyperscript("div", { class: "survive" }),
                    (item.Objective & 16) && hyperscript("div", { class: "collect" }),
                    (item.Objective & 32) && hyperscript("div", { class: "custom" })),
                hyperscript("div", null, item.Author),
                hyperscript("div", { class: "end" }, item.Id)),
            hyperscript("div", { class: "img" },
                hyperscript("img", { src: item.imageUrl }))));
    }
    render(hyperscript("div", { class: "mapList" }, children), document.querySelector("#container"));
}
function updatePage() {
    switch (gameEl.value) {
        case "cw3":
            showCW3(displayedData);
            break;
        case "cw4":
            showCW4(displayedData);
            break;
        default: throw "Unknown game type";
    }
    let pages = Math.ceil(displayedData.length / pageSize);
    let l = Math.max(currentPage - 2, 0);
    let r = Math.min(currentPage + 2, pages);
    let asdf = [];
    asdf.push(hyperscript("div", { onclick: () => changePage(currentPage - 1) }, "<"));
    for (let i = l; i <= r; i++) {
        let el = hyperscript("div", { onclick: () => changePage(i) }, i + 1);
        if (i == currentPage) {
            el.props.class = "selected";
        }
        asdf.push(el);
    }
    asdf.push(hyperscript("div", { onclick: () => changePage(currentPage + 1) }, ">"));
    render(asdf, document.querySelector("#pageSelection"));
}
let colonialSpace = {
    display(display) {
        document.getElementById("colonialSpace").style.display = display ? "" : "none";
        if (display) {
            updateData();
        }
    }
};
export { colonialSpace };
