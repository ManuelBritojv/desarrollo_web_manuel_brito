
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

// Validaciones del formulario
// Funciones auxiliares.

function esNombreValido(nombre){
    const permitidos = new Set("abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZáéíóúÁÉÍÓÚüÜ "); 
    // Uso un set para tener un algoritmo O(1) en cada iteracion del ciclo for, hashMap.
    for(let i = 0; i < nombre.length; i++){
        if (!permitidos.has(nombre[i])){ // Si encontramos un caracter no permitido.
            return false;
        }
    }
    return true; // Con eso esta funcion trabaja en O(n).
}

function esNumeroValido(numero){
    numero = numero.replaceAll(" ", "");
    const permitidos = new Set("0123456789");
    if (numero.length < 9 || numero.length > 12){ // Un numero de telefono en chile con menos de 9 numeros es invalido
        return false;
    }
    let InicioNecesario = 0; // Asumimos que empieza sin +
    if (numero[0] === "+"){ // Si el usuario escribio el prefijo +
        if (numero[1] === "5" && numero[2] === "6"){ // Debe de colocar tambien 56 para el numero chileno.
            InicioNecesario = 3; // Empezamos a contar desde el 3 indice
        }
        else{
            return false;
        }
    }
    for(let i = InicioNecesario; i < numero.length; i++){ // Iteramos cada numero 
        if (!permitidos.has(numero[i])){ // Si el caracter no es numerico retornamos falso.
            return false;
        }
    }
    return true;   
}


// Validaciones del formulario de regsitro de voluntarios.

const form = document.getElementById("registro");

form.addEventListener("submit", (event)=>{
    let esValido = true;
    const nombre = document.getElementById("nombre").value;
    const errorNombre = document.getElementById("error-nombre");
    const correo = document.getElementById("email").value;
    const errorCorreo = document.getElementById("error-email");
    const telefono = document.getElementById("telefono").value;
    const errorTelefono = document.getElementById("error-tel");
    const regionValor = document.getElementById("region").value;
    const errorRegion = document.getElementById("error-region");
    const comunaValor = document.getElementById("comuna").value;
    const errorComuna = document.getElementById("error-comuna");
    
    // Validaciones del nombre.
    if (nombre.trim() === "" || !esNombreValido(nombre.trim())){
        errorNombre.classList.add("visible");
        esValido = false;
    }else{
        errorNombre.classList.remove("visible");
    }

    // Validaciones del email.
    if(correo.trim() === "" || !correo.trim().includes("@")){
        errorCorreo.classList.add("visible");
        esValido = false;
    }else{
        errorCorreo.classList.remove("visible");
    }

    // Validaciones del telefono.
    if(telefono !== "" && !esNumeroValido(telefono)){
        errorTelefono.classList.add("visible");
        esValido = false;
    }else{
        errorTelefono.classList.remove("visible");
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