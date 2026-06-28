// ============================================
// Reports JavaScript - Bidiya Training Hub
// ============================================

let reportData = {};
let charts = {};

// Load report data
async function loadReportData() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (result.status === 'success' && result.data) {
            reportData = result.data;
            
            // التحقق من وجود بيانات
            const hasData = reportData.recentWorkshops && reportData.recentWorkshops.length > 0;
            
            if (hasData) {
                renderCharts(reportData);
            } else {
                showNoDataMessage();
            }
            
            renderEmployeeReport(reportData.allEmployees || reportData.topEmployees || []);
            renderDepartmentReport(reportData.topDepartments || []);
        }
    } catch (error) {
        console.error('Error loading report data:', error);
        showErrorMessage();
    }
}

// عرض رسالة عدم وجود بيانات
function showNoDataMessage() {
    const container = document.querySelector('.charts-grid');
    if (container) {
        container.innerHTML = `
            <div class="no-data-message" style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                <i class="fas fa-database" style="font-size: 3rem; color: var(--text-secondary);"></i>
                <p style="margin-top: 15px; color: var(--text-secondary);">
                    لا توجد بيانات كافية لعرض الرسوم البيانية.<br>
                    يرجى تسجيل ورش تدريبية أولاً.
                </p>
            </div>
        `;
    }
}

