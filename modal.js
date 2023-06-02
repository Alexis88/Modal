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
 * MODO DE USO: Modal.show("Texto a mostrar"/{Objeto de opciones de configuración}); 
 * 
 *
 * @author		Alexis López Espinoza
 * @version		2.0
 * @param		options			Plain Object/String
 */

"use strict";

const Modal = {
	show: options => {
		/*** OPCIONES DE CONFIGURACIÓN ***
		 * 
		 * options.data: El contenido plano a mostrarse
		 * options.url: URL de la cual se obtendrá el contenido
		 * options.query: Cadena de consulta para adjuntar a la URL
		 * options.error: Llamada de retorno a ejecutarse si ocurre un error en la carga de un contenido externo
		 * options.newFront: Cuadro que se mostrará en lugar de la ventana modal
		 * options.callback: Llamada de retorno a ejecutarse luego de la carga del contenido de la ventana modal
		 * options.hideCall: Llamada de retorno a ejecutarse luego de cerrar la ventana modal
		 * options.content: Objeto con propiedades CSS para personalizar los elementos de la ventana modal
		 * options.time: Duración de la animación para mostrar y ocultar la ventana modal
		 */

		//Se libera la memoria ocupada por la configuración anterior (si hubo una)
		delete Modal.options;

		//ID de la ventana modal
		Modal.id = `modalID-${new Date().getTime()}`;

		//Si se recibió argumentos
		if (options){
			//Si el argumento no es un objeto, se lo establece como el texto a mostrar
			if ({}.toString.call(options) !== "[object Object]"){
				Modal.text = options;
			}
			//Si el argumento es un objeto, se lo establece como configuración de la ventana modal
			else{
				Modal.options = options;
				Modal.text = options.data;
			}
		}
		//Caso contrario, se aborta la ejecución
		else{
			throw new Error("Tiene que añadir un texto o un objeto con opciones de configuración para poder mostrar la ventana modal");
		}

		//El fondo
		Modal.createBack();

		//Duración de la animación para mostrar y ocultar la ventana modal
		Modal.animationTime = Modal.options?.time || 400;

		//Animación para mostrar la ventana modal
		Modal.animateBack();

		//Cuadro que mostrará el texto y/o imágenes
		Modal.createFront();

		//Botón para cerrar la ventana modal
		Modal.createClose();

		//Llamada de retorno a ejecutarse luego de cargar el contenido de la ventana modal
		Modal.callback = Modal.options?.callback && {}.toString.call(Modal.options?.callback) == "[object Function]" ? Modal.options.callback : false;

		//Llamada de retorno a ejecutarse luego de cerrar la ventana modal
		Modal.hideCall = Modal.options?.hideCall && {}.toString.call(Modal.options?.hideCall) == "[object Function]" ? Modal.options.hideCall : false;

		//Clases de elementos
		Modal.clases = ["modalClose", "arrow"];		

		//Se adhiere el botón para cerrar la ventana modal
		Modal.back.appendChild(Modal.close);

		//Se adhiere el cuadro al fondo
		if (Modal.options?.newFront){
			Modal.front = Modal.options.newFront;
			Modal.front.classList.add("modalFront");
			Modal.back.insertAdjacentHTML("beforeend", Modal.front);			
		}
		else{
			Modal.back.appendChild(Modal.front);			
		}

		//Animación para mostrar el contenido central
		Modal.animateFront();

		//Se hace una copia de la configuración de la ventana modal
		const config = {...Modal};

		//La URL de consulta
		Modal.urlContent(config);

		//Se adhiere el fondo al documento
		document.body.appendChild(config.back);

		//Si no se estableció un contenido central alternativo
		if (!config.options?.newFront){
			//Se ejecuta la llamada de retorno en caso haya una
			config.callback && config.callback();
		}

		//Se retiran las barras de desplazamiento del documento
		document.body.style.overflow = "hidden";

		//Se redimensionan los elementos de la ventana modal
		setTimeout(Modal.resize, config.animationTime);

		//Se recupera la cola de ventanas modales o se inicia una nueva
		Modal.queue = Modal.queue || [];		

		//Se encola la configuración de la ventana modal
		Modal.queue.push(config);

		//Configuración de eventos
		Modal.events(config);
	},

	events: modalConfig => {
		//Se cierra la ventana modal al pulsar el fondo oscuro o la X
		modalConfig.close.addEventListener("click", _ => Modal.hide(modalConfig), false);

		//Se aplica un efecto de transición en el botón de cerrado cuando se posa el cursor sobre él
		modalConfig.close.addEventListener("mouseover", _ => modalConfig.close.style.transition = ".4s ease", false);

		//Se elimina el efecto de transición del botón de cerrado al retirar el cursor de él
		modalConfig.close.addEventListener("mouseout", _ => setTimeout(_ => modalConfig.close.style.transition = "none", 400), false);

		document.addEventListener("mouseover", e => {
			const elem = e.target;

			Modal.clases.some(clase => {
				if (elem.classList.contains(clase)){
					elem.style.transform = "scale(1.2)";
				}
			});
		}, false);

		document.addEventListener("mouseout", e => {
			const elem = e.target;

			Modal.clases.some(clase => {
				if (elem.classList.contains(clase)){
					elem.style.transform = "scale(1)";
				}
			});
		}, false);

		//Cuando se pulse la tecla ESC, se cerrará la ventana modal
		document.addEventListener("keyup", e => {
			const list = Modal.queue;

			if (e.which == 27){
				Modal.hide(list[list.length - 1]);
				e.stopImmediatePropagation();
			}
		}, false);

		//Al girar el dispositivo, cambian las dimensiones del fondo
		window.addEventListener("orientationchange", Modal.resize, false);
		window.addEventListener("resize", Modal.resize, false);
	},

	createBack: _ => {
		Modal.back = document.createElement("div");		
		Modal.back.id = Modal.id;
		Modal.back.classList.add("modalBack");
		Modal.back.style = `
			width: ${window.innerWidth}px;
			height: ${window.innerHeight}px;
			background-color: rgba(0, 0, 0, .6);
			top: ${document.documentElement.scrollTop || document.body.scrollTop}px;
			left: 0;
			margin: 0;
			position: absolute;
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 8888;
			transition: all ease .15s;
		`;
	},

	animateBack: _ => {
		Modal.back.animate([{
			opacity: 0
		}, {
			opacity: 1
		}], {
			duration: Modal.animationTime
		});
	},

	createFront: _ => {
		Modal.front = document.createElement("div");
		Modal.front.classList.add("modalFront");
		Modal.front.style = `
			background-color: ${Modal.options?.content?.front?.backgroundColor ?? "#FFFFEF"};
			min-width: ${window.innerWidth * .5}px;
			max-width: ${window.innerWidth * .75}px;
			min-height: ${window.innerHeight * .45}px;
			max-height: ${window.innerHeight * .85}px;
			display: flex !important;
			align-items: center !important;
			justify-content: center !important;
			flex-direction: column !important;
			margin: 0 auto;
			text-align: ${Modal.options?.content?.front?.textAlign ?? "center"};
			overflow: auto;
			padding: 1% 2.5%;
			box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
			border: ${Modal.options?.content?.front?.border ?? 0};
			border-radius: ${Modal.options?.content?.front?.borderRadius ?? 0};
			transition: all ease .15s;
			word-wrap: break-word;
		`;
		Modal.front.innerHTML = Modal.options?.data || Modal.text;
	},

	animateFront: _ => {
		Modal.front.animate([{
			transform: "scaleY(0)",
			opacity: 0
		}, {
			transform: "scaleY(1)",
			opacity: 1
		}], {
			duration: Modal.animationTime
		});
	},

	createClose: _ => {
		Modal.close = document.createElement("b");
		Modal.close.classList.add("modalClose");
		Modal.close.style = `
			position: fixed;
			font-size: ${window.innerWidth < 850 ? ".9rem" : "1.4rem"};
			cursor: pointer;
			color: ${Modal.options?.content?.close?.color ?? "#304145"};
			user-select: none;
			transition: none;
		`;
		Modal.close.textContent = "❌";
		Modal.close.title = "Cerrar esta ventana";
	},

	urlContent: options => {
		if (options?.url?.length){
			//La cadena de consulta
			if (options.query?.length){
				Modal.getContent({
					url: options.url, 
					query: options.query, 
					error: options.error
				});
			}
			else{
				Modal.getContent({
					url: options.url, 
					error: options.error
				});
			}
		}
	},

	hide: modalConfig => {
		const modalQueuedIndex = Modal.queue.findIndex(mod => mod.id == modalConfig?.id),
			  modal = modalConfig?.back,
			  front = modalConfig?.front;

		//Si no hay ventana modal (el usuario puede haber pulsado la tecla ESC sin que haya ventanas modales presentes), se aborta la ejecución 
		if (!modal) return;

		//Se oculta la ventana modal con un efecto de animación
		modal.animate([{
			opacity: 1
		}, {
			opacity: 0
		}], {
			duration: modalConfig.animationTime,
			fill: "forwards"
		});

		//Se oculta el contenido central con un efecto de animación
		front.animate([{
			transform: "scaleY(1)",
			opacity: 1
		}, {
			transform: "scaleY(0)",
			opacity: 0
		}], {
			duration: modalConfig.animationTime,
			fill: "forwards"
		});

		//Terminado el tiempo de animación se eliminan el fondo y su contenido, se devuelve al documento sus barras de desplazamiento y el valor del comodín vuelve a true
		setTimeout(_ => {
			//Si la ventana modal existe, se la elimina del documento
			modal && modal.remove();	

			//Si ya no otras ventanas modales mostrándose, se restaura la barra de desplazamiento
			if (!Modal.exists()){
				document.body.style.overflowY = "auto";
			}
			//Si no, se redimensionan las restantes (para prevenir problemas de posicionamiento del botón de cerrado)
			else{
				Modal.resize();
			}			

			//Si hay una llamada de retorno de cierre de ventana, se ejecuta
			modalConfig.hideCall && modalConfig.hideCall();

			//Se elimina la copia de la ventana modal la cola			
			Modal.queue.splice(modalQueuedIndex, 1);
		}, modalConfig.animationTime);
	},

	hideAll: _ => Modal.queue.forEach(modalConfig => Modal.hide(modalConfig)),

	exists: _ => document.querySelectorAll(".modalBack"),

	resize: _ => {
		const modalList = Modal.queue;		
		let back, front, close, closePosition;

		if (!modalList.length) return;

		[...modalList].forEach(config => {
			back = config.back;
			front = config.front;
			close = config.close;			

			if (back){
				back.style.width = `${window.innerWidth}px`;
				back.style.height = `${window.innerHeight}px`;
				back.style.top = `${document.documentElement.scrollTop || document.body.scrollTop}px`;
			}
		
			if (front){
				front.style.minWidth = `${window.innerWidth * .5}px`;
				front.style.maxWidth = `${window.innerWidth * .75}px`;
				front.style.minHeight = `${window.innerHeight * .45}px`;
				front.style.maxHeight = `${window.innerHeight * .9}px`;		
			}

			if (close){
				closePosition = _ => {
					close.style.top = `${front.getBoundingClientRect().top * 1.065}px`;
					close.style.left = `${front.getBoundingClientRect().right - close.getBoundingClientRect().width * (front.scrollHeight > front.clientHeight ? 2 : 1.55)}px`;
				};
				back.addEventListener("transitionend", closePosition, false);
				back.addEventListener("animationend", closePosition, false);
			}
		});
	},

	getContent: config => {
		let options;

		if (!config.url) return;

		if (config.query){
			options = {
				url: config.url,
				data: {
					id: config.query
				},
				type: "json"
			};
		}
		else{
			options = {
				url: config.url
			};
		}

		Ajax(options).done(response => {
			if (config.error && {}.toString.call(config.error) === "[object Function]"){
				if (config.error(response)){
					return;
				}
			}

			if ("type" in options && response.length){
				let content = response,
					count = 0,
					total = content.length,
					img = document.querySelector(".modalClose").nextElementSibling;

				if (total > 1){
					let left = Modal.arrow("left", "<<", "Anterior"),
						right = Modal.arrow("right", ">>", "Siguiente");

					config.back.appendChild(left);
					config.back.appendChild(right);
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
				config.front.innerHTML = response;
				Modal.resize();
				config.callback && config.callback();
			}
		}).fail(error => Notification.msg(error));
	},

	arrow: (direction, text, title) => {
		const button = document.createElement("span");

		button.style = `
			position: fixed;
			top: 50%;
			${direction}: 1.5%;
			cursor: pointer;
			color: white;
			font-weight: bold;
			font-size: 1.5rem;
			user-select: none;
		`;	
		button.classList.add("arrow", direction);
		button.title = title;
		button.textContent = text;

		return button;
	}
};