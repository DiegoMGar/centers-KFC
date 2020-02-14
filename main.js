const fs = require("fs");
const title = fs.readFileSync("resources/title.ascii.txt", {
  encoding: "utf-8"
});
console.log(title);
