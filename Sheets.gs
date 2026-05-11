const SPREADSHEET_ID = '1iNtYBr9IA4KG36bPg9NDGXgI7bmTS_fDQbWAaCy-dlA';

const SHEET_NAMES = {
  TEACHERS: 'Teachers',
  COURSES: 'Courses',
  TEACHER_SKILLS: 'TeacherSkills',
  TEACHER_BRANCHES: 'TeacherBranches',
  REGULAR_AVAILABILITY: 'RegularAvailability',
  CAMP_AVAILABILITY: 'CampAvailability',
  SESSIONS: 'Sessions'
};

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(sheetName);
}

function getAllRows(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      let val = row[i];
      if (val instanceof Date) {
        if (val.getFullYear() === 1899) {
          // Sheets 純時間格式 → HH:mm
          const hh = String(val.getHours()).padStart(2, '0');
          const mm = String(val.getMinutes()).padStart(2, '0');
          val = `${hh}:${mm}`;
        } else {
          // 正常日期 → YYYY-MM-DD
          const yyyy = val.getFullYear();
          const mo = String(val.getMonth() + 1).padStart(2, '0');
          const dd = String(val.getDate()).padStart(2, '0');
          val = `${yyyy}-${mo}-${dd}`;
        }
      }
      obj[header] = val;
    });
    return obj;
  });
}

function appendRow(sheetName, rowData) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => rowData[header] !== undefined ? rowData[header] : '');
  sheet.appendRow(row);
}

function updateRowById(sheetName, id, newData) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === id) {
      headers.forEach((header, j) => {
        if (newData[header] !== undefined) {
          sheet.getRange(i + 1, j + 1).setValue(newData[header]);
        }
      });
      return true;
    }
  }
  return false;
}

function deleteRowById(sheetName, id) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][idIndex] === id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

// --- Teachers ---

function getTeachers() {
  return getAllRows(SHEET_NAMES.TEACHERS);
}

function createTeacher(payload) {
  const row = {
    id: generateUUID(),
    name: payload.name || '',
    id_number: payload.id_number || '',
    email: payload.email || '',
    phone: payload.phone || '',
    birthday: payload.birthday || '',
    address: payload.address || '',
    bank_code: payload.bank_code || '',
    bank_account: payload.bank_account || '',
    status: 'active',
    note: payload.note || '',
    created_at: getCurrentTimestamp()
  };
  appendRow(SHEET_NAMES.TEACHERS, row);
  return row;
}

function updateTeacher(payload) {
  return updateRowById(SHEET_NAMES.TEACHERS, payload.id, payload);
}

// --- Courses ---
// 欄位順序：id, type, name, category, branch, skill, weekday, time_start, time_end, date_start, date_end, status, created_at

function getCourses() {
  return getAllRows(SHEET_NAMES.COURSES);
}

function createCourse(payload) {
  const row = {
    id: generateUUID(),
    type: payload.type || 'regular',
    name: payload.name || '',
    category: payload.category || '',
    branch: payload.branch || '',
    skill: payload.skill || '',
    weekday: payload.weekday !== undefined ? payload.weekday : '',
    time_start: payload.type === 'regular' ? (payload.time_start || '') : '',
    time_end: payload.type === 'regular' ? (payload.time_end || '') : '',
    date_start: payload.date_start || '',
    date_end: payload.date_end || '',
    status: 'active',
    created_at: getCurrentTimestamp()
  };
  appendRow(SHEET_NAMES.COURSES, row);
  return row;
}

function updateCourse(payload) {
  return updateRowById(SHEET_NAMES.COURSES, payload.id, payload);
}

// --- TeacherSkills ---

function getTeacherSkills(payload) {
  const all = getAllRows(SHEET_NAMES.TEACHER_SKILLS);
  if (payload && payload.teacher_id) {
    return all.filter(row => row.teacher_id === payload.teacher_id);
  }
  return all;
}

function setTeacherSkills(payload) {
  const teacherId = payload.teacher_id;
  const courseIds = payload.course_ids || [];
  const all = getAllRows(SHEET_NAMES.TEACHER_SKILLS);
  const existing = all.filter(row => row.teacher_id === teacherId);
  const existingCourseIds = existing.map(row => row.course_id);
  courseIds.forEach(courseId => {
    if (!existingCourseIds.includes(courseId)) {
      appendRow(SHEET_NAMES.TEACHER_SKILLS, {
        id: generateUUID(),
        teacher_id: teacherId,
        course_id: courseId,
        note: payload.note || ''
      });
    }
  });
  return true;
}

