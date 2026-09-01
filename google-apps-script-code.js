/**
 * Google Apps Script for Robo GTD Task Submissions
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Replace all existing code with this script.
 * 4. Click Deploy > Manage Deployments > Edit (or New Deployment).
 * 5. Set:
 *    - Type: Web app
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone (IMPORTANT)
 * 6. Click Deploy and copy the Web App URL if deploying a new one.
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Add headers if the sheet is blank
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Username / X Handle", "Wallet Address", "Tasks Completed"]);
      sheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#d9ead3");
    }

    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const timestamp = data.submittedAt || new Date().toISOString();
    const username = data.username || data.handle || "";
    const walletAddress = data.walletAddress || data.address || "";
    const tasks = Array.isArray(data.tasksCompleted)
      ? data.tasksCompleted.join(", ")
      : (data.tasksCompleted || "");

    // Append submission row
    sheet.appendRow([timestamp, username, walletAddress, tasks]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Submission recorded" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "active", message: "Google Apps Script webhook is running." }))
    .setMimeType(ContentService.MimeType.JSON);
}
