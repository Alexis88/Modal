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
 * 		media: true,
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
 * 			front: {
 * 				backgroundColor: "#A3F7C9",
 * 				color: "#92B8F8",
 * 				fontWeight: "bold",
 * 				border: "1px #A991FF dotted",
 * 				borderRadius: "1rem"
 * 			},
 * 			close: {
 * 				color: "#000";
 * 			}
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
	 * options.media: Especifica si de la URL a consultar se obtendrá un recurso multimedia
	 * options.onShow: Llamada de retorno a ejecutarse luego de mostrarse la ventana modal
	 * options-onHide: Llamada de retorno a ejecutarse luego de cerrarse la ventana modal
	 * options.onError: Llamada de retorno a ejecutarse luego de producirse un error al ejecutar la consulta a la URL
	 * options.css: {
	 * 		front: {Estilos CSS para el contenido central},
	 * 		close: {Estilos CSS para el botón de cerrado}
	 * }
	 */
	show(options){
		if (!options || !["[object String]", "[object Object]"].includes(Modal.type(options))){
			throw new Error("Tiene que establecer un contenido para la ventana modal");
		}

		Modal.options = {};
		Modal.options.id = `modalID-${new Date().getTime()}`;		

		if (Modal.type(options, "string")){
			Modal.options.text = options;			
		}
		else{
			Modal.options.text = options.text || "";
			Modal.options.url = options.url || false;
			Modal.options.data = options.data || false;
			Modal.options.media = options.media || false;
			Modal.options.onShow = options.onShow && Modal.type(options.onShow, "function") ? options.onShow : null;
			Modal.options.onHide = options.onHide && Modal.type(options.onHide, "function") ? options.onHide : null;
			Modal.options.onError = options.onError && Modal.type(options.onError, "function") ? options.onError : null;
			Modal.options.css = options.css || null;
		}

		Modal.queue ??= [];
		Modal.createModal();
	},

	type(elem, type){
		if (type){
			return {}.toString.call(elem).toLowerCase() === `[object ${type}]`.toLowerCase();
		}
		return {}.toString.call(elem);
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
			e.which == 27 && Modal.queue.length && Modal.hide();
			e.stopImmediatePropagation();
		}, false);
		window.addEventListener("resize", Modal.resize, false);
		window.addEventListener("orientationchange", Modal.resize, false);
		window.addEventListener("scroll", _ => {
			const modals = document.querySelectorAll("[id^=modalBack]");
			
			if (modals.length){
				modals[modals.length - 1].scrollIntoView();
			}
		}, false);
	},

	createModal(){
		Modal.options.back = Modal.createBack();
		Modal.options.front = Modal.createFront();
		Modal.options.close = Modal.createClose();

		const cloneConfig = {...Modal.options};
		delete cloneConfig.queue;		
		Modal.queue.push(cloneConfig);

		Modal.addContent(cloneConfig, (response, front) => {
			cloneConfig.back.append(cloneConfig.front, cloneConfig.close);
			document.body.append(cloneConfig.back);
			Modal.events(cloneConfig);			

			setTimeout(_ => {
				if (cloneConfig.onShow){
					if (response && front){
						cloneConfig.onShow(response, front);
					}
					else if (!response && front){
						cloneConfig.onShow(front);	
					}
					else if (response && !front){
						cloneConfig.onShow(response);	
					}
					else{
						cloneConfig.onShow();
					}
				}
				
				Modal.resize();
			}, 400);
		});		
	},

	createBack(){
		const 
			back = document.createElement("div"),
			scroll = document.documentElement.scrollTop || document.body.scrollTop,
			width = window.innerWidth,
			height = window.innerHeight;

		back.id = `modalBack-${Modal.options.id.substring(Modal.options.id.indexOf("-") + 1)}`;
		back.style = `
			position: absolute;
			background-color: rgba(0, 0, 0, .6);
			display: flex;
			align-items: center;
			width: ${width}px;
			height: ${height}px;
			top: ${scroll}px;
			left: 0;
			justify-content: center;
			z-index: 8888;
			transition: all ease .4s;
		`;

		back.animate([
			{opacity: 0},
			{opacity: .6}
		], {duration: 400});

		return back;
	},

	createFront(){
		const
			front = document.createElement("div"),
			width = window.innerWidth,
			height = window.innerHeight;

		front.id = `modalFront-${Modal.options.id.substring(Modal.options.id.indexOf("-") + 1)}`;
		front.style = `
			min-width: ${width * (width < 850 ? .4 : .5)}px;
			max-width: ${width * (width < 850 ? .8 : .7)}px;
			min-height: ${height * (height < 850 ? .5 : .65)}px;
			max-height: ${height * (height < 850 ? .75 : .85)}px;
			display: flex;
			align-items: center;
			flex-direction: column;
			overflow: auto;
			text-align: center;
			padding: .5% 2.5%;
			box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
			word-wrap: break-word;
			z-index: 9999;
			transition: all ease .4s;
			scrollbar-width: 12.5px;
			scrollbar-color: #C0C0C0 #696969;
			background-color: ${Modal.options?.css?.front?.backgroundColor?.length ? Modal.options.css.front.backgroundColor : "#FFFFEF"};
			border: ${Modal.options?.css?.front?.border?.length ? Modal.options.css.front.border : "1px grey solid"};
			border-radius: ${Modal.options?.css?.front?.borderRadius?.length ? Modal.options.css.front.borderRadius : 0};
			text-align: ${Modal.options?.css?.front?.textAlign?.length ? Modal.options.css.front.textAlign : "center"};
			font-weight: ${Modal.options?.css?.front?.fontWeight?.length ? Modal.options.css.front.fontWeight : "normal"};
		`;

		front.animate([
			{transform: "scaleY(0)"},
			{transform: "scaleY(1)"}
		], {duration: 400});

		return front;
	},

	createClose(){
		const close = document.createElement("span");

		close.style = `
			position: fixed;
			user-select: none;
			opacity: 0;
			z-index: 9999;
			color: ${Modal.options?.css?.close?.color?.length ? Modal.options.css.close.color : "#000"};
		`;
		close.textContent = "❌";
		close.title = "Cerrar esta ventana";

		return close;
	},

	addContent(config, callback){
		if (config.text){
			if (Modal.type(config.text, "string")){
				if (config.media){
					config.front.style.opacity = 0;
					config.front = new DOMParser().parseFromString(config.text, "text/html").documentElement.childNodes[1].childNodes[0];
					setTimeout(_ => config.front.style.opacity = 1, 400);
				}
				else{
					config.front.innerHTML = config.text.replaceAll("\n", "<br />");
				}
			}
			else{
				if (config.media){
					config.front.style.opacity = 0;
					config.front = config.text;
					setTimeout(_ => config.front.style.opacity = 1, 400);
				}
				else{
					config.front.append(config.text);
				}
			}
		}
		
		if (config.url){
			Modal.getContent(config, callback);
		}
		else{
			callback();
		}
	},

	getContent(config, callback){
		let url = config.url, data, dataType;

		if (config.data){
			switch (Modal.type(config.data)){
				case "[object String]":
					url += `?${config.data}`;
					break;

				case "[object Object]":
					data = [];
					for (const key in config.data){
						data.push(`${key}=${config.data[key]}`);
					}
					url += `?${data.join("&")}`;
					break;
			}
		}

		fetch(url)
			.then(response => {
				if (response.ok){
					const headers = response.headers.get("content-type");

					if (headers.includes("application/json")){
						dataType = "json";
						return response.json();	
					}
					else{
						dataType = "text";
						return response.text();
					}
				}
				else{
					config.onError(response.status);
				}
			})
			.then(content => {
				if (dataType == "json"){
					callback(content, config.front);
				}
				else{
					if (config.media){
						config.front.style.opacity = 0;
						config.front = new DOMParser().parseFromString(content, "text/html").documentElement.childNodes[1].childNodes[0];
						setTimeout(_ => config.front.style.opacity = 1, 400);
					}
					else{
						config.front.innerHTML = content;
					}

					callback(config.front);
				}
			})
			.catch(error => config.onError(error));
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

			front.style.minWidth = `${config.media ? width * .25 : width * (width < 850 ? .4 : .5)}px`;
			front.style.maxWidth = `${config.media ? width * .75 : width * (width < 850 ? .8 : .7)}px`;
			front.style.minHeight = `${config.media ? height * .3 : height * (height < 850 ? .5 : .65)}px`;
			front.style.maxHeight = `${config.media ? height * .85 : height * (height < 850 ? .75 : .85)}px`;

			close.style.opacity = 0;

			setTimeout(_ => {
				isScrollVisible = front.scrollHeight > front.clientHeight;
				close.style.top = `${front.getBoundingClientRect().top + 10}px`;
				close.style.left = `${front.getBoundingClientRect().right - (close.offsetWidth * (isScrollVisible ? 2.1 : 1.8))}px`;
				close.style.opacity = 1;
			}, 400);
		});
	},

	hide(config){
		var queue, index, back, front;

		//Cuando se oculta la ventana modal pulsando la tecla ESC
		if (!config){
			queue = [...Modal.queue];
			index = queue.length - 1;
			config = queue[index];
			back = config.back,
			front = config.front;
		}
		//Cuando se oculta la ventana modal pulsando el botón de cerrado
		else{
			back = config.back;
			front = config.front;
			index = Modal.queue.findIndex(obj => obj.id == config.id);
		}

		back.animate([
			{opacity: .6},
			{opacity: 0}
		], {duration: 400, fill: "forwards"});

		front.animate([
			{transform: "scaleY(1)"},
			{transform: "scaleY(0)"}
		], {duration: 400, fill: "forwards"});

		Modal.queue.splice(index, 1);

		setTimeout(_ => {
			back.remove();
			front.remove();
			config.onHide && config.onHide();
			Modal.queue.length && Modal.resize();
		}, 400);
	},

	hideAll(){
		[...document.querySelectorAll("[id^=modalBack-]")].forEach(back => {
			const front = back.querySelector("[id^=modalFront-]");

			back.animate([
				{opacity: .6},
				{opacity: 0}
			], {duration: 400, fill: "forwards"});

			front.animate([
				{transform: "scaleY(1)"},
				{transform: "scaleY(0)"}
			], {duration: 400, fill: "forwards"});

			setTimeout(_ => {
				back.remove();
				front.remove();
			}, 400);
		});
		
		Modal.queue = [];
	}
};