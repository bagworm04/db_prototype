const https = require('https');
var response = "";


module.exports.getAPIResponse = function(keyword){

  var url = getURL(keyword);
  var obj = "";


  const req = https.request(url, (res) => {

      res.on('data', (chunk) => {
          //console.log(`BODY: ${chunk}`);
          obj = JSON.parse(chunk);
          //console.log(obj);
          console.log("from getAPIResponse.js : obj.result : " + obj.result);
          response = obj.result;
      });
      res.on('end', () => {
          //console.log('No more data in response.');
      });

  })
  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.end();
  return response;
}

function getURL(keyword){
  var url_forword = 'https://chatbot-api.userlocal.jp/api/chat?message=';
  var url_back    = '&key=7a341107f46cdf47a2e8';
  return url_forword + encodeURI(keyword) + url_back;
}
