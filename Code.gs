/**
 * HIRE SMART AGENTS — APPS SCRIPT BACKEND
 * Google Sheets, Twilio US1 Voice/SMS, and secure Cloudflare bridge.
 */

const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '';
const TEAM_SHEET_NAME = 'HSA Team';
const LEADS_SHEET_NAME = 'Leads - To Call';
const SMS_LOG_SHEET_NAME = 'SMS Log';
const ACTIVITY_SHEET_NAME = 'HSA Activity';
const DNC_SHEET_NAME = 'Do Not Call';
const CONNECTOR_PROPERTY = 'HSA_CONNECTORS';
const TWIML_APP_SID = PropertiesService.getScriptProperties().getProperty('TWIML_APP_SID') || '';
const TWILIO_REGION = 'us1';
const TWILIO_API_HOST = 'api.sydney.au1.twilio.com';
const TWILIO_MESSAGING_API_HOST = 'api.twilio.com';
const TOKEN_LIFETIME_SECONDS = 3600;
const SMS_MAX_LENGTH = 1500;

function doGet() {
  return ContentService.createTextOutput('Hire Smart Agents backend is running.');
}

function doPost(e) {
  try {
    if (isBridgeRequest_(e)) return handleBridgeRequest_(e);
    return handleTwilioVoiceWebhook_(e);
  } catch (error) {
    console.error('doPost error:', error);
    return twimlHangup_();
  }
}

/* ========================= CLOUDFLARE BRIDGE ========================= */

function isBridgeRequest_(e) {
  return Boolean(
    e && e.postData &&
    String(e.postData.type || '').toLowerCase().indexOf('application/json') === 0
  );
}

function handleBridgeRequest_(e) {
  try {
    const request = JSON.parse(e.postData.contents || '{}');
    const savedSecret = cleanText_(
      PropertiesService.getScriptProperties().getProperty('HSA_BRIDGE_SECRET')
    );

    if (!savedSecret || savedSecret.length < 24) {
      throw new Error('HSA_BRIDGE_SECRET is missing or too short.');
    }

    if (!constantTimeEqual_(cleanText_(request.bridgeSecret), savedSecret)) {
      return jsonOutput_({ ok: false, error: 'Bridge access denied.' });
    }

    const action = cleanText_(request.action);
    const data = request.data && typeof request.data === 'object' ? request.data : {};
    let result;

    switch (action) {
      case 'login':
        result = checkLogin(data.username, data.password);
        break;
      case 'getLeads':
        requireEmployee_(data.username);
        result = getLeads();
        break;
      case 'getTwilioToken':
        result = getTwilioToken(data.username);
        break;
      case 'saveCall':
        result = saveCall(
          data.rowNumber, data.outcome, data.notes,
          data.callbackDate, data.username, data.callDurationSeconds
        );
        break;
      case 'saveManualCall':
        result = saveManualCall(
          data.phoneNumber, data.businessName, data.outcome,
          data.notes, data.callbackDate, data.username, data.callDurationSeconds
        );
        break;
      case 'sendCustomSms':
        result = sendCustomSms(
          data.phoneNumber, data.message, data.username, data.leadRow
        );
        break;
      case 'sendAppointmentSms':
        result = sendAppointmentSms(
          data.phoneNumber, data.contactName, data.appointmentDate,
          data.appointmentTime, data.username, data.leadRow
        );
        break;
      case 'getIncomingSms':
        result = getIncomingSms(data.username);
        break;
      case 'getMissedCalls':
        result = getMissedCalls(data.username);
        break;
      case 'getCrmOverview':
        result = getCrmOverview(data.username);
        break;
      case 'getFollowUps':
        result = getFollowUps(data.username);
        break;
      case 'getActivity':
        result = getActivity(data.username, data.phoneNumber, data.limit);
        break;
      case 'getDnc':
        result = getDnc(data.username);
        break;
      case 'setDnc':
        result = setDnc(data.phoneNumber, data.blocked, data.reason, data.username);
        break;
      case 'checkDnc':
        result = checkDnc(data.phoneNumber, data.username);
        break;
      case 'findDuplicates':
        result = findDuplicates(data.username);
        break;
      case 'getConnectors':
        result = getConnectors(data.username);
        break;
      case 'saveConnector':
        result = saveConnector(data.connector, data.username);
        break;
      case 'deleteConnector':
        result = deleteConnector(data.id, data.username);
        break;
      case 'testConnector':
        result = testConnector(data.id, data.username);
        break;
      default:
        throw new Error('Unsupported bridge action.');
    }

    return jsonOutput_({ ok: true, result: result });
  } catch (error) {
    console.error('Bridge error:', error);
    return jsonOutput_({ ok: false, error: error.message || 'Bridge request failed.' });
  }
}

function jsonOutput_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function constantTimeEqual_(a, b) {
  a = String(a || '');
  b = String(b || '');
  let mismatch = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    mismatch |= (a.charCodeAt(i % Math.max(a.length, 1)) || 0) ^
      (b.charCodeAt(i % Math.max(b.length, 1)) || 0);
  }
  return mismatch === 0;
}

/* ================================ LOGIN ================================ */

function checkLogin(username, password) {
  try {
    const enteredUsername = cleanText_(username);
    const enteredPassword = String(password == null ? '' : password);
    if (!enteredUsername || !enteredPassword) {
      return { success: false, message: 'Enter your username and password.' };
    }

    const employee = findEmployee_(enteredUsername);
    if (!employee || employee.password !== enteredPassword) {
      return { success: false, message: 'Incorrect username or password.' };
    }

    return {
      success: true,
      username: employee.username,
      employeeName: employee.employeeName,
      name: employee.employeeName,
      role: employee.role,
      message: 'Login successful.'
    };
  } catch (error) {
    console.error('checkLogin error:', error);
    return { success: false, message: 'Unable to check login. Please try again.' };
  }
}

