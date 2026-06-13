// graph.js
let svg, simulation, nodesGroup, linksGroup;
let isAddMode = false;

function initGraph() {
    svg = d3.select("#graph-svg");
    svg.selectAll("*").remove();

    const container = document.querySelector('.graph-container');
    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 700;

    simulation = d3.forceSimulation(people)
        .force("link", d3.forceLink().id(d => d.id).distance(130).strength(0.8))
        .force("charge", d3.forceManyBody().strength(-1200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(45))
        .force("x", d3.forceX(width / 2).strength(0.1))
        .force("y", d3.forceY(height / 2).strength(0.1));

    // Links
    linksGroup = svg.append("g").attr("class", "links");
    nodesGroup = svg.append("g").attr("class", "nodes");

    updateLinks();
    updateNodes();

    simulation.on("tick", ticked);

    simulation.alpha(1).restart();
}

function updateLinks() {
    const linkData = edges.map(([source, target]) => ({
        source: people[source],
        target: people[target]
    }));

    const links = linksGroup.selectAll("line")
        .data(linkData, d => `${d.source.id}-${d.target.id}`);

    links.exit().remove();

    links.enter().append("line")
        .attr("stroke", "#6b6b9e")
        .attr("stroke-width", 2.8)
        .attr("stroke-opacity", 0.75)
        .merge(links);
}

function updateNodes() {
    const nodeElements = nodesGroup.selectAll("g")
        .data(people, d => d.id);

    nodeElements.exit().remove();

    const nodeEnter = nodeElements.enter().append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    nodeEnter.append("circle")
        .attr("r", 26)
        .attr("fill", "#6366f1")
        .attr("stroke", "#a5b4fc")
        .attr("stroke-width", 4);

    nodeEnter.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", 6)
        .attr("fill", "#ffffff")
        .style("font-size", "12px")
        .style("font-weight", "700")
        .text(d => d.name.split(" ")[0]);

    nodeEnter.on("click", function(event, d) {
        if (isAddMode) {
            handleNodeClickForConnection(d);
        } else {
            showNodeInfo(d);
        }
    });

    nodesGroup.selectAll("g").merge(nodeEnter);
}

function ticked() {
    linksGroup.selectAll("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    nodesGroup.selectAll("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);
}

function updateGraph() {
    updateLinks();
    updateNodes();
    simulation.nodes(people);
    simulation.force("link").links(edges.map(([s,t]) => ({
        source: people[s], target: people[t]
    })));
    simulation.alpha(0.8).restart();
}

// Drag functions (без змін)
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
