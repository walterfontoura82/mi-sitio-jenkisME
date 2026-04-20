function actualizarHora() {
  const elementoHora = document.getElementById("hora-actual");

  if (!elementoHora) {
    return;
  }

  const ahora = new Date();
  elementoHora.textContent = ahora.toLocaleTimeString("es-AR");
}

function incrementarDeploys() {
  const elementoDeploys = document.getElementById("contador-deploys");

  if (!elementoDeploys) {
    return;
  }

  const deploysActuales = Number(localStorage.getItem("deploys") || "0") + 1;
  localStorage.setItem("deploys", String(deploysActuales));
  elementoDeploys.textContent = String(deploysActuales);
}

document.addEventListener("DOMContentLoaded", () => {
  incrementarDeploys();
  actualizarHora();
  setInterval(actualizarHora, 1000);
});
