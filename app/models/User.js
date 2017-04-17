//Users model
var md5=require('md5');
var mongoose=require('mongoose');
    Schema=mongoose.Schema;
var UserSchema=new Schema({
	name:{type:String,required:true},
	email:{type:String,required:true},
	password:{type:String,require:true},
	created:{type:Date}
});

UserSchema.methods.verifyPassword =function(password){
   var isMatch= md5(password)===this.password;
    return isMatch
}
mongoose.model('User',UserSchema);