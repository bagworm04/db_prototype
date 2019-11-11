
//maxを最大とするランダムな整数値を返す
//例：max = 3 -> 0,1,2
function randomInt(max){
  return Math.floor(Math.random() * (max));
}

function createDB(persistentMemory,sessionMemory , newData){
  var reply = newJSON(newData);

  persistentMemory[genre][item]['response'].push(reply);
  persistentMemory['count'] += 1;

  return persistentMemory;
}

function diffTime(newDay, pastDay){
  // var newDayFormat  = new Date(newDay);
  // var pastDayFormat = new Date(pastDay);
  // console.log("from functions.js : diffTime : newDayFormat " + newDayFormat + " diffTime : pastDayFormat :" + pastDayFormat );
  // console.log("from functions.js : diffTime : newDayFormat.getTime() " + newDayFormat.getTime() + " diffTime : pastDayFormat.getTime() :" + pastDayFormat.getTime() );
  // console.log("from functions.js : diffTime : " + Math.floor((newDay- pastDay) / 1000 ));
  return Math.floor((newDay- pastDay) / 1000 ); //秒
}

module.exports.createNewDB = function(persistentMemory, sessionMemory, newData){
  var original = new Date();
  date = original.getTime() + 1000*60*60*9;// JSTに変換
  var tmpDate = original;
  // console.log("from functions.js: createNewDB : date(バージニア) : " + tmpDate.getMonth()+1 + "/" + tmpDate.getDay() + "/" + tmpDate.getHours() + "/" + tmpDate.getMinutes() + "/" + tmpDate.getSeconds());
  let reply = {
    "reply": newData,
    "time" : JSON.stringify(date)
  };

  persistentMemory[sessionMemory.genre][sessionMemory.item]['response'].push(reply);
  persistentMemory['count'] += 1;

  console.log("from functions.js : " + JSON.stringify(persistentMemory));
  return persistentMemory;

};

//mrandomInte同様（外部から参照できる
module.exports.getRandomInt = function(max){
  return randomInt(max);
};

module.exports.getUserName = function( persistentMemory ){
  console.log("from functions.js : persistentMemory : " + JSON.stringify(persistentMemory));
  for(key in persistentMemory['basic']){
    if( persistentMemory['basic'][key]['firstPhrase'] === "普段の呼び名"){
      if(persistentMemory['basic'][key]['response'].length > 0){
        // console.log("from function.js : key : " + key);
        // console.log("from function.js : json : " +JSON.stringify(persistentMemory['basic'][key]));
        var nameResponse  = persistentMemory['basic'][key]['response']
        var name          = persistentMemory['basic'][key]['response'][0]['reply'];
        return name + 'さん';
      }
    }
  }
  return 'おやおや';
};

//おはようございますなど
module.exports.getGreeting = function(middleResponse){
  var greetings = middleResponse['greeting'];
  var date = new Date();
  var hours = (date.getHours()+9) % 24;
  console.log("from frunctions.js : hours(日本) :" + hours);
  // console.log("from functions.js: getGreeting : Date.now() : "+ date.getYear() + "/" +  date.getMonth()+1 + "/" + date.getDay() + "/" + date.getHours() + "/" + date.getMinutes() + "/" + date.getSeconds());

  if(hours < 12){
    var elementNum = greetings['morning'].length;
    return greetings['morning'][randomInt(elementNum)];
  }else if(hours < 18){
    var elementNum = greetings['afternoon'].length;
    return greetings['afternoon'][randomInt(elementNum)];
  }else{
    var elementNum = greetings['night'].length;
    return greetings['night'][randomInt(elementNum)];
  }
};

//そういえば、そうそうなど
module.exports.getMiddleDialogue = function(middleResponse){
  var middleDialogue    = middleResponse['add'];
  var elementNum        = middleDialogue.length;
  return middleDialogue[randomInt(elementNum)];
};

//ありがとうございましたなど
module.exports.getLastDialogue = function(middleResponse){
  var lastDialogue   = middleResponse['thank'];
  var elementNum     = lastDialogue.length;
  return lastDialogue[randomInt(elementNum)];
};

module.exports.getCount = function(middleResponse, persistentMemory){
  var count         = persistentMemory['count'];
  var countDialogue = middleResponse['count'];
  var firstPhrase   = countDialogue['firstPhrase'][randomInt(countDialogue['firstPhrase'].length)];
  var secondPhrase  = countDialogue['secondPhrase'][randomInt(countDialogue['secondPhrase'].length)];
  return firstPhrase + count + secondPhrase;
}

