const HTML = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>HireSmart Agents — Sales Workspace</title>
  <script src="https://cdn.jsdelivr.net/npm/@twilio/voice-sdk@2.18.3/dist/twilio.min.js"></script>
  <style>
    :root{--ink:#11110f;--paper:#f4f2ec;--panel:#fffefa;--line:#d8d4ca;--muted:#706e68;--orange:#ff5a0a;--orange-soft:#fff0e7;--green:#16794b;--red:#b42318;--purple:#5b43b7;--shadow:0 18px 45px rgba(17,17,15,.08)}
    *{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background-color:var(--paper);background-image:radial-gradient(#d5d1c7 1px,transparent 1px);background-size:18px 18px;color:var(--ink)}.hidden{display:none!important}
    button,input,select,textarea{font:inherit}button{border:1px solid transparent;border-radius:4px;padding:11px 17px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:.18s ease}button:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 7px 18px rgba(17,17,15,.12)}button:disabled{opacity:.45;cursor:not-allowed}
    input,select,textarea{width:100%;border:1px solid var(--line);border-radius:4px;padding:12px 13px;background:#fffefa;color:var(--ink)}input:focus,select:focus,textarea:focus{outline:2px solid #ffc7a8;border-color:var(--orange)}
    label{display:block;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:7px}.field{margin-bottom:16px}.primary{background:var(--orange);color:#fff}.green{background:var(--green);color:#fff}.red{background:var(--red);color:#fff}.purple{background:var(--purple);color:#fff}.dark{background:var(--ink);color:#fff}.grey{background:#ebe8e0;color:#34332f;border-color:#dedad0}.full{width:100%}
    #login{min-height:100vh;display:grid;place-items:center;padding:20px}.login-card,.card{background:rgba(255,254,250,.97);border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow)}.login-card{width:100%;max-width:440px;padding:42px}.brand-lockup{display:flex;align-items:center}.wordmark{font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;font-size:15px;font-weight:900;letter-spacing:.12em;white-space:nowrap}.logo{justify-content:center;margin-bottom:8px}.logo .wordmark{font-size:18px}.subtitle{text-align:center;color:var(--muted);margin:10px 0 30px;font-size:13px}.login-kicker{text-align:center;color:var(--orange);font:700 10px "SFMono-Regular",Consolas,monospace;letter-spacing:.13em;margin-bottom:22px}
    header{background:var(--ink);color:#fff;padding:15px 26px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:10}.user{display:flex;gap:11px;align-items:center}.role-chip{background:#2a2926;border:1px solid #45433e;color:#f6a06e;padding:6px 9px;border-radius:99px;font:700 10px "SFMono-Regular",Consolas,monospace;letter-spacing:.08em}.header-logout{background:transparent;color:#fff;border-color:#5a5751}
    .container{max-width:1380px;margin:auto;padding:26px 22px;display:grid;grid-template-columns:235px minmax(0,1fr);column-gap:22px}.top{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:18px}.title{font-size:28px;font-weight:850;letter-spacing:-.025em}.eyebrow{font:700 10px "SFMono-Regular",Consolas,monospace;letter-spacing:.12em;color:var(--orange);margin-bottom:6px}.badge{padding:8px 12px;border:1px solid #e7b88e;border-radius:99px;background:#fff4e9;color:#8e3a0b;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.badge.ready{background:#e9f8ef;border-color:#aed9be;color:#12613d}.badge.error{background:#fff0ee;border-color:#efb4ad;color:#8f1d14}
    .tabs{grid-column:1;grid-row:3/span 20;align-self:start;position:sticky;top:83px;display:flex;flex-direction:column;gap:5px;background:var(--ink);padding:12px;border-radius:7px;box-shadow:var(--shadow)}.tab{background:transparent;color:#c8c4bc;text-align:left;border-color:transparent;padding:12px 13px}.tab:hover:not(:disabled){background:#292825;box-shadow:none;transform:none}.tab.active{background:var(--orange);color:#fff}.nav-label{color:#85817a;font:700 9px "SFMono-Regular",Consolas,monospace;letter-spacing:.16em;padding:15px 12px 5px}
    .container>section{grid-column:2}.card{padding:26px;margin-bottom:20px}.lead-head{display:flex;justify-content:space-between;gap:20px;margin-bottom:20px}.business{font-size:25px;font-weight:850;letter-spacing:-.02em}.muted{color:var(--muted);font-size:13px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.detail{background:#f8f6f0;border:1px solid #e7e3d9;border-radius:5px;padding:14px}.detail small{display:block;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;margin-bottom:6px}.detail div{font-weight:700;word-break:break-word}.span2{grid-column:1/-1}
    .callbox,.savebox{border-top:1px solid var(--line);margin-top:24px;padding-top:24px}.phone{text-align:center;font:800 22px "SFMono-Regular",Consolas,monospace;margin-bottom:12px}.status{max-width:680px;margin:0 auto 16px;text-align:center;background:#f0eee7;border:1px solid #e2ded4;padding:12px;border-radius:4px;font-weight:700;font-size:13px}.status.good{background:#edf8f1;border-color:#b8ddc6;color:#125d3c}.status.bad,.error{background:#fff0ee;border-color:#efbeb8;color:var(--red)}.actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}.actions button{min-width:150px}.message{padding:11px;border:1px solid currentColor;border-radius:4px;margin-bottom:15px;font-size:13px}.success{background:#edf8f1;color:#125d3c}.loading,.empty{text-align:center;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:50px 20px}
    .modal-bg{position:fixed;inset:0;background:#11110fbb;backdrop-filter:blur(5px);z-index:20;display:grid;place-items:center;padding:18px}.modal{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:26px;width:100%;max-width:580px;max-height:92vh;overflow:auto;box-shadow:0 30px 80px #0006}.modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.modal-title{font-size:21px;font-weight:850}.target{background:var(--orange-soft);color:#9f3d08;border-left:3px solid var(--orange);padding:11px;margin-bottom:16px;font-weight:700}.count{text-align:right;color:var(--muted);font-size:12px}
    .feed-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:18px}.feed{display:grid;gap:11px}.feed-item{border:1px solid var(--line);border-radius:5px;padding:16px;background:#fff}.feed-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:9px}.feed-phone{font-weight:850}.feed-time{font:600 11px "SFMono-Regular",Consolas,monospace;color:var(--muted)}.feed-body{white-space:pre-wrap;word-break:break-word;line-height:1.5}.feed-actions{display:flex;gap:8px;margin-top:12px}.feed-actions button{padding:8px 12px}.pill{display:inline-block;background:var(--orange-soft);color:#9f3d08;border-radius:99px;padding:4px 9px;font-size:11px;font-weight:800;text-transform:uppercase}
    .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.metric{border:1px solid var(--line);border-top:3px solid var(--orange);border-radius:5px;padding:18px;background:#fff}.metric strong{display:block;font:850 30px "SFMono-Regular",Consolas,monospace;margin-top:8px}.toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}.toolbar input,.toolbar select{width:auto;min-width:180px;flex:1}.notice{grid-column:1/-1;background:var(--ink);color:#fff;border-left:4px solid var(--orange);border-radius:4px;padding:13px 17px;margin-bottom:18px;font-weight:700;font-size:13px;cursor:pointer}.section-title{font-size:20px;font-weight:850;margin-bottom:15px}.connector{border:1px solid var(--line);border-radius:5px;padding:15px;margin-top:12px}.checkboxes{display:flex;gap:14px;flex-wrap:wrap;margin:10px 0}.checkboxes label{display:flex;gap:7px;align-items:center;font-weight:650}.checkboxes input{width:auto}.danger-outline{background:#fff;color:var(--red);border-color:#efbeb8}
    .call-dock{position:fixed;right:22px;bottom:22px;z-index:18;width:min(390px,calc(100vw - 28px));background:#151513;color:#fff;border:1px solid #373631;border-top:4px solid var(--orange);border-radius:10px;padding:18px;box-shadow:0 24px 70px #0006}.call-dock-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.call-label{color:#aaa69d;font:700 9px "SFMono-Regular",Consolas,monospace;letter-spacing:.15em}.call-number{font:850 18px "SFMono-Regular",Consolas,monospace;margin-top:5px}.call-timer{font:900 26px "SFMono-Regular",Consolas,monospace;color:#fff}.call-phase{display:flex;align-items:center;gap:8px;color:#c7c3bb;font-size:12px;margin:13px 0}.call-dot{width:8px;height:8px;border-radius:50%;background:#d99a64;box-shadow:0 0 0 4px #d99a6422}.call-dot.live{background:#35c77d;box-shadow:0 0 0 4px #35c77d22}.call-controls{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}.call-controls button{min-width:0;padding:11px 8px;background:#292824;color:#fff;border-color:#45433e}.call-controls button.active{background:#fff3eb;color:#a23d08;border-color:#ffab7b}.call-controls .end{background:var(--red);border-color:var(--red)}.keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:12px}.keypad button{background:#24231f;color:#fff;border-color:#45433e;font-size:16px;padding:9px}.keypad button:hover:not(:disabled){background:#3a3833}.duration-note{text-align:center;color:var(--muted);font:700 11px "SFMono-Regular",Consolas,monospace;margin:10px 0 0}
    @media(max-width:850px){header{padding:12px 14px}.user-name{display:none}.container{display:block;padding:18px 12px 130px}.top,.lead-head{align-items:flex-start;flex-direction:column}.tabs{position:static;display:flex;flex-direction:row;overflow-x:auto;margin-bottom:18px;padding:7px}.tab{min-width:max-content;text-align:center}.nav-label{display:none}.grid,.metrics{grid-template-columns:1fr}.span2{grid-column:auto}.actions{flex-direction:column}.actions button{width:100%}.toolbar>*{width:100%!important}.login-card{padding:30px 24px}.call-dock{left:10px;right:10px;bottom:10px;width:auto}.wordmark{font-size:12px}.logo .wordmark{font-size:17px}}
  </style>
</head>
<body>
<section id="login">
  <div class="login-card">
    <div class="brand-lockup logo"><span class="wordmark">HIRESMART.AGENTS</span></div>
    <div class="login-kicker">// SECURE SALES WORKSPACE</div><div class="subtitle">Calls, messages and follow-ups in one place.</div>
    <div id="loginMsg" class="message error hidden"></div>
    <div class="field"><label>Username</label><input id="username" autocomplete="username"></div>
    <div class="field"><label>Password</label><input id="password" type="password" autocomplete="current-password"></div>
    <button id="loginBtn" class="primary full">LOGIN</button>
  </div>
</section>

<section id="app" class="hidden">
  <header><div class="brand-lockup"><span class="wordmark">HIRESMART.AGENTS</span></div><div class="user"><span id="roleBadge" class="role-chip"></span><span id="userName" class="user-name"></span><button id="logout" class="header-logout">Logout</button></div></header>
  <main class="container">
    <div class="top"><div><div class="eyebrow">// SALES OPERATIONS</div><div class="title">Sales workspace</div><div class="muted">Every conversation captured. Every next step clear.</div></div><div id="phoneBadge" class="badge">Connecting phone...</div></div>
    <div id="alertBar" class="notice hidden"></div>
    <div class="tabs"><div class="nav-label">WORKSPACE</div><button id="leadTabBtn" class="tab">◉ Lead Queue</button><button id="followupsTabBtn" class="tab">↗ Follow-ups</button><button id="manualTabBtn" class="tab">☎ Manual Dialer</button><button id="smsInboxTabBtn" class="tab">✉ SMS Inbox</button><button id="missedTabBtn" class="tab">↙ Missed Calls</button><div class="nav-label admin-only">MANAGEMENT</div><button id="dashboardTabBtn" class="tab admin-only">▦ Dashboard</button><button id="activityTabBtn" class="tab admin-only">◷ Team Activity</button><button id="dncTabBtn" class="tab admin-only">⊘ Do Not Call</button><button id="connectorsTabBtn" class="tab admin-only">⌘ Connectors</button></div>

    <section id="dashboardTab" class="admin-only"><div class="card"><div class="feed-head"><div><div class="eyebrow">MANAGEMENT ONLY</div><div class="section-title">Business overview</div></div><button id="refreshDashboard" class="grey">↻ Refresh</button></div><div id="dashboardState" class="status">Loading dashboard...</div><div id="metrics" class="metrics"></div></div><div class="card"><div class="feed-head"><div><div class="section-title">Data quality</div><div class="muted">Only complete matching phone numbers are treated as duplicates.</div></div><button id="refreshDuplicates" class="grey">Check duplicates</button></div><div id="duplicatesState" class="status">Run a duplicate check when needed.</div><div id="duplicatesList" class="feed"></div></div></section>

    <section id="leadTab" class="hidden">
      <div class="card"><div class="toolbar"><input id="leadSearch" placeholder="Search business, phone, suburb or industry"><select id="leadIndustry"><option value="">All industries</option></select><select id="leadState"><option value="">All states</option></select><button id="clearLeadFilters" class="grey">CLEAR</button></div><div id="leadFilterCount" class="muted"></div></div>
      <div id="loading" class="loading">Loading leads...</div>
      <div id="empty" class="empty hidden"><b>No more leads</b><div class="muted" style="margin-top:8px">There are currently no available leads.</div></div>
      <div id="leadArea" class="card hidden">
        <div class="lead-head"><div><div id="business" class="business"></div><div id="industry" class="muted"></div></div><div id="leadCount" class="muted"></div></div>
        <div class="grid">
          <div class="detail"><small>Decision Maker</small><div id="decisionMaker"></div></div><div class="detail"><small>Title</small><div id="decisionTitle"></div></div>
          <div class="detail"><small>Phone</small><div id="leadPhone"></div></div><div class="detail"><small>Location</small><div id="location"></div></div>
          <div class="detail span2"><small>Website</small><div id="website"></div></div>
        </div>
        <div class="callbox"><div id="leadPhoneDisplay" class="phone"></div><div id="leadStatus" class="status">Phone system loading...</div>
          <div class="actions"><button id="callLead" class="green">☎ CALL LEAD</button><button id="hangLead" class="red hidden">☎ HANG UP</button><button id="smsLead" class="purple">✉ SEND SMS</button></div>
        </div>
        <div class="savebox"><div class="grid">
          <div class="field"><label>Call Outcome</label><select id="leadOutcome"></select></div><div class="field"><label>Next Follow-up</label><input id="leadFollowup" type="date"></div>
          <div class="field span2"><label>Notes</label><textarea id="leadNotes" rows="4" placeholder="Add notes about the call..."></textarea></div>
        </div><button id="saveLead" class="primary full">SAVE CALL</button><button id="nextLead" class="dark full" style="margin-top:12px">NEXT LEAD →</button></div>
      </div>
    </section>

    <section id="followupsTab" class="hidden"><div class="card"><div class="feed-head"><div><div class="section-title">Follow-up Queue</div><div class="muted">Callbacks sorted by due date</div></div><button id="refreshFollowups" class="grey">↻ REFRESH</button></div><div id="followupsState" class="status">Open this tab to load follow-ups.</div><div id="followupsList" class="feed"></div></div></section>

    <section id="manualTab" class="hidden"><div class="card"><div class="business" style="font-size:20px;margin-bottom:18px">Manual Dialer</div>
      <div class="grid"><div class="field"><label>Business Name</label><input id="manualBusiness" placeholder="Optional business name"></div><div class="field"><label>Contact Name</label><input id="manualContact" placeholder="Optional contact name"></div><div class="field span2"><label>Australian Phone Number</label><input id="manualPhone" type="tel" placeholder="Example: 0412 345 678"></div></div>
      <div class="callbox"><div id="manualPhoneDisplay" class="phone">Enter a phone number</div><div id="manualStatus" class="status">Ready for a manual call</div><div class="actions"><button id="callManual" class="green">☎ CALL NUMBER</button><button id="hangManual" class="red hidden">☎ HANG UP</button><button id="smsManual" class="purple">✉ SEND SMS</button></div></div>
      <div class="savebox"><div class="business" style="font-size:19px;margin-bottom:18px">Save Manual Call</div><div class="grid"><div class="field"><label>Call Outcome</label><select id="manualOutcome"></select></div><div class="field"><label>Next Follow-up</label><input id="manualFollowup" type="date"></div><div class="field span2"><label>Notes</label><textarea id="manualNotes" rows="4"></textarea></div></div><button id="saveManual" class="primary full">SAVE MANUAL CALL</button></div>
    </div></section>

    <section id="smsInboxTab" class="hidden"><div class="card"><div class="feed-head"><div><div class="business" style="font-size:20px">SMS Inbox</div><div class="muted">Replies sent to your Australian Twilio number</div></div><button id="refreshInbox" class="grey">↻ REFRESH</button></div><div id="smsInboxState" class="status">Open this tab to load messages.</div><div id="smsInboxList" class="feed"></div></div></section>

    <section id="missedTab" class="hidden"><div class="card"><div class="feed-head"><div><div class="business" style="font-size:20px">Missed Calls</div><div class="muted">Recent unanswered inbound calls</div></div><button id="refreshMissed" class="grey">↻ REFRESH</button></div><div id="missedState" class="status">Open this tab to load missed calls.</div><div id="missedList" class="feed"></div></div></section>

    <section id="activityTab" class="hidden admin-only"><div class="card"><div class="feed-head"><div><div class="eyebrow">MANAGEMENT ONLY</div><div class="section-title">Conversation & team activity</div><div class="muted">Calls, SMS, notes and employee activity</div></div><div><button id="exportActivity" class="grey">Export CSV</button> <button id="refreshActivity" class="grey">↻ Refresh</button></div></div><div class="toolbar"><input id="activityPhone" placeholder="Filter by phone number"><select id="activityType"><option value="">All activity</option><option value="call">Calls</option><option value="sms">SMS</option><option value="dnc">DNC changes</option></select></div><div id="activityState" class="status">Open this tab to load activity.</div><div id="activityList" class="feed"></div></div></section>

    <section id="dncTab" class="hidden admin-only"><div class="card"><div class="eyebrow">MANAGEMENT ONLY</div><div class="section-title">Do Not Call protection</div><div class="muted" style="margin-bottom:18px">Agents can mark a call outcome as Do Not Call. Only management can review or remove blocked numbers.</div><div class="grid"><div class="field"><label>Australian phone number</label><input id="dncPhone" placeholder="0412 345 678"></div><div class="field"><label>Reason</label><input id="dncReason" placeholder="Opted out or requested no contact"></div></div><button id="addDnc" class="red">Block number</button><div id="dncState" class="status" style="margin-top:18px">Open this tab to load blocked numbers.</div><div id="dncList" class="feed"></div></div></section>

    <section id="connectorsTab" class="hidden admin-only"><div class="card"><div class="eyebrow">MANAGEMENT ONLY</div><div class="section-title">App connectors</div><div class="muted" style="margin-bottom:18px">Securely send selected sales events to Zapier, Make, Slack workflows, CRMs, or another HTTPS webhook.</div><div class="grid"><div class="field"><label>Connector name</label><input id="connectorName" placeholder="Example: Zapier CRM"></div><div class="field"><label>Webhook URL</label><input id="connectorUrl" type="url" placeholder="https://..."></div></div><div class="checkboxes"><label><input id="eventCalls" type="checkbox" checked> Saved calls</label><label><input id="eventSms" type="checkbox" checked> Sent SMS</label><label><input id="eventDnc" type="checkbox"> DNC changes</label></div><button id="saveConnector" class="primary">Add connector</button><div id="connectorsState" class="status" style="margin-top:18px">No external data is sent until an administrator adds and tests a connector.</div><div id="connectorsList"></div></div></section>
  </main>
</section>

<aside id="callDock" class="call-dock hidden" aria-live="polite">
  <div class="call-dock-head"><div><div class="call-label">ACTIVE CALL</div><div id="activeCallNumber" class="call-number"></div></div><div id="callTimer" class="call-timer">00:00</div></div>
  <div class="call-phase"><span id="callDot" class="call-dot"></span><span id="callPhase">Preparing call…</span></div>
  <div class="call-controls"><button id="muteCall" disabled>🎙 Mute</button><button id="keypadCall" disabled>⌨ Keypad</button><button id="dockHang" class="end">☎ End</button></div>
  <div id="callKeypad" class="keypad hidden"><button data-digit="1">1</button><button data-digit="2">2</button><button data-digit="3">3</button><button data-digit="4">4</button><button data-digit="5">5</button><button data-digit="6">6</button><button data-digit="7">7</button><button data-digit="8">8</button><button data-digit="9">9</button><button data-digit="*">*</button><button data-digit="0">0</button><button data-digit="#">#</button></div>
</aside>

<div id="smsModal" class="modal-bg hidden"><div class="modal"><div class="modal-head"><div class="modal-title">Send SMS</div><button id="closeSms" class="grey">✕</button></div><div id="smsTarget" class="target"></div><div id="smsMsg" class="message hidden"></div>
  <div class="field"><label>Message Type</label><select id="smsType"><option value="appointment">Appointment Confirmation</option><option value="custom">Custom SMS</option></select></div>
  <div id="appointmentFields"><div class="field"><label>Contact Name</label><input id="smsName"></div><div class="grid"><div class="field"><label>Appointment Date</label><input id="smsDate" type="date"></div><div class="field"><label>Appointment Time</label><input id="smsTime" type="time"></div></div></div>
  <div id="customFields" class="hidden"><div class="field"><label>Message</label><textarea id="smsBody" rows="6" maxlength="1300" placeholder="Type your message..."></textarea><div id="smsCount" class="count">0 characters</div></div><div class="muted" style="margin-bottom:16px">Hire Smart Agents and opt-out wording are added automatically.</div></div>
  <div class="field"><label>Saved template</label><select id="smsTemplate"><option value="">Choose a template</option><option value="Hi, thanks for speaking with us today. Please reply if you have any questions.">Thanks for speaking</option><option value="Hi, I tried to reach you today. Please reply with a suitable time for a quick call.">Missed you</option><option value="Hi, just following up on our previous conversation. Are you available for a quick chat?">Follow-up</option></select></div>
  <div class="actions"><button id="cancelSms" class="grey">CANCEL</button><button id="sendSms" class="purple">SEND SMS</button></div>
</div></div>

<script>
const outcomes=['','Appointment Booked','Answered - Interested','Answered - Not Interested','Answered - Callback','No Answer','Busy','Voicemail','Wrong Number','Do Not Call'];
let sessionToken='',username='',employeeName='',userRole='',isAdmin=false,allLeads=[],leads=[],leadIndex=0,currentLead=null,device=null,deviceReady=false,currentCall=null,callMode='',smsContext={},lastCallError='',inputDeviceId='default',activeView='lead',activityCache=[],lastAlertCounts={sms:0,calls:0},callStartedAt=0,callTimerHandle=null,callConnected=false,isCallMuted=false,activeCallPhone='',lastCallSeconds={lead:0,manual:0};
const $=id=>document.getElementById(id); const err=e=>(e&&e.message?e.message:String(e||'Error')).replace(/^Exception:\s*/i,'');
function twilioError(e){const t=e&&e.twilioError?e.twilioError:e;const code=t&&t.code?' ('+t.code+')':'';const explanation=t&&t.explanation&&t.explanation!==t.message?' — '+t.explanation:'';const cause=t&&t.causes&&t.causes.length?' Cause: '+t.causes.join('; '):'';const nested=[e&&e.originalError,e&&e.cause,t&&t.cause].filter(Boolean).map(x=>x.name&&x.message?x.name+': '+x.message:err(x)).filter(Boolean);const details=nested.length?' Details: '+[...new Set(nested)].join('; '):'';return 'Twilio error'+code+': '+err(t)+explanation+cause+details;}

async function api(action,data={}){const headers={'Content-Type':'application/json'};if(sessionToken)headers.Authorization='Bearer '+sessionToken;const response=await fetch('/api',{method:'POST',headers,body:JSON.stringify({action,data})});let body;try{body=await response.json()}catch(e){throw Error('The server returned an invalid response.')}if(!response.ok||!body.ok)throw Error(body.error||'Request failed.');return body.result;}
function fillOutcomes(id){$(id).innerHTML=outcomes.map((x,i)=>'<option value="'+x+'">'+(i?'': 'Select outcome')+(i?x:'')+'</option>').join('');}
function normalizePhone(value){let p=String(value||'').trim().replace(/[^\d+]/g,'');if(p.startsWith('0061'))p='+61'+p.slice(4);if(p.startsWith('+610'))p='+61'+p.slice(4);if(p.startsWith('61'))p='+'+p;if(/^0[23478]\d{8}$/.test(p))p='+61'+p.slice(1);return /^\+61[23478]\d{8}$/.test(p)?p:'';}
function setStatus(id,text,type=''){const el=$(id);el.textContent=text;el.className='status'+(type?' '+type:'');}
function formatDuration(seconds){const value=Math.max(0,Number(seconds)||0),minutes=Math.floor(value/60);return String(minutes).padStart(2,'0')+':'+String(value%60).padStart(2,'0')}
function currentDuration(){return callStartedAt?Math.floor((Date.now()-callStartedAt)/1000):0}
function updateCallTimer(){$('callTimer').textContent=formatDuration(currentDuration())}
function showCallDock(phone){activeCallPhone=phone;$('activeCallNumber').textContent=phone;$('callTimer').textContent='00:00';$('callPhase').textContent='Preparing call…';$('callDot').className='call-dot';$('muteCall').disabled=true;$('keypadCall').disabled=true;$('muteCall').classList.remove('active');$('muteCall').textContent='🎙 Mute';$('callKeypad').classList.add('hidden');$('keypadCall').classList.remove('active');$('callDock').classList.remove('hidden')}
function setCallPhase(text,live=false){$('callPhase').textContent=text;$('callDot').className='call-dot'+(live?' live':'')}
function startCallClock(){callStartedAt=Date.now();callConnected=true;isCallMuted=false;updateCallTimer();clearInterval(callTimerHandle);callTimerHandle=setInterval(updateCallTimer,1000);$('muteCall').disabled=false;$('keypadCall').disabled=false;setCallPhase('Connected · microphone live',true)}
function stopCallClock(){const seconds=currentDuration();clearInterval(callTimerHandle);callTimerHandle=null;if(callMode)lastCallSeconds[callMode]=seconds;callStartedAt=0;callConnected=false;return seconds}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function managementRole(role){return ['admin','administrator','owner','manager'].includes(String(role||'').trim().toLowerCase())}
function applyAccess(){document.querySelectorAll('.admin-only').forEach(el=>el.classList.toggle('hidden',!isAdmin));$('roleBadge').textContent=isAdmin?'ADMIN':(userRole||'TEAM MEMBER').toUpperCase()}

$('loginBtn').onclick=login;$('password').onkeydown=e=>{if(e.key==='Enter')login()};
async function login(){const btn=$('loginBtn'),msg=$('loginMsg');msg.classList.add('hidden');btn.disabled=true;btn.textContent='SIGNING IN...';try{const result=await api('login',{username:$('username').value.trim(),password:$('password').value});if(!result.success)throw Error(result.message);sessionToken=result.sessionToken;username=result.username;employeeName=result.employeeName||username;userRole=result.role||'';isAdmin=managementRole(userRole);$('userName').textContent=employeeName;applyAccess();$('login').classList.add('hidden');$('app').classList.remove('hidden');const jobs=[loadLeads(),initPhone(),loadAlerts()];if(isAdmin)jobs.push(loadDashboard());await Promise.all(jobs);switchTab(isAdmin?'dashboard':'lead');}catch(e){msg.textContent=err(e);msg.classList.remove('hidden')}finally{btn.disabled=false;btn.textContent='LOGIN'}}

async function loadLeads(){$('loading').classList.remove('hidden');$('empty').classList.add('hidden');$('leadArea').classList.add('hidden');try{allLeads=await api('getLeads');populateLeadFilters();filterLeads()}catch(e){$('loading').textContent='Could not load leads: '+err(e)}}
function uniqueValues(keys){return [...new Set(allLeads.map(lead=>keys.map(key=>lead[key]).find(Boolean)||'').filter(Boolean))].sort()}
function populateLeadFilters(){const industry=$('leadIndustry'),state=$('leadState'),selectedIndustry=industry.value,selectedState=state.value;industry.innerHTML='<option value="">All industries</option>'+uniqueValues(['Industry']).map(value=>'<option>'+escapeHtml(value)+'</option>').join('');state.innerHTML='<option value="">All states</option>'+uniqueValues(['State']).map(value=>'<option>'+escapeHtml(value)+'</option>').join('');industry.value=selectedIndustry;state.value=selectedState}
function filterLeads(){const search=$('leadSearch').value.trim().toLowerCase(),industry=$('leadIndustry').value,state=$('leadState').value;leads=allLeads.filter(lead=>{const haystack=Object.values(lead).join(' ').toLowerCase();return(!search||haystack.includes(search))&&(!industry||lead.Industry===industry)&&(!state||lead.State===state)});leadIndex=0;$('leadFilterCount').textContent=leads.length+' matching lead'+(leads.length===1?'':'s');showLead()}
function escapeHtml(value){return String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
$('leadSearch').oninput=filterLeads;$('leadIndustry').onchange=filterLeads;$('leadState').onchange=filterLeads;$('clearLeadFilters').onclick=()=>{$('leadSearch').value='';$('leadIndustry').value='';$('leadState').value='';filterLeads()};
function showLead(){$('loading').classList.add('hidden');if(!leads.length||leadIndex>=leads.length){currentLead=null;$('leadArea').classList.add('hidden');$('empty').classList.remove('hidden');return}currentLead=leads[leadIndex];$('business').textContent=currentLead['Business Name']||'Unknown Business';$('industry').textContent=currentLead.Industry||'';$('leadCount').textContent='Lead '+(leadIndex+1)+' of '+leads.length;$('decisionMaker').textContent=currentLead['Decision Maker Name']||'Not available';$('decisionTitle').textContent=currentLead['Decision Maker Title']||'Not available';$('leadPhone').textContent=currentLead['Business Phone Number']||'Not available';$('location').textContent=['Suburb','City','State'].map(k=>currentLead[k]).filter(Boolean).join(', ')||'Not available';$('website').textContent=currentLead.Website||'Not available';const p=normalizePhone(currentLead['Business Phone Number']);$('leadPhoneDisplay').textContent=p||'Invalid phone number';$('leadOutcome').value='';$('leadFollowup').value='';$('leadNotes').value='';$('leadArea').classList.remove('hidden');refreshButtons();}

async function initPhone(){const badge=$('phoneBadge');try{const token=await api('getTwilioToken');device=new Twilio.Device(token,{edge:'sydney',logLevel:'error',enableImprovedSignalingErrorPrecision:true});device.on('registered',()=>{deviceReady=true;badge.textContent='Phone Ready';badge.className='badge ready';refreshButtons()});device.on('unregistered',()=>{deviceReady=false;badge.textContent='Phone disconnected';badge.className='badge error';refreshButtons()});device.on('error',e=>{lastCallError=twilioError(e);badge.textContent='Phone Error';badge.className='badge error';setStatus(callMode==='manual'?'manualStatus':'leadStatus',lastCallError,'bad')});device.on('incoming',c=>c.reject());await device.register()}catch(e){badge.textContent='Phone setup failed';badge.className='badge error';setStatus('leadStatus',lastCallError||twilioError(e),'bad')}}
async function prepareMic(){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw Error('Chrome cannot access a microphone on this page.');let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});const track=stream.getAudioTracks()[0];if(!track)throw Error('No microphone input was found.');const settings=track.getSettings?track.getSettings():{};inputDeviceId=settings.deviceId||'default'}catch(e){throw Error('Microphone '+(e&&e.name?e.name+': ':'')+err(e))}finally{if(stream)stream.getTracks().forEach(t=>t.stop())}}
function refreshButtons(){const lp=currentLead?normalizePhone(currentLead['Business Phone Number']):'',mp=normalizePhone($('manualPhone').value);$('callLead').disabled=!deviceReady||!lp||!!currentCall;$('callManual').disabled=!deviceReady||!mp||!!currentCall;$('smsLead').disabled=!lp;$('smsManual').disabled=!mp;}
async function startCall(phone,mode){if(!phone)return alert('Enter a valid Australian phone number.');if(!deviceReady)return alert('Phone system is not ready yet.');if(currentCall)return alert('Another call is active.');callMode=mode;lastCallSeconds[mode]=0;lastCallError='';const sid=mode==='manual'?'manualStatus':'leadStatus';setStatus(sid,'Checking contact permissions...');showCallDock(phone);try{const permission=await api('checkDnc',{phoneNumber:phone});if(permission.blocked)throw Error('This number is on the Do Not Call list. Remove it before calling.');setStatus(sid,'Opening microphone...');setCallPhase('Opening microphone…');await prepareMic();await device.audio.setInputDevice(inputDeviceId);setStatus(sid,'Calling '+phone+'...');setCallPhase('Dialling '+phone+'…');currentCall=await device.connect({params:{To:phone},rtcConstraints:{audio:{deviceId:{ideal:inputDeviceId},echoCancellation:true,noiseSuppression:true,autoGainControl:true}}});toggleCallButtons();currentCall.on('ringing',()=>{setStatus(sid,'📞 Ringing...');setCallPhase('Ringing…')});currentCall.on('accept',()=>{setStatus(sid,'🟢 Call connected','good');startCallClock()});currentCall.on('mute',muted=>{isCallMuted=muted;$('muteCall').classList.toggle('active',muted);$('muteCall').textContent=muted?'🎙 Unmute':'🎙 Mute';setCallPhase(muted?'Connected · microphone muted':'Connected · microphone live',true)});currentCall.on('disconnect',()=>finishCall(lastCallError||'Call ended',!!lastCallError));currentCall.on('cancel',()=>finishCall(lastCallError||'Call cancelled',!!lastCallError));currentCall.on('reject',()=>finishCall(lastCallError||'Call not answered',!!lastCallError));currentCall.on('error',e=>{if(!lastCallError)lastCallError=twilioError(e);finishCall(lastCallError,true)})}catch(e){currentCall=null;stopCallClock();lastCallError=/Do Not Call/.test(err(e))?err(e):(/^Microphone\s/.test(err(e))?err(e):twilioError(e));setStatus(sid,lastCallError,'bad');setCallPhase('Call could not start');setTimeout(()=>$('callDock').classList.add('hidden'),1200);releaseMic();refreshButtons()}}
function toggleCallButtons(){$('callLead').classList.toggle('hidden',callMode==='lead');$('hangLead').classList.toggle('hidden',callMode!=='lead');$('callManual').classList.toggle('hidden',callMode==='manual');$('hangManual').classList.toggle('hidden',callMode!=='manual')}
function releaseMic(){if(device&&device.audio&&device.audio.unsetInputDevice)device.audio.unsetInputDevice().catch(()=>{})}
function finishCall(text,bad=false){const sid=callMode==='manual'?'manualStatus':'leadStatus',seconds=stopCallClock();currentCall=null;releaseMic();const duration=seconds?' · '+formatDuration(seconds):'';setStatus(sid,text+duration,bad?'bad':'');setCallPhase((bad?'Call failed':'Call ended')+duration);$('muteCall').disabled=true;$('keypadCall').disabled=true;$('callLead').classList.remove('hidden');$('hangLead').classList.add('hidden');$('callManual').classList.remove('hidden');$('hangManual').classList.add('hidden');refreshButtons();setTimeout(()=>{if(!currentCall)$('callDock').classList.add('hidden')},1400)}
$('muteCall').onclick=()=>{if(currentCall&&callConnected)currentCall.mute(!currentCall.isMuted())};$('keypadCall').onclick=()=>{$('callKeypad').classList.toggle('hidden');$('keypadCall').classList.toggle('active',!$('callKeypad').classList.contains('hidden'))};document.querySelectorAll('#callKeypad [data-digit]').forEach(button=>button.onclick=()=>{if(currentCall&&callConnected)currentCall.sendDigits(button.dataset.digit)});$('dockHang').onclick=()=>{if(currentCall)currentCall.disconnect()};
$('callLead').onclick=()=>startCall(normalizePhone(currentLead&&currentLead['Business Phone Number']),'lead');$('callManual').onclick=()=>startCall(normalizePhone($('manualPhone').value),'manual');$('hangLead').onclick=$('hangManual').onclick=()=>{if(currentCall)currentCall.disconnect()};$('manualPhone').oninput=()=>{$('manualPhoneDisplay').textContent=normalizePhone($('manualPhone').value)||'Enter a valid Australian number';refreshButtons()};

$('saveLead').onclick=async()=>{if(!currentLead)return;const outcome=$('leadOutcome').value;if(!outcome)return alert('Select a call outcome.');const btn=$('saveLead');btn.disabled=true;try{await api('saveCall',{rowNumber:currentLead._row,outcome,notes:$('leadNotes').value,callbackDate:$('leadFollowup').value,callDurationSeconds:lastCallSeconds.lead});alert('Call saved successfully'+(lastCallSeconds.lead?' · '+formatDuration(lastCallSeconds.lead):'')+'.')}catch(e){alert(err(e))}finally{btn.disabled=false}};
$('nextLead').onclick=()=>{if(currentCall&&!confirm('End the active call and move to the next lead?'))return;if(currentCall)currentCall.disconnect();leadIndex++;showLead()};
$('saveManual').onclick=async()=>{const phone=normalizePhone($('manualPhone').value),outcome=$('manualOutcome').value;if(!phone)return alert('Enter a valid Australian phone number.');if(!outcome)return alert('Select a call outcome.');const btn=$('saveManual');btn.disabled=true;try{await api('saveManualCall',{phoneNumber:phone,businessName:$('manualBusiness').value,outcome,notes:$('manualNotes').value,callbackDate:$('manualFollowup').value,callDurationSeconds:lastCallSeconds.manual});alert('Manual call saved successfully'+(lastCallSeconds.manual?' · '+formatDuration(lastCallSeconds.manual):'')+'.');$('manualOutcome').value='';$('manualFollowup').value='';$('manualNotes').value='';lastCallSeconds.manual=0}catch(e){alert(err(e))}finally{btn.disabled=false}};

function switchTab(view){const managementViews=['dashboard','activity','dnc','connectors'];if(!isAdmin&&managementViews.includes(view))view='lead';activeView=view;const views=['dashboard','lead','followups','manual','smsInbox','missed','activity','dnc','connectors'];views.forEach(name=>{$(name+'Tab').classList.toggle('hidden',name!==view||(!isAdmin&&managementViews.includes(name)));$(name+'TabBtn').classList.toggle('active',name===view)});if(view==='dashboard')loadDashboard();if(view==='followups')loadFollowups();if(view==='smsInbox')loadInbox(true);if(view==='missed')loadMissed(true);if(view==='activity')loadActivity();if(view==='dnc')loadDnc();if(view==='connectors')loadConnectors()}
['dashboard','lead','followups','manual','smsInbox','missed','activity','dnc','connectors'].forEach(view=>$(view+'TabBtn').onclick=()=>switchTab(view));
function displayDate(value){const d=new Date(value);return Number.isNaN(d.getTime())?(value||'Unknown time'):d.toLocaleString('en-AU',{dateStyle:'medium',timeStyle:'short'})}
function clearNode(node){while(node.firstChild)node.removeChild(node.firstChild)}
function actionButton(text,cls,handler){const button=document.createElement('button');button.textContent=text;button.className=cls;button.onclick=handler;return button}
function detailLine(label,value){const row=document.createElement('div');row.className='feed-body';const strong=document.createElement('strong');strong.textContent=label+': ';row.append(strong,document.createTextNode(value||'—'));return row}

async function loadDashboard(){const state=$('dashboardState'),metrics=$('metrics');state.textContent='Loading dashboard...';state.className='status';clearNode(metrics);try{const data=await api('getCrmOverview');const cards=[['Ready leads',data.ready],['Completed',data.completed],['Appointments',data.appointments],['Due today',data.dueToday],['Overdue',data.overdue],['Activity today',data.activityToday],['DNC blocked',data.dnc],['Duplicate numbers',data.duplicates]];cards.forEach(([label,value])=>{const card=document.createElement('div');card.className='metric';const small=document.createElement('div');small.className='muted';small.textContent=label;const strong=document.createElement('strong');strong.textContent=value;card.append(small,strong);metrics.append(card)});state.textContent='Dashboard updated '+new Date().toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'});state.className='status good'}catch(e){state.textContent=err(e);state.className='status bad'}}
$('refreshDashboard').onclick=loadDashboard;

async function loadFollowups(){const state=$('followupsState'),list=$('followupsList');state.textContent='Loading follow-ups...';state.className='status';clearNode(list);try{const items=await api('getFollowUps');if(!items.length){state.textContent='No follow-ups scheduled.';return}state.textContent=items.length+' follow-up'+(items.length===1?'':'s');state.className='status good';items.forEach(item=>{const card=document.createElement('div');card.className='feed-item';const top=document.createElement('div');top.className='feed-top';const title=document.createElement('div');title.className='feed-phone';title.textContent=item['Business Name']||item['Company Name']||'Unknown business';const date=document.createElement('div');date.className='feed-time';date.textContent=item.followUpDate;top.append(title,date);const phone=normalizePhone(item['Business Phone Number']||item['Phone Number']||item.Phone);card.append(top,detailLine('Phone',phone||'Invalid number'),detailLine('Outcome',item['Call Outcome']||item.Outcome));if(phone){const actions=document.createElement('div');actions.className='feed-actions';actions.append(actionButton('CALL','green',()=>{$('manualPhone').value=phone;$('manualBusiness').value=title.textContent;$('manualPhone').dispatchEvent(new Event('input'));switchTab('manual')}),actionButton('SMS','purple',()=>openSms(phone,'',item._row)));card.append(actions)}list.append(card)})}catch(e){state.textContent=err(e);state.className='status bad'}}
$('refreshFollowups').onclick=loadFollowups;

async function loadActivity(){const state=$('activityState'),list=$('activityList');state.textContent='Loading activity...';state.className='status';clearNode(list);try{activityCache=await api('getActivity',{phoneNumber:$('activityPhone').value,limit:300});renderActivity()}catch(e){state.textContent=err(e);state.className='status bad'}}
function renderActivity(){const state=$('activityState'),list=$('activityList'),type=$('activityType').value;clearNode(list);const items=activityCache.filter(item=>!type||item.type===type);if(!items.length){state.textContent='No matching activity yet.';state.className='status';return}state.textContent=items.length+' activity record'+(items.length===1?'':'s');state.className='status good';items.forEach(item=>{const card=document.createElement('div');card.className='feed-item';const top=document.createElement('div');top.className='feed-top';const title=document.createElement('div');title.className='feed-phone';title.textContent=(item.type||'activity').toUpperCase()+' · '+(item.business||item.phone||'Contact');const date=document.createElement('div');date.className='feed-time';date.textContent=displayDate(item.timestamp);top.append(title,date);card.append(top,detailLine('Employee',item.employee),detailLine('Phone',item.phone),detailLine('Outcome',item.outcome),detailLine('Details',item.details));list.append(card)})}
$('refreshActivity').onclick=loadActivity;$('activityType').onchange=renderActivity;$('activityPhone').onchange=loadActivity;
$('exportActivity').onclick=()=>{const rows=[['Date','Type','Employee','Phone','Business','Outcome','Details'],...activityCache.map(item=>[item.timestamp,item.type,item.employee,item.phone,item.business,item.outcome,item.details])];const csv=rows.map(row=>row.map(value=>'"'+String(value||'').replace(/"/g,'""')+'"').join(',')).join('\n');const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));link.download='hsa-activity-'+today()+'.csv';link.click();URL.revokeObjectURL(link.href)};

async function loadDnc(){const state=$('dncState'),list=$('dncList');state.textContent='Loading blocked numbers...';state.className='status';clearNode(list);try{const items=await api('getDnc');if(!items.length){state.textContent='No numbers are blocked.';return}state.textContent=items.length+' blocked number'+(items.length===1?'':'s');state.className='status good';items.forEach(item=>{const card=document.createElement('div');card.className='feed-item';const top=document.createElement('div');top.className='feed-top';const phone=document.createElement('div');phone.className='feed-phone';phone.textContent=item.phoneNumber;const date=document.createElement('div');date.className='feed-time';date.textContent=displayDate(item.addedAt);top.append(phone,date);const actions=document.createElement('div');actions.className='feed-actions';actions.append(actionButton('REMOVE','danger-outline',async()=>{if(!confirm('Remove '+item.phoneNumber+' from the Do Not Call list?'))return;await api('setDnc',{phoneNumber:item.phoneNumber,blocked:false});loadDnc();loadDashboard()}));card.append(top,detailLine('Reason',item.reason),detailLine('Added by',item.addedBy),actions);list.append(card)})}catch(e){state.textContent=err(e);state.className='status bad'}}
$('addDnc').onclick=async()=>{const phone=normalizePhone($('dncPhone').value);if(!phone)return alert('Enter a valid Australian phone number.');try{await api('setDnc',{phoneNumber:phone,blocked:true,reason:$('dncReason').value});$('dncPhone').value='';$('dncReason').value='';await Promise.all([loadDnc(),loadDashboard()])}catch(e){alert(err(e))}};

async function loadDuplicates(){const state=$('duplicatesState'),list=$('duplicatesList');state.textContent='Checking duplicates...';state.className='status';clearNode(list);try{const items=await api('findDuplicates');if(!items.length){state.textContent='No duplicate phone numbers found.';state.className='status good';return}state.textContent=items.length+' duplicated phone number'+(items.length===1?'':'s');state.className='status bad';items.forEach(item=>{const card=document.createElement('div');card.className='feed-item';card.append(detailLine('Phone',item.phoneNumber),detailLine('Records',item.records.map(record=>(record.businessName||'Unknown')+' (row '+record.rowNumber+')').join(', ')));list.append(card)})}catch(e){state.textContent=err(e);state.className='status bad'}}
$('refreshDuplicates').onclick=loadDuplicates;

async function loadConnectors(){const state=$('connectorsState'),list=$('connectorsList');state.textContent='Loading connectors...';state.className='status';clearNode(list);try{const items=await api('getConnectors');if(!items.length){state.textContent='No connectors added yet.';return}state.textContent=items.length+' connector'+(items.length===1?'':'s');state.className='status good';items.forEach(item=>{const card=document.createElement('div');card.className='connector';const title=document.createElement('div');title.className='feed-phone';title.textContent=item.name+(item.enabled?'':' (disabled)');card.append(title,detailLine('Webhook',item.url),detailLine('Events',(item.events||[]).join(', ')));const actions=document.createElement('div');actions.className='feed-actions';actions.append(actionButton('TEST','grey',async()=>{try{const result=await api('testConnector',{id:item.id});alert(result.message)}catch(e){alert(err(e))}}),actionButton('DELETE','danger-outline',async()=>{if(!confirm('Delete '+item.name+'?'))return;await api('deleteConnector',{id:item.id});loadConnectors()}));card.append(actions);list.append(card)})}catch(e){state.textContent=err(e);state.className='status bad'}}
$('saveConnector').onclick=async()=>{const events=[];if($('eventCalls').checked)events.push('call.saved');if($('eventSms').checked)events.push('sms.sent');if($('eventDnc').checked)events.push('contact.blocked','contact.unblocked');try{await api('saveConnector',{connector:{name:$('connectorName').value,url:$('connectorUrl').value,events,enabled:true}});$('connectorName').value='';$('connectorUrl').value='';await loadConnectors()}catch(e){alert(err(e))}};

function seenKey(type){return 'hsa-seen-'+type+'-'+username}
function itemTime(item){const value=item.receivedAt||item.date||'';const parsed=Date.parse(value);return Number.isNaN(parsed)?0:parsed}
function unseenItems(type,items){const seen=Number(localStorage.getItem(seenKey(type))||0);return items.filter(item=>itemTime(item)>seen)}
function markSeen(type,items){const newest=Math.max(Date.now(),...items.map(itemTime));localStorage.setItem(seenKey(type),String(newest))}
function renderAlert(){const parts=[];if(lastAlertCounts.sms)parts.push(lastAlertCounts.sms+' new SMS');if(lastAlertCounts.calls)parts.push(lastAlertCounts.calls+' new missed call'+(lastAlertCounts.calls===1?'':'s'));$('alertBar').textContent=parts.length?'NEW ACTIVITY  ·  '+parts.join('  ·  ')+'  —  Open to review':'No new activity';$('alertBar').classList.toggle('hidden',!parts.length)}
async function loadAlerts(){if(!sessionToken)return;try{const [messages,calls]=await Promise.all([api('getIncomingSms'),api('getMissedCalls')]);lastAlertCounts={sms:unseenItems('sms',messages).length,calls:unseenItems('calls',calls).length};renderAlert()}catch(e){}}
$('alertBar').onclick=()=>switchTab(lastAlertCounts.sms?'smsInbox':'missed');
async function loadInbox(markRead=false){const state=$('smsInboxState'),list=$('smsInboxList');state.textContent='Loading messages...';state.className='status';clearNode(list);try{const messages=await api('getIncomingSms');if(markRead){markSeen('sms',messages);lastAlertCounts.sms=0;renderAlert()}if(!messages.length){state.textContent='No received messages yet.';return}state.textContent=messages.length+' received message'+(messages.length===1?'':'s');state.className='status good';messages.forEach(message=>{const item=document.createElement('div');item.className='feed-item';const top=document.createElement('div');top.className='feed-top';const phone=document.createElement('div');phone.className='feed-phone';phone.textContent=message.from||'Unknown number';const time=document.createElement('div');time.className='feed-time';time.textContent=displayDate(message.receivedAt);top.append(phone,time);const body=document.createElement('div');body.className='feed-body';body.textContent=message.body||'(No text message)';item.append(top,body);if(message.mediaCount){const media=document.createElement('div');media.className='muted';media.style.marginTop='8px';media.textContent=message.mediaCount+' media attachment'+(message.mediaCount===1?'':'s');item.append(media)}const actions=document.createElement('div');actions.className='feed-actions';actions.append(actionButton('Reply','purple',()=>openSms(message.from,'','')));item.append(actions);list.append(item)})}catch(e){state.textContent=err(e);state.className='status bad'}}
async function loadMissed(markRead=false){const state=$('missedState'),list=$('missedList');state.textContent='Loading missed calls...';state.className='status';clearNode(list);try{const calls=await api('getMissedCalls');if(markRead){markSeen('calls',calls);lastAlertCounts.calls=0;renderAlert()}if(!calls.length){state.textContent='No missed calls found.';return}state.textContent=calls.length+' missed call'+(calls.length===1?'':'s');state.className='status good';calls.forEach(call=>{const item=document.createElement('div');item.className='feed-item';const top=document.createElement('div');top.className='feed-top';const phone=document.createElement('div');phone.className='feed-phone';phone.textContent=call.from||'Unknown number';const time=document.createElement('div');time.className='feed-time';time.textContent=displayDate(call.receivedAt);top.append(phone,time);const status=document.createElement('span');status.className='pill';status.textContent=(call.status||'missed').replace(/-/g,' ');const actions=document.createElement('div');actions.className='feed-actions';actions.append(actionButton('Call back','green',()=>{$('manualPhone').value=call.from||'';$('manualPhone').dispatchEvent(new Event('input'));switchTab('manual')}));item.append(top,status,actions);list.append(item)})}catch(e){state.textContent=err(e);state.className='status bad'}}
$('refreshInbox').onclick=()=>loadInbox(true);$('refreshMissed').onclick=()=>loadMissed(true);
function openSms(phone,name,row){smsContext={phone,name,row};$('smsTarget').textContent='Sending to '+phone;$('smsName').value=name||'';$('smsDate').value='';$('smsTime').value='';$('smsBody').value='';$('smsType').value='appointment';$('smsMsg').classList.add('hidden');changeSmsType();$('smsModal').classList.remove('hidden')}
$('smsLead').onclick=()=>{const p=normalizePhone(currentLead&&currentLead['Business Phone Number']);if(p)openSms(p,currentLead['Decision Maker Name']||'',currentLead._row)};$('smsManual').onclick=()=>{const p=normalizePhone($('manualPhone').value);if(p)openSms(p,$('manualContact').value,'')};
function changeSmsType(){const appointment=$('smsType').value==='appointment';$('appointmentFields').classList.toggle('hidden',!appointment);$('customFields').classList.toggle('hidden',appointment)}$('smsType').onchange=changeSmsType;$('smsBody').oninput=()=>{$('smsCount').textContent=$('smsBody').value.length+' characters'};
$('smsTemplate').onchange=()=>{if(!$('smsTemplate').value)return;$('smsType').value='custom';changeSmsType();$('smsBody').value=$('smsTemplate').value;$('smsBody').dispatchEvent(new Event('input'))};
function closeSms(){$('smsModal').classList.add('hidden')}$('closeSms').onclick=$('cancelSms').onclick=closeSms;
$('sendSms').onclick=async()=>{const btn=$('sendSms'),msg=$('smsMsg'),appointment=$('smsType').value==='appointment';let action,data;if(appointment){if(!$('smsDate').value||!$('smsTime').value)return alert('Select appointment date and time.');action='sendAppointmentSms';data={phoneNumber:smsContext.phone,contactName:$('smsName').value,appointmentDate:$('smsDate').value,appointmentTime:$('smsTime').value,leadRow:smsContext.row}}else{if(!$('smsBody').value.trim())return alert('Enter an SMS message.');action='sendCustomSms';data={phoneNumber:smsContext.phone,message:$('smsBody').value.trim(),leadRow:smsContext.row}}btn.disabled=true;btn.textContent='SENDING...';try{const r=await api(action,data);msg.textContent=r.message||'SMS sent successfully.';msg.className='message success';setTimeout(closeSms,1300)}catch(e){msg.textContent=err(e);msg.className='message error'}finally{btn.disabled=false;btn.textContent='SEND SMS'}};

$('logout').onclick=()=>{if(currentCall)currentCall.disconnect();clearInterval(callTimerHandle);$('callDock').classList.add('hidden');if(device)device.destroy();sessionToken='';username='';employeeName='';userRole='';isAdmin=false;allLeads=[];leads=[];currentLead=null;device=null;deviceReady=false;lastAlertCounts={sms:0,calls:0};$('app').classList.add('hidden');$('login').classList.remove('hidden');$('password').value=''};
fillOutcomes('leadOutcome');fillOutcomes('manualOutcome');['leadFollowup','manualFollowup','smsDate'].forEach(id=>$(id).min=today());refreshButtons();
setInterval(()=>{if(sessionToken)loadAlerts()},60000);
</script>
</body></html>`;

const ALLOWED_ACTIONS = new Set([
  'getLeads', 'getTwilioToken', 'saveCall', 'saveManualCall',
  'sendCustomSms', 'sendAppointmentSms', 'getIncomingSms', 'getMissedCalls',
  'getCrmOverview', 'getFollowUps', 'getActivity', 'getDnc', 'setDnc',
  'checkDnc', 'findDuplicates', 'getConnectors', 'saveConnector',
  'deleteConnector', 'testConnector'
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(HTML, { headers: pageHeaders() });
    }
    if (request.method === 'POST' && url.pathname === '/api') {
      return handleApi(request, env);
    }
    if (request.method === 'POST' && url.pathname === '/voice') {
      return handleVoice(request, env);
    }
    return new Response('Not found', { status: 404 });
  }
};

async function handleVoice(request, env) {
  try {
    console.log('HSA voice webhook received');
    if (!env.TWILIO_AUTH_TOKEN || !env.TWILIO_CALLER_ID) {
      console.log('HSA voice result: missing Cloudflare voice variables');
      return twiml('<Say>Voice configuration is incomplete.</Say><Hangup/>', 500);
    }

    const body = await request.text();
    const parameters = new URLSearchParams(body);
    const signature = request.headers.get('X-Twilio-Signature') || '';
    if (!await validTwilioSignature(request.url, parameters, signature, env.TWILIO_AUTH_TOKEN)) {
      console.log('HSA voice result: Twilio signature rejected; signature present=' + Boolean(signature));
      return twiml('<Hangup/>', 403);
    }

    const destination = normalizeAustralianNumber(parameters.get('To'));
    const callerId = normalizeAustralianNumber(env.TWILIO_CALLER_ID);
    const from = String(parameters.get('From') || parameters.get('Caller') || '');
    if (!destination || !callerId || !from.startsWith('client:')) {
      console.log('HSA voice result: parameters rejected; destination=' + Boolean(destination) + ', callerId=' + Boolean(callerId) + ', client=' + from.startsWith('client:'));
      return twiml('<Hangup/>', 400);
    }

    console.log('HSA voice result: dial TwiML returned');
    return twiml(
      '<Dial callerId="' + escapeXml(callerId) + '" answerOnBridge="true" timeout="30">' +
      '<Number>' + escapeXml(destination) + '</Number></Dial>'
    );
  } catch (error) {
    console.log('HSA voice result: internal error ' + String(error && error.message || error));
    return twiml('<Hangup/>', 500);
  }
}

async function validTwilioSignature(url, parameters, supplied, authToken) {
  if (!supplied) return false;
  const entries = Array.from(parameters.entries()).sort((a, b) =>
    a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])
  );
  let value = url;
  for (const entry of entries) value += entry[0] + entry[1];
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(authToken),
    { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
  let binary = '';
  for (const byte of digest) binary += String.fromCharCode(byte);
  return safeEqual(btoa(binary), supplied);
}

function safeEqual(a, b) {
  a = String(a || ''); b = String(b || '');
  let mismatch = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) mismatch |= (a.charCodeAt(i % Math.max(a.length, 1)) || 0) ^ (b.charCodeAt(i % Math.max(b.length, 1)) || 0);
  return mismatch === 0;
}

function normalizeAustralianNumber(value) {
  let phone = String(value || '').trim().replace(/[^\d+]/g, '');
  if (phone.startsWith('0061')) phone = '+61' + phone.slice(4);
  if (phone.startsWith('+610')) phone = '+61' + phone.slice(4);
  if (phone.startsWith('61')) phone = '+' + phone;
  if (/^0[23478]\d{8}$/.test(phone)) phone = '+61' + phone.slice(1);
  return /^\+61[23478]\d{8}$/.test(phone) ? phone : '';
}

function escapeXml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function twiml(content, status = 200) {
  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response>' + content + '</Response>', {
    status,
    headers: { 'Content-Type': 'text/xml; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

async function handleApi(request, env) {
  try {
    if (!env.GAS_BACKEND_URL || !env.HSA_BRIDGE_SECRET) {
      throw new Error('Server configuration is incomplete.');
    }
    const body = await request.json();
    const action = String(body.action || '');
    const data = body.data && typeof body.data === 'object' ? body.data : {};

    if (action === 'login') {
      const result = await callGas(env, action, data);
      if (!result || !result.success) return json({ ok: true, result });
      result.sessionToken = await createSession(result.username, env.HSA_BRIDGE_SECRET);
      return json({ ok: true, result });
    }

    if (!ALLOWED_ACTIONS.has(action)) return json({ ok: false, error: 'Unsupported action.' }, 400);
    const token = String(request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const session = await verifySession(token, env.HSA_BRIDGE_SECRET);
    if (!session) return json({ ok: false, error: 'Your session expired. Please log in again.' }, 401);
    data.username = session.sub;
    const result = await callGas(env, action, data);
    return json({ ok: true, result });
  } catch (error) {
    return json({ ok: false, error: error.message || 'Request failed.' }, 500);
  }
}

async function callGas(env, action, data) {
  const response = await fetch(env.GAS_BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bridgeSecret: env.HSA_BRIDGE_SECRET, action, data }),
    redirect: 'follow'
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); }
  catch (_) { throw new Error('Apps Script returned an invalid response. Redeploy Code.gs.'); }
  if (!body.ok) throw new Error(body.error || 'Apps Script request failed.');
  return body.result;
}

async function createSession(username, secret) {
  const payload = base64Url(new TextEncoder().encode(JSON.stringify({
    sub: username,
    exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60
  })));
  return payload + '.' + await sign(payload, secret);
}

async function verifySession(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('HMAC', key, fromBase64Url(parts[1]), new TextEncoder().encode(parts[0]));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[0])));
    if (!payload.sub || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (_) { return null; }
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))));
}

function base64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value) {
  value = value.replace(/-/g, '+').replace(/_/g, '/');
  while (value.length % 4) value += '=';
  const binary = atob(value);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

function pageHeaders() {
  return {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Permissions-Policy': 'microphone=(self)',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };
}
