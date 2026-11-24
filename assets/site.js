/* Caribe Austral · comportamiento del sitio */
(function () {
  'use strict';

  /* Menú en pantallas chicas */
  var cabecera = document.querySelector('.cabecera');
  var menuBoton = document.querySelector('.menu-boton');
  if (cabecera && menuBoton) {
    menuBoton.addEventListener('click', function () {
      var abierto = cabecera.getAttribute('data-abierto') === 'true';
      cabecera.setAttribute('data-abierto', abierto ? 'false' : 'true');
      menuBoton.setAttribute('aria-expanded', abierto ? 'false' : 'true');
      menuBoton.textContent = abierto ? 'Menú' : 'Cerrar';
    });
    cabecera.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        cabecera.setAttribute('data-abierto', 'false');
        menuBoton.setAttribute('aria-expanded', 'false');
        menuBoton.textContent = 'Menú';
      });
    });
  }

  /* Riel de latitud: el scroll baja de Caracas (10°30′N) a Punta Arenas (53°10′S) */
  var riel = document.querySelector('.riel');
  if (riel) {
    var NORTE = 10.5, SUR = -(53 + 10 / 60), RANGO = NORTE - SUR;
    var linea = riel.querySelector('.riel__linea');
    var marca = riel.querySelector('.riel__marca');
    var lectura = riel.querySelector('.riel__lectura');
    var hitos = riel.querySelectorAll('.riel__hito');

    var formato = function (lat) {
      var abs = Math.abs(lat);
      var g = Math.floor(abs);
      var m = Math.round((abs - g) * 60);
      if (m === 60) { g += 1; m = 0; }
      if (g === 0 && m === 0) return '0°';
      return g + '°' + (m < 10 ? '0' : '') + m + '′' + (lat >= 0 ? 'N' : 'S');
    };

    var ubicarHitos = function () {
      var top = linea.offsetTop, alto = linea.offsetHeight;
      hitos.forEach(function (h) {
        var lat = parseFloat(h.getAttribute('data-lat'));
        h.style.top = (top + alto * (NORTE - lat) / RANGO) + 'px';
      });
    };

    var pendiente = false;
    var actualizar = function () {
      pendiente = false;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      var y = linea.offsetTop + linea.offsetHeight * p;
      marca.style.top = y + 'px';
      lectura.style.top = y + 'px';
      lectura.textContent = formato(NORTE - p * RANGO);
      hitos.forEach(function (h) { h.classList.toggle('cerca', Math.abs(h.offsetTop - y) < 26); });
      var yv = riel.getBoundingClientRect().top + y;
      var bajo = document.elementFromPoint(riel.offsetWidth + 8, Math.min(window.innerHeight - 1, yv));
      var tramo = bajo && bajo.closest('[data-tono]');
      riel.setAttribute('data-tono', tramo ? tramo.getAttribute('data-tono') : 'claro');
      var fondo = tramo ? getComputedStyle(tramo).backgroundColor : '';
      riel.style.backgroundColor = (fondo && fondo !== 'rgba(0, 0, 0, 0)' && fondo !== 'transparent') ? fondo : '';
    };
    var pedir = function () { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } };

    ubicarHitos();
    actualizar();
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', function () { ubicarHitos(); pedir(); });
  }

  /* Newsletter: misma captura que ya llega a Make y Brevo */
  var WEBHOOK = 'https://hook.us2.make.com/fb2lymvktha4ferduu31vfix2f3ld7fj';
  document.querySelectorAll('.suscripcion').forEach(function (caja) {
    var form = caja.querySelector('form');
    if (!form) return;
    var error = caja.querySelector('.suscripcion__error');
    var ok = caja.querySelector('.suscripcion__ok');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = form.querySelector('[name="nombre"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      if (!nombre) { error.textContent = 'Escribe tu nombre para saber cómo saludarte.'; form.querySelector('[name="nombre"]').focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { error.textContent = 'Revisa el correo: debe verse como nombre@correo.com.'; form.querySelector('[name="email"]').focus(); return; }
      error.textContent = '';
      var boton = form.querySelector('button');
      var textoBoton = boton.textContent;
      boton.disabled = true;
      boton.textContent = 'Enviando…';
      fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre, email: email, fuente: 'landing_github', incentivo: 'cap1_cuaderno' })
      }).catch(function () { /* la captura de Make responde sin cuerpo útil */ })
        .then(function () {
          ok.innerHTML = '';
          var fuerte = document.createElement('strong');
          fuerte.textContent = 'Listo, ' + nombre.split(' ')[0] + '.';
          ok.appendChild(fuerte);
          ok.appendChild(document.createTextNode(' Revisa tu correo: el capítulo 1 va en camino. Si no aparece en unos minutos, mira en promociones o spam.'));
          caja.setAttribute('data-estado', 'ok');
          boton.disabled = false;
          boton.textContent = textoBoton;
        });
    });
  });

  /* Copiar enlace de una columna */
  document.querySelectorAll('[data-copiar]').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = b.getAttribute('data-copiar');
      var listo = function () { b.textContent = 'Enlace copiado'; setTimeout(function () { b.textContent = 'Copiar enlace'; }, 2200); };
      if (navigator.clipboard) { navigator.clipboard.writeText(url).then(listo, function () { window.prompt('Copia el enlace:', url); }); }
      else { window.prompt('Copia el enlace:', url); }
    });
  });
})();
