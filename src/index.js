const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routerApi = require("./routes");
let colors = require("colors");

// import auth

require("./utils/auth");

// E R R O R S
const {
  logErrors,
  errorHandler,
  boomErrorHandler,
  handleSQLError,
  handleFKError,
} = require("./middlewares/error.handler");
const { config } = require("./config");

const app = express();
const port = config.port;

app.use(express.json());

// M O R G A N

app.use(morgan("tiny"));

// CORS

const whiteList = [
  "http://localhost:8080",
  "https://indexa-inventario.onrender.com",
  "http://192.168.9.105",
  "http://192.168.3.107",
];

const options = {
  origin: (origin, callback) => {
    if (whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("no permitido"));
    }
  },
};

app.use(cors());

// Routers

routerApi(app);

// HANDLE ERROR
app.use(handleSQLError);
app.use(handleFKError);
app.use(boomErrorHandler);
app.use(logErrors);
app.use(errorHandler);

module.exports = app;

app.listen(port, () => console.log(colors.cyan("Listen on " + port)));
