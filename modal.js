/**
 * VENTANA MODAL PERSONALIZADA
 * 
 * Plugin que genera una ventana modal personalizada
 * 
 * MODO DE USO:
 * 
 * Modal.show("Texto de ejemplo");
 * Modal.show({
 *		text: "Texto de ejemplo",
 * 		url: "ejemplo.php",
 * 		data: "foo=bar&bin=baz" o {foo: "bar", bin: "baz"},
 * 		onShow: _ => {
 * 			//Esto se ejecutará luego de haber cargado la ventana modal
 * 		},
 * 		onHide: _ => {
 * 			//Esto se ejecutará luego de haberse cerrado la ventana modal
 * 		},
 *		onError: _ => {
 * 			//Esto se ejecutará cuando ocurra un error en la carga de un contenido externo
 * 		},
 * 		css: {
 * 			front: `
 * 				background-color: #A3F7C9;
 * 				color: #92B8F8;
 * 				font-weight: bold;
 * 				border: 1px #A991FF dotted;
 * 				border-radius: 1rem;
 * 			`,
 * 			close: `
 * 				color: #000;
 * 			`
 * 		}
 * });
 * 
 * @param		{options}				Object/String
 * @author		Alexis López Espinoza
 * @version		1.0
 * @date 		2023-06-04
 */

"use strict";

