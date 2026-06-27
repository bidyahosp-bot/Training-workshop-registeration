// ============================================
// Main JavaScript - Updated for new API
// ============================================

// 🔗 API URL - استبدل برابط Google Apps Script الخاص بك
const API_URL = 'https://script.google.com/macros/s/AKfycbxfQwivy7ssV_SpOgE_2Ev5llVva7RWNhr8-ARorlWGvUGW1GyBUnGTinzBiffoaAp4/exec';

// 📊 Load Home Page Data
async function loadHomePageData() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
            const data = result.data;
            const summary = data.summary || {};
            
            // تحديث العدادات
            document.getElementById('totalWorkshops').textContent = summary.totalWorkshops || 0;
            document.getElementById('totalHours').textContent = summary.totalHours || 0;
            document.getElementById('totalEmployees').textContent = summary.totalEmployees || 0;
            
            // تحديث الإحصائيات السريعة
            const topEmp = data.topEmployees?.[0];
            document.getElementById('topEmployee').textContent = topEmp ? 
                `${topEmp.name} (${topEmp.workshops} ورشة)` : '-';
            
            const lastEmp = data.lastWorkshop;
            document.getElementById('lastEmployee').textContent = lastEmp ? 
                lastEmp.employee : '-';
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// 🏅 Get Badge Function
function getBadge(count) {
    if (count >= 100) return { emoji: '🏆', name: 'Legend', color: '#ff6b6b' };
    if (count >= 50) return { emoji: '👑', name: 'Champion', color: '#ffd700' };
    if (count >= 30) return { emoji: '💎', name: 'Platinum', color: '#e5e4e2' };
    if (count >= 20) return { emoji: '🥇', name: 'Gold', color: '#ffd700' };
    if (count >= 10) return { emoji: '🥈', name: 'Silver', color: '#c0c0c0' };
    if (count >= 5) return { emoji: '🥉', name: 'Bronze', color: '#cd7f32' };
    return { emoji: '🌟', name: 'Beginner', color: '#4fc3f7' };
}

// 📅 Format Date Helper
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

// 🌙 Dark Mode Toggle
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('darkToggle');
    if (toggle) {
        if (localStorage.getItem('bth_dark') === 'true') {
            document.body.classList.add('dark-mode');
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        toggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('bth_dark', isDark);
            toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }
    
    // تحميل البيانات إذا كنا في الصفحة الرئيسية
    if (document.getElementById('totalWorkshops')) {
        loadHomePageData();
        // تحديث تلقائي كل 60 ثانية
        setInterval(loadHomePageData, 60000);
    }
});

// 📱 PWA Support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('✅ Service Worker registered'))
        .catch(err => console.log('❌ Service Worker error:', err));
}
// ============================================
// GET DEPARTMENTS - جلب الأقسام من API
// ============================================
async function loadDepartments() {
    try {
        const response = await fetch(`${API_URL}?action=getDepartments`);
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
            return result.data;
        }
        return getDefaultDepartments();
    } catch (error) {
        console.error('Error loading departments:', error);
        return getDefaultDepartments();
    }
}

// ============================================
// DEFAULT DEPARTMENTS - الأقسام الافتراضية
// ============================================
function getDefaultDepartments() {
    return [
        'الأطباء',
        'التمريض',
        'التضميد',
        'الصيدلة',
        'الأشعة',
        'الأسنان',
        'المختبر',
        'السجلات الطبية',
        'الإدارة',
        'التثقيف الصحي',
        'التغذية'
    ];
}

// ============================================
// POPULATE DEPARTMENT DROPDOWN - تعبئة قائمة الأقسام
// ============================================
async function populateDepartments(selectElement) {
    if (!selectElement) return;
    
    const departments = await loadDepartments();
    
    // الاحتفاظ بالخيار الأول
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
    
    // إضافة الأقسام
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        selectElement.appendChild(option);
    });
}