function showErrorMessage() {
    const container = document.querySelector('.charts-grid');
    if (container) {
        container.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c;"></i>
                <p style="margin-top: 15px; color: var(--text-secondary);">
                    حدث خطأ في تحميل البيانات. يرجى المحاولة لاحقاً.
                </p>
            </div>
        `;
    }
}

// Render all charts
function renderCharts(data) {
    // 1. Monthly Workshops Chart
    const monthlyCanvas = document.getElementById('monthlyChart');
    if (!monthlyCanvas) return;
    
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthlyData = Array(12).fill(0);
    
    if (data.recentWorkshops) {
        data.recentWorkshops.forEach(function(w) {
            try {
                const month = new Date(w.date).getMonth();
                monthlyData[month] = (monthlyData[month] || 0) + 1;
            } catch {}
        });
    }
    
    charts.monthly = new Chart(monthlyCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'عدد الورش',
                data: monthlyData,
                backgroundColor: 'rgba(26, 122, 58, 0.7)',
                borderColor: 'rgba(26, 122, 58, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });

    // 2. Department Hours Chart
    const deptCanvas = document.getElementById('departmentChart');
    if (!deptCanvas) return;
    
    const deptData = data.topDepartments || [];
    const deptNames = deptData.map(function(d) { return d.name; });
    const deptHours = deptData.map(function(d) { return d.totalHours || d.workshops * 8; });
    
    charts.department = new Chart(deptCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: deptNames.length ? deptNames : ['لا توجد بيانات'],
            datasets: [{
                data: deptHours.length ? deptHours : [1],
                backgroundColor: ['#1a7a3a', '#1976d2', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22', '#2ecc71'],
                borderWidth: 2,
                borderColor: 'white'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { family: 'Cairo' } }
                }
            }
        }
    });

    // 3. Top Employees Chart
    const empCanvas = document.getElementById('topEmployeesChart');
    if (!empCanvas) return;
    
    const topEmp = data.topEmployees || [];
    const empNames = topEmp.map(function(e) { return e.name; });
    const empWorkshops = topEmp.map(function(e) { return e.workshops; });
    
    charts.topEmployees = new Chart(empCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: empNames.length ? empNames : ['لا توجد بيانات'],
            datasets: [{
                label: 'عدد الورش',
                data: empWorkshops.length ? empWorkshops : [0],
                backgroundColor: empWorkshops.map(function(_, i) {
                    return i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32';
                }),
                borderColor: 'rgba(0,0,0,0.1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });

    // 4. Organizer Chart
    const orgCanvas = document.getElementById('organizerChart');
    if (!orgCanvas) return;
    
    const organizers = {};
    if (data.recentWorkshops) {
        data.recentWorkshops.forEach(function(w) {
            const org = w.organizer || 'غير محدد';
            organizers[org] = (organizers[org] || 0) + 1;
        });
    }
    const orgLabels = Object.keys(organizers);
    const orgData = Object.values(organizers);
    
    charts.organizer = new Chart(orgCanvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: orgLabels.length ? orgLabels : ['لا توجد بيانات'],
            datasets: [{
                data: orgData.length ? orgData : [1],
                backgroundColor: ['#1a7a3a', '#1976d2', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22', '#2ecc71'],
                borderWidth: 2,
                borderColor: 'white'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { family: 'Cairo' } }
                }
            }
        }
    });

    // 5. Certificate Chart
    const certCanvas = document.getElementById('certificateChart');
    if (!certCanvas) return;
    
    const hasCert = data.recentWorkshops ? data.recentWorkshops.filter(function(w) { return w.certificate === 'نعم'; }).length : 0;
    const noCert = data.recentWorkshops ? data.recentWorkshops.filter(function(w) { return w.certificate === 'لا'; }).length : 0;
    
    charts.certificate = new Chart(certCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['مع شهادة', 'بدون شهادة'],
            datasets: [{
                data: [hasCert || 1, noCert || 1],
                backgroundColor: ['#27ae60', '#e74c3c'],
                borderWidth: 2,
                borderColor: 'white'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { family: 'Cairo' } }
                }
            }
        }
    });
}

// Render Employee Report Table
function renderEmployeeReport(employees) {
    const tbody = document.getElementById('employeeReportBody');
    if (!tbody) return;
    
    if (!employees || !employees.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row">لا توجد بيانات</td></tr>`;
        return;
    }

    tbody.innerHTML = employees.map(function(emp, index) {
        const badge = getBadge(emp.workshops);
        const avgHours = emp.workshops > 0 ? ((emp.totalHours || 0) / emp.workshops).toFixed(1) : 0;
        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${emp.name}</strong></td>
                <td>${emp.department || '-'}</td>
                <td>${emp.workshops}</td>
                <td>${emp.totalHours || 0}</td>
                <td>${avgHours}</td>
                <td>
                    <span class="badge" style="background:${badge.color}20; color:${badge.color};">
                        ${badge.emoji} ${badge.name}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// Render Department Report Table
function renderDepartmentReport(departments) {
    const tbody = document.getElementById('departmentReportBody');
    if (!tbody) return;
    
    if (!departments || !departments.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row">لا توجد بيانات</td></tr>`;
        return;
    }

    const totalWorkshops = departments.reduce(function(sum, d) { return sum + d.workshops; }, 0);

    tbody.innerHTML = departments.map(function(dept, index) {
        const rate = totalWorkshops > 0 ? ((dept.workshops / totalWorkshops) * 100).toFixed(1) : 0;
        const avgPerEmployee = dept.employees > 0 ? ((dept.totalHours || dept.workshops * 8) / dept.employees).toFixed(1) : 0;
        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${dept.name}</strong></td>
                <td>${dept.employees || 0}</td>
                <td>${dept.workshops}</td>
                <td>${dept.totalHours || (dept.workshops * 8)}</td>
                <td>${avgPerEmployee}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${rate}%; background: var(--primary);"></div>
                        <span>${rate}%</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Generate Certificate
function generateCertificate(employee, period) {
    const badge = getBadge(employee.workshops);
    return `
        <div class="certificate-card">
            <div class="certificate-header">
                <img src="assets/img/logo.png" alt="Logo" class="cert-logo">
                <h2>شهادة تقدير</h2>
            </div>
            <div class="certificate-body">
                <p>تقديراً لجهوده المتميزة في</p>
                <h3>${employee.name}</h3>
                <p>من قسم ${employee.department || 'غير محدد'}</p>
                <div class="cert-badge">${badge.emoji} ${badge.name}</div>
                <p>لتسجيله ${employee.workshops} ورشة تدريبية</p>
                <p class="cert-period">${period === 'monthly' ? 'الشهر الحالي' : 'السنة الحالية'}</p>
            </div>
            <div class="certificate-footer">
                <p>مستشفى بدية - منصة التدريب والتطوير المهني</p>
                <p class="cert-date">${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
        </div>
    `;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadReportData();

    // Generate Report
    const generateBtn = document.getElementById('generateReport');
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            loadReportData();
            const btn = this;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحديث...';
            setTimeout(function() {
                btn.innerHTML = '<i class="fas fa-chart-bar"></i> إنشاء التقرير';
            }, 1000);
        });
    }

    // Export PDF
    const exportBtn = document.getElementById('exportPDF');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            alert('📄 سيتم تصدير التقرير كملف PDF في الإصدار القادم');
        });
    }

    // Generate Certificates
    const certBtn = document.getElementById('generateCertificates');
    if (certBtn) {
        certBtn.addEventListener('click', function() {
            const period = document.getElementById('certificatePeriod').value;
            const top = parseInt(document.getElementById('certificateTop').value);
            const employees = reportData.topEmployees || [];

            if (!employees.length) {
                alert('لا توجد بيانات كافية لإنشاء الشهادات');
                return;
            }

            const topEmployees = employees.slice(0, top);
            const preview = document.getElementById('certificatePreview');
            preview.innerHTML = topEmployees.map(function(emp) {
                return generateCertificate(emp, period);
            }).join('');
            preview.style.display = 'block';
        });
    }
});

