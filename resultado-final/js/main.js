const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
const buscador = document.querySelector("#buscador");
const botonesVerMas = document.querySelectorAll(".btn-ver-mas");
const cerrarModal = document.querySelector(".cerrar-modal");
const btnOrdenarNombreAsc = document.getElementById("btnOrdenarNombreAsc");
const btnOrdenarNombreDesc = document.getElementById("btnOrdenarNombreDesc");
const btnOrdenarNumeroAsc = document.getElementById("btnOrdenarNumeroAsc");
const btnOrdenarNumeroDesc = document.getElementById("btnOrdenarNumeroDesc");
const selectTipos = document.getElementById("tipos");
const selectMovimientos = document.getElementById("movimientos");
const formularioPokemon = document.getElementById("formularioPokemon");


let URL = "https://pokeapi.co/api/v2/pokemon/?limit=151";
const URL_TIPOS = "https://pokeapi.co/api/v2/type/";
const URL_MOVIMIENTOS = "https://pokeapi.co/api/v2/move/?limit=151"; 


// Funciones de interacción con la API

function cargarPokemon() {
    fetch(URL)
    .then(response => response.json())
    .then(data => {
        const fetches = data.results.map(poke => fetch(poke.url).then(res => res.json()));
        Promise.all(fetches)
        .then(res => {
            pokemonData = res;
            filtrarPokemon(); // Filtrar y mostrar todos los Pokémon
        })
        .catch(error => console.error("Error fetching Pokémon data:", error));
    });
}
async function cargarDetallesPokemon(pokeId) {
    try {
const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);
const data = await response.json();
mostrarDetallesPokemon(data); 
    } catch (error) {
    console.error("Error fetching Pokémon details:", error);
    }
}

async function cargarTipos() {
    try {
    const response = await fetch(URL_TIPOS);
    const data = await response.json();

      // Filtrar tipos (excluyendo 'unknown' y 'shadow')
    const tiposFiltrados = data.results.filter(tipo => tipo.name !== 'unknown' && tipo.name !== 'shadow');

    tiposFiltrados.forEach(tipo => {
        const option = document.createElement("option");
        option.value = tipo.name;
        option.text = tipo.name;
        selectTipos.add(option);
    });
    } catch (error) {
    console.error("Error fetching types:", error);
    }
}

formularioPokemon.addEventListener("submit", (event) => {
    event.preventDefault(); // Evitar que el formulario se envíe de forma predeterminada

    // Obtener los datos del formulario
    const nuevoPokemon = {
    id: parseInt(document.getElementById("numero").value),
    name: document.getElementById("nombre").value,
    sprites: {
        front_default: document.getElementById("imagen").value
    },
    types: Array.from(document.getElementById("tipos").selectedOptions).map(option => ({ type: { name: option.value } })),
    moves: Array.from(document.getElementById("movimientos").selectedOptions).map(option => ({ move: { name: option.value } })),
      height: 1, // Puedes establecer valores predeterminados para height y weight
    weight: 1
    };

    // Agregar el nuevo Pokémon a la lista
    pokemonData.push(nuevoPokemon);
    filtrarPokemon(terminoBusquedaActual); // Actualizar la lista de Pokémon

    // Restablecer el formulario (opcional)
    formularioPokemon.reset();
});



// Funciones de manipulación del DOM
function eliminarPokemon(pokeId) {
    pokemonData = pokemonData.filter(pokemon => pokemon.id !== pokeId);
    filtrarPokemon(terminoBusquedaActual); // Actualizar la lista de Pokémon
}

