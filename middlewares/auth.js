module.exports.author =  function(req,res,next){
if(req.session.logg){
    next()
}else{
    res.redirect('/login')
}
}

