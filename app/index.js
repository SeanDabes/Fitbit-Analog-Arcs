import clock from "clock";
import * as document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import {battery} from "power";
import { today, goals } from "user-activity";
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import { me as appbit } from "appbit";
import { user } from "user-profile";
import * as messaging from "messaging";

import { FitFont } from 'fitfont';

// Update the clock every second
clock.granularity = "seconds";

const mainDigitalClock = new FitFont({ 
	id:'ClockLabel',
	font:'Titillium_Web_20',
	halign: 'middle'
})
const mainDate = new FitFont({ 
	id:'Date',
	font:'Titillium_Web_20',
	halign: 'middle'
})
const batteryLevelText = new FitFont({ 
	id:'BatteryLabel',
	font:'Titillium_Web_20',
	halign: 'middle'
})
const batteryLevelLowText = new FitFont({ 
	id:'BatteryLabelLow',
	font:'Titillium_Web_20b',
	halign: 'middle'
})
const batteryLevelGauge = document.getElementById("BatteryArc");
const batteryLevelBackground = document.getElementById("BatteryBackground");
const BatteryIcon = document.getElementById("BatteryIcon");
const StepsIcon = document.getElementById("StepsImg");
const StepsText = new FitFont({ 
	id:'StepsText',
	font:'Titillium_Web_20',
	halign: 'middle'
})
const StepsTextBold = new FitFont({ 
	id:'StepsTextBold',
	font:'Titillium_Web_20b',
	halign: 'middle'
})
const StepsProgress = document.getElementById("StepsArc");
const DistanceIcon = document.getElementById("DistanceImg");
const DistanceText = new FitFont({ 
	id:'DistanceText',
	font:'Titillium_Web_20',
	halign: 'middle'
})
const DistanceTextBold = new FitFont({ 
	id:'DistanceTextBold',
	font:'Titillium_Web_20b',
	halign: 'middle'
})
const DistanceProgress = document.getElementById("DistanceArc");
const CaloriesIcon = document.getElementById("CaloriesImg");
const CaloriesText = new FitFont({ 
	id:'CaloriesText',
	font:'Titillium_Web_20',
	halign: 'middle'
})
const CaloriesTextBold = new FitFont({ 
	id:'CaloriesTextBold',
	font:'Titillium_Web_20b',
	halign: 'middle'
})
const CaloriesProgress = document.getElementById("CaloriesArc");
const AZMIcon = document.getElementById("AZMImg");
const ZonesText = new FitFont({ 
	id:'ZonesText',
	font:'Titillium_Web_20',
	halign: 'middle'
})
const ZonesTextBold = new FitFont({ 
	id:'ZonesTextBold',
	font:'Titillium_Web_20b',
	halign: 'middle'
})
const ZonesProgress = document.getElementById("ZonesArc");
const ElevationIcon = document.getElementById("ElevationImg");
const ElevationText = new FitFont({ 
	id:'ElevationText',
	font:'Titillium_Web_20',
	halign: 'middle'
})
const ElevationTextBold = new FitFont({ 
	id:'ElevationTextBold',
	font:'Titillium_Web_20b',
	halign: 'middle'
})
const ElevationProgress = document.getElementById("ElevationArc");
const HRText = new FitFont({ 
	id:'HRText',
	font:'Titillium_Web_20',
	halign: 'start'
})
const body = new BodyPresenceSensor();
const heart_rate = new HeartRateSensor();
const HRIcon = document.getElementById("HRImg");
const HRrestBar = document.getElementById("HRrestBar");
const HRfatburnBar = document.getElementById("HRfatburnBar");
const HRcardioBar = document.getElementById("HRcardioBar");
const HRpeakBar = document.getElementById("HRpeakBar");
const BackgroundGradient = document.getElementById("BackgroundGradient");
const hourHand = document.getElementById("hours");
const minHand = document.getElementById("minutes");
const secHand = document.getElementById("seconds");
const hourHandShadow = document.getElementById("hoursshadow");
const minHandShadow = document.getElementById("minutesshadow");
const secHandShadow = document.getElementById("secondsshadow");
const hourscolor1 = document.getElementById("hourshandcolor1");
const hourscolor2 = document.getElementById("hourshandcolor2");
const minutescolor1 = document.getElementById("minuteshandcolor1");
const minutescolor2 = document.getElementById("minuteshandcolor2");
const secondscolor1 = document.getElementById("secondshandcolor1");
const secondscolor2 = document.getElementById("secondshandcolor2");
const circlecenter = document.getElementById("circlecenter");
const num12 = new FitFont({ 
	id:'num12',
	font:'Titillium_Web_30',
	halign: 'middle'
})
num12.text = "12";
const num3 = new FitFont({ 
	id:'num3',
	font:'Titillium_Web_30',
	halign: 'end'
})
num3.text = "3";
const num6 = new FitFont({ 
	id:'num6',
	font:'Titillium_Web_30',
	halign: 'middle'
})
num6.text = "6";
const num9 = new FitFont({ 
	id:'num9',
	font:'Titillium_Web_30',
	halign: 'start',
})
num9.text = "9";

