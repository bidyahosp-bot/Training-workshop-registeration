// ============================================
// Workshops JavaScript - Bidiya Training Hub
// ============================================

let allWorkshops = [];
let filteredWorkshops = [];
let currentPage = 1;
const itemsPerPage = 20;

// Load workshops data
async function loadWorkshops() {
try {
const response = await fetch(API_URL);
const result = await response.json();

if (result.status === 'success' && result.data) {
// Assume we have a way to get all workshops
// For now, we'll use the recent workshops or fetch all
allWorkshops = result.data.allWorkshops || result.data.recentWorkshops || [];
filteredWorkshops = [...allWorkshops];

// Populate filters
populateFilters(allWorkshops);

// Render table
renderTable();
}
} catch (error) {
console.error('Error loading workshops:', error);
document.getElementById('workshopsBody').innerHTML = &lt;tr&gt;&lt;td colspan="7" class="error-row"&gt; &lt;i class="fas fa-exclamation-triangle"&gt;&lt;/i&gt; حدث خطأ في تحميل البيانات &lt;/td&gt;&lt;/tr&gt;;
}
}

// Populate filter dropdowns
// Populate filter dropdowns
function populateFilters(workshops) {
    // الحصول على الأقسام الفريدة من البيانات
    const departments = [...new Set(workshops.map(w => w.department).filter(Boolean))];
    const years = [...new Set(workshops.map(w => {
        try { return new Date(w.date).getFullYear(); } catch { return null; }
    }).filter(Boolean))];
    
    // تعبئة فلتر الأقسام
    const deptSelect = document.getElementById('filterDepartment');
    if (deptSelect) {
        // الاحتفاظ بخيار "جميع الأقسام"
        const allOption = deptSelect.querySelector('option[value="all"]');
        deptSelect.innerHTML = '';
        if (allOption) {
            deptSelect.appendChild(allOption);
        } else {
            const option = document.createElement('option');
            option.value = 'all';
            option.textContent = 'جميع الأقسام';
            deptSelect.appendChild(option);
        }
        
        // إضافة الأقسام مع أيقونات
        const deptIcons = {
            'الأطباء': '👨‍⚕️',
            'التمريض': '👩‍⚕️',
            'التضميد': '🩹',
            'الصيدلة': '💊',
            'الأشعة': '📷',
            'الأسنان': '🦷',
            'المختبر': '🔬',
            'السجلات الطبية': '📋',
            'الإدارة': '📊',
            'التثقيف الصحي': '📚',
            'التغذية': '🍎'
        };
        
        departments.sort().forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            const icon = deptIcons[dept] || '🏢';
            option.textContent = `${icon} ${dept}`;
            deptSelect.appendChild(option);
        });
    }
    
    // تعبئة فلتر السنوات
    const yearSelect = document.getElementById('filterYear');
    if (yearSelect) {
        const allOption = yearSelect.querySelector('option[value="all"]');
        yearSelect.innerHTML = '';
        if (allOption) {
            yearSelect.appendChild(allOption);
        } else {
            const option = document.createElement('option');
            option.value = 'all';
            option.textContent = 'جميع السنوات';
            yearSelect.appendChild(option);
        }
        
        years.sort().reverse().forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }
}

// Apply filters
function applyFilters() {
const searchTerm = document.getElementById('searchInput').value.toLowerCase();
const department = document.getElementById('filterDepartment').value;
const year = document.getElementById('filterYear').value;
const month = document.getElementById('filterMonth').value;

filteredWorkshops = allWorkshops.filter(w => {
// Search
const matchSearch = !searchTerm ||
w.employee?.toLowerCase().includes(searchTerm) ||
w.department?.toLowerCase().includes(searchTerm) ||
w.workshop?.toLowerCase().includes(searchTerm) ||
w.organizer?.toLowerCase().includes(searchTerm);

// Department
const matchDept = department === 'all' || w.department === department;

// Year
let matchYear = true;
if (year !== 'all' && w.date) {
try { matchYear = new Date(w.date).getFullYear() === parseInt(year); }
catch { matchYear = false; }
}

// Month
let matchMonth = true;
if (month !== 'all' && w.date) {
try { matchMonth = new Date(w.date).getMonth() + 1 === parseInt(month); }
catch { matchMonth = false; }
}

return matchSearch && matchDept && matchYear && matchMonth;
});

currentPage = 1;
renderTable();
updateResultsCount();
}

