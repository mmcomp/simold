var storage = window.localStorage;
var url = 'http://sim.pdr.co.ir/';
var data=[];
var cb;
var sendData = false;
var send_index = 0;
var global_smo = '-';
var counter = 0;
var max_sent = 1000;
function addCounter(co){
  var out = false;
  co = co || 1;
  if(counter+co<max_sent){
    counter+=co;
    storage.setItem('counter', counter);
    out = true;
  }
  return out;
}
function resetCounter(){
  counter = 0;
  storage.setItem('counter', 0);
}
function getData(){
  // alert('getData()');
  data = [];
  $.get(url,function(result){
    // alert(result);
    try{
      
      var messages = result.split('%%');
      for(var i = 0;i < messages.length;i++){
        if(messages[i].split('||').length>1){
          var m = {
            id:messages[i].split('||')[0],
            number:messages[i].split('||')[1],
            msg:messages[i].split('||')[2],
            stat:0
          };
          data.push(m);
        }
      }
      
      sendAll(function(){
        if(sendData){
          setTimeout(function(){
            getData()
          },500);
        }
      });
      
    }catch(e){
      alert(e.message);
    }
  });
}

function sendAll(fn){
  if(data[send_index]){
    if(addCounter()){
      sendSms(data[send_index].number,data[send_index].msg,function(){
        data[send_index].stat = 1;
        sentSms(data[send_index].id);
        send_index++;
        $("#statp").find('span').html(counter);
        sendAll(fn);
      },function(){
        data[send_index].stat = -1;
        send_index++;
        $("#statp").find('span').html(counter);
        sendAll(fn);
        alert('sms error');
      });
    }else{
      send_index = 0;
      if(typeof(fn)=='function'){
        fn();
      }
      $("#statp").css('color','yellow');
      alert('اتمام تعداد مجاز');
    }
  }else{
    send_index = 0;
    if(typeof(fn)=='function'){
      fn();
    }
  }
}
function sendSms(number,message,success,error){
  var options = {
    replaceLineBreaks: false, 
    android: {
        intent: '' 
    }
  };
  sms.send(number, message, options, success, error);
}

function sentSms(id){
  var surl = url+"?mid="+id+"&smo="+global_smo;
  $.get(surl,function(result){
  });
}
function setSim(){
  
  var smo = $("#mobile").val();
  storage.setItem('mobile', smo);
  $("#last-mobile").html(smo);
  global_smo = smo;
  
  var tmax = parseInt($("#max-send").val().trim(),10);
  console.log(tmax,max_sent);
  if(!isNaN(tmax) && tmax!==max_sent){
    storage.setItem('max-send', parseInt($("#max-send").val().trim(),10));
  }
}
var getFunction = function(){
  sendData = true;
  $("#statp").html('Enabled <span>0</span>').css('color','green');
  getData();
};
var stopFunction = function(){
  sendData = false;
  $("#statp").html('Disabled').css('color','red');
};
/*
var counter = 0;
function backgrounding(){
  alert(counter);
  sendSms('09155193104','counter = '+counter , function(){
    
  }, function(){
    
  });
}
*/
var deviceReady = function(){
//   alert('aaaa');
  global_smo = storage.getItem('mobile');
  counter = storage.getItem('counter');
  console.log('counter',counter);
  if(counter==null){
    counter = 0;
  }
  max_sent = storage.getItem('max-send');
//   console.log('max-send',max_sent);
  if(global_smo)
    $("#last-mobile").html(global_smo);
  else
    $("#last-mobile").html('-');
  if(max_sent){
    max_sent = parseInt(max_sent, 10);
    $("#max-send").val(max_sent);
  }else{
    max_sent = 1000;
    $("#max-send").val('1000');
  }
  /*
  cb = cordova.plugins.backgroundMode;
  cb.enable();
  cb.on('activate', function() {
     cb.disableWebViewOptimizations();
  });
  */
};
document.addEventListener("deviceready", deviceReady, false);
// $(document).ready(function(){deviceReady();});
