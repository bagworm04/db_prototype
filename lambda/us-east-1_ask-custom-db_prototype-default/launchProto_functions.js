//maxを最大とするランダムな整数値を返す
//例：max = 3 -> 0,1,2
function randomInt(max){
  return Math.floor(Math.random() * (max));
};

//mrandomInte同様（外部から参照できる
module.exports.getRandomInt = function(max){
  return randomInte(max);
};


//受け取ったobjectのkeyをシャッフルして返す
function objeckKeyShuffled(object){
  return shuffle(Object.keys(object));
};

//arrayのkeyをシャッフルして返す
function shuffle(array){
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};


module.exports.hasEmptyContentInMyself = function(json){
    for(var i=0 ; i<Object.keys(json['myself']).length ; i++){
    if(json['myself'][i]['response'].length == 0){
      return i;
    }
  }
  return -1;
};

module.exports.setIntent = function(intent){
  if(intent === 'BasicIntent') return 'BasicIntent';
  else if(intent === 'AnythingIntent') return 'AnythingIntent';
  else {
    console.log('from launchProto_functions : setIntent error')
    return 'Error';
  }
};

//myselfのときは文字列そのまま"myself"が渡される
//myselfでないときはpersistentMemoryがそのまま渡される
module.exports.setGenre = function(genreParam){
    //myselfのときはmyselfを返す
    if(genreParam === 'myself'){
	console.log('from launchProto_funtions : setGenre = myself');
	return 'myself';
    }
    //myselfでないとき
    else{
	//各分類の中で未入力の項目があった場合はその分類を返す
	//3つの分類を探索
	for(key in genreParam){
            if(key === 'family' || key === 'lifestyle' || key === 'assets'){
		//分類内の探索
		for(var i=0; i<genreParam[key].length; i++){
		    if(genreParam[key][i].length == 0){
			console.log('from launchProto_funtions : setGenre = ' + key);
			return key;
		    }
		}
            }
	}
    }
    return shuffle(['family','assets','lifestyle'])[0];
};

//分類内で埋まっていない項目がある場合はその項目番号を返す
//埋まっている場合はランダムに項目番号を返す
function setItemNum(persistentMemory, genre){
  //項目番号から返答が埋まっていないものを探索し項目番号を返す
    for(var i=0; i<persistentMemory[genre].length; i++){
    if(persistentMemory[genre][i]['response'].length == 0) return i;
  }
    //廃止予定("なし"が取れない）
    //すべての項目の返答が埋まっていた場合はランダムな項目番号を返す
    var randomNum = randomInt(persistentMemory[genre].length);
    return randomNum;
};


module.exports.getItemNum = function(persistentMemory, genre){
  return setItemNum(persistentMemory, genre);
};


module.exports.getQuestion = function(persistentMemory, genre, item){
    console.log("from launchProto_functions : " + item);
    var firstPhrase   = persistentMemory[genre][item]['firstPhrase'];
    var secondPhrase  = persistentMemory[genre][item]['secondPhrase'];
    console.log('from launchProto_functions : firstPhrase =' + firstPhrase +' secondPhrase = '+secondPhrase);
    
    return firstPhrase + 'は' + secondPhrase +'？';
};


module.exports.createNewDB = function(persistentMemory, sessionMemory, newData){
    var dateTime = new Date();

    let reply = {
	"reply": newData,
	"time" : JSON.stringify(dateTime)
    }

    persistentMemory[sessionMemory.genre][sessionMemory.item]['response'].push(reply);
    persistentMemory['count'] += 1;
    
    console.log("from launchProto_functions.js : " + JSON.stringify(persistentMemory));
    return persistentMemory;
    
}

module.exports.getResponse = function(persistentMemory, responseJSON, sessionMemory){

    console.log(JSON.stringify(responseJSON));
    
    for(key in responseJSON){
	if('value' in responseJSON[key]){
	    console.log("from launchProto_function.js : " + JSON.stringify(responseJSON[key]['value']));

	    if(key === 'notSlot'){
		return 'なし';
	    }else{
		return responseJSON[key]['value'];
	    }
	}
    }
    return 'なし';
}

module.exports.getLastRecord = function(persistentMemory, sessionMemory){
    var record = persistentMemory[sessionMemory.genre][sessionMemory.item]['response']

    console.log("from launchProto_functions.js : "+ record.length );
    console.log(record[record.length -1]['reply']); 
    
    return "前に " + record[record.length -1]['reply'] + "って言ってたけど、他に" ;   
}
