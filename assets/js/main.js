// ============================================
// Main JavaScript - Bidiya Training Hub
// ============================================

// 🔗 API URL - تأكد من تحديث هذا الرابط
const API_URL = 'https://script.google.com/macros/s/AKfycbxfQwivy7ssV_SpOgE_2Ev5llVva7RWNhr8-ARorlWGvUGW1GyBUnGTinzBiffoaAp4/exec';

// ============================================
// LOAD HOME PAGE DATA
// ============================================
async function loadHomePageData() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (result.status === 'success' && result.data) {
            const data = result.data;
            const summary = data.summary || {};

            // تحديث العدادات
            const totalWorkshops = document.getElementById('totalWorkshops');
            const totalHours = document.getElementById('totalHours');
            const totalEmployees = document.getElementById('totalEmployees');

            if (totalWorkshops) totalWorkshops.textContent = summary.totalWorkshops || 0;
            if (totalHours) totalHours.textContent = summary.totalHours || 0;
            if (totalEmployees) totalEmployees.textContent = summary.totalEmployees || 0;

            // تحديث الإحصائيات السريعة
            const topEmp = data.topEmployees?.[0];
            const topEmployeeEl = document.getElementById('topEmployee');
            if (topEmployeeEl) {
                topEmployeeEl.textContent = topEmp ? `${topEmp.name} (${topEmp.workshops} ورشة)` : '-';
            }

            const lastEmp = data.lastWorkshop;
            const lastEmployeeEl = document.getElementById('lastEmployee');
            if (lastEmployeeEl) {
                lastEmployeeEl.textContent = lastEmp ? lastEmp.employee : '-';
            }
        } else {
            console.warn('API response status is not success:', result);
            // يمكن إضافة رسالة للمستخدم هنا
        }
    } catch (error) {
        console.error('Error loading home data:', error);
        // يمكن إضافة رسالة خطأ للمستخدم هنا
    }
}

// ============================================
// GET BADGE
// ============================================
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
// FORMAT DATE
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

// ============================================
// DARK MODE TOGGLE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('darkToggle');
    if (toggle) {
        if (localStorage.getItem('bth_dark') === 'true') {
            document.body.classList.add('dark-mode');
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        toggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('bth_dark', isDark);
            toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // تحميل البيانات في الصفحة الرئيسية
    if (document.getElementById('totalWorkshops')) {
        loadHomePageData();
        // تحديث تلقائي كل 30 ثانية
        setInterval(loadHomePageData, 30000);
    }
});

// ============================================
// PWA SUPPORT
// ============================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(function() { console.log('✅ Service Worker registered'); })
        .catch(function(err) { console.log('❌ Service Worker error:', err); });
}

// ============================================
// LOAD DEPARTMENTS
// ============================================
async function loadDepartments() {
    try {
        // محاولة جلب الأقسام من API (إذا كانت مدعومة)
        // وإلا نعود للقائمة الافتراضية
        return getDefaultDepartments();
    } catch (error) {
        console.error('Error loading departments:', error);
        return getDefaultDepartments();
    }
}

function getDefaultDepartments() {
    return [
        'الأطباء', 'التمريض', 'التضميد', 'الصيدلة',
        'الأشعة', 'الأسنان', 'المختبر', 'السجلات الطبية',
        'الإدارة', 'التثقيف الصحي', 'التغذية'
    ];
}

async function populateDepartments(selectElement) {
    if (!selectElement) return;

    const departments = await loadDepartments();
    const firstOption = selectElement.querySelector('option[value=""]');
    selectElement.innerHTML = '';

    if (firstOption) {
        selectElement.appendChild(firstOption);
    } else {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'اختر القسم';
        selectElement.appendChild(option);
    }

    departments.forEach(function(dept) {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        selectElement.appendChild(option);
    });
}
