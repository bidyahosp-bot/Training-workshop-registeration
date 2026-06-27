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

// Render all charts
renderCharts(reportData);

// Render report tables
renderEmployeeReport(reportData.topEmployees || []);
renderDepartmentReport(reportData.topDepartments || []);
}
} catch (error) {
console.error('Error loading report data:', error);
}
}

// Render all charts
function renderCharts(data) {
// 1. Monthly Workshops Chart
const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

// Generate mock monthly data (replace with actual data)
const monthlyData = Array(12).fill(0);
// If we have real data, populate it
if (data.recentWorkshops) {
data.recentWorkshops.forEach(w => {
try {
const month = new Date(w.date).getMonth();
monthlyData[month] = (monthlyData[month] || 0) + 1;
} catch {}
});
}

charts.monthly = new Chart(monthlyCtx, {
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
const deptCtx = document.getElementById('departmentChart').getContext('2d');
const deptData = data.topDepartments || [];
const deptNames = deptData.map(d => d.name);
const deptHours = deptData.map(d => d.workshops * 8); // Estimate hours

charts.department = new Chart(deptCtx, {
type: 'doughnut',
data: {
labels: deptNames,
datasets: [{
data: deptHours.length ? deptHours : [1],
backgroundColor: [
'#1a7a3a', '#1976d2', '#f39c12', '#e74c3c',
'#9b59b6', '#1abc9c', '#e67e22', '#2ecc71'
 ],
borderWidth: 2,
borderColor: 'white'
}]
},
options: {
responsive: true,
plugins: {
legend: {
position: 'bottom',
labels: {
font: { family: 'Cairo' }
}
}
}
}
});

// 3. Top Employees Chart
const empCtx = document.getElementById('topEmployeesChart').getContext('2d');
const topEmp = data.topEmployees || [];
const empNames = topEmp.map(e => e.name);
const empWorkshops = topEmp.map(e => e.workshops);

charts.topEmployees = new Chart(empCtx, {
type: 'bar',
data: {
labels: empNames,
datasets: [{
label: 'عدد الورش',
data: empWorkshops.length ? empWorkshops : [0],
backgroundColor: empWorkshops.map((_, i) =>
i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32'
),
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
const orgCtx = document.getElementById('organizerChart').getContext('2d');
const organizers = {};
if (data.recentWorkshops) {
data.recentWorkshops.forEach(w => {
const org = w.organizer || 'غير محدد';
organizers[org] = (organizers[org] || 0) + 1;
});
}
const orgLabels = Object.keys(organizers);
const orgData = Object.values(organizers);

charts.organizer = new Chart(orgCtx, {
type: 'pie',
data: {
labels: orgLabels.length ? orgLabels : ['لا توجد بيانات'],
datasets: [{
data: orgData.length ? orgData : [1],
backgroundColor: [
'#1a7a3a', '#1976d2', '#f39c12', '#e74c3c',
'#9b59b6', '#1abc9c', '#e67e22', '#2ecc71',
'#e84393', '#00b894'
 ],
borderWidth: 2,
borderColor: 'white'
}]
},
options: {
responsive: true,
plugins: {
legend: {
position: 'bottom',
labels: {
font: { family: 'Cairo' }
}
}
}
}
});

// 5. Certificate Chart
const certCtx = document.getElementById('certificateChart').getContext('2d');
const hasCert = data.recentWorkshops ? data.recentWorkshops.filter(w => w.certificate === 'نعم').length : 0;
const noCert = data.recentWorkshops ? data.recentWorkshops.filter(w => w.certificate === 'لا').length : 0;

charts.certificate = new Chart(certCtx, {
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
labels: {
font: { family: 'Cairo' }
}
}
}
}
});
}

// Render Employee Report Table
function renderEmployeeReport(employees) {
const tbody = document.getElementById('employeeReportBody');
if (!employees.length) {
tbody.innerHTML = <tr&gt;&lt;td colspan="7" class="empty-row"&gt;لا توجد بيانات&lt;/td&gt;&lt;/tr>;
return;
}

const totalHours = employees.reduce((sum, e) => sum + (e.totalHours || 0), 0);
const avgHours = totalHours / employees.length;

tbody.innerHTML = employees.map((emp, index) => {
const badge = getBadge(emp.workshops);
return &lt;tr&gt; &lt;td&gt;${index + 1}</td>
<td><strong>${emp.name}&lt;/strong&gt;&lt;/td&gt; &lt;td&gt;${emp.department || '-'}</td>
<td>${emp.workshops}&lt;/td&gt; &lt;td&gt;${emp.totalHours || 0}</td>
<td>${((emp.totalHours || 0) / emp.workshops).toFixed(1)}&lt;/td&gt; &lt;td&gt;&lt;span class="badge" style="background:${badge.color}20; color:${badge.color}"&gt;${badge.emoji} ${badge.name}&lt;/span&gt;&lt;/td&gt; &lt;/tr&gt;;
}).join('');
}

// Render Department Report Table
function renderDepartmentReport(departments) {
const tbody = document.getElementById('departmentReportBody');
if (!departments.length) {
tbody.innerHTML = <tr&gt;&lt;td colspan="7" class="empty-row"&gt;لا توجد بيانات&lt;/td&gt;&lt;/tr>;
return;
}

const totalWorkshops = departments.reduce((sum, d) => sum + d.workshops, 0);

tbody.innerHTML = departments.map((dept, index) => {
const rate = ((dept.workshops / totalWorkshops) * 100).toFixed(1);
return &lt;tr&gt; &lt;td&gt;${index + 1}</td>
<td><strong>${dept.name}&lt;/strong&gt;&lt;/td&gt; &lt;td&gt;${dept.employees || 0}</td>
<td>${dept.workshops}&lt;/td&gt; &lt;td&gt;${(dept.workshops * 8).toFixed(0)}</td>
<td>${((dept.workshops * 8) / (dept.employees || 1)).toFixed(1)}&lt;/td&gt; &lt;td&gt; &lt;div class="progress-bar"&gt; &lt;div class="progress-fill" style="width: ${rate}%; background: var(--primary);"></div>
<span>${rate}%&lt;/span&gt; &lt;/div&gt; &lt;/td&gt; &lt;/tr&gt;;
}).join('');
}

// Generate Certificate
function generateCertificate(employee, period) {
const badge = getBadge(employee.workshops);
return &lt;div class="certificate-card"&gt; &lt;div class="certificate-header"&gt; &lt;img src="assets/img/logo.png" alt="Logo" class="cert-logo"&gt; &lt;h2&gt;شهادة تقدير&lt;/h2&gt; &lt;/div&gt; &lt;div class="certificate-body"&gt; &lt;p&gt;تقديراً لجهوده المتميزة في&lt;/p&gt; &lt;h3&gt;${employee.name}</h3>
<p>من قسم ${employee.department || 'غير محدد'}&lt;/p&gt; &lt;div class="cert-badge"&gt;${badge.emoji} ${badge.name}&lt;/div&gt; &lt;p&gt;لتسجيله ${employee.workshops} ورشة تدريبية</p>
<p class="cert-period">${period === 'monthly' ? 'الشهر الحالي' : 'السنة الحالية'}&lt;/p&gt; &lt;/div&gt; &lt;div class="certificate-footer"&gt; &lt;p&gt;مستشفى بدية - منصة التدريب والتطوير المهني&lt;/p&gt; &lt;p class="cert-date"&gt;${new Date().toLocaleDateString('ar-SA')}&lt;/p&gt; &lt;/div&gt; &lt;/div&gt;;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
loadReportData();

// Generate Report
document.getElementById('generateReport').addEventListener('click', () => {
loadReportData();
// Show loading state
const btn = document.getElementById('generateReport');
btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحديث...';
setTimeout(() => {
btn.innerHTML = '<i class="fas fa-chart-bar"></i> إنشاء التقرير';
}, 1000);
});

// Export PDF
document.getElementById('exportPDF').addEventListener('click', () => {
alert('📄 سيتم تصدير التقرير كملف PDF في الإصدار القادم');
});

// Generate Certificates
document.getElementById('generateCertificates').addEventListener('click', () => {
const period = document.getElementById('certificatePeriod').value;
const top = parseInt(document.getElementById('certificateTop').value);
const employees = reportData.topEmployees || [];

if (!employees.length) {
alert('لا توجد بيانات كافية لإنشاء الشهادات');
return;
}

const topEmployees = employees.slice(0, top);
const preview = document.getElementById('certificatePreview');
preview.innerHTML = topEmployees.map(emp => generateCertificate(emp, period)).join('');
preview.style.display = 'block';
});
});

// Add these styles to style.css
const style = document.createElement('style');
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
.charts-grid {
grid-template-columns: 1fr;
}

.report-filters {
flex-direction: column;
}

.filter-group select {
width: 100%;
}

.certificate-controls {
flex-direction: column;
}
}
`;
document.head.appendChild(style);