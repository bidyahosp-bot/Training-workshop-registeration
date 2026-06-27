// ============================================
// Employee JavaScript - Bidiya Training Hub
// ============================================

let allEmployees = [];
let allWorkshops = [];

// Load employee data
async function loadEmployeeData() {
try {
const response = await fetch(API_URL);
const result = await response.json();

if (result.status === 'success' && result.data) {
allEmployees = result.data.topEmployees || [];
allWorkshops = result.data.recentWorkshops || [];

renderEmployeeList(allEmployees);
}
} catch (error) {
console.error('Error loading employee data:', error);
}
}

// Render employee list
function renderEmployeeList(employees) {
const container = document.getElementById('employeeList');
if (!employees.length) {
container.innerHTML = <p class="no-data"&gt;لا توجد بيانات&lt;/p>;
return;
}

// أيقونات الأقسام
const deptIcons = {
    'الأطباء': '👨‍⚕️',
    'التمريض': '👩‍⚕️',
    'التضميد': '🩹',
    'الصيدلة': '💊',
    'الأشعة': '📷',
    'الأسنان': '🦷',
    'المختبر': '🔬',
    'السجلات الطبية': '📋',
    'الإدارة': '📊',
    'التثقيف الصحي': '📚',
    'التغذية': '🍎'
};

// في دالة renderEmployeeList
container.innerHTML = employees.map((emp, index) => {
    const badge = getBadge(emp.workshops);
    const icon = deptIcons[emp.department] || '🏢';
    return `
        <div class="employee-card" data-name="${emp.name}">
            <div class="emp-rank">#${index + 1}</div>
            <div class="emp-avatar"><i class="fas fa-user-circle"></i></div>
            <div class="emp-info">
                <div class="emp-name">${emp.name}</div>
                <div class="emp-dept">${icon} ${emp.department || 'قسم غير محدد'}</div>
            </div>
            <div class="emp-stats">
                <span>📚 ${emp.workshops}</span>
                <span class="emp-badge">${badge.emoji}</span>
            </div>
            <button class="emp-view-btn" data-name="${emp.name}">
                <i class="fas fa-arrow-left"></i>
            </button>
        </div>
    `;
}).join('');

// Add click events to view buttons
container.querySelectorAll('.emp-view-btn').forEach(btn => {
btn.addEventListener('click', () => {
const name = btn.dataset.name;
document.getElementById('employeeSearch').value = name;
viewEmployeeProfile(name);
});
});

// Add click events to cards
container.querySelectorAll('.employee-card').forEach(card => {
card.addEventListener('click', (e) => {
if (e.target.closest('.emp-view-btn')) return;
const name = card.dataset.name;
document.getElementById('employeeSearch').value = name;
viewEmployeeProfile(name);
});
});
}