/* ================================ LEADS ================================ */

function getLeads() {
  const sheet = getLeadSheet_();
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < 2 || lastColumn < 1) return [];

  const values = sheet.getRange(1, 1, lastRow, lastColumn).getDisplayValues();
  const headers = values[0].map(cleanText_);
  const calledColumn = findHeaderIndex_(headers, ['Called?', 'Called', 'Call Completed']);
  if (calledColumn === -1) throw new Error('The leads sheet is missing the "Called?" column.');

  const completedValues = ['yes', 'y', 'true', 'called', 'completed', 'done'];
  const leads = [];
  for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
    const row = values[rowIndex];
    if (isEmptyRow_(row)) continue;
    if (completedValues.indexOf(normalizeHeader_(row[calledColumn])) !== -1) continue;

    const lead = { _row: rowIndex + 1 };
    headers.forEach(function(header, columnIndex) {
      if (header) lead[header] = row[columnIndex];
    });
    leads.push(lead);
  }
  return leads;
}

function saveCall(rowNumber, outcome, notes, callbackDate, username, callDurationSeconds) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const employee = requireEmployee_(username);
    const sheet = getLeadSheet_();
    const row = Number(rowNumber);
    const cleanOutcome = cleanText_(outcome);
    if (!Number.isInteger(row) || row < 2 || row > sheet.getLastRow()) {
      throw new Error('The selected lead row is invalid.');
    }
    if (!cleanOutcome) throw new Error('Select a call outcome before saving.');

    const headers = getHeaders_(sheet);
    const calledColumn = requireHeader_(headers, ['Called?', 'Called', 'Call Completed'], 'Called?');
    const outcomeColumn = requireHeader_(headers, ['Call Outcome', 'Outcome'], 'Call Outcome');
    const notesColumn = requireHeader_(headers, ['Notes', 'Call Notes'], 'Notes');
    const callbackColumn = requireHeader_(headers, ['Next Follow-up', 'Next Follow Up', 'Callback Date', 'Follow-up'], 'Next Follow-up');
    const calledByColumn = requireHeader_(headers, ['Called By', 'Caller', 'Employee'], 'Called By');
    const durationColumn = findHeaderIndex_(headers, ['Call Duration', 'Call Duration Seconds', 'Duration']);
    const durationSeconds = normalizeCallDuration_(callDurationSeconds);

    const existingCalled = normalizeHeader_(sheet.getRange(row, calledColumn + 1).getDisplayValue());
    const existingCalledBy = cleanText_(sheet.getRange(row, calledByColumn + 1).getDisplayValue());
    if (existingCalled === 'yes' && existingCalledBy &&
        normalizeHeader_(existingCalledBy) !== normalizeHeader_(employee.username)) {
      throw new Error('This lead has already been completed by ' + existingCalledBy + '.');
    }

    sheet.getRange(row, calledColumn + 1).setValue('Yes');
    sheet.getRange(row, outcomeColumn + 1).setValue(cleanOutcome);
    sheet.getRange(row, notesColumn + 1).setValue(cleanText_(notes));
    sheet.getRange(row, calledByColumn + 1).setValue(employee.username);
    if (durationColumn !== -1) sheet.getRange(row, durationColumn + 1).setValue(formatCallDuration_(durationSeconds));
    setCallbackDate_(sheet, row, callbackColumn + 1, callbackDate);
    SpreadsheetApp.flush();
    const phoneColumn = findHeaderIndex_(headers, ['Business Phone Number', 'Phone Number', 'Phone']);
    const businessColumn = findHeaderIndex_(headers, ['Business Name', 'Company Name']);
    const activityPhone = phoneColumn === -1 ? '' : sheet.getRange(row, phoneColumn + 1).getDisplayValue();
    const activityBusiness = businessColumn === -1 ? '' : sheet.getRange(row, businessColumn + 1).getDisplayValue();
    const activityDetails = joinCallDetails_(notes, durationSeconds);
    logActivity_('call', employee.username, activityPhone, activityBusiness, cleanOutcome, activityDetails, row);
    if (normalizeHeader_(cleanOutcome) === 'do not call' && activityPhone) {
      setDncInternal_(activityPhone, true, 'Marked Do Not Call from lead outcome', employee);
    }
    fireConnectorEvent_('call.saved', { phoneNumber: activityPhone, businessName: activityBusiness, outcome: cleanOutcome, notes: cleanText_(notes), callDurationSeconds: durationSeconds, callbackDate: cleanText_(callbackDate), username: employee.username, leadRow: row });
    return { success: true, rowNumber: row, message: 'Call saved successfully.' };
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

/* =========================== MANUAL CALL LOG =========================== */

function normalizeAustralianPhone(phoneNumber) {
  return normalizeAustralianPhone_(phoneNumber);
}

