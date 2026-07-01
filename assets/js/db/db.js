// ============================================
// قاعدة البيانات المحلية - IndexedDB
// ============================================

// ✅ تحميل Dexie.js من CDN
// أضف هذا السطر في <head> لجميع صفحات HTML:
// <script src="https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.min.js"></script>

const db = new Dexie('BTHDatabase');

// تعريف الجداول (Tables)
db.version(1).stores({
    workshops: '++id, employeeId, employeeName, department, workshopTitle, hours, organizer, certificate, workshopDate, timestamp',
    employees: 'employeeId, name, department, workshops, totalHours',
    syncStatus: 'key'
});

// ============================================
// دوال إدارة الورش
// ============================================

// ✅ إضافة ورشة جديدة
async function addWorkshopLocal(workshop) {
    try {
        // إضافة الطابع الزمني
        workshop.timestamp = workshop.timestamp || new Date().toISOString();
        workshop.synced = false; // لم تتم مزامنتها بعد
        
        const id = await db.workshops.add(workshop);
        console.log('✅ تم حفظ الورشة محلياً:', id);
        
        // تحديث إحصائيات الموظف
        await updateEmployeeStats(workshop.employeeId);
        
        return { success: true, id: id };
    } catch (error) {
        console.error('❌ خطأ في حفظ الورشة:', error);
        return { success: false, error: error.message };
    }
}

// ✅ جلب جميع الورش
async function getAllWorkshopsLocal() {
    try {
        return await db.workshops.toArray();
    } catch (error) {
        console.error('❌ خطأ في جلب الورش:', error);
        return [];
    }
}

// ✅ جلب ورش موظف معين
async function getEmployeeWorkshopsLocal(employeeId) {
    try {
        return await db.workshops.where('employeeId').equals(employeeId).toArray();
    } catch (error) {
        console.error('❌ خطأ في جلب ورش الموظف:', error);
        return [];
    }
}

// ✅ جلب الورش حسب الفترة
async function getWorkshopsByDateLocal(startDate, endDate) {
    try {
        return await db.workshops
            .where('timestamp')
            .between(startDate, endDate)
            .toArray();
    } catch (error) {
        console.error('❌ خطأ في جلب الورش حسب التاريخ:', error);
        return [];
    }
}

// ============================================
// دوال إدارة الموظفين
// ============================================

// ✅ تحديث إحصائيات الموظف
async function updateEmployeeStats(employeeId) {
    try {
        // جلب جميع ورش الموظف
        const workshops = await db.workshops.where('employeeId').equals(employeeId).toArray();
        
        const stats = {
            employeeId: employeeId,
            name: workshops.length > 0 ? workshops[0].employeeName : '',
            department: workshops.length > 0 ? workshops[0].department : '',
            workshops: workshops.length,
            totalHours: workshops.reduce((sum, w) => sum + (w.hours || 0), 0),
            lastUpdated: new Date().toISOString()
        };
        
        await db.employees.put(stats);
        console.log('✅ تم تحديث إحصائيات الموظف:', employeeId);
        
        return stats;
    } catch (error) {
        console.error('❌ خطأ في تحديث إحصائيات الموظف:', error);
        return null;
    }
}

// ✅ جلب جميع الموظفين
async function getAllEmployeesLocal() {
    try {
        return await db.employees.toArray();
    } catch (error) {
        console.error('❌ خطأ في جلب الموظفين:', error);
        return [];
    }
}

// ✅ جلب موظف معين
async function getEmployeeLocal(employeeId) {
    try {
        return await db.employees.get(employeeId);
    } catch (error) {
        console.error('❌ خطأ في جلب الموظف:', error);
        return null;
    }
}

// ✅ جلب أفضل الموظفين (حسب عدد الورش)
async function getTopEmployeesLocal(limit = 3) {
    try {
        const employees = await db.employees
            .orderBy('workshops')
            .reverse()
            .limit(limit)
            .toArray();
        return employees;
    } catch (error) {
        console.error('❌ خطأ في جلب أفضل الموظفين:', error);
        return [];
    }
}

// ============================================
// دوال التهيئة والمزامنة
// ============================================

