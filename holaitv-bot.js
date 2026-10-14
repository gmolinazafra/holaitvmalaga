/* ============================================================
   HolaBot — Asistente de Hola ITV Málaga
   Un solo archivo. Añadir antes de </body>:
   <script src="/holaitv-bot.js" defer></script>
   Opciones en la etiqueta: data-fab="off" oculta el botón flotante
   (para abrirlo desde un botón propio con window.HolaBot.open()).
   Idiomas: es, en, fr, pl, ru, it, de. Toma el idioma de <html lang>
   y cambia en vivo con window.HolaBot.setLang('en') o el evento
   window.dispatchEvent(new CustomEvent('hb:lang', {detail:'en'})).
   Requiere /bot-holaitv.png (avatar sin fondo)
   ============================================================ */
(function () {
  'use strict';

  const SCRIPT = document.currentScript;
  const NO_FAB = !!(SCRIPT && SCRIPT.dataset.fab === 'off');
  const TOUCH = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  const CFG = {
    avatar: '/bot-holaitv.png',
    email: 'mapedrosa@holaitvmalaga.com',
    tel: '+34615371847',
    telShow: '615 371 847',
    wa: 'https://wa.me/34615371847?text=' + encodeURIComponent('Hola, vengo de holaitvmalaga.com y quiero información para gestionar la ITV de mi flota.'),
    name: 'HolaBot'
  };

  /* ---------- Estilos ---------- */
  const css = `
  #hb-root{--b:#0f52ba;--b2:#1b6fe0;--d:#0f2a5e;--g:#25d366;--gr:#2ec04b;--ink:#10233f;--mut:#6b7684;--line:#e4e9f2;position:fixed;right:16px;bottom:16px;z-index:99999;font-family:'DM Sans',Inter,system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
  #hb-fab{position:relative;width:88px;height:88px;border:0;background:transparent;cursor:pointer;padding:0;transition:transform .2s;-webkit-tap-highlight-color:transparent;filter:drop-shadow(0 8px 18px rgba(15,42,94,.28))}
  #hb-fab:hover{transform:scale(1.06)}
  #hb-fab img{width:100%;height:100%;object-fit:contain;display:block}
  #hb-fab .hb-dot{position:absolute;top:8px;right:10px;width:14px;height:14px;background:var(--gr);border:3px solid #fff;border-radius:50%;animation:hbPulse 1.8s infinite}
  #hb-bubble{position:absolute;right:96px;bottom:26px;background:#fff;color:var(--ink);font-size:13px;font-weight:600;padding:9px 13px;border-radius:14px 14px 4px 14px;box-shadow:0 6px 20px rgba(15,42,94,.18);white-space:nowrap;animation:hbIn .4s ease}
  #hb-bubble:after{content:"";position:absolute;right:-6px;bottom:8px;border:6px solid transparent;border-left-color:#fff}
  @keyframes hbPulse{0%{box-shadow:0 0 0 0 rgba(46,192,75,.6)}70%{box-shadow:0 0 0 10px rgba(46,192,75,0)}100%{box-shadow:0 0 0 0 rgba(46,192,75,0)}}
  @keyframes hbIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  #hb-panel{position:absolute;right:0;bottom:0;width:380px;max-width:calc(100vw - 32px);height:600px;max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);background:#fff;border-radius:22px;box-shadow:0 20px 60px rgba(15,42,94,.28);display:none;flex-direction:column;overflow:hidden;animation:hbIn .25s ease}
  #hb-root.open #hb-panel{display:flex}
  #hb-root.open #hb-fab,#hb-root.open #hb-bubble{display:none}
  .hb-head{background:linear-gradient(135deg,var(--d),var(--b));color:#fff;padding:12px 14px;display:flex;align-items:center;gap:11px;flex-shrink:0}
  .hb-head img{width:46px;height:46px;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))}
  .hb-head .t{flex:1;min-width:0}
  .hb-head b{display:block;font-size:15px;letter-spacing:-.01em}
  .hb-head small{display:flex;align-items:center;gap:6px;font-size:11.5px;opacity:.85;margin-top:2px}
  .hb-head small i{width:7px;height:7px;background:var(--gr);border-radius:50%;display:inline-block}
  .hb-btns{display:flex;gap:6px;flex-shrink:0}
  .hb-reset{background:rgba(255,255,255,.14);border:0;color:#fff;width:32px;height:32px;border-radius:9px;cursor:pointer;display:grid;place-items:center;flex-shrink:0}
  .hb-reset:hover{background:rgba(255,255,255,.24)}
  .hb-reset svg{width:16px;height:16px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
  #hb-root.nofab #hb-fab,#hb-root.nofab #hb-bubble{display:none}
  .hb-close{background:rgba(255,255,255,.14);border:0;color:#fff;width:32px;height:32px;border-radius:9px;font-size:20px;line-height:1;cursor:pointer;flex-shrink:0}
  .hb-close:hover{background:rgba(255,255,255,.24)}
  .hb-body{flex:1;overflow-y:auto;padding:14px 12px;background:#e9eef5;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
  .hb-row{display:flex;align-items:flex-end;gap:8px;max-width:88%;animation:hbIn .25s ease}
  .hb-row.bot{align-self:flex-start}
  .hb-row.user{align-self:flex-end;flex-direction:row-reverse}
  .hb-av{width:30px;height:30px;flex-shrink:0;object-fit:contain;filter:drop-shadow(0 1px 3px rgba(0,0,0,.2))}
  .hb-msg{padding:9px 13px;border-radius:14px;font-size:13.5px;line-height:1.5;color:var(--ink);word-wrap:break-word;box-shadow:0 1px 1px rgba(0,0,0,.06)}
  .hb-msg.bot{background:#fff;border-bottom-left-radius:3px}
  .hb-msg.user{background:#111827;color:#fff;border-bottom-right-radius:3px}
  .hb-msg b{font-weight:700}
  .hb-msg a{color:var(--b2);font-weight:700;text-decoration:none}
  .hb-msg.user a{color:#fff;text-decoration:underline}
  .hb-msg ul{margin:6px 0 0 16px;padding:0}
  .hb-msg li{margin:2px 0}
  .hb-typing{background:#fff;border-radius:14px;border-bottom-left-radius:3px;padding:12px 16px;display:flex;gap:5px;box-shadow:0 1px 1px rgba(0,0,0,.06)}
  .hb-typing i{width:7px;height:7px;background:#b8c3d6;border-radius:50%;animation:hbDot 1.2s infinite}
  .hb-typing i:nth-child(2){animation-delay:.2s}.hb-typing i:nth-child(3){animation-delay:.4s}
  @keyframes hbDot{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}
  .hb-chips{display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start;max-width:96%;animation:hbIn .3s ease}
  .hb-chip{background:#fff;border:1.5px solid #c9d8f0;color:var(--b);font-size:12.5px;font-weight:600;padding:7px 12px;border-radius:999px;cursor:pointer;transition:.15s;font-family:inherit}
  .hb-chip:hover{background:var(--b);color:#fff;border-color:var(--b)}
  .hb-cta{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
  .hb-cta a{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:10px;font-size:12.5px;font-weight:700;text-decoration:none;color:#fff!important;background:var(--b)}
  .hb-cta a.wa{background:var(--g)}
  .hb-cta a.mail{background:var(--d)}
  .hb-foot{border-top:1px solid var(--line);padding:10px;display:flex;gap:8px;background:#fff;flex-shrink:0}
  .hb-foot input{flex:1;border:1.5px solid var(--line);border-radius:12px;padding:11px 13px;font-size:14px;font-family:inherit;outline:none;color:var(--ink)}
  .hb-foot input:focus{border-color:var(--b)}
  .hb-send{width:44px;height:44px;border:0;border-radius:12px;background:var(--b);color:#fff;cursor:pointer;display:grid;place-items:center;flex-shrink:0}
  .hb-send:hover{background:var(--b2)}
  .hb-send svg{width:18px;height:18px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
  .hb-powered{text-align:center;font-size:10px;color:#9aa5b8;padding:0 0 6px;background:#fff}
  @media(max-width:480px){
    #hb-root{right:10px;bottom:10px}
    #hb-fab{width:76px;height:76px}
    #hb-bubble{right:84px;bottom:22px;font-size:12px}
    #hb-root.open #hb-panel{position:fixed;left:0;right:0;top:var(--hb-top,0px);width:100%;max-width:100%;height:var(--hb-h,100dvh);max-height:none;border-radius:0;animation:none}
    .hb-head{padding-top:max(12px,env(safe-area-inset-top))}
    .hb-powered{padding-bottom:max(6px,env(safe-area-inset-bottom))}
  }
  html.hb-lock,html.hb-lock body{overflow:hidden!important}
  `;
  /* ---------- Idiomas ---------- */
  const LANGS = ['es', 'en', 'fr', 'pl', 'ru', 'it', 'de'];
  const pageLang = () => {
    const l = (document.documentElement.lang || 'es').slice(0, 2).toLowerCase();
    return LANGS.includes(l) ? l : 'es';
  };

  const UI = {
    es: { bubble: '¿Te ayudo con la ITV de tu flota? 👋', status: 'En línea · respondo al instante', ph: 'Escribe tu consulta…', powered: 'Asistente con IA · Hola ITV Málaga', open: 'Abrir asistente', close: 'Cerrar', reset: 'Reiniciar conversación', send: 'Enviar', mail: 'Email', mailSubj: 'Solicitud de servicio ITV' },
    en: { bubble: 'Need help with your fleet’s MOT? 👋', status: 'Online · instant replies', ph: 'Type your question…', powered: 'AI assistant · Hola ITV Málaga', open: 'Open assistant', close: 'Close', reset: 'Restart conversation', send: 'Send', mail: 'Email', mailSubj: 'ITV service request' },
    fr: { bubble: 'Besoin d’aide pour le contrôle technique de votre flotte ? 👋', status: 'En ligne · réponse immédiate', ph: 'Écrivez votre question…', powered: 'Assistant IA · Hola ITV Málaga', open: 'Ouvrir l’assistant', close: 'Fermer', reset: 'Recommencer la conversation', send: 'Envoyer', mail: 'Email', mailSubj: 'Demande de service ITV' },
    pl: { bubble: 'Pomóc z przeglądem ITV Twojej floty? 👋', status: 'Online · odpowiadam od razu', ph: 'Napisz pytanie…', powered: 'Asystent AI · Hola ITV Málaga', open: 'Otwórz asystenta', close: 'Zamknij', reset: 'Zacznij rozmowę od nowa', send: 'Wyślij', mail: 'Email', mailSubj: 'Zapytanie o usługę ITV' },
    ru: { bubble: 'Помочь с техосмотром вашего автопарка? 👋', status: 'В сети · отвечаю сразу', ph: 'Напишите вопрос…', powered: 'ИИ-ассистент · Hola ITV Málaga', open: 'Открыть ассистента', close: 'Закрыть', reset: 'Начать заново', send: 'Отправить', mail: 'Email', mailSubj: 'Запрос услуги ITV' },
    it: { bubble: 'Ti aiuto con la revisione della tua flotta? 👋', status: 'Online · rispondo subito', ph: 'Scrivi la tua domanda…', powered: 'Assistente IA · Hola ITV Málaga', open: 'Apri assistente', close: 'Chiudi', reset: 'Ricomincia la conversazione', send: 'Invia', mail: 'Email', mailSubj: 'Richiesta servizio ITV' },
    de: { bubble: 'Hilfe bei der ITV (TÜV) Ihrer Flotte? 👋', status: 'Online · antworte sofort', ph: 'Schreiben Sie Ihre Frage…', powered: 'KI-Assistent · Hola ITV Málaga', open: 'Assistent öffnen', close: 'Schließen', reset: 'Gespräch neu starten', send: 'Senden', mail: 'E-Mail', mailSubj: 'Anfrage ITV-Service' }
  };

  const CHIPS = {
    es: { como: 'Cómo funciona', cita: 'Pedir cita', precio: 'Precio', particular: 'Soy particular', empresa: 'Soy empresa', contacto: 'Contacto', recogida: '¿Recogéis el vehículo?', documentos: '¿Qué documentos necesito?', tasas: 'Tasas de ITV', factura: 'Facturación', empezar: 'Quiero empezar' },
    en: { como: 'How it works', cita: 'Book an inspection', precio: 'Price', particular: 'I’m a private owner', empresa: 'I’m a company', contacto: 'Contact', recogida: 'Do you collect the vehicle?', documentos: 'Which documents?', tasas: 'ITV fees', factura: 'Invoicing', empezar: 'I want to start' },
    fr: { como: 'Comment ça marche', cita: 'Prendre rendez-vous', precio: 'Prix', particular: 'Je suis particulier', empresa: 'Je suis une entreprise', contacto: 'Contact', recogida: 'Vous récupérez le véhicule ?', documentos: 'Quels documents ?', tasas: 'Frais ITV', factura: 'Facturation', empezar: 'Je veux commencer' },
    pl: { como: 'Jak to działa', cita: 'Umów przegląd', precio: 'Cena', particular: 'Jestem osobą prywatną', empresa: 'Jestem firmą', contacto: 'Kontakt', recogida: 'Odbieracie pojazd?', documentos: 'Jakie dokumenty?', tasas: 'Opłaty ITV', factura: 'Faktury', empezar: 'Chcę zacząć' },
    ru: { como: 'Как это работает', cita: 'Записаться', precio: 'Цена', particular: 'Я частное лицо', empresa: 'Я компания', contacto: 'Контакты', recogida: 'Вы забираете автомобиль?', documentos: 'Какие документы?', tasas: 'Сборы ITV', factura: 'Счета', empezar: 'Хочу начать' },
    it: { como: 'Come funziona', cita: 'Prenota la revisione', precio: 'Prezzo', particular: 'Sono un privato', empresa: 'Sono un’azienda', contacto: 'Contatto', recogida: 'Ritirate il veicolo?', documentos: 'Quali documenti?', tasas: 'Tasse ITV', factura: 'Fatturazione', empezar: 'Voglio iniziare' },
    de: { como: 'So funktioniert’s', cita: 'Termin buchen', precio: 'Preis', particular: 'Ich bin Privatperson', empresa: 'Ich bin ein Unternehmen', contacto: 'Kontakt', recogida: 'Holen Sie das Fahrzeug ab?', documentos: 'Welche Unterlagen?', tasas: 'ITV-Gebühren', factura: 'Rechnung', empezar: 'Ich möchte starten' }
  };

  const SAL = {
    es: ['¡Buenos días!', '¡Buenas tardes!', '¡Buenas noches!'],
    en: ['Good morning!', 'Good afternoon!', 'Good evening!'],
    fr: ['Bonjour !', 'Bonjour !', 'Bonsoir !'],
    pl: ['Dzień dobry!', 'Dzień dobry!', 'Dobry wieczór!'],
    ru: ['Доброе утро!', 'Добрый день!', 'Добрый вечер!'],
    it: ['Buongiorno!', 'Buon pomeriggio!', 'Buonasera!'],
    de: ['Guten Morgen!', 'Guten Tag!', 'Guten Abend!']
  };

  /* ---------- Base de conocimiento ---------- */
  const T = {
    es: {
      hola: s => `${s} Soy <b>HolaBot</b>, el asistente virtual de <b>Hola ITV Málaga</b> 🤖<br>Gestionamos la ITV de flotas profesionales: cita, recogida, inspección, entrega y factura. <b>¿En qué te ayudo?</b>`,
      particular: `Trabajamos <b>exclusivamente con empresas y profesionales del automóvil</b>: concesionarios, rent-a-car, talleres, flotas… Para un vehículo particular te recomendamos pedir cita directamente en la estación ITV.<br><br>Si tienes una empresa con varios vehículos, ¡cuéntame! 🚐`,
      cita: `Gestionamos la cita <b>de un día para otro</b> ⚡. Nos dices matrícula y disponibilidad, y localizamos hueco en la estación ITV que mejor encaje. Tú no llamas a nadie.<br><br>¿Quieres que empecemos con tu flota?`,
      recogida: `Sí: un conductor profesional <b>acude a tus instalaciones</b>, recoge el vehículo, pasa la inspección y te lo <b>devuelve con la documentación en regla</b>. Tu equipo no pierde ni una hora. 🔑`,
      tasas: `Con las tasas, <b>como prefieras</b> 💶:<ul><li><b>Las adelantamos nosotros</b>: pagamos en la estación y te lo incluimos en la factura. Tus empleados no manejan dinero.</li><li><b>Con tu propia cuenta ITV</b>: si ya trabajas con cuenta en la estación, la usamos y las tasas se cargan ahí.</li></ul>`,
      factura: `Emitimos <b>una factura por cada servicio</b> (recogida + inspección + gestión, y las tasas si las adelantamos) y si lo prefieres te <b>agrupamos todo en una liquidación mensual</b> para que contabilidad lo tenga sencillo. 🧾`,
      expedientes: `Nos encargamos de la <b>gestión de expedientes</b>: comprobamos documentación, resolvemos incidencias con la estación y llevamos el seguimiento de cada vehículo hasta que tiene la pegatina puesta. 📋`,
      documentos: `Para que pasemos la ITV por ti necesitamos en el vehículo:<ul><li>Permiso de circulación</li><li>Ficha técnica</li><li>Tarjeta de inspección técnica</li><li>Recibo del seguro en vigor</li></ul>Si falta algo, te avisamos antes de recoger. ✅`,
      precio: `Cada flota es distinta, así que preparamos <b>un plan a medida</b> según volumen, tipo de vehículos y frecuencia. Cuéntame cuántos vehículos gestionas y te contactamos con una propuesta en menos de 24h.`,
      clientes: `Trabajamos con:<ul><li>🏢 Concesionarios oficiales</li><li>🔄 Vehículo de ocasión (VO)</li><li>🚗 Rent-a-car</li><li>🚐 Flotas de empresa y furgonetas</li><li>🔧 Talleres y gestorías</li></ul>Si manejas volumen de vehículos, encajas.`,
      zona: `Operamos en <b>Málaga y provincia</b>: capital, Costa del Sol, Guadalhorce, Axarquía… Si estás más lejos, pregúntame y lo vemos. 📍`,
      horario: `Recogemos <b>de lunes a viernes en horario laboral</b>, adaptándonos a la operativa de tu negocio. Para el chat, estoy 24/7 🤖; el equipo humano responde el mismo día laborable.`,
      desfavorable: `Si el resultado es <b>desfavorable</b>, te informamos al momento con el informe, y coordinamos la <b>segunda inspección</b> una vez reparado. Sin sorpresas. 🔁`,
      caducada: `Con la ITV caducada el vehículo <b>no puede circular</b> salvo para ir a la estación con cita. Nosotros lo recogemos y lo llevamos: es justo el caso en el que más ahorras tiempo y riesgo de multa. ⚠️`,
      vehiculos: `Gestionamos <b>turismos, furgonetas, vehículos comerciales, motos y vehículos industriales ligeros</b>. Para camiones pesados o maquinaria especial, consúltanos.`,
      urgente: `⚡ Para urgencias, lo más rápido es que nos escribas por WhatsApp o nos llames ahora mismo y lo movemos hoy.`,
      contacto: `Puedes hablar con <b>Mari Ángeles</b>, responsable del servicio:`,
      gracias: `¡Un placer! 😊 Si quieres, te dejo el contacto directo para arrancar cuando lo necesites.`,
      quien: `Soy <b>HolaBot</b>, el asistente virtual de <b>Hola ITV Málaga</b>. Detrás está <b>Mari Ángeles Pedrosa</b>, que dirige el servicio y gestiona personalmente cada flota.`,
      fallback: `Entiendo. Para darte una respuesta exacta sobre eso, lo mejor es que lo hable contigo el equipo directamente. ¿Te paso el contacto o prefieres que te cuente cómo funciona el servicio?`,
      proceso: `Así de simple, en <b>4 pasos</b>:<ul><li><b>1.</b> Nos indicas los vehículos y plazos (email o WhatsApp)</li><li><b>2.</b> Localizamos y reservamos la cita, de un día para otro</li><li><b>3.</b> Recogemos y pasamos la ITV (adelantamos las tasas o usamos tu cuenta ITV)</li><li><b>4.</b> Devolvemos el vehículo con todo en regla y facturamos</li></ul>Cero gestión para ti. 🔑`
    },
    en: {
      hola: s => `${s} I’m <b>HolaBot</b>, the virtual assistant of <b>Hola ITV Málaga</b> 🤖<br>We handle the ITV (Spanish MOT) of professional fleets: booking, collection, inspection, return and invoicing. <b>How can I help?</b>`,
      particular: `We work <b>exclusively with companies and automotive professionals</b>: dealerships, rent-a-car, workshops, fleets… For a private vehicle we recommend booking directly at the ITV station.<br><br>If you have a company with several vehicles, tell me! 🚐`,
      cita: `We book the inspection <b>from one day to the next</b> ⚡. Give us the plate and your availability, and we find a slot at the ITV station that suits you best. You don’t call anyone.<br><br>Shall we start with your fleet?`,
      recogida: `Yes: a professional driver <b>comes to your premises</b>, collects the vehicle, passes the inspection and <b>returns it with the paperwork in order</b>. Your team doesn’t lose a single hour. 🔑`,
      tasas: `ITV fees, <b>your way</b> 💶:<ul><li><b>We pay them upfront</b>: we pay at the station and include it in your invoice. Your staff never handle cash.</li><li><b>With your own ITV account</b>: if you already have an account with the station, we use it and the fees are charged there.</li></ul>`,
      factura: `We issue <b>one invoice per service</b> (collection + inspection + handling, plus the fees if we pay them) and, if you prefer, we <b>group everything into a monthly statement</b> to keep accounting simple. 🧾`,
      expedientes: `We take care of <b>all the paperwork</b>: we check documents, sort out any issues with the station and follow up each vehicle until the sticker is on. 📋`,
      documentos: `To pass the ITV for you, the vehicle needs:<ul><li>Registration certificate (permiso de circulación)</li><li>Technical data sheet (ficha técnica)</li><li>Technical inspection card</li><li>Valid insurance receipt</li></ul>If anything is missing, we’ll let you know before collecting. ✅`,
      precio: `Every fleet is different, so we prepare <b>a tailored plan</b> based on volume, vehicle type and frequency. Tell me how many vehicles you manage and we’ll get back to you with a proposal within 24h.`,
      clientes: `We work with:<ul><li>🏢 Official dealerships</li><li>🔄 Used vehicles</li><li>🚗 Rent-a-car</li><li>🚐 Company fleets and vans</li><li>🔧 Workshops and agencies</li></ul>If you handle a volume of vehicles, you’re a fit.`,
      zona: `We operate in <b>Málaga and its province</b>: the city, Costa del Sol, Guadalhorce, Axarquía… If you’re further away, ask me and we’ll see. 📍`,
      horario: `We collect <b>Monday to Friday during business hours</b>, adapting to your operations. The chat is available 24/7 🤖; the team replies the same working day.`,
      desfavorable: `If the result is <b>unfavourable</b>, we inform you straight away with the report and arrange the <b>second inspection</b> once it’s repaired. No surprises. 🔁`,
      caducada: `With an expired ITV the vehicle <b>can’t be driven</b> except to the station with an appointment. We collect it and take it there: that’s exactly when you save the most time and the risk of a fine. ⚠️`,
      vehiculos: `We handle <b>cars, vans, commercial vehicles, motorcycles and light industrial vehicles</b>. For heavy trucks or special machinery, please ask us.`,
      urgente: `⚡ For urgent cases, the fastest way is to message us on WhatsApp or call right now and we’ll move it today.`,
      contacto: `You can talk to <b>Mari Ángeles</b>, who runs the service:`,
      gracias: `My pleasure! 😊 Here’s the direct contact for whenever you need it.`,
      quien: `I’m <b>HolaBot</b>, the virtual assistant of <b>Hola ITV Málaga</b>. Behind it is <b>Mari Ángeles Pedrosa</b>, who runs the service and personally manages every fleet.`,
      fallback: `I see. For an exact answer on that, it’s best if the team talks to you directly. Shall I give you the contact, or would you like me to explain how the service works?`,
      proceso: `As simple as <b>4 steps</b>:<ul><li><b>1.</b> Tell us the vehicles and deadlines (email or WhatsApp)</li><li><b>2.</b> We find and book the appointment, from one day to the next</li><li><b>3.</b> We collect and pass the ITV (paying the fees upfront or using your ITV account)</li><li><b>4.</b> We return the vehicle with everything in order and invoice</li></ul>Zero hassle for you. 🔑`
    },
    fr: {
      hola: s => `${s} Je suis <b>HolaBot</b>, l’assistant virtuel de <b>Hola ITV Málaga</b> 🤖<br>Nous gérons l’ITV (contrôle technique espagnol) des flottes professionnelles : rendez-vous, enlèvement, inspection, restitution et facturation. <b>Comment puis-je vous aider ?</b>`,
      particular: `Nous travaillons <b>exclusivement avec des entreprises et des professionnels de l’automobile</b> : concessionnaires, loueurs, garages, flottes… Pour un véhicule particulier, nous vous conseillons de prendre rendez-vous directement à la station ITV.<br><br>Si vous avez une entreprise avec plusieurs véhicules, parlez-m’en ! 🚐`,
      cita: `Nous obtenons le rendez-vous <b>d’un jour à l’autre</b> ⚡. Donnez-nous l’immatriculation et vos disponibilités, et nous trouvons un créneau dans la station ITV la plus adaptée. Vous n’appelez personne.<br><br>On commence avec votre flotte ?`,
      recogida: `Oui : un chauffeur professionnel <b>se rend dans vos locaux</b>, récupère le véhicule, passe le contrôle et vous le <b>restitue avec les documents en règle</b>. Votre équipe ne perd pas une heure. 🔑`,
      tasas: `Les frais ITV, <b>comme vous préférez</b> 💶 :<ul><li><b>Nous les avançons</b> : nous payons à la station et l’incluons dans votre facture. Vos employés ne manipulent pas d’argent.</li><li><b>Avec votre propre compte ITV</b> : si vous avez déjà un compte auprès de la station, nous l’utilisons et les frais y sont imputés.</li></ul>`,
      factura: `Nous émettons <b>une facture par service</b> (enlèvement + contrôle + gestion, et les frais si nous les avançons) et, si vous préférez, nous <b>regroupons tout dans un relevé mensuel</b> pour simplifier la comptabilité. 🧾`,
      expedientes: `Nous nous occupons de <b>toutes les démarches</b> : vérification des documents, résolution des incidents avec la station et suivi de chaque véhicule jusqu’à la pose de la vignette. 📋`,
      documentos: `Pour passer l’ITV à votre place, le véhicule doit contenir :<ul><li>Certificat d’immatriculation (permiso de circulación)</li><li>Fiche technique</li><li>Carte d’inspection technique</li><li>Attestation d’assurance en cours</li></ul>S’il manque quelque chose, nous vous prévenons avant l’enlèvement. ✅`,
      precio: `Chaque flotte est différente : nous préparons donc <b>une offre sur mesure</b> selon le volume, le type de véhicules et la fréquence. Dites-moi combien de véhicules vous gérez et nous vous enverrons une proposition sous 24 h.`,
      clientes: `Nous travaillons avec :<ul><li>🏢 Concessionnaires officiels</li><li>🔄 Véhicules d’occasion</li><li>🚗 Loueurs</li><li>🚐 Flottes d’entreprise et utilitaires</li><li>🔧 Garages et cabinets de gestion</li></ul>Si vous gérez un volume de véhicules, vous êtes concerné.`,
      zona: `Nous intervenons à <b>Málaga et dans sa province</b> : la ville, la Costa del Sol, le Guadalhorce, l’Axarquía… Si vous êtes plus loin, demandez-moi. 📍`,
      horario: `Nous enlevons les véhicules <b>du lundi au vendredi aux heures ouvrables</b>, en nous adaptant à votre activité. Le chat est disponible 24 h/24 🤖 ; l’équipe répond le jour ouvrable même.`,
      desfavorable: `Si le résultat est <b>défavorable</b>, nous vous informons immédiatement avec le rapport et organisons la <b>contre-visite</b> une fois la réparation faite. Sans surprise. 🔁`,
      caducada: `Avec une ITV expirée, le véhicule <b>ne peut pas circuler</b> sauf pour se rendre à la station avec rendez-vous. Nous l’enlevons et l’y conduisons : c’est là que vous gagnez le plus de temps et évitez l’amende. ⚠️`,
      vehiculos: `Nous gérons <b>voitures, fourgonnettes, utilitaires, motos et véhicules industriels légers</b>. Pour les poids lourds ou engins spéciaux, consultez-nous.`,
      urgente: `⚡ En cas d’urgence, le plus rapide est de nous écrire sur WhatsApp ou de nous appeler maintenant, et nous traitons cela aujourd’hui.`,
      contacto: `Vous pouvez parler avec <b>Mari Ángeles</b>, responsable du service :`,
      gracias: `Avec plaisir ! 😊 Voici le contact direct pour quand vous en aurez besoin.`,
      quien: `Je suis <b>HolaBot</b>, l’assistant virtuel de <b>Hola ITV Málaga</b>. Derrière, il y a <b>Mari Ángeles Pedrosa</b>, qui dirige le service et gère personnellement chaque flotte.`,
      fallback: `Je comprends. Pour une réponse précise, le mieux est que l’équipe en parle directement avec vous. Je vous donne le contact ou je vous explique comment fonctionne le service ?`,
      proceso: `Aussi simple que <b>4 étapes</b> :<ul><li><b>1.</b> Vous nous indiquez les véhicules et les délais (email ou WhatsApp)</li><li><b>2.</b> Nous trouvons et réservons le rendez-vous, d’un jour à l’autre</li><li><b>3.</b> Nous enlevons le véhicule et passons l’ITV (en avançant les frais ou avec votre compte ITV)</li><li><b>4.</b> Nous restituons le véhicule en règle et facturons</li></ul>Zéro démarche pour vous. 🔑`
    },
    pl: {
      hola: s => `${s} Jestem <b>HolaBot</b>, wirtualny asystent <b>Hola ITV Málaga</b> 🤖<br>Zajmujemy się przeglądami ITV flot firmowych: termin, odbiór, przegląd, zwrot i faktura. <b>W czym mogę pomóc?</b>`,
      particular: `Pracujemy <b>wyłącznie z firmami i profesjonalistami z branży motoryzacyjnej</b>: dealerami, wypożyczalniami, warsztatami, flotami… W przypadku pojazdu prywatnego zalecamy umówienie się bezpośrednio na stacji ITV.<br><br>Jeśli masz firmę z kilkoma pojazdami, napisz! 🚐`,
      cita: `Umawiamy termin <b>z dnia na dzień</b> ⚡. Podajesz numer rejestracyjny i dostępność, a my znajdujemy wolny termin na najlepiej pasującej stacji ITV. Nie musisz do nikogo dzwonić.<br><br>Zaczynamy z Twoją flotą?`,
      recogida: `Tak: profesjonalny kierowca <b>przyjeżdża do Twojej firmy</b>, odbiera pojazd, przechodzi przegląd i <b>zwraca go z kompletem dokumentów</b>. Twój zespół nie traci ani godziny. 🔑`,
      tasas: `Opłaty ITV — <b>jak wolisz</b> 💶:<ul><li><b>My je opłacamy</b>: płacimy na stacji i doliczamy do faktury. Twoi pracownicy nie mają do czynienia z gotówką.</li><li><b>Z Twojego konta ITV</b>: jeśli masz już konto na stacji, korzystamy z niego i tam naliczane są opłaty.</li></ul>`,
      factura: `Wystawiamy <b>fakturę za każdą usługę</b> (odbiór + przegląd + obsługa, a także opłaty, jeśli je pokrywamy), a na życzenie <b>łączymy wszystko w miesięczne rozliczenie</b>, żeby księgowość miała prościej. 🧾`,
      expedientes: `Zajmujemy się <b>całą dokumentacją</b>: sprawdzamy dokumenty, rozwiązujemy problemy ze stacją i śledzimy każdy pojazd aż do naklejenia znaczka. 📋`,
      documentos: `Aby przeprowadzić przegląd za Ciebie, w pojeździe musi być:<ul><li>Dowód rejestracyjny (permiso de circulación)</li><li>Karta techniczna (ficha técnica)</li><li>Karta przeglądów technicznych</li><li>Ważne potwierdzenie ubezpieczenia</li></ul>Jeśli czegoś brakuje, uprzedzimy Cię przed odbiorem. ✅`,
      precio: `Każda flota jest inna, dlatego przygotowujemy <b>ofertę szytą na miarę</b> według liczby i rodzaju pojazdów oraz częstotliwości. Napisz, iloma pojazdami zarządzasz, a w ciągu 24 h wyślemy propozycję.`,
      clientes: `Pracujemy z:<ul><li>🏢 Autoryzowanymi dealerami</li><li>🔄 Pojazdami używanymi</li><li>🚗 Wypożyczalniami</li><li>🚐 Flotami firmowymi i dostawczymi</li><li>🔧 Warsztatami i biurami</li></ul>Jeśli obsługujesz wiele pojazdów — pasujesz.`,
      zona: `Działamy w <b>Maladze i prowincji</b>: miasto, Costa del Sol, Guadalhorce, Axarquía… Jeśli jesteś dalej, zapytaj — sprawdzimy. 📍`,
      horario: `Odbieramy pojazdy <b>od poniedziałku do piątku w godzinach pracy</b>, dopasowując się do Twojej firmy. Czat działa 24/7 🤖; zespół odpowiada tego samego dnia roboczego.`,
      desfavorable: `Jeśli wynik jest <b>negatywny</b>, od razu informujemy Cię i przekazujemy raport, a po naprawie organizujemy <b>ponowny przegląd</b>. Bez niespodzianek. 🔁`,
      caducada: `Z nieważnym przeglądem pojazd <b>nie może jeździć</b>, chyba że na umówiony przegląd. My go odbieramy i zawozimy — właśnie wtedy najwięcej oszczędzasz czasu i unikasz mandatu. ⚠️`,
      vehiculos: `Obsługujemy <b>samochody osobowe, dostawcze, pojazdy użytkowe, motocykle i lekkie pojazdy przemysłowe</b>. W przypadku ciężarówek lub maszyn specjalnych zapytaj nas.`,
      urgente: `⚡ W pilnych sprawach najszybciej będzie napisać na WhatsApp lub zadzwonić teraz — zajmiemy się tym dziś.`,
      contacto: `Możesz porozmawiać z <b>Mari Ángeles</b>, która prowadzi usługę:`,
      gracias: `Cała przyjemność po mojej stronie! 😊 Zostawiam bezpośredni kontakt na kiedy będziesz potrzebować.`,
      quien: `Jestem <b>HolaBot</b>, wirtualny asystent <b>Hola ITV Málaga</b>. Za nim stoi <b>Mari Ángeles Pedrosa</b>, która prowadzi usługę i osobiście zarządza każdą flotą.`,
      fallback: `Rozumiem. Aby dać Ci dokładną odpowiedź, najlepiej będzie, jeśli zespół porozmawia z Tobą bezpośrednio. Podać kontakt czy wyjaśnić, jak działa usługa?`,
      proceso: `To proste — <b>4 kroki</b>:<ul><li><b>1.</b> Podajesz pojazdy i terminy (email lub WhatsApp)</li><li><b>2.</b> Znajdujemy i rezerwujemy termin z dnia na dzień</li><li><b>3.</b> Odbieramy pojazd i przechodzimy ITV (pokrywamy opłaty lub korzystamy z Twojego konta ITV)</li><li><b>4.</b> Zwracamy pojazd z kompletem dokumentów i wystawiamy fakturę</li></ul>Zero formalności dla Ciebie. 🔑`
    },
    ru: {
      hola: s => `${s} Я <b>HolaBot</b>, виртуальный ассистент <b>Hola ITV Málaga</b> 🤖<br>Мы организуем техосмотр ITV для корпоративных автопарков: запись, забор, осмотр, возврат и счёт. <b>Чем помочь?</b>`,
      particular: `Мы работаем <b>только с компаниями и профессионалами автобизнеса</b>: дилерами, прокатом, автосервисами, автопарками… Для личного автомобиля рекомендуем записаться напрямую на станцию ITV.<br><br>Если у вас компания с несколькими машинами — расскажите! 🚐`,
      cita: `Записываем <b>буквально на следующий день</b> ⚡. Сообщите номер и удобное время — мы найдём окно на подходящей станции ITV. Вам никуда не нужно звонить.<br><br>Начнём с вашего автопарка?`,
      recogida: `Да: профессиональный водитель <b>приезжает к вам</b>, забирает автомобиль, проходит осмотр и <b>возвращает его с оформленными документами</b>. Ваша команда не теряет ни часа. 🔑`,
      tasas: `Сборы ITV — <b>как вам удобнее</b> 💶:<ul><li><b>Мы оплачиваем их сами</b>: платим на станции и включаем в счёт. Вашим сотрудникам не нужно иметь дело с деньгами.</li><li><b>С вашего собственного счёта ITV</b>: если у вас уже есть счёт на станции, мы используем его, и сборы списываются оттуда.</li></ul>`,
      factura: `Выставляем <b>счёт за каждую услугу</b> (забор + осмотр + оформление, а также сборы, если оплачиваем их мы), а по желанию <b>объединяем всё в ежемесячный расчёт</b>, чтобы бухгалтерии было проще. 🧾`,
      expedientes: `Берём на себя <b>всё оформление</b>: проверяем документы, решаем вопросы со станцией и сопровождаем каждый автомобиль, пока не будет наклейки. 📋`,
      documentos: `Чтобы пройти ITV за вас, в машине должны быть:<ul><li>Свидетельство о регистрации (permiso de circulación)</li><li>Техпаспорт (ficha técnica)</li><li>Карта техосмотра</li><li>Действующий полис страховки</li></ul>Если чего-то не хватает, предупредим до забора. ✅`,
      precio: `Каждый автопарк уникален, поэтому мы готовим <b>индивидуальное предложение</b> с учётом объёма, типа машин и периодичности. Напишите, сколькими машинами вы управляете, и мы пришлём предложение в течение 24 часов.`,
      clientes: `Мы работаем с:<ul><li>🏢 Официальными дилерами</li><li>🔄 Подержанными автомобилями</li><li>🚗 Прокатом</li><li>🚐 Корпоративными автопарками и фургонами</li><li>🔧 Автосервисами и агентствами</li></ul>Если у вас много машин — вам к нам.`,
      zona: `Работаем в <b>Малаге и провинции</b>: город, Коста-дель-Соль, Гуадальорсе, Ахаркия… Если вы дальше, спросите — обсудим. 📍`,
      horario: `Забираем машины <b>с понедельника по пятницу в рабочее время</b>, подстраиваясь под ваш график. Чат работает 24/7 🤖; команда отвечает в тот же рабочий день.`,
      desfavorable: `Если результат <b>отрицательный</b>, сразу сообщаем и передаём отчёт, а после ремонта организуем <b>повторный осмотр</b>. Без сюрпризов. 🔁`,
      caducada: `С просроченным ITV автомобиль <b>не может ездить</b>, кроме как на станцию по записи. Мы заберём и отвезём его — именно здесь вы больше всего экономите время и избегаете штрафа. ⚠️`,
      vehiculos: `Обслуживаем <b>легковые, фургоны, коммерческий транспорт, мотоциклы и лёгкую спецтехнику</b>. По грузовикам и спецмашинам — уточняйте.`,
      urgente: `⚡ В срочных случаях быстрее всего написать нам в WhatsApp или позвонить прямо сейчас — решим сегодня.`,
      contacto: `Вы можете связаться с <b>Мари Анхелес</b>, руководителем сервиса:`,
      gracias: `Рада помочь! 😊 Оставляю прямой контакт на случай, если понадобится.`,
      quien: `Я <b>HolaBot</b>, виртуальный ассистент <b>Hola ITV Málaga</b>. За ним стоит <b>Мари Анхелес Педроса</b>, которая руководит сервисом и лично ведёт каждый автопарк.`,
      fallback: `Понимаю. Чтобы ответить точно, лучше, чтобы команда связалась с вами напрямую. Дать контакт или рассказать, как работает сервис?`,
      proceso: `Всё просто — <b>4 шага</b>:<ul><li><b>1.</b> Сообщаете машины и сроки (email или WhatsApp)</li><li><b>2.</b> Находим и бронируем запись на следующий день</li><li><b>3.</b> Забираем и проходим ITV (оплачиваем сборы или используем ваш счёт ITV)</li><li><b>4.</b> Возвращаем машину с документами и выставляем счёт</li></ul>Никаких хлопот для вас. 🔑`
    },
    it: {
      hola: s => `${s} Sono <b>HolaBot</b>, l’assistente virtuale di <b>Hola ITV Málaga</b> 🤖<br>Gestiamo l’ITV (revisione spagnola) delle flotte professionali: prenotazione, ritiro, ispezione, riconsegna e fattura. <b>Come posso aiutarti?</b>`,
      particular: `Lavoriamo <b>esclusivamente con aziende e professionisti dell’auto</b>: concessionari, noleggi, officine, flotte… Per un veicolo privato ti consigliamo di prenotare direttamente presso la stazione ITV.<br><br>Se hai un’azienda con più veicoli, raccontami! 🚐`,
      cita: `Prenotiamo la revisione <b>da un giorno all’altro</b> ⚡. Ci dai targa e disponibilità e troviamo un posto nella stazione ITV più adatta. Non devi chiamare nessuno.<br><br>Iniziamo con la tua flotta?`,
      recogida: `Sì: un autista professionista <b>viene nella tua sede</b>, ritira il veicolo, fa la revisione e te lo <b>riconsegna con i documenti in regola</b>. Il tuo team non perde nemmeno un’ora. 🔑`,
      tasas: `Le tasse ITV, <b>come preferisci</b> 💶:<ul><li><b>Le anticipiamo noi</b>: paghiamo in stazione e le includiamo in fattura. I tuoi dipendenti non maneggiano denaro.</li><li><b>Con il tuo conto ITV</b>: se hai già un conto presso la stazione, lo usiamo e le tasse vengono addebitate lì.</li></ul>`,
      factura: `Emettiamo <b>una fattura per ogni servizio</b> (ritiro + ispezione + gestione, e le tasse se le anticipiamo) e, se preferisci, <b>raggruppiamo tutto in un estratto mensile</b> per semplificare la contabilità. 🧾`,
      expedientes: `Ci occupiamo di <b>tutte le pratiche</b>: controlliamo i documenti, risolviamo gli imprevisti con la stazione e seguiamo ogni veicolo fino al bollino. 📋`,
      documentos: `Per fare la revisione al posto tuo, nel veicolo servono:<ul><li>Carta di circolazione (permiso de circulación)</li><li>Scheda tecnica</li><li>Tessera di ispezione tecnica</li><li>Ricevuta dell’assicurazione valida</li></ul>Se manca qualcosa, ti avvisiamo prima del ritiro. ✅`,
      precio: `Ogni flotta è diversa, quindi prepariamo <b>un piano su misura</b> in base a volume, tipo di veicoli e frequenza. Dimmi quanti veicoli gestisci e ti inviamo una proposta entro 24 ore.`,
      clientes: `Lavoriamo con:<ul><li>🏢 Concessionari ufficiali</li><li>🔄 Veicoli usati</li><li>🚗 Noleggi</li><li>🚐 Flotte aziendali e furgoni</li><li>🔧 Officine e agenzie</li></ul>Se gestisci molti veicoli, fai al caso nostro.`,
      zona: `Operiamo a <b>Málaga e provincia</b>: città, Costa del Sol, Guadalhorce, Axarquía… Se sei più lontano, chiedimi e vediamo. 📍`,
      horario: `Ritiriamo <b>dal lunedì al venerdì in orario lavorativo</b>, adattandoci alla tua attività. La chat è attiva 24/7 🤖; il team risponde nello stesso giorno lavorativo.`,
      desfavorable: `Se l’esito è <b>sfavorevole</b>, ti informiamo subito con il rapporto e organizziamo la <b>seconda revisione</b> dopo la riparazione. Nessuna sorpresa. 🔁`,
      caducada: `Con l’ITV scaduta il veicolo <b>non può circolare</b> se non per andare in stazione con prenotazione. Lo ritiriamo e lo portiamo noi: è proprio il caso in cui risparmi più tempo ed eviti la multa. ⚠️`,
      vehiculos: `Gestiamo <b>auto, furgoni, veicoli commerciali, moto e veicoli industriali leggeri</b>. Per camion pesanti o macchinari speciali, contattaci.`,
      urgente: `⚡ Per le urgenze, la via più rapida è scriverci su WhatsApp o chiamarci subito: lo sistemiamo oggi.`,
      contacto: `Puoi parlare con <b>Mari Ángeles</b>, responsabile del servizio:`,
      gracias: `Un piacere! 😊 Ti lascio il contatto diretto per quando ti serve.`,
      quien: `Sono <b>HolaBot</b>, l’assistente virtuale di <b>Hola ITV Málaga</b>. Dietro c’è <b>Mari Ángeles Pedrosa</b>, che dirige il servizio e segue personalmente ogni flotta.`,
      fallback: `Capisco. Per darti una risposta precisa, è meglio che il team ne parli direttamente con te. Ti passo il contatto o preferisci che ti spieghi come funziona il servizio?`,
      proceso: `Semplice, in <b>4 passi</b>:<ul><li><b>1.</b> Ci indichi veicoli e scadenze (email o WhatsApp)</li><li><b>2.</b> Troviamo e prenotiamo l’appuntamento da un giorno all’altro</li><li><b>3.</b> Ritiriamo e facciamo l’ITV (anticipando le tasse o con il tuo conto ITV)</li><li><b>4.</b> Riconsegniamo il veicolo in regola e fatturiamo</li></ul>Zero pensieri per te. 🔑`
    },
    de: {
      hola: s => `${s} Ich bin <b>HolaBot</b>, der virtuelle Assistent von <b>Hola ITV Málaga</b> 🤖<br>Wir übernehmen die ITV (spanische Hauptuntersuchung) für gewerbliche Flotten: Termin, Abholung, Prüfung, Rückgabe und Rechnung. <b>Wie kann ich helfen?</b>`,
      particular: `Wir arbeiten <b>ausschließlich mit Unternehmen und Kfz-Profis</b>: Autohäuser, Autovermietungen, Werkstätten, Flotten… Für ein Privatfahrzeug empfehlen wir, den Termin direkt bei der ITV-Station zu buchen.<br><br>Haben Sie ein Unternehmen mit mehreren Fahrzeugen? Erzählen Sie mir davon! 🚐`,
      cita: `Wir buchen den Termin <b>von heute auf morgen</b> ⚡. Sie nennen uns Kennzeichen und Verfügbarkeit, wir finden einen Termin bei der passenden ITV-Station. Sie müssen niemanden anrufen.<br><br>Sollen wir mit Ihrer Flotte starten?`,
      recogida: `Ja: Ein professioneller Fahrer <b>kommt zu Ihrem Betrieb</b>, holt das Fahrzeug ab, absolviert die Prüfung und <b>bringt es mit vollständigen Unterlagen zurück</b>. Ihr Team verliert keine Stunde. 🔑`,
      tasas: `ITV-Gebühren, <b>wie Sie möchten</b> 💶:<ul><li><b>Wir strecken sie vor</b>: Wir zahlen an der Station und stellen sie Ihnen in Rechnung. Ihre Mitarbeiter haben nichts mit Bargeld zu tun.</li><li><b>Über Ihr eigenes ITV-Konto</b>: Wenn Sie bereits ein Konto bei der Station haben, nutzen wir es und die Gebühren werden dort belastet.</li></ul>`,
      factura: `Wir stellen <b>eine Rechnung pro Leistung</b> aus (Abholung + Prüfung + Abwicklung, plus Gebühren, falls wir sie vorstrecken) und fassen auf Wunsch <b>alles in einer Monatsabrechnung</b> zusammen – das erleichtert die Buchhaltung. 🧾`,
      expedientes: `Wir kümmern uns um <b>den gesamten Papierkram</b>: Unterlagen prüfen, Probleme mit der Station lösen und jedes Fahrzeug begleiten, bis die Plakette klebt. 📋`,
      documentos: `Damit wir die ITV für Sie erledigen können, muss im Fahrzeug sein:<ul><li>Zulassungsbescheinigung (permiso de circulación)</li><li>Technisches Datenblatt (ficha técnica)</li><li>Prüfkarte (tarjeta ITV)</li><li>Gültiger Versicherungsnachweis</li></ul>Fehlt etwas, melden wir uns vor der Abholung. ✅`,
      precio: `Jede Flotte ist anders, deshalb erstellen wir <b>ein individuelles Angebot</b> nach Volumen, Fahrzeugtyp und Häufigkeit. Sagen Sie mir, wie viele Fahrzeuge Sie verwalten, und Sie erhalten innerhalb von 24 Std. ein Angebot.`,
      clientes: `Wir arbeiten mit:<ul><li>🏢 Vertragshändlern</li><li>🔄 Gebrauchtwagen</li><li>🚗 Autovermietungen</li><li>🚐 Firmenflotten und Transportern</li><li>🔧 Werkstätten und Agenturen</li></ul>Wenn Sie viele Fahrzeuge betreuen, passen Sie zu uns.`,
      zona: `Wir sind in <b>Málaga und der Provinz</b> tätig: Stadt, Costa del Sol, Guadalhorce, Axarquía… Wenn Sie weiter weg sind, fragen Sie einfach. 📍`,
      horario: `Wir holen <b>Montag bis Freitag zu Geschäftszeiten</b> ab und passen uns Ihrem Betrieb an. Der Chat ist rund um die Uhr da 🤖; das Team antwortet am selben Werktag.`,
      desfavorable: `Ist das Ergebnis <b>negativ</b>, informieren wir Sie sofort mit dem Bericht und organisieren nach der Reparatur die <b>Nachprüfung</b>. Keine Überraschungen. 🔁`,
      caducada: `Mit abgelaufener ITV <b>darf das Fahrzeug nicht fahren</b>, außer mit Termin zur Station. Wir holen es ab und bringen es hin – genau da sparen Sie am meisten Zeit und vermeiden Bußgelder. ⚠️`,
      vehiculos: `Wir betreuen <b>Pkw, Transporter, Nutzfahrzeuge, Motorräder und leichte Industriefahrzeuge</b>. Für schwere Lkw oder Spezialmaschinen fragen Sie bitte an.`,
      urgente: `⚡ In dringenden Fällen schreiben Sie uns am besten per WhatsApp oder rufen jetzt an – wir erledigen es heute.`,
      contacto: `Sie können mit <b>Mari Ángeles</b> sprechen, die den Service leitet:`,
      gracias: `Sehr gern! 😊 Hier der direkte Kontakt, wann immer Sie ihn brauchen.`,
      quien: `Ich bin <b>HolaBot</b>, der virtuelle Assistent von <b>Hola ITV Málaga</b>. Dahinter steht <b>Mari Ángeles Pedrosa</b>, die den Service leitet und jede Flotte persönlich betreut.`,
      fallback: `Verstehe. Für eine genaue Antwort spricht am besten das Team direkt mit Ihnen. Soll ich Ihnen den Kontakt geben oder erklären, wie der Service funktioniert?`,
      proceso: `Ganz einfach, in <b>4 Schritten</b>:<ul><li><b>1.</b> Sie nennen uns Fahrzeuge und Fristen (E-Mail oder WhatsApp)</li><li><b>2.</b> Wir finden und buchen den Termin von heute auf morgen</li><li><b>3.</b> Wir holen ab und absolvieren die ITV (Gebühren vorgestreckt oder über Ihr ITV-Konto)</li><li><b>4.</b> Wir bringen das Fahrzeug ordnungsgemäß zurück und rechnen ab</li></ul>Null Aufwand für Sie. 🔑`
    }
  };

  /* ---------- Intenciones (palabras clave en todos los idiomas) ---------- */
  const INTENTS = [
    { id: 'particular', chips: ['empresa', 'contacto'], k: ['particular','mi coche','coche propio','soy un particular','no soy empresa','personal','private','my car','privado','particulier','ma voiture','prywatn','moj samochod','частн','моя машина','privato','la mia auto','privatperson','mein auto','privat'] },
    { id: 'urgente', cta: true, k: ['urgente','urgencia','hoy','ahora mismo','rapido','prisa','urgent','today','asap','right now','aujourd','pilne','pilnie','dzisiaj','срочно','сегодня','oggi','subito','dringend','heute','sofort'] },
    { id: 'cita', chips: ['empezar', 'recogida', 'precio'], k: ['cita','reservar','pedir hora','cuando','plazo','tardan','tardais','disponibilidad','manana','appointment','book','booking','when','rendez','reserver','quand','termin','umow','kiedy','запис','когда','prenot','appuntamento','quando','buchen','wann'] },
    { id: 'recogida', chips: ['documentos', 'tasas', 'contacto'], k: ['recog','recoge','venis','desplaz','trasladar','llevar','traer','entrega','conductor','a domicilio','en mis instalaciones','collect','pick up','pickup','driver','recuper','chauffeur','enlev','odbier','odbior','kierowc','забира','забер','водител','ritir','autista','abhol','fahrer'] },
    { id: 'tasas', chips: ['factura', 'precio', 'contacto'], k: ['tasa','pagar la itv','pago de la itv','dinero','efectivo','adelant','cuenta itv','mi cuenta','cuenta propia','propia cuenta','fee','fees','cash','own account','my account','frais','compte','oplat','opłat','konto','сбор','оплат','счет itv','tasse','conto','gebuhr','gebühr','vorstreck'] },
    { id: 'factura', chips: ['tasas', 'empezar'], k: ['factur','mensual','agrupad','contabilidad','iva','liquidaci','una sola factura','invoice','billing','monthly','accounting','facture','mensuel','faktur','miesieczn','счет','бухгалт','fattur','mensile','rechnung','monatlich','abrechnung'] },
    { id: 'expedientes', chips: ['documentos', 'empezar'], k: ['expedient','tramit','papeleo','gestion','incidencia','seguimiento','paperwork','procedure','demarche','dossier','formalnosc','dokumentacj','оформлен','pratiche','papierkram','formalitat'] },
    { id: 'documentos', chips: ['recogida', 'contacto'], k: ['document','papeles','ficha','permiso','seguro','necesito llevar','que hace falta','papers','insurance','registration','papiers','assurance','dokument','ubezpiecz','документ','страхов','documenti','assicuraz','unterlagen','versicherung','zulassung'] },
    { id: 'precio', cta: true, chips: ['como'], k: ['precio','tarifa','cuesta','cuanto','presupuesto','coste','€','euros','price','cost','how much','quote','prix','combien','tarif','devis','cena','koszt','ile kosztuje','цена','стоим','сколько','prezzo','costo','quanto','preventivo','preis','kosten','was kostet','angebot'] },
    { id: 'clientes', chips: ['empezar', 'precio'], k: ['concesionario','rent','alquiler','flota','taller','gestor','quien puede','trabaj','cliente','empresa','dealer','fleet','company','workshop','concession','flotte','location','garage','entreprise','dealer','flota','firma','warsztat','wypozycz','дилер','автопарк','компан','прокат','concessionar','noleggio','officina','azienda','autohaus','flotte','vermietung','werkstatt','unternehmen','firma'] },
    { id: 'zona', chips: ['cita', 'contacto'], k: ['zona','donde','malaga','marbella','fuengirola','torremolinos','velez','antequera','ronda','estepona','provincia','cobertura','ubicaci','where','area','location','ou ','region','gdzie','obszar','где','район','dove','zona','wo ','gebiet','region'] },
    { id: 'horario', chips: ['cita', 'contacto'], k: ['horario','hora','abierto','abris','fin de semana','sabado','domingo','hours','opening','weekend','horaire','ouvert','godzin','otwarte','weekend','часы','график','выходн','orario','aperto','öffnungs','offnungs','geoffnet','wochenende'] },
    { id: 'desfavorable', chips: ['cita', 'contacto'], k: ['desfavorable','no pasa','suspend','rechaz','fallo','defecto','segunda inspecci','fail','failed','defect','retest','defavorable','echec','contre-visite','negatyw','nie przeszed','ponown','не прош','отрицат','повторн','sfavorevol','bocciat','non passa','nicht bestanden','mangel','nachprufung','nachprüfung'] },
    { id: 'caducada', cta: true, k: ['caduc','vencid','fuera de plazo','multa','sancion','sin itv','expired','fine','out of date','expire','amende','wygasl','mandat','просроч','штраф','scadut','multa','abgelaufen','bussgeld','bußgeld','strafe'] },
    { id: 'vehiculos', chips: ['cita', 'documentos'], k: ['furgon','moto','camion','industrial','turismo','tipo de vehiculo','que vehiculos','remolque','autocaravana','van','truck','motorcycle','vehicle type','camionnette','fourgon','poids lourd','dostawcz','ciezarow','motocykl','фургон','грузов','мотоцикл','furgone','camion','transporter','lkw','motorrad','wohnmobil'] },
    { id: 'contacto', cta: true, k: ['contact','telefono','llamar','email','correo','whatsapp','wasap','hablar con','persona','humano','mari','phone','call','talk to','human','appeler','parler','telephone','zadzwon','telefon','rozmow','контакт','телефон','позвон','звонить','chiamar','parlare','anrufen','sprechen'] },
    { id: 'gracias', cta: true, k: ['gracias','perfecto','genial','vale','ok','estupendo','muchas gracias','thanks','thank you','great','merci','parfait','dziekuje','dzięki','super','спасибо','отлично','grazie','perfetto','danke','prima'] },
    { id: 'quien', chips: ['como', 'contacto'], k: ['quien eres','que eres','eres un bot','eres una ia','eres humano','robot','who are you','are you a bot','qui es-tu','qui etes','kim jestes','кто ты','вы бот','chi sei','wer bist du','wer sind sie'] },
    { id: 'hola', chips: ['como', 'cita', 'precio', 'particular'], k: ['hola','buenas','buenos dias','buenas tardes','hey','saludos','inicio','hello','hi ','good morning','bonjour','salut','czesc','cześć','dzien dobry','привет','здравств','ciao','buongiorno','hallo','guten tag','servus'] },
    { id: 'proceso', chips: ['cita', 'documentos', 'precio'], k: ['como funciona','proceso','pasos','que haceis','servicio','en que consiste','quiero empezar','empezar','soy empresa','how it works','how does','process','steps','start','comment ca marche','fonctionne','etapes','commencer','jak to dziala','jak dziala','kroki','zaczac','как работает','как это','шаги','начать','come funziona','passi','iniziare','wie funktioniert','so funktioniert','ablauf','schritte','starten'] }
  ];
  const BY_ID = {};
  INTENTS.forEach(it => { BY_ID[it.id] = it; });
  const CHIP_INTENT = { como: 'proceso', cita: 'cita', precio: 'precio', particular: 'particular', empresa: 'clientes', contacto: 'contacto', recogida: 'recogida', documentos: 'documentos', tasas: 'tasas', factura: 'factura', empezar: 'proceso' };
  const HELLO_CHIPS = ['como', 'cita', 'precio', 'particular'];

  /* ---------- Normalizar ---------- */
  const norm = s => (' ' + s + ' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function match(text) {
    const t = norm(text);
    let best = null, bestScore = 0;
    for (const it of INTENTS) {
      let score = 0;
      for (const k of it.k) {
        const kk = norm(k).trim();
        if (kk && t.includes(kk)) score += kk.length;
      }
      if (score > bestScore) { bestScore = score; best = it; }
    }
    return best;
  }

  /* ---------- DOM ---------- */
  function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function build() {
    const style = h('style'); style.textContent = css; document.head.appendChild(style);
    let lang = pageLang();
    const root = h('div'); root.id = 'hb-root';
    root.innerHTML = `
      <div id="hb-bubble"></div>
      <button id="hb-fab"><img src="${CFG.avatar}" alt="HolaBot"><span class="hb-dot"></span></button>
      <div id="hb-panel" role="dialog" aria-label="Hola ITV Málaga">
        <div class="hb-head">
          <img src="${CFG.avatar}" alt="">
          <div class="t"><b>${CFG.name} · Hola ITV Málaga</b><small><i></i> <span class="hb-status"></span></small></div>
          <div class="hb-btns">
            <button class="hb-reset"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/></svg></button>
            <button class="hb-close">×</button>
          </div>
        </div>
        <div class="hb-body" id="hb-body"></div>
        <div class="hb-foot">
          <input id="hb-in" type="text" autocomplete="off" maxlength="300">
          <button class="hb-send" id="hb-send"><svg viewBox="0 0 24 24"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button>
        </div>
        <div class="hb-powered"></div>
      </div>`;
    if (NO_FAB) root.classList.add('nofab');
    document.body.appendChild(root);

    const body = root.querySelector('#hb-body');
    const input = root.querySelector('#hb-in');
    let started = false;

    function paintUI() {
      const u = UI[lang];
      root.querySelector('#hb-bubble').textContent = u.bubble;
      root.querySelector('.hb-status').textContent = u.status;
      root.querySelector('.hb-powered').textContent = u.powered;
      input.placeholder = u.ph;
      root.querySelector('#hb-fab').setAttribute('aria-label', u.open);
      const rs = root.querySelector('.hb-reset'); rs.setAttribute('aria-label', u.reset); rs.title = u.reset;
      root.querySelector('.hb-close').setAttribute('aria-label', u.close);
      root.querySelector('#hb-send').setAttribute('aria-label', u.send);
    }
    paintUI();

    const CTA = () => {
      const u = UI[lang];
      const w = `<a class="wa" href="${CFG.wa}" target="_blank" rel="noopener">💬 WhatsApp</a>`;
      const t = `<a href="tel:${CFG.tel}">📞 ${CFG.telShow}</a>`;
      const m = `<a class="mail" href="mailto:${CFG.email}?subject=${encodeURIComponent(u.mailSubj)}">✉️ ${u.mail}</a>`;
      return `<div class="hb-cta">${w}${t}${m}</div>`;
    };

    const scroll = () => { body.scrollTop = body.scrollHeight; };

    function row(kind, inner) {
      const r = h('div', 'hb-row ' + kind);
      if (kind === 'bot') { const av = h('img', 'hb-av'); av.src = CFG.avatar; av.alt = ''; r.appendChild(av); }
      r.appendChild(inner); body.appendChild(r); scroll(); return r;
    }
    function addUser(t) { row('user', h('div', 'hb-msg user', t.replace(/&/g, '&amp;').replace(/</g, '&lt;'))); }
    function addBot(html) { row('bot', h('div', 'hb-msg bot', html)); }
    function addChips(ids) {
      const c = h('div', 'hb-chips');
      ids.forEach(id => {
        const b = h('button', 'hb-chip'); b.type = 'button'; b.textContent = CHIPS[lang][id];
        b.onclick = () => { c.remove(); addUser(CHIPS[lang][id]); reply(BY_ID[CHIP_INTENT[id]]); };
        c.appendChild(b);
      });
      body.appendChild(c); scroll();
    }
    function typing(ms) {
      return new Promise(res => {
        const r = row('bot', h('div', 'hb-typing', '<i></i><i></i><i></i>'));
        setTimeout(() => { r.remove(); res(); }, ms);
      });
    }
    // tiempo proporcional a la longitud del texto (≈ 18 ms por carácter, entre 600 y 2600 ms)
    const delayFor = html => Math.min(2600, Math.max(600, html.replace(/<[^>]+>/g, '').length * 18));

    let session = 0;
    function textFor(it) {
      const L = T[lang];
      if (!it) return L.fallback;
      if (it.id === 'hola') { const hr = new Date().getHours(); return L.hola(SAL[lang][hr < 13 ? 0 : hr < 20 ? 1 : 2]); }
      return L[it.id];
    }

    async function reply(it) {
      const my = session;
      root.querySelectorAll('.hb-chips').forEach(e => e.remove());
      let html = textFor(it);
      if (it && it.cta) html += CTA();
      await typing(delayFor(html));
      if (my !== session) return;
      addBot(html);
      if (!it) { addChips(['como', 'contacto']); return; }
      if (it.chips) addChips(it.chips);
    }

    function send() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      addUser(text);
      reply(match(text));
    }

    async function greet() {
      const my = session;
      const hi = textFor(BY_ID.hola);
      await typing(delayFor(hi));
      if (my !== session) return;
      addBot(hi);
      addChips(HELLO_CHIPS);
    }

    const mobile = () => window.matchMedia('(max-width:480px)').matches;
    function fitViewport() {
      const vv = window.visualViewport;
      if (!vv || !mobile()) { root.style.removeProperty('--hb-h'); root.style.removeProperty('--hb-top'); return; }
      root.style.setProperty('--hb-h', vv.height + 'px');
      root.style.setProperty('--hb-top', vv.offsetTop + 'px');
      scroll();
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => { if (root.classList.contains('open')) fitViewport(); });
      window.visualViewport.addEventListener('scroll', () => { if (root.classList.contains('open')) fitViewport(); });
    }

    function open() {
      root.classList.add('open');
      if (mobile()) document.documentElement.classList.add('hb-lock');
      fitViewport();
      if (!started) { started = true; greet(); }
      if (!TOUCH) setTimeout(() => input.focus(), 150);
    }
    function close() {
      root.classList.remove('open');
      document.documentElement.classList.remove('hb-lock');
      input.blur();
    }
    function reset() {
      session++;
      body.innerHTML = '';
      input.value = '';
      started = true;
      greet();
    }
    function setLang(l) {
      l = (l || '').slice(0, 2).toLowerCase();
      if (!LANGS.includes(l) || l === lang) return;
      lang = l;
      paintUI();
      if (started) {
        if (root.classList.contains('open')) reset();
        else { session++; body.innerHTML = ''; started = false; }
      }
    }
    window.HolaBot = { open, close, reset, setLang };
    window.addEventListener('hb:lang', e => setLang(e.detail));

    root.querySelector('#hb-fab').onclick = open;
    root.querySelector('.hb-close').onclick = close;
    root.querySelector('.hb-reset').onclick = reset;
    root.querySelector('#hb-send').onclick = send;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    setTimeout(() => { const b = root.querySelector('#hb-bubble'); if (b && !root.classList.contains('open')) b.style.display = 'none'; }, 9000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