body.start();

if (appbit.permissions.granted("access_heart_rate")) {
  if (!body.present) {
      heart_rate.stop();
      no_heart_rate();
    } 
  else {
      heart_rate.start();
    }
}
else {
  no_heart_rate();
}

heart_rate.addEventListener("reading", () => {
  update_heart_rate(heart_rate);
});

messaging.peerSocket.addEventListener("open", (evt) => {
	if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
	   messaging.peerSocket.send("SetTheme");
	} else {
		console.log("No message sent");
	};
});

// Update all elements every tick with the current time
clock.ontick = (evt) => {
  update_clock(evt);
  update_steps(evt);
  update_distance(evt);
  update_calories(evt);
  update_activezones(evt);
  update_elevation(evt);
}

body.addEventListener("reading", () => {
  if (appbit.permissions.granted("access_heart_rate")) {
    if (!body.present) {
      heart_rate.stop();
      no_heart_rate();
    } else {
      heart_rate.start();
    }
  }
  else {
    no_heart_rate();
  }
});

// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours, minutes) {
  let hourAngle = (360 / 12) * hours;
  let minAngle = (360 / 12 / 60) * minutes;
  return hourAngle + minAngle;
  // return 305; // only for screenshots
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes) {
  return (360 / 60) * minutes;
  // return 60; //only for screenshots
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds) {
  return (360 / 60) * seconds;
  // return 180; //only for screenshots
}

function update_clock(evt) {
  let today = evt.date;
  let hours = today.getHours();
  let seconds = util.zeroPad(today.getSeconds());
  let day = today.getDate();
  const daysweek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const d = new Date();
  let month = months[d.getMonth()];
  let dayweek = daysweek[d.getDay()];
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  mainDigitalClock.text = `${hours}:${mins}`;
  // mainDigitalClock.text = "22:10"; //only for screenshots
  mainDate.text = `${dayweek} ${day} ${month}`;
  
  hourHandShadow.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minHandShadow.groupTransform.rotate.angle = minutesToAngle(mins);
  minHand.groupTransform.rotate.angle = minutesToAngle(mins);
  secHandShadow.groupTransform.rotate.angle = secondsToAngle(seconds);
  secHand.groupTransform.rotate.angle = secondsToAngle(seconds);
}

//Initialize battery level and create function to update battery
//as the battery level changes
update_battery();

battery.onchange = (charger, evt) => {
	update_battery();
}

function update_battery(evt){
  batteryLevelGauge.sweepAngle = Math.floor((240*battery.chargeLevel)/100);
  if (battery.chargeLevel > 20) {
	batteryLevelText.text = `${battery.chargeLevel}%`;
	batteryLevelLowText.text = "";
  }
  if (battery.chargeLevel <= 20) {
	batteryLevelText.text = "";
	batteryLevelLowText.text = `${battery.chargeLevel}%`;
  }
}
  
function update_steps(evt){
  if (today.adjusted.steps >= goals.steps) {
    StepsProgress.sweepAngle = 240;
	StepsText.text = "";
	StepsTextBold.text = today.adjusted.steps;
  } else {
    StepsProgress.sweepAngle = Math.floor((240*today.adjusted.steps)/goals.steps);
	StepsText.text = today.adjusted.steps;
	StepsTextBold.text = "";
  }
}

function update_distance(evt) {
  if (today.adjusted.distance >= goals.distance) {
    DistanceProgress.sweepAngle = 240;
	DistanceText.text = "";
	DistanceTextBold.text = today.adjusted.distance;
  } else {
    DistanceProgress.sweepAngle = Math.floor((240*today.adjusted.distance)/goals.distance);
	DistanceText.text = today.adjusted.distance;
	DistanceTextBold.text = "";
  }
}

function update_calories(evt) {
  if (today.adjusted.calories >= goals.calories) {
    CaloriesProgress.sweepAngle = 240;
	CaloriesText.text = "";
	CaloriesTextBold.text = today.adjusted.calories;
  } else {
    CaloriesProgress.sweepAngle = Math.floor((240*today.adjusted.calories)/goals.calories);
	CaloriesText.text = today.adjusted.calories;
	CaloriesTextBold.text = "";
  }
}