function saveManualCall(phoneNumber, businessName, outcome, notes, callbackDate, username, callDurationSeconds) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const employee = requireEmployee_(username);
    const phone = normalizeAustralianPhone_(phoneNumber);
    const cleanOutcome = cleanText_(outcome);
    if (!cleanOutcome) throw new Error('Select a call outcome before saving.');

    const sheet = getLeadSheet_();
    const headers = getHeaders_(sheet);
    const durationSeconds = normalizeCallDuration_(callDurationSeconds);
    const newRow = new Array(headers.length).fill('');
    setArrayValueByHeader_(newRow, headers, ['Business Name', 'Company Name'], cleanText_(businessName) || 'Manual Call');
    setArrayValueByHeader_(newRow, headers, ['Business Phone Number', 'Phone Number', 'Phone'], phone);
    setArrayValueByHeader_(newRow, headers, ['Called?', 'Called', 'Call Completed'], 'Yes');
    setArrayValueByHeader_(newRow, headers, ['Call Outcome', 'Outcome'], cleanOutcome);
    setArrayValueByHeader_(newRow, headers, ['Notes', 'Call Notes'], cleanText_(notes));
    setArrayValueByHeader_(newRow, headers, ['Called By', 'Caller', 'Employee'], employee.username);
    const durationColumn = findHeaderIndex_(headers, ['Call Duration', 'Call Duration Seconds', 'Duration']);
    if (durationColumn !== -1) newRow[durationColumn] = formatCallDuration_(durationSeconds);

    const callback = parseDate_(callbackDate);
    if (callback) {
      setArrayValueByHeader_(newRow, headers, ['Next Follow-up', 'Next Follow Up', 'Callback Date', 'Follow-up'], callback);
    }
    sheet.appendRow(newRow);
    const newRowNumber = sheet.getLastRow();
    const callbackColumn = findHeaderIndex_(headers, ['Next Follow-up', 'Next Follow Up', 'Callback Date', 'Follow-up']);
    if (callback && callbackColumn !== -1) {
      sheet.getRange(newRowNumber, callbackColumn + 1).setNumberFormat('yyyy-mm-dd');
    }
    SpreadsheetApp.flush();
    const activityDetails = joinCallDetails_(notes, durationSeconds);
    logActivity_('call', employee.username, phone, cleanText_(businessName) || 'Manual Call', cleanOutcome, activityDetails, newRowNumber);
    if (normalizeHeader_(cleanOutcome) === 'do not call') {
      setDncInternal_(phone, true, 'Marked Do Not Call from manual outcome', employee);
    }
    fireConnectorEvent_('call.saved', { phoneNumber: phone, businessName: cleanText_(businessName) || 'Manual Call', outcome: cleanOutcome, notes: cleanText_(notes), callDurationSeconds: durationSeconds, callbackDate: cleanText_(callbackDate), username: employee.username, leadRow: newRowNumber });
    return { success: true, rowNumber: newRowNumber, phoneNumber: phone, message: 'Manual call saved successfully.' };
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

/* ================================ SMS ================================= */

function sendCustomSms(phoneNumber, message, username, leadRow) {
  return sendSms_({
    phoneNumber: phoneNumber,
    message: message,
    username: username,
    leadRow: leadRow,
    messageType: 'Custom SMS'
  });
}

function sendSms(phoneNumber, message, username, leadRow) {
  return sendCustomSms(phoneNumber, message, username, leadRow);
}

function buildAppointmentSms(contactName, appointmentDate, appointmentTime) {
  return createAppointmentMessage_(contactName, appointmentDate, appointmentTime);
}

function sendAppointmentSms(phoneNumber, contactName, appointmentDate, appointmentTime, username, leadRow) {
  return sendSms_({
    phoneNumber: phoneNumber,
    message: createAppointmentMessage_(contactName, appointmentDate, appointmentTime),
    username: username,
    leadRow: leadRow,
    messageType: 'Appointment Confirmation'
  });
}

function createAppointmentMessage_(contactName, appointmentDate, appointmentTime) {
  const name = cleanText_(contactName);
  let message = 'Hi' + (name ? ' ' + name : '') +
    ', your appointment with Hire Smart Agents is confirmed for ' +
    formatAppointmentDate_(appointmentDate) + ' at ' +
    formatAppointmentTime_(appointmentTime) +
    '. If you need to reschedule, please reply to this message.';
  return addSmsFooter_(message);
}

function sendSms_(options) {
  const employee = requireEmployee_(options.username);
  const phone = normalizeAustralianPhone_(options.phoneNumber);
  if (isDncPhone_(phone)) throw new Error('This number is on the Do Not Call list. Remove it before sending an SMS.');
  let message = cleanText_(options.message);
  if (!message) throw new Error('Enter an SMS message.');
  message = addSmsFooter_(message);
  if (message.length > SMS_MAX_LENGTH) throw new Error('The SMS is too long.');

  const config = getTwilioConfig_();
  requireTwilioSetting_(config.accountSid, 'TWILIO_ACCOUNT_SID');
  requireTwilioSetting_(config.apiKeySid, 'TWILIO_API_KEY_SID');
  requireTwilioSetting_(config.apiKeySecret, 'TWILIO_API_KEY_SECRET');
  requireTwilioSetting_(config.callerId, 'TWILIO_CALLER_ID');
  const sender = normalizeAustralianPhone_(config.callerId);
  const endpoint = 'https://' + TWILIO_MESSAGING_API_HOST + '/2010-04-01/Accounts/' +
    encodeURIComponent(config.accountSid) + '/Messages.json';
  const authorization = Utilities.base64Encode(
    config.apiKeySid + ':' + config.apiKeySecret,
    Utilities.Charset.UTF_8
  );

  let responseData = {};
  let responseCode = 0;
  try {
    const response = UrlFetchApp.fetch(endpoint, {
      method: 'post',
      contentType: 'application/x-www-form-urlencoded',
      headers: { Authorization: 'Basic ' + authorization },
      payload: { To: phone, From: sender, Body: message },
      muteHttpExceptions: true
    });
    responseCode = response.getResponseCode();
    try { responseData = JSON.parse(response.getContentText()); }
    catch (ignore) { responseData = { message: response.getContentText() }; }
  } catch (error) {
    logSms_(employee.username, options.messageType, options.leadRow, phone, sender, message, '', 'Failed', error.message);
    throw new Error('Twilio could not be reached. Please try again.');
  }

  if (responseCode < 200 || responseCode >= 300) {
    const twilioError = cleanText_(responseData.message) || 'Twilio rejected the SMS request.';
    logSms_(employee.username, options.messageType, options.leadRow, phone, sender, message, responseData.sid, 'Failed', twilioError);
    throw new Error('SMS could not be sent: ' + twilioError);
  }

  const status = cleanText_(responseData.status) || 'queued';
  logSms_(employee.username, options.messageType, options.leadRow, phone, sender, message, responseData.sid, status, '');
  logActivity_('sms', employee.username, phone, '', options.messageType, message, options.leadRow);
  fireConnectorEvent_('sms.sent', { phoneNumber: phone, message: message, messageType: options.messageType, status: status, messageSid: cleanText_(responseData.sid), username: employee.username, leadRow: options.leadRow || '' });
  return {
    success: true,
    phoneNumber: phone,
    messageSid: cleanText_(responseData.sid),
    status: status,
    message: 'SMS sent successfully.'
  };
}

