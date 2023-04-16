/*
 * VENTANA MODAL PERSONALIZADA
 * 
 * Este script genera una ventana modal en el que se puede mostrar contenido de cualquier tipo, sea texto 
 * plano, multimedia o cargar el contenido de otra página.
 *
 * Se emplearon los archivos ajax.js y notification.js, listados en el repositorio.
 * Pueden ser encontrados aquí: https://github.com/Alexis88?tab=repositories
 * 
 *
 * MODO DE USO: Modal.show("El contenido"); 
 * 
 *
 * @author		Alexis López Espinoza
 * @version		1.0
 * @param		{data}		plain text		El contenido de la ventana modal
 */

"use strict";

let Modal = {
	show: (data, url, query, newFront, callback) => {
		//El fondo
		Modal.back = document.createElement("div");
		Modal.back.classList.add("modalBack");
		Modal.back.style.width = window.innerWidth + "px";
		Modal.back.style.height = window.innerHeight + "px";
		Modal.back.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
		Modal.back.style.top = (document.documentElement.scrollTop || document.body.scrollTop) + "px";
		Modal.back.style.left = 0;
		Modal.back.style.margin = 0;
		Modal.back.style.position = "absolute";		
		Modal.back.style.display = "flex";
		Modal.back.style.alignItems = "center";
		Modal.back.style.justifyContent = "center";
		Modal.back.style.zIndex = "8888";
		Modal.back.style.transition = "all ease .15s";		

		//Cuadro que mostrará el texto y/o imágenes
		Modal.front = document.createElement("div");
		Modal.back.classList.add("modalFront");
		Modal.front.style.minWidth = window.innerWidth * .5 + "px";
		Modal.front.style.maxWidth = window.innerWidth * .75 + "px";
		Modal.front.style.minHeight = window.innerHeight * .45 + "px";
		Modal.front.style.maxHeight = window.innerHeight * .85 + "px";
		Modal.front.style.display = "block";
		Modal.front.style.margin = "0 auto";
		Modal.front.style.textAlign = "center";
		Modal.front.style.overflow = "auto";
		Modal.front.style.backgroundColor = "snow";
		Modal.front.style.paddingTop = "1%";
		Modal.front.style.paddingBottom = "1%";
		Modal.front.style.paddingRight = "2.5%";
		Modal.front.style.paddingLeft = "2.5%";
		Modal.front.style.transition = "all ease .15s";
		Modal.front.style.wordWrap = "break-word";
		Modal.front.innerHTML = data;

		//Botón para cerrar la ventana modal
		Modal.close = document.createElement("b");
		Modal.close.classList.add("modalClose");
		Modal.close.style.position = "fixed";
		Modal.close.style.top = ".5rem";
		Modal.close.style.right = "1.25rem";
		Modal.close.style.fontSize = "1.85rem";
		Modal.close.style.cursor = "pointer";
		Modal.close.style.color = "#ffffff";
		Modal.close.style.userSelect = "none";
		Modal.close.style.transition = "all ease .2s";
		Modal.close.textContent = "X";
		Modal.close.title = "Cerrar esta ventana";

		//La URL de consulta
		if (url && url.length){
			//La cadena de consulta
			if (query && query.length){
				Modal.getContent(url, query);
			}
			else{
				Modal.getContent(url);
			}
		}

		Modal.callback = callback && {}.toString.call(callback) == "[object Function]" ? callback : false;

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
		if (newFront){
			Modal.back.insertAdjacentHTML("beforeend", newFront);			
		}
		else{
			Modal.back.appendChild(Modal.front);
		}

		//Se adhiere el fondo al documento
		document.body.appendChild(Modal.back);

		//Se retiran las barras de desplazamiento del documento
		document.body.style.overflow = "hidden";

		//Si el bloque frontal es personalizado, se redimensiona
		if (newFront) Modal.resize();

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
		//Se desvanecen el fondo y su contenido
		modal.style.opacity = 0;

		//Luego de 200 milésimas de segundo, se eliminan el fondo y su contenido, se devuelve al documento sus barras de desplazamiento y el valor del comodín vuelve a true
		setTimeout(_ => {
			if (modal.parentNode == document.body){
				document.body.removeChild(modal);
			}

			//Si ya no otras ventanas modales mostrándose, se restaura la barra de desplazamiento
			if (!document.querySelectorAll(".modalBack").length){
				document.body.style.overflowY = "auto";
			}			
		}, 200);
	},

	resize: _ => {
		Modal.back.style.width = window.innerWidth + "px";
		Modal.back.style.height = window.innerHeight + "px";
		Modal.back.style.top = (document.documentElement.scrollTop || document.body.scrollTop) + "px";
		
		let front = Modal.back.querySelector("b").nextElementSibling;
		
		front.style.minWidth = window.innerWidth * .5 + "px";
		front.style.maxWidth = window.innerWidth * .75 + "px";
		front.style.minHeight = window.innerHeight * .45 + "px";
		front.style.maxHeight = window.innerHeight * .85 + "px";		
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
