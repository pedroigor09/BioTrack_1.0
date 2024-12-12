let map;
let drawingManager;
let polygon;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -12.890360350415653, lng: -38.33566286452358 }, // USANDO A LOCALIZAÇÃO ATUAL DO USUARIO
        zoom: 12,
    });

    // AQUI É A FERRAMENTA DE DESENHO NO GOOGLE MAPS
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
    });
    drawingManager.setMap(map);

    // ESTE METODO CAPTURA O EVENTO DA ÁREA DO POLIGONO QUE FOI DESENHADO
    google.maps.event.addListener(drawingManager, "overlaycomplete", function(event) {
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
            if (polygon) {
                polygon.setMap(null); // VAI REMOVER O POLIGONO ANTIGO, POR ISSO UMA CONDIÇÃO DE "SE TIVER"
            }
            polygon = event.overlay;
        }
    });
}

// MÉTODO/FUNÇÃO PRA EXPORTAR O POLYGONO EM KML
function downloadKML() {
    if (!polygon) {
        alert("Desenhe um polígono primeiro!");
        return;
    }

    const path = polygon.getPath();
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>
            <name>Polígono do Google Maps</name>
            <Placemark>
                <Polygon>
                    <outerBoundaryIs>
                        <LinearRing>
                            <coordinates>`;

    path.forEach(coord => {
        kml += `${coord.lng()},${coord.lat()},0 `;
    });

    kml += `</coordinates>
                        </LinearRing>
                    </outerBoundaryIs>
                </Polygon>
            </Placemark>
        </Document>
    </kml>`;

    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "polygon.kml";
    link.click();
}

window.initMap = initMap;
