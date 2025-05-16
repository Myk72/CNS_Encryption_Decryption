// server.js
const { createServer } = require("https");
const { parse } = require("url");
const fs = require("fs");
const path = require("path");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const port = 8443;
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert.crt")),
};
// console.log(httpsOptions)

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`✅ HTTPS server running at https://localhost:${port}`);
  });
});
