/**
 * VENTANA MODAL PERSONALIZADA
 * 
 * Este script genera una ventana modal en el que se puede mostrar contenido de cualquier tipo, sea texto 
 * plano, multimedia o cargar el contenido de otra página.
 *
 * Se emplearon los archivos ajax.js y notification.js, listados en el repositorio.
 * Pueden ser encontrados aquí: https://github.com/Alexis88?tab=repositories
 * 
 *
 * MODO DE USO: Modal.show({opciones de configuración}); 
 * 
 *
 * @author		Alexis López Espinoza
 * @version		2.0
 * @param		options		Plain Object
 */

"use strict";

let Modal = {
	show: (
		options
		/*** OPCIONES DE CONFIGURACIÓN ***
		 * 
		 * options.data: El contenido plano a mostrarse
		 * options.url: URL de la cual se obtendrá el contenido
		 * options.query: Cadena de consulta para adjuntar a la URL
		 * options.newFront: Cuadro que se mostrará en lugar de la ventana modal
		 * options.callback: Llamada de retorno a ejecutarse luego de la carga del contenido de la ventana modal
		 * options.hideCall: Llamada de retorno a ejecutarse luego de cerrar la ventana modal
		 * options.align: Alineación del contenido
		 * options.borders: Estilo de bordes de la ventana modal
		 * options.time: Duración de la animación para mostrar y ocultar la ventana modal
		 */
	) => {
		//Marca de tiempo
		let modalID = `modalID-${new Date().getTime()}`;

		//ID de la ventana modal
		Modal.id = modalID;

		//El fondo
		Modal.back = document.createElement("div");		
		Modal.back.id = modalID;
		Modal.back.classList.add("modalBack");
		Modal.back.style.width = window.innerWidth + "px";
		Modal.back.style.height = window.innerHeight + "px";
		Modal.back.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
		Modal.back.style.top = (document.documentElement.scrollTop || document.body.scrollTop) + "px";
		Modal.back.style.left = 0;
		Modal.back.style.margin = 0;
		Modal.back.style.position = "absolute";		
		Modal.back.style.display = "flex";
		Modal.back.style.alignItems = "center";
		Modal.back.style.justifyContent = "center";
		Modal.back.style.zIndex = "8888";
		Modal.back.style.transition = "all ease .15s";

		//Duración de la animación para mostrar y ocultar la ventana modal
		Modal.animationTime = options.time || 400;

		//Animación para mostrar la ventana modal
		Modal.back.animate([{
			opacity: 0
		}, {
			opacity: 1
		}], {
			duration: Modal.animationTime
		});

		//Cuadro que mostrará el texto y/o imágenes
		Modal.front = document.createElement("div");
		Modal.front.classList.add("modalFront");
		Modal.front.style.minWidth = window.innerWidth * .5 + "px";
		Modal.front.style.maxWidth = window.innerWidth * .75 + "px";
		Modal.front.style.minHeight = window.innerHeight * .45 + "px";
		Modal.front.style.maxHeight = window.innerHeight * .85 + "px";
		Modal.front.style.display = "flex !important";
		Modal.front.style.alignItems = "center !important";
		Modal.front.style.justifyContent = "center !important";
		Modal.front.style.margin = "0 auto";
		Modal.front.style.textAlign = options.align || "center";
		Modal.front.style.overflow = "auto";
		Modal.front.style.backgroundColor = "snow";
		Modal.front.style.paddingTop = "1%";
		Modal.front.style.paddingBottom = "1%";
		Modal.front.style.paddingRight = "2.5%";
		Modal.front.style.paddingLeft = "2.5%";
		Modal.front.style.borderRadius = options.borders || 0;
		Modal.front.style.transition = "all ease .15s";
		Modal.front.style.wordWrap = "break-word";
		Modal.front.innerHTML = options.data || "";

		//Botón para cerrar la ventana modal
		Modal.close = document.createElement("b");
		Modal.close.classList.add("modalClose");
		Modal.close.style.position = "fixed";
		Modal.close.style.fontSize = window.innerWidth < 850 ? ".9rem" : "1.4rem";
		Modal.close.style.cursor = "pointer";
		Modal.close.style.color = "#304145";
		Modal.close.style.userSelect = "none";
		Modal.close.style.transition = "all ease .2s";
		Modal.close.textContent = "❌";
		Modal.close.title = "Cerrar esta ventana";

		//La URL de consulta
		if (options.url?.length){
			//La cadena de consulta
			if (options.query?.length){
				Modal.getContent(options.url, options.query);
			}
			else{
				Modal.getContent(options.url);
			}
		}

		//Llamadas de retorno
		Modal.callback = options.callback && {}.toString.call(options.callback) == "[object Function]" ? options.callback : false;
		Modal.hideCall = options.hideCall && {}.toString.call(options.hideCall) == "[object Function]" ? options.hideCall : false;

		//Clases de elementos
		Modal.clases = ["modalClose", "arrow"];
		
		document.addEventListener("mouseover", e => {
			let elem = e.target;

			Modal.clases.some(clase => {
				if (elem.classList.contains(clase)){
					elem.style.transform = "scale(1.2)";
				}
			});
		}, false);

		document.addEventListener("mouseout", e => {
			let elem = e.target;

			Modal.clases.some(clase => {
				if (elem.classList.contains(clase)){
					elem.style.transform = "scale(1)";
				}
			});
		}, false);

		//Se adhiere el botón para cerrar la ventana modal
		Modal.back.appendChild(Modal.close);

		//Se adhiere el cuadro al fondo
		if (options.newFront){
			Modal.front = options.newFront;
			Modal.front.classList.add("modalFront");
			Modal.back.insertAdjacentHTML("beforeend", Modal.front);			
		}
		else{
			Modal.back.appendChild(Modal.front);
		}

		//Animación para mostrar el contenido central
		Modal.front.animate([{
			transform: "scaleY(0)",
			opacity: 0
		}, {
			transform: "scaleY(1)",
			opacity: 1
		}], {
			duration: Modal.animationTime
		});

		//Se adhiere el fondo al documento
		document.body.appendChild(Modal.back);

		//Se retiran las barras de desplazamiento del documento
		document.body.style.overflow = "hidden";

		//Se redimensionan los elementos de la ventana modal
		Modal.resize();

		//Se recupera la cola de ventanas modales o se inicia una nueva
		Modal.queue = Modal.queue || [];

		//Se hace una copia de la configuración de la ventana modal
		let tempModal = {...Modal};

		//Se elimina el encolado de la copia
		delete tempModal.queue;

		//Se encola la configuración de la ventana modal
		Modal.queue.push(tempModal);

		//Se cierra la ventana modal al pulsar el fondo oscuro o la X
		document.addEventListener("click", e => {
			let elem = e.target, modal;

			//Si se pulsa en el fondo
			/*if (elem.classList.contains("modalBack")){
				Modal.hide(elem);
			}*/

			//Si se pulsa en la X
			if (elem.classList.contains("modalClose")){
				Modal.hide(elem.parentNode);
			}
		}, false);

		//Cuando se pulse la tecla ESC, se cerrará la ventana modal
		document.addEventListener("keyup", e => e.which == 27 && Modal.hide(Modal.back), false);

		//Al girar el dispositivo, cambian las dimensiones del fondo
		window.addEventListener("orientationchange", Modal.resize, false);
		window.addEventListener("resize", Modal.resize, false);
	},

	hide: modal => {
		let modalQueued = {...Modal.queue.find(mod => mod.id == modal.id)},
			modalQueuedIndex = Modal.queue.findIndex(mod => mod.id == modal.id),
			front = modal.querySelector(".modalFront");

		//Se oculta la ventana modal con un efecto de animación
		modal.animate([{
			opacity: 1
		}, {
			opacity: 0
		}], {
			duration: modalQueued?.animationTime || Modal.animationTime
		});

		//Se oculta el contenido central con un efecto de animación
		if (front){
			front.animate([{
				transform: "scaleY(1)",
				opacity: 1
			}, {
				transform: "scaleY(0)",
				opacity: 0
			}], {
				duration: modalQueued?.animationTime || Modal.animationTime
			});
		}

		//Se oculta la ventana modal del todo (para evitar el problema del parpadeo)
		modal.style.opacity = 0;

		//Terminado el tiempo de animación se eliminan el fondo y su contenido, se devuelve al documento sus barras de desplazamiento y el valor del comodín vuelve a true
		setTimeout(_ => {
			//Si la ventana modal existe, se la elimina del documento
			modal && modal.remove();	

			//Si ya no otras ventanas modales mostrándose, se restaura la barra de desplazamiento
			if (!document.querySelectorAll(".modalBack").length){
				document.body.style.overflowY = "auto";
			}
			//Si no, se redimensionan las restantes (para prevenir problemas de posicionamiento del botón de cerrado)
			else{
				Modal.resize();
			}			

			//Se elimina la copia de la ventana modal la cola			
			Modal.queue.splice(modalQueuedIndex, 1);

			//Si hay una llamada de retorno de cierre de ventana, se ejecuta
			modalQueued?.hideCall && modalQueued?.hideCall();
		}, modalQueued?.animationTime || Modal.animationTime);
	},

	hideAll: _ => [...document.querySelectorAll(".modalBack")].forEach(modal => Modal.hide(modal)),

	exists: _ => document.querySelectorAll(".modalBack"),

	resize: _ => {
		let front, close;

		if (!Modal.exists()) return;

		[...document.querySelectorAll(".modalBack")].forEach(back => {
			back.style.width = window.innerWidth + "px";
			back.style.height = window.innerHeight + "px";
			back.style.top = (document.documentElement.scrollTop || document.body.scrollTop) + "px";
		
			//Contenido central
			front = back.querySelector(".modalFront");
		
			if (front){
				front.style.minWidth = window.innerWidth * .5 + "px";
				front.style.maxWidth = window.innerWidth * .75 + "px";
				front.style.minHeight = window.innerHeight * .45 + "px";
				front.style.maxHeight = window.innerHeight * .9 + "px";		
			}

			//Botón de cerrado
			close = back.querySelector(".modalClose");

			if (close){
				close.style.opacity = 0;

				setTimeout(_ => {
					close.style.top = front.getBoundingClientRect().top * 1.05 + "px";
					close.style.left = (front.getBoundingClientRect().right - close.getBoundingClientRect().width * 1.55) + "px";
					close.style.opacity = 1;
				}, Modal.animationTime);
			}
		});
	},

	getContent: (url, query) => {
		let options;

		if (query){
			options = {
				url: url,
				data: {
					id: query
				},
				type: "json"
			};
		}
		else{
			options = {url: url};
		}

		Ajax(options).done(response => {
			if ("type" in options && response.length){
				let content = response,
					count = 0,
					total = content.length,
					img = document.querySelector(".modalClose").nextElementSibling;

				if (total > 1){
					let left = Modal.arrow("left", "<<", "Anterior"),
						right = Modal.arrow("right", ">>", "Siguiente");

					Modal.back.appendChild(left);
					Modal.back.appendChild(right);
					Modal.resize();

					document.addEventListener("click", e => {
						let elem = e.target;

						if (elem.classList.contains("arrow")){
							if (elem.classList.contains("left")){
								count = count - 1 < 0 ? total - 1 : count - 1;
								img.src = content[count];
							}

							if (elem.classList.contains("right")){
								count = count + 1 == total ? 0 : count + 1;
								img.src = content[count];
							}
						}

					}, false);
				}				
			}
			else{
				Modal.front.innerHTML = response;
				Modal.resize();
				Modal.callback && Modal.callback();
			}
		}).fail(error => Notification.msg(error));
	},

	arrow: (dir, txt, title) => {
		let btn = document.createElement("span");

		btn.style.position = "fixed";
		btn.style.top = "50%";
		btn.style[dir] = "1.5%";
		btn.style.cursor = "pointer";
		btn.style.color = "white";
		btn.style.fontWeight = "bold";
		btn.style.fontSize = "1.5rem";
		btn.style.userSelect = "none";		
		btn.classList.add("arrow", dir);
		btn.title = title;
		btn.textContent = txt;

		return btn;
	}
};
