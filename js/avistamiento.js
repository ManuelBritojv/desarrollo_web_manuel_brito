/*Misma logica que en registro.js*/
import { comunasPorRegion } from "./comunas.js";

const region = document.getElementById("region");
const comuna = document.getElementById("comuna");

region.addEventListener("change", function(){ // Logica del sistema Región-Comuna
    const regionSeleccionada = this.value;
    comuna.innerHTML = '<option value="">Seleccione una comuna...</option>';
    if(regionSeleccionada !== ""){  // Si seleccionamos una región
        comuna.disabled = false; // Ahora podemos interactuar con el select de comunas
        const comunas = comunasPorRegion[regionSeleccionada];
        for(let i = 0; i < comunas.length; i++){
            const opcion = document.createElement("option");
            opcion.value = comunas[i].toLowerCase().replaceAll(" ", "-");
            opcion.textContent = comunas[i];
            comuna.appendChild(opcion);
        }
    }else{
        comuna.disabled = true;
        comuna.innerHTML = '<option value="">Primero seleccione una región...</option>';
    }
});


const form = document.getElementById("form-avistamiento");

form.addEventListener("submit", (event)=>{
    event.preventDefault();
    let esValido = true;

    const exito = document.getElementById("exito");

    const correo = document.getElementById("email-observador").value;
    const errorCorreo = document.getElementById("error-email");

    const fechaHora = document.getElementById("fecha").value;
    const errorFecha = document.getElementById("error-fecha");

    const tipoAve = document.getElementById("tipo-ave").value;
    const errorTipo = document.getElementById("error-tipo");

    const nombreEspecie = document.getElementById("nombre-ave").value;
    const errorNombreEspecie = document.getElementById("error-nombre-ave");

    const region = document.getElementById("region").value;
    const errorRegion = document.getElementById("error-region");

    const comuna = document.getElementById("comuna").value;
    const errorComuna = document.getElementById("error-comuna");

    const registro = document.getElementById("evidencia");
    const errorRegistro = document.getElementById("error-evidencia");

    // Si ya teniamos un mensaje de exito lo quitamos.
    if (exito.classList.contains("visible")){
        exito.classList.remove("visible");
    }
    
    // Validaciones del email.
    if(correo.trim() === "" || !correo.trim().includes("@")){
        errorCorreo.classList.add("visible");
        esValido = false;
    }else{
        errorCorreo.classList.remove("visible");
    }

    // Validaciones de la fecha y hora
    if(fechaHora === ""){
        errorFecha.textContent = "Debe seleccionar una fecha y hora";
        errorFecha.classList.add("visible");
        esValido = false
    } else{
        // Convertimos el string a un objeto Date
        const fechaSeleccionada = new Date(fechaHora);

        // Objeto Date con la fecha y hora del momento
        const fechaActual = new Date();

        // Objeto con la fecha minima permitida (3 años en mi caso)
        const fechaMinima = new Date();
        fechaMinima.setFullYear(fechaActual.getFullYear() - 3);

        if (fechaSeleccionada > fechaActual){
            errorFecha.textContent = "No puedes registrar un avistamiento en el futuro."
            errorFecha.classList.add("visible");
            esValido = false;
        }
        else if(fechaSeleccionada < fechaMinima){
            errorFecha.textContent = "El registro es demasiado antiguo (máximo 3 años).";
            errorFecha.classList.add("visible");
            esValido = false;
        }
        else{
            errorFecha.classList.remove("visible");
        }

    }

    // Validacion de tipo de ave
    if(tipoAve === ""){
        errorTipo.classList.add("visible");
        esValido = false
    }else{
        errorTipo.classList.remove("visible");
    }

    // Validacion del nombre de la especie
    if (nombreEspecie.trim() === ""){
        errorNombreEspecie.classList.add("visible");
        esValido = false;
    }else{
        errorNombreEspecie.classList.remove("visible");
    }

    // Validacion de las regiones y comunas.
    if(region === ""){
        errorRegion.classList.add("visible");
        esValido = false;
    }else{
        errorRegion.classList.remove("visible");
    }
    if(comuna === ""){
        errorComuna.classList.add("visible");
        esValido = false;
    }else{
        errorComuna.classList.remove("visible");
    }
    
    // Validacion de registro fotografico o video
    if(registro.files.length === 0){
        // El usuario no subio ningun archivo
        errorRegistro.textContent = "¡Es obligatorio subir una foto o vídeo del avistamiento!";
        errorRegistro.classList.add("visible");
        esValido = false;
    }else{
        // Si subio un archivo, veo que es.
        const archivo = registro.files[0]
        const tipoArchivo = archivo.type;
        
        if(!tipoArchivo.startsWith("image/") && !tipoArchivo.startsWith("video/")){
            errorRegistro.textContent = "El archivo debe ser estrictamente una fotografía o un vídeo.";
            errorRegistro.classList.add("visible");
            esValido = false;
        }else{
            errorRegistro.classList.remove("visible");
        }
    }
    
    // Si paso todas las validaciones muestro un mensaje.
    if (esValido){
        exito.classList.add("visible");
        form.reset();
        // Vuelvo a desactivar el campo de comunas.
        const selectComuna = document.getElementById("comuna");
        selectComuna.disabled = true;
        selectComuna.innerHTML = '<option value="">Primero seleccione una región...</option>';
    }

});