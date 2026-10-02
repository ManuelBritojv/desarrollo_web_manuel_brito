// Como ahora la logica la hago en flask, no necesito hacer logica aca de listado

// Solo esto, que hace que cada fila sea clickeable y redireccione a ver detalle.
document.querySelectorAll("tr[data-href]").forEach(fila => {
    fila.addEventListener("click", () => { window.location = fila.dataset.href; });
});