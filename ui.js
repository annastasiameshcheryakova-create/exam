// graph.js
let svg, simulation, nodes, links;
let isAddMode = false;

function initGraph() {
    svg = d3.select("#graph-svg");
    svg.selectAll("*").remove();
    
    const width = window.innerWidth - 600;
    const height = window.innerHeight - 120;
    
    simulation = d3.forceSimulation(people)
        .force("link", d3.forceLink().id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-800))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(35));
    
    // Links
    links = svg.append("g")
        .selectAll("line")
        .data(edges)
        .enter()
        .append("line")
        .attr("stroke", "#555588")
        .attr("stroke-width", 2.5)
        .attr("stroke-opacity", 0.7);
    
    // Nodes
    nodes = svg.append("g")
        .selectAll("g")
        .data(people)
        .enter()
        .append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    
    nodes.append("circle")
        .attr("r", 22)
        .attr("fill", "#6464ff")
        .attr("stroke", "#a0a0ff")
        .attr("stroke-width", 3);
    
    nodes.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", 6)
        .attr("fill", "white")
        .style("font-size", "11px")
        .style("font-weight", "600")
        .text(d => d.name.split(" ")[0]);
    
    nodes.on("click", function(event, d) {
        if (isAddMode) {
            handleNodeClickForConnection(d);
        } else {
            showNodeInfo(d);
        }
    });
    
    simulation.on("tick", () => {
        links
            .attr("x1", d => people[d[0]].x)
            .attr("y1", d => people[d[0]].y)
            .attr("x2", d => people[d[1]].x)
            .attr("y2", d => people[d[1]].y);
        
        nodes
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });
    
    simulation.force("link").links(edges.map(e => ({source: e[0], target: e[1]})));
    simulation.alpha(1).restart();
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

function updateGraph() {
    // Rebind data
    links = links.data(edges);
    links.exit().remove();
    links = links.enter().append("line")
        .attr("stroke", "#555588")
        .attr("stroke-width", 2.5)
        .merge(links);
    
    simulation.force("link").links(edges.map(e => ({source: e[0], target: e[1]})));
    simulation.alpha(0.6).restart();
}

function showNodeInfo(person) {
    const infoDiv = document.getElementById("node-info");
    infoDiv.innerHTML = `
        <h3>${person.name}</h3>
        <div class="interests">
            ${person.interests.map(i => `<span class="interest-tag">${i}</span>`).join('')}
        </div>
        <p style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
            Рекомендований друг: <strong>${getRecommendations(person.id)[0].name}</strong>
        </p>
        <button onclick="connectToRecommended(${person.id})" class="btn primary" style="margin-top: 16px; width: 100%;">
            Додати рекомендованого друга
        </button>
    `;
}

function handleNodeClickForConnection(person) {
    selectedNodes.push(person.id);
    if (selectedNodes.length === 2) {
        showConnectModal();
    }
}

function showConnectModal() {
    const p1 = people[selectedNodes[0]];
    const p2 = people[selectedNodes[1]];
    
    document.getElementById("modal-person1").textContent = p1.name;
    document.getElementById("modal-person2").textContent = p2.name;
    
    const exists = edges.some(e => 
        (e[0] === selectedNodes[0] && e[1] === selectedNodes[1]) || 
        (e[0] === selectedNodes[1] && e[1] === selectedNodes[0])
    );
    
    document.getElementById("connect-btn").textContent = exists ? "Розірвати зв'язок" : "Під'єднати друзів";
    document.getElementById("connect-modal").style.display = "flex";
}

function toggleConnection() {
    const a = Math.min(selectedNodes[0], selectedNodes[1]);
    const b = Math.max(selectedNodes[0], selectedNodes[1]);
    
    const index = edges.findIndex(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a));
    
    if (index !== -1) {
        edges.splice(index, 1);
    } else {
        edges.push([a, b]);
    }
    
    closeModal();
    updateGraph();
    document.getElementById("total-edges").textContent = edges.length;
}

function closeModal() {
    document.getElementById("connect-modal").style.display = "none";
    selectedNodes = [];
}

function toggleAddMode() {
    isAddMode = !isAddMode;
    const fab = document.getElementById("fab");
    if (isAddMode) {
        fab.style.background = "#ff6464";
        fab.innerHTML = '<i class="fas fa-hand-pointer"></i>';
    } else {
        fab.style.background = "#6464ff";
        fab.innerHTML = '<i class="fas fa-plus"></i>';
    }
}
