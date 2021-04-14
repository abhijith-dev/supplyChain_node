const model=require('../Models/Models');
const fn=require('../Router/DateTracker')
const express=require('express');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const DateTracker = require('../Router/DateTracker');
const notify=require('../Router/PushNotifications')
const multer=require('multer');
const path=require('path');
const bodyParser=require('body-parser');
let Router=express.Router();
//setup
const RATING_ARRAY=[
    
    {
        month:"Jan",
        est:0,
        rate:0
    },
    {
        month:"Feb",
        est:0,
        rate:0
    },
    {
        month:"Mar",
        est:0,
        rate:0
    },
    {
        month:"Apr",
        est:0,
        rate:0
    },
    {
        month:"May",
        est:0,
        rate:0
    },
    {
        month:"Jun",
        est:0,
        rate:0
    },
    {
        month:"Jul",
        est:0,
        rate:0
    },
    {
        month:"Aug",
        est:0,
        rate:0
    },
    {
        month:"Sep",
        est:0,
        rate:0
    },
    {
        month:"Oct",
        est:0,
        rate:0
    },
    {
        month:"Nov",
        est:0,
        rate:0
    },
    {
        month:"Dec",
        est:0,
        rate:0
    }
]
const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function(req, file, cb){
       cb(null,"IMAGE-" + Date.now() + path.extname(file.originalname));
    }
 });
 const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000000},
 }).single("file");
//token auth 
function generateToken(email,role){
    return jwt.sign({email:email,role:role},process.env.SECRET_KEY);
}
function verifyToken(token){
    try{
        return jwt.verify(token,process.env.SECRET_KEY);
    }
    catch(err){
        return {flag:404}
    }
}

//middleware
function keyGenerator(){
    const RandomString="1234567890QWERTYUIOPASDFGHJKLZXCVBNM_-1234567890";
    let random='';
    for(let i=0;i<8;i++){
       random+=RandomString.charAt(Math.floor(Math.random()*RandomString.length));
    }
    return random;
}
function foodID(){
    const RandomString="01234567899800745612300123400567899874563210010047852036985400751234576985462";
    let random='';
    for(let i=0;i<6;i++){
       random+=RandomString.charAt(Math.floor(Math.random()*RandomString.length));
    }
    return random;
}

//Factory

Router.post('/addFactoryToDb',bodyParser.json(),(req,res)=>{
    let date=new Date();
    const {name,email,password,owner,type,address,location,phno}=req.body;
    model.Factory.find({Email:email},(err,data1)=>{
        if(data1.length>0){
            return res.json({
              message:"Factory already exist in this email",
              flag:103
            });
        }
        else{
          model.Factory.find({Name:name},(err,data2)=>{
            if(data2.length>0){
                return res.json({
                  message:"This company is already exist",
                  flag:104
                });
            }
            else{
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(password, salt, function(err, hash) {
                        model.Factory({
                            Name:name,
                            Email:email,
                            Phno:phno,
                            Address:address,
                            Location:location,
                            Password:hash,
                            Owner:owner,
                            Type:type,
                            Date:date.toDateString(),
                            Role:"F"
                        }).save((err,back)=>{
                          if(!err){
                            let warehouse_key=keyGenerator();
                            let distributor_key=keyGenerator();
                            let retailer_key=keyGenerator();
                            model.IdPocket({
                                f_id:back._id,
                                warehouse_key:warehouse_key,
                                distributer_key:distributor_key,
                                Retailer_key:retailer_key,
                            }).save();
                            notify.notificationBucket(back._id).then(res=>{
                                notify.pushNotification(back._id,`Congrats,Your Factroy Registered in Smart supply Chain`)
                                notify.pushNotification(back._id,`Your WareHouse_id is ${warehouse_key}`)
                                notify.pushNotification(back._id,`Your Distributor_id is ${distributor_key}`)
                                notify.pushNotification(back._id,`Your Retailer_id is ${retailer_key}`)
                            });
                            
                            console.log(`FACTORY ADDED @${Date.now()}`);
                            res.json({
                                message:"successfully Factory Registered",
                                flag:200
                            });
                          }
                          else{
                            res.json({
                                message:"something went wrong",
                                flag:500
                            });
                          }
                        })
                    });
                });
            } 
          })
        }
    })
});
Router.post('/FactoryLogin',bodyParser.json(),(req,res)=>{
   const {email,password}=req.body;
   model.Factory.find({
       Email:email
   },(err,data)=>{
       if(data.length==0){
        return res.json({
            message:"no account from this email",
            flag:107
        })
       }
       else{
        bcrypt.compare(password,data[0].Password, function(err, resc) {
            if(resc===true){
               let token=generateToken(email,data[0].Role);
               console.log(`FACTORY LOGGED IN @${Date.now()}`);
               return res.json({
                   message:"success login",
                   token:token,
                   flag:200
               })
            }
            else{
                return res.json({
                    message:"invalid password",
                    flag:108
                })  
            }
        });
       }
});
});

