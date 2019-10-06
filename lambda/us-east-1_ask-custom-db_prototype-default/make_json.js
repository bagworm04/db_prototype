function getRandomInt(max){
    return Math.floor(Math.random()*Math.floor(max));
}

var json ={
    "skilldata":{
	"type":"object",
	"image":[
	    {
		"icon":"https://ea71e153.ngrok.io/flog.jpg",
		"name":"ボタン1"
	    },
	    {
		"icon":"https://www.pref.chiba.lg.jp/kouhoku/kids/chi-bakun/sorakara/documents/city-l_kids.png",
		"name":"ボタン2"
	    },
	    {
		"icon":"https://www.pref.chiba.lg.jp/kouhoku/kids/chi-bakun/sorakara/documents/city-l_kids.png",
		"name":"ボタン3"
	    },
	    {
		"icon":"https://www.pref.chiba.lg.jp/kouhoku/kids/chi-bakun/sorakara/documents/city-l_kids.png",
		"name":"ボタン4"
	    }
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

module.exports.shuffle_photos = function(){
    console.log(json);
    var rand_num = getRandomInt(5)
    
    for(let i=0;i<json.skilldata.image.length; i++){
	rand_num = (rand_num+1)%5;
	console.log(rand_num)
	json.skilldata.image[i].icon = array_url[rand_num] 
    }
 
}


module.exports.get_json = function(){
    return json;
}