// Render table with pagination
function renderTable() {
const tbody = document.getElementById('workshopsBody');
const start = (currentPage - 1) * itemsPerPage;
const end = start + itemsPerPage;
const pageItems = filteredWorkshops.slice(start, end);

if (!pageItems.length) {
tbody.innerHTML = <tr&gt;&lt;td colspan="7" class="empty-row"&gt; &lt;i class="fas fa-inbox"&gt;&lt;/i&gt; لا توجد ورش تدريبية مطابقة للبحث &lt;/td&gt;&lt;/tr>;
renderPagination();
return;
}

// في دالة renderTable
tbody.innerHTML = pageItems.map((w, index) => `
    <tr>
        <td>${start + index + 1}</td>
        <td><strong>${w.employee || '-'}</strong></td>
        <td>${w.employeeId || '-'}</td>  <!-- 🔽 تم التغيير من employeeId -->
        <td>${w.department || '-'}</td>
        <td>${w.workshop || '-'}</td>
        <td>${w.hours || 0}</td>
        <td>${w.organizer || '-'}</td>
        <td>${formatDate(w.date)}</td>
    </tr>
`).join('');

renderPagination();
}

// Render pagination
function renderPagination() {
const container = document.getElementById('pagination');
const totalPages = Math.ceil(filteredWorkshops.length / itemsPerPage);

if (totalPages <= 1) {
container.innerHTML = '';
return;
}

let html = '';
for (let i = 1; i <= totalPages; i++) {
html += <button class="page-btn${i === currentPage ? 'active' : ''}" data-page="{i}</button>`;
}
container.innerHTML = html;

container.querySelectorAll('.page-btn').forEach(btn => {
btn.addEventListener('click', () => {
currentPage = parseInt(btn.dataset.page);
renderTable();
});
});
}

// Update results count
function updateResultsCount() {
document.getElementById('resultsCount').textContent = filteredWorkshops.length;
}

// Export to Excel
function exportToExcel() {
if (!filteredWorkshops.length) {
alert('لا توجد بيانات للتصدير');
return;
}
// في دالة exportToExcel
const headers = ['الموظف', 'الرقم الوظيفي', 'القسم', 'عنوان الورشة', 'الساعات', 'الجهة المنظمة', 'التاريخ'];
// 🔽 تم التغيير من 'الرقم المدني'
const rows = filteredWorkshops.map(w => [
w.employee || '',
w.department || '',
w.workshop || '',
w.hours || 0,
w.organizer || '',
formatDate(w.date)
 ]);

const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = سجل_الورش_${new Date().toISOString().split('T')[0]}.csv;
link.click();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
loadWorkshops();

// Search
document.getElementById('searchInput').addEventListener('input', applyFilters);

// Filters
document.getElementById('filterDepartment').addEventListener('change', applyFilters);
document.getElementById('filterYear').addEventListener('change', applyFilters);
document.getElementById('filterMonth').addEventListener('change', applyFilters);

// Clear filters
document.getElementById('clearFilters').addEventListener('click', () => {
document.getElementById('searchInput').value = '';
document.getElementById('filterDepartment').value = 'all';
document.getElementById('filterYear').value = 'all';
document.getElementById('filterMonth').value = 'all';
applyFilters();
});

// Export
document.getElementById('exportBtn').addEventListener('click', exportToExcel);
});