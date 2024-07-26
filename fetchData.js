// Javascript to interpret the JSON we get from the server (from hac.php)
// into the output HTML. The "message" is set by the file message.dat on the server.
// The "header" part can optionally be set in the file header.dat.
//
// JSON is something like this (the header part is optional as there is a default) :
//
// {"message":" GONG <A HREF="https://monitor.nso.edu">status</a> monitor",
//  "siteInfo":[
//    {"movieURL":"https://gong2.nso.edu/products/scaleViewTest/view.php?configFile=configs/hAlphaColor.cfg&productIndex=3",
//     "imageLink":"https://gong2.nso.edu/HA/hac/202211/20221102/20221102145712Ch.jpg",
//     "age":242,
//     "siteCode":"C"},
//    {"movieURL":"https://gong2.nso.edu/products/scaleViewTest/view.php?configFile=configs/hAlphaColor.cfg&productIndex=2",
//     "imageLink":"https://gong2.nso.edu/HA/hac/202211/20221102/20221102145652Th.jpg",
//     "age":262,
//     "siteCode":"T"}
//  ]} 
//
// Ages are measured in seconds. Data are sorted into order of ascending age.
//
// Niles Oien October 2022.
//

// Pass in the age in seconds, get a suitable descriptor string.
function getAgeString( age ){

 if (age < 60){ return age + " Seconds"; }

 if (age < 3600){
  minutes = Math.floor(age/60.0);
  seconds = age % 60;
  return minutes + " Minutes " + seconds + " Seconds";
 }

 if (age < 86400){
  hours = Math.floor(age/3600.0);
  minutes = Math.round((age % 3600) / 60);
  return hours + " Hours " + minutes + " Minutes";
 }

 if (age >= 86400*10){ // Ten days old means no data found
  return "No recent data";
 }

 days = Math.floor(age/86400.0);
 hours = Math.round((age % 86400) / 3600);
 return days + " Days " + hours + " Hours";

}



// Pass in an H-Alpha site code, get back the full site name.
function getFullName( siteCode ){

 if (siteCode == "M"){ return "Mauna Loa, HI, United States"; }
 if (siteCode == "B"){ return "Big Bear, CA, United States"; }
 if (siteCode == "C"){ return "Cerro Tololo, Chile"; }
 if (siteCode == "Z"){ return "Boulder, CO, United States (Engineering)"; }
 if (siteCode == "L"){ return "Learmonth, Australia"; }
 if (siteCode == "U"){ return "Udaipur, India"; }
 if (siteCode == "T"){ return "El Tiede, Spain"; }

 return siteCode;

}

// The main update function.
async function fetchData() {

 // Get data from the server.
 let response = await fetch('https://gong2.nso.edu/products/hAlphaLatest/hac.php');

 if (response.status != 200) {
  alert(response.statusText);
  return;
 }


 let data = await response.text();
 let reply=JSON.parse(data);

 // Put together the main HTML table from the data we got from the server.
 let h="<table><tr><th>Site</th><th>Data age</th><th>Latest</th><th>Movie</th></tr>";
 for(var i=0; i < reply.siteInfo.length; i++){
  h += "<tr><td>" + getFullName(reply.siteInfo[i].siteCode) + "</td><td>" + getAgeString(reply.siteInfo[i].age) + "</td>";


  // For the links - if they are URLs (if they start with http) then put them in as links,
  // otherwise just put them in the table as text.
  if (reply.siteInfo[i].imageLink.startsWith('http')){
   h += "<td><A HREF=\"" + reply.siteInfo[i].imageLink + "\" target=\"_blank\">Latest</a></td>";
  } else {
   h += "<td>" + reply.siteInfo[i].imageLink + "</td>";
  }

  if (reply.siteInfo[i].movieURL.startsWith('http')){
   h += "<td><A HREF=\"" + reply.siteInfo[i].movieURL  + "\" target=\"_blank\">Movie</a></td></tr>";
  } else {
   h += "<td>" + reply.siteInfo[i].movieURL  + "</td></tr>";
  }
 }

 h += "</table>";


 // Get the header, if it was not sent then use default.
 let pageHeader = "NSO GONG H-Alpha Solar Observing Station Status";
 if (typeof reply.header !== 'undefined'){
  pageHeader = reply.header;
 }

 document.getElementById('header').innerHTML=pageHeader;

 // Update the actual paragraphs in index.html
 let s= new Date().toLocaleString();
 let timePara=document.getElementById('timePara');
 timePara.innerHTML="Updated " + s + " local time";

 let mainPara=document.getElementById('mainPara');
 mainPara.innerHTML=h;
 
 let messagePara=document.getElementById('messagePara');
 messagePara.innerHTML=reply.message;

 // Set the next update for about five minutes time.
 setTimeout(fetchData, 300000);

 return;

}

fetchData();

