// app.js
let cy;
let currentPersonId = null;

function generateUniqueId() {
    return 'edge_' + Math.random().toString(36).substr(2, 9);
}

function initCytoscape() {
    const elements = [];

    // Додаємо вершини
    peopleData.forEach(person => {
        elements.push({
            data: {
                id: person.id,
                name: person.name,
                avatar: person.avatar,
                interests: person.interests
            }
        });
    });

    // Додаємо ребра
    currentEdges.forEach(edge => elements.push(edge));

    cy = cytoscape({
        container: document.getElementById('cy'),
        elements: elements,
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#00ffcc',
                    'label': 'data(name)',
                    'width': 45,
                    'height': 45,
                    'font-size': '10px',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'color': '#000',
                    'text-outline-color': '#fff',
                    'text-outline-width': 2
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ff00cc',
                    'curve-style': 'bezier'
                }
            }
        ],
        layout: {
            name: 'cose',
            animate: true,
            animationDuration: 800
        }
    });

    // Клік по вершині
    cy.on('tap', 'node', function(evt) {
        const node = evt.target;
        showPersonModal(node.data());
    });

    updateStats();
    updateRecommendations();
    populatePersonSelects();
}

function showPersonModal(person) {
    currentPersonId = person.id;

    let html = `
        <div style="text-align:center; font-size: 4rem; margin-bottom:15px;">${person.avatar}</div>
        <h2>${person.name}</h2>
        <h3 style="color:#00ffcc;">Інтереси:</h3>
        <div style="margin:15px 0;">
            ${person.interests.map(int => `<span class="interest-tag">${int}</span>`).join('')}
        </div>
        <p><strong>Ступінь зв'язності:</strong> ${cy.getElementById(person.id).degree()} друзів</p>
    `;

    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal').style.display = 'block';

    // Оновлюємо кнопку
    const isConnected = currentEdges.some(e => 
        (e.data.source === currentPersonId || e.data.target === currentPersonId)
    );
    document.getElementById('connectBtn').textContent = isConnected ? "Видалити всі зв'язки" : "Додати тестового друга";
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function toggleConnection() {
    if (!currentPersonId) return;
    closeModal();

    // Простий приклад: додати/видалити зв'язок з p1
    const targetId = currentPersonId === "p1" ? "p2" : "p1";

    const existing = currentEdges.findIndex(e => 
        (e.data.source === currentPersonId && e.data.target === targetId) ||
        (e.data.source === targetId && e.data.target === currentPersonId)
    );

    if (existing > -1) {
        currentEdges.splice(existing, 1);
    } else {
        currentEdges.push({
            data: {
                id: generateUniqueId(),
                source: currentPersonId,
                target: targetId
            }
        });
    }

    // Перестворюємо граф
    cy.elements().remove();
    initCytoscape();
}

function updateStats() {
    const nodes = peopleData.length;
    const edges = currentEdges.length;
    const avgDegree = (2 * edges / nodes).toFixed(1);

    document.getElementById('stats').innerHTML = `
        <strong>Вершини (люди):</strong> ${nodes}<br>
        <strong>Ребра (дружба):</strong> ${edges}<br>
        <strong>Середній ступінь:</strong> ${avgDegree}<br>
        <strong>Щільність мережі:</strong> ${(edges / (nodes*(nodes-1)/2) * 100).toFixed(1)}%
    `;
}

function updateRecommendations() {
    const recContainer = document.getElementById('recommendations');
    recContainer.innerHTML = '';

    // Проста рекомендація: спільні інтереси
    peopleData.slice(0, 5).forEach(person => {
        const div = document.createElement('div');
        div.className = 'recommendation-item';
        div.innerHTML = `
            <strong>${person.avatar} ${person.name}</strong><br>
            <small>${person.interests.slice(0,2).join(', ')}</small>
        `;
        div.onclick = () => showPersonModal(person);
        recContainer.appendChild(div);
    });
}

function populatePersonSelects() {
    const sel1 = document.getElementById('person1');
    const sel2 = document.getElementById('person2');

    peopleData.forEach(p => {
        const opt1 = new Option(p.name, p.id);
        const opt2 = new Option(p.name, p.id);
        sel1.add(opt1);
        sel2.add(opt2);
    });
}

function findCommonInterests() {
    const id1 = document.getElementById('person1').value;
    const id2 = document.getElementById('person2').value;

    if (!id1 || !id2 || id1 === id2) {
        document.getElementById('commonInterests').innerHTML = '<em>Оберіть двох різних людей</em>';
        return;
    }

    const p1 = peopleData.find(p => p.id === id1);
    const p2 = peopleData.find(p => p.id === id2);

    const common = p1.interests.filter(i => p2.interests.includes(i));

    let html = `<strong>Спільні інтереси (${common.length}):</strong><br>`;
    if (common.length > 0) {
        html += common.map(i => `<span class="interest-tag">${i}</span>`).join('');
    } else {
        html += '<em>Немає спільних інтересів</em>';
    }

    document.getElementById('commonInterests').innerHTML = html;
}

function searchPerson() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!query) return;

    const found = peopleData.find(p => 
        p.name.toLowerCase().includes(query)
    );

    if (found) {
        showPersonModal(found);
    } else {
        alert("Людину не знайдено. Спробуйте інше ім'я.");
    }
}

function showAllPeople() {
    const container = document.getElementById('allPeopleList');
    container.innerHTML = '';

    peopleData.forEach(person => {
        const card = document.createElement('div');
        card.className = 'person-card';
        card.innerHTML = `
            <div style="font-size:3rem;text-align:center;margin-bottom:10px;">${person.avatar}</div>
            <strong>${person.name}</strong>
            <div style="margin-top:10px;">
                ${person.interests.map(i => `<span class="interest-tag">${i}</span>`).join('')}
            </div>
        `;
        card.onclick = () => {
            closeAllPeopleModal();
            showPersonModal(person);
        };
        container.appendChild(card);
    });

    document.getElementById('allPeopleModal').style.display = 'block';
}

function closeAllPeopleModal() {
    document.getElementById('allPeopleModal').style.display = 'none';
}

function resetGraph() {
    cy.layout({ name: 'cose', animate: true }).run();
}

function toggleLayout() {
    const layouts = ['cose', 'circle', 'grid', 'concentric'];
    const current = cy.layout().options.name;
    const next = layouts[(layouts.indexOf(current) + 1) % layouts.length];
    cy.layout({ name: next, animate: true }).run();
}

function addRandomEdge() {
    if (peopleData.length < 2) return;
    const idx1 = Math.floor(Math.random() * peopleData.length);
    let idx2 = Math.floor(Math.random() * peopleData.length);
    while (idx2 === idx1) idx2 = Math.floor(Math.random() * peopleData.length);

    const source = peopleData[idx1].id;
    const target = peopleData[idx2].id;

    // Перевіряємо чи вже існує
    if (!currentEdges.some(e => 
        (e.data.source === source && e.data.target === target) ||
        (e.data.source === target && e.data.target === source)
    )) {
        currentEdges.push({
            data: { id: generateUniqueId(), source, target }
        });
        cy.elements().remove();
        initCytoscape();
    }
}

function removeRandomEdge() {
    if (currentEdges.length === 0) return;
    const idx = Math.floor(Math.random() * currentEdges.length);
    currentEdges.splice(idx, 1);
    cy.elements().remove();
    initCytoscape();
}

// Ініціалізація
window.onload = function() {
    initCytoscape();
};
