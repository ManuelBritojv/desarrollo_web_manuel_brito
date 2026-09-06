
const btnAplicar = document.getElementById("button-aplicar");
const selectTipo = document.getElementById("filtro-tipo");
const selectOrden = document.getElementById("ordenar-por");
const tbody = document.querySelector("#tabla-avistamientos tbody");
const navPaginacion = document.querySelector(".paginacion ul");

// Datos de la tabla
const filasOriginales = Array.from(tbody.querySelectorAll("tr"));

// Copia por si aplicamos filtros
let filasFiltradas = [];

let paginaActual = 1;
const filasPorPagina = 5;

// <tr>
//   Fecha y Hora  [0]
//   Tipo          [1]
//   Especie       [2]
//   Ubicación     [3]
//   Evidencia     [4]
// </tr>

procesarFiltros()
btnAplicar.addEventListener("click", procesarFiltros)

function procesarFiltros(){
    const tipoFiltro = selectTipo.value;
    const ordenFiltro = selectOrden.value;
    filasFiltradas = []
    if(tipoFiltro === "todos"){
        filasFiltradas = filasOriginales.slice();
    } else {
        for(let i = 0; i < filasOriginales.length; i++){
            let tipoActual = filasOriginales[i].children[1].textContent.toLowerCase()
            // 3. Manejamos manualmente las diferencias de texto entre value y <td>
            if (tipoFiltro === "rapaz" && tipoActual.includes("rapaz")) {
                filasFiltradas.push(filasOriginales[i]);
            } 
            else if (tipoFiltro === "acuatica" && tipoActual.includes("acuática")) {
                filasFiltradas.push(filasOriginales[i]);
            } 
            else if (tipoFiltro === "marina" && tipoActual.includes("marina")) {
                filasFiltradas.push(filasOriginales[i]);
            } 
            else if (tipoFiltro === "cantora" && (tipoActual.includes("cantora") || tipoActual.includes("pequeña"))) {
                filasFiltradas.push(filasOriginales[i]);
            } 
            else if (tipoFiltro === "otra" && tipoActual.includes("otro")) {
                filasFiltradas.push(filasOriginales[i]);
            }        
        }
    }
    // Ordenamiento

    // sort(A,B)
    // Si damos -1 => A < B, "A va primero que B"
    // Si damos 1 => A > B, "B va primero que A"
    // Si damos 0 => A = B

    // A.localCompare(B) Lee caracter por caracter y retorna:
    // Es basicamente ¿A es mayor que B?
    // 1 Si A > B
    // -1 Si B > A
    // 0 Si A = B

    filasFiltradas.sort((filaA, filaB) => {
        // Atrapamos Fechas (índice 0) y Lugares (índice 3)
        const fechaA = filaA.children[0].textContent;
        const fechaB = filaB.children[0].textContent;
        const lugarA = filaA.children[3].textContent.toLowerCase();
        const lugarB = filaB.children[3].textContent.toLowerCase();
        if (ordenFiltro === "fecha-asc")
            return fechaA.localeCompare(fechaB); // A-B 
        if (ordenFiltro === "fecha-desc") 
            return fechaB.localeCompare(fechaA); // B-A
        if (ordenFiltro === "lugar-az") 
            return lugarA.localeCompare(lugarB); // A-B
        if (ordenFiltro === "lugar-za") 
            return lugarB.localeCompare(lugarA); // B-A
    });
    paginaActual = 1; // Cada vez que filtramos, volvemos a la pág 1
    renderizarTabla();
}

function renderizarTabla() {
    tbody.innerHTML = ""; // Limpiamos la tabla actual

    // Calculamos qué porción del arreglo mostrar
    const indiceInicio = (paginaActual - 1) * filasPorPagina;
    const indiceFin = indiceInicio + filasPorPagina;
    
    const filasPagina = filasFiltradas.slice(indiceInicio, indiceFin);

    if (filasPagina.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No hay resultados para este filtro.</td></tr>';
    } else {
        for (let i = 0; i < filasPagina.length; i++) {
            tbody.appendChild(filasPagina[i]);
        }
    }
    actualizarPaginacion();
}

function actualizarPaginacion() {
    navPaginacion.innerHTML = ""; // Limpiamos botones viejos

    // Calculamos el total de páginas redondeando hacia arriba
    const totalPaginas = Math.ceil(filasFiltradas.length / filasPorPagina);
    
    // Si no hay datos o solo hay 1 página, no mostramos botones
    if (totalPaginas <= 1) return;

    // Crear botón "Anterior"
    const liAnterior = document.createElement("li");
    const aAnterior = document.createElement("a");
    aAnterior.href = "#";
    aAnterior.textContent = "Anterior";
    
    if (paginaActual === 1) {
        // Si estamos en la página 1, lo deshabilitamos 
        aAnterior.setAttribute("aria-disabled", "true");
    } else {
        aAnterior.addEventListener("click", (e) => {
            e.preventDefault();
            paginaActual--; // Restamos 1 a la página actual
            renderizarTabla();
        });
    }
    liAnterior.appendChild(aAnterior);
    navPaginacion.appendChild(liAnterior);

    // Crear botones de números (1, 2, 3...)
    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = i;
        
        if (i === paginaActual) {
            a.setAttribute("aria-current", "page"); // Pagina seleccionada/Actual
        } else {
            a.addEventListener("click", (e) => {
                e.preventDefault(); 
                paginaActual = i; // Saltamos a la página del número clickeado
                renderizarTabla();
            });
        }
        li.appendChild(a);
        navPaginacion.appendChild(li);
    }

    // Crear botón "Siguiente"
    const liSiguiente = document.createElement("li");
    const aSiguiente = document.createElement("a");
    aSiguiente.href = "#";
    aSiguiente.textContent = "Siguiente";
    
    if (paginaActual === totalPaginas) {
        // Si estamos en la última página, lo deshabilitamos
        aSiguiente.setAttribute("aria-disabled", "true");
    } else {
        aSiguiente.addEventListener("click", (e) => {
            e.preventDefault();
            paginaActual++; // Sumamos 1 a la página actual
            renderizarTabla();
        });
    }
    liSiguiente.appendChild(aSiguiente);
    navPaginacion.appendChild(liSiguiente);
}