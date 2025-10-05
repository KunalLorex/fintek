const mongoose=require('mongoose');
const {Schema}= mongoose;

const MovieSchema= new Schema({
    title:{type:String, required:true,index:true},
    languages:[String],
    genres:[String],
    runTimeMins:Number,
    rating:Number,
     baseSeatPrice:{type:Number,default:1.0}
},{timestamps:true})


module.exports=mongoose.model("Movie",MovieSchema)