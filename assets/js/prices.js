//TODO import chart.js

window.addEventListener("DOMContentLoaded", (event) => {
  //Chart for the prices

  //Loading the Graph.
  const pricesChart = document.getElementById("PricesChart");

  const VERBOSE = true;
  const webToday = true;
  const webTomorrow = false;
  const webPrecios = document.getElementsByClassName("webPrecios");
  const DOMAIN = "https://app.energia.guru";

  // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
  let vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty("--vh", `${vh}px`);

  if (pricesChart) {
    Chart.defaults.font.family = "'Source Sans Pro', sans-serif";
    const graphOptions = {
      type: "bar",
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              minRotation: 0,
              maxRotation: 0,
              font: {
                size: 14,
                weight: "600",
              },
            },
          },
          y: {
            title: {
              display: false,
              text: "€/kWh",
              align: "end",
              padding: 0,
            },
            ticks: {
              font: {
                size: 14,
                weight: "600",
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.formattedValue} €/kWh`;
              },
              title: function (context) {
                return `${context[0].label}:00-${+context[0].label + 1}:00`;
              },
            },
          },
          legend: {
            display: false,
            position: "bottom",
            labels: {
              fontSize: 13,
              padding: 15,
              boxWidth: 12,
            },
          },
          title: {
            display: true,
            align: "start",
            padding: 6,
            text: "€/kWh",
          },
        },
      },
    };

    var verticalDemoChart = new Chart(pricesChart, graphOptions);
  }
  // Getting dates
  const today = new Date();
  let tdy = today.toISOString().split("T")[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1); //! OJO
  const tmr = tomorrow.toISOString().split("T")[0];

  const updatePrices = (data) => {
    const titleToday = document.getElementById("titleToday");
    const textToday = document.getElementById("textToday");

    if (VERBOSE) console.log("Updated prices data: ", data);

    // let chipEstimadoEl;
    //Extracting data from response
    // if (webTomorrow) {
    //   //Si estamos en la web de manana cambiamos el objeto de precios
    //   tdy = tmr;
    //   //Hide chipestiamdo in any case
    //   chipEstimadoEl = document.getElementById("chipEstimado");
    //   if (chipEstimadoEl) {
    //     chipEstimadoEl.style.display = "none";
    //   }
    // }

    if (VERBOSE) console.log("data[tdy]: ", data[tdy]);

    // Corner case: there is no data yet

    if (!data[tdy]) {
      titleToday.innerHTML =
        "No hay datos todavía, a partir de las 14:00h tendremos la primera estimación de precios para mañana...";
      textToday.innerHTML = "";
      pricesChart.style.display = "none";
      //document.querySelectorAll(".fa-spinner").forEach((el) => (el.style.display = "none"));
      //document.getElementById("chart-container").innerHTML = "";
      //document.getElementById("card-resumen").style.height = 129 + "px";
      const adContainer = document.getElementById("ad-container");
      if (adContainer) {
        adContainer.style.display = "block"; //TODO repasar
        adContainer.innerHTML = ``;
      }
      return;
    }

    const pricesEKWh = [...data[tdy].values].map((el) => el / 1000);
    const pricesEKWh_len = pricesEKWh.length;
    const maxPriceHour = data[tdy].maxPriceHour;
    const optPriceHour = data[tdy].optPriceHour;
    //optPriceHourShare = optPriceHour;
    //if (VERBOSE) console.log("optPriceHourShare: ", optPriceHourShare);
    const minPriceHour = data[tdy].minPriceHour;
    const maxPrice = data[tdy].maxPrice;
    const optPrice = data[tdy].optPrice;
    const minPrice = data[tdy].minPrice;

    const estimado = data[tdy].estimado == true || false;

    const calcAvg = (vector) => vector.reduce((acc, val) => acc + val, 0) / vector.length;
    const avgPrice = calcAvg([...data[tdy].values]);

    if (VERBOSE) console.log("avgPrice: ", avgPrice);

    //Preparing Top info Card
    if (titleToday) {
      titleToday.innerHTML = webTomorrow
        ? "Mañana, " + tomorrow.toLocaleString("es-ES", { dateStyle: "long" })
        : "Hoy, " + today.toLocaleString("es-ES", { dateStyle: "long" });

      // textToday.innerHTML = `Hora <span class="color-cara precio">más cara: ${maxPriceHour}:00 - ${
      //   maxPriceHour + 1
      // }:00 ${maxPriceHour > 12 ? "PM" : "AM"} </span><br>`;
      // textToday.innerHTML += `Hora <span class="color-highlight precio">óptima: ${optPriceHour}:00 - ${
      //   optPriceHour + 1
      // }:00 ${optPriceHour > 12 ? "PM" : "AM"} </span><br>`;
      // textToday.innerHTML += `Hora <span class="color-barata precio">más barata: ${minPriceHour}:00 - ${
      //   minPriceHour + 1
      // }:00 ${minPriceHour > 12 ? "PM" : "AM"} </span><br>`;

      textToday.innerHTML = `<span class="color-cara precio">Más cara: ${maxPriceHour}:00 ${
        maxPriceHour > 12 ? "PM" : "AM"
      } </span><br>`;
      textToday.innerHTML += `<span class="color-highlight precio">Óptima: ${optPriceHour}:00 ${
        optPriceHour > 12 ? "PM" : "AM"
      } </span><br>`;
      textToday.innerHTML += `<span class="color-barata precio">Más barata: ${minPriceHour}:00 ${
        minPriceHour > 12 ? "PM" : "AM"
      } </span><br>`;
    }

    //Preparing info day

    // Nuevos Criterios para Clasificar los Precios

    // •	Caro: Precio > 309.62 €/MWh
    // •	Normal: 96.13 €/MWh <= Precio <= 309.62 €/MWh
    // •	Barato: Precio < 96.13 €/MWh

    let textInfoday = "";
    const circlePricesCont = document.getElementById("circlePrices");
    if (circlePricesCont) {
      if (avgPrice < 96.13) {
        textInfoday = "Día barato";
        circlePricesCont.innerHTML = "<i class='fas fa-check-circle' style='color:rgba(153,204,0,0.8)'></i>";
      } else if (avgPrice > 309.62) {
        textInfoday = "Día caro";
        circlePricesCont.innerHTML = "<i class='fas fa-exclamation-circle' style='color:rgba(255,68,68,0.8)'></i>";
      } else {
        textInfoday = "Día normal";
        circlePricesCont.innerHTML = "<i class='fas fa-dot-circle' style='color:rgba(255,136,0,0.8)'></i>";
      }

      document.getElementById("textDiaPrice").innerText = textInfoday;

      if (VERBOSE) console.log("textInfoday: ", textInfoday);
    }

    if (webPrecios.length > 0) {
      const badgePrices = document.getElementById("badgePrices");

      // Update date texts in necessary
      // Obtener la fecha actual
      const fechaActual = new Date();
      // Añadir un día a la fecha actual para obtener la fecha de mañana
      const manana = new Date(fechaActual);
      manana.setDate(fechaActual.getDate() + 1);

      // Formatear la fecha al estilo completo y en español de España
      const opciones = {
        day: "numeric", // Día en formato numérico
        month: "long", // Mes en formato completo
        year: "numeric", // Año en formato numérico
      };
      const fechaFormateada = fechaActual.toLocaleDateString("es-ES", opciones);
      const fechaFormateadaManana = manana.toLocaleDateString("es-ES", opciones);
      // Formatear la fecha al estilo completo y en español de España solo el dia
      const opcionesName = {
        weekday: "long", // Mes en formato completo
      };
      const fechaFormateadaName = fechaActual.toLocaleDateString("es-ES", opcionesName);
      const fechaFormateadaMananaName = manana.toLocaleDateString("es-ES", opcionesName);

      const dateTodayElements = document.getElementsByClassName("dateToday");
      const dateMananaElements = document.getElementsByClassName("dateTomorrow");
      if (dateTodayElements.length > 0 || dateMananaElements.length > 0) {
        for (let index = 0; index < dateTodayElements.length; index++) {
          const element = dateTodayElements[index];
          element.innerText = fechaFormateada;
        }
        for (let index = 0; index < dateMananaElements.length; index++) {
          const element = dateMananaElements[index];
          element.innerText = fechaFormateadaManana;
        }
      }
      const dateTodayElementsName = document.getElementsByClassName("dateTodayName");
      const dateMananaElementsName = document.getElementsByClassName("dateTomorrowName");
      if (dateTodayElementsName.length > 0 || dateMananaElementsName.length > 0) {
        for (let index = 0; index < dateTodayElementsName.length; index++) {
          const element = dateTodayElementsName[index];
          element.innerText = fechaFormateadaName;
        }
        for (let index = 0; index < dateMananaElementsName.length; index++) {
          const element = dateMananaElementsName[index];
          element.innerText = fechaFormateadaMananaName;
        }
      }

      // Completing the HTML page

      if (estimado) {
        // Text if is estimado
        badgePrices.innerText = "ESTIMADO";
        badgePrices.classList.remove("bg-highlight");
        badgePrices.classList.add("bg-yellow-light");

        const notaEstimado = document.getElementById("notaEstimado");
        if (notaEstimado) {
          notaEstimado.innerHTML = `
                <p class="pt-3">
                <span class="color-yellow-dark"><strong>⚠️ Atención:</strong></span> Estos precios son <strong>ESTIMADOS</strong> a partir de los resultados del mercado mayorista, que es un <strong>indicador avanzado</strong> de lo que pasará, pero pueden diferir tanto en valor como en las horas, respecto a los precios finales del PVPC que se publicarán a partir de las 20:15h. 
              </p>
              <p class="pt-1">
                El motivo de ello es que a los precios mayoristas hay que sumarles distintos servicios de ajuste que se van negociando a lo largo del día. <strong>Energia Guru predice, en todo caso, unos precios estimados</strong> en base al historico y la mejor información disponible.
              </p>
              <h2>Resumen</h2>
                `;
        }

        const notaEstimado2 = document.getElementById("notaEstimado2");
        if (notaEstimado2) {
          notaEstimado2.innerHTML = `
                <p class="pt-2">
                Ten en cuenta que estos datos son ESTIMADOS. Por favor, visita esta página a partir de las 20:15h para conocer los precios finales del PVPC para mañana.</p>
            `;
        }
      }

      const parrResumenHoy = document.getElementById("parrResumenHoy");
      if (parrResumenHoy) {
        parrResumenHoy.innerHTML = `El precio de la tarifa de la luz en el mercado regulado (PVPC) este ${fechaFormateada} es distinto con respecto al día
              anterior. El precio medio será de ${
                Math.round(avgPrice * 10) / 10000
              }€ euros el kilovatio hora (kWh). La hora más barata será
              entre las ${minPriceHour}h  y las ${
          minPriceHour + 1
        }h. Por el contrario, la franja a evitar será la comprendida entre las ${maxPriceHour}h y las ${
          maxPriceHour + 1
        }h.</p>
              <p class="pt-2"> En todo caso, la mejor hora para aprovechar a poner la lavadora o el horno será entre las ${optPriceHour}h y las ${
          optPriceHour + 1
        }h.`;
      }

      const parrResumenTomorrow = document.getElementById("parrResumenTomorrow");
      if (parrResumenTomorrow) {
        parrResumenTomorrow.innerHTML = `El precio medio de la luz en el mercado regulado del PVPC para ${fechaFormateadaManana} será<strong>${
          estimado ? ", de forma estimada, " : ", con los datos oficiales y actualizados, "
        }  de ${Math.round(avgPrice * 10) / 10000}€ euros el kilovatio hora (kWh)</strong>. La <strong>hora más barata${
          estimado ? " estimamos que " : ""
        } será
                entre las ${minPriceHour}h  y las ${
          minPriceHour + 1
        }h.</strong> Por el contrario, <strong>la franja a evitar será la comprendida entre las ${maxPriceHour}h y las ${
          minPriceHour + 1
        }h.</strong></p>
                <p class="pt-1"> En todo caso, <strong>la mejor hora para aprovechar a utilizar grandes consumos como la lavadora o el horno será${
                  estimado ? ", previsiblemente, " : ""
                } entre las ${optPriceHour}h y las ${optPriceHour + 1}h.</strong>
              `;
      }

      document.getElementById("tableResumenHoy").innerHTML = `
  <li class="color-cara"><i class="fas fa-coins"></i> Hora más cara ${maxPriceHour} - ${maxPriceHour + 1}h: ${
        Math.round(maxPrice * 10) / 10000
      }€/kWh</li>
  <li class="color-barata"><i class="fas fa-check"></i> Hora más barata ${minPriceHour} - ${minPriceHour + 1}h: ${
        Math.round(minPrice * 10) / 10000
      }€/kWh</li>
  <li class="color-highlight"><i class="fa fa-thumbs-up"></i> Hora óptima ${optPriceHour} - ${optPriceHour + 1}h: ${
        Math.round(optPrice * 10) / 10000
      }€/kWh</li>`;

      let tableHtml = "";

      const tramo = [
        "valle",
        "valle",
        "valle",
        "valle",
        "valle",
        "valle",
        "valle",
        "valle",
        "llano",
        "llano",
        "punta",
        "punta",
        "punta",
        "punta",
        "llano",
        "llano",
        "llano",
        "llano",
        "punta",
        "punta",
        "punta",
        "punta",
        "llano",
        "llano",
        "llano",
      ];

      data[tdy].values.forEach((e, i) => {
        tableHtml += `
                <tr>
                <th scope="row" itemprop="description" class=${
                  tramo[i] == "valle" ? "bg-green-dark" : tramo[i] == "llano" ? "bg-yellow-dark" : "bg-red-dark"
                }>${i} - ${i + 1} h</th>
                <td itemprop="price" class=${
                  tramo[i] == "valle" ? "bg-green-dark" : tramo[i] == "llano" ? "bg-yellow-dark" : "bg-red-dark"
                }>${Math.round(e * 10) / 10000} €/kWh</td>
                <meta itemprop="priceCurrency" content="EUR">
                </tr>`;
      });

      document.getElementById("tablePricesBody").innerHTML = tableHtml;
    }

    //Preparing the Graph
    verticalDemoChart.data.datasets = [{ data: pricesEKWh }];
    verticalDemoChart.data.labels = [...Array(pricesEKWh_len).keys()];
    let maxPriceHourBar = maxPriceHour;
    let optPriceHourBar = optPriceHour;
    let minPriceHourBar = minPriceHour;

    //Case of 13 or 25h a day (When DST time)
    if (pricesEKWh_len == 23) {
      verticalDemoChart.data.labels = [
        0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
      ];
      if (maxPriceHour >= 3) maxPriceHourBar = maxPriceHour - 1;
      if (optPriceHour >= 3) optPriceHourBar = optPriceHour - 1;
      if (minPriceHour >= 3) minPriceHourBar = minPriceHour - 1;
    } else if (pricesEKWh_len == 25) {
      verticalDemoChart.data.labels = [
        0, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
      ];
      if (maxPriceHour >= 3) maxPriceHourBar = maxPriceHour + 1;
      if (optPriceHour >= 3) optPriceHourBar = optPriceHour + 1;
      if (minPriceHour >= 3) minPriceHourBar = minPriceHour + 1;
    }
    // verticalDemoChart.options.scales.y.min = (minPrice / 1000) * 0.95;
    // verticalDemoChart.options.scales.y.max = (maxPrice / 1000) * 1.05;
    //Min and max of axis ending in 0 or 5
    verticalDemoChart.options.scales.y.min = Math.floor((minPrice * 0.98) / 50) * 0.05;
    verticalDemoChart.options.scales.y.max = Math.ceil((maxPrice * 1.02) / 50) * 0.05;

    // Colors of the bars
    const backgroundColorArray = [...Array(pricesEKWh_len).fill("rgba(255,255,255,1)")];
    backgroundColorArray[maxPriceHourBar] = "rgba(255,68,68,0.8)";
    backgroundColorArray[optPriceHourBar] = "rgba(255,136,0,0.8)";
    backgroundColorArray[minPriceHourBar] = "rgba(153,204,0,0.8)";
    verticalDemoChart.data.datasets[0].backgroundColor = backgroundColorArray;

    if (data[tdy].estimado && webTomorrow) {
      // Si los datos son estimados, mostramos chip de adevertencia y cambio de colores
      chipEstimadoEl.style.display = "block";
      new Tooltip(chipEstimadoEl);
      const backgroundColorArrayEstimado = [...Array(pricesEKWh_len).fill("rgba(223,223,223,0.5)")];
      backgroundColorArrayEstimado[maxPriceHourBar] = "rgba(255,68,68,0.6)";
      backgroundColorArrayEstimado[optPriceHourBar] = "rgba(255,136,0,0.6)";
      backgroundColorArrayEstimado[minPriceHourBar] = "rgba(153,204,0,0.6)";
      verticalDemoChart.data.datasets[0].backgroundColor = backgroundColorArrayEstimado;
    }

    //Updating the graph
    verticalDemoChart.update();

    pricesChart.style.display = "block";
    //document.querySelectorAll(".fa-spinner").forEach((el) => (el.style.display = "none"));
    //document.getElementsByClassName("summaryPrices")[0].classList.remove("d-none");
  };

  let networkResponse = false;
  let dataDisplayed;
  const dataURL = `${DOMAIN}/data/data.json`;

  //Retrieving prices data from Network and updating the web
  fetch(dataURL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (VERBOSE) console.log("From Network");
      // console.log("From Network res", res);
      caches.open("prices-data").then((cache) => {
        console.log("Saving on cache the Network response");
        cache.put(dataURL, res);
      });
      networkResponse = true;
      return res.clone().json(); // Clone the output to use it in PUT for the cache
    })
    .then((data) => {
      if (webToday && (dataDisplayed == undefined || !dataDisplayed[tdy])) {
        if (VERBOSE) console.log("Updating data from network...");
        if (VERBOSE) console.log("data[tdy]: ", data[tdy]);

        updatePrices(data);
      } else if (
        webTomorrow &&
        (dataDisplayed == undefined || !dataDisplayed[tmr] || (dataDisplayed[tmr].estimado && !data[tmr].estimado))
      ) {
        if (VERBOSE) console.log("Updating data from network...");
        updatePrices(data);
      } else {
        if (VERBOSE) console.log("Data displayed already updated");
      }
    })
    .catch((err) => {
      console.log(err);
    });

  //Retrieving prices data from Cache and updating the web
  if ("caches" in window) {
    //TODO cambiar a caches.match() directametne para el caso de precache
    caches.open("prices-data").then((cache) => {
      cache
        .match(dataURL)
        .then((res) => {
          if (res) {
            if (VERBOSE) console.log("From cache, networkResponse:", networkResponse);
            //console.log("From cache response", res);

            return res.json();
          }
        })
        .then((data) => {
          //Only update with cache only before network response or without network response
          // setTimeout(() => {
          //   console.log("networkResponse", networkResponse);
          //   if (!networkResponse) {
          //     console.log("Updating data from cache...");
          //     updatePrices(data);
          //   }
          // }, 2000); // Waiting 2 second to Update from cache
          //console.log("networkResponse", networkResponse);
          if (!networkResponse && data) {
            if (VERBOSE) console.log("Updating data from cache...");
            dataDisplayed = { ...data };
            //console.log("dataDisplayed: ", dataDisplayed);
            updatePrices(data);
          }
        })
        .catch((err) => {
          //console.log(err);
        });
    });
  }
});
