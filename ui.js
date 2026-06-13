// ui.js
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    
    document.querySelectorAll('.menu a').forEach((el, i) => {
        if (i === tab) el.classList.add('active');
        else el.classList.remove('active');
    });
    
    if (tab === 1) renderProfiles();
    if (tab === 2) renderAllRecommendations();
    if (tab === 3) renderInterestsCloud();
}

function renderProfiles() {
    const container = document.getElementById("profile-grid");
    container.innerHTML = people.map(p => `
        <div class="profile-card" onclick="showNodeInfo(people[${p.id}])">
            <h3>${p.name}</h3>
            <div class="interests">
                ${p.interests.map(i => `<span class="interest-tag">${i}</span>`).join('')}
            </div>
            <div style="margin-top: 16px; font-size: 13px;">
                Друзів: ${edges.filter(e => e[0] === p.id || e[1] === p.id).length}
            </div>
        </div>
    `).join('');
}

function renderAllRecommendations() {
    const container = document.getElementById("recommendations-list");
    let html = '';
    
    people.forEach(person => {
        const recs = getRecommendations(person.id);
        if (recs.length > 0) {
            html += `
                <div class="rec-card">
                    <div>
                        <strong>${person.name}</strong> → 
                        <span style="color:#a0a0ff">${recs[0].name}</span>
                        <span style="font-size:12px; opacity:0.7"> (${Math.round(recs[0].similarity * 100)}%)</span>
                    </div>
                    <button onclick="connectPersonToRecommended(${person.id}, ${recs[0].id}); event.stopImmediatePropagation()" class="btn primary" style="padding: 6px 16px; font-size: 13px;">Додати</button>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

function renderInterestsCloud() {
    const allInts = {};
    people.forEach(p => {
        p.interests.forEach(i => {
            allInts[i] = (allInts[i] || 0) + 1;
        });
    });
    
    const container = document.getElementById("all-interests");
    container.innerHTML = Object.keys(allInts)
        .sort((a,b) => allInts[b] - allInts[a])
        .map(int => `
            <span class="interest-cloud-tag">${int} <span style="font-size:11px; opacity:0.6">(${allInts[int]})</span></span>
        `).join('');
}

function searchPeople(e) {
    if (e.key === "Enter") {
        const term = document.getElementById("global-search").value.toLowerCase();
        const found = people.find(p => p.name.toLowerCase().includes(term));
        if (found) {
            showNodeInfo(found);
            switchTab(0);
        }
    }
}

function addRandomEdge() {
    let a = Math.floor(Math.random() * people.length);
    let b = Math.floor(Math.random() * people.length);
    while (a === b) b = Math.floor(Math.random() * people.length);
    
    const exists = edges.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a));
    if (!exists) {
        edges.push([a, b]);
        updateGraph();
        document.getElementById("total-edges").textContent = edges.length;
    }
}

function randomizeConnections() {
    edges = [];
    for (let i = 0; i < 75; i++) {
        const a = Math.floor(Math.random() * people.length);
        let b = Math.floor(Math.random() * people.length);
        while (b === a) b = Math.floor(Math.random() * people.length);
        if (!edges.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))) {
            edges.push([a, b]);
        }
    }
    updateGraph();
    document.getElementById("total-edges").textContent = edges.length;
}

function resetGraph() {
    if (confirm("Скинути всі зв'язки?")) {
        edges = [];
        updateGraph();
        document.getElementById("total-edges").textContent = 0;
    }
}

function connectToRecommended(personId) {
    const rec = getRecommendations(personId)[0];
    const a = Math.min(personId, rec.id);
    const b = Math.max(personId, rec.id);
    if (!edges.some(e => (e[0] === a && e[1] === b))) {
        edges.push([a, b]);
        updateGraph();
        document.getElementById("total-edges").textContent = edges.length;
        alert(`Додано зв'язок: ${people[personId].name} та ${rec.name}`);
    }
}

function connectPersonToRecommended(personId, recId) {
    const a = Math.min(personId, recId);
    const b = Math.max(personId, recId);
    if (!edges.some(e => (e[0] === a && e[1] === b))) {
        edges.push([a, b]);
        updateGraph();
        document.getElementById("total-edges").textContent = edges.length;
        renderAllRecommendations();
    }
}

function showRecommendationsInPanel() {
    const person = people[Math.floor(Math.random() * people.length)];
    showNodeInfo(person);
}

// Initialize everything
window.onload = function() {
    generatePeople(28);
    document.getElementById("total-people").textContent = people.length;
    document.getElementById("total-edges").textContent = edges.length;
    
    initGraph();
    switchTab(0);
    
    // Keyboard shortcuts
    document.addEventListener("keydown", e => {
        if (e.key === "r" && e.ctrlKey) {
            e.preventDefault();
            randomizeConnections();
        }
    });
    
    console.log("%cМережаЗв'язків завантажена успішно ✓", "color:#a0a0ff; font-size:14px");
};
