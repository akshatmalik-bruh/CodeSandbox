import mongoose from "mongoose";


const RepoSchema = mongoose.Schema({
    userid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    } , 
    reponame : {
        type : String,
        required : true,
        trim : true,
        minlength : 3,
        lowercase : true
    }
    

},{timestamps : true});

RepoSchema.index(
   { userid: 1, reponame: 1 },
   { unique: true }
);

export default mongoose.model("Repo", RepoSchema);