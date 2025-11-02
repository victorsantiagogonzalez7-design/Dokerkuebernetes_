document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("productos-container");
    const inputBusqueda = document.querySelector(".search-box input");
    const botonBusqueda = document.querySelector(".search-box button");

    let productos = [];

    // 🟢 Cargar todos los productos al inicio
    try {
        const response = await fetch("http://34.44.224.107/productos");

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        productos = await response.json();
        console.log("Productos cargados:", productos);

        mostrarProductos(productos); // Mostrar todos al inicio

    } catch (error) {
        console.error("Error al cargar los productos:", error);
        contenedor.innerHTML = "<p style='color:red;'>No se pudieron cargar los productos.</p>";
    }

    // 🔍 Evento de búsqueda
    botonBusqueda.addEventListener("click", () => {
        const query = inputBusqueda.value.trim().toLowerCase();

        if (!query) {
            mostrarProductos(productos); // Si está vacío, mostrar todos
            return;
        }

        const resultados = productos.filter(p =>
            p.nombre.toLowerCase().includes(query)
        );

        if (resultados.length === 0) {
            contenedor.innerHTML = "<p>No se encontraron productos con ese nombre.</p>";
        } else {
            mostrarProductos(resultados);
        }
    });

    // 🧭 Permitir buscar también con Enter
    inputBusqueda.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            botonBusqueda.click();
        }
    });

    // 💡 Función reutilizable para mostrar productos
    function mostrarProductos(lista) {
        contenedor.innerHTML = "";

        lista.forEach(prod => {
            const card = document.createElement("div");
            card.classList.add("producto-card");

            card.innerHTML = `
                <div class="producto-imagen">
                    <img src="${prod.imagen || 'https://via.placeholder.com/200x200?text=Sin+Imagen'}" alt="${prod.nombre}">
                </div>
                <div class="producto-info">
                    <h3 class="producto-nombre">${prod.nombre}</h3>
                    <p class="producto-marca">${prod.marca}</p>
                    <p class="producto-sku">SKU: ${prod.sku}</p>
                    <p class="producto-precio">$${prod.precio_venta.toFixed(2)}</p>
                    <p class="producto-stock">Stock: ${prod.stock}</p>
                    <button class="add-to-cart"
                        data-id="${prod.id}"
                        data-product="${prod.nombre}"
                        data-price="${prod.precio_venta}"
                        data-image="${prod.imagen || 'https://via.placeholder.com/250x200?text=Sin+Imagen'}">
                        Añadir al Carrito
                    </button>
                </div>
            `;

            contenedor.appendChild(card);
        });
    }
});
