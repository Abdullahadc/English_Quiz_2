/**
 * ====== CONFIG ======
 * 1) Create a Google Sheet named "exam_scores" and a tab "Scores".
 * 2) Deploy this script as a Web App (Deploy > New deployment > type: Web app).
 *    - Execute as: Me
 *    - Who has access: Anyone with the link (you can tighten later)
 * 3) Put the deployed URL into ENDPOINT in your exam HTML.
 * 4) Change SECRET below in both places.
 */
const SHEET_NAME = 'Scores';
const SECRET = 'CHANGE_ME_TOKEN'; // <-- change this and keep it the same in your HTML

function _sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  // Ensure headers
  const headers = ['Timestamp', 'Name', 'UserID', 'Subject', 'Correct', 'Wrong', 'NotAnswered', 'TotalMarks', 'Percent', 'DurationSec', 'AnswersJSON'];
  const firstRow = sh.getRange(1, 1, 1, headers.length).getValues()[0];
  if (firstRow.filter(x => x).length === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sh;
}

function _isAuthed(e) {
  const tokenQ = (e.parameter && e.parameter.token) || null;
  const tokenH = e.postData && e.postData.type === 'application/json' ? (JSON.parse(e.postData.contents).token || null) : null;
  const tokenHeader = e && e.parameter && e.parameter.X_Exam_Token ? e.parameter.X_Exam_Token : null;
  // Also allow header via doPost only (Apps Script doesn't expose headers directly, so we rely on body or query)
  return (tokenQ === SECRET) || (tokenH === SECRET) || (tokenHeader === SECRET);
}

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Exam-Token');
}

function doPost(e) {
  const out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);
  out.setHeader('Access-Control-Allow-Origin', '*');
  out.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  out.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Exam-Token');

  try {
    if (!_isAuthed(e)) {
      out.setContent(JSON.stringify({ ok: false, error: 'Unauthorized' }));
      return out;
    }
    if (!e.postData || !e.postData.contents) {
      out.setContent(JSON.stringify({ ok: false, error: 'No body' }));
      return out;
    }
    const data = JSON.parse(e.postData.contents);

    const sh = _sheet();
    const row = [
      new Date(),
      data.name || '',
      data.userid || '',
      data.subject || '',
      Number(data.correct || 0),
      Number(data.wrong || 0),
      Number(data.notAnswered || 0),
      Number(data.totalMarks || 0),
      Number(data.percent || 0),
      Number(data.durationSec || 0),
      data.answers ? JSON.stringify(data.answers) : ''
    ];
    sh.appendRow(row);

    out.setContent(JSON.stringify({ ok: true }));
    return out;
  } catch (err) {
    out.setContent(JSON.stringify({ ok: false, error: String(err) }));
    return out;
  }
}

function doGet(e) {
  const out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);
  out.setHeader('Access-Control-Allow-Origin', '*');
  out.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  out.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Exam-Token');

  try {
    if (!_isAuthed(e)) {
      out.setContent(JSON.stringify({ ok: false, error: 'Unauthorized' }));
      return out;
    }
    const action = (e.parameter && e.parameter.action) || 'list';
    if (action === 'list') {
      const sh = _sheet();
      const last = sh.getLastRow();
      if (last < 2) {
        out.setContent(JSON.stringify({ ok: true, rows: [] }));
        return out;
      }
      const values = sh.getRange(1,1,last,11).getValues(); // headers + rows
      const [headers, ...rows] = values;
      const data = rows.map(r => Object.fromEntries(headers.map((h,i)=>[h, r[i]])));
      out.setContent(JSON.stringify({ ok: true, rows: data }));
      return out;
    } else {
      out.setContent(JSON.stringify({ ok: false, error: 'Unknown action' }));
      return out;
    }
  } catch (err) {
    out.setContent(JSON.stringify({ ok: false, error: String(err) }));
    return out;
  }
}