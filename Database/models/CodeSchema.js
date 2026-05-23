import mongoose from "mongoose";

const CodeSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    repoid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Repo",
        required : true
    } , 
    code : {
        type : String,
        required : true
    },
    language : {
        type : String,
        required : true
    },
    result : {
        type : String,
    },
    errors : {
        type : String,
    }


},{timestamps : true});


export default mongoose.model("Code", CodeSchema);