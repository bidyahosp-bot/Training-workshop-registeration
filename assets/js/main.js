// ============================================
// Main JavaScript - Bidiya Training Hub
// ============================================

// 🔗 API URL - تأكد من صحة الرابط
const API_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnTOyl_vdUwzDvqVUhgJ7TpH2qo59NHYgvXbdp2nVptsFTuHdGhKOX-5c9Hb1FTwGmPPFiUM87hP0hiuQFbkeGjqOiXMsCuUup8ZzBAwaDZVomxRcl8vLXZFdaJr2ei7JPMP0oCDpLkOyf4RGsBtNKJUQwa7ZBVyEJIEdU2pMbaaoHr3DKJ_2rP8tzl5SrhjURH0x32ExZcvumkJ90CCsHCl4UJhlaoHGGd2ELFg-eXWl_njhpdwxzf3IvX7PTbbFnxyXtQNpZFSODEVVW2pCLLqjgdjjw&lib=MxvoKb8cGSRuqCGbK6pgVcBMD4LCh1O-7';

let dbInitialized = false;

// ============================================
// تهيئة النظام
// ============================================
async function initApp() {
    console.log('🚀 بدء تهيئة التطبيق...');
    showLoadingMessage('جاري تحميل البيانات...');

    try {
        // محاولة تهيئة قاعدة البيانات
        const result = await initializeDatabase();
        
        if (result.success) {
            dbInitialized = true;
            console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
            
            // محاولة المزامنة في الخلفية
            if (navigator.onLine) {
                syncWithServer().then(syncResult => {
                    if (syncResult.success && syncResult.synced > 0) {
                        console.log('✅ تمت المزامنة:', syncResult.synced, 'ورشة');
                        refreshAllPages();
                    }
                }).catch(err => {
                    console.warn('⚠️ فشلت المزامنة الخلفية:', err);
                });
            }
            
            // تحديث الواجهة فوراً
            refreshAllPages();
        } else {
            // إذا فشلت التهيئة، نحاول عرض البيانات المحلية إن وجدت
            console.warn('⚠️ فشل التهيئة، محاولة عرض البيانات المحلية');
            const count = await db.workshops.count();
            if (count > 0) {
                refreshAllPages();
                showNotification('تم تحميل البيانات المحلية', 'warning');
            } else {
                showErrorMessage('فشل تحميل البيانات. يرجى التحقق من الاتصال بالإنترنت.');
            }
        }
    } catch (error) {
        console.error('❌ خطأ في التهيئة:', error);
        // محاولة عرض البيانات المحلية
        try {
            const count = await db.workshops.count();
            if (count > 0) {
                refreshAllPages();
                showNotification('تم تحميل البيانات المحلية مؤقتًا', 'warning');
            } else {
                showErrorMessage('حدث خطأ في تهيئة النظام. يرجى تحديث الصفحة.');
            }
        } catch {
            showErrorMessage('حدث خطأ غير متوقع. يرجى تحديث الصفحة.');
        }
    } finally {
        hideLoadingMessage();
    }
}

// ============================================
// تحديث جميع الصفحات
// ============================================
function refreshAllPages() {
    console.log('🔄 تحديث جميع الصفحات...');
    
    try {
        if (typeof loadHomePageData === 'function') loadHomePageData();
        if (typeof loadDashboardData === 'function') loadDashboardData();
        if (typeof loadWorkshops === 'function') loadWorkshops();
        if (typeof loadEmployeeData === 'function') loadEmployeeData();
        if (typeof loadReportData === 'function') loadReportData();
        console.log('✅ تم تحديث جميع الصفحات');
    } catch (error) {
        console.warn('⚠️ خطأ في تحديث بعض الصفحات:', error);
    }
}

