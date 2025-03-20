document.addEventListener("DOMContentLoaded", loadAlarms);
let alarmTimeout;
let ringingAlarm = null;

function setAlarm() {
    let alarmTime = document.getElementById("alarm-time").value;
    let alarmNote = document.getElementById("alarm-note").value;

    if (!alarmTime) {
        alert("Please set a valid alarm time!");
        return;
    }

    let alarmTimestamp = new Date(alarmTime).getTime();
    let currentTime = new Date().getTime();
    let timeDifference = alarmTimestamp - currentTime;

    if (timeDifference <= 0) {
        alert("Please set a future time!");
        return;
    }

    // Save alarm to LocalStorage
    let alarmData = { time: alarmTime, note: alarmNote };
    let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
    alarms.push(alarmData);
    localStorage.setItem("alarms", JSON.stringify(alarms));

    // Schedule alarm
    alarmTimeout = setTimeout(() => triggerAlarm(alarmData), timeDifference);

    // Reload alarm list
    loadAlarms();

    alert("Alarm set successfully!");
}

function triggerAlarm(alarm) {
    let audio = document.getElementById("alarm-sound");
    audio.play();
    ringingAlarm = alarm;

    // Show alarm control buttons
    document.getElementById("alarm-controls").classList.remove("hidden");

    // Show notification
    if (Notification.permission === "granted") {
        new Notification("⏰ Alarm Alert!", {
            body: alarm.note || "Time's up!",
            icon: "alarm-icon.png" // Optional: Add an icon
        });
    } else {
        alert("⏰ Alarm: " + (alarm.note || "Time's up!"));
    }

    // Remove alarm from storage after it rings
    removeAlarmByTime(alarm.time);
}

function stopAlarm() {
    let audio = document.getElementById("alarm-sound");
    audio.pause();
    audio.currentTime = 0;
    ringingAlarm = null;

    document.getElementById("alarm-controls").classList.add("hidden");
}

function snoozeAlarm() {
    if (!ringingAlarm) return;

    stopAlarm();
    let snoozeTime = new Date().getTime() + 5 * 60 * 1000; // 5 minutes later

    let snoozeAlarmData = {
        time: new Date(snoozeTime).toISOString().slice(0, 16),
        note: "Snoozed: " + ringingAlarm.note
    };

    let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
    alarms.push(snoozeAlarmData);
    localStorage.setItem("alarms", JSON.stringify(alarms));

    alarmTimeout = setTimeout(() => triggerAlarm(snoozeAlarmData), 5 * 60 * 1000);
    loadAlarms();
}

function removeAlarmByTime(time) {
    let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
    alarms = alarms.filter(alarm => alarm.time !== time);
    localStorage.setItem("alarms", JSON.stringify(alarms));
    loadAlarms();
}

function loadAlarms() {
    let alarmList = document.getElementById("alarm-list");
    alarmList.innerHTML = "";
    let alarms = JSON.parse(localStorage.getItem("alarms")) || [];

    alarms.forEach((alarm, index) => {
        let li = document.createElement("li");
        li.innerHTML = `🕒 ${alarm.time} - 📌 ${alarm.note}`;

        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌ Remove";
        deleteBtn.onclick = () => removeAlarm(index);

        li.appendChild(deleteBtn);
        alarmList.appendChild(li);
    });
}

function removeAlarm(index) {
    let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
    alarms.splice(index, 1);
    localStorage.setItem("alarms", JSON.stringify(alarms));
    loadAlarms();
}

// Request notification permission
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}
