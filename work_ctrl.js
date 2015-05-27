var fs = require('fs');
var exec = require('child_process').exec;
var pro = require('./properties.js').pro;
var params = process.argv.splice(2);
var handler = params[0]; //功能名 例：switch 切换
var key = params[1];
console.log(params);
if(!key){
	console.log('请输入key');
	return ;
}

var active = pro().serachOne('active'); //当前的目录 key
if(key == active){
	console.log(key+'  actived ...');
	return ;
}

 
var activeDir = pro().serachOne(key);

var ctrl = {
	switch : function() {
		//修改apache配置文件
		var confPath = "D:\\tool\\PHP\\Apache24\\conf\\httpd.conf";
		var regRoot = /[^\#]DocumentRoot(?=\s+)"(.*)"/;
		var confText = fs.readFileSync(confPath, 'utf-8');
		console.log('read http.conf');
		confText = confText.replace(regRoot, 'DocumentRoot "'+activeDir +'"');
		fs.writeFile(confPath, confText, 'utf-8', function(error,stdout){
			console.log('修改 http.conf end');
			if(!error){
				//停服 、 启服
				stopApache(startApache);

			}else{
				console.log('修改apache配置文件出错');
			}
		})
		
		
	}
}


var stopApache = function(callback) {
	exec('taskkill /f /t /im httpd.exe',function(error,stdout,stderr) {
		if(!error){
			console.log("httpd stoped .....");
			callback();
		}else{
			console.log('停止出错');
			console.log(error);
		}
		
		
	});
};

var startApache = function() {
	exec('httpd',function(error,stdout,stderr) {
		if(!error){
			console.log("httpd runned .....");
			changeActiveConfig();
		}else{
			console.log('启动出错');
		}				
	});	
};

var changeActiveConfig = function() {
	console.log("更新当前目录key...");
	pro().save({
		'active' : {
			value : key
		}
	});
};

ctrl[handler]();
