module.exports = function (grunt) {

	var fs = require("fs");
	var engine = require("handlebars");
	var tpl = engine.compile(fs.readFileSync('./grunt/tpl.appcache','utf-8'));

	var _cachelist = require('./appcachejson.js')();

	
	var utils = {
		prepareCacheList:function(line){
			return _cachelist[line] || [];
		},
		
		generate:function(mylist)
		{
			return tpl({
				timestamp:(new Date()).toJSON(),
				cachelist:mylist
			});
		},
		run:function(line)
		{
			 var list = this.prepareCacheList(line);
			 if (list.length) {
			 	var cachestring = this.generate(list);
			 	fs.writeFileSync("./grunt/"+line+".appcache",cachestring);
			 }else{
			 	console.log("\n ******* no cache list found ********: \n" + line);
			 }
		}
	};

	grunt.registerTask("appcache", function (line) {
        try
        {
            utils.run(line);
        }
        catch(e)
        { console.error(e);}
    });
	 

};
