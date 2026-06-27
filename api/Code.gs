// ============================================
// Bidiya Hospital Training Hub - API
// Developed by JOUHARAH.IT
// قراءة وإضافة البيانات من/إلى Google Sheets
// ============================================
// ============================================
// CONFIGURATION - أقسام المستشفى
// ============================================
const DEPARTMENTS = [
    'الأطباء',
    'التمريض',
    'التضميد',
    'الصيدلة',
    'الأشعة',
    'الأسنان',
    'المختبر',
    'السجلات الطبية',
    'الإدارة',
    'التثقيف الصحي',
    'التغذية'
];

// ============================================
// GET DEPARTMENTS - دالة لجلب الأقسام
// ============================================
function getDepartments() {
    return {
        status: 'success',
        data: DEPARTMENTS
    };
}
// ============================================
// CONFIGURATION - أسماء الأعمدة المتوقعة
// ============================================
const COLUMN_CONFIG = {
    employeeName: ['اسم الموظف', 'Employee Name', 'الموظف', 'Employee', 'الاسم'],
    department: ['القسم', 'Department', 'الادارة', 'إدارة'],
    workshopTitle: ['عنوان الورشة', 'Workshop Title', 'الورشة', 'Workshop', 'اسم الورشة'],
    hours: ['عدد الساعات', 'Hours', 'الساعات', 'المدة', 'مدة الورشة'],
    date: ['الطابع الزمني', 'Timestamp', 'التاريخ', 'Date', 'تاريخ التسجيل'],
    organizer: ['الجهة المنظمة', 'Organizer', 'المنظم', 'جهة التدريب'],
    certificate: ['شهادة حضور', 'Certificate', 'شهادة', 'هل لديك شهادة'],
    employeeId: ['الرقم الوظيفي', 'Employee ID', 'الرقم الوظيفي', 'Job Number', 'الرقم الوظيفي']  
};

// اسم الورقة الرئيسية
const SHEET_NAME = 'Bookings';