function mostrarPokemon(poke) {
    let tipos = poke.types.map((type) => `<p class="${type.type.name} tipo">${type.type.name}</p>`);
    tipos = tipos.join('');
    let pokeId = poke.id.toString();
    if (pokeId.length === 1) {
    pokeId = "00" + pokeId;
    } else if (pokeId.length === 2) {
    pokeId = "0" + pokeId;
    }

    const div = document.createElement("div");
    div.classList.add("pokemon");

    let imagenSrc;
    // Verificar si el Pokémon tiene la propiedad 'sprites.other' (viene de la API)
    if (poke.sprites && poke.sprites.other) {
      // Pokémon de la API: usar official-artwork si existe, sino front_default
    imagenSrc = poke.sprites.other["official-artwork"]?.front_default || poke.sprites.front_default;
    } else {
      // Pokémon agregado manualmente: usar la URL de imagen proporcionada
    imagenSrc = poke.sprites.front_default;
    }

    div.innerHTML = `
    <p class="pokemon-id-back">#${pokeId}</p>
    <div class="pokemon-imagen">
        <img src="${imagenSrc}" alt="${poke.name}">
    </div>
    <div class="pokemon-info">
        <div class="nombre-contenedor">
        <p class="pokemon-id">#${pokeId}</p>
        <h2 class="pokemon-nombre">${poke.name}</h2>
        </div>
        <div class="pokemon-tipos">
        ${tipos}
        </div>
        <div class="pokemon-stats">
        <p class="stat">${poke.height}m</p>
        <p class="stat">${poke.weight}kg</p>
        </div>
        <button class="btn-ver-mas" data-poke-id="${poke.id}">Ver más</button>
        <button class="btn-editar" data-poke-id="${poke.id}">Editar</button> 
    </div>
    `;

    
    if (!poke.sprites.other) {
    const btnEliminar = document.createElement("button");
    btnEliminar.classList.add("btn-eliminar");
    btnEliminar.dataset.pokeId = poke.id;
    btnEliminar.textContent = "Eliminar";
      div.querySelector(".pokemon-info").appendChild(btnEliminar); // Agregar el botón al div.pokemon-info

    btnEliminar.addEventListener("click", () => {
        const pokeId = parseInt(btnEliminar.dataset.pokeId);
        eliminarPokemon(pokeId);
        if (confirm(`¿Estás seguro de que quieres eliminar a ${poke.name}?`)) {
            eliminarPokemon(pokeId);
        }
    });
    }

    // Agregar event listener al botón "Ver más"
    const btnVerMas = div.querySelector(".btn-ver-mas");
    btnVerMas.addEventListener("click", () => {
    const pokeId = btnVerMas.dataset.pokeId;
    cargarDetallesPokemon(pokeId);
    });

    listaPokemon.append(div);
}


function mostrarDetallesPokemon(pokemon) {
    const modalBody = document.getElementById("modal-body");
    modalBody.innerHTML = `
    <div class="pokemon-detalle">
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="pokemon-detalle-imagen">
        <h2 class="pokemon-detalle-nombre">#${pokemon.id} - ${pokemon.name}</h2>
        <div class="pokemon-detalle-info">
        <div class="tipos">
            <h3>Tipos:</h3>
            <ul>${pokemon.types.map(tipo => `<li class="${tipo.type.name} tipo">${tipo.type.name}</li>`).join('')}</ul>
        </div>
        <div class="movimientos">
            <h3>Movimientos:</h3>
            <ul>${pokemon.moves.slice(0, 6).map(movimiento => `<li>${movimiento.move.name}</li>`).join('')}</ul>
        </div>
        </div>
    </div>
    `;

    document.getElementById("modal-container").style.display = "block";
}



// Funciones auxiliares

function ordenarPokemonPorId(pokemon) {
    return pokemon.sort((a, b) => a.id - b.id);
}
let pokemonData = [];
let pokemonFiltrados = [];
let terminoBusquedaActual = ""; // Variable para almacenar el término de búsqueda actual
let criterioOrdenamiento = "numero"; // Criterio de ordenamiento actual
let ordenOrdenamiento = "asc"; // Orden de ordenamiento actual

function filtrarPokemon(terminoBusqueda = "") {
    // Actualizar el término de búsqueda actual
    terminoBusquedaActual = terminoBusqueda;

    // Filtrar todos los Pokémon
    pokemonFiltrados = pokemonData.filter(pokemon => {
    const nombre = pokemon.name.toLowerCase();
    const tipos = pokemon.types.map(type => type.type.name);
    return nombre.includes(terminoBusqueda) || tipos.includes(terminoBusqueda);
    });

    ordenarPokemon(); // Ordenar los Pokémon filtrados
}