//WareHouse

Router.post('/addWareHouseToDb',bodyParser.json(),(req,res)=>{
    let date=new Date();
    const {name,email,password,owner,address,location,phno,warehouse_key,src}=req.body;
    model.WareHouse.find({Email:email},(err,data1)=>{
        if(data1.length>0){
            return res.json({
              message:"Warehouse already exist in this email",
              flag:103
            });
        }
        else{
          model.WareHouse.find({Name:name},(err,data2)=>{
            if(data2.length>0){
                return res.json({
                  message:"This WareHouse is already exist",
                  flag:104
                });
            }
            else{
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(password, salt, function(err, hash) {
                        model.WareHouse({
                            Name:name,
                            Email:email,
                            Phno:phno,
                            Address:address,
                            Location:location,
                            Password:hash,
                            Owner:owner,
                            WarehouseKey:warehouse_key,
                            Src:src,
                            Date:date.toDateString(),
                            Role:"W"
                        }).save((err,back)=>{
                          if(!err){
                            console.log(`WAREHOUSE ADDED @${Date.now()}`); 
                            notify.notificationBucket(back._id).then(res=>{
                                notify.pushNotification(back._id,`Congrats,Your Warehouse Registered in Smart supply Chain`)
                            }); 
                            res.json({
                                message:"successfully WareHouse Registered",
                                flag:200
                            });
                          }
                          else{
                            res.json({
                                message:"something went wrong",
                                flag:500
                            });
                          }
                        })
                    });
                });
            } 
          })
        }
    })
});
Router.post('/WareHouseLogin',bodyParser.json(),(req,res)=>{
   const {email,password}=req.body;
   model.WareHouse.find({
       Email:email
   },(err,data)=>{
       if(data.length==0){
        return res.json({
            message:"no account from this email",
            flag:107
        })
       }
       else{
        bcrypt.compare(password,data[0].Password, function(err, resc) {
            if(resc===true){
               let token=generateToken(email,data[0].Role)
               console.log(`WAREHOUSE LOGGED IN @${Date.now()}`);
               return res.json({
                   message:"success login",
                   token:token,
                   flag:200
               })
            }
            else{
                return res.json({
                    message:"invalid password",
                    flag:108
                })  
            }
        });
       }
});
});

//Distributor