function addSmsFooter_(message) {
  let result = cleanText_(message);
  if (result.toLowerCase().indexOf('hire smart agents') === -1) result += '\n\nHire Smart Agents';
  if (result.toLowerCase().indexOf('reply stop') === -1) result += ' | Reply STOP to opt out';
  return result;
}

function logSms_(username, type, leadRow, to, from, message, sid, status, error) {
  try {
    const sheet = getOrCreateSmsLogSheet_();
    sheet.appendRow([new Date(), username, type, leadRow || '', to, from, message, sid || '', status, error || '']);
    sheet.getRange(sheet.getLastRow(), 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  } catch (logError) {
    console.error('SMS log error:', logError);
  }
}

function getOrCreateSmsLogSheet_() {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(SMS_LOG_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SMS_LOG_SHEET_NAME);
    sheet.appendRow(['Date & Time', 'Sent By', 'Message Type', 'Lead Row', 'To', 'From', 'Message', 'Twilio Message SID', 'Status', 'Error']);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#1f4e78').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getIncomingSms(username) {
  requireEmployee_(username);
  const config = getTwilioConfig_();
  const receiver = normalizeAustralianPhone_(config.callerId);
  const result = fetchTwilioList_(
    config,
    'Messages.json?To=' + encodeURIComponent(receiver) + '&PageSize=50'
  );
  return (result.messages || []).filter(function(message) {
    return normalizeHeader_(message.direction).indexOf('inbound') === 0;
  }).map(function(message) {
    return {
      sid: cleanText_(message.sid),
      from: cleanText_(message.from),
      to: cleanText_(message.to),
      body: cleanText_(message.body),
      status: cleanText_(message.status),
      receivedAt: cleanText_(message.date_sent || message.date_created),
      mediaCount: Number(message.num_media || 0)
    };
  });
}

function getMissedCalls(username) {
  requireEmployee_(username);
  const config = getTwilioConfig_();
  const receiver = normalizeAustralianPhone_(config.callerId);
  const result = fetchTwilioList_(
    config,
    'Calls.json?To=' + encodeURIComponent(receiver) + '&PageSize=50'
  );
  const missedStatuses = ['no-answer', 'busy', 'failed', 'canceled'];
  return (result.calls || []).filter(function(call) {
    return normalizeHeader_(call.direction).indexOf('inbound') === 0 &&
      missedStatuses.indexOf(normalizeHeader_(call.status)) !== -1;
  }).map(function(call) {
    return {
      sid: cleanText_(call.sid),
      from: cleanText_(call.from),
      to: cleanText_(call.to),
      status: cleanText_(call.status),
      receivedAt: cleanText_(call.start_time || call.date_created)
    };
  });
}

function fetchTwilioList_(config, resource) {
  requireTwilioSetting_(config.accountSid, 'TWILIO_ACCOUNT_SID');
  requireTwilioSetting_(config.apiKeySid, 'TWILIO_API_KEY_SID');
  requireTwilioSetting_(config.apiKeySecret, 'TWILIO_API_KEY_SECRET');
  requireTwilioSetting_(config.callerId, 'TWILIO_CALLER_ID');
  const endpoint = 'https://' + TWILIO_MESSAGING_API_HOST + '/2010-04-01/Accounts/' +
    encodeURIComponent(config.accountSid) + '/' + resource;
  const authorization = Utilities.base64Encode(
    config.apiKeySid + ':' + config.apiKeySecret,
    Utilities.Charset.UTF_8
  );
  const response = UrlFetchApp.fetch(endpoint, {
    method: 'get',
    headers: { Authorization: 'Basic ' + authorization },
    muteHttpExceptions: true
  });
  let body = {};
  try { body = JSON.parse(response.getContentText()); }
  catch (ignore) { body = { message: response.getContentText() }; }
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
    throw new Error('Twilio inbox could not be loaded: ' +
      (cleanText_(body.message) || 'Twilio rejected the request.'));
  }
  return body;
}

/* ========================= CRM AND REPORTING ========================= */

