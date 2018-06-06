let port = process.env.PORT || 8080;
let express = require('express');
let compression = require('compression');
let app = express();
let fetch = require('node-fetch');

app.use(compression());
app.use(express.static(__dirname + '/src'));


let browserstackJobs = [];
let lastBuildOil = {};
let lastBuildOilBackend = {};
let lastStateOil = {};
let lastStateOilBackend = {};


function loadBrowserstackJobs() {
    fetch('https://jenkins.ipool.asideas.de/view/OIL%20Browsers/api/json?tree=jobs[name,color]')
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {
            browserstackJobs = myJson.jobs;
        });
}

function loadLastBuildJobs() {
    fetch('https://jenkins.ipool.asideas.de/view/OIL%20Project/job/OIL-Build/lastBuild/api/json?tree=result,timestamp')
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {
            lastBuildOil = myJson;
        });
    fetch('https://jenkins.ipool.asideas.de/view/OIL%20Project/job/OIL-BACKEND-Build/lastBuild/api/json?tree=result,timestamp')
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {
            lastBuildOilBackend = myJson;
        });
}

function loadLastState() {
    fetch('https://oil-backend.herokuapp.com/oil/api/userViewLocales/enEN_01')
        .then((response) => {
            if (response.ok) {
                lastStateOilBackend = {ok: true}
            } else {
                lastStateOilBackend = {error: true}
            }
        })
    fetch('https://oil.axelspringer.com')
        .then((response) => {
            if (response.ok) {
                lastStateOil = {ok: true}
            } else {
                lastStateOil = {error: true}
            }
        })
}


function refresh() {
    loadBrowserstackJobs();
    loadLastBuildJobs();
    loadLastState();
}

refresh();

setInterval(refresh, 120 * 1000);

app.route('/api/browserstack')
    .get((req, res) => {
            res.json({jobs: browserstackJobs});
        }
    );


app.route('/api/build/oil')
    .get((req, res) => {
            res.json(lastBuildOil);
        }
    );

app.route('/api/build/oil-backend')
    .get((req, res) => {
            res.json(lastBuildOilBackend);
        }
    );

app.route('/api/state/oil')
    .get((req, res) => {
            res.json(lastStateOil);
        }
    );

app.route('/api/state/oil-backend')
    .get((req, res) => {
            res.json(lastStateOilBackend);
        }
    );


app.get('*', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
});


app.listen(port, function () {
    console.log('server is now starting on port ', port);
});