Router.post('/addDistributorToDb',bodyParser.json(),(req,res)=>{
    let date=new Date();
    const {name,email,password,owner,address,location,phno,src,distributer_key}=req.body;
    model.Distributor.find({Email:email},(err,data1)=>{
        if(data1.length>0){
            return res.json({
              message:"Distributor already exist in this email",
              flag:103
            });
        }
        else{
          model.Distributor.find({Name:name},(err,data2)=>{
            if(data2.length>0){
                return res.json({
                  message:"This Distributor is already exist",
                  flag:104
                });
            }
            else{
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(password, salt, function(err, hash) {
                        model.Distributor({
                            Name:name,
                            Email:email,
                            Phno:phno,
                            Address:address,
                            Location:location,
                            Password:hash,
                            Owner:owner,
                            Src:src,
                            DistributerKey:distributer_key,
                            Date:date.toDateString(),
                            Role:"D"
                        }).save((err,back)=>{
                          if(!err){
                            console.log(`DISTRIBUTOR ADDED @${Date.now()}`);
                            notify.notificationBucket(back._id).then(res=>{
                                notify.pushNotification(back._id,`Congrats,Your Distribution Center Registered in Smart supply Chain`)
                            });   
                            res.json({
                                message:"successfully Distributor Registered",
                                flag:200
                            });
                          }
                          else{
                            res.json({
                                message:"something went wrong",
                                flag:500
                            });
                          }
                        })
                    });
                });
            } 
          })
        }
    })
});

Router.post('/DistributorLogin',bodyParser.json(),(req,res)=>{
   const {email,password}=req.body;
   model.Distributor.find({
       Email:email
   },(err,data)=>{
       if(data.length==0){
        return res.json({
            message:"no account from this email",
            flag:107
        })
       }
       else{
        bcrypt.compare(password,data[0].Password, function(err, resc) {
            if(resc===true){
               let token=generateToken(email,data[0].Role)
               console.log(`DISTRIBUTOR LOGGED IN @${Date.now()}`);
               return res.json({
                   message:"success login",
                   token:token,
                   flag:200
               })
            }
            else{
                return res.json({
                    message:"invalid password",
                    flag:108
                })  
            }
        });
       }
});
});

//Retailer

Router.post('/addRetailerToDb',bodyParser.json(),(req,res)=>{
    let date=new Date();
    const {name,email,password,owner,address,location,phno,src,retailer_key}=req.body;
    model.Retailer.find({Email:email},(err,data1)=>{
        if(data1.length>0){
            return res.json({
              message:"Retailer already exist in this email",
              flag:103
            });
        }
        else{
          model.Retailer.find({Name:name},(err,data2)=>{
            if(data2.length>0){
                return res.json({
                  message:"This Retailer is already exist",
                  flag:104
                });
            }
            else{
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(password, salt, function(err, hash) {
                        model.Retailer({
                            Name:name,
                            Email:email,
                            Phno:phno,
                            Address:address,
                            Location:location,
                            Password:hash,
                            Owner:owner,
                            Src:src,
                            RetailerKey:retailer_key,
                            Date:date.toDateString(),
                            Role:"R"
                        }).save((err,back)=>{
                          if(!err){
                            console.log(`RETAILER ADDED @${Date.now()}`);  
                            notify.notificationBucket(back._id).then(res=>{
                                notify.pushNotification(back._id,`Congrats,Your Retailer Center Registered in Smart supply Chain`)
                            }); 
                            res.json({
                                message:"successfully Retailer Registered",
                                flag:200
                            });
                          }
                          else{
                            res.json({
                                message:"something went wrong",
                                flag:500
                            });
                          }
                        })
                    });
                });
            } 
          })
        }
    })
});
Router.post('/RetailerLogin',bodyParser.json(),(req,res)=>{
   const {email,password}=req.body;
   model.Retailer.find({
       Email:email
   },(err,data)=>{
       if(data.length==0){
        return res.json({
            message:"no account from this email",
            flag:107
        })
       }
       else{
        bcrypt.compare(password,data[0].Password, function(err, resc) {
            if(resc===true){
               let token=generateToken(email,data[0].Role)
               console.log(`RETAILER LOGGED IN @${Date.now()}`);
               return res.json({
                   message:"success login",
                   token:token,
                   flag:200
               })
            }
            else{
                return res.json({
                    message:"invalid password",
                    flag:108
                })  
            }
        });
       }
});
});
Router.post('/verifyToken',(req,res)=>{
    const {authorization}=req.headers;
    let user_info=verifyToken(authorization.split(" ")[1]);
    res.send(user_info)
});
Router.post('/sslverify',bodyParser.json(),(req,res)=>{
    console.log(`REQURSTING FOR SSL_ID @${Date.now()}`);
    const SSL_CODE="SAMPLE123";
    let {ssl}=req.body;
    if(SSL_CODE===ssl){
        res.json({message:"Verified"})
    }
    else{
        res.json({message:"Not Verified"})
    }

});

