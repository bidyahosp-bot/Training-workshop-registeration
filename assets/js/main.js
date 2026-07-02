// ============================================
// Main JavaScript - Bidiya Training Hub (إصدار خفيف)
// ============================================

const API_URL = 'https://script.google.com/macros/s/AKfycbz211s9Fz-bWxA0nffBZ9Tt8om2RdwlYXTZgkCZb_3l3vYoy_nt8svd4iNZMFZ7G9VG/exec';

// تحميل البيانات من الخادم مباشرة
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
            if (topEmp) document.getElementById('topEmployee').textContent = topEmp.name + ' (' + topEmp.workshops + ' ورشة)';

            const lastEmp = result.data.lastWorkshop;
            if (lastEmp) document.getElementById('lastEmployee').textContent = lastEmp.employee || '-';
        }
    } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
        document.querySelector('.hero').innerHTML += `<p style="color:red;">⚠️ حدث خطأ في تحميل البيانات. يرجى تحديث الصفحة.</p>`;
    }
}

// الوضع المظلم
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

console.log('✅ main.js تم تحميله بنجاح');
