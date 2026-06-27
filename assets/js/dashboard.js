// ============================================
// Dashboard JavaScript - Bidiya Training Hub
// ============================================

// Load dashboard data
async function loadDashboardData() {
try {
const response = await fetch(API_URL);
const result = await response.json();

if (result.status === 'success' && result.data) {
const data = result.data;

// Update KPIs
document.getElementById('kpiTotalWorkshops').textContent = data.kpis?.totalWorkshops || 0;
document.getElementById('kpiTotalHours').textContent = data.kpis?.totalHours || 0;
document.getElementById('kpiTotalEmployees').textContent = data.kpis?.totalEmployees || 0;
document.getElementById('kpiMonthly').textContent = data.kpis?.monthlyWorkshops || 0;
document.getElementById('kpiAvgHours').textContent = data.kpis?.avgHoursPerEmployee?.toFixed(1) || 0;
document.getElementById('lastUpdated').textContent = data.lastUpdated || '-';

// Render Top Employees
renderTopEmployees(data.topEmployees || []);

// Render Top Departments
renderTopDepartments(data.topDepartments || []);

// Render Fastest Employee
renderFastestEmployee(data.fastestEmployee);

// Render Latest Workshop
renderLatestWorkshop(data.lastWorkshop);

// Render Recent Activity
renderRecentActivity(data.recentWorkshops || []);
}
} catch (error) {
console.error('Error loading dashboard:', error);
document.querySelector('.dashboard-page .container').innerHTML += &lt;div class="error-message"&gt; &lt;i class="fas fa-exclamation-triangle"&gt;&lt;/i&gt; &lt;p&gt;حدث خطأ في تحميل البيانات. يرجى المحاولة لاحقًا.&lt;/p&gt; &lt;/div&gt;;
}
}

// 🏅 Render Top Employees with Badges
function renderTopEmployees(employees) {
const container = document.getElementById('topEmployees');
if (!employees.length) {
container.innerHTML = <p class="no-data"&gt;لا توجد بيانات كافية لعرض أفضل الموظفين&lt;/p>;
return;
}

container.innerHTML = employees.map((emp, index) => {
const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : 'third';
const badge = getBadge(emp.workshops);

return &lt;div class="podium-item ${rankClass}">
 <div class="podium-item ${rankClass}">
            <div class="podium-rank">${medal}</div>
            <div class="podium-name">${emp.name}</div>
            <div class="podium-id">${emp.employeeId || '-'}</div>  <!-- 🔽 تم التغيير -->
            <div class="podium-badge" style="background: ${badge.color}20; color: ${badge.color};">
                ${badge.emoji} ${badge.name}
            </div>
<div class="podium-stats">
<span>📚 ${emp.workshops} ورشة&lt;/span&gt; &lt;span&gt;⏱️ ${emp.totalHours || 0} ساعة</span>
</div>
<div class="podium-department">${emp.department || 'قسم غير محدد'}&lt;/div&gt; &lt;/div&gt;;
}).join('');
}

// 🏢 Render Top Departments
// 🏢 Render Top Departments
function renderTopDepartments(departments) {
    const container = document.getElementById('topDepartments');
    if (!departments || !departments.length) {
        container.innerHTML = `<p class="no-data">لا توجد بيانات كافية</p>`;
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
    
    container.innerHTML = departments.map((dept, index) => {
        const icon = deptIcons[dept.name] || '🏢';
        return `
            <div class="dept-item">
                <div class="dept-rank">#${index + 1}</div>
                <div class="dept-info">
                    <div class="dept-name">${icon} ${dept.name}</div>
                    <div class="dept-stats">
                        <span>📚 ${dept.workshops} ورشة</span>
                        <span>👥 ${dept.employees} موظف</span>
                        <span>⏱️ ${dept.totalHours || 0} ساعة</span>
                    </div>
                </div>
                <div class="dept-progress">
                    <div class="dept-bar" style="width: ${(dept.workshops / (departments[0]?.workshops || 1)) * 100}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ⚡ Render Fastest Employee
function renderFastestEmployee(employee) {
const container = document.getElementById('fastestEmployee');
if (!employee) {
container.innerHTML = <p class="no-data"&gt;لا توجد بيانات كافية&lt;/p>;
return;
}

container.innerHTML = &lt;div class="fastest-content"&gt; &lt;div class="fastest-icon"&gt;🚀&lt;/div&gt; &lt;div&gt; &lt;div class="fastest-name"&gt;${employee.name}</div>
<div class="fastest-time">⏱️ ${employee.timeBetween || 'سجل سريع'}&lt;/div&gt; &lt;/div&gt; &lt;/div&gt;;
}

// 📝 Render Latest Workshop
function renderLatestWorkshop(workshop) {
const container = document.getElementById('latestWorkshop');
if (!workshop) {
container.innerHTML = <p class="no-data"&gt;لا توجد ورش مسجلة بعد&lt;/p>;
return;
}

container.innerHTML = &lt;div class="workshop-card"&gt; &lt;div class="workshop-icon"&gt;📌&lt;/div&gt; &lt;div class="workshop-info"&gt; &lt;div class="workshop-title"&gt;${workshop.workshop}</div>
<div class="workshop-meta">
<span>👤 {workshop.department || 'قسم غير محدد'}</span>
<span>⏱️ {formatDate(workshop.date)}</span>
</div>
</div>
</div>
`;
}

// 📅 Render Recent Activity
function renderRecentActivity(workshops) {
const container = document.getElementById('recentActivity');
if (!workshops.length) {
container.innerHTML = <p class="no-data"&gt;لا يوجد نشاط حديث&lt;/p>;
return;
}

container.innerHTML = workshops.slice(0, 10).map(w => &lt;div class="activity-item"&gt; &lt;div class="activity-dot"&gt;&lt;/div&gt; &lt;div class="activity-content"&gt; &lt;div class="activity-title"&gt;${w.workshop}</div>
<div class="activity-meta">
<span>👤 ${w.employee}&lt;/span&gt; &lt;span&gt;🏢 ${w.department || 'قسم غير محدد'}</span>
<span>⏱️ ${w.hours || 0} ساعة&lt;/span&gt; &lt;span&gt;📅 ${formatDate(w.date)}&lt;/span&gt; &lt;/div&gt; &lt;/div&gt; &lt;/div&gt;).join('');
}

// 📅 Helper: Format Date
function formatDate(dateString) {
if (!dateString) return '-';
try {
const date = new Date(dateString);
return date.toLocaleDateString('ar-SA', {
year: 'numeric',
month: 'short',
day: 'numeric'
});
} catch {
return dateString;
}
}

// 🏅 Get Badge Function (Enhanced)
function getBadge(count) {
if (count >= 50) return { emoji: '👑', name: 'Champion', color: '#ffd700' };
if (count >= 30) return { emoji: '💎', name: 'Platinum', color: '#e5e4e2' };
if (count >= 20) return { emoji: '🥇', name: 'Gold', color: '#ffd700' };
if (count >= 10) return { emoji: '🥈', name: 'Silver', color: '#c0c0c0' };
if (count >= 5) return { emoji: '🥉', name: 'Bronze', color: '#cd7f32' };
return { emoji: '🌟', name: 'Beginner', color: '#4fc3f7' };
}

// Load when page is ready
document.addEventListener('DOMContentLoaded', loadDashboardData);

// Auto-refresh every 60 seconds
setInterval(loadDashboardData, 60000);