function main() {
  document.querySelector("#value-table").innerHTML = "";
  document.querySelector("#variation-table").innerHTML =
    "<thead><tr><th>Интервал</th><th>Частота</th></tr></thead><tbody></tbody>";
  Chart.helpers.each(Chart.instances, function (instance) {
    instance.destroy();
  });

  function generateRandomVariable() {
    let x = 0;
    for (let i = 0; i < 12; i++) {
      x += Math.random();
    }
    x -= 6;
    return x;
  }

  function transformToNormalDistribution(x, m, sigma) {
    return sigma * x + m;
  }

  function calculateIntervalBounds(data, numIntervals) {
    let minValue = Math.min.apply(null, data);
    let maxValue = Math.max.apply(null, data);
    let intervalSize = (maxValue - minValue) / numIntervals;
    let bounds = [];
    let currentBound = minValue;
    for (let i = 0; i < numIntervals; i++) {
      bounds.push(currentBound);
      currentBound += intervalSize;
    }
    bounds.push(maxValue + 1); // Add one to include the upper bound
    return bounds;
  }

  function createVariationSeries(data, bounds) {
    let variationSeries = new Array(bounds.length).fill(0);
    for (let i = 0; i < data.length; i++) {
      let value = data[i];
      for (let j = 0; j < bounds.length - 1; j++) {
        if (value >= bounds[j] && value < bounds[j + 1]) {
          variationSeries[j]++;
          break;
        }
      }
    }
    return variationSeries;
  }

  function calculateGaussianDensity(x, m, sigma) {
    let exponent = -Math.pow(x - m, 2) / (2 * Math.pow(sigma, 2));
    let coefficient = 1 / (sigma * Math.sqrt(2 * Math.PI));
    return coefficient * Math.exp(exponent);
  }

  // Генерация случайных значений
  let numValues = parseInt(document.querySelector(".count-input").value);
  let generatedData = [];
  let randomArray = [];
  for (let i = 0; i < numValues; i++) {
    let randomVariable = generateRandomVariable();
    randomArray.push(randomVariable);
    let normalVariable = transformToNormalDistribution(randomVariable, 4, 1);
    generatedData.push(normalVariable);
  }

  const row1 = document.createElement("tr");
  const row2 = document.createElement("tr");
  const row3 = document.createElement("tr");

  t1 = document.createElement("td");
  t2 = document.createElement("td");
  t3 = document.createElement("td");
  t1.textContent = "№ испытания";
  t2.textContent = "N(0, 1)";
  t3.textContent = "N(𝜇, σ)";
  row1.appendChild(t1);
  row2.appendChild(t2);
  row3.appendChild(t3);

  for (let i = 0; i < generatedData.length; i++) {
    const cell1 = document.createElement("td");
    const cell2 = document.createElement("td");
    const cell3 = document.createElement("td");
    cell1.textContent = i; // Номер испытания
    cell2.textContent = randomArray[i].toFixed(2); // Результат розыгрыша
    cell3.textContent = generatedData[i].toFixed(2);

    row1.appendChild(cell1);
    row2.appendChild(cell2);
    row3.appendChild(cell3);
  }
  document.getElementById("value-table").appendChild(row1);
  document.getElementById("value-table").appendChild(row2);
  document.getElementById("value-table").appendChild(row3);

  // Расчет интервального вариационного ряда
  let numIntervals = Math.floor(Math.log(numValues));
  let bounds = calculateIntervalBounds(generatedData, numIntervals);
  let variationSeries = createVariationSeries(generatedData, bounds);

  // Вывод результатов интервального вариационного ряда
  let tableBody = document
    .getElementById("variation-table")
    .getElementsByTagName("tbody")[0];
  for (let i = 0; i < numIntervals; i++) {
    let newRow = document.createElement("tr");
    let intervalCell = document.createElement("td");
    intervalCell.textContent =
      "[" + bounds[i].toFixed(2) + ", " + bounds[i + 1].toFixed(2) + ")";
    let frequencyCell = document.createElement("td");
    frequencyCell.textContent = variationSeries[i];
    newRow.appendChild(intervalCell);
    newRow.appendChild(frequencyCell);
    tableBody.appendChild(newRow);
  }

  // Построение гистограммы
  let histogramCtx = document.getElementById("histogram").getContext("2d");
  let labels = bounds.slice(0, bounds.length - 1).map(function (value, index) {
    return "[" + value.toFixed(2) + ", " + bounds[index + 1].toFixed(2) + ")";
  });
  let histogramData = {
    labels: labels,
    datasets: [
      {
        label: "Частота",
        data: variationSeries,
        backgroundColor: "rgba(0, 123, 255, 0.5)",
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 1,
      },
    ],
  };
  let histogramOptions = {
    scales: {
      y: {
        beginAtZero: true,
        stepSize: 1,
      },
    },
  };
  let histogramChart = new Chart(histogramCtx, {
    type: "bar",
    data: histogramData,
    options: histogramOptions,
  });

  // Построение графика плотности вероятности
  let densityPlotCtx = document.getElementById("density-plot").getContext("2d");
  let densityPlotLabels = [];
  let densityPlotData = [];
  let step = (bounds[bounds.length - 1] - bounds[0]) / 100;
  for (let i = bounds[0]; i < bounds[bounds.length - 1]; i += step) {
    densityPlotLabels.push(i.toFixed(2));
    let density = calculateGaussianDensity(i, 4, 1);
    densityPlotData.push(density.toFixed(4));
  }
  let densityPlotConfig = {
    type: "line",
    data: {
      labels: densityPlotLabels,
      datasets: [
        {
          label: "Плотность вероятности",
          data: densityPlotData,
          backgroundColor: "rgba(0, 123, 255, 0.5)",
          borderColor: "rgba(0, 123, 255, 1)",
        },
      ],
    },
    options: {},
  };
  let densityPlotChart = new Chart(densityPlotCtx, densityPlotConfig);
}

main();

document.querySelector(".count-button").addEventListener("click", () => {
  main();
});
