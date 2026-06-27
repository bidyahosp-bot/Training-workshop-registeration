// ============================================
// Register JavaScript - Bidiya Training Hub
// إرسال البيانات إلى Google Sheets عبر API
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('registerForm');
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('workshopDate');
    
    if (dateInput) {
        dateInput.max = today;
        dateInput.value = today;
    }
    
    // تعبئة قائمة الأقسام
    const departmentSelect = document.getElementById('department');
    if (departmentSelect) {
        await populateDepartments(departmentSelect);
    }
    
    // التحقق من صحة الساعات
    const hoursInput = document.getElementById('workshopHours');
    if (hoursInput) {
        hoursInput.addEventListener('input', function() {
            const val = parseFloat(this.value);
            const small = this.parentElement.querySelector('small');
            if (small) {
                if (isNaN(val) || val < 6) {
                    small.style.color = '#e74c3c';
                    small.textContent = small.dataset.i18nHoursNote || '⚠️ يجب أن تكون المدة أكثر من 6 ساعات';
                } else {
                    small.style.color = '#27ae60';
                    small.textContent = '✅ مدة الورشة مقبولة';
                }
            }
        });
    }
    
    // ============================================
    // إرسال النموذج عبر API
    // ============================================
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // جمع البيانات من النموذج
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            // تحويل البيانات إلى التنسيق المطلوب
            const workshopData = {
                employeeName: data['employeeName'] || '',
                employeeId: data['employeeId'] || '',
                department: data['department'] || '',
                workshopTitle: data['workshopTitle'] || '',
                hours: parseFloat(data['workshopHours']) || 0,
                organizer: data['organizer'] || '',
                certificate: data['certificate'] || 'لا'
            };
            
            // التحقق من صحة الساعات
            if (workshopData.hours < 6) {
                alert('⚠️ مدة الورشة يجب أن تكون أكثر من 6 ساعات');
                return;
            }
            
            // التحقق من الحقول المطلوبة
            if (!workshopData.employeeName || !workshopData.department || 
                !workshopData.workshopTitle || !workshopData.organizer) {
                alert('⚠️ يرجى تعبئة جميع الحقول المطلوبة');
                return;
            }
            
            // إظهار رسالة جاري التحميل
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
            submitBtn.disabled = true;
            
            try {
                // إرسال البيانات إلى API
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(workshopData)
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    // نجاح التسجيل
                    alert('✅ تم تسجيل الورشة بنجاح!\n' +
                          '📚 ' + workshopData.workshopTitle + '\n' +
                          '👤 ' + workshopData.employeeName);
                    
                    // إعادة تعيين النموذج
                    form.reset();
                    if (dateInput) dateInput.value = today;
                    
                    // تحديث البيانات في الصفحة الرئيسية
                    if (typeof loadHomePageData === 'function') {
                        loadHomePageData();
                    }
                } else {
                    alert('❌ حدث خطأ في التسجيل: ' + (result.message || 'يرجى المحاولة مرة أخرى'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('❌ حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
            } finally {
                // إعادة الزر إلى حالته الأصلية
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

// ============================================
// دالة مساعدة لتحديث البيانات (اختيارية)
// ============================================
async function refreshDashboardData() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        if (result.status === 'success') {
            // تحديث العدادات إذا كانت موجودة
            const summary = result.data.summary || {};
            const elements = {
                'totalWorkshops': summary.totalWorkshops,
                'totalHours': summary.totalHours,
                'totalEmployees': summary.totalEmployees
            };
            for (const [id, value] of Object.entries(elements)) {
                const el = document.getElementById(id);
                if (el) el.textContent = value || 0;
            }
        }
    } catch (error) {
        console.error('Error refreshing data:', error);
    }
}