// --- TeacherBranches ---

function getTeacherBranches(payload) {
  const all = getAllRows(SHEET_NAMES.TEACHER_BRANCHES);
  if (payload && payload.teacher_id) {
    return all.filter(row => row.teacher_id === payload.teacher_id);
  }
  return all;
}

function setTeacherBranches(payload) {
  const teacherId = payload.teacher_id;
  const branches = payload.branches || [];
  const sheet = getSheet(SHEET_NAMES.TEACHER_BRANCHES);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const teacherIdIndex = headers.indexOf('teacher_id');
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][teacherIdIndex] === teacherId) {
      sheet.deleteRow(i + 1);
    }
  }
  branches.forEach(branch => {
    appendRow(SHEET_NAMES.TEACHER_BRANCHES, {
      id: generateUUID(),
      teacher_id: teacherId,
      branch: branch
    });
  });
  return true;
}

// --- Availability ---

function getAvailability(payload) {
  const regular = getAllRows(SHEET_NAMES.REGULAR_AVAILABILITY);
  const camp = getAllRows(SHEET_NAMES.CAMP_AVAILABILITY);
  if (payload && payload.teacher_id) {
    return {
      regular: regular.filter(row => row.teacher_id === payload.teacher_id),
      camp: camp.filter(row => row.teacher_id === payload.teacher_id)
    };
  }
  return { regular, camp };
}

function createAvailability(payload) {
  if (payload.type === 'regular') {
    const row = {
      id: generateUUID(),
      teacher_id: payload.teacher_id,
      weekday: payload.weekday,
      time_start: payload.time_start,
      time_end: payload.time_end
    };
    appendRow(SHEET_NAMES.REGULAR_AVAILABILITY, row);
    return row;
  } else if (payload.type === 'camp') {
    const row = {
      id: generateUUID(),
      teacher_id: payload.teacher_id,
      date_start: payload.date_start,
      date_end: payload.date_end,
      note: payload.note || ''
    };
    appendRow(SHEET_NAMES.CAMP_AVAILABILITY, row);
    return row;
  }
  return null;
}

function deleteAvailability(payload) {
  if (payload.type === 'regular') {
    return deleteRowById(SHEET_NAMES.REGULAR_AVAILABILITY, payload.id);
  } else if (payload.type === 'camp') {
    return deleteRowById(SHEET_NAMES.CAMP_AVAILABILITY, payload.id);
  }
  return false;
}

// --- Sessions ---

function getSessions() {
  return getAllRows(SHEET_NAMES.SESSIONS);
}

function createSession(payload) {
  const row = {
    id: generateUUID(),
    type: payload.type || 'regular',
    course_id: payload.course_id || '',
    teacher_id: payload.teacher_id || '',
    date: payload.date || '',
    time_start: payload.time_start || '',
    time_end: payload.time_end || '',
    status: payload.status || 'planned',
    note: payload.note || ''
  };
  appendRow(SHEET_NAMES.SESSIONS, row);
  return row;
}

function updateSession(payload) {
  return updateRowById(SHEET_NAMES.SESSIONS, payload.id, payload);
}

// ✅ 新增：排班用 — 一次取得所有排班需要的資料
function getScheduleData() {
  return {
    courses: getAllRows(SHEET_NAMES.COURSES),
    teachers: getAllRows(SHEET_NAMES.TEACHERS),
    teacherSkills: getAllRows(SHEET_NAMES.TEACHER_SKILLS),
    teacherBranches: getAllRows(SHEET_NAMES.TEACHER_BRANCHES),
    campAvailability: getAllRows(SHEET_NAMES.CAMP_AVAILABILITY),
    sessions: getAllRows(SHEET_NAMES.SESSIONS)
  };
}

// ✅ 新增：取得所有營隊梯次清單（不重複的 category 值）
function getCampCategories() {
  const courses = getAllRows(SHEET_NAMES.COURSES);
  const categories = [...new Set(
    courses
      .filter(c => c.type === 'camp' && c.category)
      .map(c => c.category)
  )];
  return categories;
}