Router.post('/ratings',bodyParser.json(),(req,res)=>{
    const {authorization}=req.headers;
    let token=authorization.split(" ")[1];
    const {email,role}=verifyToken(token);
    model.Factory.find({Email:email},(err,doc)=>{
        model.Rating.find({f_id:req.body.key,c_id:doc[0]._id},(err,data)=>{
            if(!err){
                if(data.length==0){
                    res.json({msg:"no data",flag:"450"})
                }
                else{
                    res.json({msg:"success",data:data,flag:"200"});
                }
            }
        })
    })
    
});
Router.post('/productInfo',bodyParser.json(),(req,res)=>{
    console.log(`REQUESTING FOR PRODUCT DETAILS @${Date.now()}`);
    model.Food.find({F_id:req.body.key},(err,data)=>{
        if(!err){
            if(data.length==0){
                res.json({msg:"no data",flag:450})
            }
            else{
                res.json({msg:"success",data:data,flag:200});
            }
        }
    })
});
//Product or Food
Router.post('/addFoodToDb',bodyParser.json(),(req,res)=>{
    let date=new Date()
    const {Name,Disc,Prize,Nut,MDate,EDate,Quantity}=req.body; 
    const {authorization} =req.headers
    let token=authorization.split(" ")[1];
    let c_id='';
    const {email,role}=verifyToken(token);
     if(role==='F'){
       model.Factory.find({Email:email},(err,data)=>{
            c_id=data[0]._id;
        }); 
     }
    model.Food.find({Name:Name},(err,data)=>{
        if(data.length===0){
            let f_id=foodID();
            model.Food({
                F_id:f_id,
                C_id:c_id,
                Name:Name,
                Disc:Disc,
                Prize:Prize,
                Nut:Nut,
                MDate:MDate,
                EDate:EDate,
                Quantity:Quantity,
                Date:date.toDateString(),
                Time:date.toTimeString(),
                W_sign:"No",
                D_sign:"No",
                R_sign:"No",
                W_id:"NULL",
                D_id:"NULL",
                R_id:"NULL",
                WV_time:"nill",
                WV_date:"nill",
                DV_time:"nill",
                DV_date:"nill",
                RV_time:"nill",
                RV_date:"nill"
            }).save((err,doc)=>{
              let year=doc.Date.split(" ")[3];
              let month=doc.Date.split(" ")[1];
              let array=RATING_ARRAY.map(d=>{if(d.month===month){d.est=50}return d})
              model.Rating({
                f_id:doc.F_id,
                c_id:doc.C_id, 
                year:year,
                data:array
              }).save();
              console.log(`PRODUCT ADDED @${Date.now()}`);
              res.json({
                  flag:200,
                  message:"sucess",
                  id:doc.id
              })
            })
        }
        else{
            res.json({
                flag:480,
                message:"Product is already Exist"
            })
        }
    })
});
Router.post('/addProductImage',(req,res)=>{
    let id=req.headers.authorization.split(" ")[1];
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.json({
                flag:500,
                message:"somthing went wrong try again"
            })
        } else if (err) {
            
            return res.json({
                flag:500,
                message:"somthing went wrong try again"
            })
            
        }
    else{
        let path=`http://127.0.0.1:3005/static/uploads/${req.file.filename}`;
        model.Food.findByIdAndUpdate(id,{Img:path},(err)=>{
            if(!err){
                console.log(` @${Date.now()}`);
                res.json({
                    flag:200,
                    message:"sucess"
                })
            }
            else{
                res.json({
                    flag:505,
                    message:"something went wrong"
                });
            }
        })
    }

 })
});

