let port = process.env.PORT || 8080;
let express = require('express');
let compression = require('compression');
let app = express();
let fetch = require('node-fetch');

app.use(compression());
app.use(express.static(__dirname + '/src'));


let browserstackJobs = [];
let lastBuild = {};


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
            lastBuild = myJson;
        });
}


function refresh() {
    loadBrowserstackJobs();
    loadLastBuildJobs();
}

refresh();

setInterval(refresh, 120 * 1000);

app.route('/api/browserstack')
    .get((req, res) => {
            res.json({jobs: browserstackJobs});
        }
    );


app.route('/api/build')
    .get((req, res) => {
            res.json(lastBuild);
        }
    );


app.get('*', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
});


app.listen(port, function () {
    console.log('server is now starting on port ', port);
});


