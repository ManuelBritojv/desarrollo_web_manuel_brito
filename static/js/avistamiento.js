/*Misma logica que en registro.js*/

const region = document.getElementById("region");
const comuna = document.getElementById("comuna");

region.addEventListener("change", function(){ // Logica del sistema Región-Comuna (Ahora con BD)
    const regionIdSeleccionada = this.value;
    comuna.value = ""
    const opcionesComuna = comuna.querySelectorAll('option:not([value=""])') // Todos los hijos tal que la opcion no sea ""
    const opcionDefault = comuna.querySelector('option[value=""]') // la opcion <option value="">Primero seleccione una región...</option>
    if (regionIdSeleccionada !== ""){ // Si hay alguna region seleccionada
        comuna.disabled = false;
        opcionDefault.textContent = 'Seleccione una comuna...' // Cambiamos el texto
        for(let i = 0; i < opcionesComuna.length; i++){
            let opcion = opcionesComuna[i]
            // dataset permite acceder a etiquetas pers. estilo data-xxx
            // Si encontramos la region que necesitamos.
            if(opcion.dataset.region == regionIdSeleccionada){
                opcion.style.display = 'block' // Las mostramos
            }else{
                opcion.style.display = 'none' // No las mostramos
            }
        }
    } else{ // Si no tenemos una region seleccionada.
        comuna.disabled = true;
        opcionDefault.textContent = 'Primero seleccione una región...' // Cambiamos el texto
        for(let i = 0; i < opcionesComuna.length; i++){
            opcionesComuna[i].style.display = 'none' // No las mostramos
        }
    }
});

/**
 * Verifica que si un ave ingresada por el usuario en tipo de ave exista en la BD.
 * @param {*} nombreAve Nombre de la ave a ver si es válida
 * @returns Boolean
 */
function esAveValida(nombreAve) {
    const datalist = document.getElementById("lista-aves");
    const opciones = datalist.querySelectorAll("option");
    const nombreLimpio = nombreAve.trim().toLowerCase();

    // Recorremos las opciones del datalist para verificar si coincide exactamente
    for (let i = 0; i < opciones.length; i++) {
        if (opciones[i].value.trim().toLowerCase() === nombreLimpio) {
            return true; // Encontramos el ave en la BD
        }
    }
    return false; // No existe o escribió un ave inválida
}



const form = document.getElementById("form-avistamiento");

// Actualización de lógica.
form.addEventListener("submit", (event)=>{
    let esValido = true;

    const idVoluntario = document.getElementById("id-voluntario").value;
    const errorIdVoluntario = document.getElementById("error-id-voluntario");

    const fechaHora = document.getElementById("fecha").value;
    const errorFecha = document.getElementById("error-fecha");

    const tipoAve = document.getElementById("tipo-ave").value;
    const errorTipo = document.getElementById("error-tipo");

    const regionValor = document.getElementById("region").value;
    const errorRegion = document.getElementById("error-region");

    const comunaValor = document.getElementById("comuna").value;
    const errorComuna = document.getElementById("error-comuna");

    const registro = document.getElementById("evidencia");
    const errorRegistro = document.getElementById("error-evidencia");

    const desc = document.getElementById("descripcion").value;
    const errorDesc = document.getElementById("error-descripcion");

    const lugar = document.getElementById("lugar").value;
    const errorLugar = document.getElementById("error-lugar");
    
    // Validacion del id del voluntario
    if((idVoluntario.trim() === "" || isNaN(idVoluntario))){
        errorIdVoluntario.classList.add("visible");
        esValido = false;
    }else{
        errorIdVoluntario.classList.remove("visible");
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
    if(tipoAve === "" || !esAveValida(tipoAve)){
        errorTipo.classList.add("visible");
        esValido = false
    }else{
        errorTipo.classList.remove("visible");
    }

    // Validacion de la desc
    if(desc.length > 500){
        errorDesc.classList.add("visible");
        esValido = false;
    }else{
        errorDesc.classList.remove("visible");
    }

    // Validacion de las regiones y comunas.
    if(regionValor === ""){
        errorRegion.classList.add("visible");
        esValido = false;
    }else{
        errorRegion.classList.remove("visible");
    }
    if(comunaValor === ""){
        errorComuna.classList.add("visible");
        esValido = false;
    }else{
        errorComuna.classList.remove("visible");
    }

    // Validacion del lugar
    if(lugar.length > 120){
        errorLugar.classList.add("visible");
        esValido = false;
    }else{
        errorLugar.classList.remove("visible");
    }

    // Validacion de registro fotografico o video (Múltiples archivos)
    if(registro.files.length === 0){
        // El usuario no subió ningún archivo
        errorRegistro.textContent = "Es obligatorio subir al menos una foto o vídeo del avistamiento";
        errorRegistro.classList.add("visible");
        esValido = false;
    } else {
        let archivosValidos = true;
        // Recorremos todos los archivos seleccionados
        for(let i = 0; i < registro.files.length; i++){
            const archivo = registro.files[i];
            const tipoArchivo = archivo.type;
            // Verificamos si alguno NO es imagen ni video
            if(!tipoArchivo.startsWith("image/") && !tipoArchivo.startsWith("video/")){
                archivosValidos = false;
                break; 
            }
        }
        if(!archivosValidos){
            errorRegistro.textContent = "Todos los archivos seleccionados deben ser estrictamente fotografías o vídeos.";
            errorRegistro.classList.add("visible");
            esValido = false;
        } else {
            errorRegistro.classList.remove("visible");
        }
    }
    
    if (!esValido) {
        // NOTA: Si quieren ver las validaciones de Flask comenten la linea de abajo.
        event.preventDefault(); // solo bloqueamos el envío si hay errores
    }

});

// Lanzamos un evento, como si hubieramos hecho un change en la region (Para poder mantener la comuna)
if (region.value !== "") {
    region.dispatchEvent(new Event("change"));  // habilita la comuna y filtra las opciones
    comuna.value = comuna.dataset.seleccionada;
}