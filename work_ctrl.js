var fs = require('fs');
var exec = require('child_process').exec;
var pro = require('./properties.js').pro;
var params = process.argv.splice(2);
var param = {
	handler : params[0],  //功能名 例：switch 切换
	value : ''
}
var status = { //状态
	code : 200,
	msg : ''
}


var ctrl = {
	switch : function(value) {
		var active = pro().searchOne('active'); //当前的目录 key
 
		var activeDir = pro().searchOne(value);

		//修改apache配置文件
		var confPath = "D:\\tool\\PHP\\Apache24\\conf\\httpd.conf";
		var regRoot = /\nDocumentRoot\s+"(.*)"/;
		var confText = fs.readFileSync(confPath, 'utf8');
		console.log('修改 docuemntROOT : '+activeDir);
		confText = confText.replace(regRoot, '\nDocumentRoot "'+activeDir +'"');
		fs.writeFile(confPath, confText,  function(error,stdout){
			console.log('修改 http.conf success.');
			if(!error){
				//重启服务
				restartApache();
			}else{
				console.log('修改apache配置文件出错');
			}
		})
	
	},
	start : function() {
		startApache();
	},
	stop : function() {
		stopApache();
	},
	restartApache : function() {
		restartApache();
	},
	active : function() {
		var active = pro().searchOne('active'); //当前的目录 key
		var activeDir = pro().searchOne(active);
		console.log("当前的项目目录是："+activeDir);
	},
	search : function() {
		pro().search(null,function(error,data) {
			if(!error){
				console.log(data.result);
			}
		});
	}
		
}

/**
 * [parseParam 解析传入的参数]
 * @return {[type]} [description]
 */
var parseParam = function(params) {
	var h = params[0];
	if(!h){
		param.handler = "restartApache";  //默认操作重启服务
		return;
	}


	var type = h.split("=");
	var handler = type[0];
	var value = type[1];
	if(type.length == 1 && handler == 'switch'){
		status.code = 404;
		status.msg = '请输入要切换的目录key,使用serach查询key';
		return;
	}

	if(handler == 'save'){
		var data =  value.split(":");
		value  = {
			key : data[0],
			value : data[1]
		}
	}

	param.handler = handler; //功能名
	param.value = value || undefined;  //功能对应的参数 可能为空
};

var restartApache = function() {
	exec('httpd -k restart',function(error,stdout,stderr) {
		if(!error){
			console.log('httpd restart success.');
			changeActiveConfig();
		}
	});

};

var stopApache = function(callback) {
	exec('httpd -k stop',function(error,stdout,stderr) {
		if(!error){
			console.log("httpd stoped .....");
			callback && callback();
		}else{
			console.log('停止出错');
			console.log(error);
		}
		
		
	});
};

var startApache = function() {
	exec('httpd -k start',function(error,stdout,stderr) {
		if(!error){
			console.log("httpd runned .....");
			changeActiveConfig();
		}else{
			console.log('启动出错');
		}				
	});	
};

var changeActiveConfig = function() {
	
	param.value && pro().save({
		'active' : {
			value : param.value
		}
	});
	console.log("更新当前目录key success");
};

parseParam(params); //解析参数

if(status.code != 200){
	console.log(msg);
	return ;
}

ctrl[param.handler](param.value);
