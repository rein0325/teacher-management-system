/**
 * 處理 OPTIONS 預檢請求（解決 CORS 問題）
 * 瀏覽器在發送 POST 前會先發一個 OPTIONS 請求確認是否允許
 */
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * 統一成功回應格式，並加上 CORS header
 * @param {*} data 回傳資料
 * @returns {TextOutput} JSON 回應
 */
function successResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify({ success: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * 統一失敗回應格式
 * @param {String} message 錯誤訊息
 * @returns {TextOutput} JSON 回應
 */
function errorResponse(message) {
  const output = ContentService
    .createTextOutput(JSON.stringify({ success: false, error: message }))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * 處理 POST 請求，作為 API 路由入口
 * @param {Object} e Apps Script 事件物件
 * @returns {TextOutput} JSON 回應
 */
function doPost(e) {
  try {
    // 解析前端傳來的 JSON 資料
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const payload = request.payload || {};

    // 根據 action 決定呼叫哪個函式
    switch (action) {
      // 講師相關
      case 'getTeachers':
        return successResponse(getTeachers());
      case 'createTeacher':
        return successResponse(createTeacher(payload));
      case 'updateTeacher':
        return successResponse(updateTeacher(payload));

      // 課程相關
      case 'getCourses':
        return successResponse(getCourses());
      case 'createCourse':
        return successResponse(createCourse(payload));

      // 講師技能相關
      case 'getTeacherSkills':
        return successResponse(getTeacherSkills(payload));
      case 'setTeacherSkills':
        return successResponse(setTeacherSkills(payload));

      // 可上班時間相關
      case 'getAvailability':
        return successResponse(getAvailability(payload));
      case 'createAvailability':
        return successResponse(createAvailability(payload));

      // 開課紀錄相關
      case 'getSessions':
        return successResponse(getSessions());
      case 'createSession':
        return successResponse(createSession(payload));
      case 'updateSession':
        return successResponse(updateSession(payload));

      // 找不到對應的 action
      default:
        return errorResponse('未知的 action：' + action);
    }
  } catch (err) {
    // 捕捉所有錯誤，回傳錯誤訊息
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