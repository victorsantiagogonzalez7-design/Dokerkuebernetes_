document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email");
    const tokenInput = document.getElementById("token");
    const emailStep = document.getElementById("email-step");
    const tokenStep = document.getElementById("token-step");
    const btnVerifyEmail = document.getElementById("verify-email");
    const btnVerifyToken = document.getElementById("verify-token");

    const API_USUARIOS = "http://34.58.87.183/api/usuarios";
    const API_AUTENTICACION = "http://34.56.85.127/enviar-token";
    const API_VERIFICAR_TOKEN = "http://34.56.85.127/token-enviado?correo=";

    let userEmail = "";
    let usuario = {};

    // 1️⃣ Verificar si el correo existe en la API de usuarios
    btnVerifyEmail.addEventListener("click", async () => {
        userEmail = emailInput.value.trim();

        if (!userEmail) {
            showModal("Por favor, ingresa tu correo electrónico.");
            return;
        }

        try {
            const response = await fetch(API_USUARIOS);
            if (!response.ok) throw new Error("No se pudo conectar con la API de usuarios.");
            const data = await response.json();

            usuario = data.data.find(u => u.email === userEmail);

            if (!usuario) {
                showModal("El correo no está registrado. Verifica tu correo o regístrate.");
                return;
            }

            // 2️⃣ Enviar token real al correo mediante la API de autenticación
            const sendToken = await fetch(API_AUTENTICACION, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    correo: userEmail,
                    tipo: "registro"
                })
            });

            const result = await sendToken.text();
            //console.log("Respuesta API autenticación:", result);

            if (!sendToken.ok) throw new Error("Error al enviar el token al correo.");

            showModal(`Se ha enviado un token a tu correo (${userEmail}).`);

            // Mostrar campo del token
            tokenStep.style.display = "block";
            btnVerifyToken.style.display = "block";
            // Ocultar paso del correo
            emailStep.style.display = "none";
            btnVerifyEmail.style.display = "none";

        } catch (error) {
            console.error("Error al verificar el correo:", error);
            showModal("Ocurrió un error: " + error.message);
        }
    });

    // 3️⃣ Verificar token real desde la API
    btnVerifyToken.addEventListener("click", async () => {
        const tokenIngresado = tokenInput.value.trim();

        if (!tokenIngresado) {
            showModal("Por favor, ingresa el token enviado a tu correo.");
            return;
        }

        try {
            const response = await fetch(API_VERIFICAR_TOKEN + encodeURIComponent(userEmail));
            if (!response.ok) throw new Error("No se pudo verificar el token.");

            const tokenData = await response.json();
            console.log("Token desde API:", tokenData);

            const tokenReal = tokenData.token;
            const expiracion = new Date(tokenData.expira);
            const ahora = new Date();

            if (ahora > expiracion) {
                showModal("El token ha expirado", "warning");
                return;
            }

            if (tokenIngresado === tokenReal) {
                showModal("Inicio de sesión exitoso 🎉", "success");
                localStorage.setItem("usuario", JSON.stringify({
                    id: usuario.id,
                    nombre: usuario.nombre_completo,
                    email: usuario.email
                }));
                window.location.href = "index.html";
            } else {
                showModal("Token incorrecto. Verifica e inténtalo de nuevo.");
            }

        } catch (error) {
            console.error("Error al verificar el token:", error);
            showModal("Error al verificar el token", "error" + error.message);
        }
    });

    function showModal(message, type = 'info') {
        const modal = document.getElementById('notificationModal');
        const modalMessage = document.getElementById('modalMessage');
        const modalTitle = document.getElementById('modalTitle');
        const modalHeader = document.querySelector('.modal-header');

        // Resetear estilos
        modalHeader.style.backgroundColor = '#f8f9fa';

        // Configurar según el tipo
        switch (type) {
            case 'error':
                modalTitle.textContent = 'Error';
                modalHeader.style.backgroundColor = '#f8d7da';
                break;
            case 'success':
                modalTitle.textContent = '¡Éxito!';
                modalHeader.style.backgroundColor = '#d1edff';
                break;
            case 'warning':
                modalTitle.textContent = 'Advertencia';
                modalHeader.style.backgroundColor = '#fff3cd';
                break;
            default:
                modalTitle.textContent = 'Notificación';
        }

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
