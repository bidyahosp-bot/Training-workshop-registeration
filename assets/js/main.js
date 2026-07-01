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
// ============================================
// PWA - نافذة تثبيت التطبيق
// ============================================

let deferredPrompt;

// ✅ عند جاهزية التطبيق للتثبيت
window.addEventListener('beforeinstallprompt', function(e) {
  console.log('📱 التطبيق جاهز للتثبيت');
  e.preventDefault();
  deferredPrompt = e;
  
  // عرض نافذة التثبيت
  showInstallBanner();
});

// ✅ عرض نافذة التثبيت
function showInstallBanner() {
  // التحقق من عدم وجود النافذة مسبقاً
  if (document.getElementById('installBanner')) return;
  
  var banner = document.createElement('div');
  banner.id = 'installBanner';
  banner.className = 'install-banner';
  banner.innerHTML = `
    <div class="install-banner-content">
      <div class="install-icon">
        <i class="fas fa-download"></i>
      </div>
      <div class="install-text">
        <h3>📱 ثبّت التطبيق</h3>
        <p>أضف المنصة إلى شاشة هاتفك للوصول السريع</p>
      </div>
      <div class="install-actions">
        <button id="installAppBtn" class="btn-install">
          <i class="fas fa-download"></i> تثبيت
        </button>
        <button id="closeBannerBtn" class="btn-close-banner">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(banner);
  
  // زر التثبيت
  document.getElementById('installAppBtn').addEventListener('click', function() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(choiceResult) {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ تم تثبيت التطبيق');
          document.getElementById('installBanner').style.display = 'none';
        } else {
          console.log('❌ تم رفض التثبيت');
        }
        deferredPrompt = null;
      });
    }
  });
  
  // إغلاق النافذة
  document.getElementById('closeBannerBtn').addEventListener('click', function() {
    document.getElementById('installBanner').style.display = 'none';
    localStorage.setItem('bth_install_banner_closed', 'true');
  });
}

// ✅ التحقق من تثبيت التطبيق مسبقاً
window.addEventListener('appinstalled', function() {
  console.log('✅ تم تثبيت التطبيق بنجاح');
  document.getElementById('installBanner').style.display = 'none';
  localStorage.setItem('bth_install_banner_closed', 'true');
});

// ✅ إظهار النافذة بعد 3 ثوانٍ من تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // التحقق من عدم إغلاق النافذة مسبقاً
    var bannerClosed = localStorage.getItem('bth_install_banner_closed');
    if (!bannerClosed && !window.matchMedia('(display-mode: standalone)').matches) {
      // إذا كان المستخدم على هاتف وليس في وضع التطبيق
      var isMobile = window.innerWidth < 768;
      if (isMobile) {
        showInstallBanner();
      }
    }
  }, 3000);
});
// ============================================
// تهيئة النظام المحلي
// ============================================

// ✅ متغير لتخزين حالة التهيئة
let dbInitialized = false;

// ✅ تهيئة قاعدة البيانات عند تحميل الصفحة
async function initApp() {
    console.log('🚀 بدء تهيئة التطبيق...');
    
    // عرض رسالة تحميل
    showLoadingMessage('جاري تحميل البيانات...');
    
    const result = await initializeDatabase();
    
    if (result.success) {
        dbInitialized = true;
        console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
        
        // بدء المزامنة في الخلفية
        if (navigator.onLine) {
            syncWithServer();
        }
        
        // تحديث البيانات المعروضة
        if (typeof loadHomePageData === 'function') {
            loadHomePageData();
        }
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }
        if (typeof loadWorkshops === 'function') {
            loadWorkshops();
        }
        if (typeof loadEmployeeData === 'function') {
            loadEmployeeData();
        }
        if (typeof loadReportData === 'function') {
            loadReportData();
        }
        
        hideLoadingMessage();
    } else {
        console.error('❌ فشل تهيئة قاعدة البيانات:', result.error);
        showErrorMessage('فشل تحميل البيانات. يرجى التحقق من الاتصال بالإنترنت.');
    }
}

// ✅ عرض رسالة تحميل
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
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(8px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            transition: opacity 0.5s ease;
        `;
        loader.innerHTML = `
            <div style="background: var(--bg-card); padding: 30px 40px; border-radius: 20px; text-align: center; max-width: 350px;">
                <div class="spinner" style="width: 40px; height: 40px; border: 4px solid var(--primary-light); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 15px;"></div>
                <p id="loaderMessage" style="color: var(--text-primary); font-weight: 600; font-size: 1rem;">${message}</p>
            </div>
        `;
        document.body.appendChild(loader);
    }
    document.getElementById('loaderMessage').textContent = message;
}