function update_activezones(evt) {
  if (today.adjusted.activeZoneMinutes.total >= goals.activeZoneMinutes.total) {
    ZonesProgress.sweepAngle = 240;
	ZonesText.text = "";
	ZonesTextBold.text = today.adjusted.activeZoneMinutes.total;
  } else {
    ZonesProgress.sweepAngle = Math.floor((240*today.adjusted.activeZoneMinutes.total)/goals.activeZoneMinutes.total);
	ZonesText.text = today.adjusted.activeZoneMinutes.total;
	ZonesTextBold.text = "";
  }
}

function update_elevation(evt) {
  if (today.adjusted.elevationGain >= goals.elevationGain) {
    ElevationProgress.sweepAngle = 240;
	ElevationText.text = "";
	ElevationTextBold.text = today.adjusted.elevationGain;
  } else {
    ElevationProgress.sweepAngle = Math.floor((240*today.adjusted.elevationGain)/goals.elevationGain);
	ElevationText.text = today.adjusted.elevationGain;
	ElevationTextBold.text = "";
  }
}

function update_heart_rate(heart_rate) {
  HRText.text = heart_rate.heartRate;
  if (user.heartRateZone(heart_rate.heartRate) == "out-of-range") { //resting
    HRrestBar.style.opacity = 1;
    HRfatburnBar.style.opacity = 0.4;
    HRcardioBar.style.opacity = 0.4;
    HRpeakBar.style.opacity = 0.4;
  }
  else if (user.heartRateZone(heart_rate.heartRate) == "fat-burn") { //fat burn
    HRrestBar.style.opacity = 1;
    HRfatburnBar.style.opacity = 1;
    HRcardioBar.style.opacity = 0.4;
    HRpeakBar.style.opacity = 0.4;
  }
  else if (user.heartRateZone(heart_rate.heartRate) == "cardio") { //cardio
    HRrestBar.style.opacity = 1;
    HRfatburnBar.style.opacity = 1;
    HRcardioBar.style.opacity = 1;
    HRpeakBar.style.opacity = 0.4;
  }
  else if (user.heartRateZone(heart_rate.heartRate) == "peak") { // peak
    HRrestBar.style.opacity = 1;
    HRfatburnBar.style.opacity = 1;
    HRcardioBar.style.opacity = 1;
    HRpeakBar.style.opacity = 1;
  }
}

function no_heart_rate() {
  HRText.text = "--";
}

function default_theme() {
  secondscolor1.style.fill = "red";
  circlecenter.style.fill = "red";
  batteryLevelGauge.style.fill = "silver";
  StepsProgress.style.fill = "fb-green";
  DistanceProgress.style.fill = "fb-indigo";
  CaloriesProgress.style.fill = "fb-orange";
  ZonesProgress.style.fill = "fb-peach";
  ElevationProgress.style.fill = "fb-violet";
  HRrestBar.style.fill = "fb-red";
  HRfatburnBar.style.fill = "fb-red";
  HRcardioBar.style.fill = "fb-red";
  HRpeakBar.style.fill = "fb-red";
  num12.style.fill = "white";
  num3.style.fill = "white";
  num6.style.fill = "white";
  num9.style.fill = "white";
  BackgroundGradient.gradient.colors.c1 = "fb-dark-gray";  
}

function change_theme(theme){
  if (theme === "cornflowerblue") {
    let color1 = "cornflowerblue";
    let color2 = "midnightblue";
    let color3 = "royalblue";
  }
  if (theme === "indianred") {
    let color1 = "indianred";
    let color2 = "maroon";
    let color3 = "red";
  }
  if (theme === "darkseagreen") {
    let color1 = "darkseagreen";
    let color2 = "darkgreen";
    let color3 = "green";
  }
  if (theme === "darksalmon") {
    let color1 = "darksalmon";
    let color2 = "sienna";
    let color3 = "orange";
  }
  if (theme === "violet") {
    let color1 = "violet";
    let color2 = "mediumorchid";
    let color3 = "fb-magenta";
  }
  if (theme === "white") {
    default_theme();
    return;
  }
  secondscolor1.style.fill = color3;
  circlecenter.style.fill = color3;
  batteryLevelGauge.style.fill = color1;
  StepsProgress.style.fill = color1;
  DistanceProgress.style.fill = color1;
  CaloriesProgress.style.fill = color1;
  ZonesProgress.style.fill = color1;
  ElevationProgress.style.fill = color1;
  HRrestBar.style.fill = color1;
  HRfatburnBar.style.fill = color1;
  HRcardioBar.style.fill = color1;
  HRpeakBar.style.fill = color1;
  num12.style.fill = color3;
  num3.style.fill = color3;
  num6.style.fill = color3;
  num9.style.fill = color3;
  BackgroundGradient.gradient.colors.c1 = color2;
}

messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt && evt.data && evt.data.key === "Theme") {
    change_theme(evt.data.value);
  }
});

