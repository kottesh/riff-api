const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/error-handler");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/song", require("./routes/song"));
app.use("/api/artist", require("./routes/artist"));
//app.use("/api/album", require("./routes/album"));
//app.use("/api/genre", require("./routes/genre"));

app.use(errorHandler);

module.exports = app;
