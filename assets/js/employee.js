// ============================================
// Employee JavaScript - Bidiya Training Hub
// البحث بالرقم الوظيفي (المفتاح الرئيسي)
// ============================================

let allEmployees = [];
let allWorkshops = [];

async function loadEmployeeData() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
            allEmployees = result.data.allEmployees || result.data.topEmployees || [];
            allWorkshops = result.data.recentWorkshops || [];
            renderEmployeeList(allEmployees);
        }
    } catch (error) {
        console.error('Error loading employee data:', error);
    }
}

function renderEmployeeList(employees) {
    const container = document.getElementById('employeeList');
    if (!container) return;
    
    if (!employees.length) {
        container.innerHTML = '<p class="no-data">لا توجد بيانات</p>';
        return;
    }
    
    const deptIcons = {
        'الأطباء': '👨‍⚕️', 'التمريض': '👩‍⚕️', 'التضميد': '🩹',
        'الصيدلة': '💊', 'الأشعة': '📷', 'الأسنان': '🦷',
        'المختبر': '🔬', 'السجلات الطبية': '📋', 'الإدارة': '📊',
        'التثقيف الصحي': '📚', 'التغذية': '🍎'
    };
    
    container.innerHTML = employees.map(function(emp, index) {
        const badge = getBadge(emp.workshops);
        const icon = deptIcons[emp.department] || '🏢';
        return `
            <div class="employee-card" data-id="${emp.employeeId}">
                <div class="emp-rank">#${index + 1}</div>
                <div class="emp-avatar"><i class="fas fa-user-circle"></i></div>
                <div class="emp-info">
                    <div class="emp-name">${emp.name}</div>
                    <div class="emp-id">🆔 ${emp.employeeId}</div>
                    <div class="emp-dept">${icon} ${emp.department || 'قسم غير محدد'}</div>
                </div>
                <div class="emp-stats">
                    <span>📚 ${emp.workshops}</span>
                    <span class="emp-badge">${badge.emoji}</span>
                </div>
                <button class="emp-view-btn" data-id="${emp.employeeId}">
                    <i class="fas fa-arrow-left"></i>
                </button>
            </div>
        `;
    }).join('');
    
    container.querySelectorAll('.emp-view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            document.getElementById('employeeSearch').value = id;
            viewEmployeeProfile(id);
        });
    });
    
    container.querySelectorAll('.employee-card').forEach(function(card) {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.emp-view-btn')) return;
            const id = this.dataset.id;
            document.getElementById('employeeSearch').value = id;
            viewEmployeeProfile(id);
        });
    });
}

function viewEmployeeProfile(id) {
    if (!id) return;
    
    // البحث بالرقم الوظيفي
    const employee = allEmployees.find(function(e) { return e.employeeId === id; });
    if (!employee) {
        // محاولة البحث بالاسم إذا لم يتم العثور بالرقم
        const byName = allEmployees.find(function(e) { return e.name === id; });
        if (byName) {
            document.getElementById('employeeSearch').value = byName.employeeId;
            viewEmployeeProfile(byName.employeeId);
            return;
        }
        alert(`⚠️ لم يتم العثور على موظف بالرقم الوظيفي "${id}"`);
        return;
    }
    
    const profile = document.getElementById('employeeProfile');
    if (profile) profile.style.display = 'block';
    
    document.getElementById('profileName').textContent = employee.name;
    document.getElementById('profileEmployeeId').textContent = employee.employeeId;
    document.getElementById('profileDepartment').textContent = employee.department || 'قسم غير محدد';
    
    const badge = getBadge(employee.workshops);
    const badgeEl = document.getElementById('profileBadge');
    if (badgeEl) {
        badgeEl.innerHTML = `${badge.emoji} ${badge.name}`;
        badgeEl.style.color = badge.color;
    }
    
    document.getElementById('profileWorkshops').textContent = employee.workshops;
    document.getElementById('profileHours').textContent = employee.totalHours || 0;
    
    const rank = allEmployees.findIndex(function(e) { return e.employeeId === id; }) + 1;
    document.getElementById('profileRank').textContent = `#${rank || 'N/A'}`;
    
    updateProgress(employee.workshops);
    renderEmployeeWorkshops(id);
    renderAchievements(employee.workshops);
    
    if (profile) {
        profile.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderEmployeeWorkshops(id) {
    const tbody = document.getElementById('profileWorkshopsBody');
    if (!tbody) return;
    
    const workshops = allWorkshops.filter(function(w) { return w.employeeId === id; });
    
    if (!workshops.length) {
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

// ... باقي الدوال (updateProgress, renderAchievements, إلخ) كما هي
