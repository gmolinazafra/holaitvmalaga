/* ============================================================
   HolaBot — Asistente de Hola ITV Málaga
   Un solo archivo. Añadir antes de </body>:
   <script src="/holaitv-bot.js" defer></script>
   Requiere /bot-holaitv.png (avatar sin fondo)
   ============================================================ */
(function () {
  'use strict';

  const CFG = {
    avatar: '/bot-holaitv.png',
    email: 'mapedrosa@holaitvmalaga.com',
    tel: '+34615371847',
    telShow: '615 371 847',
    wa: 'https://wa.me/34615371847?text=' + encodeURIComponent('Hola, vengo de holaitvmalaga.com y quiero información para gestionar la ITV de mi flota.'),
    name: 'HolaBot',
    typingMin: 500,
    typingMax: 1200
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
    #hb-panel{width:calc(100vw - 20px);height:calc(100dvh - 20px);max-height:calc(100dvh - 20px);border-radius:18px}
  }
  `;

  /* ---------- Base de conocimiento ---------- */
  const R = {
    hola: () => {
      const h = new Date().getHours();
      const sal = h < 13 ? '¡Buenos días!' : h < 20 ? '¡Buenas tardes!' : '¡Buenas noches!';
      return `${sal} Soy <b>HolaBot</b>, el asistente virtual de <b>Hola ITV Málaga</b> 🤖<br>Gestionamos la ITV de flotas profesionales: cita, recogida, inspección, entrega y factura. <b>¿En qué te ayudo?</b>`;
    },

    particular: () => `Trabajamos <b>exclusivamente con empresas y profesionales del automóvil</b>: concesionarios, rent-a-car, talleres, flotas… Para un vehículo particular te recomendamos pedir cita directamente en la estación ITV.<br><br>Si tienes una empresa con varios vehículos, ¡cuéntame! 🚐`,

    cita: () => `Gestionamos la cita <b>de un día para otro</b> ⚡. Nos dices matrícula y disponibilidad, y localizamos hueco en la estación ITV que mejor encaje. Tú no llamas a nadie.<br><br>¿Quieres que empecemos con tu flota?`,

    recogida: () => `Sí: un conductor profesional <b>acude a tus instalaciones</b>, recoge el vehículo, pasa la inspección y te lo <b>devuelve con la documentación en regla</b>. Tu equipo no pierde ni una hora. 🔑`,

    tasas: () => `<b>Adelantamos las tasas de ITV.</b> Tus empleados no manejan dinero ni tickets: nosotros pagamos en la estación y te lo incluimos en la factura. 💶`,

    factura: () => `Emitimos <b>una factura por cada servicio</b> (recogida + inspección + tasas + gestión) y si lo prefieres te <b>agrupamos todo en una liquidación mensual</b> para que contabilidad lo tenga sencillo. 🧾`,

    expedientes: () => `Nos encargamos de la <b>gestión de expedientes</b>: comprobamos documentación, resolvemos incidencias con la estación y llevamos el seguimiento de cada vehículo hasta que tiene la pegatina puesta. 📋`,

    documentos: () => `Para que pasemos la ITV por ti necesitamos en el vehículo:<ul><li>Permiso de circulación</li><li>Ficha técnica</li><li>Tarjeta de inspección técnica</li><li>Recibo del seguro en vigor</li></ul>Si falta algo, te avisamos antes de recoger. ✅`,

    precio: () => `Cada flota es distinta, así que preparamos <b>un plan a medida</b> según volumen, tipo de vehículos y frecuencia. Cuéntame cuántos vehículos gestionas y te contactamos con una propuesta en menos de 24h.`,

    clientes: () => `Trabajamos con:<ul><li>🏢 Concesionarios oficiales</li><li>🔄 Vehículo de ocasión (VO)</li><li>🚗 Rent-a-car</li><li>🚐 Flotas de empresa y furgonetas</li><li>🔧 Talleres y gestorías</li></ul>Si manejas volumen de vehículos, encajas.`,

    zona: () => `Operamos en <b>Málaga y provincia</b>: capital, Costa del Sol, Guadalhorce, Axarquía… Si estás más lejos, pregúntame y lo vemos. 📍`,

    horario: () => `Recogemos <b>de lunes a viernes en horario laboral</b>, adaptándonos a la operativa de tu negocio. Para el chat, estoy 24/7 🤖; el equipo humano responde el mismo día laborable.`,

    desfavorable: () => `Si el resultado es <b>desfavorable</b>, te informamos al momento con el informe, y coordinamos la <b>segunda inspección</b> una vez reparado. Sin sorpresas. 🔁`,

    caducada: () => `Con la ITV caducada el vehículo <b>no puede circular</b> salvo para ir a la estación con cita. Nosotros lo recogemos y lo llevamos: es justo el caso en el que más ahorras tiempo y riesgo de multa. ⚠️`,

    vehiculos: () => `Gestionamos <b>turismos, furgonetas, vehículos comerciales, motos y vehículos industriales ligeros</b>. Para camiones pesados o maquinaria especial, consúltanos.`,

    urgente: () => `⚡ Para urgencias, lo más rápido es que nos escribas por WhatsApp o nos llames ahora mismo y lo movemos hoy.`,

    contacto: () => `Puedes hablar con <b>Mari Ángeles</b>, responsable del servicio:`,

    gracias: () => `¡Un placer! 😊 Si quieres, te dejo el contacto directo para arrancar cuando lo necesites.`,

    quien: () => `Soy <b>HolaBot</b>, el asistente virtual de <b>Hola ITV Málaga</b>. Detrás está <b>Mari Ángeles Pedrosa</b>, que dirige el servicio y gestiona personalmente cada flota.`,

    fallback: () => `Entiendo. Para darte una respuesta exacta sobre eso, lo mejor es que lo hable contigo el equipo directamente. ¿Te paso el contacto o prefieres que te cuente cómo funciona el servicio?`
  };

  const CTA = (opts = {}) => {
    const w = `<a class="wa" href="${CFG.wa}" target="_blank" rel="noopener">💬 WhatsApp</a>`;
    const t = `<a href="tel:${CFG.tel}">📞 ${CFG.telShow}</a>`;
    const m = `<a class="mail" href="mailto:${CFG.email}?subject=${encodeURIComponent('Solicitud de servicio ITV')}">✉️ Email</a>`;
    return `<div class="hb-cta">${w}${t}${opts.mail !== false ? m : ''}</div>`;
  };

  const INTENTS = [
    { k: ['particular','mi coche','coche propio','soy un particular','no soy empresa','personal'], r: 'particular', chips: ['Soy empresa','Contacto'] },
    { k: ['urgente','urgencia','hoy','ahora mismo','ya','rápido','rapido','prisa'], r: 'urgente', cta: true },
    { k: ['cita','reservar','pedir hora','cuando','cuándo','plazo','tardan','tardais','tardáis','disponibilidad','mañana'], r: 'cita', chips: ['Quiero empezar','¿Recogéis el vehículo?','Precio'] },
    { k: ['recog','recoge','venís','venis','desplaz','trasladar','llevar','traer','entrega','conductor','a domicilio','en mis instalaciones'], r: 'recogida', chips: ['¿Qué documentos necesito?','Adelanto de tasas','Contacto'] },
    { k: ['tasa','tasas','pagar la itv','pago de la itv','dinero','efectivo','adelant'], r: 'tasas', chips: ['Facturación','Precio','Contacto'] },
    { k: ['factur','mensual','agrupad','contabilidad','iva','liquidaci','una sola factura'], r: 'factura', chips: ['Adelanto de tasas','Quiero empezar'] },
    { k: ['expedient','tramit','papeleo','gestion','gestión','incidencia','seguimiento'], r: 'expedientes', chips: ['Documentos','Quiero empezar'] },
    { k: ['document','papeles','ficha','permiso','seguro','tarjeta','necesito llevar','qué hace falta','que hace falta'], r: 'documentos', chips: ['¿Recogéis el vehículo?','Contacto'] },
    { k: ['precio','tarifa','cuesta','cuánto','cuanto','presupuesto','coste','vale','€','euros'], r: 'precio', cta: true, chips: ['Cómo funciona'] },
    { k: ['concesionario','rent','alquiler','flota','taller','gestor','quién','quien puede','trabaj','cliente','empresa'], r: 'clientes', chips: ['Quiero empezar','Precio'] },
    { k: ['zona','dónde','donde','málaga','malaga','marbella','fuengirola','torremolinos','vélez','velez','antequera','ronda','estepona','provincia','cobertura','ubicaci'], r: 'zona', chips: ['Pedir cita','Contacto'] },
    { k: ['horario','hora','abierto','abris','abrís','fin de semana','sábado','sabado','domingo'], r: 'horario', chips: ['Pedir cita','Contacto'] },
    { k: ['desfavorable','no pasa','suspend','rechaz','fallo','defecto','segunda inspecci'], r: 'desfavorable', chips: ['Pedir cita','Contacto'] },
    { k: ['caduc','vencid','fuera de plazo','multa','sanción','sancion','sin itv'], r: 'caducada', cta: true },
    { k: ['furgon','moto','camión','camion','industrial','turismo','tipo de vehículo','tipo de vehiculo','qué vehículos','que vehiculos','remolque','autocaravana'], r: 'vehiculos', chips: ['Pedir cita','Documentos'] },
    { k: ['contact','teléfono','telefono','llamar','email','correo','whatsapp','wasap','hablar con','persona','humano','mari'], r: 'contacto', cta: true },
    { k: ['gracias','perfecto','genial','vale','ok','estupendo','muchas gracias'], r: 'gracias', cta: true },
    { k: ['quién eres','quien eres','qué eres','que eres','eres un bot','eres una ia','eres humano','robot'], r: 'quien', chips: ['Cómo funciona','Contacto'] },
    { k: ['hola','buenas','buenos días','buenos dias','buenas tardes','hey','ey','saludos','empezar','inicio'], r: 'hola', chips: ['Cómo funciona','Pedir cita','Precio','Soy particular'] },
    { k: ['cómo funciona','como funciona','proceso','pasos','qué hacéis','que haceis','servicio','en qué consiste','en que consiste','quiero empezar','empezar','soy empresa'], r: null, chips: ['Pedir cita','Documentos','Precio'] }
  ];

  const PROCESO = () => `Así de simple, en <b>4 pasos</b>:<ul><li><b>1.</b> Nos indicas los vehículos y plazos (email o WhatsApp)</li><li><b>2.</b> Localizamos y reservamos la cita, de un día para otro</li><li><b>3.</b> Recogemos, pasamos la ITV y adelantamos las tasas</li><li><b>4.</b> Devolvemos el vehículo con todo en regla y facturamos</li></ul>Cero gestión para ti. 🔑`;

  /* ---------- Normalizar ---------- */
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  function match(text) {
    const t = norm(text);
    let best = null, bestScore = 0;
    for (const it of INTENTS) {
      let score = 0;
      for (const k of it.k) {
        const kk = norm(k);
        if (t.includes(kk)) score += kk.length;
      }
      if (score > bestScore) { bestScore = score; best = it; }
    }
    return best;
  }

  /* ---------- DOM ---------- */
  function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function build() {
    const style = h('style'); style.textContent = css; document.head.appendChild(style);
    const root = h('div'); root.id = 'hb-root';
    root.innerHTML = `
      <div id="hb-bubble">¿Te ayudo con la ITV de tu flota? 👋</div>
      <button id="hb-fab" aria-label="Abrir asistente"><img src="${CFG.avatar}" alt="HolaBot"><span class="hb-dot"></span></button>
      <div id="hb-panel" role="dialog" aria-label="Asistente Hola ITV Málaga">
        <div class="hb-head">
          <img src="${CFG.avatar}" alt="">
          <div class="t"><b>${CFG.name} · Hola ITV Málaga</b><small><i></i> En línea · respondo al instante</small></div>
          <button class="hb-close" aria-label="Cerrar">×</button>
        </div>
        <div class="hb-body" id="hb-body"></div>
        <div class="hb-foot">
          <input id="hb-in" type="text" placeholder="Escribe tu consulta…" autocomplete="off" maxlength="300">
          <button class="hb-send" id="hb-send" aria-label="Enviar"><svg viewBox="0 0 24 24"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button>
        </div>
        <div class="hb-powered">Asistente con IA · Hola ITV Málaga</div>
      </div>`;
    document.body.appendChild(root);

    const body = root.querySelector('#hb-body');
    const input = root.querySelector('#hb-in');
    let started = false;

    const scroll = () => { body.scrollTop = body.scrollHeight; };

    function row(kind, inner) {
      const r = h('div', 'hb-row ' + kind);
      if (kind === 'bot') { const av = h('img', 'hb-av'); av.src = CFG.avatar; av.alt = ''; r.appendChild(av); }
      r.appendChild(inner); body.appendChild(r); scroll(); return r;
    }
    function addUser(t) { row('user', h('div', 'hb-msg user', t.replace(/</g, '&lt;'))); }
    function addBot(html) { row('bot', h('div', 'hb-msg bot', html)); }
    function addChips(list) {
      const c = h('div', 'hb-chips');
      list.forEach(l => { const b = h('button', 'hb-chip', l); b.type = 'button'; b.onclick = () => { c.remove(); send(l); }; c.appendChild(b); });
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

    async function reply(text) {
      root.querySelectorAll('.hb-chips').forEach(e => e.remove());
      const it = match(text);
      let html;
      if (!it) html = R.fallback();
      else { html = it.r ? R[it.r]() : PROCESO(); if (it.cta) html += CTA(); }
      await typing(delayFor(html));
      addBot(html);
      if (!it) { addChips(['Cómo funciona', 'Contacto']); return; }
      if (it.chips) addChips(it.chips);
    }

    function send(text) {
      text = (text || input.value).trim();
      if (!text) return;
      input.value = '';
      addUser(text);
      reply(text);
    }

    async function open() {
      root.classList.add('open');
      if (!started) {
        started = true;
        const hi = R.hola();
        await typing(delayFor(hi));
        addBot(hi);
        addChips(['Cómo funciona', 'Pedir cita', 'Precio', 'Soy particular']);
      }
      setTimeout(() => input.focus(), 150);
    }
    function close() { root.classList.remove('open'); }

    root.querySelector('#hb-fab').onclick = open;
    root.querySelector('.hb-close').onclick = close;
    root.querySelector('#hb-send').onclick = () => send();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    setTimeout(() => { const b = root.querySelector('#hb-bubble'); if (b && !root.classList.contains('open')) b.style.display = 'none'; }, 9000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
