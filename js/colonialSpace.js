import { fetchMapList } from "./cw3.js";
import { mapEditor } from "./mapEditor.js";
let currentPage = 0;
let pageSize = 20;
let data = [];
async function load() {
    data = await fetchMapList();
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
function updatePage() {
    let children = [];
    for (let i = 0; i < pageSize; i++) {
        const item = data[i + currentPage * pageSize];
        children.push(hyperscript("div", { class: "mapInfo", onclick: () => loadMap(item) },
            hyperscript("div", { class: "left" },
                hyperscript("div", { class: "title" }, item.Name),
                hyperscript("div", { class: "author" },
                    "by ",
                    item.Author,
                    " ",
                    hyperscript("br", null),
                    "Rating: ",
                    item.Rating),
                item.Description && hyperscript("pre", null, item.Description)),
            hyperscript("div", { class: "right" },
                hyperscript("img", { src: item.imageUrl }))));
    }
    render(hyperscript("div", { class: "mapList" }, children), document.querySelector("#container"));
    let pages = Math.ceil(data.length / pageSize);
    let l = Math.max(currentPage - 2, 0);
    let r = Math.min(currentPage + 2, pages);
    let asdf = [];
    if (currentPage > 0) {
        asdf.push(hyperscript("div", { onclick: () => changePage(currentPage - 1) }, "<"));
    }
    for (let i = l; i < r; i++) {
        asdf.push(hyperscript("div", { onclick: () => changePage(i) }, i + 1));
    }
    if (currentPage < pages) {
        asdf.push(hyperscript("div", { onclick: () => changePage(currentPage + 1) }, ">"));
    }
    render(asdf, document.querySelector("#pageSelection"));
}
let colonialSpace = {
    display(display) {
        document.getElementById("colonialSpace").style.display = display ? "" : "none";
        if (display && data.length == 0) {
            load();
        }
    }
};
export { colonialSpace };
