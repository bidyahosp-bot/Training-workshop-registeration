// ============================================
// Register JavaScript - Bidiya Training Hub
// ============================================

// ============================================
// تسجيل ورشة جديدة
// ============================================
async function registerWorkshop(event) {
    event.preventDefault();
    
    // جمع البيانات من النموذج
    const form = document.getElementById('registerForm');
    const formData = new FormData(form);
    
    const data = {
        employeeId: formData.get('employeeId') || '',
        employeeName: formData.get('employeeName') || '',
        department: formData.get('department') || '',
        workshopTitle: formData.get('workshopTitle') || '',
        hours: parseFloat(formData.get('workshopHours')) || 0,
        organizer: formData.get('organizer') || '',
        certificate: formData.get('certificate') || 'لا',
        workshopDate: formData.get('workshopDate') || new Date().toISOString().split('T')[0]
    };
    
    // التحقق من الحقول المطلوبة
    if (!data.employeeId) {
        alert('⚠️ يرجى إدخال الرقم الوظيفي');
        return;
    }
    
    if (!data.department) {
        alert('⚠️ يرجى اختيار القسم');
        return;
    }
    
    if (!data.workshopTitle) {
        alert('⚠️ يرجى إدخال عنوان الورشة');
        return;
    }
    
    if (!data.organizer) {
        alert('⚠️ يرجى اختيار الجهة المنظمة');
        return;
    }
    
    // تغيير نص الزر
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
    submitBtn.disabled = true;
    
    try {
        console.log('📡 جاري إرسال البيانات:', data);
        
        // ✅ استخدام POST مع إرسال البيانات كـ JSON
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        // محاولة قراءة الرد
        let result;
        try {
            result = await response.json();
        } catch (e) {
            // إذا لم يكن الرد JSON، نعتبره نجاح
            result = { status: 'success', message: 'تم التسجيل بنجاح' };
        }
        
        console.log('📡 الرد من الخادم:', result);
        
        if (result.status === 'success') {
            alert('✅ تم تسجيل الورشة بنجاح!');
            form.reset();
            // إعادة تعيين التاريخ
            const dateInput = document.getElementById('workshopDate');
            if (dateInput) dateInput.value = '';
        } else {
            alert('⚠️ ' + (result.message || 'حدث خطأ في التسجيل'));
        }
        
    } catch (error) {
        console.error('❌ خطأ في التسجيل:', error);
        alert('⚠️ حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
        // إعادة الزر
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ============================================
// تحميل الصفحة
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', registerWorkshop);
    }
    
    console.log('✅ register.js تم تحميله بنجاح');
});
