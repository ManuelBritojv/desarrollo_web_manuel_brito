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
    event.preventDefault();
    let esValido = true;
    const exito = document.getElementById("exito");
    const nombre = document.getElementById("nombre").value;
    const errorNombre = document.getElementById("error-nombre");
    const correo = document.getElementById("email").value;
    const errorCorreo = document.getElementById("error-email");
    const telefono = document.getElementById("telefono").value;
    const errorTelefono = document.getElementById("error-tel");
    const region = document.getElementById("region").value;
    const errorRegion = document.getElementById("error-region");
    const comuna = document.getElementById("comuna").value;
    const errorComuna = document.getElementById("error-comuna");
    
    // Si ya teniamos un mensaje de exito lo quitamos.
    if (exito.classList.contains("visible")){
        exito.classList.remove("visible");
    }
        
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