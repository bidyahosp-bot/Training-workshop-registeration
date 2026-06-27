// ============================================
// i18n - Translation System
// ============================================

const translations = {
ar: {
app_name: "منصة مستشفى بدية للتدريب والتطوير المهني",
tagline: "نتعلم اليوم... لنرعى أفضل غدًا",
nav_home: "الرئيسية",
nav_dashboard: "لوحة الشرف",
nav_workshops: "سجل الورش",
nav_register: "تسجيل ورشة",
hero_title: "معًا نبني ثقافة التعلم المستمر في مستشفى بدية",
hero_subtitle: "سجل مشاركاتك التدريبية وانضم إلى مجتمع التعلم",
total_workshops: "إجمالي الورش",
total_hours: "إجمالي ساعات التدريب",
total_employees: "الموظفين المشاركين",
top_employee_label: "أفضل موظف",
last_registration_label: "آخر تسجيل",
register_workshop: "تسجيل ورشة جديدة",
register_desc: "أضف مشاركتك التدريبية الجديدة",
browse_workshops: "استعراض الورش",
browse_desc: "ابحث وتصفح جميع الورش المسجلة",
view_dashboard: "لوحة الشرف",
dashboard_desc: "شاهد أفضل الموظفين والأقسام",
view_reports: "التقارير",
reports_desc: "استخرج تقارير وإحصائيات مفصلة",
footer_tagline: "نتعلم اليوم... لنرعى أفضل غدًا",
footer_copyright: "© 2026 مستشفى بدية - جميع الحقوق محفوظة",
footer_pwa: "تطبيق يعمل دون اتصال"
},
en: {
app_name: "Bidiya Hospital Training & Professional Development Platform",
tagline: "Learning Today, Caring Better Tomorrow",
nav_home: "Home",
nav_dashboard: "Dashboard",
nav_workshops: "Workshops",
nav_register: "Register Workshop",
hero_title: "Together, we build a culture of continuous learning at Bidiya Hospital",
hero_subtitle: "Register your training participations and join our learning community",
total_workshops: "Total Workshops",
total_hours: "Total Training Hours",
total_employees: "Participating Employees",
top_employee_label: "Top Employee",
last_registration_label: "Last Registration",
register_workshop: "Register New Workshop",
register_desc: "Add your new training participation",
browse_workshops: "Browse Workshops",
browse_desc: "Search and browse all registered workshops",
view_dashboard: "Dashboard",
dashboard_desc: "View top employees and departments",
view_reports: "Reports",
reports_desc: "Extract detailed reports and statistics",
footer_tagline: "Learning Today, Caring Better Tomorrow",
footer_copyright: "© 2026 Bidiya Hospital - All Rights Reserved",
footer_pwa: "Offline-capable App"
}
};

let currentLang = localStorage.getItem('bth_lang') || 'ar';

function t(key) {
return translations[currentLang]?.[key] || key;
}

function updateUI() {
document.querySelectorAll('[data-i18n]').forEach(el => {
const key = el.getAttribute('data-i18n');
el.textContent = t(key);
});

document.querySelectorAll('.lang-btn').forEach(btn => {
btn.classList.toggle('active', btn.dataset.lang === currentLang);
});

document.documentElement.lang = currentLang;
document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
localStorage.setItem('bth_lang', currentLang);
}

document.addEventListener('DOMContentLoaded', () => {
// Set language buttons
document.querySelectorAll('.lang-btn').forEach(btn => {
btn.addEventListener('click', () => {
currentLang = btn.dataset.lang;
updateUI();
});
});

// Apply saved language
updateUI();
});