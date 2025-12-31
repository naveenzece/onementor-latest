const https = require("https");
const fs = require("fs");
const next = require("next");

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/onementor.in/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/onementor.in/fullchain.pem"),
};

app.prepare().then(() => {
    https.createServer(options, (req, res) => {
        handle(req, res);
    }).listen(443, () => {
        console.log("✅ HTTPS Next.js running on port 443");
    });
});