// ✅ تهيئة قاعدة البيانات (تحميل البيانات الأولية)
async function initializeDatabase() {
    try {
        console.log('📡 تهيئة قاعدة البيانات المحلية...');
        
        // التحقق من وجود بيانات
        const count = await db.workshops.count();
        if (count > 0) {
            console.log('✅ البيانات موجودة محلياً:', count, 'ورشة');
            return { success: true, cached: true };
        }
        
        // جلب البيانات من الخادم
        console.log('📡 جلب البيانات من الخادم...');
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
            const data = result.data;
            
            // حفظ الورش
            if (data.allWorkshops && data.allWorkshops.length > 0) {
                await db.workshops.bulkAdd(data.allWorkshops);
                console.log('✅ تم حفظ', data.allWorkshops.length, 'ورشة');
            }
            
            // حفظ الموظفين
            if (data.allEmployees && data.allEmployees.length > 0) {
                await db.employees.bulkAdd(data.allEmployees);
                console.log('✅ تم حفظ', data.allEmployees.length, 'موظف');
            }
            
            return { success: true, cached: false };
        }
        
        return { success: false, error: 'فشل في تحميل البيانات' };
    } catch (error) {
        console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
        return { success: false, error: error.message };
    }
}

// ✅ مزامنة البيانات مع الخادم (ورش غير متزامنة)
async function syncWithServer() {
    try {
        console.log('📡 بدء المزامنة مع الخادم...');
        
        // جلب الورش غير المتزامنة
        const unsynced = await db.workshops.where('synced').equals(false).toArray();
        
        if (unsynced.length === 0) {
            console.log('✅ لا توجد بيانات غير متزامنة');
            return { success: true, synced: 0 };
        }
        
        console.log('📡 جاري مزامنة', unsynced.length, 'ورشة');
        
        let syncedCount = 0;
        for (const workshop of unsynced) {
            try {
                // إرسال إلى الخادم
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(workshop)
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    // تحديث حالة المزامنة
                    await db.workshops.update(workshop.id, { synced: true });
                    syncedCount++;
                    console.log('✅ تمت مزامنة الورشة:', workshop.id);
                }
            } catch (error) {
                console.error('❌ خطأ في مزامنة الورشة:', workshop.id, error);
            }
        }
        
        console.log('✅ تمت المزامنة بنجاح:', syncedCount, 'ورشة');
        return { success: true, synced: syncedCount };
    } catch (error) {
        console.error('❌ خطأ في المزامنة:', error);
        return { success: false, error: error.message };
    }
}

// ✅ حذف جميع البيانات (لإعادة التهيئة)
async function clearDatabase() {
    try {
        await db.workshops.clear();
        await db.employees.clear();
        console.log('🗑️ تم حذف جميع البيانات');
        return { success: true };
    } catch (error) {
        console.error('❌ خطأ في حذف البيانات:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// تصدير الدوال
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addWorkshopLocal,
        getAllWorkshopsLocal,
        getEmployeeWorkshopsLocal,
        getWorkshopsByDateLocal,
        updateEmployeeStats,
        getAllEmployeesLocal,
        getEmployeeLocal,
        getTopEmployeesLocal,
        initializeDatabase,
        syncWithServer,
        clearDatabase,
        db
    };
}
// ============================================
// دوال إضافية للتحديث الفوري
// ============================================

// ✅ إضافة ورشة جديدة وإرسال إشارة تحديث
async function addWorkshopLocal(workshop) {
    try {
        workshop.timestamp = workshop.timestamp || new Date().toISOString();
        workshop.synced = false;
        
        // استخدام workshopTitle بدلاً من workshop
        if (!workshop.workshopTitle && workshop.workshop) {
            workshop.workshopTitle = workshop.workshop;
        }
        if (!workshop.employeeName && workshop.employee) {
            workshop.employeeName = workshop.employee;
        }
        
        const id = await db.workshops.add(workshop);
        console.log('✅ تم حفظ الورشة محلياً:', id);
        
        // تحديث إحصائيات الموظف
        await updateEmployeeStats(workshop.employeeId);
        
        // ✅ إرسال إشارة تحديث للصفحات الأخرى
        broadcastUpdate();
        
        return { success: true, id: id };
    } catch (error) {
        console.error('❌ خطأ في حفظ الورشة:', error);
        return { success: false, error: error.message };
    }
}

// ✅ إرسال إشارة تحديث
function broadcastUpdate() {
    try {
        // تخزين في localStorage لإعلام الصفحات الأخرى
        localStorage.setItem('bth_workshops_updated', Date.now().toString());
        
        // إرسال حدث مخصص
        const event = new CustomEvent('workshopsUpdated');
        document.dispatchEvent(event);
        
        console.log('📡 تم إرسال إشارة تحديث');
    } catch (error) {
        console.warn('⚠️ خطأ في إرسال إشارة التحديث:', error);
    }
}

// ✅ حذف ورشة (للمشرفين)
async function deleteWorkshopLocal(id) {
    try {
        await db.workshops.delete(id);
        console.log('🗑️ تم حذف الورشة:', id);
        broadcastUpdate();
        return { success: true };
    } catch (error) {
        console.error('❌ خطأ في حذف الورشة:', error);
        return { success: false, error: error.message };
    }
}
