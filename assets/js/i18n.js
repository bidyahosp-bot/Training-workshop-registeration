// ============================================
// i18n - Translation System
// ============================================

const translations = {
    ar: {
        // ... (جميع الترجمة العربية الموجودة) ...
        
        // أقسام الموظفين - عربي
        "select_department": "اختر القسم",
        "dept_doctors": "👨‍⚕️ الأطباء",
        "dept_nursing": "👩‍⚕️ التمريض",
        "dept_dressing": "🩹 التضميد",
        "dept_pharmacy": "💊 الصيدلة",
        "dept_radiology": "📷 الأشعة",
        "dept_dentistry": "🦷 الأسنان",
        "dept_laboratory": "🔬 المختبر",
        "dept_medical_records": "📋 السجلات الطبية",
        "dept_administration": "📊 الإدارة",
        "dept_health_education": "📚 التثقيف الصحي",
        "dept_nutrition": "🍎 التغذية"
    },
    en: {
        // ... (جميع الترجمة الإنجليزية الموجودة) ...
        
        // Employee Departments - English
        "select_department": "Select Department",
        "dept_doctors": "👨‍⚕️ Doctors",
        "dept_nursing": "👩‍⚕️ Nursing",
        "dept_dressing": "🩹 Dressing",
        "dept_pharmacy": "💊 Pharmacy",
        "dept_radiology": "📷 Radiology",
        "dept_dentistry": "🦷 Dentistry",
        "dept_laboratory": "🔬 Laboratory",
        "dept_medical_records": "📋 Medical Records",
        "dept_administration": "📊 Administration",
        "dept_health_education": "📚 Health Education",
        "dept_nutrition": "🍎 Nutrition"
    }
};

let currentLang = localStorage.getItem('bth_lang') || 'ar';

function t(key) {
    return translations[currentLang]?.[key] || key;
}

function updateUI() {
    // تحديث النصوص
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    
    // تحديث الـ placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    
    // تحديث أزرار اللغة
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
    
    // تحديث اتجاه الصفحة
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('bth_lang', currentLang);
    
    // ✅ تحديث خيارات الأقسام
    updateDepartmentOptions();
}

// ============================================
// تحديث خيارات الأقسام في القوائم المنسدلة
// ============================================
function updateDepartmentOptions() {
    const selects = document.querySelectorAll('select#department, select#filterDepartment');
    
    selects.forEach(function(select) {
        // حفظ القيمة المحددة حالياً
        const currentValue = select.value;
        
        // تعريف الأقسام مع مفاتيح الترجمة
        const departments = [
            { value: '', key: 'select_department' },
            { value: 'الأطباء', key: 'dept_doctors' },
            { value: 'التمريض', key: 'dept_nursing' },
            { value: 'التضميد', key: 'dept_dressing' },
            { value: 'الصيدلة', key: 'dept_pharmacy' },
            { value: 'الأشعة', key: 'dept_radiology' },
            { value: 'الأسنان', key: 'dept_dentistry' },
            { value: 'المختبر', key: 'dept_laboratory' },
            { value: 'السجلات الطبية', key: 'dept_medical_records' },
            { value: 'الإدارة', key: 'dept_administration' },
            { value: 'التثقيف الصحي', key: 'dept_health_education' },
            { value: 'التغذية', key: 'dept_nutrition' }
        ];
        
        // إعادة بناء الخيارات
        select.innerHTML = '';
        departments.forEach(function(dept) {
            const option = document.createElement('option');
            option.value = dept.value;
            option.textContent = t(dept.key);
            select.appendChild(option);
        });
        
        // استعادة القيمة المحددة
        if (currentValue) {
            select.value = currentValue;
        }
    });
}

// ============================================
// دالة ترجمة الأقسام (للاستخدام في JavaScript)
// ============================================
function translateDepartment(deptName, lang) {
    lang = lang || currentLang || 'ar';
    
    const deptMap = {
        'ar': {
            'الأطباء': 'الأطباء',
            'التمريض': 'التمريض',
            'التضميد': 'التضميد',
            'الصيدلة': 'الصيدلة',
            'الأشعة': 'الأشعة',
            'الأسنان': 'الأسنان',
            'المختبر': 'المختبر',
            'السجلات الطبية': 'السجلات الطبية',
            'الإدارة': 'الإدارة',
            'التثقيف الصحي': 'التثقيف الصحي',
            'التغذية': 'التغذية'
        },
        'en': {
            'الأطباء': 'Doctors',
            'التمريض': 'Nursing',
            'التضميد': 'Dressing',
            'الصيدلة': 'Pharmacy',
            'الأشعة': 'Radiology',
            'الأسنان': 'Dentistry',
            'المختبر': 'Laboratory',
            'السجلات الطبية': 'Medical Records',
            'الإدارة': 'Administration',
            'التثقيف الصحي': 'Health Education',
            'التغذية': 'Nutrition'
        }
    };
    
    return deptMap[lang]?.[deptName] || deptName;
}

// ============================================
// تحميل الصفحة
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            currentLang = this.dataset.lang;
            updateUI();
        });
    });
    updateUI();
});
