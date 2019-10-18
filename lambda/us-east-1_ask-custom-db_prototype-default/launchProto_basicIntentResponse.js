module.exports.getResponse = function(persistentMemory, responseJSON, sessionMemory){
    for(key in responseJSON){
	console.log(key);
	if(key === persistentMemory[sessionMemory.genre][sessionMemory.item]['slotName']){
	    return responseJSON[key]['value'];
	}
    }
};
