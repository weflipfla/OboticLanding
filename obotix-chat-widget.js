/**
 * Obotix AI Employee Chat Widget
 * Embeddable med spa AI receptionist demo
 * Add to any page: <script src="obotix-chat-widget.js"></script>
 */
(function () {
  'use strict';

  // âââ CONFIG âââââââââââââââââââââââââââââââââââââââââââââââ
  const CONFIG = {
    botName: 'Ava',
    businessName: 'Glow Med Spa',
    tagline: 'AI Employee Demo',
    primaryColor: '#8b5cf6',
    darkBg: '#0b0b14',
    typingDelay: 800,
    services: [
      { name: 'Botox', price: '$12/unit', duration: '15 min', desc: 'Smooth fine lines and wrinkles with precision injections.' },
      { name: 'Dermal Fillers', price: 'From $650', duration: '30 min', desc: 'Restore volume and contour with hyaluronic acid fillers.' },
      { name: 'HydraFacial', price: '$199', duration: '45 min', desc: 'Deep cleanse, exfoliate, and hydrate for instant glow.' },
      { name: 'Laser Hair Removal', price: 'From $150', duration: '20-60 min', desc: 'Permanent hair reduction with advanced laser technology.' },
      { name: 'Chemical Peel', price: '$175', duration: '30 min', desc: 'Reveal fresh, radiant skin with professional-grade peels.' },
      { name: 'Microneedling', price: '$299', duration: '45 min', desc: 'Stimulate collagen production for firmer, smoother skin.' },
      { name: 'PRP Facial', price: '$499', duration: '60 min', desc: 'The "vampire facial" â uses your own growth factors for rejuvenation.' },
      { name: 'Body Contouring', price: 'From $400', duration: '45 min', desc: 'Non-invasive fat reduction and skin tightening.' },
    ],
    availableSlots: [
      'Tomorrow at 10:00 AM',
      'Tomorrow at 2:30 PM',
      'Wednesday at 11:00 AM',
      'Wednesday at 3:00 PM',
      'Thursday at 9:30 AM',
      'Friday at 1:00 PM',
    ],
  };

  // âââ STATE ââââââââââââââââââââââââââââââââââââââââââââââââ
  let isOpen = false;
  let messages = [];
  let conversationStep = 'greeting';
  let userData = { name: '', phone: '', service: '', slot: '' };
  let isTyping = false;

  // âââ STYLES âââââââââââââââââââââââââââââââââââââââââââââââ
  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    #obotix-widget-container * {
      margin: 0; padding: 0; box-sizing: border-box;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    #obotix-chat-bubble {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 64px; height: 64px; border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      box-shadow: 0 4px 24px rgba(139,92,246,0.5), 0 0 0 0 rgba(139,92,246,0.4);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: obotix-pulse 2s infinite;
    }
    #obotix-chat-bubble:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 32px rgba(139,92,246,0.6);
    }
    #obotix-chat-bubble.open {
      animation: none;
      transform: scale(1) rotate(0deg);
    }
    @keyframes obotix-pulse {
      0% { box-shadow: 0 4px 24px rgba(139,92,246,0.5), 0 0 0 0 rgba(139,92,246,0.4); }
      70% { box-shadow: 0 4px 24px rgba(139,92,246,0.5), 0 0 0 12px rgba(139,92,246,0); }
      100% { box-shadow: 0 4px 24px rgba(139,92,246,0.5), 0 0 0 0 rgba(139,92,246,0); }
    }
    #obotix-chat-bubble svg {
      width: 28px; height: 28px; fill: white;
      transition: all 0.3s ease;
    }

    #obotix-chat-window {
      position: fixed; bottom: 100px; right: 24px; z-index: 99998;
      width: 400px; max-width: calc(100vw - 32px);
      height: 600px; max-height: calc(100vh - 140px);
      background: #111118;
      border-radius: 20px;
      border: 1px solid rgba(139,92,246,0.3);
      box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.15);
      display: flex; flex-direction: column;
      overflow: hidden;
      opacity: 0; transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #obotix-chat-window.open {
      opacity: 1; transform: translateY(0) scale(1);
      pointer-events: all;
    }

    .obotix-header {
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.1));
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex; align-items: center; gap: 12px;
    }
    .obotix-header-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }
    .obotix-header-info h3 {
      font-size: 15px; font-weight: 600; color: white;
    }
    .obotix-header-info p {
      font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 1px;
    }
    .obotix-header-status {
      width: 8px; height: 8px; border-radius: 50%;
      background: #22c55e; margin-left: auto; flex-shrink: 0;
      box-shadow: 0 0 6px rgba(34,197,94,0.6);
      animation: obotix-status-pulse 2s infinite;
    }
    @keyframes obotix-status-pulse {
      0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
    }

    .obotix-powered {
      padding: 4px 20px 4px;
      text-align: center;
      font-size: 10px;
      color: rgba(255,255,255,0.25);
      letter-spacing: 0.5px;
    }
    .obotix-powered a { color: rgba(139,92,246,0.6); text-decoration: none; }

    .obotix-messages {
      flex: 1; overflow-y: auto; padding: 16px 16px 8px;
      scroll-behavior: smooth;
    }
    .obotix-messages::-webkit-scrollbar { width: 4px; }
    .obotix-messages::-webkit-scrollbar-track { background: transparent; }
    .obotix-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .obotix-msg {
      display: flex; gap: 8px; margin-bottom: 12px;
      animation: obotix-fade-in 0.3s ease;
    }
    @keyframes obotix-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .obotix-msg-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; flex-shrink: 0; margin-top: 2px;
    }
    .obotix-msg-bubble {
      max-width: 85%; padding: 10px 14px;
      border-radius: 16px 16px 16px 4px;
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.9);
      font-size: 14px; line-height: 1.5;
    }
    .obotix-msg.user {
      flex-direction: row-reverse;
    }
    .obotix-msg.user .obotix-msg-bubble {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
      border-radius: 16px 16px 4px 16px;
    }
    .obotix-msg.user .obotix-msg-avatar {
      background: rgba(255,255,255,0.1);
      font-size: 11px;
    }

    .obotix-quick-replies {
      display: flex; flex-wrap: wrap; gap: 6px;
      padding: 4px 0 8px; margin-left: 36px;
      animation: obotix-fade-in 0.3s ease;
    }
    .obotix-quick-reply {
      padding: 8px 14px;
      border-radius: 20px;
      border: 1px solid rgba(139,92,246,0.4);
      background: rgba(139,92,246,0.08);
      color: #c4b5fd;
      font-size: 13px; font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .obotix-quick-reply:hover {
      background: rgba(139,92,246,0.2);
      border-color: rgba(139,92,246,0.6);
      color: white;
    }

    .obotix-typing {
      display: flex; gap: 8px; margin-bottom: 12px; align-items: center;
      animation: obotix-fade-in 0.3s ease;
    }
    .obotix-typing-dots {
      display: flex; gap: 4px; padding: 12px 16px;
      background: rgba(255,255,255,0.06);
      border-radius: 16px 16px 16px 4px;
    }
    .obotix-typing-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(255,255,255,0.4);
      animation: obotix-typing-bounce 1.4s infinite both;
    }
    .obotix-typing-dot:nth-child(2) { animation-delay: 0.16s; }
    .obotix-typing-dot:nth-child(3) { animation-delay: 0.32s; }
    @keyframes obotix-typing-bounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
      40% { transform: translateY(-4px); opacity: 1; }
    }

    .obotix-input-area {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex; gap: 8px; align-items: center;
      background: rgba(0,0,0,0.2);
    }
    .obotix-input {
      flex: 1; padding: 10px 16px;
      border-radius: 24px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.05);
      color: white; font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .obotix-input::placeholder { color: rgba(255,255,255,0.3); }
    .obotix-input:focus { border-color: rgba(139,92,246,0.5); }

    .obotix-send-btn {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; flex-shrink: 0;
    }
    .obotix-send-btn:hover { transform: scale(1.05); }
    .obotix-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .obotix-send-btn svg { width: 18px; height: 18px; fill: white; }

    .obotix-service-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 10px 12px;
      margin-top: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .obotix-service-card:hover {
      background: rgba(139,92,246,0.1);
      border-color: rgba(139,92,246,0.3);
    }
    .obotix-service-card h4 {
      font-size: 13px; font-weight: 600; color: white;
    }
    .obotix-service-card .meta {
      font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px;
    }
    .obotix-service-card .desc {
      font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px;
    }

    .obotix-badge {
      display: inline-flex; align-items: center; gap: 4px;
      background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.2);
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 11px; color: #86efac;
      margin-top: 8px;
    }

    @media (max-width: 480px) {
      #obotix-chat-window {
        bottom: 0; right: 0; left: 0;
        width: 100%; max-width: 100%;
        height: 100vh; max-height: 100vh;
        border-radius: 0;
      }
      #obotix-chat-bubble { bottom: 16px; right: 16px; }
    }
  `;

  // âââ BOT LOGIC ââââââââââââââââââââââââââââââââââââââââââââ
  function getBotResponse(userMsg) {
    const msg = userMsg.toLowerCase().trim();

    // Handle booking flow steps
    if (conversationStep === 'awaiting_name') {
      userData.name = userMsg.trim();
      conversationStep = 'awaiting_phone';
      return {
        text: `Nice to meet you, ${userData.name}! To confirm your booking, could I get your phone number? We'll send a text confirmation.`,
        quickReplies: [],
      };
    }

    if (conversationStep === 'awaiting_phone') {
      userData.phone = userMsg.trim();
      conversationStep = 'booking_confirmed';
      return {
        text: `You're all set, ${userData.name}! Here's your booking:\n\n` +
          `<div class="obotix-badge">&#10003; Confirmed</div>\n` +
          `<div style="margin-top:8px;padding:12px;border-radius:12px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);font-size:13px;">` +
          `<strong>${userData.service}</strong><br>` +
          `<span style="color:rgba(255,255,255,0.6)">${userData.slot}</span><br>` +
          `<span style="color:rgba(255,255,255,0.6)">Confirmation sent to ${userData.phone}</span>` +
          `</div>\n\n` +
          `We'll send you a reminder 24 hours before. Is there anything else I can help with?`,
        quickReplies: ['View services', 'Hours & location', 'That\'s all, thanks!'],
      };
    }

    if (conversationStep === 'awaiting_slot') {
      userData.slot = userMsg.trim();
      conversationStep = 'awaiting_name';
      return {
        text: `Great choice! ${userData.slot} for ${userData.service} is available. I just need a couple details to lock it in.\n\nWhat's your first name?`,
        quickReplies: [],
      };
    }

    // General responses
    if (msg.includes('service') || msg.includes('menu') || msg.includes('offer') || msg.includes('treatment') || msg.includes('what do you')) {
      conversationStep = 'viewing_services';
      let serviceCards = CONFIG.services.map(s =>
        `<div class="obotix-service-card" onclick="window.__obotixSelectService('${s.name}')">` +
        `<h4>${s.name}</h4>` +
        `<div class="meta">${s.price} &bull; ${s.duration}</div>` +
        `<div class="desc">${s.desc}</div>` +
        `</div>`
      ).join('');
      return {
        text: `Here's what we offer! Tap any service to book:\n\n${serviceCards}`,
        quickReplies: ['Book appointment', 'Pricing info', 'Talk to a human'],
      };
    }

    if (msg.includes('botox')) {
      return handleServiceInquiry('Botox');
    }
    if (msg.includes('filler') || msg.includes('lip')) {
      return handleServiceInquiry('Dermal Fillers');
    }
    if (msg.includes('hydra') || msg.includes('facial') && !msg.includes('prp')) {
      return handleServiceInquiry('HydraFacial');
    }
    if (msg.includes('laser') || msg.includes('hair removal')) {
      return handleServiceInquiry('Laser Hair Removal');
    }
    if (msg.includes('peel')) {
      return handleServiceInquiry('Chemical Peel');
    }
    if (msg.includes('microneedl')) {
      return handleServiceInquiry('Microneedling');
    }
    if (msg.includes('prp') || msg.includes('vampire')) {
      return handleServiceInquiry('PRP Facial');
    }
    if (msg.includes('body') || msg.includes('contour') || msg.includes('sculpt')) {
      return handleServiceInquiry('Body Contouring');
    }

    if (msg.includes('book') || msg.includes('appointment') || msg.includes('schedule') || msg.includes('available')) {
      conversationStep = 'selecting_service';
      return {
        text: `I'd love to get you booked! Which service are you interested in?`,
        quickReplies: CONFIG.services.slice(0, 4).map(s => s.name),
      };
    }

    if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
      return {
        text: `Here's a quick pricing overview:\n\n` +
          CONFIG.services.map(s => `&bull; <strong>${s.name}</strong>: ${s.price}`).join('<br>') +
          `\n\nWant me to book any of these for you?`,
        quickReplies: ['Book appointment', 'View services', 'Talk to a human'],
      };
    }

    if (msg.includes('hour') || msg.includes('open') || msg.includes('close') || msg.includes('location') || msg.includes('address') || msg.includes('where')) {
      return {
        text: `We're open:\n\n` +
          `<strong>Monday - Friday:</strong> 9:00 AM - 7:00 PM<br>` +
          `<strong>Saturday:</strong> 10:00 AM - 5:00 PM<br>` +
          `<strong>Sunday:</strong> Closed\n\n` +
          `Located at <strong>123 Biscayne Blvd, Suite 200, Miami FL 33131</strong>\n\nWant to schedule a visit?`,
        quickReplies: ['Book appointment', 'View services', 'Get directions'],
      };
    }

    if (msg.includes('human') || msg.includes('person') || msg.includes('speak') || msg.includes('call') || msg.includes('phone')) {
      return {
        text: `Of course! You can reach our team at <strong>(305) 555-0142</strong> during business hours, or I can have someone call you back. Would you like a callback?`,
        quickReplies: ['Yes, request callback', 'No thanks', 'Book online instead'],
      };
    }

    if (msg.includes('callback') || msg.includes('call me')) {
      conversationStep = 'awaiting_name';
      return {
        text: `Sure! What's your first name so I can set that up?`,
        quickReplies: [],
      };
    }

    if (msg.includes('thank') || msg.includes('that\'s all') || msg.includes('bye') || msg.includes('no thanks')) {
      return {
        text: `You're welcome, happy to help! Feel free to come back anytime you need to book, reschedule, or ask questions. Have an amazing day! &#x2728;`,
        quickReplies: ['View services', 'Book appointment'],
      };
    }

    if (msg.includes('cancel') || msg.includes('reschedule')) {
      return {
        text: `No problem! I can help with that. Could you tell me the name the appointment is under? You can also call us at <strong>(305) 555-0142</strong> for immediate assistance.`,
        quickReplies: ['Book new appointment', 'Talk to a human'],
      };
    }

    if (msg.includes('insurance') || msg.includes('pay') || msg.includes('card') || msg.includes('finance')) {
      return {
        text: `We accept all major credit cards, HSA/FSA for qualifying treatments, and offer financing through Cherry and CareCredit. No payment is required to book â you'll pay at your appointment. Want to schedule a consultation?`,
        quickReplies: ['Book appointment', 'View services', 'Talk to a human'],
      };
    }

    // Default / catch-all
    return {
      text: `Great question! I want to make sure I give you the right answer. I can help with:\n\n` +
        `&bull; Booking appointments\n` +
        `&bull; Service info and pricing\n` +
        `&bull; Hours and location\n` +
        `&bull; Connecting you with our team\n\n` +
        `What would you like to know more about?`,
      quickReplies: ['View services', 'Book appointment', 'Hours & location', 'Talk to a human'],
    };
  }

  function handleServiceInquiry(serviceName) {
    const svc = CONFIG.services.find(s => s.name === serviceName);
    if (!svc) return getBotResponse('');
    userData.service = serviceName;
    conversationStep = 'awaiting_slot';
    const slots = CONFIG.availableSlots.slice(0, 3);
    return {
      text: `<strong>${svc.name}</strong> â ${svc.desc}\n\n` +
        `<strong>Price:</strong> ${svc.price}<br>` +
        `<strong>Duration:</strong> ${svc.duration}\n\n` +
        `I have these openings available:\n\n` +
        slots.map((s, i) => `&bull; ${s}`).join('<br>') +
        `\n\nWhich works best for you?`,
      quickReplies: slots,
    };
  }

  // âââ RENDERING ââââââââââââââââââââââââââââââââââââââââââââ
  function render() {
    const container = document.getElementById('obotix-widget-container');
    if (!container) return;

    const messagesHTML = messages.map(m => {
      const isBot = m.role === 'bot';
      return `
        <div class="obotix-msg ${isBot ? 'bot' : 'user'}">
          <div class="obotix-msg-avatar">${isBot ? '&#9889;' : '&#128100;'}</div>
          <div class="obotix-msg-bubble">${m.html || m.text}</div>
        </div>
        ${isBot && m.quickReplies && m.quickReplies.length ? `
          <div class="obotix-quick-replies">
            ${m.quickReplies.map(qr => `<button class="obotix-quick-reply" onclick="window.__obotixSend('${qr.replace(/'/g, "\\'")}')">${qr}</button>`).join('')}
          </div>
        ` : ''}
      `;
    }).join('');

    const typingHTML = isTyping ? `
      <div class="obotix-typing">
        <div class="obotix-msg-avatar" style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#6d28d9);display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">&#9889;</div>
        <div class="obotix-typing-dots">
          <div class="obotix-typing-dot"></div>
          <div class="obotix-typing-dot"></div>
          <div class="obotix-typing-dot"></div>
        </div>
      </div>
    ` : '';

    container.innerHTML = `
      <div id="obotix-chat-bubble" class="${isOpen ? 'open' : ''}" onclick="window.__obotixToggle()">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          ${isOpen
            ? '<path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>'
            : '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="10" r="1" fill="white"/><circle cx="12" cy="10" r="1" fill="white"/><circle cx="16" cy="10" r="1" fill="white"/>'
          }
        </svg>
      </div>
      <div id="obotix-chat-window" class="${isOpen ? 'open' : ''}">
        <div class="obotix-header">
          <div class="obotix-header-avatar">&#9889;</div>
          <div class="obotix-header-info">
            <h3>${CONFIG.botName} &bull; ${CONFIG.businessName}</h3>
            <p>${CONFIG.tagline} &bull; Responds in &lt;60s</p>
          </div>
          <div class="obotix-header-status"></div>
        </div>
        <div class="obotix-powered">Powered by <a href="https://obotix.co" target="_blank">Obotix AI</a></div>
        <div class="obotix-messages" id="obotix-messages-scroll">
          ${messagesHTML}
          ${typingHTML}
        </div>
        <div class="obotix-input-area">
          <input class="obotix-input" id="obotix-input" type="text" placeholder="Type a message..."
            onkeydown="if(event.key==='Enter')window.__obotixSendInput()" />
          <button class="obotix-send-btn" onclick="window.__obotixSendInput()" ${isTyping ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `;

    // Auto-scroll
    const scrollEl = document.getElementById('obotix-messages-scroll');
    if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
  }

  // âââ ACTIONS ââââââââââââââââââââââââââââââââââââââââââââââ
  window.__obotixToggle = function () {
    isOpen = !isOpen;
    if (isOpen && messages.length === 0) {
      sendBotMessage(
        `Hey there! &#128075; I'm ${CONFIG.botName}, the AI receptionist at ${CONFIG.businessName}.\n\nI can help you book appointments, answer questions about our services, or connect you with our team. What can I do for you today?`,
        ['View services', 'Book appointment', 'Hours & location', 'Pricing']
      );
      return;
    }
    render();
  };

  window.__obotixSend = function (text) {
    if (isTyping) return;
    messages.push({ role: 'user', text });
    render();

    isTyping = true;
    render();

    setTimeout(() => {
      isTyping = false;
      const response = getBotResponse(text);
      messages.push({
        role: 'bot',
        text: response.text,
        html: response.text,
        quickReplies: response.quickReplies || [],
      });
      render();
    }, CONFIG.typingDelay + Math.random() * 600);
  };

  window.__obotixSendInput = function () {
    const input = document.getElementById('obotix-input');
    if (!input || !input.value.trim()) return;
    window.__obotixSend(input.value.trim());
  };

  window.__obotixSelectService = function (serviceName) {
    window.__obotixSend(serviceName);
  };

  function sendBotMessage(text, quickReplies) {
    isTyping = true;
    render();
    setTimeout(() => {
      isTyping = false;
      messages.push({ role: 'bot', text, html: text, quickReplies: quickReplies || [] });
      render();
    }, CONFIG.typingDelay);
  }

  // âââ INIT âââââââââââââââââââââââââââââââââââââââââââââââââââââ
  function init() {
    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    // Create container
    const container = document.createElement('div');
    container.id = 'obotix-widget-container';
    document.body.appendChild(container);

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
