const urlDev = 'url';
const urlInt = 'url';
const urlQa = 'url';
const urlPre = 'url';

const veciHosts = [
  {
    stage: "dev",
    host: urlDev,
  },
  {
    stage: "int",
    host: urlInt,
  },
  {
    stage: "qa",
    host: urlQa,
  },
  {
    stage:"pre",
    host: urlPre,
  },
];

module.exports.veciHosts = veciHosts;