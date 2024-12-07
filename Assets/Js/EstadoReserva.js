import { supabase } from "./Conexion";

document.getElementById("consultaForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const dni = document.getElementById("dni").value.trim();

    if (!dni) {
        showMessage("Por favor, ingrese un DNI válido.", "error");
        return;
    }

    try {
        const { data: reservas, error } = await supabase
            .from('Reservas')
            .select('IdVuelo, CantidadReservada, Vuelos(Rutas(Origen, Destino), FechaVuelo(Partida))')
            .eq('IdCliente', dni);

        console.log("Reservas obtenidas:", reservas);

        if (error) {
            console.error("Error en la consulta:", error);
            showMessage("Hubo un error al consultar las reservas.", "error");
            return;
        }

        if (reservas && reservas.length > 0) {
            const reservasHtml = reservas.map(reserva => `
                <div class="reserva">
                    <p><strong>Vuelo:</strong> ${reserva.Vuelos?.Rutas?.Origen} - ${reserva.Vuelos?.Rutas?.Destino}</p>
                    <p><strong>Fecha de salida:</strong> ${reserva.Vuelos?.FechaVuelo?.Partida}</p>
                    <p><strong>Cantidad de asientos reservados:</strong> ${reserva.CantidadReservada}</p>
                </div>
            `).join("");

            showMessage(reservasHtml, "success");
        } else {
            showMessage("No se encontraron reservas para este DNI.", "error");
        }
    } catch (error) {
        console.error("Error al obtener reservas:", error);
        showMessage("Hubo un problema al obtener las reservas. Intente más tarde.", "error");
    }
});

function showMessage(message, type) {
    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = message;
    resultadoDiv.className = type === "error" ? "error" : "success";
}
