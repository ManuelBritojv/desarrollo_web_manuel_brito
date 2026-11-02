const seccion = document.getElementById("comentarios");
const URL_COMENTARIOS = `/api/comentarios/${seccion.dataset.avistamientoId}`;

const agregarComentario = document.getElementById("agregar-comentario");
const formulario = document.getElementById("form-comentario");
const errorNombre = document.getElementById("error-nombre");
const errorTexto = document.getElementById("error-texto");

const botonEnviar = document.getElementById("enviar-comentario");
const mensajes = document.getElementById("mensajes-comentario");
const lista = document.getElementById("lista-comentarios");
const sinComentarios = document.getElementById("sin-comentarios");

agregarComentario.addEventListener("click", () =>{
    formulario.hidden = false;
    agregarComentario.hidden = true;
});

// Muestra los mensajes de error.
function mostrarMensajes(textos, categoria){
    mensajes.replaceChildren();  // Borramos mensajes anteriores.
    textos.forEach(texto =>{
        const li = document.createElement("li");
        li.className = categoria;
        li.textContent = texto;
        mensajes.appendChild(li);
    });
}

function validarFormulario(){
    const nombre = document.getElementById("nombre").value.trim();
    const texto = document.getElementById("texto").value.trim();
    let esValido = true;

    if (nombre.length < 3 || nombre.length > 50){
        errorNombre.classList.add("visible");
        esValido = false;
    } else {
        errorNombre.classList.remove("visible");
    }

    if (texto.length < 5 || texto.length > 300){
        errorTexto.classList.add("visible");
        esValido = false;
    } else {
        errorTexto.classList.remove("visible");
    }
    return esValido;
}


function mostrarComentarios(comentarios){
    lista.replaceChildren();  // Borramos lista de comentarios anteriores.
    sinComentarios.hidden = comentarios.length > 0; // Si tenemos comentarios mostramos, si no, no mostramos.

    comentarios.forEach(c => {
        const li = document.createElement("li");
        li.className = "comentario-unico";
        const autor = document.createElement("strong");
        autor.textContent = `${c.nombre} (${c.fecha})`;
        li.append(autor, `: ${c.texto}`);
        lista.appendChild(li);
    });
}

async function cargarComentarios(){
    try {
        const respuesta = await fetch(URL_COMENTARIOS);
        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status} al pedir los comentarios`);
        }
        mostrarComentarios(await respuesta.json());
    } catch (error) {
        console.error(error);
        mostrarMensajes(["No se pudieron cargar los comentarios."], "flash_error");
    }
}

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();
    mensajes.replaceChildren(); // Borramos mensajes anteriores.

    if (!validarFormulario()){
        return; // Hay errores en el navegador no se envía nada
    }

    botonEnviar.disabled = true; // Asi evito multiples clicks al boton.
    try {
        const respuesta = await fetch(URL_COMENTARIOS,{
            method: "POST",
            body: new FormData(formulario)
        });
        const datos = await respuesta.json();

        if (!respuesta.ok){
            mostrarMensajes(datos.errores || ["No se pudo guardar el comentario."], "flash_error");
            return; 
        }

        formulario.reset();
        formulario.hidden = true;
        agregarComentario.hidden = false;
        mostrarMensajes(["¡Comentario publicado con éxito!"], "flash_exito");
        await cargarComentarios();
    } catch (error){
        mostrarMensajes(["Ocurrió un error inesperado. Intente nuevamente."], "flash_error");
    } finally{
        // Siempre ejecutamos.
        botonEnviar.disabled = false; // Volvemos a activar el boton.
    }
});

cargarComentarios();