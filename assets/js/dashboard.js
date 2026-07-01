// ============================================
// Dashboard JavaScript - Bidiya Training Hub
// ============================================

async function loadDashboardData() {
    try {
        console.log('📡 جاري تحميل بيانات لوحة الشرف من القاعدة المحلية...');
        
        const workshops = await getAllWorkshopsLocal();
        const employees = await getAllEmployeesLocal();
        const topEmployees = await getTopEmployeesLocal(3);
        
        console.log('📚 عدد الورش:', workshops.length);
        console.log('👥 عدد الموظفين:', employees.length);
        
        if (workshops.length === 0 && employees.length === 0) {
            showDashboardError('لا توجد بيانات. يرجى الاتصال بالإنترنت لتحميل البيانات.');
            return;
        }
        
        // تحديث KPIs
        const totalHours = workshops.reduce((sum, w) => sum + (w.hours || 0), 0);
        const monthlyWorkshops = workshops.filter(w => {
            const d = new Date(w.workshopDate || w.date || w.timestamp);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        
        document.getElementById('kpiTotalWorkshops').textContent = workshops.length;
        document.getElementById('kpiTotalHours').textContent = totalHours.toFixed(1);
        document.getElementById('kpiTotalEmployees').textContent = employees.length;
        document.getElementById('kpiMonthly').textContent = monthlyWorkshops;
        document.getElementById('kpiAvgHours').textContent = employees.length > 0 ? 
            (totalHours / employees.length).toFixed(1) : 0;
        
        // أفضل الموظفين
        renderTopEmployees(topEmployees);
        
        // أفضل الأقسام
        const departments = getDepartmentsStats(employees);
        renderTopDepartments(departments);
        
        // آخر ورشة
        const sorted = [...workshops].sort((a, b) => {
            const da = new Date(a.timestamp || a.date || 0);
            const db = new Date(b.timestamp || b.date || 0);
            return db - da;
        });
        const lastWorkshop = sorted.length > 0 ? sorted[0] : null;
        renderLatestWorkshop(lastWorkshop);
        
        // النشاط الأخير
        const recent = sorted.slice(0, 10);
        renderRecentActivity(recent);
        
        document.getElementById('lastUpdated').textContent = new Date().toLocaleString('ar-SA');
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showDashboardError('حدث خطأ في تحميل البيانات');
    }
}

function showDashboardError(message) {
    const container = document.querySelector('.dashboard-page .container');
    if (container) {
        container.innerHTML += `
            <div class="error-message" style="text-align:center; padding:40px; background:var(--bg-card); border-radius:var(--radius); box-shadow:var(--shadow);">
                <i class="fas fa-exclamation-triangle" style="font-size:3rem; color:#e74c3c;"></i>
                <p style="margin-top:15px; color:var(--text-secondary);">${message}</p>
                <button onclick="loadDashboardData()" class="btn-primary" style="margin-top:15px;">
                    <i class="fas fa-sync-alt"></i> إعادة المحاولة
                </button>
            </div>
        `;
    }
}

function renderTopEmployees(employees) {
    const container = document.getElementById('topEmployees');
    if (!container) return;
    
    if (!employees || employees.length === 0) {
        container.innerHTML = '<p class="no-data">لا توجد بيانات كافية</p>';
        return;
    }
    
    container.innerHTML = employees.map(function(emp, index) {
        const medals = ['🥇', '🥈', '🥉'];
        const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : 'third';
        const badge = getBadge(emp.workshops || 0);
        
        return `
            <div class="podium-item ${rankClass}">
                <div class="podium-rank">${medals[index] || '🏅'}</div>
                <div class="podium-name">${emp.name || emp.employeeId}</div>
                <div class="podium-id">🆔 ${emp.employeeId || '-'}</div>
                <div class="podium-badge" style="background: ${badge.color}20; color: ${badge.color};">
                    ${badge.emoji} ${badge.name}
                </div>
                <div class="podium-stats">
                    <span>📚 ${emp.workshops || 0} ورشة</span>
                    <span>⏱️ ${emp.totalHours || 0} ساعة</span>
                </div>
                <div class="podium-department">${emp.department || 'قسم غير محدد'}</div>
            </div>
        `;
    }).join('');
}

function getDepartmentsStats(employees) {
    const deptMap = {};
    employees.forEach(emp => {
        if (!emp.department) return;
        if (!deptMap[emp.department]) {
            deptMap[emp.department] = {
                name: emp.department,
                workshops: 0,
                totalHours: 0,
                employees: 0
            };
        }
        deptMap[emp.department].workshops += emp.workshops || 0;
        deptMap[emp.department].totalHours += emp.totalHours || 0;
        deptMap[emp.department].employees += 1;
    });
    
    return Object.values(deptMap)
        .sort((a, b) => b.workshops - a.workshops)
        .slice(0, 5);
}

function renderTopDepartments(departments) {
    const container = document.getElementById('topDepartments');
    if (!container) return;
    
    if (!departments || departments.length === 0) {
        container.innerHTML = '<p class="no-data">لا توجد بيانات كافية</p>';
        return;
    }
    
    const deptIcons = {
        'الأطباء': '👨‍⚕️', 'التمريض': '👩‍⚕️', 'التضميد': '🩹',
        'الصيدلة': '💊', 'الأشعة': '📷', 'الأسنان': '🦷',
        'المختبر': '🔬', 'السجلات الطبية': '📋', 'الإدارة': '📊',
        'التثقيف الصحي': '📚', 'التغذية': '🍎'
    };
    
    const maxWorkshops = departments[0]?.workshops || 1;
    
    container.innerHTML = departments.map(function(dept, index) {
        const icon = deptIcons[dept.name] || '🏢';
        const width = Math.min((dept.workshops / maxWorkshops) * 100, 100);
        
        return `
            <div class="dept-item">
                <div class="dept-rank">#${index + 1}</div>
                <div class="dept-info">
                    <div class="dept-name">${icon} ${dept.name}</div>
                    <div class="dept-stats">
                        <span>📚 ${dept.workshops} ورشة</span>
                        <span>👥 ${dept.employees || 0} موظف</span>
                        <span>⏱️ ${dept.totalHours || 0} ساعة</span>
                    </div>
                </div>
                <div class="dept-progress">
                    <div class="dept-bar" style="width: ${width}%"></div>
                    <span style="font-size:0.7rem; color:var(--text-secondary);">${Math.round(width)}%</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderLatestWorkshop(workshop) {
    const container = document.getElementById('latestWorkshop');
    if (!container) return;
    
    if (!workshop) {
        container.innerHTML = '<p class="no-data">لا توجد ورش مسجلة بعد</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="workshop-card">
            <div class="workshop-icon">📌</div>
            <div class="workshop-info">
                <div class="workshop-title">${workshop.workshopTitle || workshop.workshop || '-'}</div>
                <div class="workshop-meta">
                    <span>👤 ${workshop.employeeName || workshop.employee || '-'}</span>
                    <span>🏢 ${workshop.department || 'قسم غير محدد'}</span>
                    <span>⏱️ ${workshop.hours || 0} ساعة</span>
                    <span>📅 ${formatDate(workshop.workshopDate || workshop.date || workshop.timestamp)}</span>
                </div>
            </div>
        </div>
    `;
}

function renderRecentActivity(workshops) {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    if (!workshops || workshops.length === 0) {
        container.innerHTML = '<p class="no-data">لا يوجد نشاط حديث</p>';
        return;
    }
    
    container.innerHTML = workshops.map(function(w) {
        return `
            <div class="activity-item">
                <div class="activity-dot"></div>
                <div class="activity-content">
                    <div class="activity-title">${w.workshopTitle || w.workshop || '-'}</div>
                    <div class="activity-meta">
                        <span>👤 ${w.employeeName || w.employee || '-'}</span>
                        <span>🏢 ${w.department || 'قسم غير محدد'}</span>
                        <span>⏱️ ${w.hours || 0} ساعة</span>
                        <span>📅 ${formatDate(w.workshopDate || w.date || w.timestamp)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 لوحة الشرف جاهزة');
    loadDashboardData();
});

// تحديث تلقائي كل 60 ثانية
setInterval(loadDashboardData, 60000);