// ============================================
// إضافة الأنماط ديناميكياً (للملفات التي لا تحتوي عليها)
// ============================================
(function addStyles() {
    if (document.getElementById('reports-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'reports-styles';
    style.textContent = `
        .certificate-preview {
            display: none;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-top: 20px;
        }
        .certificate-card {
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border: 2px solid #ffd700;
            transition: transform 0.3s;
        }
        .certificate-card:hover {
            transform: translateY(-5px);
        }
        .certificate-card .cert-logo {
            height: 50px;
            margin-bottom: 10px;
        }
        .certificate-card .cert-badge {
            font-size: 2rem;
            margin: 10px 0;
        }
        .certificate-card .cert-period {
            font-size: 0.9rem;
            color: #666;
            margin-top: 10px;
        }
        .certificate-card .certificate-footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            font-size: 0.85rem;
            color: #666;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.85rem;
        }
        .progress-bar {
            position: relative;
            width: 100%;
            height: 20px;
            background: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            border-radius: 10px;
            transition: width 0.5s ease;
        }
        .progress-bar span {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 0.7rem;
            font-weight: 600;
            color: #333;
        }
        .report-filters {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: end;
            background: var(--bg-card);
            padding: 20px;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            margin-bottom: 30px;
        }
        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .filter-group label {
            font-weight: 600;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }
        .filter-group select {
            padding: 8px 15px;
            border: 1px solid #ddd;
            border-radius: 10px;
            font-family: var(--font);
            background: var(--bg-main);
            color: var(--text-primary);
            min-width: 150px;
        }
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-bottom: 40px;
        }
        .chart-card {
            background: var(--bg-card);
            padding: 20px;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
        }
        .chart-card.full-width {
            grid-column: 1 / -1;
        }
        .chart-card h3 {
            margin-bottom: 15px;
            font-size: 1rem;
            color: var(--text-secondary);
        }
        .chart-card canvas {
            max-height: 300px;
        }
        .report-tables {
            display: grid;
            gap: 30px;
            margin-top: 30px;
        }
        .report-section {
            background: var(--bg-card);
            padding: 20px;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
        }
        .report-section h2 {
            margin-bottom: 20px;
            font-size: 1.2rem;
        }
        .report-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }
        .report-table th {
            background: var(--primary);
            color: white;
            padding: 10px 15px;
            text-align: right;
        }
        .report-table td {
            padding: 8px 15px;
            border-bottom: 1px solid var(--bg-main);
        }
        .report-table tr:hover td {
            background: var(--primary-light);
        }
        .certificate-section {
            margin-top: 40px;
            padding: 30px;
            background: var(--bg-card);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
        }
        .certificate-controls {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            margin: 15px 0;
        }
        .certificate-controls select {
            padding: 8px 15px;
            border: 1px solid #ddd;
            border-radius: 10px;
            font-family: var(--font);
        }
        @media (max-width: 768px) {
            .charts-grid { grid-template-columns: 1fr; }
            .report-filters { flex-direction: column; }
            .filter-group select { width: 100%; }
            .certificate-controls { flex-direction: column; }
        }
    `;
    document.head.appendChild(style);
})();
