var request = require('request');
var token = require('./secrets.js');
var fs = require('fs');

if (process.argv.length === 4) {
  var inputOwner = process.argv[2];
  var inputName = process.argv[3];
} else {
  console.log("Please enter repository owner and name");
  return;
}


function getRepoContributors(repoOwner, repoName, cb) {
console.log('Welcome to the GitHub Avatar Downloader!');
  var options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': 'request',
      'Authorization': token.GITHUB_TOKEN
    }
  };

  request(options, function(err, res, body) {
    cb(err, body);
  });

}


getRepoContributors(inputOwner, inputName, function(err, result) {
  if (err) {
    console.log("Errors:", err);
  }

  var contributors = JSON.parse(result);

  contributors.forEach(function(item) {
    var path = `avatars/${item.login}.jpg`;
    downloadImageByURL(item.avatar_url, path);
  });
});



function downloadImageByURL(url, filePath) {
  request.get(url)
          .on('error', function(err) {
            throw err;
          })
          .pipe(fs.createWriteStream(filePath))
          .on('finish', function() {
            console.log('Downloaded!');
          });
}