function getCrmOverview(username) {
  requireAdmin_(username);
  const sheet = getLeadSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return { total: 0, ready: 0, completed: 0, appointments: 0, dueToday: 0, overdue: 0, dnc: getDnc(username).length, duplicates: 0, activityToday: 0 };
  const headers = values[0].map(cleanText_);
  const called = findHeaderIndex_(headers, ['Called?', 'Called', 'Call Completed']);
  const outcome = findHeaderIndex_(headers, ['Call Outcome', 'Outcome']);
  const followup = findHeaderIndex_(headers, ['Next Follow-up', 'Next Follow Up', 'Callback Date', 'Follow-up']);
  const phone = findHeaderIndex_(headers, ['Business Phone Number', 'Phone Number', 'Phone']);
  const todayKey = Utilities.formatDate(new Date(), 'Australia/Sydney', 'yyyy-MM-dd');
  let total = 0, completed = 0, appointments = 0, dueToday = 0, overdue = 0;
  const phoneCounts = {};
  values.slice(1).forEach(function(row) {
    if (isEmptyRow_(row)) return;
    total++;
    const calledValue = called === -1 ? '' : normalizeHeader_(row[called]);
    if (['yes', 'y', 'true', 'called', 'completed', 'done'].indexOf(calledValue) !== -1) completed++;
    if (outcome !== -1 && normalizeHeader_(row[outcome]).indexOf('appointment') !== -1) appointments++;
    if (followup !== -1 && row[followup]) {
      const key = dateKey_(row[followup]);
      if (key === todayKey) dueToday++;
      if (key && key < todayKey) overdue++;
    }
    if (phone !== -1) {
      const duplicateKey = duplicatePhoneKey_(row[phone]);
      if (duplicateKey) phoneCounts[duplicateKey] = (phoneCounts[duplicateKey] || 0) + 1;
    }
  });
  const activityToday = getActivity(username, '', 500).filter(function(item) { return dateKey_(item.timestamp) === todayKey; }).length;
  return {
    total: total,
    ready: Math.max(total - completed, 0),
    completed: completed,
    appointments: appointments,
    dueToday: dueToday,
    overdue: overdue,
    dnc: getDnc(username).length,
    duplicates: Object.keys(phoneCounts).filter(function(key) { return phoneCounts[key] > 1; }).length,
    activityToday: activityToday
  };
}

function getFollowUps(username) {
  requireEmployee_(username);
  const sheet = getLeadSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(cleanText_);
  const followup = requireHeader_(headers, ['Next Follow-up', 'Next Follow Up', 'Callback Date', 'Follow-up'], 'Next Follow-up');
  const results = [];
  values.slice(1).forEach(function(row, index) {
    if (isEmptyRow_(row) || !row[followup]) return;
    const item = { _row: index + 2, followUpDate: dateKey_(row[followup]) };
    headers.forEach(function(header, column) { if (header) item[header] = displayCell_(row[column]); });
    results.push(item);
  });
  results.sort(function(a, b) { return a.followUpDate.localeCompare(b.followUpDate); });
  return results.slice(0, 200);
}

