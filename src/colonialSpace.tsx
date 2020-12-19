

import * as cw3 from "./cw3.js";
import * as cw4 from "./cw4.js";
import { Objective } from "./cw4.js";

import { mapEditor } from "./mapEditor.js";


let currentPage = 0;
let pageSize = 20;

let cw3Data: cw3.ColonialSpace[] = null;
let cw4Data: cw4.ColonialSpace[] = null;

let displayedData: any[] = [];

let searchEl = document.getElementById("search") as HTMLInputElement;
let orderEl = document.getElementById("order") as HTMLSelectElement;
let gameEl = document.getElementById("gameSelect") as HTMLSelectElement;


searchEl.addEventListener("input", updateData);
orderEl.addEventListener("input", updateData);
gameEl.addEventListener("input", () => {
    while (orderEl.firstChild) { orderEl.removeChild(orderEl.firstChild); }
    let elements: string[];

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
            filterMap = (map: cw3.ColonialSpace) => {
                for (const property of ["Name", "Author", "Description"]) {
                    if (map[property].toLowerCase().includes(searchText)) {
                        return true;
                    }
                }

                return false;
            }
            break;
        case "cw4":
            if (!cw4Data) {
                cw4Data = await cw4.fetchMapList();
            }
            displayedData = cw4Data;
            map = {
                "Newest": x => x.UnixTime,
                "Rating": x => x.Thumbs,
                // "Scores": x => x.Scores,
                // "Average Time": x => x.ClearTicks,
                "Size": x => x.Width * x.Height,
                "Random": x => Math.random()
            }

            filterMap = (map: cw4.ColonialSpace) => {
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

async function loadMap(map: cw3.ColonialSpace | cw4.ColonialSpace) {
    mapEditor.loadMap(await map.download());

    colonialSpace.display(false);
    mapEditor.display(true);

    mapEditor.onClose = () => {
        colonialSpace.display(true);
        mapEditor.display(false);
    }
}

function showCW3(data: cw3.ColonialSpace[]) {
    let children = [];

    for (let i = 0; i < pageSize && i + currentPage * pageSize < data.length; i++) {
        const item = data[i + currentPage * pageSize];

        children.push(<div class="mapInfo" onclick={() => loadMap(item)}>
            <div class="left">
                <div class="label">Map #:</div><div>{item.Id}</div><div>[{item.Width}x{item.Height}]</div>
                <div class="label">Title:</div><div class="asdf">{item.Name}</div>
                <div class="label">Author:</div><div class="asdf">{item.Author}</div>
                <div class="label">~Time:</div><div class="asdf">{item.ClearTicks}</div>
                <div class="label">Rating:</div><div>{item.Rating}</div><div><span class="label">Num:</span> {item.Ratings}</div>
                <div class="label">Scores:</div><div class="asdf">{item.Scores}</div>
                <div class="label">DLoads:</div><div class="asdf">{item.Downloads}</div>
                <div class="label">Desc:</div>{item.Description && <pre class="asdf">{item.Description}</pre>}
            </div>
            <div class="right">
                <img src={item.imageUrl}></img>
            </div>
        </div>)
    }

    render(<div class="mapList">{children}</div>, document.querySelector("#container"));
}

function showCW4(data: cw4.ColonialSpace[]) {
    let children = [];

    for (let i = 0; i < pageSize && i + currentPage * pageSize < data.length; i++) {
        const item = data[i + currentPage * pageSize];

        children.push(
            <div class="cw4mapInfo" onclick={() => loadMap(item)}>
                <div>{item.Name}</div>
                <div class="grid">
                    <div class="end wide">[{item.Width}x{item.Height}]</div>
                    <div>{item.Thumbs ?? ""}</div>
                    <div class="end objective">
                        { (item.Objective & Objective.Nullify) && <div class="nullify"></div> }
                        { (item.Objective & Objective.Totems) && <div class="totems"></div> }
                        { (item.Objective & Objective.Reclaim) && <div class="reclaim"></div> }
                        { (item.Objective & Objective.Survive) && <div class="survive"></div> }
                        { (item.Objective & Objective.Collect) && <div class="collect"></div> }
                        { (item.Objective & Objective.Custom) && <div class="custom"></div> }
                    </div>
                    <div>{item.Author}</div>
                    <div class="end">{item.Id}</div>
                </div>
                <div class="img">
                    <img src={item.imageUrl} />
                </div>
            </div>
        )
    }

    render(<div class="mapList">{children}</div>, document.querySelector("#container"));
}

function updatePage() {
    switch (gameEl.value) {
        case "cw3": showCW3(displayedData); break;
        case "cw4": showCW4(displayedData); break;
        default: throw "Unknown game type";
    }

    let pages = Math.ceil(displayedData.length / pageSize);

    let l = Math.max(currentPage - 2, 0);
    let r = Math.min(currentPage + 2, pages);

    let asdf = [];
    asdf.push(<div onclick={() => changePage(currentPage - 1)}>&lt;</div>);
    for (let i = l; i <= r; i++) {
        let el = <div onclick={() => changePage(i)}>{i + 1}</div>;
        if (i == currentPage) {
            el.props.class = "selected"
        }
        asdf.push(el);
    }
    asdf.push(<div onclick={() => changePage(currentPage + 1)}>&gt;</div>);

    render(asdf, document.querySelector("#pageSelection"));
}

let colonialSpace = {
    display(display: boolean) {
        document.getElementById("colonialSpace").style.display = display ? "" : "none";

        if (display) {
            updateData();
        }
    }
};

export { colonialSpace }