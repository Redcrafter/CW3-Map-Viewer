import { Game } from "./cw3/cw3.js";
import { cw3MapViewer } from "./cw3/cw3display.js";
import { cw4MapViewer } from "./cw4/cw4Display.js";
const mapEditor = {
    display(display) {
        document.getElementById("mapEditor").style.display = display ? "" : "none";
    },
    loadMap(data) {
        if (data instanceof Game) {
            openCW3(data);
        }
        else {
            openCW4(data);
        }
    },
    onClose: () => { },
};
const mainTabWindow = document.getElementById("mainTabWindow");
const topTabBar = document.getElementById("topTabBar");
const topTabs = [];
const container = document.getElementById("canvasContainer");
const canvas = document.getElementById("mainCanvas");
const leftTabs = {
    general: {
        button: document.getElementById("generalTabButton"),
        tab: document.getElementById("generalTab")
    },
    script: {
        button: document.getElementById("scriptTabButton"),
        tab: document.getElementById("scriptTab")
    },
    image: {
        button: document.getElementById("imageTabButton"),
        tab: document.getElementById("imageTab"),
        images: document.getElementById("images")
    },
};
let currentTopTab = null;
leftTabs.general.button.addEventListener("click", () => {
    leftTabs.general.tab.style.display = "";
    leftTabs.script.tab.style.display = "none";
    leftTabs.image.tab.style.display = "none";
});
leftTabs.script.button.addEventListener("click", () => {
    leftTabs.general.tab.style.display = "none";
    leftTabs.script.tab.style.display = "";
    leftTabs.image.tab.style.display = "none";
});
leftTabs.image.button.addEventListener("click", () => {
    leftTabs.general.tab.style.display = "none";
    leftTabs.script.tab.style.display = "none";
    leftTabs.image.tab.style.display = "";
});
async function openCW3(game) {
    let renderer = new cw3MapViewer(canvas, container);
    await renderer.loadMap(game);
}
async function openCW4(game) {
    document.getElementById("leftTabBar").style.display = "none";
    document.getElementById("leftNav").style.display = "none";
    let renderer = new cw4MapViewer(canvas, container);
    renderer.loadMap(game);
}
function selectTopTab(i) {
    let el = topTabs[i];
    if (currentTopTab) {
        currentTopTab.topEl.removeAttribute("active");
        currentTopTab.main.removeAttribute("active");
    }
    el.topEl.setAttribute("active", "");
    el.main.setAttribute("active", "");
    currentTopTab = el;
}
function addTab(options) {
    let topEl = document.createElement("div");
    let title = document.createElement("div");
    title.classList.add("title");
    title.innerText = options.name;
    topEl.appendChild(title);
    if (options.closeAble !== false) {
        let close = document.createElement("div");
        close.classList.add("close");
        close.innerText = "x";
        topEl.appendChild(close);
        function closeTab() {
            if (!options.mainEl) {
                mainTabWindow.removeChild(main);
            }
            if (options.onClose) {
                options.onClose();
            }
            if (currentTopTab == el) {
                if (topEl.previousSibling) {
                    topEl.previousSibling.click();
                }
                else if (topTabBar.children.length > 0) {
                    topTabBar.children[0].click();
                }
            }
            topTabBar.removeChild(topEl);
        }
        close.addEventListener("click", (e) => {
            closeTab();
            e.stopPropagation();
        });
        topEl.addEventListener("mouseup", (e) => {
            if (e.button == 1) {
                closeTab();
            }
        });
    }
    topTabBar.appendChild(topEl);
    let main;
    if (options.mainEl) {
        main = options.mainEl;
    }
    else {
        main = document.createElement("div");
        mainTabWindow.appendChild(main);
    }
    let el = {
        topEl,
        main
    };
    topTabs.push(el);
    topEl.addEventListener("click", () => {
        selectTopTab(topTabs.indexOf(el));
    });
    selectTopTab(topTabs.length - 1);
    return main;
}
export { mapEditor, addTab, selectTopTab, leftTabs };