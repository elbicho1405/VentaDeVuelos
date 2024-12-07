import { supabase } from "./Conexion";
let Tabla = document.getElementById("Vuelos");
let Formulario = document.querySelector(".search-form");
let AcientosDisponibles;


async function obtenerVuelos(filtros = {}) {
    let { data: Vuelos, error } = await supabase
        .from('Vuelos')
        .select(`
            IdVuelo,
            Aeronaves(Matricula, Capacidad), 
            Rutas(Origen, Destino, Distancia), 
            FechaVuelo(Partida, Regreso),
            AcientosDisponibles
        `);

    if (error) {
        console.error('Error al obtener datos:', error);
        return;
    }

    console.log("Datos obtenidos desde Supabase:", Vuelos);

    if (Object.keys(filtros).length > 0) {
        Vuelos = Vuelos.filter(vuelo => {
            const origenMatch = filtros.origen
                ? vuelo.Rutas.Origen.toLowerCase().includes(filtros.origen.toLowerCase())
                : true;
            const destinoMatch = filtros.destino
                ? vuelo.Rutas.Destino.toLowerCase().includes(filtros.destino.toLowerCase())
                : true;
            const fechaMatch = filtros.fecha
                ? vuelo.FechaVuelo.Partida.startsWith(filtros.fecha)
                : true;
            return origenMatch && destinoMatch && fechaMatch;
        });
    }

    Tabla.innerHTML = '';

    if (Vuelos && Vuelos.length > 0) {
        Vuelos.forEach(Vuelo => {
            const row = document.createElement('tr');

            const cell1 = document.createElement('td');
            const cell2 = document.createElement('td');
            const cell3 = document.createElement('td');
            const cell4 = document.createElement('td');
            const cell5 = document.createElement('td');
            const cell6 = document.createElement('td');
            const cell7 = document.createElement('button');

            AcientosDisponibles = Vuelo.AcientosDisponibles || `${Vuelo.Aeronaves.Capacidad}`;
            cell1.textContent = Vuelo.Rutas ? `${Vuelo.Rutas.Origen}` : 'Sin ruta';
            cell2.textContent = Vuelo.Rutas ? `${Vuelo.Rutas.Destino}` : 'Sin ruta';
            cell3.textContent = Vuelo.Rutas ? `${Vuelo.Rutas.Distancia}` : 'Sin ruta';
            cell4.textContent = Vuelo.FechaVuelo ? `${Vuelo.FechaVuelo.Partida}` : 'Sin fecha';
            cell5.textContent = Vuelo.FechaVuelo ? `${Vuelo.FechaVuelo.Regreso}` : 'Sin fecha';
            cell6.textContent = AcientosDisponibles;
            cell7.textContent = 'Comprar';
            cell7.classList.add('BtnComprar');
            cell7.addEventListener("click", () => mostrarFormulario(Vuelo));

            row.appendChild(cell1);
            row.appendChild(cell2);
            row.appendChild(cell3);
            row.appendChild(cell4);
            row.appendChild(cell5);
            row.appendChild(cell6);
            row.appendChild(cell7);

            Tabla.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 7; 
        cell.textContent = 'No se encontraron vuelos que coincidan con los filtros.';
        row.appendChild(cell);
        Tabla.appendChild(row);
    }
}

Formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    // Obtener los valores de los filtros
    const origen = document.getElementById("origen").value.trim();
    const destino = document.getElementById("destino").value.trim();
    const fecha = document.getElementById("fecha").value;

    obtenerVuelos({ origen, destino, fecha });
});

function mostrarFormulario(vuelo) {
  Swal.fire({
      title: 'Reservar vuelo',
      html: ` 
          <div>
              <label for="nombre">Nombre:</label>
              <input id="nombre" class="swal2-input" type="text" placeholder="Ingrese su nombre">
          </div>
          <div>
              <label for="DNI">DNI:</label>
              <input id="DNI" class="swal2-input" type="number" placeholder="Ingrese su DNI">
          </div>
          <div>
              <label for="cantidad">Cantidad de asientos:</label>
              <input id="cantidad" class="swal2-input" type="number" placeholder="Ingrese la cantidad">
          </div>
      `,
      confirmButtonText: 'Reservar',
      showCancelButton: true,
      preConfirm: () => {
          const nombre = document.getElementById('nombre').value;
          const DNI = document.getElementById('DNI').value;
          const cantidad = document.getElementById('cantidad').value;

          if (!nombre || !DNI || !cantidad || parseInt(DNI) < 18000000 || parseInt(cantidad) > parseInt(AcientosDisponibles)) {
              Swal.showValidationMessage('Ingrese los datos correctamente');
              return;
          }

          return { nombre, DNI, cantidad };
      }
  }).then(async (result) => {
      if (result.isConfirmed) {
          const { nombre, DNI, cantidad } = result.value;

          const clienteId = await InsertarCliente(nombre, DNI);

          
              const cantidadReservada = parseInt(cantidad);
              await InsertarReservaYActualizarVuelos(vuelo.IdVuelo, cantidadReservada, clienteId);

              Swal.fire('¡Reservado!', 'Tu reserva se ha realizado con éxito.', 'success');}
      else {
              Swal.fire('Error', 'No se pudo completar la reserva. Intenta nuevamente.', 'error');
          }
      }
  );
}

async function InsertarReservaYActualizarVuelos(vueloId, cantidadReservada, clienteId) {
  const { data: clienteExistente, error: clienteError } = await supabase
      .from('Cliente')
      .select('DNI')
      .eq('DNI', clienteId);

  if (clienteError) {
      console.error('Error al verificar el cliente:', clienteError);
      return;
  }

  if (clienteExistente && clienteExistente.length === 0) {
      console.error('Cliente no encontrado');
      return;
  }

  const { data: reservaData, error: reservaError } = await supabase
      .from('Reservas')
      .insert([
          { IdCliente: clienteId, IdVuelo: vueloId, CantidadReservada: cantidadReservada }
      ]);

  if (reservaError) {
      console.error('Error al insertar reserva:', reservaError);
      return;
  }

  console.log('Reserva insertada correctamente', reservaData);

  const { data: vueloData, error: vueloError } = await supabase
      .from('Vuelos')
      .update({
        AcientosDisponibles: (AcientosDisponibles - cantidadReservada)
      })
      .eq('IdVuelo', vueloId);

  if (vueloError) {
      console.error('Error al actualizar los asientos en Vuelos:', vueloError);
  } else {
      console.log('Asientos actualizados correctamente en la tabla Vuelos', vueloData);
  }
}


async function InsertarCliente(nombre, dni) {
  const { data: clientes, error } = await supabase
      .from('Cliente')
      .select('DNI')
      .eq('DNI', dni);

  if (error) {
      console.error('Error al verificar el cliente:', error);
      return null;
  }

 
  if (clientes && clientes.length > 0) {
      console.log('Cliente ya existe', clientes[0]);
      return dni;  
  }


  const { data, error: insertError } = await supabase
      .from('Cliente')
      .insert([
          { Nombre: nombre, DNI: dni }
      ]);

  if (insertError) {
      console.error('Error al insertar datos del cliente:', insertError);
      return null;
  }

  console.log('Cliente insertado correctamente', data);
  return dni;  
}

