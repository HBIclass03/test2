
//local mongoDB URL
/**  // external Mongodb url
 *  mongodb://username:password@hostname:port/database
 */
//var mgURL ='mongodb://192.168.0.120/song';
var mgURL ='mongodb://song:hbilab@ds033459.mongolab.com:33459/project';

//파일 시스템 모듈
var fs=require("fs");
// connect file
var mongoose = require("mongoose")
	.connect(mgURL,function(err,db){
	if(err){
		console.log(" error!: unable to connect to database");
	} else console.log(" db connect!")
});

//스키마 객체를 받아온다.
var Schema = mongoose.Schema;
//고유의 ID 값을 읽어옴
var ObjectId = Schema.ObjectId;


//log test
module.exports.conLog = function(){
	
	var db = mongoose.connection;
	db.once("open",function(err){
			console.log("DB connect !");
	});
};


//날짜 형식 표기
function dateFormat(val){
	if(!val) {
		return val;
	}
	var str = val.getFullYear()+"."+(val.getMonth()+1)+"."+
	val.getDate()+" "+val.getHours()+":"+val.getMinutes();
	return str;
}

//유저 스키마 생성.
//unique 스키마를 가지고 있을 이유가 없음. 핸들링은 _id 로 제어
var userSchema = new Schema({
	
	'mgIdx'		:	String,
	'index'		:	String,
	'textData'	:	String,
	'filename' 	:	String,
	'filesize'	:	Number,
	'file'		:	Buffer,
	'fileMeta'	:  	[{type:String},{type:String}],
	'regdate':{type:Date, default:Date.now, get: dateFormat}
});

//댓글에 적용될 firend 스키마 생성

var commentSchema = new Schema({
	'fIdx'		: 	{type:Number, unique : true },
	'textData'	: 	{type : String},
	'regdate':{type:Date, default:Date.now}
});

//collections 생성 
//collection 이름은 자동으로 뒤에 +s 가 붙는다.
var UserData = mongoose.model("data",userSchema);
var CommentData = mongoose.model("comment",commentSchema);


//
/*
 module.exports.loadUser = function(req , res , next) {
	UserData.findOne({mgIdx : req.body.writer } , function(err , data){
		if(err){
			return next(err);						//에러 발생
		}
		if(!UserData){
			return res.send('Not found' , 404);		// 사용자가 없음
		}
		console.log('사용자 load : '+data.mgIdx);			//debug console
		req.data =  data;
		next();										// 다음 function에 제어권 전달.
			
	});
}
*/
//Model.find(query, fields, options, callback) 

/** 1. 전송속도 GET > POST
 	2. 히스토리 백 할 때 GET은 이전데이터를 보여주며, POST는 새로 요청
	3. 인코딩 방식이 다르다
	4. GET은 글자수 제한이 있고 POST 는 없다
	5. GET은 보안에 취약, POST는 보안유지
	6.  GET은 서버의 데이터를 가져오는(SELECT)데에 적합하고 POST는 게시판의 글을 등록/수정하는 것과 같은 작업에 적합하다.
	//upload 는 반드시 post 방식으로 설계
**/

module.exports.upload = function(req, res){

	var index = req.body.index;
	var mgIdx = req.body.id;
	var textData = req.body.text;
	//파일 오브젝트 얻어옴
	var fobj = req.files.myFile;
	var filename = fobj.name;
	var filesize = fobj.size;
	var filepath = fobj.path;
	fs.open(filepath,"r",function(err,fd){
		//파일을 저장할 버퍼 객체 만들기
		var buffer = new Buffer(filesize);
		//console.log(req.files.fd);
		if(req.files.fd){
				fs.read(fd,buffer,0,buffer.length,null,function(err,readedBytes,buffer){
					//파일정보를 DB에 저장한다.
					var obj={
							mgIdx:mgIdx,
							index:index,
						textData:textData,
						filename:filename,
						filesize:filesize,
						file:buffer
					};
			
			
					var userData = new UserData(obj);
					userData.save(function(err){
						if(err){
							res.send("실패");
							console.log('error! :'+err);
						}else{
							res.redirect("/fileList");
						}
					});
			});
		}else{													//file is NULL
			var obj={
					mgIdx:mgIdx,
					index:index,
				textData:textData,
			};
			var userData = new UserData(obj);
			userData.save(function(err){
				if(err){
					res.send("실패");
					console.log('error! :'+err);
				}else{
					res.redirect("/fileList");
				}
			});
		}
			
	});
	
};
///////////////////////////////////////////////////////////////////////////////////
module.exports.dataUpdate =function(req,res){
		//var doc = UserData.findOne({mgIdx:"mgIdx"});
	UserData.findOne({},
		    function(err, newDoc) {
		        if (!err) {
		        	UserData = newDoc;
		            console.log(UserData);
		        }else{
		        	console.log('fail');
		        }
		    }
		);
};
module.exports.commentWrite = function(req,res){
	
	var fidx = req.body.id;
	var textData = req.body.text;
	var obj={
		fidx:fidx,
		textData:textData
	}
	var commentData = new CommentData(obj);
	CommentData.save(function(err){
		if(err){
			
		}else{
			
		}
	});
};

module.exports.delete = function(req,res){
	var _id = req.query.id;
	UserData.remove({"_id":_id},
		function(err){
		if(err){
			res.redirect("");
		}else{
			res.redirect("/fileList");
		}
		
	})
};

module.exports.fileList = function(req,res){
	UserData.find()
	.sort("_id")
	.select("_id mgIdx index textData filename filesize regdate")
	.exec(function(err,data){
		if(err){
			res.json({"result":"fail"});
		}else{
			res.render("flieList.html",{"files":data});
		//	console.log(data);
			//res.render = view 폴더에 있는 filelist2 파일에서 files
			//변수에 있는  data의 key 값을 출력한다.
			//{오브젝트,키}
		}
	});
};

module.exports.update = function(req, res){

	
}






