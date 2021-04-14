const model=require('../Models/Models');
const notificationBucket=async(id)=>{
  await model.notification({
      n_id:id,
      messages:[]
  }).save();
}
const pushNotification=(id,message)=>{
       model.notification.findOneAndUpdate({n_id:id},{
        $push:{messages:{text:message,checked:"false"}}
    },(err,data)=>{
        console.log("NOTIFICATION DONE")
    })
}
module.exports={
    notificationBucket:notificationBucket,
    pushNotification:pushNotification
}