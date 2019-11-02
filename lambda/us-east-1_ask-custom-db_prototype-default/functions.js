
function createDB(persistentMemory,sessionMemory , newData){
  var reply = newJSON(newData);

  persistentMemory[genre][item]['response'].push(reply);
  persistentMemory['count'] += 1;

  return persistentMemory;
}

function dateFormat(date){
  return date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate() + " " + date.getHours() + ":" +date.getMinutes() + ":" +date.getSeconds() ;
}

function diffDay(newDay, pastDay){
  var pastDayFormat = new Date(pastDay);
  console.log("from functions.js : diffDay : pastDayFormat :" + pastDayFormat );
  var diffTime = newDay.getTime() - pastDayFormat.getTime();
  console.log("from functions.js : diffDay :diffTime :" + diffTime );
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)); //1日
}

function diffTime(newDay, pastDay){
  var newDayFormat  = new Date(newDay);
  var pastDayFormat = new Date(pastDay);
  console.log("from functions.js : diffDay : pastDayFormat :" + pastDayFormat );
  var diffTime = newDayFormat.getTime() - pastDayFormat.getTime();
  console.log("from functions.js : diffDay :diffTime :" + diffTime );
  return Math.floor(diffTime / 1000 * 60); //分
}

function getReply(newData){
  var date = new Date();
  date.setTime(date.getTime() + 1000*60*60*9);// JSTに変換
  date = dateFormat(date);
  let reply = {
    "reply": newData,
    "time" : JSON.stringify(date)
  }
  return reply;
}

module.exports.searchQuestionElement = function(sessionMemory, persistentMemory){
  var denialArray = [];
  var priorArray  = [];
  var genreArray  = ['myself','lifestyle','family','assets'];

  for(key in genreArray){
    var genre = genreArray[key];
    console.log("from fucntions.js : searchQuestionElement : key  "  + genreArray[key] );
    //key内の要素を取得
    for(var i=0; i<persistentMemory[genre].length; i++){

      //質問に対してレスポンスがあるかどうか
      if(persistentMemory[genre][i]['response'].length === 0 ){
        sessionMemory.genre = genreArray[key];
        sessionMemory.item  = i;
        return sessionMemory;
      }else{
        var response    = persistentMemory[genre][i]['response'];

        //回答が何かあるとき
        if(response[response.length -1]['reply'] !== 'なし'){
          let element = { [genre] : i }
          console.log("from functinos.js : i :" + i);
          console.log("from functinos.js : priorArray.length :" + priorArray.length);

          //優先キューの要素がないとき
          if(priorArray.length === 0){
            priorArray.unshift(element);
          }else{
            //先頭要素の更新時間との比較

            //指定しているジャンル、要素番号に入っている要素の最後の更新時間を取得
            let lastResponseTime = response[response.length -1]['time'];
            console.log("from funcsion.js : priorArray[0]" +  JSON.stringify(priorArray[0]));
            //優先キューの先頭要素の更新時間を取得
            let headElement     = persistentMemory[Object.keys(priorArray[0])][Object.values(priorArray[0])]['response'];
            let headElementTime = headElement[headElement.length -1]['time'];
            console.log(headElementTime);
            //探索した要素のほうが古い場合
            if(diffTime(lastResponseTime, headElementTime) < 0 ){
              priorArray.unshift(element);
            }else{
              priorArray.push(element);
            }
          }

        }else{//回答がないとき

          //否定キューに要素がないとき
          if(denialArray.length === 0){
            let element = {genre:i};
            denialArray.unshift(element);
          }else{

            let headElement       = persistentMemory[Object.key(denialArray[0])][Object.values(denialArray[0])]['response'];
            let headElementTime   = headElement[headElement.length -1]['time'];

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
  if(priorArray.length > 0){
    sessionMemory.genre = Object.keys(priorArray[0]);
    sessionMemory.item  = Object.values(priorArray[0]);
    return sessionMemory;
  }else{
    sessionMemory.genre = Object.keys(denialArray[0]);
    sessionMemory.item  = Object.values(denialArray[0]);
    return sessionMemory;
  }
}

module.exports.getQuestion = function(persistentMemory, genre, item){
  console.log("from functions : " + item);
  var firstPhrase   = persistentMemory[genre][item]['firstPhrase'];
  var secondPhrase  = persistentMemory[genre][item]['secondPhrase'];
  console.log('from functions : firstPhrase =' + firstPhrase +' secondPhrase = '+secondPhrase);

  return firstPhrase + 'は' + secondPhrase +'？';
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

module.exports.createNewDB = function(persistentMemory, sessionMemory, newData){
  var date = new Date();
  date.setTime(date.getTime() + 1000*60*60*9);// JSTに変換
  date = dateFormat(date);
  let reply = {
    "reply": newData,
    "time" : JSON.stringify(date)
  }

  persistentMemory[sessionMemory.genre][sessionMemory.item]['response'].push(reply);
  persistentMemory['count'] += 1;

  console.log("from functions.js : " + JSON.stringify(persistentMemory));
  return persistentMemory;

}
