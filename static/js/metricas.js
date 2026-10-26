
async function voluntariosXComuna(){
    console.log("Hola!");
    const respuesta = await fetch("/api/voluntarios-comuna");
    const volXComuna = await respuesta.json();
    return volXComuna;
}

async function obtenerDatos() {
    const volXComuna = await voluntariosXComuna(); // Diccionario
    console.log(volXComuna);
    dibujarGraficos(volXComuna);
}

function dibujarGraficos(volXComuna) {
    Highcharts.chart('grafico-barras', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Voluntarios x Comuna'
        },
        xAxis: {
            categories: Object.keys(volXComuna)
        },
        yAxis: {
            title: {
                text: 'Voluntarios Registrados'
            }
        },
        series: [{
            name: 'Voluntarios',
            data: Object.values(volXComuna)
        }]
    });
}

obtenerDatos()