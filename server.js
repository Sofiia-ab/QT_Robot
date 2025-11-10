
// ----------------------------------------[ Constants initialization in Server scope ]--------------------------------------- //

// Declaration and initialization of needed Constants and variables
const express   = require("express");     // 'express' is installed, if not, run: $ npm install express
const path      = require('path');        // to easily join directory and file path, plus other methods
const cors      = require('cors');        // Enable Cross-Origin Requests
const readline  = require('readline');    // Enable the server to get/post input or output on the terminal
const net       = require('net');         // Enable the socket availability check
const app       = express();              // Correspond to the express Application

// ----------------------------------------[ Constants initialization in Server scope ]--------------------------------------- //

// define a method to easily colorize text output
const colorize = (...args) => ({
  black:    `\x1b[30m${args.join(" ")}\x1b[0m`,
  red:      `\x1b[31m${args.join(" ")}\x1b[0m`,
  green:    `\x1b[32m${args.join(" ")}\x1b[0m`,
  yellow:   `\x1b[33m${args.join(" ")}\x1b[0m`,
  blue:     `\x1b[34m${args.join(" ")}\x1b[0m`,
  magenta:  `\x1b[35m${args.join(" ")}\x1b[0m`,
  cyan:     `\x1b[36m${args.join(" ")}\x1b[0m`,
  white:    `\x1b[37m${args.join(" ")}\x1b[0m`,
  bgBlack:  `\x1b[40m${args.join(" ")}\x1b[0m`,
  bgRed:    `\x1b[41m${args.join(" ")}\x1b[0m`,
  bgGreen:  `\x1b[42m${args.join(" ")}\x1b[0m`,
  bgYellow: `\x1b[43m${args.join(" ")}\x1b[0m`,
  bgBlue:   `\x1b[44m${args.join(" ")}\x1b[0m`,
  bgMagenta:`\x1b[45m${args.join(" ")}\x1b[0m`,
  bgCyan:   `\x1b[46m${args.join(" ")}\x1b[0m`,
  bgWhite:  `\x1b[47m${args.join(" ")}\x1b[0m`
});

// --------------------------------------------[ Starting Website Server on Port ]-------------------------------------------- //

// Access command-line arguments (process.argv)
// Ignore the first two default args (corresponding to 'node'->argv[0] and 'server.js'->argv[1])
const args      = process.argv.slice(2);
const defport = process.env.PORT || '8000';
let port        = defport;

(async () => {
  port = await getPort(args[0]); // The argument 0 is the port (if any)
  port = await getAvailablePort(port);
  startServer(port);
})();

// -------------------------------------[ Functions Declaration (Server Initialization) ]------------------------------------- //

function startServer(port) {
  // Here you can start your server logic using the port number
  // Example:
  console.log(`Starting server...`);
  // Initialize the app with all the needed directories to work properly
  initPathUsed();
  // Send the Home page (HTML file) on the client side
  initSendHomePage();
  // Start the server
  app.listen(port, () => {
    const url = `http://localhost:${port}`;
    // Print the url to use to access the website (hyperlink line)
    console.log(`Server is running at \x1b]8;;${url}\x1b\\${colorize(url).cyan}\x1b]8;;\x1b\\`);
    // Also print this line in case the hyperlink's escape characters are not supported in terminal
    console.log(`(If the link isn't clickable, you can visit ${colorize(url).cyan} manually.)`);
  });
}

function initPathUsed() {
  // Serve code files from the "src" folder
  app.use('/src', express.static(path.join(__dirname, 'src')));
  
  // Serve static files from the "res" folder (including subfolders)
  app.use('/res', express.static(path.join(__dirname, 'res')));
  
  // Serve dev files from the "test" folder
  app.use('/test', express.static(path.join(__dirname, 'test')));

  // Middleware to parse JSON
  app.use(express.json());
  app.use(cors()); 
}

function initSendHomePage() {
  // Route to serve the index.html (or other HTML files) from the src folder
  app.get('/', (req, res) => {
  //  res.sendFile(path.join(__dirname, 'src', 'index.html'));  // Serve the index.html
    res.sendFile(path.join(__dirname, 'src', 'index.html'));  // Serve the index.html
  });
}
app.get('/:nom', function(req, res) {
  {
  res.sendFile(path.join(__dirname, 'src', req.params.nom));}
});

app.get('/src/:nom', function(req, res) {
  {
  res.sendFile(path.join(__dirname, 'src', req.params.nom));}
});

app.get('/test/:nom', function(req, res) {
  {
  res.sendFile(path.join(__dirname, 'test', req.params.nom));}
});
app.get('/res/:nom', function(req, res) {
  {
  res.sendFile(path.join(__dirname, 'res', req.params.nom));}
});

function isPortValid(port) {
    return port.match(/^\d+$/);
}

/**
 * Check if a given port is correct.
 * @param {string} port - The port number to check.
 * @returns {Promise<number>} - Resolves to the 'port' number if matching the format, asking for user input while incorrect.
 */
function getPort(port) {
  return new Promise((resolve) => {
    if (!port) {
      return resolve(parseInt(defport));
    }
    port = '' + port;
    if (isPortValid(port)) {
      return resolve(parseInt(port)); // ✅ If valid, return immediately
    }

    // Create readline interface
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Ask for user input
    rl.question(`${colorize('Invalid port!...').red} (${port})\nPlease provide a port number or <${colorize(defport).cyan}>: `, (answer) => {
      rl.close();
      resolve(getPort(answer || defport)); // ❌ Recursive call if input is invalid
    });
  });
}

/**
 * Check if a given port is available.
 * @param {number} port - The port number to check.
 * @returns {Promise<number>} - Resolves to the 'port' number if available, increase by +1 the port number until it's
 *                              available if not.
 */
function getAvailablePort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(getAvailablePort(port+1)); // ❌ Port is in use
      } else {
        resolve(getAvailablePort(port+1)); // ❌ Other errors (should not happen often)
      }
    });
    server.once('listening', () => {
      server.close(() => resolve(port)); // ✅ Port is available
    });
    server.listen(port, '0.0.0.0'); // Try to listen on the port
  });
}
