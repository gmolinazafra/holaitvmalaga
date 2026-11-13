/* Hola ITV Málaga · barra lateral (Powered by Limonada Web): tema claro/oscuro y volver arriba.
   En el <head> de cada página: el script de una línea que lee "lw-theme" (evita el destello)
   y <link rel="stylesheet" href="/css/lw-theme.css">. */
(function(){
  var SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>', MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var rail=document.createElement('div');rail.className='side-rail';
  rail.innerHTML='<div class="theme-switch" role="group" aria-label="Tema de la página">'+
    '<button type="button" data-set-theme="light" aria-pressed="true" title="Tema claro"><span>Claro</span>'+SUN+'</button>'+
    '<button type="button" data-set-theme="dark" aria-pressed="false" title="Tema oscuro"><span>Oscuro</span>'+MOON+'</button></div>'+
    '<button type="button" class="to-top" title="Volver arriba"><span>Volver arriba</span><i aria-hidden="true"></i></button>';
  document.body.appendChild(rail);
  var root=document.documentElement,btns=rail.querySelectorAll('[data-set-theme]'),top=rail.querySelector('.to-top');
  var meta=document.querySelector('meta[name="theme-color"]');
  function apply(t){
    if(t==='dark')root.setAttribute('data-theme','dark');else root.removeAttribute('data-theme');
    for(var i=0;i<btns.length;i++)btns[i].setAttribute('aria-pressed',btns[i].getAttribute('data-set-theme')===t?'true':'false');
    if(meta)meta.setAttribute('content',t==='dark'?'#0d1a21':'#ffffff');
    if(typeof queue==='function')setTimeout(queue,50);
  }
  apply(root.getAttribute('data-theme')==='dark'?'dark':'light');
  for(var i=0;i<btns.length;i++)btns[i].addEventListener('click',function(){var t=this.getAttribute('data-set-theme');apply(t);try{localStorage.setItem('lw-theme',t);}catch(e){}});
  /* Color según el fondo que queda detrás de cada pieza */
  function parse(c){var m=c&&c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);return m?[+m[1],+m[2],+m[3],m[4]==null?1:+m[4]]:null;}
  function lum(c){var f=function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]);}
  function bgDark(x,y){
    var stack=document.elementsFromPoint?document.elementsFromPoint(x,y):[];
    for(var i=0;i<stack.length;i++){
      var el=stack[i];if(rail.contains(el))continue;
      for(var n=el;n&&n.nodeType===1;n=n.parentElement){
        var t=n.tagName;if(t==='IMG'||t==='VIDEO'||t==='CANVAS'||t==='IFRAME'||t==='PICTURE')return true;
        var cs=getComputedStyle(n),c=parse(cs.backgroundColor);
        if(c&&c[3]>.5)return lum(c)<.4;
        if(cs.backgroundImage&&cs.backgroundImage!=='none'){c=parse(cs.backgroundImage);if(c)return lum(c)<.4;if(/url\(/.test(cs.backgroundImage))return true;}
      }
      break;
    }
    return root.getAttribute('data-theme')==='dark';
  }
  var sw=rail.querySelector('.theme-switch'),raf=0;
  function tint(){raf=0;[sw,top].forEach(function(el){var r=el.getBoundingClientRect();if(!r.width)return;el.classList.toggle('on-dark',bgDark(r.left+r.width/2,r.top+r.height/2));});}
  function queue(){if(!raf)raf=requestAnimationFrame(tint);}
  function onScroll(){top.classList.toggle('show',window.scrollY>600);queue();}
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',queue);onScroll();
  setTimeout(queue,800);
  /* Volver arriba. Animación propia, fotograma a fotograma, que termina siempre en 0:
     así no la frenan el foco, la barra del navegador del móvil ni las imágenes que cargan al subir. */
  function getY(){return window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0;}
  function setY(y){window.scrollTo(0,y);document.documentElement.scrollTop=y;document.body.scrollTop=y;}
  function toTop(e){
    if(e)e.preventDefault();
    var html=document.documentElement,oldB=html.style.scrollBehavior,oldA=html.style.overflowAnchor;
    html.style.scrollBehavior='auto';html.style.overflowAnchor='none';
    var start=getY(),still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dur=still?0:Math.min(700,Math.max(300,start/6)),t0=null;
    function end(){
      setY(0);
      setTimeout(function(){if(getY()>0)setY(0);html.style.scrollBehavior=oldB;html.style.overflowAnchor=oldA;
        var first=document.querySelector('.logo-block');if(first){try{first.focus({preventScroll:true});}catch(x){}}},120);
    }
    if(!dur||start<=0){end();return;}
    function step(ts){
      if(t0===null)t0=ts;
      var k=Math.min(1,(ts-t0)/dur),ease=1-Math.pow(1-k,3);
      setY(Math.round(start*(1-ease)));
      if(k<1)requestAnimationFrame(step);else end();
    }
    requestAnimationFrame(step);
  }
  top.addEventListener('click',toTop);
  /* Llegada con #seccion desde otra página: el título queda justo bajo la cabecera fija */
  window.addEventListener('load',function(){
    var id=location.hash.slice(1);if(!id)return;var el=document.getElementById(id);if(!el)return;
    setTimeout(function(){
      var hdr=document.querySelector('.nav'),off=hdr?hdr.offsetHeight:0;
      if(el.tagName==='SECTION')off-=Math.max(0,parseFloat(getComputedStyle(el).paddingTop)-28);
      window.scrollTo(0,el.getBoundingClientRect().top+getY()-off);
    },60);
  });

})();

/* La píldora nunca queda a caballo entre la foto de portada y el fondo: si la pisa, baja justo debajo */
(function(){
  var img=document.querySelector('.hero-img'),rail=document.querySelector('.side-rail');if(!img||!rail)return;
  function fit(){
    rail.style.top='';rail.style.bottom='';rail.style.transform='';
    var r=rail.getBoundingClientRect(),sw=rail.querySelector('.theme-switch').getBoundingClientRect(),tt=rail.querySelector('.to-top'),h=tt&&tt.classList.contains('show')?r.height:sw.height,b=img.getBoundingClientRect().bottom;
    if(b>sw.top-8&&b<sw.bottom+8){var y=b+16;if(y+h<innerHeight-8){rail.style.top=y+'px';rail.style.bottom='auto';rail.style.transform='none'}}
  }
  addEventListener('scroll',fit,{passive:true});addEventListener('resize',fit);addEventListener('load',fit);fit();
})();