module.exports.searchQuestionElement = function(sessionMemory, persistentMemory){
  var denialArray = [];
  var priorArray  = [];
  var genreArray  = ['myself','lifestyle','family','assets'];

  //初回起動時(basicが埋まっていないとき)
  for(key in persistentMemory['basic']){
    if(persistentMemory['basic'][key]['response'].length === 0){
      sessionMemory.genre = 'basic';
      sessionMemory.item  = key;
      return sessionMemory;
    }
  }

  //basic項目以外
  for(key in genreArray){
    var genre = genreArray[key];
    // console.log("from fucntions.js : searchQuestionElement : key  "  + genreArray[key] );
    //key内の要素を取得
    for(var i=0; i<persistentMemory[genre].length; i++){

      //質問に対してレスポンスがあるかどうか
      if(persistentMemory[genre][i]['response'].length === 0 ){
        sessionMemory.genre = genreArray[key];
        sessionMemory.item  = i;
        return sessionMemory;
      }else{
        var response    = persistentMemory[genre][i]['response'];
        //指定しているジャンル、要素番号に入っている要素の最後の更新時間を取得
        var lastResponseTime = response[response.length -1]['time'];

        //回答が何かあるとき
        if(response[response.length -1]['reply'] !== 'なし'){
          var element = { [genre] : i }
          // console.log("from functinos.js : i :" + i);
          // console.log("from functinos.js : priorArray.length :" + priorArray.length);

          //優先キューの要素がないとき
          if(priorArray.length === 0){
            priorArray.unshift(element);
          }else{
            //先頭要素の更新時間との比較

            //優先キューの先頭要素の更新時間を取得
            let headElement     = persistentMemory[Object.keys(priorArray[0])][Object.values(priorArray[0])]['response'];
            let headElementTime = headElement[headElement.length -1]['time'];
            // console.log("from function.js :prirorArray:  headElementTime: "+ headElementTime );
            // console.log("from funciton.js : lastResponseTime : " + lastResponseTime + " , headElementTime  :" + headElementTime );
            // console.log("from function.js :diffTime : "+ diffTime(lastResponseTime, headElementTime) );

            //探索した要素のほうが古い場合
            if(diffTime(lastResponseTime, headElementTime) < 0 ){
              priorArray.unshift(element);
            }else{
              priorArray.push(element);
            }
          }
        }else{//回答がないとき
          var element = { [genre] : i };

          //否定キューに要素がないとき
          if(denialArray.length === 0){
            denialArray.unshift(element);
          }else{
            let headElement       = persistentMemory[Object.keys(denialArray[0])][Object.values(denialArray[0])]['response'];
            let headElementTime   = headElement[headElement.length -1]['time'];
            // console.log("from function.js :prirorArray:  headElementTime: "+ headElementTime );
            // console.log("from funciton.js : lastResponseTime : " + lastResponseTime + " , headElementTime  :" + headElementTime );
            // console.log("from function.js :diffTime : "+ diffTime(lastResponseTime, headElementTime) );

            if(diffTime(lastResponseTime, headElementTime) < 0){
              denialArray.unshift(element);
            }else{
              denialArray.push(element);
            }
          }
        }
      }
    }
  }
  // console.log("from functions.js : priorArray : " + priorArray.toString());
  // console.log("from functions.js : denialArray : " + denialArray.toString());

  if(priorArray.length > 0){
    sessionMemory.genre = Object.keys(priorArray[0]);
    sessionMemory.item  = Object.values(priorArray[0]);
    return sessionMemory;
  }else{
    sessionMemory.genre = Object.keys(denialArray[0]);
    sessionMemory.item  = Object.values(denialArray[0]);
    return sessionMemory;
  }
};

module.exports.getQuestion = function(persistentMemory, genre, item){
  // console.log("from functions : " + item);
  var firstPhrase   = persistentMemory[genre][item]['firstPhrase'];
  var secondPhrase  = persistentMemory[genre][item]['secondPhrase'];
  // console.log('from functions : firstPhrase =' + firstPhrase +' secondPhrase = '+secondPhrase);

  return firstPhrase + 'は' + secondPhrase +'？';
};

module.exports.getLastResponse = function(persistentMemory, sessionMemory, middleResponse){
  var lookbackDialogue = middleResponse['lookback'];
  var lastResponse = persistentMemory[sessionMemory.genre][sessionMemory.item]['response'];
  if(lastResponse.length > 0){
    return lookbackDialogue['firstPhrase'][randomInt(lookbackDialogue['firstPhrase'].length)] + lastResponse[lastResponse.length-1]['reply'] + lookbackDialogue['secondPhrase'][randomInt(lookbackDialogue['secondPhrase'].length)];
  }else{
    return " ";
  }
}


module.exports.getResponse = function(persistentMemory, responseJSON, sessionMemory){
  // console.log(JSON.stringify(responseJSON));
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
};
