document.addEventListener("DOMContentLoaded", () => {
    const userInfo = document.getElementById("user-info");
    const userName = document.getElementById("user-name");
    const logoutBtn = document.getElementById("logout-btn");

    // 🔹 Verificar si hay usuario logeado en localStorage
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (usuario) {
        // Mostrar info del usuario
        userName.textContent = `${usuario.nombre}`;
        userInfo.style.display = "flex";

        // Estilo rápido
        userInfo.style.alignItems = "center";
        userInfo.style.gap = "10px";
    } else {
        // Si no hay sesión, ocultar el contenedor
        userInfo.style.display = "none";
    }

    // 🔹 Botón de cerrar sesión
    logoutBtn.addEventListener("click", () => {
        const confirmLogout = confirm("¿Deseas cerrar sesión?");
        if (confirmLogout) {
            localStorage.removeItem("usuario");
            alert("Sesión cerrada correctamente.");
            window.location.href = "index.html"; // Redirige al inicio
        }
    });
});
