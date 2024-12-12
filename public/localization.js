// Localização
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocalização não é suportada por este navegador.");
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    document.getElementById("location").value = `Latitude: ${latitude}, Longitude: ${longitude}`;

    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const linkElement = document.getElementById("mapLink");
    linkElement.innerHTML = `<a href="${googleMapsLink}" target="_blank">Ver no Google Maps</a>`;

    // Chama a função para obter a cidade, o estado e o país
    getCityStateCountry(latitude, longitude);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("Usuário negou a solicitação de Geolocalização.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Informação de localização não está disponível.");
            break;
        case error.TIMEOUT:
            alert("A solicitação para obter a localização expirou.");
            break;
        case error.UNKNOWN_ERROR:
            alert("Ocorreu um erro desconhecido.");
            break;
    }
}

function getCityStateCountry(latitude, longitude) {
    const apiKey = 'AIzaSyCC8hQ8MfdIATQo8r4Q4BApeCz3xPzhInI'; // Sua chave da API do Google
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    console.log(`Fetching city, state and country for lat: ${latitude}, lng: ${longitude}`); // Log de depuração

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data); 

            if (data.status === 'OK') {
                const addressComponents = data.results[0].address_components;
                let city = 'Cidade desconhecida';
                let state = 'Estado desconhecido';
                let country = 'País desconhecido';

                addressComponents.forEach(component => {
                    if (component.types.includes('locality') || component.types.includes('sublocality') || component.types.includes('administrative_area_level_2')) {
                        city = component.long_name;
                    }
                    if (component.types.includes('administrative_area_level_1')) {
                        state = component.long_name;
                    }
                    if (component.types.includes('country')) {
                        country = component.long_name;
                    }
                });

                console.log(`City: ${city}, State: ${state}, Country: ${country}`); // Log de depuração

                document.getElementById('city').value = city;
                document.getElementById('state').value = state;
                document.getElementById('country').value = country;
            } else {
                console.error('Geocoding API error:', data.status);
            }
        })
        .catch(error => console.error('Erro:', error));
}

window.getLocation = getLocation;
