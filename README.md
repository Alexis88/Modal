# Modal.js
**VENTANAS MODALES PERSONALIZADAS**

Este *plugin* genera ventanas modales personalizadas. Algunas de sus características principales:

- Pueden mostrar contenido plano o multimedia, ya sea cargado de forma asíncrona o no.
- Se pueden mostrar varias ventanas a la vez sin que se generen conflictos entre ellas.
- Se pueden cerrar tanto al pulsar el botón de cerrado ubicado en la esquina superior derecha de la ventana o bien pulsando la tecla **ESC**.
- Se puede personalizar los colores del fondo y estilos de los bordes de la ventana, el color y grosor del texto y el color del botón de cerrado.
- Se adaptan a las dimensiones del dispositivo (*full responsive*).

# Datos admitidos:

```javascript
//Cadena de caracteres
Modal.show("Cadena de caracteres (puede incluir etiquetas HTML)");

//Objeto literal con opciones de configuración
Modal.show({
	text: Cualquier cadena de caracteres (puede incluir etiquetas HTML),
	url: Una cadena de caracteres con el nombre de la ruta a consultar (puede incluir la cadena de consulta),
	data: Una cadena de caracteres u objeto literal con los datos de la cadena de consulta,
	media: Valor lógico (true o false) que establece si se reemplazará la ventana por un contenido HTML,
	onShow: Función que se ejecutará luego de que se haya mostrado la ventana modal (trabajará con los argumentos del contenido y la ventana cuando se reciba una respuesta de tipo JSON o solo con la ventana modal si se reemplaza la ventana por un contenido multimedia [ver ejemplos]),
	onHide: Función que se ejecutará luego de que se haya ocultado la ventana modal,
	onError: Función que se ejecutará si ocurre un error durante la carga de contenido externo (el que devuelva la consulta mediante el atributo URL)
});
```

# Ejemplos de uso:

- Pasando un texto simple:

```javascript
Modal.show("¡Hola!");
```

- Pasando una etiqueta HTML como texto:
```javascript
Modal.show("<img src='images/newyork.png' />");
```

- Cargando un contenido externo con un GIF que se muestra como vista previa:

```javascript
Modal.show({
	text: "<img src='images/loading.gif' />",
	url: "contenido.php"
});
```

- Cargando un contenido externo con una cadena de consulta:

```javascript
//Mediante un objeto literal con los datos de la cadena de consulta
Modal.show({
	url: "alumnos.php",
	data: {
		idClase: 25,
		estado: "aprobado"
	}
});

//Adjuntando la cadena de consulta directamente en la ruta de destino
Modal.show({
	url: "alumnos.php?idClase=25&estado=aprobado"
});

//Adjuntando la cadena de consulta por fuera
Modal.show({
	url: "alumnos.php",
	data: "idClase=25&estado=aprobado"
});
```

- Ejecutando una llamada de retorno luego de la carga del contenido externo:

```javascript
Modal.show({
	url: "alumnos.php",
	onShow: ventanaModal => {
		ventanaModal.addEventListener("click", event => {
			if (event.classList.contains("notaAlumno")){
				Modal.show(`El alumno se encuentra <b>${event.target.textContent < 11 ? "Desaprobado" : "Aprobado"}</b>`);
			}
		}, false);
	}
});
```

- Ejecutando una llamada de retorno luego de ocultar la ventana modal:

```javascript
Modal.show({
	url: "alumnos.php",
	onHide: _ => {
		fetch("notasAlumnos.php")
			.then(response => response.text())
			.then(notas => {
				document.querySelector("#tablaAlumnos > tbody").innerHTML = notas;
			});
	}	
});
```

- Ejecutando una llamada de retorno cuando ocurre un error en la carga del contenido externo

```javascript
Modal.show({
	url: "alumnos.php",
	onError: error => {
		alert("Se ha producido un error"); //Vista para el usuario
		console.log(error); //Vista para el desarrollador
	}
});
```

- Reemplazando el cuadro central de la ventana modal por un elemento HTML

```javascript
//Carga directa
Modal.show({
	text: "<img src='images/logo.png' />",
	media: true
});

//Carga asíncrona
Modal.show({
	url: "imagen.php?id=5", //En caso devolviera un elemento <img> o <video>
	media: true
});
```

- Realizando acciones sobre el contenido de la ventana modal cuando se la reemplaza por un contenido multimedia:

```javascript
Modal.show({
	url: "imagen.php",
	onShow: ventanaModal => {
		ventanaModal.addEventListener("click", _ => console.log(`La ruta de la imagen es: ${ventanaModal.src}`), false);
	}
});
```

- Si se recibiera un contenido de tipo JSON de una consulta externa, se puede manipular el contenido recibido

```javascript
Modal.show({
	url: "personas.php",
	data: {
		id: 29
	},
	onShow: (contenido, ventanaModal) => {
		const
			nombre = contenido.name,
			apellidos = contenido.lastName,
			edad = contenido.age;

		ventanaModal.innerHTML = `
			<pre>
				<b>Nombre:</b> ${nombre}
				<b>Apellidos:</b> ${apellidos}
				<b>Edad:</b> ${edad}
			</pre>
		`;
	}
});

```

- Personalizando los colores del contenido:

```javascript
Modal.show({
	text: "¡Hola!",
	css: {
		//El cuadro central
		front: {
			backgroundColor: "#F8C7D9",
			border: "1px #A7C dotted",
			borderRadius: "1rem",
			fontWeight: "bolder",
			color: "#FA61C2"
		},

		//El botón de cerrado
		close: {
			color: "#A8D8F9"
		}
	}
});
```

- Ocultando el botón de cerrado

```javascript
Modal.show({
	text: "<img src='images/mountains.png' />",
	css: {
		//El botón de cerrado
		close: {
			display: "none"
		}
	}
});
```

- Ocultando todas las ventanas modales presentes (**ADVERTENCIA:** no se ejecutarán las llamadas de retorno asociadas):

```javascript
Modal.hideAll();
```

- Ocultando una ventana específica:

```javascript
const modal = Modal.show("¡Hola!");
Modal.hide(modal);
```
