import { supabase } from "./Conexion"
let Tabla= document.getElementById("Vuelos");

 
async function obtenerVuelos() {
    // Obtener los datos desde Supabase
    let { data: Vuelos, error } = await supabase
      .from('Vuelos')  // Nombre de tu tabla
      .select('AcientosDisponibles, Aeronaves(*), Rutas(*), FechaVuelo(*)');   // Seleccionamos todas las columnas
  
    // Verificar si hubo un error en la consulta
    if (error) {
      console.error('Error al obtener datos:', error);
      return;
    }

    console.log("Datos obtenidos desde Supabase:", Vuelos);

    // Limpiar la tabla antes de agregar nuevos datos
    Tabla.innerHTML = '';

    // Insertar las filas en la tabla usando los datos de Supabase
    if (Vuelos && Vuelos.length > 0) {
        Vuelos.forEach(ruta => {
            const row = document.createElement('tr'); // Crear una nueva fila

            // Crear celdas para cada columna y agregar los datos
            const cell1 = document.createElement('td');
            const cell2 = document.createElement('td');
            const cell3 = document.createElement('td');
            const cell4 = document.createElement('td');
            const cell5 = document.createElement('td');
            const cell6 = document.createElement('button');
            
            // Asegúrate de que las propiedades de los objetos coincidan con tu base de datos
            cell1.textContent = ruta.Rutas|| 'Sin nombre';  // Cambia 'nombre' por el nombre real de la columna
            cell2.textContent = ruta.Aeronaves || 'Sin edad';    // Cambia 'edad' por el nombre real de la columna
            cell3.textContent = ruta.FechaVuelo || 'Sin ciudad';  // Cambia 'ciudad' por el nombre real de la columna
            cell4.textContent = ruta.Partida || 'Sin ciudad';
            cell5.textContent = ruta.Regreso || 'Sin ciudad';
            cell6.textContent='comprar';

            // Agregar las celdas a la fila
            row.appendChild(cell1);
            row.appendChild(cell2);
            row.appendChild(cell3);
            row.appendChild(cell4);
            row.appendChild(cell5);
            row.appendChild(cell6);

            // Agregar la fila a la tabla
            Tabla.appendChild(row);
        });
    } else {
        // Si no hay datos, agregar un mensaje de que no se encontraron registros
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 3; // Este mensaje debe ocupar todo el ancho de la tabla
        cell.textContent = 'No se encontraron Vuelos.';
        row.appendChild(cell);
        Tabla.appendChild(row);
    }
}

  
  
  // Llamar a la función para obtener y mostrar los datos
  obtenerVuelos();
