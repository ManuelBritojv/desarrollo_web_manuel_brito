
async function obtenerJSON(url){
    const respuesta = await fetch(url);
    if (!respuesta.ok) { // fetch no falla con 404/500
        throw new Error(`Error ${respuesta.status} al pedir ${url}`);
    }
    return await respuesta.json();
}

function mostrarMensaje(idContenedor, texto){
    document.getElementById(idContenedor).textContent = texto;
}


async function cargarGrafico(url, idContenedor, dibujar){
    try {
        const datos = await obtenerJSON(url);
        dibujar(datos);
    } catch (error) {
        console.error(error);
        mostrarMensaje(idContenedor, 'No se pudo cargar el gráfico.');
    }
}

async function cargarResumen(){
    try {
        const datos = await obtenerJSON('/api/pagina-metricas');
        document.getElementById('voluntarios-registrados').textContent = datos.volRegistrados;
        document.getElementById('avistamientos-totales').textContent = datos.avistamientosTotales;
        document.getElementById('regiones-activas').textContent = datos.regionesActivas;
    } catch (error) {
        console.error(error);
    }
}

function dibujarGraficoBarras(volXComuna){
    Highcharts.chart('grafico-barras', {
        chart: {
            type: 'column',
            backgroundColor: '#f5f7f4',
        },
        title: {
            text: 'Voluntarios x Comuna',
            style: {
                color: '#008f39',
                fontSize: '18px',
                fontWeight: 'bold'
            }
        },
        xAxis: {
            categories: Object.keys(volXComuna),
            labels: {
                style: {
                    color: '#555555',
                    fontSize: '11px'
                }
            }
        },
        yAxis: {
            title: {
                text: 'Voluntarios Registrados',
                style: {
                    color: '#777777'
                }
            },
            gridLineColor: '#e2e0e0'
        },
        plotOptions: {
            column: {
                color: '#008f39',
                borderRadius: 4,
                borderWidth: 0,
            }
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Voluntarios',
            data: Object.values(volXComuna)
        }]
    });
}

function dibujarGraficoLineas(avistamientosxdia){
    Highcharts.chart('grafico-lineas',{
        chart:{
            type: 'line',
            backgroundColor: '#f5f7f4',
        },
        title: {
            text: 'Avistamientos por día',
            style: {
                color: '#008f39',
                fontSize: '18px',
                fontWeight: 'bold'
            }
        },
        xAxis: {
            categories: Object.keys(avistamientosxdia),
            labels: {
                style: {
                    color: '#555555',
                    fontSize: '11px'
                }
            }
        },
        yAxis: {
            title: {
                text: 'Avistamientos registrados',
                style: {
                    color: '#777777'
                }
            },
            gridLineColor: '#e2e0e0'
        },
        plotOptions: {
            line: {
                color: '#008f39',
                borderWidth: 0,
            }
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Avistamientos',
            data: Object.values(avistamientosxdia)
        }]
    });
}

function dibujarGraficoTorta(totalAves){
    Highcharts.chart('grafico-torta',{
        chart:{
            type: 'pie',
            backgroundColor: '#f5f7f4',
        },
        title: {
            text: 'Total de avistamientos por tipo de ave',
            style: {
                color: '#008f39',
                fontSize: '18px',
                fontWeight: 'bold'
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Avistamientos',
            data: Object.values(totalAves)
        }]
    });
}

cargarGrafico('/api/voluntarios-comuna', 'grafico-barras', dibujarGraficoBarras);
cargarGrafico('/api/avistamiento-dia', 'grafico-lineas', dibujarGraficoLineas);
cargarGrafico('/api/total-por-ave', 'grafico-torta', dibujarGraficoTorta);
cargarResumen();