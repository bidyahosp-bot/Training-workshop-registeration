// ============================================
// Employee JavaScript - Bidiya Training Hub
// ============================================

let allEmployees = [];
let allWorkshops = [];

// ============================================
// تحميل البيانات
// ============================================
async function loadEmployeeData() {
    try {
        console.log('📡 جاري تحميل بيانات الموظفين...');
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
            allEmployees = result.data.allEmployees || result.data.topEmployees || [];
            allWorkshops = result.data.recentWorkshops || [];
            
            console.log('✅ عدد الموظفين:', allEmployees.length);
            
            if (allEmployees.length > 0) {
                renderEmployeeList(allEmployees);
            } else {
                showMessage('لا توجد بيانات موظفين', 'warning');
            }
        } else {
            showMessage('حدث خطأ في تحميل البيانات', 'error');
        }
    } catch (error) {
        console.error('❌ خطأ:', error);
        showMessage('حدث خطأ في الاتصال بالخادم', 'error');
    }
}

// ============================================
// عرض رسائل
// ============================================
function showMessage(text, type) {
    const container = document.getElementById('employeeList');
    if (container) {
        const icon = type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        const color = type === 'error' ? '#e74c3c' : '#f39c12';
        container.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <i class="fas ${icon}" style="font-size:2rem; color:${color};"></i>
                <p style="margin-top:10px; color:var(--text-secondary);">${text}</p>
                <button onclick="loadEmployeeData()" class="btn-primary" style="margin-top:15px;">
                    <i class="fas fa-sync-alt"></i> إعادة المحاولة
                </button>
            </div>
        `;
    }
}

// ============================================
// عرض قائمة الموظفين
// ============================================
function renderEmployeeList(employees) {
    const container = document.getElementById('employeeList');
    if (!container) return;
    
    if (!employees || employees.length === 0) {
        container.innerHTML = '<p class="no-data">لا توجد بيانات</p>';
        return;
    }
    
    const deptIcons = {
        'الأطباء': '👨‍⚕️', 'التمريض': '👩‍⚕️', 'التضميد': '🩹',
        'الصيدلة': '💊', 'الأشعة': '📷', 'الأسنان': '🦷',
        'المختبر': '🔬', 'السجلات الطبية': '📋', 'الإدارة': '📊',
        'التثقيف الصحي': '📚', 'التغذية': '🍎'
    };
    
    // عرض أول 50 موظف فقط
    const displayList = employees.slice(0, 50);
    
    container.innerHTML = displayList.map(function(emp, index) {
        if (!emp) return '';
        
        const id = emp.employeeId || 'غير محدد';
        const name = emp.name || id;
        const dept = emp.department || 'قسم غير محدد';
        const workshops = emp.workshops || 0;
        const hours = emp.totalHours || 0;
        const badge = getBadge(workshops);
        const icon = deptIcons[dept] || '🏢';
        
        return `
            <div class="employee-card" data-id="${id}">
                <div class="emp-rank">#${index + 1}</div>
                <div class="emp-avatar"><i class="fas fa-user-circle"></i></div>
                <div class="emp-info">
                    <div class="emp-name">${name}</div>
                    <div class="emp-id">🆔 ${id}</div>
                    <div class="emp-dept">${icon} ${dept}</div>
                </div>
                <div class="emp-stats">
                    <span>📚 ${workshops}</span>
                    <span class="emp-badge">${badge.emoji}</span>
                </div>
                <button class="emp-view-btn" data-id="${id}">
                    <i class="fas fa-arrow-left"></i>
                </button>
            </div>
        `;
    }).join('');
    
    // أحداث النقر
    container.querySelectorAll('.emp-view-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            document.getElementById('employeeSearch').value = id;
            viewEmployeeProfile(id);
        });
    });
    
    container.querySelectorAll('.employee-card').forEach(function(card) {
        card.addEventListener('click', function() {
            const id = this.dataset.id;
            document.getElementById('employeeSearch').value = id;
            viewEmployeeProfile(id);
        });
    });
}

// ============================================
// عرض الملف الشخصي
// ============================================
function viewEmployeeProfile(id) {
    if (!id) {
        alert('⚠️ يرجى إدخال رقم وظيفي أو اسم موظف');
        return;
    }
    
    // البحث بالرقم الوظيفي
    let employee = allEmployees.find(function(e) { 
        return e.employeeId === id; 
    });
    
    // البحث بالاسم إذا لم يتم العثور
    if (!employee) {
        employee = allEmployees.find(function(e) { 
            return e.name === id; 
        });
        if (employee) {
            document.getElementById('employeeSearch').value = employee.employeeId;
            id = employee.employeeId;
        }
    }
    
    if (!employee) {
        alert('⚠️ لم يتم العثور على موظف بالرقم الوظيفي أو الاسم: "' + id + '"');
        return;
    }
    
    // إظهار الملف الشخصي
    const profile = document.getElementById('employeeProfile');
    if (profile) profile.style.display = 'block';
    
    // تحديث المعلومات
    const name = employee.name || employee.employeeId;
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileEmployeeId').textContent = employee.employeeId;
    document.getElementById('profileDepartment').textContent = employee.department || 'قسم غير محدد';
    
    const badge = getBadge(employee.workshops || 0);
    const badgeEl = document.getElementById('profileBadge');
    if (badgeEl) {
        badgeEl.innerHTML = badge.emoji + ' ' + badge.name;
        badgeEl.style.color = badge.color;
    }
    
    document.getElementById('profileWorkshops').textContent = employee.workshops || 0;
    document.getElementById('profileHours').textContent = employee.totalHours || 0;
    
    // الترتيب
    const rank = allEmployees.findIndex(function(e) { 
        return e.employeeId === employee.employeeId; 
    }) + 1;
    document.getElementById('profileRank').textContent = '#' + (rank > 0 ? rank : 'N/A');
    
    // التقدم
    updateProgress(employee.workshops || 0);
    
    // سجل الورش
    renderEmployeeWorkshops(employee.employeeId);
    
    // الإنجازات
    renderAchievements(employee.workshops || 0);
    
    // التمرير
    if (profile) {
        setTimeout(function() {
            profile.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    }
}

// ============================================
// عرض سجل الورش
// ============================================
function renderEmployeeWorkshops(id) {
    const tbody = document.getElementById('profileWorkshopsBody');
    if (!tbody) return;
    
    const workshops = allWorkshops.filter(function(w) { 
        return w.employeeId === id; 
    });
    
    if (!workshops || workshops.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-row">لا توجد ورش مسجلة</td></tr>';
        return;
    }
    
    tbody.innerHTML = workshops.map(function(w, index) {
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${w.workshop || '-'}</td>
                <td>${w.hours || 0}</td>
                <td>${w.organizer || '-'}</td>
                <td>${formatDate(w.date)}</td>
            </tr>
        `;
    }).join('');
}

