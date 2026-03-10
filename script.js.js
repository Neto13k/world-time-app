const form = document.querySelector("form"); // seleção dos elementos
const cidadeDisplay = document.getElementById("cidade-display");
const dataDisplay = document.getElementById("data-display");
const horaDisplay = document.getElementById("hora-display");

let interval; //Armazenamento para o set interval

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cidade = document.getElementById("nome").value.trim();

  if (!cidade) return;

  try {
    // Buscando coordenadas da cidade
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${cidade}&count=1&language=pt&format=json`,
    );

    const geoData = await geoRes.json();
    
    //validação caso não encontrar resultado

    if (!geoData.results) {
      cidadeDisplay.innerText = "Cidade não encontrada";
      horaDisplay.innerText = "";
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    cidadeDisplay.innerText = `${name}, ${country}`;

    // Buscar hora usando timezone
    const timeRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`,
    );

    const timeData = await timeRes.json();

    const timezone = timeData.timezone;

    atualizarRelogio(timezone);
  } catch (err) {
    cidadeDisplay.innerText = "Erro ao buscar cidade";
    horaDisplay.innerText = "";
    dataDisplay.innerText = "";
  }
});

function atualizarRelogio(timezone) {
  if (interval) clearInterval(interval);

  function render() {
    const agora = new Date();

    // Formatação da Data
    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
      timeZone: timezone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(agora);

    // Formatação da Hora
    const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(agora);

    dataDisplay.innerText = dataFormatada; // Exibe a data
    horaDisplay.innerText = horaFormatada; // Exibe a hora
  }

  render(); // execução 
  interval = setInterval(render, 1000); // atualização a cada minuto.
}
