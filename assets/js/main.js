// ============================================
// Main JavaScript - Bidiya Training Hub
// ============================================

// 🔗 API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbxfQwivy7ssV_SpOgE_2Ev5llVva7RWNhr8-ARorlWGvUGW1GyBUnGTinzBiffoaAp4/exec';

// ============================================
// تحميل البيانات مباشرة من الخادم (بدون IndexedDB)
// ============================================
async function loadHomePageData() {
    try {
        console.log('📡 جلب البيانات من الخادم...');
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
            const summary = result.data.summary || {};
            
            document.getElementById('totalWorkshops').textContent = summary.totalWorkshops || 0;
            document.getElementById('totalHours').textContent = summary.totalHours || 0;
            document.getElementById('totalEmployees').textContent = summary.totalEmployees || 0;
            
            const topEmp = result.data.topEmployees?.[0];
            if (topEmp) {
                document.getElementById('topEmployee').textContent = topEmp.name + ' (' + topEmp.workshops + ' ورشة)';
            }
            
            const lastEmp = result.data.lastWorkshop;
            if (lastEmp) {
                document.getElementById('lastEmployee').textContent = lastEmp.employee || '-';
            }
            
            console.log('✅ تم تحديث البيانات');
        }
    } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
        // عرض رسالة للمستخدم
        const notif = document.createElement('div');
        notif.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#e74c3c; color:white; padding:12px 24px; border-radius:12px; z-index:99999; font-weight:600;';
        notif.textContent = '⚠️ حدث خطأ في تحميل البيانات. يرجى تحديث الصفحة.';
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 5000);
    }
}

// ============================================
// الوضع المظلم
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
    
    // تحميل البيانات
    loadHomePageData();
});

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

console.log('✅ main.js تم تحميله بنجاح');
