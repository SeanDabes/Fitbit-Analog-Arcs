import { settingsStorage } from "settings";
import * as messaging from "messaging";
import { me as companion } from "companion";

let THEME_COLOR = "Theme";

// Settings have been changed
settingsStorage.addEventListener("change", (evt) => {
  sendValue(evt.key, evt.newValue);
});

// Settings were changed while the companion was not running
if (companion.launchReasons.settingsChanged) {
  // Send the value of the setting
  sendValue(THEME_COLOR, settingsStorage.getItem(THEME_COLOR));
}

function sendValue(key, val) {
  if (val) {
    sendSettingData({
      key: key,
      value: JSON.parse(val)
    });
  }
}
function sendSettingData(data) {
  // If we have a MessageSocket, send the data to the device
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.log("No peerSocket connection");
  }
}

messaging.peerSocket.addEventListener("message", (evt) => {
	if (evt.data === "SetTheme") {
		sendValue(THEME_COLOR, settingsStorage.getItem(THEME_COLOR));
	} else {
		console.warn("Couldn't get the theme");
	}
});