function getOrCreateActivitySheet_() {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(ACTIVITY_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(ACTIVITY_SHEET_NAME);
    sheet.appendRow(['Date & Time', 'Type', 'Employee', 'Phone', 'Business', 'Outcome', 'Details', 'Lead Row']);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#1f4e78').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function logActivity_(type, employee, phone, business, outcome, details, leadRow) {
  try {
    const sheet = getOrCreateActivitySheet_();
    sheet.appendRow([new Date(), cleanText_(type), cleanText_(employee), tryNormalizePhone_(phone) || cleanText_(phone), cleanText_(business), cleanText_(outcome), cleanText_(details), leadRow || '']);
    sheet.getRange(sheet.getLastRow(), 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  } catch (error) { console.error('Activity log error:', error); }
}

function getActivity(username, phoneNumber, limit) {
  requireAdmin_(username);
  const sheet = getOrCreateActivitySheet_();
  if (sheet.getLastRow() < 2) return [];
  const max = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const target = tryNormalizePhone_(phoneNumber);
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
  return rows.reverse().filter(function(row) {
    return !target || tryNormalizePhone_(row[3]) === target;
  }).slice(0, max).map(function(row) {
    return { timestamp: displayCell_(row[0]), type: cleanText_(row[1]), employee: cleanText_(row[2]), phone: cleanText_(row[3]), business: cleanText_(row[4]), outcome: cleanText_(row[5]), details: cleanText_(row[6]), leadRow: row[7] || '' };
  });
}

function getOrCreateDncSheet_() {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(DNC_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(DNC_SHEET_NAME);
    sheet.appendRow(['Phone Number', 'Reason', 'Added By', 'Date Added']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#991b1b').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getDnc(username) {
  requireAdmin_(username);
  const sheet = getOrCreateDncSheet_();
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues().map(function(row) {
    return { phoneNumber: cleanText_(row[0]), reason: cleanText_(row[1]), addedBy: cleanText_(row[2]), addedAt: displayCell_(row[3]) };
  }).filter(function(item) { return item.phoneNumber; });
}

function isDncPhone_(phoneNumber) {
  const phone = tryNormalizePhone_(phoneNumber);
  if (!phone) return false;
  const sheet = getOrCreateDncSheet_();
  if (sheet.getLastRow() < 2) return false;
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().some(function(row) { return tryNormalizePhone_(row[0]) === phone; });
}

function checkDnc(phoneNumber, username) {
  requireEmployee_(username);
  const phone = normalizeAustralianPhone_(phoneNumber);
  return { phoneNumber: phone, blocked: isDncPhone_(phone) };
}

function setDnc(phoneNumber, blocked, reason, username) {
  const employee = requireAdmin_(username);
  return setDncInternal_(phoneNumber, blocked, reason, employee);
}

function setDncInternal_(phoneNumber, blocked, reason, employee) {
  const phone = normalizeAustralianPhone_(phoneNumber);
  const sheet = getOrCreateDncSheet_();
  let rowNumber = -1;
  if (sheet.getLastRow() >= 2) {
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues();
    values.some(function(row, index) { if (tryNormalizePhone_(row[0]) === phone) { rowNumber = index + 2; return true; } return false; });
  }
  if (Boolean(blocked)) {
    if (rowNumber === -1) sheet.appendRow([phone, cleanText_(reason) || 'Opted out', employee.username, new Date()]);
    else sheet.getRange(rowNumber, 2, 1, 3).setValues([[cleanText_(reason) || 'Opted out', employee.username, new Date()]]);
    logActivity_('dnc', employee.username, phone, '', 'Blocked', cleanText_(reason), '');
    fireConnectorEvent_('contact.blocked', { phoneNumber: phone, reason: cleanText_(reason), username: employee.username });
  } else if (rowNumber !== -1) {
    sheet.deleteRow(rowNumber);
    logActivity_('dnc', employee.username, phone, '', 'Unblocked', '', '');
    fireConnectorEvent_('contact.unblocked', { phoneNumber: phone, username: employee.username });
  }
  return { success: true, phoneNumber: phone, blocked: Boolean(blocked) };
}

function findDuplicates(username) {
  requireAdmin_(username);
  const sheet = getLeadSheet_();
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0].map(cleanText_);
  const phoneColumn = requireHeader_(headers, ['Business Phone Number', 'Phone Number', 'Phone'], 'Business Phone Number');
  const businessColumn = findHeaderIndex_(headers, ['Business Name', 'Company Name']);
  const grouped = {};
  values.slice(1).forEach(function(row, index) {
    const duplicateKey = duplicatePhoneKey_(row[phoneColumn]);
    if (!duplicateKey) return;
    if (!grouped[duplicateKey]) grouped[duplicateKey] = [];
    grouped[duplicateKey].push({ rowNumber: index + 2, businessName: businessColumn === -1 ? '' : cleanText_(row[businessColumn]) });
  });
  return Object.keys(grouped).filter(function(phone) { return grouped[phone].length > 1; }).map(function(phone) { return { phoneNumber: '+' + phone, count: grouped[phone].length, records: grouped[phone] }; }).sort(function(a, b) { return b.count - a.count; });
}

/* ============================= CONNECTORS ============================= */

function getConnectors(username) {
  requireAdmin_(username);
  return readConnectors_();
}

function saveConnector(connector, username) {
  requireAdmin_(username);
  connector = connector && typeof connector === 'object' ? connector : {};
  const url = cleanText_(connector.url);
  if (!/^https:\/\//i.test(url)) throw new Error('Enter a secure webhook URL beginning with https://');
  const allowedEvents = ['call.saved', 'sms.sent', 'contact.blocked', 'contact.unblocked', 'test'];
  const events = (Array.isArray(connector.events) ? connector.events : []).filter(function(event) { return allowedEvents.indexOf(event) !== -1; });
  const list = readConnectors_();
  const id = cleanText_(connector.id) || Utilities.getUuid();
  const saved = { id: id, name: cleanText_(connector.name) || 'Webhook connector', url: url, enabled: connector.enabled !== false, events: events.length ? events : ['call.saved', 'sms.sent'] };
  const index = list.findIndex(function(item) { return item.id === id; });
  if (index === -1) list.push(saved); else list[index] = saved;
  writeConnectors_(list);
  return saved;
}

function deleteConnector(id, username) {
  requireAdmin_(username);
  const cleanId = cleanText_(id);
  writeConnectors_(readConnectors_().filter(function(item) { return item.id !== cleanId; }));
  return { success: true };
}

function testConnector(id, username) {
  const employee = requireAdmin_(username);
  const connector = readConnectors_().filter(function(item) { return item.id === cleanText_(id); })[0];
  if (!connector) throw new Error('Connector not found.');
  sendConnectorPayload_(connector, 'test', { message: 'Hire Smart Agents connector test', username: employee.username });
  return { success: true, message: 'Test sent successfully.' };
}

function readConnectors_() {
  const raw = PropertiesService.getScriptProperties().getProperty(CONNECTOR_PROPERTY);
  if (!raw) return [];
  try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; }
  catch (ignore) { return []; }
}

function writeConnectors_(list) {
  PropertiesService.getScriptProperties().setProperty(CONNECTOR_PROPERTY, JSON.stringify(list.slice(0, 20)));
}

function fireConnectorEvent_(eventName, data) {
  readConnectors_().filter(function(connector) { return connector.enabled && connector.events.indexOf(eventName) !== -1; }).forEach(function(connector) {
    try { sendConnectorPayload_(connector, eventName, data); }
    catch (error) { console.error('Connector error for ' + connector.name + ':', error); }
  });
}

function sendConnectorPayload_(connector, eventName, data) {
  const response = UrlFetchApp.fetch(connector.url, {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ source: 'Hire Smart Agents', event: eventName, occurredAt: new Date().toISOString(), data: data }),
    muteHttpExceptions: true, followRedirects: false
  });
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) throw new Error('Connector returned HTTP ' + response.getResponseCode());
}

function tryNormalizePhone_(value) {
  try { return normalizeAustralianPhone_(value); } catch (ignore) { return ''; }
}

// Duplicate matching uses the complete Australian number only. Formatting
// differences such as "02 7908 4316" and "+61 2 7908 4316" are ignored,
// but names, partial numbers and similar numbers are never used as matches.
function duplicatePhoneKey_(value) {
  const normalized = tryNormalizePhone_(value);
  return normalized ? normalized.replace(/\D/g, '') : '';
}

function dateKey_(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';
  return Utilities.formatDate(date, 'Australia/Sydney', 'yyyy-MM-dd');
}

function displayCell_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return Utilities.formatDate(value, 'Australia/Sydney', 'yyyy-MM-dd HH:mm:ss');
  return cleanText_(value);
}

/* ========================= TWILIO VOICE TOKEN ========================= */

