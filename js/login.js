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
            alert("Por favor, ingresa tu correo electrónico.");
            return;
        }

        try {
            const response = await fetch(API_USUARIOS);
            if (!response.ok) throw new Error("No se pudo conectar con la API de usuarios.");
            const data = await response.json();

            usuario = data.data.find(u => u.email === userEmail);

            if (!usuario) {
                alert("El correo no está registrado. Verifica tu correo o regístrate.");
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
            console.log("Respuesta API autenticación:", result);

            if (!sendToken.ok) throw new Error("Error al enviar el token al correo.");

            alert(`Se ha enviado un token a tu correo (${userEmail}).`);

            // Mostrar campo del token
            tokenStep.style.display = "block";
            btnVerifyToken.style.display = "block";
            // Ocultar paso del correo
            emailStep.style.display = "none";
            btnVerifyEmail.style.display = "none";

        } catch (error) {
            console.error("Error al verificar el correo:", error);
            alert("Ocurrió un error: " + error.message);
        }
    });

    // 3️⃣ Verificar token real desde la API
    btnVerifyToken.addEventListener("click", async () => {
        const tokenIngresado = tokenInput.value.trim();

        if (!tokenIngresado) {
            alert("Por favor, ingresa el token enviado a tu correo.");
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
                alert("El token ha expirado. Solicita uno nuevo.");
                return;
            }

            if (tokenIngresado === tokenReal) {
                alert("Inicio de sesión exitoso 🎉");
                localStorage.setItem("usuario", JSON.stringify({
                    nombre: usuario.nombre_completo,
                    email: usuario.email
                }));
                window.location.href = "index.html";
            } else {
                alert("Token incorrecto. Verifica e inténtalo de nuevo.");
            }

        } catch (error) {
            console.error("Error al verificar el token:", error);
            alert("Ocurrió un error al verificar el token: " + error.message);
        }
    });
});
