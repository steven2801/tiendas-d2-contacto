(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  const banner = document.getElementById('banner');
  const modal = document.getElementById('modal');
  const botonEnviar = document.getElementById('enviar');
  const botonCerrar = document.getElementById('cerrar-modal');
  const mensaje = document.getElementById('mensaje');
  const contador = document.getElementById('contador');
  const tipo = document.getElementById('tipo');
  const etiquetaMensaje = document.getElementById('mensaje-label');
  const pistaMensaje = document.getElementById('mensaje-hint');
  const tarjetas = document.querySelectorAll('.card');

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const TELEFONO_REGEX = /^[0-9]{7,10}$/;

  // Texto que cambia según el tipo de solicitud
  const TEXTOS_POR_TIPO = {
    consulta: {
      etiqueta: 'Tu consulta',
      pista: 'Cuéntanos qué necesitas saber y en qué sucursal.',
      placeholder: 'Ej. ¿Hasta qué hora atiende la sucursal de Ipiales?'
    },
    pqrs: {
      etiqueta: 'Detalle de tu petición, queja o reclamo',
      pista: 'Incluye sucursal, fecha del hecho y número de factura. Puedes adjuntar evidencia.',
      placeholder: 'Describe lo ocurrido con la mayor claridad posible'
    }
  };

  // Carga de archivo simulada
  const EXTENSIONES = { pdf: 'pdf', doc: 'doc', docx: 'doc', jpg: 'img', jpeg: 'img', png: 'img' };
  const TAMANO_MAXIMO = 5 * 1024 * 1024;
  const dropzone = document.getElementById('dropzone');
  const inputArchivo = document.getElementById('adjunto');
  const chip = document.getElementById('archivo');
  const chipBadge = document.getElementById('archivo-badge');
  const chipNombre = document.getElementById('archivo-nombre');
  const chipTamano = document.getElementById('archivo-tamano');
  const chipEstado = document.getElementById('archivo-estado');
  const chipBarra = document.getElementById('archivo-barra');
  const botonQuitar = document.getElementById('archivo-quitar');
  const errorArchivo = document.getElementById('adjunto-error');
  let temporizadorCarga = null;
  let cargando = false;
  let archivoActual = null;

  // Reglas de validación: devuelven el mensaje de error o cadena vacía
  const reglas = {
    nombre(campo) {
      const valor = campo.value.trim();
      if (!valor) return 'Escribe tu nombre completo.';
      if (valor.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' .-]+$/.test(valor)) return 'Usa solo letras en el nombre.';
      return '';
    },
    email(campo) {
      const valor = campo.value.trim();
      if (!valor) return 'Escribe tu correo electrónico.';
      if (!EMAIL_REGEX.test(valor)) return 'Revisa el formato del correo, por ejemplo nombre@correo.com.';
      return '';
    },
    telefono(campo) {
      const valor = campo.value.trim();
      if (!valor) return 'Escribe un número de contacto.';
      if (!TELEFONO_REGEX.test(valor)) return 'Usa solo números, entre 7 y 10 dígitos.';
      return '';
    },
    tipo(campo) {
      return campo.value ? '' : 'Selecciona el tipo de solicitud.';
    },
    mensaje(campo) {
      const valor = campo.value.trim();
      if (!valor) return 'Escribe el detalle de tu solicitud.';
      if (valor.length < 10) return 'Cuéntanos un poco más: mínimo 10 caracteres.';
      return '';
    },
    politica(campo) {
      return campo.checked ? '' : 'Debes aceptar la política de tratamiento de datos para continuar.';
    }
  };

  function validarCampo(campo) {
    const error = reglas[campo.name](campo);
    const zonaError = document.getElementById(campo.id + '-error');

    zonaError.textContent = error;
    campo.classList.toggle('is-invalid', Boolean(error));
    campo.classList.toggle('is-valid', !error && campo.type !== 'checkbox');
    campo.setAttribute('aria-invalid', error ? 'true' : 'false');
    campo.setAttribute('aria-describedby', zonaError.id);

    return !error;
  }

  function validarFormulario() {
    let primerInvalido = null;

    Array.from(form.elements).forEach(function (campo) {
      if (!reglas[campo.name]) return;
      if (!validarCampo(campo) && !primerInvalido) primerInvalido = campo;
    });

    if (primerInvalido) primerInvalido.focus();
    return !primerInvalido;
  }

  function formatearTamano(bytes) {
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function quitarArchivo() {
    clearInterval(temporizadorCarga);
    cargando = false;
    archivoActual = null;
    inputArchivo.value = '';
    chip.hidden = true;
    chip.classList.remove('is-done');
    chipBarra.style.width = '0';
    errorArchivo.textContent = '';
  }

  function procesarArchivo(archivo) {
    quitarArchivo();
    if (!archivo) return;

    const extension = archivo.name.split('.').pop().toLowerCase();
    const tipoArchivo = EXTENSIONES[extension];

    if (!tipoArchivo) {
      errorArchivo.textContent = 'Formato no permitido. Usa PDF, Word, JPG o PNG.';
      return;
    }
    if (archivo.size > TAMANO_MAXIMO) {
      errorArchivo.textContent = 'El archivo supera el máximo de 5 MB.';
      return;
    }

    archivoActual = { nombre: archivo.name, tamano: archivo.size };
    chipBadge.textContent = extension === 'jpeg' ? 'JPG' : extension.toUpperCase();
    chipBadge.className = 'file-badge' + (tipoArchivo === 'doc' ? ' is-doc' : tipoArchivo === 'img' ? ' is-img' : '');
    chipNombre.textContent = archivo.name;
    chipTamano.textContent = formatearTamano(archivo.size);
    chipEstado.textContent = 'Cargando 0%';
    chip.hidden = false;
    cargando = true;

    let progreso = 0;
    temporizadorCarga = setInterval(function () {
      progreso = Math.min(100, progreso + 8 + Math.random() * 12);
      chipBarra.style.width = progreso + '%';
      chipEstado.textContent = 'Cargando ' + Math.round(progreso) + '%';
      if (progreso >= 100) {
        clearInterval(temporizadorCarga);
        cargando = false;
        chip.classList.add('is-done');
        chipEstado.textContent = 'Archivo cargado';
      }
    }, 120);
  }

  function mostrarBanner(texto) {
    banner.textContent = texto;
    banner.hidden = false;
  }

  function ocultarBanner() {
    banner.hidden = true;
    banner.textContent = '';
  }

  function limpiarFormulario() {
    form.reset();
    quitarArchivo();
    Array.from(form.elements).forEach(function (campo) {
      campo.classList.remove('is-valid', 'is-invalid');
      campo.removeAttribute('aria-invalid');
    });
    document.querySelectorAll('.error').forEach(function (e) { e.textContent = ''; });
    contador.textContent = '0 / ' + mensaje.maxLength;
    aplicarTextosPorTipo('');
  }

  function marcarTarjeta(valor) {
    tarjetas.forEach(function (t) {
      t.classList.toggle('is-active', t.dataset.tipo === valor);
    });
  }

  function aplicarTextosPorTipo(valor) {
    marcarTarjeta(valor);
    const textos = TEXTOS_POR_TIPO[valor];
    etiquetaMensaje.textContent = textos ? textos.etiqueta : 'Mensaje';
    pistaMensaje.textContent = textos ? textos.pista : 'Elige un tipo de solicitud para ver qué información incluir.';
    mensaje.placeholder = textos ? textos.placeholder : 'Escribe aquí el detalle de tu solicitud';
  }

  // Envía la solicitud al servidor, que la guarda en la base de datos
  async function enviarAlServidor() {
    const datos = {
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      tipo: form.tipo.value,
      mensaje: form.mensaje.value.trim(),
      politica: form.politica.checked,
      adjunto: archivoActual
    };

    const respuesta = await fetch('/api/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    if (!respuesta.ok) throw new Error('Error del servidor');
    return respuesta.json();
  }

  // Validación al salir del campo y corrección en vivo una vez marcado como inválido
  Array.from(form.elements).forEach(function (campo) {
    if (!reglas[campo.name]) return;
    const evento = campo.type === 'checkbox' || campo.tagName === 'SELECT' ? 'change' : 'blur';
    campo.addEventListener(evento, function () { validarCampo(campo); });
    campo.addEventListener('input', function () {
      if (campo.classList.contains('is-invalid')) validarCampo(campo);
    });
  });

  document.getElementById('telefono').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  mensaje.addEventListener('input', function () {
    contador.textContent = mensaje.value.length + ' / ' + mensaje.maxLength;
  });

  tipo.addEventListener('change', function () {
    aplicarTextosPorTipo(tipo.value);
  });

  // Al elegir una tarjeta se selecciona el tipo y se lleva al usuario al formulario
  tarjetas.forEach(function (tarjeta) {
    tarjeta.addEventListener('click', function () {
      tipo.value = tarjeta.dataset.tipo;
      validarCampo(tipo);
      aplicarTextosPorTipo(tipo.value);
      document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
      document.getElementById('nombre').focus({ preventScroll: true });
    });
  });

  inputArchivo.addEventListener('change', function () {
    procesarArchivo(inputArchivo.files[0]);
  });

  botonQuitar.addEventListener('click', function () {
    quitarArchivo();
    inputArchivo.focus();
  });

  ['dragenter', 'dragover'].forEach(function (nombre) {
    dropzone.addEventListener(nombre, function (e) {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'drop'].forEach(function (nombre) {
    dropzone.addEventListener(nombre, function () {
      dropzone.classList.remove('is-dragover');
    });
  });

  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    procesarArchivo(e.dataTransfer.files[0]);
  });

  form.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    ocultarBanner();

    if (!validarFormulario()) return;

    if (cargando) {
      errorArchivo.textContent = 'Espera a que termine la carga del archivo.';
      dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    botonEnviar.disabled = true;
    botonEnviar.textContent = 'Enviando...';

    try {
      await enviarAlServidor();
      limpiarFormulario();
      modal.showModal();
    } catch (error) {
      if (location.protocol === 'file:') {
        mostrarBanner('Abre el sitio desde http://localhost:3000 (ejecuta npm start) para guardar en la base de datos.');
      } else {
        mostrarBanner('No pudimos enviar tu solicitud. Inténtalo de nuevo en unos minutos.');
      }
    } finally {
      botonEnviar.disabled = false;
      botonEnviar.textContent = 'Enviar Solicitud';
    }
  });

  botonCerrar.addEventListener('click', function () { modal.close(); });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) modal.close();
  });
})();