function getTwilioToken(identity) {
  const employee = requireEmployee_(identity);
  const config = getTwilioConfig_();
  requireTwilioSetting_(config.accountSid, 'TWILIO_ACCOUNT_SID');
  requireTwilioSetting_(config.apiKeySid, 'TWILIO_API_KEY_SID');
  requireTwilioSetting_(config.apiKeySecret, 'TWILIO_API_KEY_SECRET');

  if (!/^AC[a-fA-F0-9]{32}$/.test(config.accountSid)) throw new Error('TWILIO_ACCOUNT_SID is invalid.');
  if (!/^SK[a-fA-F0-9]{32}$/.test(config.apiKeySid)) throw new Error('TWILIO_API_KEY_SID is invalid.');

  const issuedAt = Math.floor(Date.now() / 1000);
  const header = { typ: 'JWT', alg: 'HS256', cty: 'twilio-fpa;v=1', twr: TWILIO_REGION };
  const payload = {
    jti: config.apiKeySid + '-' + issuedAt + '-' + Utilities.getUuid(),
    grants: {
      identity: createTwilioIdentity_(employee.username),
      voice: {
        incoming: { allow: true },
        outgoing: { application_sid: TWIML_APP_SID }
      }
    },
    iat: issuedAt,
    exp: issuedAt + TOKEN_LIFETIME_SECONDS,
    iss: config.apiKeySid,
    sub: config.accountSid
  };

  const signingInput = base64UrlEncode_(JSON.stringify(header)) + '.' +
    base64UrlEncode_(JSON.stringify(payload));
  const signature = Utilities.computeHmacSha256Signature(
    signingInput, config.apiKeySecret, Utilities.Charset.UTF_8
  );
  return signingInput + '.' + Utilities.base64EncodeWebSafe(signature).replace(/=+$/g, '');
}

/* ======================== TWILIO VOICE WEBHOOK ======================== */

function handleTwilioVoiceWebhook_(e) {
  try {
    const parameters = e && e.parameter ? e.parameter : {};
    const config = getTwilioConfig_();
    requireTwilioSetting_(config.accountSid, 'TWILIO_ACCOUNT_SID');
    requireTwilioSetting_(config.callerId, 'TWILIO_CALLER_ID');

    if (cleanText_(parameters.AccountSid) !== config.accountSid) return twimlHangup_();
    if (!/^CA[a-fA-F0-9]{32}$/.test(cleanText_(parameters.CallSid))) return twimlHangup_();

    const from = cleanText_(parameters.From || parameters.Caller);
    if (from.indexOf('client:') !== 0 || !findEmployeeByTwilioIdentity_(from.substring(7))) {
      return twimlHangup_();
    }

    const destination = normalizeAustralianPhone_(parameters.To);
    const callerId = normalizeAustralianPhone_(config.callerId);
    const twiml = '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Response><Dial callerId="' + escapeXml_(callerId) +
      '" answerOnBridge="true" timeout="30" ringTone="au"><Number>' +
      escapeXml_(destination) + '</Number></Dial></Response>';
    return ContentService.createTextOutput(twiml).setMimeType(ContentService.MimeType.XML);
  } catch (error) {
    console.error('Voice webhook error:', error);
    return twimlHangup_();
  }
}

function twimlHangup_() {
  return ContentService.createTextOutput(
    '<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>'
  ).setMimeType(ContentService.MimeType.XML);
}

/* =============================== TESTS ================================ */

function testConnection() {
  const config = getTwilioConfig_();
  const bridgeSecret = cleanText_(PropertiesService.getScriptProperties().getProperty('HSA_BRIDGE_SECRET'));
  const result = {
    success: true,
    message: 'HSA Dialer connection OK.',
    teamSheet: getTeamSheet_().getName(),
    leadSheet: getLeadSheet_().getName(),
    twilioProperties: {
      TWILIO_ACCOUNT_SID: Boolean(config.accountSid),
      TWILIO_API_KEY_SID: Boolean(config.apiKeySid),
      TWILIO_API_KEY_SECRET: Boolean(config.apiKeySecret),
      TWILIO_AUTH_TOKEN: Boolean(config.authToken),
      TWILIO_CALLER_ID: Boolean(config.callerId)
    },
    HSA_BRIDGE_SECRET: bridgeSecret.length >= 24,
    twilioRegion: TWILIO_REGION
  };
  console.log(result.message);
  console.log(JSON.stringify(result));
  return result;
}

function authorizeTwilioSms() {
  const config = getTwilioConfig_();
  requireTwilioSetting_(config.accountSid, 'TWILIO_ACCOUNT_SID');
  requireTwilioSetting_(config.authToken, 'TWILIO_AUTH_TOKEN');
  const endpoint = 'https://' + TWILIO_MESSAGING_API_HOST + '/2010-04-01/Accounts/' +
    encodeURIComponent(config.accountSid) + '/Messages.json';
  UrlFetchApp.getRequest(endpoint);
  return { success: true, message: 'Twilio SMS permission is ready.' };
}

/* ============================== HELPERS =============================== */

function getSpreadsheet_() { return SpreadsheetApp.openById(SHEET_ID); }

function getTeamSheet_() {
  const sheet = getSpreadsheet_().getSheetByName(TEAM_SHEET_NAME);
  if (!sheet) throw new Error('The "' + TEAM_SHEET_NAME + '" sheet could not be found.');
  return sheet;
}

function getLeadSheet_() {
  const sheet = getSpreadsheet_().getSheetByName(LEADS_SHEET_NAME);
  if (!sheet) throw new Error('The "' + LEADS_SHEET_NAME + '" sheet could not be found.');
  return sheet;
}

function getHeaders_(sheet) {
  if (sheet.getLastColumn() < 1) throw new Error('The sheet has no headers.');
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0].map(cleanText_);
}

function findHeaderIndex_(headers, names) {
  const normalized = headers.map(normalizeHeader_);
  for (let i = 0; i < names.length; i++) {
    const index = normalized.indexOf(normalizeHeader_(names[i]));
    if (index !== -1) return index;
  }
  return -1;
}

function requireHeader_(headers, names, label) {
  const index = findHeaderIndex_(headers, names);
  if (index === -1) throw new Error('The leads sheet is missing the "' + label + '" column.');
  return index;
}

function setArrayValueByHeader_(row, headers, names, value) {
  const index = findHeaderIndex_(headers, names);
  if (index === -1) throw new Error('The leads sheet is missing the "' + names[0] + '" column.');
  row[index] = value;
}

