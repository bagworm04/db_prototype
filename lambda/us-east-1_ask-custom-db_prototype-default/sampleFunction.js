module.exports.convDate = function(date, format){
  format = format.replace(/YYYY/, date.getFullYear());
  format = format.replace(/MM/, date.getMonth() + 1);
  format = format.replace(/DD/, date.getDate());

  return format;
}

module.exports.randInt = function(max){
  return Math.floor(Math.random() * (max + 1));
}

module.exports.hasNullInMyself = function(json){

    console.log("from sampleFunction : " + JSON.stringify(json['myself']));
    var length = Object.keys(json['myself']).length;

    console.log("from sampleFunction myself_length : "+ length);
    
    for(var i=0 ;i<length ;i++){
	console.log(json['myself'][i]['response'])
	console.log(json['myself'][i]['response'].length);
	if(json['myself'][i]['response'].length == 0){
	    return i;
	}
    }
    return -1;
}



module.exports.doc = {
    "type": "APL",
    "version": "1.0",
    "mainTemplate": {
        "parameters": [
            "payload"
        ],
        "item": {
            "type": "Text",
            "text": "${payload.myData.title}",
            "width": "100vw",
            "height": "100vh",
            "textAlign": "center",
            "textAlignVertical": "center"
        }
    }
}
