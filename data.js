// data.js
let people = [];
let edges = [];
let selectedNodes = [];

const interestPool = [
    "Програмування", "AI & ML", "Графіка", "Музика", "Подорожі", "Фотографія", 
    "Кіно", "Книги", "Спорт", "Йога", "Кулінарія", "Геймінг", "Наука", 
    "Екологія", "Бізнес", "Стартапи", "Мистецтво", "Танці", "Історія", 
    "Психологія", "Філософія", "Астрономія", "Робототехніка", "3D моделювання",
    "Блогінг", "Відео монтаж", "Фітнес", "Медитація", "Велоспорт", "Сноубординг",
    "Криптовалюта", "Дизайн UI/UX", "Мобільна розробка", "Бекенд", "DevOps"
];

function generatePeople(count = 28) {
    people = [];
    const names = ["Анастасія", "Максим", "Софія", "Дмитро", "Ольга", "Іван", "Марія", 
                   "Артем", "Катерина", "Олександр", "Поліна", "Віктор", "Анна", 
                   "Єгор", "Вікторія", "Тимофій", "Єлизавета", "Михайло", "Дарина",
                   "Роман", "Аліна", "Кирило", "Вероніка", "Богдан", "Юлія", "Павло",
                   "Христина", "Ігор"];
    
    for (let i = 0; i < count; i++) {
        const shuffled = [...interestPool].sort(() => 0.5 - Math.random());
        const interests = shuffled.slice(0, 4);
        
        people.push({
            id: i,
            name: names[i % names.length] + " " + String.fromCharCode(65 + Math.floor(i/10)),
            interests: interests,
            x: Math.random() * 800 + 100,
            y: Math.random() * 500 + 100
        });
    }
    
    // Generate some initial edges
    edges = [];
    for (let i = 0; i < 90; i++) {
        const a = Math.floor(Math.random() * count);
        let b = Math.floor(Math.random() * count);
        while (b === a) b = Math.floor(Math.random() * count);
        
        if (!edges.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))) {
            edges.push([a, b]);
        }
    }
}

function calculateSimilarity(p1, p2) {
    const inter = p1.interests.filter(i => p2.interests.includes(i));
    const union = new Set([...p1.interests, ...p2.interests]);
    return inter.length / union.size;
}

function getRecommendations(personId) {
    const person = people[personId];
    const recs = people
        .filter(p => p.id !== personId && 
               !edges.some(e => (e[0] === personId && e[1] === p.id) || (e[0] === p.id && e[1] === personId)))
        .map(p => ({
            ...p,
            similarity: calculateSimilarity(person, p)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);
    return recs;
}
// data.js
// ... (початок файлу без змін)

function getRecommendations(personId) {
    const person = people[personId];
    
    const recs = people
        .filter(p => p.id !== personId)
        .map(p => {
            const sim = calculateSimilarity(person, p);
            return { ...p, similarity: sim };
        })
        .filter(p => p.similarity > 0)                    // ← НОВЕ: тільки > 0%
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 6);

    return recs;
}
