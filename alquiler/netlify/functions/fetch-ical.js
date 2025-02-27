import { createRequire } from "module";
const require = createRequire(import.meta.url);
import fetch from 'node-fetch';

exports.handler = async function () {
    try {
        const icalUrl = 'https://www.airbnb.com/calendar/ical/1189326882051090837.ics?s=eceb17aec47d83c072b1debb79455f51&locale=en'; // 🔴 Reemplázalo con tu enlace iCal de Airbnb
        const response = await fetch(icalUrl);
        if (!response.ok) {
            throw new Error('No se pudo obtener el archivo iCal');
        }
        const icalText = await response.text();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Permitir solicitudes desde cualquier dominio
                "Content-Type": "text/calendar"
            },
            body: icalText
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error al obtener el archivo iCal', details: error.message })
        };
    }
};
