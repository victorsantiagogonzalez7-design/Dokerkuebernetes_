document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("contenedor-pedidos");
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        contenedor.innerHTML = "<p>Debes iniciar sesión para ver tus pedidos.</p>";
        return;
    }

    // 🧾 Mostrar pedido pendiente (guardado desde el carrito)
    const pedidoTemporal = JSON.parse(localStorage.getItem("pedidoTemporal")) || [];

    if (pedidoTemporal.length > 0) {
        const pedidoTempContainer = document.createElement("div");
        pedidoTempContainer.classList.add("pedido-temp");

        const total = pedidoTemporal.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

        const detallesHTML = pedidoTemporal.map(item => `
            <li>
                ${item.producto} (x${item.cantidad}) - $${item.precio} c/u 
                <strong>Subtotal:</strong> $${(item.precio * item.cantidad).toFixed(2)}
            </li>
        `).join("");

        pedidoTempContainer.innerHTML = `
            <h3>Pedido por confirmar</h3>
            <ul>${detallesHTML}</ul>
            <p><strong>Total:</strong> $${total.toFixed(2)}</p>
            <button id="confirmarPedidoBtn">Confirmar pedido</button>
            <button id="cancelarPedidoBtn">Cancelar</button>
        `;

        contenedor.prepend(pedidoTempContainer);

        // ✅ Confirmar pedido (envía el POST)
        document.getElementById("confirmarPedidoBtn").addEventListener("click", async () => {
            if (!usuario || !usuario.id) {
                showModal("Error: No se encontró el usuario logeado.");
                return;
            }

            const pedido = {
                cliente_id: null,
                usuario_id: usuario.id,
                estado: "pendiente",
                total: total,
                detalles: pedidoTemporal.map(item => ({
                    autoparte_id: item.id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio,
                    subtotal: item.precio * item.cantidad
                }))
            };

            try {
                // 🟢 1️⃣ Registrar el pedido en tu API principal
                const respuesta = await fetch("http://34.135.37.57/api/ventas", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(pedido)
                });

                if (!respuesta.ok) {
                    throw new Error(`Error al registrar el pedido: ${respuesta.status}`);
                }

                const data = await respuesta.json();
                console.log("✅ Pedido registrado:", data);

                // 🟡 2️⃣ Preparar la notificación por correo
                const productosTexto = pedidoTemporal
                    .map(item => `${item.producto} (x${item.cantidad})`)
                    .join(", ");

                const notificacion = {
                    nombre: usuario.nombre_completo,
                    email: usuario.email,
                    producto: productosTexto
                };

                // 🟢 3️⃣ Enviar notificación al correo mediante la API externa
                try {
                    const respCorreo = await fetch("http://135.237.117.204/enviar-pedido", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(notificacion)
                    });

                    if (!respCorreo.ok) {
                        console.warn("⚠️ No se pudo enviar el correo de notificación.");
                    } else {
                        console.log("📧 Correo de notificación enviado correctamente.");
                    }
                } catch (errorCorreo) {
                    console.error("Error al enviar correo de notificación:", errorCorreo);
                }

                // 🧹 4️⃣ Limpiar carrito y mostrar mensaje final
                localStorage.removeItem("pedidoTemporal");
                showModal("Pedido registrado exitosamente ✅ Se ha enviado un correo de confirmación.");
                contenedor.innerHTML = "<p>Tu pedido fue enviado correctamente.</p>";

            } catch (error) {
                console.error("❌ Error al guardar el pedido:", error);
                showModal("Error al registrar el pedido. Intenta nuevamente.");
            }
        });


        // ❌ Cancelar pedido temporal
        document.getElementById("cancelarPedidoBtn").addEventListener("click", () => {
            localStorage.removeItem("pedidoTemporal");
            location.reload();
        });
    }

    // 🧩 Cargar pedidos guardados en la base de datos
    try {
        const respuesta = await fetch(`http://34.135.37.57/api/usuarios/${usuario.id}/ventas`);
        if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

        const data = await respuesta.json();
        let pedidos = data.ventas || [];

        pedidos = pedidos.filter(p => p.usuario_id === usuario.id);

        if (pedidos.length === 0) {
            if (pedidoTemporal.length === 0) {
                contenedor.innerHTML += "<p>No tienes pedidos registrados.</p>";
            }
            return;
        }

        pedidos.forEach(pedido => {
            const card = document.createElement("div");
            card.classList.add("pedido-card");

            const fechaFormateada = new Date(pedido.fecha).toLocaleString("es-MX", {
                dateStyle: "medium",
                timeStyle: "short"
            });

            const detalles = pedido.detalles || [];
            const detallesHTML = detalles.map(d => `
                <li>
                    <ul>
                        <li>${d.autoparte_id ? "Autoparte ID: " + d.autoparte_id : ""}</li>
                        <li>Cantidad: ${d.cantidad}</li>
                        <li>Precio unitario: $${d.precio_unitario}</li>
                        <li>Subtotal: $${d.subtotal}</li>
                    </ul>
                </li>
            `).join("");

            // 🟡 Verificar si el pedido está pendiente
            let botonEntregadoHTML = "";
            if (pedido.estado === "pendiente") {
                botonEntregadoHTML = `
                    <button class="entregado-btn" data-id="${pedido.id}">
                        Pedido entregado
                    </button>
                `;
            }

            card.innerHTML = `
                <h3>Pedido #${pedido.id}</h3>
                <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                <p><strong>Estado:</strong> <span class="estado">${pedido.estado}</span></p>
                <p><strong>Total:</strong> $${pedido.total}</p>
                <details>
                    <summary>Ver detalles</summary>
                    <ul>${detallesHTML}</ul>
                </details>
                ${botonEntregadoHTML}
            `;

            contenedor.appendChild(card);
        });

        // 🟢 Agregar evento a todos los botones "Pedido entregado"
        document.querySelectorAll(".entregado-btn").forEach(boton => {
            boton.addEventListener("click", async () => {
                const pedidoId = boton.getAttribute("data-id");
                const usuario = JSON.parse(localStorage.getItem("usuario"));

                try {
                    // ✅ 1. Actualizar estado en la API principal
                    const respuesta = await fetch(`http://34.135.37.57/api/ventas/${pedidoId}/estado`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ estado: "completado" })
                    });

                    if (!respuesta.ok) {
                        throw new Error(`Error al actualizar el pedido: ${respuesta.status}`);
                    }

                    // ✅ 2. Obtener la información del pedido actualizado
                    const pedidoActualizado = await respuesta.json();

                    // ✅ 3. Enviar notificación por correo al endpoint de pedidos completados
                    /**await fetch("http://135.237.117.204/webhook/pedido/completado", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            venta_id: pedidoActualizado.id || pedidoId,
                            usuario_id: usuario.id,
                            estado: "completado",
                            total: pedidoActualizado.total,
                            usuario_email: usuario.email,
                            usuario_nombre: usuario.nombre,
                            detalles: pedidoActualizado.detalles || []
                        })
                    });**/

                    // ✅ 4. Mostrar mensaje y actualizar interfaz
                    showModal(`✅ Pedido #${pedidoId} marcado como completado.`);
                    boton.parentElement.querySelector(".estado").textContent = "completado";
                    boton.remove(); // Quita el botón una vez completado

                } catch (error) {
                    console.error("Error al cambiar el estado del pedido:", error);
                    showModal("❌ No se pudo actualizar el pedido. Intenta nuevamente.");
                }
            });
        });

    } catch (error) {
        console.error("Error al cargar los pedidos:", error);
        contenedor.innerHTML = `<p class="error">Error al cargar los pedidos. Intenta más tarde.</p>`;
    }

    // Función para mostrar el modal
    function showModal(message, title = "Notificación") {
        const modal = document.getElementById('notificationModal');
        const modalMessage = document.getElementById('modalMessage');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.style.display = 'block';
    }

    // Función para cerrar el modal
    function closeModal() {
        const modal = document.getElementById('notificationModal');
        modal.style.display = 'none';
    }

    // Event listeners para cerrar el modal
    const modal = document.getElementById('notificationModal');
    const closeBtn = document.querySelector('.close');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    // Cerrar con el botón X
    closeBtn.addEventListener('click', closeModal);

    // Cerrar con el botón Aceptar
    modalCloseBtn.addEventListener('click', closeModal);

    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Cerrar con la tecla ESC
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
});
