const fs = require("fs");
const title = fs.readFileSync("resources/title.ascii.txt", {
  encoding: "utf-8"
});
console.log(title);
const consumerTitle = fs.readFileSync("resources/eventsource.ascii.txt", {
  encoding: "utf-8"
});
console.log(consumerTitle);
/**
 * lAUNCH DATA WRITE ON PROGRAM EXITS
 */
process.on('exit', () => {
  fs.writeFileSync('output/result_' + helperDateTimeKey(new Date()) + '.json', JSON.stringify(result, null, 2))
});

const EventSource = require('eventsource');
const veciHosts = require('./config/VECI/config');

const result = {};
veciHosts.veciHosts.forEach(elem => {
  const eventSourceDev = new EventSource(elem.host);
  eventSourceDev.onmessage = eventSourceOnmessage(elem.stage);
  eventSourceDev.onerror = eventSourceError(elem.stage);
  result[elem.stage] = {};
});

let timer;
let colisiones = 0;

function setTimer() {
  colisiones++;
  const seconds = 10;
  console.log(`Empieza la cuenta atrás... ${seconds} segundos.`);
  timer = setTimeout(() => {
    console.log(`\t${colisiones} colisiones.`);
    printResult(result);
    process.exit();
  }, seconds * 1000);
}

function helperDateKey(date) {
  const dateObj = new Date(date);
  return dateObj.getFullYear() + '-' +
    (dateObj.getMonth() + 1).toString().padStart(2, '0') + '-' +
    dateObj.getDate().toString().padStart(2, '0');
}

function helperDateTimeKey(date) {
  const dateObj = new Date(date);
  return helperDateKey(date) + '_' + dateObj.getHours().toString().padStart(2, '0') +
    '.' + dateObj.getMinutes().toString().padStart(2, '0') +
    '.' + dateObj.getSeconds().toString().padStart(2, '0');
}

function eventSourceError(stage) {
  return (err) => {
    fs.writeFileSync('output/error/error_' + helperDateTimeKey(new Date()) + '.json', JSON.stringify(err, null, 2));
  };
}

function eventSourceOnmessage(stage) {
  return (event) => {
    if (!result[stage]) {
      result[stage] = {};
    }
    try {
      const data = JSON.parse(event.data);
      if (data.type) {
        if (!result[stage][data.type]) result[stage][data.type] = {};
        const innerData = JSON.parse(data.data);
        if (innerData && innerData.eventMetadata) {
        }
        if (innerData && innerData.eventMetadata && innerData.eventMetadata.eventDate) {
          if (!result[stage][data.type][helperDateKey(innerData.eventMetadata.eventDate)]) {
            result[stage][data.type][helperDateKey(innerData.eventMetadata.eventDate)] = {};
          }
          if (!result[stage][data.type][helperDateKey(innerData.eventMetadata.eventDate)][innerData.eventMetadata.eventDate]) {
            result[stage][data.type][helperDateKey(innerData.eventMetadata.eventDate)][innerData.eventMetadata.eventDate] =
              {
                idAction: data.idAction,
                innerData,
              };
          } else if (!timer) {
            // COLISIONA AL MENOS UNO, SE LANZA EL TIMEOUT EN CASO DE NO HABERSE LANZADO YA
            setTimer();
          } else {
            colisiones++;
          }
        } else {
          writeTrash('noEventDate_', data);
        }
      } else {
        writeTrash('noType_', data);
      }
    } catch (err) {
      console.log(err);
    }
  }
}

function printResult(result) {
  const now = new Date();
  let fechaStr = '# ' + now.getFullYear().toString() + '-' +
    (now.getMonth() + 1).toString().padStart(2, '0') + '-' +
    now.getDate().toString().toString().padStart(2, '0');
  fechaStr += ' ' + now.getHours().toString().padStart(2, '0') + ':' +
    now.getMinutes().toString().padStart(2, '0') + ':' +
    now.getSeconds().toString().padStart(2, '0');
  console.log(fechaStr);
  // ITERACIÓN DE STAGE
  Object.keys(result).forEach(stage => {
    console.log("Stage: ", stage);
    // ITERACIÓN DE TYPE
    Object.keys(result[stage]).forEach(type => {
      console.log("  Type: ", type);
      // ITERACIÓN DE AGRUPACIÓN POR DÍA
      Object.keys(result[stage][type]).forEach(group => {
        console.log(`    Cantidad de ${stage}/${type}/${group}:`, Object.keys(result[stage][type][group]).length)
      });
      console.log("\n");
    });
    console.log('----------\n');
  });
}

function writeTrash(prefix, content) {
  try {
    fs.writeFileSync(`output/trash/${prefix}` + helperDateTimeKey(new Date()) + '.json', JSON.stringify(content, null, 2));
  } catch (err) {
    fs.writeFileSync(`output/trash/${prefix}` + helperDateTimeKey(new Date()) + '.json', content);
  }
}