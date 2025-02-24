let selectedStart = null;
let selectedEnd = null;

function handleDateSelection(info) {
    selectedStart = info.startStr;
    selectedEnd = info.endStr;

    console.log("Fecha seleccionada:", selectedStart, "hasta", selectedEnd); // ✅ Verificación en consola

    // Verificar si la selección incluye días ocupados
    let currentDate = new Date(selectedStart);
    let endDate = new Date(selectedEnd);
    let invalidSelection = false;
    let blockedElements = [];

    while (currentDate < endDate) {
        let dateStr = currentDate.toISOString().split('T')[0];
        if (bookedDates.includes(dateStr)) {
            invalidSelection = true;

            // Encontrar el elemento de la fecha en el calendario y aplicar la animación
            let blockedElement = document.querySelector(`[data-date="${dateStr}"]`);
            if (blockedElement) {
                blockedElements.push(blockedElement);
            }
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    if (invalidSelection) {
        // Agregar clase de parpadeo a las fechas bloqueadas
        blockedElements.forEach(el => el.classList.add("blocked-date"));

        // Mostrar mensaje de error
        const errorMessage = document.getElementById("error-message");
        errorMessage.style.display = "block";

        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
            errorMessage.style.display = "none";
            blockedElements.forEach(el => el.classList.remove("blocked-date"));
        }, 3000);

        // Resetear la selección
        selectedStart = null;
        selectedEnd = null;
        document.getElementById('selected-dates').innerHTML = "Selecciona fechas disponibles en el calendario.";
        document.getElementById('whatsapp-button').style.display = 'none';

        return;
    }

    // Si la selección es válida, mostrar la selección y habilitar el botón
    document.getElementById('selected-dates').innerHTML = `Has seleccionado: <b>${selectedStart}</b> hasta <b>${selectedEnd}</b>`;
    document.getElementById('whatsapp-button').style.display = 'block';
}


function sendToWhatsApp() {
    if (!selectedStart || !selectedEnd) {
        alert("Por favor, selecciona un rango de fechas antes de reservar.");
        return;
    }

    // Tu número de WhatsApp (cámbialo por el tuyo)
    const phoneNumber = "59170783199"; // Agrega tu número con código de país

    // Mensaje que se enviará a WhatsApp
    const message = `Hola, me gustaría reservar el Airbnb del ${selectedStart} al ${selectedEnd}. ¿Está disponible?`;

    // Crear el enlace de WhatsApp
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Abrir WhatsApp
    window.open(whatsappURL, "_blank");
}

// ✅ Exponer la función al HTML
window.sendToWhatsApp = sendToWhatsApp;


document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new window.FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', // ✅ Solo vista mensual
        locale: 'es',
        height: 'auto',
        expandRows: true,
        contentHeight: 'auto',
        selectable: true,
        unselectAuto: false,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: '' // ✅ No muestra opciones de vista
        },
        events: [], 
        select: function(info) { 
            handleDateSelection(info);
        }
    });
    calendar.render();

    // Cargar fechas ocupadas al inicio
    fetchICalData(calendar);

    // ✅ Actualizar fechas ocupadas cada 30 minutos (1800000 milisegundos)
    setInterval(() => {
        console.log("Actualizando fechas ocupadas automáticamente...");
        fetchICalData(calendar);
    }, 1800000);
});



let bookedDates = []; // Almacena las fechas ocupadas

async function fetchICalData(calendar) {
    try {
        const icalUrl = 'https://www.airbnb.com/calendar/ical/1189326882051090837.ics?s=eceb17aec47d83c072b1debb79455f51&locale=en'; // 🔴 Reemplázalo con tu enlace iCal de Airbnb
        const response = await fetch(icalUrl);
        if (!response.ok) {
            throw new Error('No se pudo obtener el archivo iCal');
        }
        const icalText = await response.text();
        
        const events = extractEventsFromICal(icalText);
        
        // Almacenar las fechas ocupadas en el array global
        bookedDates = events.flatMap(event => {
            let dates = [];
            let currentDate = new Date(event.start);
            let endDate = new Date(event.end);

            while (currentDate < endDate) {
                dates.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return dates;
        });

        console.log("Fechas ocupadas actualizadas:", bookedDates); // ✅ Verificación en consola

        // Limpiar eventos previos y actualizar el calendario
        calendar.removeAllEvents();
        events.forEach(event => {
            calendar.addEvent({
                title: 'Reservado',
                start: event.start,
                end: event.end,
                color: 'red'
            });
        });

    } catch (error) {
        console.error('Error al obtener el archivo iCal:", error);
    }
}




function extractEventsFromICal(icalText) {
    const events = [];
    const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
    let match;
    
    while ((match = eventRegex.exec(icalText)) !== null) {
        const eventBlock = match[1];
        const startMatch = eventBlock.match(/DTSTART(;VALUE=DATE)?:?(\d{8})/);
        const endMatch = eventBlock.match(/DTEND(;VALUE=DATE)?:?(\d{8})/);
        
        if (startMatch && endMatch) {
            events.push({
                start: formatDate(startMatch[2]),
                end: formatDate(endMatch[2])
            });
        }
    }
    return events;
}

function formatDate(yyyymmdd) {
    return `${yyyymmdd.substring(0, 4)}-${yyyymmdd.substring(4, 6)}-${yyyymmdd.substring(6, 8)}`;
}
