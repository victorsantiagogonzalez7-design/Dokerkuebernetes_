document.addEventListener('DOMContentLoaded', function() {
            const btnBuscar = document.getElementById('btn-buscar');
            const clienteIdInput = document.getElementById('cliente-id');
            const recomendacionesList = document.getElementById('recomendaciones-list');
            
            // Función para obtener recomendaciones
            async function obtenerRecomendaciones(clienteId) {
                try {
                    // Mostrar estado de carga
                    recomendacionesList.innerHTML = '<div class="loading">Cargando recomendaciones...</div>';
                    
                    // Hacer la petición a la API
                    const response = await fetch(`http://57.152.12.59/recommendations/user/${clienteId}`);
                    
                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: ${response.statusText}`);
                    }
                    
                    const recomendaciones = await response.json();
                    
                    // Mostrar las recomendaciones
                    mostrarRecomendaciones(recomendaciones);
                    
                } catch (error) {
                    console.error('Error al obtener recomendaciones:', error);
                    recomendacionesList.innerHTML = `
                        <div class="error">
                            <h3>Error al cargar las recomendaciones</h3>
                            <p>${error.message}</p>
                            <p>Por favor, verifica el ID del cliente e intenta nuevamente.</p>
                        </div>
                    `;
                }
            }
            
            // Función para mostrar las recomendaciones
            function mostrarRecomendaciones(recomendaciones) {
                if (!recomendaciones || recomendaciones.length === 0) {
                    recomendacionesList.innerHTML = '<div class="error">No se encontraron recomendaciones para este cliente.</div>';
                    return;
                }
                
                let html = '<div class="recomendaciones-grid">';
                
                recomendaciones.forEach(item => {
                    html += `
                        <div class="recomendacion-card">
                            <div class="card-image">
                                ${item.imagen ? `<img src="${item.imagen}" alt="${item.nombre}" style="width:100%; height:100%; object-fit:cover;">` : 'Imagen del producto'}
                            </div>
                            <div class="card-content">
                                <h3 class="card-title">${item.nombre || 'Producto recomendado'}</h3>
                                <p class="card-description">${item.descripcion || 'Descripción del producto recomendado.'}</p>
                                <div class="card-rating">
                                    <div class="stars">★★★★★</div>
                                    <span class="rating-value">${item.puntuacion || '4.5'}</span>
                                </div>
                                <div class="card-footer">
                                    <div class="price">$${item.precio || '99.99'}</div>
                                    <button class="btn-action">Ver detalles</button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                html += '</div>';
                recomendacionesList.innerHTML = html;
            }
            
            // Evento para el botón de búsqueda
            btnBuscar.addEventListener('click', function() {
                const clienteId = clienteIdInput.value.trim();
                
                if (!clienteId) {
                    alert('Por favor, ingresa un ID de cliente válido.');
                    return;
                }
                
                obtenerRecomendaciones(clienteId);
            });
            
            // Permitir búsqueda con Enter
            clienteIdInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    btnBuscar.click();
                }
            });
            
            // Ejemplo de datos de prueba (para demostración cuando la API no esté disponible)
            const datosEjemplo = [
                {
                    id: 1,
                    nombre: "Smartphone Avanzado",
                    descripcion: "Teléfono inteligente con cámara de alta resolución y batería de larga duración.",
                    precio: 599.99,
                    puntuacion: 4.7,
                    imagen: null
                },
                {
                    id: 2,
                    nombre: "Auriculares Inalámbricos",
                    descripcion: "Sonido de alta calidad con cancelación de ruido activa.",
                    precio: 199.99,
                    puntuacion: 4.5,
                    imagen: null
                },
                {
                    id: 3,
                    nombre: "Tablet Multiusos",
                    descripcion: "Perfecta para trabajo y entretenimiento con pantalla de alta definición.",
                    precio: 349.99,
                    puntuacion: 4.3,
                    imagen: null
                },
                {
                    id: 4,
                    nombre: "Reloj Inteligente",
                    descripcion: "Monitoriza tu actividad física y notificaciones importantes.",
                    precio: 129.99,
                    puntuacion: 4.2,
                    imagen: null
                }
            ];
            
            // Para propósitos de demostración, mostrar datos de ejemplo
            // En un entorno real, esto no se incluiría
            mostrarRecomendaciones(datosEjemplo);
        });