/**
 * 產生 UUID v4
 * @returns {String} UUID 字串
 */
function generateUUID() {
  return Utilities.getUuid();
}

/**
 * 取得目前時間的 ISO 8601 格式
 * @returns {String} 時間字串
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * 統一成功回應格式
 * @param {*} data 回傳資料
 * @returns {TextOutput} JSON 回應
 */
function successResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 統一失敗回應格式
 * @param {String} message 錯誤訊息
 * @returns {TextOutput} JSON 回應
 */
function errorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: message }))
    .setMimeType(ContentService.MimeType.JSON);
}