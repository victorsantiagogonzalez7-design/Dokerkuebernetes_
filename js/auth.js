document.addEventListener("DOMContentLoaded", () => {
    const loginIcon = document.querySelector(".login-icon");
    const userInfo = document.getElementById("user-info");
    const userName = document.getElementById("user-name");
    const logoutBtn = document.getElementById("logout-btn");

    // 🔹 Verificar si hay usuario logeado en localStorage
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (usuario && usuario.nombre) {
        // Mostrar info del usuario
        loginIcon.style.display = "none";
        userName.textContent = `${usuario.nombre}`;
        userInfo.style.display = "flex";

        // Estilo rápido
        userInfo.style.alignItems = "center";
        userInfo.style.gap = "10px";
    } else {
        // Si no hay sesión, ocultar el contenedor
        loginIcon.style.display = "flex";
        userInfo.style.display = "none";
    }

    // 🔹 Botón de cerrar sesión
    logoutBtn.addEventListener("click", () => {
        const confirmLogout = confirm("¿Deseas cerrar sesión?");
        if (confirmLogout) {
            localStorage.removeItem("usuario");
            alert("Sesión cerrada correctamente.");
            loginIcon.style.display = "flex";
            userInfo.style.display = "none";
            window.location.href = "index.html"; // Redirige al inicio
        }
    });
});