function isEmptyRow_(row) {
  return row.every(function(value) { return cleanText_(value) === ''; });
}

function findEmployee_(username) {
  const wanted = normalizeHeader_(username);
  if (!wanted) return null;
  const sheet = getTeamSheet_();
  if (sheet.getLastRow() < 2) return null;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getDisplayValues();
  for (let i = 0; i < values.length; i++) {
    const storedUsername = cleanText_(values[i][0]);
    if (normalizeHeader_(storedUsername) === wanted) {
      return {
        username: storedUsername,
        password: String(values[i][1]),
        employeeName: cleanText_(values[i][2]) || storedUsername,
        role: cleanText_(values[i][3])
      };
    }
  }
  return null;
}

function requireEmployee_(username) {
  const employee = findEmployee_(username);
  if (!employee) throw new Error('Your HSA employee account could not be verified. Please log in again.');
  return employee;
}

function requireAdmin_(username) {
  const employee = requireEmployee_(username);
  const role = normalizeHeader_(employee.role);
  if (['admin', 'administrator', 'owner', 'manager'].indexOf(role) === -1) {
    throw new Error('This management area is only available to an owner, manager, or administrator.');
  }
  return employee;
}

function findEmployeeByTwilioIdentity_(identity) {
  const sheet = getTeamSheet_();
  if (sheet.getLastRow() < 2) return null;
  const usernames = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues();
  for (let i = 0; i < usernames.length; i++) {
    const username = cleanText_(usernames[i][0]);
    if (username && createTwilioIdentity_(username) === identity) return username;
  }
  return null;
}

function createTwilioIdentity_(username) {
  const identity = cleanText_(username).replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 64);
  if (!identity) throw new Error('This username cannot be used as a Twilio identity.');
  return identity;
}

function getTwilioConfig_() {
  const props = PropertiesService.getScriptProperties();
  return {
    accountSid: cleanText_(props.getProperty('TWILIO_ACCOUNT_SID')),
    apiKeySid: cleanText_(props.getProperty('TWILIO_API_KEY_SID')),
    apiKeySecret: cleanText_(props.getProperty('TWILIO_API_KEY_SECRET')),
    authToken: cleanText_(props.getProperty('TWILIO_AUTH_TOKEN')),
    callerId: cleanText_(props.getProperty('TWILIO_CALLER_ID'))
  };
}

function requireTwilioSetting_(value, name) {
  if (!value) throw new Error(name + ' is missing from Apps Script Properties.');
}

function base64UrlEncode_(value) {
  return Utilities.base64EncodeWebSafe(value, Utilities.Charset.UTF_8).replace(/=+$/g, '');
}

function normalizeAustralianPhone_(phoneNumber) {
  let phone = String(phoneNumber == null ? '' : phoneNumber).trim();
  if (!phone) throw new Error('Enter a phone number.');
  phone = phone.replace(/[^\d+]/g, '');
  if (phone.indexOf('0061') === 0) phone = '+61' + phone.substring(4);
  if (phone.indexOf('+610') === 0) phone = '+61' + phone.substring(4);
  if (phone.indexOf('61') === 0) phone = '+' + phone;
  if (/^0[23478]\d{8}$/.test(phone)) phone = '+61' + phone.substring(1);
  if (!/^\+61[23478]\d{8}$/.test(phone)) {
    throw new Error('Enter a valid Australian mobile or landline number.');
  }
  return phone;
}

function normalizeCallDuration_(value) {
  const seconds = Math.floor(Number(value) || 0);
  return Math.min(Math.max(seconds, 0), 86400);
}

function formatCallDuration_(seconds) {
  const value = normalizeCallDuration_(seconds);
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const remaining = value % 60;
  return (hours ? String(hours).padStart(2, '0') + ':' : '') +
    String(minutes).padStart(2, '0') + ':' + String(remaining).padStart(2, '0');
}

function joinCallDetails_(notes, durationSeconds) {
  const cleanNotes = cleanText_(notes);
  const duration = 'Call duration: ' + formatCallDuration_(durationSeconds);
  return cleanNotes ? cleanNotes + ' · ' + duration : duration;
}

function setCallbackDate_(sheet, row, column, value) {
  const range = sheet.getRange(row, column);
  const date = parseDate_(value);
  if (!date) range.clearContent();
  else range.setValue(date).setNumberFormat('yyyy-mm-dd');
}

function parseDate_(value) {
  if (value === null || value === undefined || cleanText_(value) === '') return null;
  if (Object.prototype.toString.call(value) === '[object Date]') {
    if (isNaN(value.getTime())) throw new Error('The date is invalid.');
    return value;
  }
  const text = cleanText_(value);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      throw new Error('The date is invalid.');
    }
    return date;
  }
  const date = new Date(text);
  if (isNaN(date.getTime())) throw new Error('The date is invalid.');
  return date;
}

function formatAppointmentDate_(value) {
  const date = parseDate_(value);
  if (!date) throw new Error('Select an appointment date.');
  return Utilities.formatDate(date, 'Australia/Sydney', 'EEEE, d MMMM yyyy');
}

function formatAppointmentTime_(value) {
  const time = cleanText_(value);
  if (!time) throw new Error('Select an appointment time.');
  const match = time.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    if (time.length > 30) throw new Error('The appointment time is invalid.');
    return time;
  }
  const hours = Number(match[1]);
  return (hours % 12 || 12) + ':' + match[2] + ' ' + (hours >= 12 ? 'PM' : 'AM');
}

function cleanText_(value) { return String(value == null ? '' : value).trim(); }

function normalizeHeader_(value) {
  return cleanText_(value).replace(/^\uFEFF/, '').replace(/\s+/g, ' ').toLowerCase();
}

function escapeXml_(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
