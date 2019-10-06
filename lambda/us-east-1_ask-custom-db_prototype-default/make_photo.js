function getRandomInt(max){
    return Math.floor(Math.random()*Math.floor(max));
}

var fs = require('fs');

var path = require('path');

var request_path = './data/apl_data_top.json';

var json = JSON.parse(
    fs.readFileSync(
	path.resolve(__dirname, request_path)
    )
);


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

console.log(json)
//console.log(json.skilldata.image.length);

for(let i=0;i<json.skilldata.image.length; i++){
    //console.log(i);
    //console.log(json.skilldata.image[i].icon);
    var rand_num = getRandomInt(5)
    console.log(rand_num)
    json.skilldata.image[i].icon = array_url[rand_num] 
}

fs.writeFileSync(
    path.resolve(__dirname, request_path),
    JSON.stringify(json,null,' '),
    'utf-8'
);
