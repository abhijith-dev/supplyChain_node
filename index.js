require('dotenv').config();
const express=require('express');
const cors=require('cors');
const app=express();
const api=require("./Router/Requests");
const corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204      
}
app.use(cors(corsOptions));
app.use('/api',api);
app.use('/static', express.static('public'))
app.listen(process.env.PORT,err=>{
    if(!err){
        console.log(`SERVER IS RUNNING AT PORT ${process.env.PORT}.....`)
    }
}); 