// View employee profile
function viewEmployeeProfile(name) {
if (!name) return;

const employee = allEmployees.find(e => e.name === name);
if (!employee) {
alert(⚠️ لم يتم العثور على موظف باسم "${name}"`);
return;
}

const profile = document.getElementById('employeeProfile');
profile.style.display = 'block';

// Update profile info
// في دالة viewEmployeeProfile
document.getElementById('profileName').textContent = employee.name;
document.getElementById('profileEmployeeId').textContent = employee.employeeId || '-';  // 🔽 تم التغيير
document.getElementById('profileDepartment').textContent = employee.department || 'قسم غير محدد';
const badge = getBadge(employee.workshops);
document.getElementById('profileBadge').innerHTML = ${badge.emoji} ${badge.name};
document.getElementById('profileBadge').style.color = badge.color;

document.getElementById('profileWorkshops').textContent = employee.workshops;
document.getElementById('profileHours').textContent = employee.totalHours || 0;

// Calculate rank
const rank = allEmployees.findIndex(e => e.name === name) + 1;
document.getElementById('profileRank').textContent = #${rank || 'N/A'}`;

// Update progress
updateProgress(employee.workshops);

// Update workshop history
renderEmployeeWorkshops(name);

// Update achievements
renderAchievements(employee.workshops);

// Scroll to profile
profile.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Update progress bar
function updateProgress(count) {
const levels = [
{ min: 0, max: 4, name: '🌟 Beginner', next: '🥉 Bronze (5)' },
{ min: 5, max: 9, name: '🥉 Bronze', next: '🥈 Silver (10)' },
{ min: 10, max: 19, name: '🥈 Silver', next: '🥇 Gold (20)' },
{ min: 20, max: 29, name: '🥇 Gold', next: '💎 Platinum (30)' },
{ min: 30, max: 49, name: '💎 Platinum', next: '👑 Champion (50)' },
{ min: 50, max: Infinity, name: '👑 Champion', next: '🏆 Legend (100)' }
 ];

let current = levels[0];
let next = levels[1];
for (let i = 0; i < levels.length; i++) {
if (count >= levels[i].min && count <= levels[i].max) {
current = levels[i];
next = levels[i + 1] || levels[i];
break;
}
}

const progress = next.max !== Infinity ?
((count - current.min) / (next.max - current.min)) * 100 : 100;

document.getElementById('currentBadge').textContent = current.name;
document.getElementById('nextBadge').textContent = next.max !== Infinity ?
${next.name} ($`{next.min})` : '🏆 Legend (100+)'; document.getElementById('progressFill').style.width =${Math.min(progress, 100)}%`;
}

// Render employee workshops
function renderEmployeeWorkshops(name) {
const tbody = document.getElementById('profileWorkshopsBody');
const workshops = allWorkshops.filter(w => w.employee === name);

if (!workshops.length) {
tbody.innerHTML = <tr&gt;&lt;td colspan="5" class="empty-row"&gt;لا توجد ورش مسجلة&lt;/td&gt;&lt;/tr>;
return;
}

tbody.innerHTML = workshops.map((w, index) => &lt;tr&gt; &lt;td&gt;${index + 1}</td>
<td>${w.workshop || '-'}&lt;/td&gt; &lt;td&gt;${w.hours || 0}</td>
<td>${w.organizer || '-'}&lt;/td&gt; &lt;td&gt;${formatDate(w.date)}</td>
</tr>
`).join('');
}

// Render achievements
function renderAchievements(count) {
const container = document.getElementById('achievementsGrid');
const achievements = [
{ icon: '🌟', name: 'المبتدئ', unlocked: count >= 0 },
{ icon: '🥉', name: 'البرونز', unlocked: count >= 5 },
{ icon: '🥈', name: 'الفضي', unlocked: count >= 10 },
{ icon: '🥇', name: 'الذهبي', unlocked: count >= 20 },
{ icon: '💎', name: 'الألماس', unlocked: count >= 30 },
{ icon: '👑', name: 'البطل', unlocked: count >= 50 },
{ icon: '🏆', name: 'الأسطورة', unlocked: count >= 100 }
 ];

container.innerHTML = achievements.map(a => &lt;div class="achievement${a.unlocked ? 'unlocked' : 'locked'}">
<div class="achievement-icon">{a.name}</div>
<div class="achievement-status">
${a.unlocked ? '✅' : '🔒'}
</div>
</div>
`).join('');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
loadEmployeeData();

// View employee on enter key
document.getElementById('employeeSearch').addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
const name = e.target.value.trim();
if (name) viewEmployeeProfile(name);
}
});

// View employee button
document.getElementById('viewEmployee').addEventListener('click', () => {
const name = document.getElementById('employeeSearch').value.trim();
if (name) viewEmployeeProfile(name);
});
});

// Add these styles to style.css
const style = document.createElement('style');
style.textContent = `
.employee-search {
display: flex;
gap: 15px;
margin-bottom: 30px;
flex-wrap: wrap;
}

.employee-search .search-box {
flex: 1;
min-width: 200px;
}

.employee-profile {
background: var(--bg-card);
border-radius: var(--radius);
box-shadow: var(--shadow);
padding: 30px;
margin-bottom: 30px;
}

.profile-header {
display: flex;
align-items: center;
gap: 25px;
flex-wrap: wrap;
padding-bottom: 20px;
border-bottom: 2px solid var(--bg-main);
}

.profile-avatar {
font-size: 4rem;
color: var(--primary);
}

.profile-info h2 {
font-size: 1.8rem;
margin: 0;
}

.profile-info p {
color: var(--text-secondary);
margin: 5px 0;
}

.profile-badge {
font-size: 1.2rem;
font-weight: 700;
}

.profile-stats {
display: flex;
gap: 30px;
margin-right: auto;
}

.profile-stats .stat {
text-align: center;
}

.stat-number {
display: block;
font-size: 1.8rem;
font-weight: 800;
color: var(--primary);
}

.stat-label {
font-size: 0.85rem;
color: var(--text-secondary);
}

.profile-progress {
margin: 25px 0;
}

.profile-progress .progress-container {
margin-top: 10px;
}

.progress-labels {
display: flex;
justify-content: space-between;
margin-top: 5px;
font-size: 0.85rem;
color: var(--text-secondary);
}

.profile-history {
margin: 25px 0;
}

.achievements-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
gap: 15px;
margin-top: 15px;
}

.achievement {
text-align: center;
padding: 15px;
border-radius: 12px;
background: var(--bg-main);
transition: transform 0.3s;
}

.achievement:hover {
transform: translateY(-3px);
}

.achievement.unlocked {
background: var(--primary-light);
border: 2px solid var(--primary);
}

.achievement.locked {
opacity: 0.5;
}

.achievement-icon {
font-size: 2rem;
}

.achievement-name {
font-size: 0.9rem;
font-weight: 600;
margin: 5px 0;
}

.employee-list-section {
margin-top: 40px;
}

.employee-list {
display: grid;
gap: 10px;
margin-top: 15px;
}

.employee-card {
display: flex;
align-items: center;
gap: 15px;
padding: 12px 20px;
background: var(--bg-card);
border-radius: 12px;
box-shadow: var(--shadow);
cursor: pointer;
transition: transform 0.3s, box-shadow 0.3s;
}

.employee-card:hover {
transform: translateX(-5px);
box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.emp-rank {
font-weight: 800;
font-size: 1.2rem;
color: var(--primary);
min-width: 40px;
}

.emp-avatar {
font-size: 2rem;
color: var(--primary);
}

.emp-info {
flex: 1;
}

.emp-name {
font-weight: 600;
}

.emp-dept {
font-size: 0.85rem;
color: var(--text-secondary);
}

.emp-stats {
display: flex;
align-items: center;
gap: 10px;
}

.emp-badge {
font-size: 1.5rem;
}

.emp-view-btn {
padding: 8px 15px;
background: var(--primary);
color: white;
border: none;
border-radius: 8px;
cursor: pointer;
transition: background 0.3s;
}

.emp-view-btn:hover {
background: var(--primary-dark);
}

@media (max-width: 768px) {
.profile-header {
flex-direction: column;
text-align: center;
}

.profile-stats {
margin-right: 0;
width: 100%;
justify-content: center;
}

.employee-search {
flex-direction: column;
}

.employee-card {
flex-wrap: wrap;
}

.emp-view-btn {
width: 100%;
margin-top: 10px;
}
}
`;
document.head.appendChild(style);