const Modal = {
	/**
	 * options.text: Texto a mostrar
	 * options.url: URL a consultar para obtener el contenido a mostrar
	 * options.data: Datos a adjuntar a la URL a consultar
	 * onShow: Llamada de retorno a ejecutarse luego de mostrarse la ventana modal
	 * onHide: Llamada de retorno a ejecutarse luego de cerrarse la ventana modal
	 * onError: Llamada de retorno a ejecutarse luego de producirse un error al ejecutar la consulta a la URL
	 * css: {
	 * 		front: {Estilos CSS para el contenido central},
	 * 		close: {Estilos CSS para el botón de cerrado}
	 * }
	 */
	show(options){
		if (!options || !["[object String]", "[object Object]"].includes(Modal.type(options))){
			throw new Error("Tiene que establecer un contenido para la ventana modal");
		}

		Modal.id = `modalID-${new Date().getTime()}`;

		if (Modal.type(options) == "[object String]"){
			Modal.text = options;			
		}
		else{
			Modal.text = options.text;
			Modal.url = options.url || false;
			Modal.data = options.data || false;
			Modal.onShow = options.onShow && Modal.isFunction(options.onShow) ? options.onShow : null;
			Modal.onHide = options.onHide && Modal.isFunction(options.onHide) ? options.onHide : null;
			Modal.onError = options.onError && Modal.isFunction(options.onError) ? options.onError : null;
			Modal.css = options.css || null;
		}

		Modal.queue = Modal.queue || [];
		Modal.createModal();
		Modal.getContent();
		const cloneConfig = {...Modal};
		Modal.queue.push(cloneConfig);
		Modal.events(cloneConfig);
	},

	type(elem){
		return {}.toString.call(elem);
	},

	isFunction(fn){
		return Modal.type(fn) === "[object Function]";
	},

	events(config){
		config.close.addEventListener("click", _ => Modal.hide(config), false);
		config.close.addEventListener("mouseover", _ => {
			config.close.style.transition = "ease .4s";
			config.close.style.cursor = "pointer";
			config.close.style.transform = "scale(1.1)";
		}, false);
		config.close.addEventListener("mouseout", _ => {
			config.close.style.transition = "none";
			config.close.style.cursor = "auto";
			config.close.style.transform = "scale(1)";
		}, false);
		window.addEventListener("keyup", e => {
			if (e.which == 27 && Modal.queue.length){
				Modal.hide(Modal.queue[Modal.queue.length - 1]);
				e.stopImmediatePropagation();
			}
		}, false);
		window.addEventListener("resize", Modal.resize, false);
		window.addEventListener("orientationchange", Modal.resize, false);
	},

	createModal(){
		const 
			back = document.createElement("div"),
			front = document.createElement("div"),
			close = document.createElement("span"),
			width = window.innerWidth,
			height = window.innerHeight;

		back.style = `
			position: absolute;
			background-color: rgba(0, 0, 0, .6);
			display: flex;
			align-items: center;
			width: ${window.innerWidth}px;
			height: ${window.innerHeight}px;
			top: 0;
			left: 0;
			justify-content: center;
			z-index: 8888;
			transition: all ease .4s;
		`;
		back.animate([
			{opacity: 0},
			{opacity: .6}
		], {duration: 400});

		front.style = `
			position: fixed;
			min-width: ${width * (width < 850 ? .4 : .5)}px;
			max-width: ${width * (width < 850 ? .8 : .7)}px;
			min-height: ${height * (height < 850 ? .5 : .65)}px;
			max-height: ${height * (height < 850 ? .75 : .85)}px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			padding: 1% 2.5%;
			box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
			word-wrap: break-word;
			overflow: auto;
			z-index: 9999;
			transition: all ease .4s;
			background-color: ${Modal.css?.front?.backgroundColor ?? "#FFFFEF"};
			border: ${Modal.css?.front?.border ?? "1px grey solid"};
			border-radius: ${Modal.css?.front?.borderRadius ?? 0};
			text-align: ${Modal.css?.front?.textAlign ?? "#000"};
			font-weight: ${Modal.css?.front?.fontWeight ?? "normal"};
		`;
		front.animate([
			{transform: "scaleY(0)"},
			{transform: "scaleY(1)"}
		], {duration: 400});
		
		if (Modal.text){
			if (Modal.type(Modal.text) === "[object String]"){
				front.innerHTML = Modal.text;
			}
			else{
				front.append(Modal.text);
			}
		}
		else{
			Modal.getContent(Modal);
		}

		close.style = `
			position: fixed;
			user-select: none;
			opacity: 0;
			z-index: 9999;
			color: ${Modal.css?.close?.color ?? "#000"};
		`;
		close.textContent = "❌";
		close.title = "Cerrar esta ventana";

		Modal.back = back;
		Modal.front = front;
		Modal.close = close;	

		back.append(front, close);
		document.body.append(back);

		setTimeout(_ => {
			Modal.onShow && Modal.onShow();
			Modal.resize();
		}, 400);
	},

	getContent(){
		if (Modal.url){
			let url = Modal.url, data;

			if (Modal.data){
				switch (Modal.type(Modal.data)){
					case "[object String]":
						url += `?${Modal.data}`;
						break;

					case "[object Object]":
						data = [];
						for (const key in Modal.data){
							data.push(`${key}=${Modal.data[key]}`);
						}
						url += `?${data.join("&")}`;
						break;
				}
			}

			fetch(url)
				.then(response => response.text())
				.then(content => Modal.front.innerHTML = content)
				.catch(error => Modal.onError(error));
		}
	},

	resize(){
		Modal.queue.forEach(config => {
			const
				back = config.back,
				front = config.front,
				close = config.close,
				scroll = document.documentElement.scrollTop || document.body.scrollTop,
				width = window.innerWidth,
				height = window.innerHeight;

			let isScrollVisible;

			back.style.top = `${scroll}px`;
			back.style.width = `${width}px`;
			back.style.height = `${height}px`;

			front.style.minWidth = `${width * (width < 850 ? .4 : .5)}px`;
			front.style.maxWidth = `${width * (width < 850 ? .8 : .7)}px`;
			front.style.minHeight = `${height * (height < 850 ? .5 : .65)}px`;
			front.style.maxHeight = `${height * (height < 850 ? .75 : .85)}px`;

			close.style.opacity = 0;

			setTimeout(_ => {
				console.log(config.id)
				isScrollVisible = front.scrollHeight > front.clientHeight;
				close.style.top = `${front.getBoundingClientRect().top + 4}px`;
				close.style.left = `${front.getBoundingClientRect().right - (close.offsetWidth * (isScrollVisible ? 2 : 1.5))}px`;
				close.style.opacity = 1;
			}, 400);
		});
	},

	hide(config){
		const 
			back = config.back,
			front = config.front,
			index = Modal.queue.findIndex(modalConfig => modalConfig.id == config.id);

		back.animate([
			{opacity: .6},
			{opacity: 1}
		], {duration: 400, fill: "forwards"});

		front.animate([
			{transform: "scaleY(1)"},
			{transform: "scaleY(0)"}
		], {duration: 400, fill: "forwards"});

		setTimeout(_ => {
			back.remove();
			front.remove();
			config.onHide && config.onHide();
			Modal.queue.splice(index, 1);

			if (!Modal.queue.length){
				document.body.style.overflow = "auto";
			}
			else{
				Modal.resize();
			}
		}, 400);
	}
};