// ============================================
// الصفحة الرئيسية
// ============================================
async function loadHomePageData() {
    try {
        const workshops = await getAllWorkshopsLocal();
        const employees = await getAllEmployeesLocal();
        
        const totalWorkshops = workshops.length;
        const totalHours = workshops.reduce((sum, w) => sum + (w.hours || 0), 0);
        const totalEmployees = employees.length;
        
        const el1 = document.getElementById('totalWorkshops');
        const el2 = document.getElementById('totalHours');
        const el3 = document.getElementById('totalEmployees');
        
        if (el1) el1.textContent = totalWorkshops;
        if (el2) el2.textContent = totalHours.toFixed(1);
        if (el3) el3.textContent = totalEmployees;
        
        // أفضل موظف
        const topEmployees = await getTopEmployeesLocal(1);
        const topEl = document.getElementById('topEmployee');
        if (topEl) {
            if (topEmployees && topEmployees.length > 0) {
                topEl.textContent = topEmployees[0].name + ' (' + topEmployees[0].workshops + ' ورشة)';
            } else {
                topEl.textContent = '-';
            }
        }
        
        // آخر تسجيل
        const lastEl = document.getElementById('lastEmployee');
        if (lastEl) {
            if (workshops && workshops.length > 0) {
                const sorted = [...workshops].sort((a, b) => {
                    const da = new Date(a.timestamp || a.date || 0);
                    const db = new Date(b.timestamp || b.date || 0);
                    return db - da;
                });
                lastEl.textContent = sorted[0]?.employeeName || sorted[0]?.employee || '-';
            } else {
                lastEl.textContent = '-';
            }
        }
    } catch (error) {
        console.error('Error loading home data:', error);
    }
}

// ============================================
// دوال مساعدة
// ============================================
function showLoadingMessage(message) {
    let loader = document.getElementById('appLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'appLoader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(8px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            transition: opacity 0.5s ease;
        `;
        loader.innerHTML = `
            <div style="background: var(--bg-card); padding: 30px 40px; border-radius: 20px; text-align: center; max-width: 350px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div class="spinner" style="width: 40px; height: 40px; border: 4px solid var(--primary-light); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 15px;"></div>
                <p id="loaderMessage" style="color: var(--text-primary); font-weight: 600; font-size: 1rem;">${message}</p>
            </div>
        `;
        document.body.appendChild(loader);
    }
    document.getElementById('loaderMessage').textContent = message;
}

function hideLoadingMessage() {
    const loader = document.getElementById('appLoader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }
}

function showErrorMessage(message) {
    hideLoadingMessage();
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-card);
        padding: 30px;
        border-radius: 20px;
        box-shadow: var(--shadow-lg);
        max-width: 400px;
        text-align: center;
        z-index: 999999;
        border: 2px solid #e74c3c;
    `;
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c;"></i>
        <h3 style="margin: 15px 0 10px; color: var(--text-primary);">حدث خطأ</h3>
        <p style="color: var(--text-secondary);">${message}</p>
        <button onclick="location.reload()" class="btn-primary" style="margin-top: 15px;">
            <i class="fas fa-sync-alt"></i> إعادة المحاولة
        </button>
    `;
    document.body.appendChild(errorDiv);
}

function showNotification(message, type = 'info') {
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };
    
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 90px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.info};
        color: white;
        padding: 14px 28px;
        border-radius: 14px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 999999;
        font-weight: 600;
        font-size: 0.95rem;
        animation: slideUp 0.4s ease;
        max-width: 90%;
        text-align: center;
        font-family: var(--font, 'Cairo', sans-serif);
        direction: rtl;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transition = 'opacity 0.5s ease';
        setTimeout(() => notif.remove(), 500);
    }, 5000);
}

// ============================================
// دوال الشارات
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

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return '-';
    }
}

// ============================================
// أحداث الشبكة
// ============================================
window.addEventListener('online', function() {
    console.log('🌐 تم استعادة الاتصال بالإنترنت');
    showNotification('🌐 جاري المزامنة مع الخادم...', 'info');
    
    syncWithServer().then(result => {
        if (result.success && result.synced > 0) {
            showNotification('✅ تمت مزامنة ' + result.synced + ' ورشة', 'success');
            refreshAllPages();
        }
    });
});

window.addEventListener('offline', function() {
    console.log('📴 تم فقدان الاتصال بالإنترنت');
    showNotification('📴 أنت غير متصل. سيتم حفظ البيانات محلياً.', 'warning');
});

// ============================================
// الاستماع لتحديثات البيانات
// ============================================
window.addEventListener('storage', function(e) {
    if (e.key === 'bth_workshops_updated') {
        console.log('🔄 تم تحديث البيانات من صفحة أخرى');
        refreshAllPages();
    }
});

document.addEventListener('workshopsUpdated', function() {
    console.log('🔄 تم تحديث البيانات');
    refreshAllPages();
});

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
    
    // تهيئة التطبيق
    initApp();
});

// PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('✅ Service Worker registered'))
        .catch(err => console.log('❌ Service Worker error:', err));
}