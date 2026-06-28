// ============================================
// Register JavaScript - Bidiya Training Hub
// الرقم الوظيفي مفتاح رئيسي
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('registerForm');
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('workshopDate');
    
    if (dateInput) {
        dateInput.max = today;
        dateInput.value = today;
    }
    
    const departmentSelect = document.getElementById('department');
    if (departmentSelect) {
        await populateDepartments(departmentSelect);
    }
    
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
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });
            
            // ✅ التحقق من الرقم الوظيفي
            if (!data['employeeId'] || data['employeeId'].trim() === '') {
                alert('⚠️ الرقم الوظيفي مطلوب. يرجى إدخال رقمك الوظيفي.');
                document.getElementById('employeeId').focus();
                return;
            }
            
            const workshopData = {
                employeeId: data['employeeId'].trim(),
                employeeName: data['employeeName'] || '',
                department: data['department'] || '',
                workshopTitle: data['workshopTitle'] || '',
                hours: parseFloat(data['workshopHours']) || 0,
                organizer: data['organizer'] || '',
                certificate: data['certificate'] || 'لا'
            };
            
            if (workshopData.hours < 6) {
                alert('⚠️ مدة الورشة يجب أن تكون أكثر من 6 ساعات');
                return;
            }
            
            if (!workshopData.department || !workshopData.workshopTitle || !workshopData.organizer) {
                alert('⚠️ يرجى تعبئة جميع الحقول المطلوبة');
                return;
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(workshopData)
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    alert('✅ تم تسجيل الورشة بنجاح!\n' +
                          '📚 ' + workshopData.workshopTitle + '\n' +
                          '👤 ' + workshopData.employeeId + ' - ' + workshopData.employeeName);
                    form.reset();
                    if (dateInput) dateInput.value = today;
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
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