// ✅ إخفاء رسالة التحميل
function hideLoadingMessage() {
    const loader = document.getElementById('appLoader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.remove();
        }, 500);
    }
}

// ✅ عرض رسالة خطأ
function showErrorMessage(message) {
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
    
    // إخفاء رسالة التحميل
    hideLoadingMessage();
}

// ✅ مراقبة الاتصال بالإنترنت
window.addEventListener('online', function() {
    console.log('🌐 تم استعادة الاتصال بالإنترنت');
    syncWithServer().then(result => {
        if (result.success && result.synced > 0) {
            showNotification('تمت مزامنة ' + result.synced + ' ورشة مع الخادم');
        }
    });
});

window.addEventListener('offline', function() {
    console.log('📴 تم فقدان الاتصال بالإنترنت');
    showNotification('⚠️ أنت غير متصل بالإنترنت. سيتم حفظ البيانات محلياً.');
});

// ✅ عرض إشعار
function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 90px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#e74c3c' : '#2ecc71'};
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 99999;
        font-weight: 600;
        animation: slideUp 0.3s ease;
        max-width: 90%;
        text-align: center;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 500);
    }, 5000);
}

// ✅ تحديث وظيفة تحميل البيانات للاستخدام المحلي
async function loadHomePageData() {
    try {
        // محاولة جلب البيانات من قاعدة البيانات المحلية أولاً
        const summary = await getLocalSummary();
        
        if (summary) {
            document.getElementById('totalWorkshops').textContent = summary.totalWorkshops || 0;
            document.getElementById('totalHours').textContent = summary.totalHours || 0;
            document.getElementById('totalEmployees').textContent = summary.totalEmployees || 0;
            
            // أفضل موظف
            const topEmployees = await getTopEmployeesLocal(1);
            if (topEmployees && topEmployees.length > 0) {
                document.getElementById('topEmployee').textContent = 
                    topEmployees[0].name + ' (' + topEmployees[0].workshops + ' ورشة)';
            }
            
            // آخر ورشة
            const workshops = await getAllWorkshopsLocal();
            if (workshops && workshops.length > 0) {
                const last = workshops[workshops.length - 1];
                document.getElementById('lastEmployee').textContent = last.employeeName || '-';
            }
        }
    } catch (error) {
        console.error('Error loading home data:', error);
    }
}

// ✅ جلب ملخص البيانات من المحلي
async function getLocalSummary() {
    try {
        const workshops = await getAllWorkshopsLocal();
        const employees = await getAllEmployeesLocal();
        
        return {
            totalWorkshops: workshops.length,
            totalHours: workshops.reduce((sum, w) => sum + (w.hours || 0), 0),
            totalEmployees: employees.length,
            monthlyWorkshops: workshops.filter(w => {
                const d = new Date(w.timestamp || w.date);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length
        };
    } catch (error) {
        console.error('Error getting local summary:', error);
        return null;
    }
}

// ✅ استدعاء التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إذا كانت الصفحة الرئيسية، قم بالتهيئة
    if (document.getElementById('totalWorkshops')) {
        initApp();
    }
});
// ============================================
// الاستماع لتحديثات البيانات
// ============================================

// ✅ الاستماع لتغييرات localStorage من صفحات أخرى
window.addEventListener('storage', function(e) {
    if (e.key === 'bth_workshops_updated') {
        console.log('🔄 تم تحديث البيانات من صفحة أخرى، جاري التحديث...');
        refreshAllPages();
    }
});

// ✅ الاستماع للحدث المخصص
document.addEventListener('workshopsUpdated', function() {
    console.log('🔄 تم تحديث البيانات، جاري التحديث...');
    refreshAllPages();
});

// ✅ دالة تحديث جميع الصفحات
function refreshAllPages() {
    // تحديث الصفحة الرئيسية
    if (typeof loadHomePageData === 'function') {
        loadHomePageData();
    }
    
    // تحديث لوحة الشرف
    if (typeof loadDashboardData === 'function') {
        loadDashboardData();
    }
    
    // تحديث سجل الورش
    if (typeof loadWorkshops === 'function') {
        loadWorkshops();
    }
    
    // تحديث صفحة الموظف
    if (typeof loadEmployeeData === 'function') {
        loadEmployeeData();
    }
    
    // تحديث التقارير
    if (typeof loadReportData === 'function') {
        loadReportData();
    }
    
    console.log('✅ تم تحديث جميع الصفحات');
}
