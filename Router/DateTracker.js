const month=(m)=>{
    if(m==='Jan'){
        return 1;
    }
    if(m==='Feb'){
        return 2;
    }
    if(m==='Mar'){
        return 3;
    }
    if(m==='Apr'){
        return 4;
    }
    if(m==='May'){
        return 5;
    }
    if(m==='Jun'){
        return 6;
    }
    if(m==='Jul'){
        return 7;
    }
    if(m==='Aug'){
        return 8;
    }
    if(m==='Sep'){
        return 9;
    }
    if(m==='Oct'){
        return 10;
    }
    if(m==='Nov'){
        return 11;
    }
    if(m==='Dec'){
        return 12;
    }
}
const TimeFormat=(tm)=>{
   let StTime='';
   StTime=tm.split(" ")[0];
   return StTime;
}
const DateFormat=(dt)=>{
let d=dt.split(" ");
let dat='';
let dd=d[2];
let yyyy=d[3];
let mm=month(d[1]);
dat=`${mm}/${dd}/${yyyy}`
return dat;
}
const DateTracker=(d1,d2,t1,t2)=>
{
    let date1=new Date(DateFormat(d1));
    let date2=new Date(DateFormat(d2));
    let time1 =TimeFormat(t1).split(':');
    let time2 =TimeFormat(t2).split(':');
    let days=parseFloat((date2.getTime()-date1.getTime())/(1000*3600*24));
    if(days)
    {
        return `${days} days...`;
    }
    else
    {
    let time_start = new Date();
    let time_end = new Date();
    time_start.setHours(time1[0], time1[1],time1[2], 0)
    time_end.setHours(time2[0], time2[1], time2[2], 0)
    let min=(time_end - time_start)/1000/60;
    if(min>=60){
      let hr=parseInt(min/60);
      let m=min%60;
      return `${hr} hr ${m.toFixed(0)} min`;
    }
    else{
      return `${min.toFixed(0)} min`;
    } 
    }
}
module.exports={
    DateTracker:DateTracker
}