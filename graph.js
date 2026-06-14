// graph.js
let svg, simulation, nodesGroup, linksGroup;
let isAddMode = false;
let selectedForConnection = null;

function initGraph() {
    svg = d3.select("#graph-svg");
    svg.selectAll("*").remove();

    const container = document.querySelector('.graph-container');
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Додано кращу "пружинність": forceManyBody відштовхує, forceLink притягує
    simulation = d3.forceSimulation(people)
        .force("link", d3.forceLink().id(d => d.id).distance(120).strength(0.5))
        .force("charge", d3.forceManyBody().strength(-800))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(35));

    linksGroup = svg.append("g").attr("class", "links");
    nodesGroup = svg.append("g").attr("class", "nodes");

    updateGraphElements();
    simulation.on("tick", ticked);
}

function updateGraphElements() {
    // 1. Знаходимо найвпливовішого (Hub)
    const degreeMap = {};
    edges.forEach(([s, t]) => {
        degreeMap[s] = (degreeMap[s] || 0) + 1;
        degreeMap[t] = (degreeMap[t] || 0) + 1;
    });
    
    let maxDegree = 0;
    let hubId = null;
    Object.keys(degreeMap).forEach(id => {
        if (degreeMap[id] > maxDegree) {
            maxDegree = degreeMap[id];
            hubId = parseInt(id);
        }
    });

    // Оновлення ліній
    const links = linksGroup.selectAll("line")
        .data(edges.map(([s, t]) => ({ source: people[s], target: people[t] })));

    links.exit().remove();
    links.enter().append("line")
        .attr("stroke", "var(--edge-color)")
        .attr("stroke-width", 2)
        .merge(links);

    // Оновлення вузлів
    const nodes = nodesGroup.selectAll("g.node")
        .data(people, d => d.id);

    nodes.exit().remove();
    
    const nodesEnter = nodes.enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    nodesEnter.append("circle")
        .attr("r", 22)
        .attr("stroke-width", 2);

    nodesEnter.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", 5)
        .text(d => d.name.split(" ")[0]);

    const allNodes = nodesEnter.merge(nodes);
    
    // Підсвічування Хаба
    allNodes.select("circle")
        .attr("fill", d => d.id === hubId ? "#ff7eb3" : "var(--glass-bg)")
        .attr("stroke", d => d.id === hubId ? "#fff" : "var(--accent-pink)");

    allNodes.on("click", handleNodeClick);
}

function ticked() {
    // ВАЖЛИВО: Оновлюємо координати кожного тіку, щоб лінії рухалися разом з кульками
    linksGroup.selectAll("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    nodesGroup.selectAll("g.node")
        .attr("transform", d => `translate(${d.x},${d.y})`);
}

function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
}

function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
}

function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
}
