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
import { display } from "display";

// Update the clock every second
clock.granularity = "seconds";

const mainDigitalClock = document.getElementById("ClockLabel");
const mainDate = document.getElementById("Date");
const batteryLevelText = document.getElementById("BatteryLabel");
const batteryLevelGauge = document.getElementById("BatteryArc");
const batteryLevelBackground = document.getElementById("BatteryBackground");
const BatteryIcon = document.getElementById("BatteryIcon");
const StepsIcon = document.getElementById("StepsImg");
const StepsText = document.getElementById("StepsText");
const StepsProgress = document.getElementById("StepsArc");
const DistanceIcon = document.getElementById("DistanceImg");
const DistanceText = document.getElementById("DistanceText");
const DistanceProgress = document.getElementById("DistanceArc");
const CaloriesIcon = document.getElementById("CaloriesImg");
const CaloriesText = document.getElementById("CaloriesText");
const CaloriesProgress = document.getElementById("CaloriesArc");
const AZMIcon = document.getElementById("AZMImg");
const ZonesText = document.getElementById("ZonesText");
const ZonesProgress = document.getElementById("ZonesArc");
const ElevationIcon = document.getElementById("ElevationImg");
const ElevationText = document.getElementById("ElevationText");
const ElevationProgress = document.getElementById("ElevationArc");
const HRText = document.getElementById("HRText");
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
const hourscolor1 = document.getElementById("hourshandcolor1");
const hourscolor2 = document.getElementById("hourshandcolor2");
const minutescolor1 = document.getElementById("minuteshandcolor1");
const minutescolor2 = document.getElementById("minuteshandcolor2");
const secondscolor1 = document.getElementById("secondshandcolor1");
const secondscolor2 = document.getElementById("secondshandcolor2");
const circlecenter = document.getElementById("circlecenter");
const num12 = document.getElementById("num12");
const num3 = document.getElementById("num3");
const num6 = document.getElementById("num6");
const num9 = document.getElementById("num9");

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
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes) {
  return (360 / 60) * minutes;
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds) {
  return (360 / 60) * seconds;
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
  mainDigitalClock.text = `${util.monoDigits(hours)}:${util.monoDigits(mins)}`;
  mainDate.text = `${dayweek} ${day} ${month}`;
  
  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minHand.groupTransform.rotate.angle = minutesToAngle(mins);
  secHand.groupTransform.rotate.angle = secondsToAngle(seconds);
}

//Initialize battery level and create function to update battery
//as the battery level changes
batteryLevelText.text = `${battery.chargeLevel}%`;

battery.onchange = (charger, evt) => {
  batteryLevelText.text = `${battery.chargeLevel}%`;
  batteryLevelGauge.sweepAngle = Math.floor((240*battery.chargeLevel)/100);
  if (battery.chargeLevel > 20) {
    //batteryLevelGauge.style.fill = 'limegreen';
    //BatteryIcon.style.fill = 'limegreen';
    //batteryLevelBackground.style.fill = 'limegreen';
        batteryLevelText.style.fill = 'white';
//  }
//  if (battery.chargeLevel < 40) {
//    batteryLevelGauge.style.fill = 'orange';
//    BatteryIcon.style.fill = 'orange';
    //batteryLevelBackground.style.fill = 'orange';
  }
  if (battery.chargeLevel <= 20) {
    //batteryLevelGauge.style.fill = 'red';
    //BatteryIcon.style.fill = 'red';
    //batteryLevelBackground.style.fill = 'red';
    batteryLevelText.style.fill = 'red';
  }
}
  
function update_steps(evt){
  StepsText.text = today.adjusted.steps;
  if (today.adjusted.steps >= goals.steps) {
    StepsProgress.sweepAngle = 240;
  } else {
    StepsProgress.sweepAngle = Math.floor((240*today.adjusted.steps)/goals.steps);
  }
}

function update_distance(evt) {
  DistanceText.text = today.adjusted.distance;
  if (today.adjusted.distance >= goals.distance) {
    DistanceProgress.sweepAngle = 240;
  } else {
    DistanceProgress.sweepAngle = Math.floor((240*today.adjusted.distance)/goals.distance);
  }
}

function update_calories(evt) {
  CaloriesText.text = today.adjusted.calories;
  if (today.adjusted.calories >= goals.calories) {
    CaloriesProgress.sweepAngle = 240;
  } else {
    CaloriesProgress.sweepAngle = Math.floor((240*today.adjusted.calories)/goals.calories);
  }
}

function update_activezones(evt) {
  ZonesText.text = today.adjusted.activeZoneMinutes.total;
  if (today.adjusted.activeZoneMinutes.total >= goals.activeZoneMinutes.total) {
    ZonesProgress.sweepAngle = 240;
  } else {
    ZonesProgress.sweepAngle = Math.floor((240*today.adjusted.activeZoneMinutes.total)/goals.activeZoneMinutes.total);
  }
}

function update_elevation(evt) {
  ElevationText.text = today.adjusted.elevationGain;
  if (today.adjusted.elevationGain >= goals.elevationGain) {
    ElevationProgress.sweepAngle = 240;
  } else {
    ElevationProgress.sweepAngle = Math.floor((240*today.adjusted.elevationGain)/goals.elevationGain);
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
  secondscolor2.style.fill = "red";
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
  secondscolor2.style.fill = color3;
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

