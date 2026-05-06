/**
 * 處理 POST 請求，作為 API 路由入口
 * @param {Object} e Apps Script 事件物件
 * @returns {TextOutput} JSON 回應
 */
function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const payload = request.payload || {};

    switch (action) {
      // Teachers
      case 'getTeachers':
        return successResponse(getTeachers());
      case 'createTeacher':
        return successResponse(createTeacher(payload));
      case 'updateTeacher':
        return successResponse(updateTeacher(payload));

      // Courses
      case 'getCourses':
        return successResponse(getCourses());
      case 'createCourse':
        return successResponse(createCourse(payload));

      // TeacherSkills
      case 'getTeacherSkills':
        return successResponse(getTeacherSkills(payload));
      case 'setTeacherSkills':
        return successResponse(setTeacherSkills(payload));

      // Availability
      case 'getAvailability':
        return successResponse(getAvailability(payload));
      case 'createAvailability':
        return successResponse(createAvailability(payload));

      // Sessions
      case 'getSessions':
        return successResponse(getSessions());
      case 'createSession':
        return successResponse(createSession(payload));
      case 'updateSession':
        return successResponse(updateSession(payload));

      default:
        return errorResponse('未知的 action：' + action);
    }
  } catch (err) {
    return errorResponse('伺服器錯誤：' + err.message);
  }
}

/**
 * 處理 GET 請求，回傳前端頁面
 * @returns {HtmlOutput} 前端頁面
 */
function doGet() {
  return HtmlService
    .createHtmlOutputFromFile('index')
    .setTitle('講師管理系統');
}