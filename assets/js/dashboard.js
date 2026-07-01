// ============================================
// Dashboard JavaScript - Bidiya Training Hub
// ============================================
// ============================================
// Dashboard - استخدام البيانات المحلية
// ============================================

async function loadDashboardData() {
    try {
        // ✅ جلب البيانات من قاعدة البيانات المحلية
        const workshops = await getAllWorkshopsLocal();
        const employees = await getAllEmployeesLocal();
        const topEmployees = await getTopEmployeesLocal(3);
        
        if (workshops.length === 0 && employees.length === 0) {
            showDashboardError('لا توجد بيانات. يرجى الاتصال بالإنترنت لتحميل البيانات.');
            return;
        }
        
        // تحديث KPIs
        const totalHours = workshops.reduce((sum, w) => sum + (w.hours || 0), 0);
        const monthlyWorkshops = workshops.filter(w => {
            const d = new Date(w.timestamp || w.date);
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
        const lastWorkshop = workshops.length > 0 ? workshops[workshops.length - 1] : null;
        renderLatestWorkshop(lastWorkshop);
        
        // النشاط الأخير
        const recent = workshops.slice(-10).reverse();
        renderRecentActivity(recent);
        
        document.getElementById('lastUpdated').textContent = new Date().toLocaleString('ar-SA');
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showDashboardError('حدث خطأ في تحميل البيانات');
    }
}

// ✅ حساب إحصائيات الأقسام
function getDepartmentsStats(employees) {
    const deptMap = {};
    employees.forEach(emp => {
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
// ============================================
// تحميل بيانات لوحة الشرف
// ============================================
async function loadDashboardData() {
    try {
        console.log('📡 جاري تحميل بيانات لوحة الشرف...');
        const response = await fetch(API_URL);
        const result = await response.json();
        
        console.log('📡 الرد من الخادم:', result);
        
        if (result.status === 'success' && result.data) {
            const data = result.data;
            
            // ✅ تحديث KPIs - استخدام summary بدلاً من kpis
            const summary = data.summary || {};
            
            document.getElementById('kpiTotalWorkshops').textContent = summary.totalWorkshops || 0;
            document.getElementById('kpiTotalHours').textContent = summary.totalHours || 0;
            document.getElementById('kpiTotalEmployees').textContent = summary.totalEmployees || 0;
            document.getElementById('kpiMonthly').textContent = summary.monthlyWorkshops || 0;
            
            // حساب متوسط الساعات
            const avgHours = summary.totalEmployees > 0 ? 
                (summary.totalHours / summary.totalEmployees) : 0;
            document.getElementById('kpiAvgHours').textContent = avgHours.toFixed(1) || 0;
            
            document.getElementById('lastUpdated').textContent = data.lastUpdated || '-';
            
            // ✅ عرض أفضل الموظفين
            renderTopEmployees(data.topEmployees || []);
            
            // ✅ عرض أفضل الأقسام
            renderTopDepartments(data.topDepartments || []);
            
            // ✅ عرض أسرع موظف
            renderFastestEmployee(data.fastestEmployee);
            
            // ✅ عرض آخر ورشة
            renderLatestWorkshop(data.lastWorkshop);
            
            // ✅ عرض النشاط الأخير
            renderRecentActivity(data.recentWorkshops || []);
            
            console.log('✅ تم تحديث لوحة الشرف بنجاح');
        } else {
            console.warn('⚠️ خطأ في البيانات:', result);
            showDashboardError('حدث خطأ في تحميل البيانات: ' + (result.message || 'خطأ غير معروف'));
        }
    } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
        showDashboardError('حدث خطأ في الاتصال بالخادم. تحقق من الرابط.');
    }
}

// ============================================
// عرض رسالة خطأ
// ============================================
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

// ============================================
// عرض أفضل الموظفين (المنصة)
// ============================================
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

// ============================================
// عرض أفضل الأقسام
// ============================================
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
        const translatedName = translateDepartment(dept.name);
        
        return `
            <div class="dept-item">
                <div class="dept-rank">#${index + 1}</div>
                <div class="dept-info">
                    <div class="dept-name">${icon} ${translatedName}</div>
                    <div class="dept-stats">
                        <span>📚 ${dept.workshops} ورشة</span>
                        <span>👥 ${dept.employees || 0} موظف</span>
                        <span>⏱️ ${dept.totalHours || 0} ساعة</span>
                    </div>
                </div>
                <div class="dept-progress">
                    <div class="dept-bar" style="width: ${width}%"></div>
                    <span class="dept-percent" style="font-size:0.7rem; color:var(--text-secondary);">${Math.round(width)}%</span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// ترجمة الأقسام
// ============================================
function translateDepartment(deptName) {
    const translations = {
        ar: {
            'الأطباء': 'الأطباء', 'التمريض': 'التمريض', 'التضميد': 'التضميد',
            'الصيدلة': 'الصيدلة', 'الأشعة': 'الأشعة', 'الأسنان': 'الأسنان',
            'المختبر': 'المختبر', 'السجلات الطبية': 'السجلات الطبية',
            'الإدارة': 'الإدارة', 'التثقيف الصحي': 'التثقيف الصحي',
            'التغذية': 'التغذية'
        },
        en: {
            'الأطباء': 'Doctors', 'التمريض': 'Nursing', 'التضميد': 'Dressing',
            'الصيدلة': 'Pharmacy', 'الأشعة': 'Radiology', 'الأسنان': 'Dentistry',
            'المختبر': 'Laboratory', 'السجلات الطبية': 'Medical Records',
            'الإدارة': 'Administration', 'التثقيف الصحي': 'Health Education',
            'التغذية': 'Nutrition'
        }
    };
    
    const lang = currentLang || 'ar';
    return translations[lang]?.[deptName] || deptName;
}

// ============================================
// عرض أسرع موظف
// ============================================
function renderFastestEmployee(employee) {
    const container = document.getElementById('fastestEmployee');
    if (!container) return;
    
    if (!employee) {
        container.innerHTML = '<p class="no-data">لا توجد بيانات كافية</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="fastest-content">
            <div class="fastest-icon">🚀</div>
            <div>
                <div class="fastest-name">${employee.name || employee.employeeId}</div>
                <div class="fastest-time">⏱️ ${employee.timeBetween || 'سجل سريع'}</div>
            </div>
        </div>
    `;
}

// ============================================
// عرض آخر ورشة
// ============================================
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
                <div class="workshop-title">${workshop.workshop || '-'}</div>
                <div class="workshop-meta">
                    <span>👤 ${workshop.employee || workshop.employeeId || '-'}</span>
                    <span>🏢 ${workshop.department || 'قسم غير محدد'}</span>
                    <span>⏱️ ${workshop.hours || 0} ساعة</span>
                    <span>📅 ${formatDate(workshop.date)}</span>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// عرض النشاط الأخير
// ============================================
function renderRecentActivity(workshops) {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    if (!workshops || workshops.length === 0) {
        container.innerHTML = '<p class="no-data">لا يوجد نشاط حديث</p>';
        return;
    }
    
    container.innerHTML = workshops.slice(0, 10).map(function(w) {
        return `
            <div class="activity-item">
                <div class="activity-dot"></div>
                <div class="activity-content">
                    <div class="activity-title">${w.workshop || '-'}</div>
                    <div class="activity-meta">
                        <span>👤 ${w.employee || w.employeeId || '-'}</span>
                        <span>🏢 ${w.department || 'قسم غير محدد'}</span>
                        <span>⏱️ ${w.hours || 0} ساعة</span>
                        <span>📅 ${formatDate(w.date)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// دوال مساعدة
// ============================================
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

function getBadge(count) {
    if (count >= 100) return { emoji: '🏆', name: 'Legend', color: '#ff6b6b' };
    if (count >= 50) return { emoji: '👑', name: 'Champion', color: '#ffd700' };
    if (count >= 30) return { emoji: '💎', name: 'Platinum', color: '#e5e4e2' };
    if (count >= 20) return { emoji: '🥇', name: 'Gold', color: '#ffd700' };
    if (count >= 10) return { emoji: '🥈', name: 'Silver', color: '#c0c0c0' };
    if (count >= 5) return { emoji: '🥉', name: 'Bronze', color: '#cd7f32' };
    return { emoji: '🌟', name: 'Beginner', color: '#4fc3f7' };
}

// ============================================
// تشغيل عند تحميل الصفحة وتحديث تلقائي
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 لوحة الشرف جاهزة');
    loadDashboardData();
});

// تحديث تلقائي كل 60 ثانية
setInterval(loadDashboardData, 60000);
