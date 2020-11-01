import express from "express";

import config from "../../config.json";

const app = express();

app.use("/static", express.static("static"));
app.use("/", express.static("pages"));

app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
});
