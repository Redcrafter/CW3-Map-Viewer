

import { fetchMapList, ColonialSpace } from "./cw3.js";
import { mapEditor } from "./mapEditor.js";


let currentPage = 0;
let pageSize = 20;

let data: ColonialSpace[] = [];

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

async function loadMap(map: ColonialSpace) {
    mapEditor.loadMap(await map.download());

    colonialSpace.display(false);
    mapEditor.display(true);

    mapEditor.onClose = () => {
        colonialSpace.display(true);
        mapEditor.display(false);
    }
}

function updatePage() {
    let children = [];

    for (let i = 0; i < pageSize; i++) {
        const item = data[i + currentPage * pageSize];

        children.push(<div class="mapInfo" onclick={() => loadMap(item)}>
            <div class="left">
                <div class="title">{item.Name}</div>
                <div class="author">
                    by {item.Author} <br />
                    Rating: {item.Rating}
                </div>

                {item.Description && <pre>
                    {item.Description}
                </pre>}
            </div>
            <div class="right">
                <img src={item.imageUrl}></img>
            </div>
        </div>);
    }

    render(<div class="mapList">{children}</div>, document.querySelector("#container"));


    let pages = Math.ceil(data.length / pageSize);

    let l = Math.max(currentPage - 2, 0);
    let r = Math.min(currentPage + 2, pages);

    let asdf = [];
    if (currentPage > 0) {
        asdf.push(<div onclick={() => changePage(currentPage - 1)}>&lt;</div>);
    }
    for (let i = l; i < r; i++) {
        asdf.push(<div onclick={() => changePage(i)}>
            {i + 1}
        </div>)
    }
    if (currentPage < pages) {
        asdf.push(<div onclick={() => changePage(currentPage + 1)}>&gt;</div>);
    }

    render(asdf, document.querySelector("#pageSelection"));
}

let colonialSpace = {
    display(display: boolean) {
        document.getElementById("colonialSpace").style.display = display ? "" : "none";

        if (display && data.length == 0) {
            load();
        }
    }
};

export { colonialSpace }