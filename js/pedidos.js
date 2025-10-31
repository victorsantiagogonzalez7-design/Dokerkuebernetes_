document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("contenedor-pedidos");
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        contenedor.innerHTML = "<p>Debes iniciar sesión para ver tus pedidos.</p>";
        return;
    }

    try {
        const respuesta = await fetch(`http://34.135.37.57/api/usuarios/${usuario.id}/ventas`);
        if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

        const data = await respuesta.json();
        let pedidos = data.ventas || [];

        // 🔥 Filtrar solo los pedidos del usuario logeado
        pedidos = pedidos.filter(p => p.usuario_id === usuario.id);

        if (pedidos.length === 0) {
            contenedor.innerHTML = "<p>No tienes pedidos registrados.</p>";
            return;
        }

        // 🔹 Mostrar pedidos
        pedidos.forEach(pedido => {
            const card = document.createElement("div");
            card.classList.add("pedido-card");

            const fechaFormateada = new Date(pedido.fecha).toLocaleString("es-MX", {
                dateStyle: "medium",
                timeStyle: "short"
            });

            const detallesHTML = pedido.detalles.map(d => `
                <li>${d.autoparte_id ? "Autoparte ID: " + d.autoparte_id : ""}, 
                Cantidad: ${d.cantidad}, 
                Precio unitario: $${d.precio_unitario}, 
                Subtotal: $${d.subtotal}</li>
            `).join("");

            card.innerHTML = `
                <h3>Pedido #${pedido.id}</h3>
                <p><strong>Cliente:</strong> ${pedido.cliente_id ?? "Sin cliente"}</p>
                <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                <p><strong>Estado:</strong> ${pedido.estado}</p>
                <p><strong>Total:</strong> $${pedido.total}</p>
                <details>
                    <summary>Ver detalles</summary>
                    <ul>${detallesHTML}</ul>
                </details>
            `;

            contenedor.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar los pedidos:", error);
        contenedor.innerHTML = `<p class="error">Error al cargar los pedidos. Intenta más tarde.</p>`;
    }
});
