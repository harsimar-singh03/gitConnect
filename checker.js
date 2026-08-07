let adminaut=(req,res,next)=>{
let key="xyz"
let auth="xyaz"
let check = key===auth;
if(!check)
{
    res.status(401).send("not the admin")
}
else{
    next();
}
}


module.exports={adminaut}