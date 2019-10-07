function getRandomInt(max){
    return Math.floor(Math.random()*Math.floor(max));
}

var json ={
    "skilldata":{
	"type":"object",
	"image":[
	    
	],
	"properties":{
	    "Ssml_0":"<speak>タップしてください</speak>"
	},
	"transformers":[
	    {
		"inputPath":"Ssml_0",
		"outputName":"Speech_0",
		"transformer":"ssmlToSpeech"
	    }
	]
    }
}

function get_image_json(num){

    var json_str = '{\"icon\": \"a\", \"name \": \"ボタン' + num + '\"}'

    return json_str;
}

    
var array_url = [
    "https://www.pref.chiba.lg.jp/kouhou/kids/chi-bakun/sorakara/documents/city-l_kids.png",
    "http://maruchiba.jp/miryoku/character/images/img_01_l.jpg",
    "https://www.newsweekjapan.jp/stories/assets_c/2017/04/iStock-501152239b-thumb-720xauto-110669.jpg"
]

var medicine_photo_url = [
    "https://ea71e153.ngrok.io/flog.jpg",
    "https://ea71e153.ngrok.io/flog2.jpg"
]

module.exports.shuffle_photos = function(excute_count){

    console.log("from make_json, excute_count:"+ JSON.stringify(excute_count));
    console.log("from make_json, excute:"+excute_count + JSON.stringify(json));
    console.log("from make_json, excute:"+excute_count+ "get_image_json" + JSON.stringify(get_image_json(excute_count+1)));
    
    //var rand_num = getRandomInt(5)
    //var rand_num = excute_count;

    if(excute_count >= 1){
	json.skilldata['image'].push(JSON.parse(get_image_json(excute_count % 5)));
	
	json.skilldata.image[excute_count-1].icon = array_url[getRandomInt(3)]

    }

    /*
    for(var i=0; i<json.skilldata['image'].length ; i++){
	json.skilldata.image[i].icon = array_url[] 
	}*/
    
    console.log("from make_json, excute:" + excute_count+ "\n"+JSON.stringify(json));
    
}


module.exports.get_json = function(){
    return json;
}