Router.post('/fetchfoods',bodyParser.json(),(req,res)=>{
   let token=req.headers.authorization.split(" ")[1];
    const {email,role}=verifyToken(token);
     if(role==='F'){
       model.Factory.find({Email:email},(err,data)=>{
           if(!err){
               model.Food.find({C_id:data[0]._id},(err,data)=>{
                   res.send(data)
               })
           }
        }); 
     }
     else if(role==='W'){
         model.WareHouse.find({Email:email},(err,data)=>{
             if(!err){
                 model.Food.find({W_id:data[0]._id},(err,data)=>{
                     res.send(data)
                 })
             }
         })
     }
     else if(role==='D'){
        model.Distributor.find({Email:email},(err,data)=>{
            if(!err){
                model.Food.find({D_id:data[0]._id},(err,data)=>{
                    res.send(data)
                })
            }
        })
    }
    else if(role==='R'){
        model.Retailer.find({Email:email},(err,data)=>{
            if(!err){
                model.Food.find({R_id:data[0]._id},(err,data)=>{
                    res.send(data)
                })
            }
        })
    }
    else{
        res.send("ERROR")
    }
})

Router.post('/fetchfoodcount',bodyParser.json(),(req,res)=>{
    let token=req.headers.authorization.split(" ")[1];
     const {email,role}=verifyToken(token);
      if(role==='F'){
        model.Factory.find({Email:email},(err,data)=>{
            if(!err){
                model.Food.find({C_id:data[0]._id},(err,data)=>{
                    res.send(data.length.toString())
                })
            }
         }); 
      }
      else if(role==='W'){
          model.WareHouse.find({Email:email},(err,data)=>{
              if(!err){
                  model.Food.find({W_id:data[0]._id},(err,data)=>{
                      res.send(data.length.toString())
                  })
              }
          })
      }
      else if(role==='D'){
        model.Distributor.find({Email:email},(err,data)=>{
            if(!err){
                model.Food.find({D_id:data[0]._id},(err,data)=>{
                    res.send(data.length.toString())
                })
            }
        })
    }
    else if(role==='R'){
        model.Retailer.find({Email:email},(err,data)=>{
            if(!err){
                model.Food.find({R_id:data[0]._id},(err,data)=>{
                    res.send(data.length.toString())
                })
            }
        })
    }
    else{
        res.send("ERROR")
    }
 })

Router.post('/fetchYear',bodyParser.json(),(req,res)=>{
    let token=req.headers.authorization.split(" ")[1];
     const {email,role}=verifyToken(token);
      if(role==='F'){
        model.Factory.find({Email:email},(err,data)=>{
            if(!err){
               res.send(data[0].Date);
            }
         }); 
      }
      else if(role==='W'){
        model.WareHouse.find({Email:email},(err,data)=>{
            if(!err){
               res.send(data[0].Date);
            }
         });  
      }
      else if(role==='D'){
        model.Distributor.find({Email:email},(err,data)=>{
            if(!err){
               res.send(data[0].Date);
            }
         });  
      }
      else if(role==='R'){
        model.Retailer.find({Email:email},(err,data)=>{
            if(!err){
               res.send(data[0].Date);
            }
         });  
      }
      else{
          res.send("Error")
      }
 });
 Router.post('/productDetailsbyId',bodyParser.json(),(req,res)=>{
     const {authorization}=req.headers;
     let token=authorization.split(" ")[1];
     const {email,role}=verifyToken(token);
     model.Factory.find({Email:email},(err,doc)=>{
        model.Food.find({F_id:req.body.id,C_id:doc[0]._id},(err,data)=>{
            res.send(data)
        })
     })
     
 });

//tracking api