// ============================================
// MAIN API ENDPOINT - قراءة البيانات
// ============================================
function doGet() {
    try {
        const data = getDashboardData();
        return ContentService
            .createTextOutput(JSON.stringify(data))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({
                status: 'error',
                message: error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// ============================================
// POST ENDPOINT - إضافة بيانات جديدة
// ============================================
function doPost(e) {
    try {
        // قراءة البيانات المرسلة
        const params = JSON.parse(e.postData.contents);
        const result = addWorkshopRecord(params);
        
        return ContentService
            .createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({
                status: 'error',
                message: error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
    function doGet(e) {
    try {
        // التحقق من نوع الطلب
        if (e && e.parameter && e.parameter.action === 'getDepartments') {
            return ContentService
                .createTextOutput(JSON.stringify(getDepartments()))
                .setMimeType(ContentService.MimeType.JSON);
        }
        
        const data = getDashboardData();
        return ContentService
            .createTextOutput(JSON.stringify(data))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({
                status: 'error',
                message: error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
}

// ============================================
// ADD WORKSHOP RECORD - إضافة سجل ورشة جديدة
// ============================================
function addWorkshopRecord(data) {
    try {
        // 1. الحصول على الورقة
        var sheet = getSheet(SHEET_NAME);
        if (!sheet) {
            // محاولة إنشاء الورقة إذا لم تكن موجودة
            var ss = SpreadsheetApp.getActiveSpreadsheet();
            sheet = ss.insertSheet(SHEET_NAME);
            // إضافة الرؤوس
            var headers = [
                'الطابع الزمني',
                'اسم الموظف',
                'الرقم الوظيفي',
                'القسم',
                'عنوان الورشة',
                'عدد الساعات',
                'الجهة المنظمة',
                'شهادة حضور'
            ];
            sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }
        
        // 2. الحصول على الرؤوس الحالية
        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        var headerMap = getHeaderMap(headers);
        
        // 3. تجهيز الصف الجديد
        var newRow = [];
        var timestamp = new Date();
        
        // إنشاء صف بنفس طول الرؤوس
        for (var i = 0; i < headers.length; i++) {
            newRow.push('');
        }
        
        // تعبئة البيانات حسب الأعمدة
        var columnMappings = {
            'الطابع الزمني': timestamp,
            'اسم الموظف': data.employeeName || '',
            'الرقم الوظيفي': data.employeeId || '',
            'القسم': data.department || '',
            'عنوان الورشة': data.workshopTitle || '',
            'عدد الساعات': data.hours || 0,
            'الجهة المنظمة': data.organizer || '',
            'شهادة حضور': data.certificate || 'لا'
        };
        
        // وضع البيانات في الأعمدة الصحيحة
        for (var key in columnMappings) {
            if (headerMap[key] !== undefined) {
                newRow[headerMap[key]] = columnMappings[key];
            }
        }
        
        // 4. إضافة الصف إلى الجدول
        sheet.appendRow(newRow);
        
        return {
            status: 'success',
            message: 'تم تسجيل الورشة بنجاح',
            data: {
                timestamp: timestamp.toISOString(),
                ...data
            }
        };
        
    } catch (error) {
        return {
            status: 'error',
            message: error.toString()
        };
    }
}

// ============================================
// GET DASHBOARD DATA - قراءة جميع البيانات
// ============================================
function getDashboardData() {
    try {
        // 1. الحصول على البيانات من الجدول
        var sheet = getSheet(SHEET_NAME);
        if (!sheet) {
            return {
                status: 'error',
                message: 'لم يتم العثور على ورقة البيانات. يرجى التأكد من وجود ورقة باسم "' + SHEET_NAME + '"'
            };
        }
        
        var data = sheet.getDataRange().getValues();
        if (data.length < 2) {
            return {
                status: 'error',
                message: 'لا توجد بيانات كافية في الجدول'
            };
        }
        
        // 2. قراءة الرؤوس وتحديد مواقع الأعمدة
        var headers = data[0];
        var headerMap = getHeaderMap(headers);
        var columnIndexes = findColumnIndexes(headers);
        
        // 3. معالجة البيانات
        var result = processData(data, columnIndexes, headerMap);
        
        return {
            status: 'success',
            data: result
        };
        
    } catch (error) {
        return {
            status: 'error',
            message: error.toString()
        };
    }
}

// ============================================
// GET SHEET - الحصول على الورقة
// ============================================
function getSheet(sheetName) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        // البحث عن أي ورقة تحتوي على بيانات
        var sheets = ss.getSheets();
        for (var i = 0; i < sheets.length; i++) {
            if (sheets[i].getLastRow() > 0) {
                return sheets[i];
            }
        }
        return null;
    }
    return sheet;
}

// ============================================
// GET HEADER MAP - خريطة الرؤوس
// ============================================
function getHeaderMap(headers) {
    var map = {};
    for (var i = 0; i < headers.length; i++) {
        var header = String(headers[i]).trim();
        map[header] = i;
        // إضافة المرادفات
        for (var key in COLUMN_CONFIG) {
            var possibleNames = COLUMN_CONFIG[key];
            for (var j = 0; j < possibleNames.length; j++) {
                if (header === possibleNames[j] || header.toLowerCase() === possibleNames[j].toLowerCase()) {
                    map[key] = i;
                }
            }
        }
    }
    return map;
}

// ============================================
// FIND COLUMN INDEXES - البحث عن الأعمدة
// ============================================
function findColumnIndexes(headers) {
    var indexes = {};
    var headerStrings = headers.map(function(h) {
        return String(h).trim().toLowerCase();
    });
    
    for (var key in COLUMN_CONFIG) {
        var possibleNames = COLUMN_CONFIG[key];
        var found = false;
        
        for (var i = 0; i < possibleNames.length; i++) {
            var searchName = possibleNames[i].toLowerCase();
            for (var j = 0; j < headerStrings.length; j++) {
                if (headerStrings[j] === searchName || 
                    headerStrings[j].includes(searchName) || 
                    searchName.includes(headerStrings[j])) {
                    indexes[key] = j;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        
        if (!found) {
            indexes[key] = -1;
        }
    }
    
    return indexes;
}

// ============================================
// PROCESS DATA - معالجة البيانات
// ============================================
function processData(data, columnIndexes, headerMap) {
    var employeeData = {};
    var departmentData = {};
    var allWorkshops = [];
    var totalHours = 0;
    var employeeHours = {};
    var lastWorkshop = null;
    var lastTimestamp = null;
    var registrationCount = {};
    var employeeFirstDate = {};
    var employeeLastDate = {};
    
    // بدء المعالجة من الصف الثاني (بعد الرؤوس)
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        
        // قراءة البيانات مع التحقق من وجود العمود
        var empName = getValue(row, columnIndexes.employeeName);
        var dept = getValue(row, columnIndexes.department);
        var workshop = getValue(row, columnIndexes.workshopTitle);
        var hours = parseFloat(getValue(row, columnIndexes.hours)) || 0;
        var timestamp = getValue(row, columnIndexes.date);
        var organizer = getValue(row, columnIndexes.organizer);
        var certificate = getValue(row, columnIndexes.certificate);
        var empId = getValue(row, columnIndexes.employeeId);
        
        // إذا لم يتم العثور على الاسم، تخطي الصف
        if (!empName) continue;
        
        // تنظيف البيانات
        empName = cleanText(empName);
        dept = cleanText(dept) || 'غير محدد';
        workshop = cleanText(workshop) || 'ورشة غير مسماة';
        
        // معالجة التاريخ
        var dateObj = parseDate(timestamp);
        var dateString = dateObj ? dateObj.toISOString() : new Date().toISOString();
        
        // ============================================
        // تجميع بيانات الموظفين
        // ============================================
        if (!employeeData[empName]) {
            employeeData[empName] = {
                name: empName,
                department: dept,
                employeeId: empId,
                workshops: 0,
                totalHours: 0,
                firstRegistration: dateString,
                lastRegistration: dateString,
                workshopsList: [],
                certificates: 0
            };
            employeeFirstDate[empName] = dateObj;
            employeeLastDate[empName] = dateObj;
        }
        
        // تحديث بيانات الموظف
        employeeData[empName].workshops += 1;
        employeeData[empName].totalHours += hours;
        if (dateObj) {
            if (!employeeFirstDate[empName] || dateObj < employeeFirstDate[empName]) {
                employeeFirstDate[empName] = dateObj;
            }
            if (!employeeLastDate[empName] || dateObj > employeeLastDate[empName]) {
                employeeLastDate[empName] = dateObj;
            }
        }
        if (certificate && (certificate.toLowerCase() === 'نعم' || certificate.toLowerCase() === 'yes')) {
            employeeData[empName].certificates += 1;
        }
        
        // تسجيل الورشة في قائمة الموظف
        employeeData[empName].workshopsList.push({
            workshop: workshop,
            hours: hours,
            date: dateString,
            organizer: organizer,
            certificate: certificate
        });
        
        // ============================================
        // تجميع بيانات الأقسام
        // ============================================
        if (!departmentData[dept]) {
            departmentData[dept] = {
                name: dept,
                workshops: 0,
                totalHours: 0,
                employees: new Set(),
                employeesList: []
            };
        }
        departmentData[dept].workshops += 1;
        departmentData[dept].totalHours += hours;
        departmentData[dept].employees.add(empName);
        if (!departmentData[dept].employeesList.includes(empName)) {
            departmentData[dept].employeesList.push(empName);
        }
        
        // ============================================
        // الإحصائيات العامة
        // ============================================
        totalHours += hours;
        if (!employeeHours[empName]) employeeHours[empName] = 0;
        employeeHours[empName] += hours;
        
        // تسجيل الورشة في القائمة العامة
        allWorkshops.push({
            employee: empName,
            department: dept,
            workshop: workshop,
            hours: hours,
            date: dateString,
            organizer: organizer,
            certificate: certificate,
            employeeId: empId
        });
        
        // ============================================
        // آخر ورشة مسجلة
        // ============================================
        if (dateObj && (!lastTimestamp || dateObj > lastTimestamp)) {
            lastTimestamp = dateObj;
            lastWorkshop = {
                employee: empName,
                department: dept,
                workshop: workshop,
                hours: hours,
                date: dateString,
                organizer: organizer
            };
        }
        
        // ============================================
        // حساب سرعة التسجيل (عدد التسجيلات في اليوم)
        // ============================================
        if (dateObj) {
            var dateKey = dateObj.toDateString();
            if (!registrationCount[empName]) registrationCount[empName] = {};
            if (!registrationCount[empName][dateKey]) registrationCount[empName][dateKey] = 0;
            registrationCount[empName][dateKey] += 1;
        }
    }
    
    // ============================================
    // حساب الموظف الأسرع تسجيلاً
    // ============================================
    var fastestEmployee = null;
    var maxRegistrationsInDay = 0;
    
    for (var emp in registrationCount) {
        var dates = registrationCount[emp];
        for (var date in dates) {
            if (dates[date] > maxRegistrationsInDay) {
                maxRegistrationsInDay = dates[date];
                fastestEmployee = emp;
            }
        }
    }
    
    // ============================================
    // ترتيب أفضل الموظفين
    // ============================================
    var sortedEmployees = Object.values(employeeData)
        .sort(function(a, b) {
            if (b.workshops !== a.workshops) return b.workshops - a.workshops;
            return b.totalHours - a.totalHours;
        })
        .map(function(emp, index) {
            var badge = getBadge(emp.workshops);
            var avgHours = emp.workshops > 0 ? (emp.totalHours / emp.workshops) : 0;
            var firstDate = employeeFirstDate[emp.name];
            var lastDate = employeeLastDate[emp.name];
            var period = 'غير محدد';
            if (firstDate && lastDate) {
                var diffDays = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24));
                if (diffDays === 0) period = 'في نفس اليوم';
                else if (diffDays < 7) period = diffDays + ' أيام';
                else if (diffDays < 30) period = Math.floor(diffDays / 7) + ' أسابيع';
                else period = Math.floor(diffDays / 30) + ' أشهر';
            }
            
            return {
                name: emp.name,
                department: emp.department,
                employeeId: emp.employeeId,
                workshops: emp.workshops,
                totalHours: Math.round(emp.totalHours * 10) / 10,
                avgHoursPerWorkshop: Math.round(avgHours * 10) / 10,
                certificates: emp.certificates,
                firstRegistration: emp.firstRegistration,
                lastRegistration: emp.lastRegistration,
                period: period,
                rank: index + 1,
                badge: badge,
                workshopsList: emp.workshopsList.slice(0, 5)
            };
        });
    
    // ============================================
    // ترتيب الأقسام
    // ============================================
    var sortedDepartments = Object.values(departmentData)
        .sort(function(a, b) {
            return b.workshops - a.workshops;
        })
        .map(function(dept, index) {
            var avgHours = dept.employees.size > 0 ? (dept.totalHours / dept.employees.size) : 0;
            return {
                name: dept.name,
                workshops: dept.workshops,
                totalHours: Math.round(dept.totalHours * 10) / 10,
                employees: dept.employees.size,
                avgHoursPerEmployee: Math.round(avgHours * 10) / 10,
                rank: index + 1,
                employeesList: dept.employeesList
            };
        });
    
    // ============================================
    // حساب مؤشرات الأداء (KPIs)
    // ============================================
    var currentDate = new Date();
    var currentMonth = currentDate.getMonth();
    var currentYear = currentDate.getFullYear();
    
    var monthlyWorkshops = allWorkshops.filter(function(w) {
        try {
            var d = new Date(w.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        } catch {
            return false;
        }
    });
    
    var yearlyWorkshops = allWorkshops.filter(function(w) {
        try {
            var d = new Date(w.date);
            return d.getFullYear() === currentYear;
        } catch {
            return false;
        }
    });
    
    var totalEmployees = Object.keys(employeeData).length;
    var avgHoursPerEmployee = totalEmployees > 0 ? (totalHours / totalEmployees) : 0;
    
    // ============================================
    // أفضل 3 موظفين مع تفاصيل إضافية
    // ============================================
    var top3Employees = sortedEmployees.slice(0, 3).map(function(emp, index) {
        var medals = ['🥇', '🥈', '🥉'];
        return {
            ...emp,
            medal: medals[index] || '🏅'
        };
    });
    
    // ============================================
    // النتيجة النهائية
    // ============================================
    return {
        summary: {
            totalWorkshops: allWorkshops.length,
            totalHours: Math.round(totalHours * 10) / 10,
            totalEmployees: totalEmployees,
            avgHoursPerEmployee: Math.round(avgHoursPerEmployee * 10) / 10,
            monthlyWorkshops: monthlyWorkshops.length,
            yearlyWorkshops: yearlyWorkshops.length,
            activeDepartments: Object.keys(departmentData).length
        },
        topEmployees: top3Employees,
        allEmployees: sortedEmployees,
        topDepartments: sortedDepartments.slice(0, 5),
        allDepartments: sortedDepartments,
        fastestEmployee: fastestEmployee ? {
            name: fastestEmployee,
            registrationsInDay: maxRegistrationsInDay,
            details: employeeData[fastestEmployee] || {}
        } : null,
        lastWorkshop: lastWorkshop,
        recentWorkshops: allWorkshops.slice(-20).reverse(),
        allWorkshops: allWorkshops,
        lastUpdated: new Date().toLocaleString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getValue(row, index) {
    if (index >= 0 && index < row.length) {
        return row[index] || '';
    }
    return '';
}

function cleanText(text) {
    if (!text) return '';
    return String(text).trim();
}

function parseDate(value) {
    if (!value) return null;
    try {
        var date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }
        if (typeof value === 'number') {
            var excelDate = new Date((value - 25569) * 86400 * 1000);
            if (!isNaN(excelDate.getTime())) {
                return excelDate;
            }
        }
        return null;
    } catch {
        return null;
    }
}

function getBadge(count) {
    if (count >= 100) return { emoji: '🏆', name: 'Legend', color: '#ff6b6b', level: 7 };
    if (count >= 50) return { emoji: '👑', name: 'Champion', color: '#ffd700', level: 6 };
    if (count >= 30) return { emoji: '💎', name: 'Platinum', color: '#e5e4e2', level: 5 };
    if (count >= 20) return { emoji: '🥇', name: 'Gold', color: '#ffd700', level: 4 };
    if (count >= 10) return { emoji: '🥈', name: 'Silver', color: '#c0c0c0', level: 3 };
    if (count >= 5) return { emoji: '🥉', name: 'Bronze', color: '#cd7f32', level: 2 };
    return { emoji: '🌟', name: 'Beginner', color: '#4fc3f7', level: 1 };
}

// ============================================
// TEST FUNCTIONS
// ============================================

function testAPI() {
    var result = getDashboardData();
    Logger.log(JSON.stringify(result, null, 2));
    return result;
}

function testAddRecord() {
    var testData = {
        employeeName: 'موظف تجريبي',
        employeeId: '123456789',
        department: 'التجربة',
        workshopTitle: 'ورشة تجريبية',
        hours: 8,
        organizer: 'نظام التجربة',
        certificate: 'نعم'
    };
    var result = addWorkshopRecord(testData);
    Logger.log(JSON.stringify(result, null, 2));
    return result;
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

function exportEmployeesReport() {
    var data = getDashboardData();
    if (data.status !== 'success') {
        throw new Error('Failed to get data');
    }
    
    var employees = data.data.allEmployees || [];
    var ss = SpreadsheetApp.create('تقرير الموظفين - BTH');
    var sheet = ss.getActiveSheet();
    
    var headers = ['الترتيب', 'اسم الموظف', 'القسم', 'الرقم المدني', 'عدد الورش', 
                   'إجمالي الساعات', 'متوسط الساعات/ورشة', 'الشارة', 'أول تسجيل', 'آخر تسجيل'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    var rows = employees.map(function(emp, index) {
        return [
            index + 1,
            emp.name,
            emp.department,
            emp.employeeId || '',
            emp.workshops,
            emp.totalHours,
            emp.avgHoursPerWorkshop || 0,
            emp.badge.emoji + ' ' + emp.badge.name,
            emp.firstRegistration || '',
            emp.lastRegistration || ''
        ];
    });
    
    if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
    
    sheet.autoResizeColumns(1, headers.length);
    return ss.getUrl();
}