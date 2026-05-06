// 試算表 ID，請換成你自己的 Sheets ID
const SPREADSHEET_ID = '1iNtYBr9IA4KG36bPg9NDGXgI7bmTS_fDQbWAaCy-dlA';

const SHEET_NAMES = {
  TEACHERS: 'Teachers',
  COURSES: 'Courses',
  TEACHER_SKILLS: 'TeacherSkills',
  REGULAR_AVAILABILITY: 'RegularAvailability',
  CAMP_AVAILABILITY: 'CampAvailability',
  SESSIONS: 'Sessions'
};

/**
 * 取得指定工作表
 * @param {String} sheetName 工作表名稱
 * @returns {Sheet} Google Sheets 工作表物件
 */
function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(sheetName);
}

/**
 * 取得工作表所有資料（排除第一列欄位名稱）
 * @param {String} sheetName 工作表名稱
 * @returns {Object[]} 資料陣列
 */
function getAllRows(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => obj[header] = row[i]);
    return obj;
  });
}

/**
 * 新增一列資料到工作表
 * @param {String} sheetName 工作表名稱
 * @param {Object} rowData 要新增的資料物件
 */
function appendRow(sheetName, rowData) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => rowData[header] || '');
  sheet.appendRow(row);
}

/**
 * 更新指定 id 的那列資料
 * @param {String} sheetName 工作表名稱
 * @param {String} id 要更新的資料 id
 * @param {Object} newData 新的資料物件
 * @returns {Boolean} 是否成功
 */
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

// --- Teachers ---
function getTeachers() {
  return getAllRows(SHEET_NAMES.TEACHERS);
}

function createTeacher(payload) {
  const row = {
    id: generateUUID(),
    name: payload.name || '',
    email: payload.email || '',
    phone: payload.phone || '',
    line_id: payload.line_id || '',
    status: 'active',
    created_at: getCurrentTimestamp()
  };
  appendRow(SHEET_NAMES.TEACHERS, row);
  return row;
}

function updateTeacher(payload) {
  return updateRowById(SHEET_NAMES.TEACHERS, payload.id, payload);
}

// --- Courses ---
function getCourses() {
  return getAllRows(SHEET_NAMES.COURSES);
}

function createCourse(payload) {
  const row = {
    id: generateUUID(),
    name: payload.name || '',
    status: 'active',
    created_at: getCurrentTimestamp()
  };
  appendRow(SHEET_NAMES.COURSES, row);
  return row;
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
  const sheet = getSheet(SHEET_NAMES.TEACHER_SKILLS);
  const all = getAllRows(SHEET_NAMES.TEACHER_SKILLS);
  const teacherId = payload.teacher_id;
  const courseIds = payload.course_ids || [];

  // 取得現有的技能
  const existing = all.filter(row => row.teacher_id === teacherId);
  const existingCourseIds = existing.map(row => row.course_id);

  // 新增不存在的技能
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
    status: 'planned',
    note: payload.note || ''
  };
  appendRow(SHEET_NAMES.SESSIONS, row);
  return row;
}

function updateSession(payload) {
  return updateRowById(SHEET_NAMES.SESSIONS, payload.id, payload);
}