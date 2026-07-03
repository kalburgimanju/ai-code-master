/**
 * MyAIEmployee Widget — Embed an AI employee on any website.
 * Usage:
 *   <script src="https://ai-text-voice-generator-app.netlify.app/widget.js"></script>
 *   <div id="myaiemployee-widget"
 *     data-agent-id="YOUR_AGENT_ID"
 *     data-agent-name="Support Bot"
 *     data-agent-role="Customer Support"
 *     data-theme="dark|light"
 *     data-position="bottom-right|bottom-left"
 *     data-agent-options='[{"title":"Product A","desc":"Details"},{"title":"Product B","desc":"Details"}]'>
 *   </div>
 *
 *   data-agent-options — JSON array of products/services shown as clickable chips
 *   in the initial greeting. When a chip is tapped, the widget responds with info
 *   from the "desc" field and a set of follow-up options.
 */
(function () {
  'use strict';

  function init() {
    var EL = document.getElementById('myaiemployee-widget');
    if (!EL) return;

    var agentId = EL.getAttribute('data-agent-id') || 'default';
    var agentName = EL.getAttribute('data-agent-name') || 'AI Employee';
    var agentRole = EL.getAttribute('data-agent-role') || '';
    var theme = EL.getAttribute('data-theme') || 'dark';
    var position = EL.getAttribute('data-position') || 'bottom-right';
    var optionsRaw = EL.getAttribute('data-agent-options') || '';
    var options = [];
    try { options = JSON.parse(optionsRaw); } catch (e) { /* no options */ }
    if (!Array.isArray(options)) options = [];

    // Escape agentId for use in CSS selectors (only allow safe chars)
    var safeId = agentId.replace(/[^a-zA-Z0-9_-]/g, '_');
    var BID = 'myai-widget-btn-' + safeId;
    var PID = 'myai-widget-panel-' + safeId;

    // --- Stylesheet ---
    var sharedGradient = 'linear-gradient(135deg,#6366f1,#8b5cf6)';
    var btnPos, panelPos;
    if (position === 'bottom-left') {
      btnPos = 'bottom:20px!important;left:20px!important;';
      panelPos = 'bottom:95px!important;left:20px!important;';
    } else {
      btnPos = 'bottom:20px!important;right:20px!important;';
      panelPos = 'bottom:95px!important;right:20px!important;';
    }

    var css = [
      '#' + BID + '{',
      'position:fixed!important;',
      'z-index:2147483647!important;',
      btnPos,
      'width:60px!important;height:60px!important;',
      'border-radius:50%!important;',
      'border:none!important;outline:none!important;',
      'cursor:pointer!important;',
      'display:flex!important;',
      'align-items:center!important;justify-content:center!important;',
      'background:' + sharedGradient + '!important;',
      'color:#fff!important;',
      'box-shadow:0 4px 24px rgba(0,0,0,0.25)!important;',
      'transition:transform .2s ease,box-shadow .2s ease!important;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif!important;',
      'opacity:1!important;visibility:visible!important;',
      'pointer-events:auto!important;',
      '}',
      '#' + BID + ':hover{',
      'transform:scale(1.08)!important;',
      'box-shadow:0 6px 32px rgba(0,0,0,0.35)!important;',
      '}',
      '#' + BID + ' span{',
      'color:#fff!important;',
      'font-size:24px!important;font-weight:700!important;',
      'line-height:1!important;',
      'font-family:inherit!important;',
      '}',

      '#' + PID + '{',
      'position:fixed!important;',
      'z-index:2147483646!important;',
      panelPos,
      'width:380px!important;height:600px!important;',
      'max-height:calc(100vh - 100px)!important;',
      'border-radius:16px!important;overflow:hidden!important;',
      'display:none!important;flex-direction:column!important;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif!important;',
      'box-shadow:0 8px 40px rgba(0,0,0,0.3)!important;',
      'animation:myaiSlideUp .3s ease!important;',
      '}',
      '#' + PID + '.open{display:flex!important;}',
      '#' + PID + '.dark{background:#1e1e2e!important;border:1px solid rgba(255,255,255,0.08)!important;}',
      '#' + PID + '.light{background:#fff!important;border:1px solid rgba(0,0,0,0.1)!important;}',

      '#' + PID + ' .myai-header{',
      'padding:16px 20px!important;display:flex!important;',
      'align-items:center!important;gap:12px!important;',
      'background:' + sharedGradient + '!important;',
      'border-bottom:1px solid rgba(255,255,255,0.1)!important;',
      '}',
      '#' + PID + ' .myai-avatar{',
      'width:36px!important;height:36px!important;',
      'border-radius:50%!important;',
      'background:rgba(255,255,255,0.2)!important;',
      'display:flex!important;align-items:center!important;justify-content:center!important;',
      'color:#fff!important;font-size:16px!important;font-weight:700!important;',
      'flex-shrink:0!important;',
      '}',
      '#' + PID + ' .myai-info{flex:1!important;min-width:0!important;}',
      '#' + PID + ' .myai-info h3{margin:0!important;padding:0!important;color:#fff!important;font-size:15px!important;font-weight:600!important;}',
      '#' + PID + ' .myai-info p{margin:0!important;padding:0!important;color:rgba(255,255,255,0.7)!important;font-size:12px!important;}',
      '#' + PID + ' .myai-close{',
      'background:none!important;border:none!important;',
      'color:rgba(255,255,255,0.7)!important;font-size:22px!important;',
      'cursor:pointer!important;padding:4px!important;line-height:1!important;',
      '}',
      '#' + PID + ' .myai-close:hover{color:#fff!important;}',

      '#' + PID + ' .myai-messages{',
      'flex:1!important;overflow-y:auto!important;padding:16px!important;',
      'display:flex!important;flex-direction:column!important;gap:12px!important;',
      '}',
      '#' + PID + '.dark .myai-messages{background:#181825!important;}',
      '#' + PID + '.light .myai-messages{background:#f5f5f5!important;}',

      '#' + PID + ' .myai-msg{',
      'max-width:85%!important;padding:10px 14px!important;',
      'border-radius:12px!important;font-size:14px!important;',
      'line-height:1.5!important;word-wrap:break-word!important;',
      '}',
      '#' + PID + ' .myai-msg.bot{align-self:flex-start!important;}',
      '#' + PID + '.dark .myai-msg.bot{background:#313244!important;color:#cdd6f4!important;}',
      '#' + PID + '.light .myai-msg.bot{background:#fff!important;color:#333!important;border:1px solid #e0e0e0!important;}',
      '#' + PID + ' .myai-msg.user{align-self:flex-end!important;}',
      '#' + PID + '.dark .myai-msg.user,',
      '#' + PID + '.light .myai-msg.user{',
      'background:#6366f1!important;color:#fff!important;',
      '}',
      '#' + PID + ' .myai-typing{',
      'align-self:flex-start!important;',
      'padding:14px 18px!important;',
      'background:#313244!important;',
      'border-radius:12px!important;',
      'display:flex!important;align-items:center!important;gap:4px!important;',
      '}',
      '#' + PID + '.light .myai-typing{background:#fff!important;border:1px solid #e0e0e0!important;}',
      '#' + PID + ' .myai-typing span{',
      'width:8px!important;height:8px!important;',
      'border-radius:50%!important;',
      'background:#6366f1!important;',
      'display:inline-block!important;',
      'animation:myaiBounce 1.4s ease-in-out infinite!important;',
      '}',
      '#' + PID + ' .myai-typing span:nth-child(2){animation-delay:0.2s!important;}',
      '#' + PID + ' .myai-typing span:nth-child(3){animation-delay:0.4s!important;}',
      '@keyframes myaiBounce{',
      '0%,80%,100%{transform:scale(0.6);opacity:0.4;}',
      '40%{transform:scale(1);opacity:1;}',
      '}',

      '#' + PID + ' .myai-input-area{',
      'padding:12px 16px!important;display:flex!important;gap:8px!important;',
      'border-top:1px solid!important;',
      '}',
      '#' + PID + '.dark .myai-input-area{background:#1e1e2e!important;border-color:rgba(255,255,255,0.08)!important;}',
      '#' + PID + '.light .myai-input-area{background:#fff!important;border-color:rgba(0,0,0,0.1)!important;}',
      '#' + PID + ' .myai-input-area input{',
      'flex:1!important;border:1px solid!important;border-radius:10px!important;',
      'padding:10px 14px!important;font-size:14px!important;outline:none!important;',
      'font-family:inherit!important;',
      '}',
      '#' + PID + '.dark .myai-input-area input{background:#313244!important;border-color:rgba(255,255,255,0.1)!important;color:#cdd6f4!important;}',
      '#' + PID + '.dark .myai-input-area input::placeholder{color:#6c7086!important;}',
      '#' + PID + '.light .myai-input-area input{background:#f5f5f5!important;border-color:#e0e0e0!important;color:#333!important;}',
      '#' + PID + ' .myai-input-area button{',
      'width:40px!important;height:40px!important;border-radius:10px!important;',
      'border:none!important;background:#6366f1!important;color:#fff!important;',
      'font-size:18px!important;cursor:pointer!important;',
      'display:flex!important;align-items:center!important;justify-content:center!important;',
      'flex-shrink:0!important;',
      '}',
      '#' + PID + ' .myai-input-area button:hover{background:#7c3aed!important;}',

      '#' + PID + ' .myai-chips{',
      'display:flex!important;flex-wrap:wrap!important;gap:8px!important;',
      'padding:4px 16px 12px!important;',
      '}',
      '#' + PID + ' .myai-chip{',
      'padding:8px 16px!important;border-radius:20px!important;',
      'border:1px solid #6366f1!important;',
      'background:transparent!important;color:#6366f1!important;',
      'font-size:13px!important;font-family:inherit!important;',
      'cursor:pointer!important;transition:all .2s!important;',
      'white-space:nowrap!important;line-height:1!important;',
      '}',
      '#' + PID + ' .myai-chip:hover{background:#6366f1!important;color:#fff!important;}',
      '#' + PID + ' .myai-chip:disabled{opacity:0.4!important;cursor:default!important;}',
      '#' + PID + '.light .myai-chip{color:#6366f1!important;border-color:#6366f1!important;}',
      '#' + PID + '.light .myai-chip:hover{color:#fff!important;}',

      '@keyframes myaiSlideUp{',
      'from{opacity:0;transform:translateY(20px) scale(.96);}',
      'to{opacity:1;transform:translateY(0) scale(1);}',
      '}',

      '@media (max-width:480px){',
      '#' + PID + '{',
      'width:100vw!important;height:100vh!important;',
      'max-height:100vh!important;border-radius:0!important;',
      'top:0!important;left:0!important;right:0!important;bottom:0!important;',
      '}',
      '}',
    ].join('\n');

    // Inject the style into the page
    var elStyle = document.createElement('style');
    elStyle.textContent = css;
    document.head.appendChild(elStyle);

    // --- Build DOM ---
    var btn = document.createElement('button');
    btn.id = BID;
    btn.setAttribute('aria-label', 'Open AI chat');
    btn.innerHTML = '<span>' + agentName.charAt(0).toUpperCase() + '</span>';

    var roleHtml = agentRole ? '<p>' + escapeHtml(agentRole) + '</p>' : '';
    var greeting = 'Hi! I&#39;m ' + escapeHtml(agentName) + '.';
    if (options.length > 0) {
      greeting += ' Here&#39;s what I can help you with:';
    } else {
      greeting += ' How can I help you today?';
    }

    var panel = document.createElement('div');
    panel.id = PID;
    panel.className = theme;

    // Build chips HTML
    var chipsHtml = '';
    if (options.length > 0) {
      chipsHtml = '<div class="myai-chips" id="myai-chips-' + safeId + '">';
      for (var oi = 0; oi < options.length; oi++) {
        chipsHtml += '<button class="myai-chip" data-opt="' + oi + '" data-title="' + escapeHtml(options[oi].title) + '" data-desc="' + escapeHtml(options[oi].desc || '') + '">' + escapeHtml(options[oi].title) + '</button>';
      }
      chipsHtml += '</div>';
    }

    panel.innerHTML =
      '<div class="myai-header">' +
      '<div class="myai-avatar">' + agentName.charAt(0).toUpperCase() + '</div>' +
      '<div class="myai-info"><h3>' + escapeHtml(agentName) + '</h3>' + roleHtml + '</div>' +
      '<button class="myai-close" aria-label="Close chat">&times;</button></div>' +
      '<div class="myai-messages">' +
      '<div class="myai-msg bot">' + greeting + '</div></div>' +
      chipsHtml +
      '<div class="myai-input-area">' +
      '<input type="text" placeholder="Type your message..." />' +
      '<button aria-label="Send message">&#10148;</button></div>';

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    // --- Logic ---
    var isOpen = false;
    var msgContainer = panel.querySelector('.myai-messages');
    var input = panel.querySelector('.myai-input-area input');
    var sendBtn = panel.querySelector('.myai-input-area button');
    var closeBtn = panel.querySelector('.myai-close');

    function togglePanel() {
      isOpen = !isOpen;
      btn.style.display = isOpen ? 'none' : 'flex';
      panel.classList.toggle('open', isOpen);
      if (isOpen && input) input.focus();
    }

    function addMessage(text, role) {
      var el = document.createElement('div');
      el.className = 'myai-msg ' + role;
      el.textContent = text;
      if (msgContainer) {
        msgContainer.appendChild(el);
        msgContainer.scrollTop = msgContainer.scrollHeight;
      }
    }

    function addTypingIndicator() {
      var el = document.createElement('div');
      el.className = 'myai-typing';
      el.innerHTML = '<span></span><span></span><span></span>';
      if (msgContainer) {
        msgContainer.appendChild(el);
        msgContainer.scrollTop = msgContainer.scrollHeight;
      }
      return el;
    }

    function removeTypingIndicator(el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    // Find the best matching resource for a query
    function findMatch(query) {
      var q = query.toLowerCase();
      var best = null;
      var bestScore = 0;

      for (var oi = 0; oi < options.length; oi++) {
        var opt = options[oi];
        var title = (opt.title || '').toLowerCase();
        var desc = (opt.desc || '').toLowerCase();

        var score = 0;
        var words = q.split(/\s+/);
        for (var wi = 0; wi < words.length; wi++) {
          var w = words[wi];
          if (w.length < 2) continue;
          if (title.indexOf(w) !== -1) score += 3;
          if (desc.indexOf(w) !== -1) score += 1;
        }
        // Exact title match gets a big boost
        if (title === q) score += 10;
        // Title contains query gets a boost
        if (title.indexOf(q) !== -1) score += 5;

        if (score > bestScore) {
          bestScore = score;
          best = opt;
        }
      }

      return best;
    }

    function sendMessage() {
      var text = input ? input.value.trim() : '';
      if (!text) return;
      addMessage(text, 'user');
      if (input) input.value = '';

      // Show typing indicator
      var typingEl = addTypingIndicator();

      var delay = 100 + Math.random() * 200;
      setTimeout(function () {
        removeTypingIndicator(typingEl);

        // Try to find matching resource
        var match = findMatch(text);
        if (match && match.desc) {
          var resp = match.desc;
          if (resp.length > 500) resp = resp.slice(0, 500) + '...';
          addMessage(resp, 'bot');
        } else if (options.length > 0) {
          addMessage('I found information on these topics. Try selecting one below:', 'bot');
          // Re-enable chips
          if (chipsContainer) {
            var allChips = chipsContainer.querySelectorAll('.myai-chip');
            for (var ci = 0; ci < allChips.length; ci++) allChips[ci].disabled = false;
          }
        } else {
          addMessage("I'd be happy to help with that! Let me check the details for you.", 'bot');
        }
      }, delay);
    }

    // Chip click handler
    var chipsContainer = document.getElementById('myai-chips-' + safeId);
    function handleChipClick(e) {
      var chip = e.target.closest ? e.target.closest('.myai-chip') : null;
      if (!chip || chip.disabled) return;
      var title = chip.getAttribute('data-title') || '';
      var desc = chip.getAttribute('data-desc') || '';
      if (!title) return;

      // Disable all chips
      var allChips = chipsContainer ? chipsContainer.querySelectorAll('.myai-chip') : [];
      for (var ci = 0; ci < allChips.length; ci++) allChips[ci].disabled = true;

      // Show user selected option
      addMessage(title, 'user');

      // Show typing
      var typingEl = addTypingIndicator();

      // Send to API if configured, otherwise simulate
      var apiUrl = EL.getAttribute('data-api-url') || '';
      if (apiUrl) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', apiUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function () {
          removeTypingIndicator(typingEl);
          var resp = '';
          try { resp = JSON.parse(xhr.responseText).response || xhr.responseText; } catch (e) { resp = xhr.responseText; }
          addMessage(resp, 'bot');
        };
        xhr.onerror = function () {
          removeTypingIndicator(typingEl);
          addMessage('Sorry, something went wrong. Please try again.', 'bot');
        };
        xhr.send(JSON.stringify({ agentId: agentId, message: title }));
      } else {
        var delay = 100 + Math.random() * 200;
        setTimeout(function () {
          removeTypingIndicator(typingEl);
          var resp = desc || 'Here are some details about ' + title + '. Let me know if you need more information!';
          addMessage(resp, 'bot');
        }, delay);
      }
    }

    if (chipsContainer) {
      chipsContainer.addEventListener('click', handleChipClick);
    }

    btn.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', togglePanel);
    sendBtn.addEventListener('click', sendMessage);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') sendMessage();
      });
    }

    // Hide the placeholder div
    EL.style.display = 'none';
  }

  // Run immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
