var request = require('request');
var token = require('./secrets.js');
var fs = require('fs');

console.log('Welcome to the GitHub Avatar Downloader!');

function getRepoContributors(repoOwner, repoName, cb) {
  var options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': 'request',
      'Authorization': token.GITHUB_TOKEN
    }
  };

  request(options, function(err, res, body) {
    var contributors = JSON.parse(body);
    var array = [];
    for (let i = 0; i < contributors.length; i++) {
      array.push(contributors[i].avatar_url);
    }
    cb(err, array);
  });
}

getRepoContributors("jquery", "jquery", function(err, result) {
  console.log("Errors:", err);
  console.log("Result:", result);
});

function downloadImageByURL(url, filePath) {
  request.get(url)
          .on('error', function(err) {
            throw err;
          })
          .pipe(fs.createWriteStream(filePath))
          .on('finish', function() {
            console.log('Downloaded!');
          })
}

downloadImageByURL("https://avatars2.githubusercontent.com/u/2741?v=3&s=466", "avatars/kvirani.jpg");