//1)details API
Router.post('/PrductTracking',bodyParser.json(),(req,res)=>{
    let {product_id}= req.body;
    let details=[];
    model.Food.find({F_id:product_id},async(err,data)=>{
        if(data.length===0)return res.json({message:"In this id there is no product",flag:404});
        else{
            details.push(data);
           await model.Factory.find({_id:data[0].C_id},(err,doc1)=>{
                if(!err)details.push(doc1);
            })
            if(data[0].W_sign==="Yes"){
              await model.WareHouse.find({_id:data[0].W_id},(err,doc2)=>{
                 if(!err)details.push(doc2);
               })
            }
            else{
                res.json({message:"something went wrong",flag:404})
            }
            if(data[0].D_sign==="Yes"){
              await  model.Distributor.find({_id:data[0].D_id},(err,doc3)=>{
                    if(!err)details.push(doc3);
                  })
            }
            else{
                res.json({message:"something went wrong",flag:404})
            }
            if(data[0].R_sign==="Yes"){
               await model.Retailer.find({_id:data[0].R_id},(err,doc4)=>{
                    if(!err)details.push(doc4);
                  })
            }
            else{
                res.json({message:"something went wrong",flag:404})
            }
            res.json({
                message:"success",
                flag:200,
                details:details
            }); 
        }
    })
    
});
Router.post('/wfechcom',bodyParser.json(),(req,res)=>{
    let {key}=req.body;
    model.IdPocket.find({warehouse_key:key},(err,data)=>{
        try{
            model.Factory.find({_id:data[0].f_id},(err,doc)=>{
               res.send(doc[0].Name)
            })
        }
        catch(e){
            res.send("")
        }
        
    })
})
Router.post('/dfechcom',bodyParser.json(),(req,res)=>{
    let {key}=req.body;
    model.IdPocket.find({distributer_key:key},(err,data)=>{
        try{
            model.Factory.find({_id:data[0].f_id},(err,doc)=>{
               res.send(doc[0].Name)
            })
        }
        catch(e){
            res.send("")
        }
        
    })
})
Router.post('/rfechcom',bodyParser.json(),(req,res)=>{
    let {key}=req.body;
    model.IdPocket.find({Retailer_key:key},(err,data)=>{
        try{
            model.Factory.find({_id:data[0].f_id},(err,doc)=>{
               res.send(doc[0].Name)
            })
        }
        catch(e){
            res.send("")
        }
        
    })
});
Router.post('/productVerificationM',bodyParser.json(),(req,res)=>{
    const {id}=req.body;
    const {authorization}=req.headers;
    const {email,role}=verifyToken(authorization.split(" ")[1]);
    let dater=new Date();
    if(role==='W'){
      model.WareHouse.find({Email:email},(err,data)=>{
        let c_id=''
        model.IdPocket.find({warehouse_key:data[0].WarehouseKey},(err,data)=>{
            if(!err){ 
               c_id=data[0].f_id;
            }})
        console.log(c_id)    
        let w_id=data[0]._id;
        model.Food.find({F_id:id},(err,data)=>{
            if(!err){
                if(data.length===0){
                   res.json({
                       message:"Invalid product ID",
                       flag:404
                   })
                }
                else{
                    if(c_id===data[0].C_id){
                     if(data[0].W_id==="NULL"){
                       model.Food.findByIdAndUpdate(data[0]._id,{W_id:w_id,W_sign:"Yes",WV_date:dater.toDateString(),WV_time:dater.toTimeString()},(err,data)=>{
                           if(!err){
                               res.json(
                                   {
                                       flag:200,
                                       message:"success"
                                   }
                               )
                           }
                           else{
                            res.json(
                                {
                                    flag:500,
                                    message:"something went wrong.."
                                }
                            )
                           }
                       })
                     }
                     else{
                        res.json({
                            message:"This Product is already varified",
                            flag:404
                        })  
                     }
                    }
                    else{
                        res.json({
                            message:"The Product Your Verifying is not from Your Source.It is look like illegal process.If it is continues your Account Blocked Permenently..",
                            flag:900
                        })
                    }
                }
            }
        })
      })  
    }

    if(role==='D'){
        model.Distributor.find({Email:email},(err,data)=>{
          let c_id=''
          model.IdPocket.find({distributer_key:data[0].DistributerKey},(err,data)=>{
              if(!err){ 
                 c_id=data[0].f_id;
              }})   
          let d_id=data[0]._id;
          model.Food.find({F_id:id},(err,data)=>{
              if(!err){
                  if(data.length===0){
                     res.json({
                         message:"Invalid product ID",
                         flag:404
                     })
                  }
                  else{
                      if(c_id===data[0].C_id){
                       if(data[0].D_id==="NULL"){
                         if(data[0].W_id==="NULL"){
                             res.json({
                                 message:"This product is unathorized source..",
                                 flag:500
                             });
                         }
                         else{
                            model.Food.findByIdAndUpdate(data[0]._id,{D_id:d_id,D_sign:"Yes",DV_date:dater.toDateString(),DV_time:dater.toTimeString()},(err,data)=>{
                                if(!err){
                                    res.json(
                                        {
                                            flag:200,
                                            message:"success"
                                        }
                                    )
                                }
                                else{
                                 res.json(
                                     {
                                         flag:500,
                                         message:"something went wrong.."
                                     }
                                 )
                                }
                            })
                         }
                       }
                       else{
                          res.json({
                              message:"This Product is already varified",
                              flag:404
                          })  
                       }
                      }
                      else{
                          res.json({
                              message:"The Product Your Verifying is not from Your Source.It is look like illegal process.If it is continues your Account Blocked Permenently..",
                              flag:900
                          })
                      }
                  }
              }
          })
        })  
      }
      if(role==='R'){
        model.Retailer.find({Email:email},(err,data)=>{
          let c_id=''
          model.IdPocket.find({Retailer_key:data[0].RetailerKey},(err,data)=>{
              if(!err){ 
                 c_id=data[0].f_id;
              }})   
          let r_id=data[0]._id;
          model.Food.find({F_id:id},(err,data)=>{
              if(!err){
                  if(data.length===0){
                     res.json({
                         message:"Invalid product ID",
                         flag:404
                     })
                  }
                  else{
                      if(c_id===data[0].C_id){
                       if(data[0].R_id==="NULL"){
                         if(data[0].W_id==="NULL" || data[0].D_id==="NULL"){
                             res.json({
                                 message:"This product is unathorized source..",
                                 flag:500
                             });
                         }
                         else{
                            model.Food.findByIdAndUpdate(data[0]._id,{R_id:r_id,R_sign:"Yes",RV_date:dater.toDateString(),RV_time:dater.toTimeString()},(err,data)=>{
                                if(!err){
                                    res.json(
                                        {
                                            flag:200,
                                            message:"success"
                                        }
                                    )
                                }
                                else{
                                 res.json(
                                     {
                                         flag:500,
                                         message:"something went wrong.."
                                     }
                                 )
                                }
                            })
                         }
                       }
                       else{
                          res.json({
                              message:"This Product is already varified",
                              flag:404
                          })  
                       }
                      }
                      else{
                          res.json({
                              message:"The Product Your Verifying is not from Your Source.It is look like illegal process.If it is continues your Account Blocked Permenently..",
                              flag:900
                          })
                      }
                  }
              }
          })
        })  
      }
})
Router.post('/getNotifactions',(req,res)=>{
    const {authorization}=req.headers;
    const {email,role}=verifyToken(authorization.split(" ")[1]);
    if(role==='F'){
        model.Factory.find({Email:email},(err,data)=>{
            if(!err){
                model.notification.find({n_id:data[0]._id},(err,doc)=>{
                    if(!err){
                        res.send(doc)
                    }
                })
            }
        })
    }
    else if(role==='W'){
        model.WareHouse.find({Email:email},(err,data)=>{
            if(!err){
                model.notification.find({n_id:data[0]._id},(err,doc)=>{
                    if(!err){
                        res.send(doc)
                    }
                })
            }
        })
    }
    else if(role==='D'){
        model.Distributor.find({Email:email},(err,data)=>{
            if(!err){
                model.notification.find({n_id:data[0]._id},(err,doc)=>{
                    if(!err){
                        res.send(doc)
                    }
                })
            }
        })
    }
    else if(role==='R'){
        model.Retailer.find({Email:email},(err,data)=>{
            if(!err){
                model.notification.find({n_id:data[0]._id},(err,doc)=>{
                    if(!err){
                        res.send(doc)
                    }
                })
            }
        })
    }
    else{
        res.send("ERROR")
    }
    
})
Router.post('/profile',bodyParser.json(),(req,res)=>{
    const {authorization}=req.headers;
    const {email,role}=verifyToken(authorization.split(" ")[1])
    if(role==='F'){
        model.Factory.find({Email:email},(err,data)=>{
            if(!err){
                res.send(data)
            }
        })
    }
    else if(role==='W'){
        model.WareHouse.find({Email:email},(err,data)=>{
            if(!err){
                res.send(data)
            }
        })
    }
    else if(role==='D'){
        model.Distributor.find({Email:email},(err,data)=>{
            if(!err){
                res.send(data)
            }
        })
    }
    else if(role==='R'){
        model.Retailer.find({Email:email},(err,data)=>{
            if(!err){
                res.send(data)
            }
        })
    }
    else{
        res.send("ERROR")
    }
    
});
Router.post('/newRating',bodyParser.json(),(req,res)=>{
    const {id,rate}=req.body;
    let date=new Date();
    let month=date.toDateString().split(" ")[1];
    model.Rating.find({f_id:id},(err,data)=>{
        let arr=data[0].data;
        let t=''
        arr.map(ele=>{if(ele.month===month) t=ele.rate })
        model.Rating.update({f_id:id,'data.month':month}, {'$set': {
            'data.$.rate':(parseInt(t)+parseInt(rate)).toString(),
        }},(err,data)=>{
            if(!err){
                res.send("200")
            }
        })
    })
})
Router.post('/dateTracker',bodyParser.json(),(req,res)=>{
   const {d1,d2,t1,t2}=req.body;
   const tv=DateTracker.DateTracker(d1,d2,t1,t2);

   res.send(tv);
});
Router.post('/checknotification',bodyParser.json(),(req,res)=>{
     const {id}=req.body;
     const {authorization}=req.headers;
     let token=authorization.split(" ")[1]
     const {email,role}=verifyToken(token)
     if(role==='F'){
         model.Factory.find({Email:email},(err,data)=>{
             model.notification.update({n_id:data[0]._id,'messages._id':id},{'$set':{
                 'messages.$.checked':'true'
             }},(err,data)=>{
                 res.send("200")
             })
         })
     }
     if(role==='W'){
        model.WareHouse.find({Email:email},(err,data)=>{
            model.notification.update({n_id:data[0]._id,'messages._id':id},{'$set':{
                'messages.$.checked':'true'
            }},(err,data)=>{
                res.send("200")
            })
        })
    }
    if(role==='D'){
        model.Distributor.find({Email:email},(err,data)=>{
            model.notification.update({n_id:data[0]._id,'messages._id':id},{'$set':{
                'messages.$.checked':'true'
            }},(err,data)=>{
                res.send("200")
            })
        })
    }
    if(role==='R'){
        model.Retailer.find({Email:email},(err,data)=>{
            model.notification.update({n_id:data[0]._id,'messages._id':id},{'$set':{
                'messages.$.checked':'true'
            }},(err,data)=>{
                res.send("200")
            })
        })
    }
    
})
module.exports=Router;
