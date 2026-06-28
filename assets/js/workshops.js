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
            allWorkshops = result.data.allWorkshops || result.data.recentWorkshops || [];
            filteredWorkshops = [...allWorkshops];

            populateFilters(allWorkshops);
            renderTable();
        }
    } catch (error) {
        console.error('Error loading workshops:', error);
        const tbody = document.getElementById('workshopsBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="error-row">
                        <i class="fas fa-exclamation-triangle"></i>
                        حدث خطأ في تحميل البيانات
                    </td>
                </tr>
            `;
        }
    }
}

// Populate filter dropdowns
function populateFilters(workshops) {
    const departments = [...new Set(workshops.map(w => w.department).filter(Boolean))];
    const years = [...new Set(workshops.map(w => {
        try { return new Date(w.date).getFullYear(); } catch { return null; }
    }).filter(Boolean))];
    
    // تعبئة فلتر الأقسام
    const deptSelect = document.getElementById('filterDepartment');
    if (deptSelect) {
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
            option.textContent = icon + ' ' + dept;
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
        const matchSearch = !searchTerm ||
            (w.employee && w.employee.toLowerCase().includes(searchTerm)) ||
            (w.department && w.department.toLowerCase().includes(searchTerm)) ||
            (w.workshop && w.workshop.toLowerCase().includes(searchTerm)) ||
            (w.organizer && w.organizer.toLowerCase().includes(searchTerm));

        const matchDept = department === 'all' || w.department === department;

        let matchYear = true;
        if (year !== 'all' && w.date) {
            try { matchYear = new Date(w.date).getFullYear() === parseInt(year); }
            catch { matchYear = false; }
        }

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
    if (!tbody) return;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredWorkshops.slice(start, end);

    if (!pageItems.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-row">
                    <i class="fas fa-inbox"></i>
                    لا توجد ورش تدريبية مطابقة للبحث
                </td>
            </tr>
        `;
        renderPagination();
        return;
    }

    tbody.innerHTML = pageItems.map((w, index) => `
        <tr>
            <td>${start + index + 1}</td>
            <td><strong>${w.employee || '-'}</strong></td>
            <td>${w.employeeId || '-'}</td>  <!-- ✅ عرض الرقم الوظيفي -->
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
    if (!container) return;
    
    const totalPages = Math.ceil(filteredWorkshops.length / itemsPerPage);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    container.innerHTML = html;

    container.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentPage = parseInt(this.dataset.page);
            renderTable();
        });
    });
}

// Update results count
function updateResultsCount() {
    const el = document.getElementById('resultsCount');
    if (el) el.textContent = filteredWorkshops.length;
}

// Export to Excel
function exportToExcel() {
    if (!filteredWorkshops.length) {
        alert('لا توجد بيانات للتصدير');
        return;
    }
    
    const headers = ['#', 'الموظف', 'الرقم الوظيفي', 'القسم', 'عنوان الورشة', 'الساعات', 'الجهة المنظمة', 'التاريخ'];
    const rows = filteredWorkshops.map((w, index) => [
        index + 1,
        w.employee || '',
        w.employeeId || '',
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
    link.download = 'سجل_الورش_' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadWorkshops();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', applyFilters);

    const deptFilter = document.getElementById('filterDepartment');
    if (deptFilter) deptFilter.addEventListener('change', applyFilters);

    const yearFilter = document.getElementById('filterYear');
    if (yearFilter) yearFilter.addEventListener('change', applyFilters);

    const monthFilter = document.getElementById('filterMonth');
    if (monthFilter) monthFilter.addEventListener('change', applyFilters);

    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
            
            const deptFilter = document.getElementById('filterDepartment');
            if (deptFilter) deptFilter.value = 'all';
            
            const yearFilter = document.getElementById('filterYear');
            if (yearFilter) yearFilter.value = 'all';
            
            const monthFilter = document.getElementById('filterMonth');
            if (monthFilter) monthFilter.value = 'all';
            
            applyFilters();
        });
    }

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportToExcel);
});
