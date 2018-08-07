// Module requirements
var request = require('request');
require('dotenv').config();
var fs = require('fs');

// Checks that .env file exists
if (!process.env) {
  console.log('Please include an .env file for full authorization');
  // Check that GitHub Token value exists in .env file
} else if (!process.env.GITHUB_TOKEN) {
  console.log('Please include a GitHub token in .env file for full authorization');
}

// Checks to see if 'avatars' directory exists and makes one if it doesn't
fs.access('avatars', function(err) {
  if (err && err.code === 'ENOENT') {
    fs.mkdir('avatars', function(error) {
      if (error) {
        console.log('Error:', error);
      }
    });
  }
});

// Enforcing correct amount of command line input arguments
if (process.argv.length === 4) {
  var inputOwner = process.argv[2];
  var inputName = process.argv[3];
} else {
  console.log("Please enter valid repository owner and name");
  return;
}

// Retrieves contributor avatar links based on user input
function getRepoContributors(repoOwner, repoName, cb) {
  console.log('Welcome to the GitHub Avatar Downloader!');

  var options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': 'request',
      'Authorization': process.env.GITHUB_TOKEN
    }
  };

  request(options, function(err, res, body) {
    var status = res.caseless.dict.status;
    if (status === '404 Not Found') { // Checks to see if user repo information exists
      console.log("Please enter valid repository information");
      return;
    }
    if (status === '401 Unauthorized') { // Checks that user has included a valid token
      console.log("Please enter valid authorization token");
      return;
    }
    cb(err, body); // If repo exists => invokes getContributorList as callback function
  });

}

// Creates a list of contributor avatars to pass to downloadImageByURL function
function getContributorList(err, result) {
    if (err) {
    console.log("Errors:", err);
  }

  var contributorsList = JSON.parse(result);

  contributorsList.forEach(function(item) {
    var path = `avatars/${item.login}.jpg`;
    downloadImageByURL(item.avatar_url, path); // Looping through each contributor and invoking download image function
  });
}

// Takes in URL and downloads images to specified file path, assuming folder exists
function downloadImageByURL(url, filePath) {
  request.get(url)
          .on('error', function(err) {
            throw err;
          })
          .pipe(fs.createWriteStream(filePath))
          .on('finish', function() {
            console.log('Image Downloaded');
          });
}

getRepoContributors(inputOwner, inputName, getContributorList);
