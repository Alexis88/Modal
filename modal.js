"use strict";

let Modal = {
	show: (data) => {
		//El fondo
		Modal.back = document.createElement("div");
		Modal.back.classList.add("modalBack");
		Modal.back.style.width = window.innerWidth + "px";
		Modal.back.style.height = window.innerHeight + "px";
		Modal.back.style.backgroundColor = "#708090";
		Modal.back.style.top = 0;
		Modal.back.style.left = 0;
		Modal.back.style.margin = 0;
		Modal.back.style.position = "fixed";		
		Modal.back.style.display = "flex";
		Modal.back.style.alignItems = "center";
		Modal.back.style.justifyContent = "center";
		Modal.back.style.opacity = 0;
		Modal.back.style.zIndex = "9999";
		Modal.back.style.transition = "all ease .15s";		

		//Cuadro que mostrará el texto y/o imágenes
		Modal.front = document.createElement("div");
		Modal.front.style.minWidth = window.innerWidth * .35 + "px";
		Modal.front.style.maxWidth = window.innerWidth * .75 + "px";
		Modal.front.style.minHeight = window.innerHeight * .45 + "px";
		Modal.front.style.maxHeight = window.innerHeight * .85 + "px";
		Modal.front.style.display = "block";
		Modal.front.style.margin = "0 auto";
		Modal.front.style.textAlign = "center";
		Modal.front.style.backgroundColor = "snow";
		Modal.front.style.paddingTop = "1%";
		Modal.front.style.paddingBottom = "1%";
		Modal.front.style.paddingRight = "2.5%";
		Modal.front.style.paddingLeft = "2.5%";
		Modal.front.style.transition = "all ease .15s";
		Modal.front.style.overflow = "auto";
		Modal.front.style.wordWrap = "break-word";
		Modal.front.innerHTML = data;

		//Botón para cerrar la ventana modal
		Modal.close = document.createElement("b");
		Modal.close.classList.add("modalClose");
		Modal.close.style.position = "fixed";
		Modal.close.style.top = ".5rem";
		Modal.close.style.right = "1.25rem";
		Modal.close.style.fontSize = "1.25rem";
		Modal.close.style.cursor = "pointer";
		Modal.close.style.color = "#ffffff";
		Modal.close.style.userSelect = "none";
		Modal.close.style.transition = "all ease .2s";
		Modal.close.textContent = "X";
		Modal.close.title = "Cerrar esta ventana";
		Modal.close.addEventListener("mouseover", _ => Modal.close.style.transform = "scale(1.2)", false);
		Modal.close.addEventListener("mouseout", _ => Modal.close.style.transform = "scale(1)", false);

		//Se adhiere el botón para cerrar la ventana modal
		Modal.back.appendChild(Modal.close);

		//Se adhiere el cuadro al fondo
		Modal.back.appendChild(Modal.front);

		//Se adhiere el fondo al documento
		document.body.appendChild(Modal.back);

		//Se da visibilidad al fondo y cuadro
		setTimeout(() => {
			Modal.back.style.opacity = .975;
		}, 100);

		//Se retiran las barras de desplazamiento del documento
		document.body.style.overflow = "hidden";

		//Se cierra la ventana modal al pulsar el fondo oscuro o la X
		document.addEventListener("click", (e) => {
			let elem = e.target, modal;

			//Si se pulsa en el fondo
			if (elem.classList.contains("modalBack")){
				Modal.hide(elem);
			}

			if (elem.classList.contains("modalClose")){
				Modal.hide(elem.parentNode);
			}

			e.stopImmediatePropagation();
		}, false);

		//Al girar el dispositivo, cambian las dimensiones del fondo
		window.addEventListener("orientationchange", Modal.resize, false);
		window.addEventListener("resize", Modal.resize, false);
	},

	hide: (modal) => {
		//Se desvanecen el fondo y su contenido
		modal.style.opacity = 0;

		//Luego de 200 milésimas de segundo, se eliminan el fondo y su contenido, se devuelve al documento sus barras de desplazamiento y el valor del comodín vuelve a true
		setTimeout(() => {
			document.body.removeChild(modal);

			//Si ya no otras ventanas modales mostrándose, se restaura la barra de desplazamiento
			if (!document.querySelectorAll(".modalBack")){
				document.body.style.overflow = "auto";
			}			
		}, 200);
	},

	resize: () => {
		Modal.back.style.width = window.innerWidth + "px";
		Modal.back.style.height = window.innerHeight + "px";
		Modal.front.style.minWidth = window.innerWidth * .35 + "px";
		Modal.front.style.maxWidth = window.innerWidth * .75 + "px";
		Modal.front.style.minHeight = window.innerHeight * .45 + "px";
		Modal.front.style.maxHeight = window.innerHeight * .85 + "px";
		Modal.back.style.top = 0;
	}
};
