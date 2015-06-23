define(function(){

	var pageStorage = {};
	var storage = {};

	pageStorage.setItem = function(key, value){
		storage[key] = value;
	};

	pageStorage.getItem = function(key){
		return storage[key];
	};

    pageStorage.removeItem = function(key){
    	delete storage[key];
    };
      
    pageStorage.clear = function(){
    	storage = {};
    };

    try {
    	localStorage.setItem("613421_localStorage_124316", "localStorage_value");
    } catch(e) {
    	localStorage.__proto__ = pageStorage;
    }

    if(localStorage.getItem("613421_localStorage_124316") === "localStorage_value") {
    	localStorage.removeItem("613421_localStorage_124316");
    }
});