const database=require('mongoose');

database.connect('mongodb://127.0.0.1:27017/SupplyChain',{ useUnifiedTopology: true,useNewUrlParser: true },function(){
    console.log("CONNECTED TO DATABASE....");
});
const FactorySchema=database.Schema({
    Name:String,
    Email:String,
    Phno:String,
    Address:String,
    Location:String,
    Type:String,
    Password:String,
    Date:String,
    Owner:String,
    Role:String
});
const WareHouseSchema=database.Schema({
    Name:String,
    Email:String,
    Phno:String,
    Address:String,
    Location:String,
    Password:String,
    Date:String,
    Owner:String,
    WarehouseKey:String,
    Src:String,
    Role:String
});
const DistributorSchema=database.Schema({
    Name:String,
    Email:String,
    Phno:String,
    Address:String,
    Location:String,
    Password:String,
    Date:String,
    Owner:String,
    DistributerKey:String,
    Src:String,
    Role:String
});
const RetailerSchema=database.Schema({
    Name:String,
    Email:String,
    Phno:String,
    Address:String,
    Location:String,
    Password:String,
    Date:String,
    Owner:String,
    RetailerKey:String,
    Src:String,
    Role:String
});
const IdPocketSchema=database.Schema({
    f_id:String,
    warehouse_key:String,
    distributer_key:String,
    Retailer_key:String,
});

const FoodSchema=database.Schema({
    F_id:String,
    C_id:String,
    Name:String,
    Disc:String,
    Prize:String,
    Nut:String,
    Img:String,
    MDate:String,
    EDate:String,
    Quantity:String,
    Date:String,
    Time:String,
    W_sign:String,
    D_sign:String,
    R_sign:String,
    W_id:String,
    D_id:String,
    R_id:String,
    WV_time:String,
    WV_date:String,
    DV_time:String,
    DV_date:String,
    RV_time:String,
    RV_date:String

});
const ratingSchema=database.Schema({
    f_id:String,
    year:String,
    c_id:String,
    data:[
        {
          month: String,
          rate:String,
          est:String
        }
      ]
})
const notificationSchema=database.Schema({
    n_id:String,
    messages:[{
        text:String,
        checked:String
    }]
});
const notification=database.model('notification',notificationSchema)
const Rating=database.model('ratings',ratingSchema);
const Factory=database.model('factories',FactorySchema);
const IdPocket=database.model('idpocket',IdPocketSchema);
const WareHouse=database.model('warehouse',WareHouseSchema);
const Distributor=database.model('distributor',DistributorSchema);
const Retailer=database.model('retailer',RetailerSchema);
const Food=database.model('product',FoodSchema);

module.exports={
    Factory:Factory,
    IdPocket:IdPocket,
    WareHouse:WareHouse,
    Distributor:Distributor,
    Retailer:Retailer,
    Food:Food,
    Rating:Rating,
    notification:notification
}