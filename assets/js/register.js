async function registerWorkshop(event) {
    event.preventDefault();
    
    const form = document.getElementById('registerForm');
    const formData = new FormData(form);
    
    // بناء رابط مع المعلمات
    const params = new URLSearchParams();
    params.append('action', 'add');
    params.append('employeeId', formData.get('employeeId') || '');
    params.append('employeeName', formData.get('employeeName') || '');
    params.append('department', formData.get('department') || '');
    params.append('workshopTitle', formData.get('workshopTitle') || '');
    params.append('hours', formData.get('workshopHours') || 0);
    params.append('organizer', formData.get('organizer') || '');
    params.append('certificate', formData.get('certificate') || 'لا');
    params.append('workshopDate', formData.get('workshopDate') || new Date().toISOString().split('T')[0]);
    
    const url = API_URL + '?' + params.toString();
    
    try {
        const response = await fetch(url);
        const result = await response.json();
        console.log('📡 الرد:', result);
        
        if (result.status === 'success') {
            alert('✅ تم تسجيل الورشة بنجاح!');
            form.reset();
        } else {
            alert('⚠️ ' + (result.message || 'حدث خطأ'));
        }
    } catch (error) {
        console.error('❌ خطأ:', error);
        alert('⚠️ حدث خطأ في الاتصال');
    }
}
