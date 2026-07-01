// ============================================
// Bidiya Hospital Training Hub - API
// Developed by JOUHARAH.IT
// ============================================
// ============================================
// دالة المزامنة الجماعية
// ============================================

function syncWorkshops(data) {
    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
        if (!sheet) {
            var ss = SpreadsheetApp.getActiveSpreadsheet();
            sheet = ss.insertSheet("Form Responses 1");
            var headers = ['الطابع الزمني', 'الرقم الوظيفي', 'اسم الموظف', 'القسم', 'عنوان الورشة', 'عدد الساعات', 'الجهة المنظمة', 'شهادة حضور', 'تاريخ الورشة'];
            sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }
        
        // إضافة جميع الورش الجديدة
        var addedCount = 0;
        for (var i = 0; i < data.length; i++) {
            var w = data[i];
            var row = [
                w.timestamp || new Date(),
                w.employeeId || '',
                w.employeeName || '',
                w.department || '',
                w.workshopTitle || '',
                w.hours || 0,
                w.organizer || '',
                w.certificate || 'لا',
                w.workshopDate || ''
            ];
            sheet.appendRow(row);
            addedCount++;
        }
        
        return {
            status: 'success',
            message: 'تمت المزامنة بنجاح',
            added: addedCount
        };
        
    } catch (error) {
        return {
            status: 'error',
            message: error.toString()
        };
    }
}
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

function doPost(e) {
    try {
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
}

function getDashboardData() {
    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
        if (!sheet) {
            var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
            for (var i = 0; i < sheets.length; i++) {
                if (sheets[i].getLastRow() > 1) {
                    sheet = sheets[i];
                    break;
                }
            }
            if (!sheet) throw new Error("لم يتم العثور على ورقة بيانات");
        }
        
        var data = sheet.getDataRange().getValues();
        if (data.length < 2) throw new Error("لا توجد بيانات كافية");
        
        var headers = data[0];
        var nameIndex = -1, deptIndex = -1, workshopIndex = -1;
        var hoursIndex = -1, dateIndex = -1, organizerIndex = -1;
        
        for (var i = 0; i < headers.length; i++) {
            var header = String(headers[i]).trim();
            if (header.indexOf('اسم الموظف') !== -1 || header.indexOf('Employee Name') !== -1) nameIndex = i;
            if (header.indexOf('القسم') !== -1 || header.indexOf('Department') !== -1) deptIndex = i;
            if (header.indexOf('عنوان الورشة') !== -1 || header.indexOf('Workshop Title') !== -1) workshopIndex = i;
            if (header.indexOf('عدد الساعات') !== -1 || header.indexOf('Hours') !== -1) hoursIndex = i;
            if (header.indexOf('الطابع الزمني') !== -1 || header.indexOf('Timestamp') !== -1) dateIndex = i;
            if (header.indexOf('الجهة المنظمة') !== -1 || header.indexOf('Organizer') !== -1) organizerIndex = i;
        }
        
        var employees = {};
        var totalWorkshops = 0;
        var totalHours = 0;
        var allWorkshops = [];
        var lastWorkshop = null;
        
        for (var i = 1; i < data.length; i++) {
            var row = data[i];
            var empName = nameIndex >= 0 ? String(row[nameIndex] || '').trim() : '';
            if (!empName) continue;
            
            var dept = deptIndex >= 0 ? String(row[deptIndex] || 'غير محدد').trim() : 'غير محدد';
            var workshop = workshopIndex >= 0 ? String(row[workshopIndex] || 'ورشة غير مسماة').trim() : 'ورشة غير مسماة';
            var hours = hoursIndex >= 0 ? parseFloat(row[hoursIndex]) || 0 : 0;
            var date = dateIndex >= 0 ? row[dateIndex] : new Date();
            var organizer = organizerIndex >= 0 ? String(row[organizerIndex] || '').trim() : '';
            
            if (!employees[empName]) {
                employees[empName] = {
                    name: empName,
                    department: dept,
                    workshops: 0,
                    totalHours: 0
                };
            }
            
            employees[empName].workshops += 1;
            employees[empName].totalHours += hours;
            totalWorkshops += 1;
            totalHours += hours;
            
            allWorkshops.push({
                employee: empName,
                department: dept,
                workshop: workshop,
                hours: hours,
                date: date,
                organizer: organizer
            });
            
            if (!lastWorkshop || (date && date > lastWorkshop.date)) {
                lastWorkshop = {
                    employee: empName,
                    department: dept,
                    workshop: workshop,
                    hours: hours,
                    date: date,
                    organizer: organizer
                };
            }
        }
        
        var sortedEmployees = Object.values(employees)
            .sort(function(a, b) { return b.workshops - a.workshops; })
            .slice(0, 3)
            .map(function(emp, index) {
                var medals = ['🥇', '🥈', '🥉'];
                return {
                    name: emp.name,
                    department: emp.department,
                    workshops: emp.workshops,
                    totalHours: emp.totalHours,
                    medal: medals[index] || '🏅'
                };
            });
        
        return {
            status: 'success',
            data: {
                summary: {
                    totalWorkshops: totalWorkshops,
                    totalHours: Math.round(totalHours * 10) / 10,
                    totalEmployees: Object.keys(employees).length,
                    monthlyWorkshops: totalWorkshops
                },
                topEmployees: sortedEmployees,
                topDepartments: [],
                lastWorkshop: lastWorkshop,
                recentWorkshops: allWorkshops.slice(-10).reverse(),
                allWorkshops: allWorkshops,
                lastUpdated: new Date().toLocaleString('ar-SA')
            }
        };
        
    } catch (error) {
        return {
            status: 'error',
            message: error.toString()
        };
    }
}

function addWorkshopRecord(data) {
    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
        if (!sheet) {
            var ss = SpreadsheetApp.getActiveSpreadsheet();
            sheet = ss.insertSheet("Form Responses 1");
            var headers = ['الطابع الزمني', 'اسم الموظف', 'الرقم الوظيفي', 'القسم', 'عنوان الورشة', 'عدد الساعات', 'الجهة المنظمة', 'شهادة حضور'];
            sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }
        
        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        var headerMap = {};
        for (var i = 0; i < headers.length; i++) {
            headerMap[String(headers[i]).trim()] = i;
        }
        
        var newRow = [];
        for (var i = 0; i < headers.length; i++) newRow.push('');
        
        var timestamp = new Date();
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
        
        for (var key in columnMappings) {
            if (headerMap[key] !== undefined) {
                newRow[headerMap[key]] = columnMappings[key];
            }
        }
        
        sheet.appendRow(newRow);
        
        return {
            status: 'success',
            message: 'تم تسجيل الورشة بنجاح',
            data: columnMappings
        };
        
    } catch (error) {
        return {
            status: 'error',
            message: error.toString()
        };
    }
}