// ============================================
// عرض الإنجازات
// ============================================
function renderAchievements(count) {
    const container = document.getElementById('achievementsGrid');
    if (!container) return;
    
    const achievements = [
        { icon: '🌟', name: 'المبتدئ', unlocked: count >= 0 },
        { icon: '🥉', name: 'البرونز', unlocked: count >= 5 },
        { icon: '🥈', name: 'الفضي', unlocked: count >= 10 },
        { icon: '🥇', name: 'الذهبي', unlocked: count >= 20 },
        { icon: '💎', name: 'الألماس', unlocked: count >= 30 },
        { icon: '👑', name: 'البطل', unlocked: count >= 50 },
        { icon: '🏆', name: 'الأسطورة', unlocked: count >= 100 }
    ];
    
    container.innerHTML = achievements.map(function(a) {
        return `
            <div class="achievement ${a.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${a.icon}</div>
                <div class="achievement-name">${a.name}</div>
                <div class="achievement-status">${a.unlocked ? '✅' : '🔒'}</div>
            </div>
        `;
    }).join('');
}

// ============================================
// تحديث شريط التقدم
// ============================================
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
    for (var i = 0; i < levels.length; i++) {
        if (count >= levels[i].min && count <= levels[i].max) {
            current = levels[i];
            next = levels[i + 1] || levels[i];
            break;
        }
    }
    
    const progress = next.max !== Infinity ? ((count - current.min) / (next.max - current.min)) * 100 : 100;
    document.getElementById('currentBadge').textContent = current.name;
    document.getElementById('nextBadge').textContent = next.max !== Infinity ? next.name + ' (' + next.min + ')' : '🏆 Legend (100+)';
    document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
}

// ============================================
// أحداث الصفحة
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    loadEmployeeData();
    
    const searchInput = document.getElementById('employeeSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const value = this.value.trim();
                if (value) viewEmployeeProfile(value);
            }
        });
    }
    
    const viewBtn = document.getElementById('viewEmployee');
    if (viewBtn) {
        viewBtn.addEventListener('click', function() {
            const value = document.getElementById('employeeSearch').value.trim();
            if (value) viewEmployeeProfile(value);
        });
    }
});

console.log('✅ employee.js loaded successfully');
