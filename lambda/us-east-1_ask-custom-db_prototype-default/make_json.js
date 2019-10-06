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
    "https://www.newsweekjapan.jp/stories/assets_c/2017/04/iStock-501152239b-thumb-720xauto-110669.jpg",
    "https://ea71e153.ngrok.io/flog.jpg",
    "https://ea71e153.ngrok.io/flog2.jpg"
]

var medicine_photo_url = [
    "https://ea71e153.ngrok.io/flog.jpg",
    "https://ea71e153.ngrok.io/flog2.jpg"
]

module.exports.shuffle_photos = function(excute_count){
    console.log("excute_count:"+excute_count);
    console.log(json);
    console.log(get_image_json(excute_count+1));

    
    console.log(json);
    
    var rand_num = getRandomInt(5)
    
    for(let i=0;i<excute_count; i++){

	json.skilldata.image[i] = JSON.parse(get_image_json(i+1));
	rand_num = (rand_num+1)%5;
	console.log(rand_num)
	json.skilldata.image[i].icon = array_url[rand_num] 
    }
 
}


module.exports.get_json = function(){
    return json;
}