function ordenarPokemon(criterio = criterioOrdenamiento, orden = ordenOrdenamiento) {
    // Actualizar el criterio y orden de ordenamiento actuales
    criterioOrdenamiento = criterio;
    ordenOrdenamiento = orden;

    pokemonFiltrados.sort((a, b) => {
    if (criterio === "nombre") {
        return orden === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else if (criterio === "numero") {
        return orden === "asc" ? a.id - b.id : b.id - a.id;
    }
    });

    // Mostrar los Pokémon filtrados y ordenados
    listaPokemon.innerHTML = "";
    pokemonFiltrados.forEach(mostrarPokemon);
}


// Event listeners

// Event listeners para los botones de filtro (tipos)
botonesHeader.forEach(boton => boton.addEventListener("click", (event) => {
    event.stopPropagation(); // Detener la propagación del evento
    const botonId = event.currentTarget.id;
    filtrarPokemon(botonId); // Filtrar por tipo
}));


  // Event listener para el botón "Ver todos"
const btnVerTodos = document.getElementById("ver-todos");
btnVerTodos.addEventListener("click", () => {
    filtrarPokemon(""); // Reiniciar el filtro
});


// Event listener para el buscador
buscador.addEventListener("input", () => {
    const terminoBusqueda = buscador.value.toLowerCase();
    offset = 0; // Reiniciar el offset al buscar
    filtrarPokemon(terminoBusqueda); // Filtrar por nombre o tipo (si el término coincide con algún tipo)
});



// Event listeners para los botones de ordenamiento
btnOrdenarNombreAsc.addEventListener("click", () => {
    ordenarPokemon("nombre", "asc");
    filtrarPokemon(terminoBusquedaActual); // Volver a aplicar el filtro después de ordenar
});

btnOrdenarNombreDesc.addEventListener("click", () => {
    ordenarPokemon("nombre", "desc");
    filtrarPokemon(terminoBusquedaActual); // Volver a aplicar el filtro después de ordenar
});

btnOrdenarNumeroAsc.addEventListener("click", () => {
    ordenarPokemon("numero", "asc");
    filtrarPokemon(terminoBusquedaActual); // Volver a aplicar el filtro después de ordenar
});

btnOrdenarNumeroDesc.addEventListener("click", () => {
    ordenarPokemon("numero", "desc");
    filtrarPokemon(terminoBusquedaActual); // Volver a aplicar el filtro después de ordenar
});

botonesVerMas.forEach(boton => {
boton.addEventListener("click", (event) => {
    const pokeId = event.currentTarget.dataset.pokeId;
    cargarDetallesPokemon(pokeId);
});
});

cerrarModal.addEventListener("click", () => {
    document.getElementById("modal-container").style.display = "none";
    });



  // Obtener todos los datos de los Pokémon al inicio
fetch(URL)
    .then(response => response.json())
    .then(data => {
    const fetches = data.results.map(poke => fetch(poke.url).then(res => res.json()));
    Promise.all(fetches)
        .then(res => {
        pokemonData = res;
          filtrarPokemon(); // Mostrar todos al inicio
        })
        .catch(error => console.error("Error fetching Pokémon data:", error));
    });
    async function cargarMovimientos() {
        try {
        const response = await fetch(URL_MOVIMIENTOS);
        const data = await response.json();
    
        data.results.forEach(movimiento => {
            const option = document.createElement("option");
            option.value = movimiento.name;
            option.text = movimiento.name;
            selectMovimientos.add(option);
        });
        } catch (error) {
        console.error("Error fetching moves:", error);
        }
    }
cargarPokemon();
cargarTipos(); // Cargar los tipos de Pokémon
cargarMovimientos(); // Cargar los movimientos de Pokémon

