"use strict";

const formEl = document.getElementById("form");
const summaryEl = document.getElementById("summary");

const peopleCountEl = document.getElementById("people-count");
const firstNightEl = document.getElementById("first-night");
const lastNightEl = document.getElementById("last-night");
const dateErrorEl = document.getElementById("date-error");

const roomsCountEl = document.getElementById("rooms-count");
const roomsGridEl = document.getElementById("rooms-grid");
const roomCardTemplate = document.getElementById("room-card-template");
const roomModalEl = document.getElementById("room-modal");

const reserveButtonEl = document.getElementById("reserve-button");
const timelineEl = document.getElementById("timeline");

const ROOM_TYPES = {
    twoDouble: {
        label: "2 ágyas szoba (dupla ággyal)",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis, omnis. Placeat voluptas fugitquidem. Vero mollitia quia excepturi fuga quasi ratione, nemo voluptates neque, odit nihilblanditiis aut expedita doloribus!",
        capacity: 2,
        image: "/media/2egybe.jpg"
    },
    twoSeperate: {
        label: "2 ágyas szoba (külön ággyal)",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis, omnis. Placeat voluptas fugitquidem. Vero mollitia quia excepturi fuga quasi ratione, nemo voluptates neque, odit nihilblanditiis aut expedita doloribus!",
        capacity: 2,
        image: "/media/2kulon.jpg"
    },
    three: {
        label: "3 ágyas szoba",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis, omnis. Placeat voluptas fugitquidem. Vero mollitia quia excepturi fuga quasi ratione, nemo voluptates neque, odit nihilblanditiis aut expedita doloribus!",
        capacity: 3,
        image: "/media/3agy.jpg"
    },
    four: {
        label: "4 ágyas szoba",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis, omnis. Placeat voluptas fugitquidem. Vero mollitia quia excepturi fuga quasi ratione, nemo voluptates neque, odit nihilblanditiis aut expedita doloribus!",
        capacity: 4,
        image: "/media/4agy.jpg"
    }
}

const DAY = 1000 * 60 * 60 * 24;

let peopleCount = 2;

function PeopleChange(value) {
    let newCount = peopleCount + value;

    if (newCount >= 2 && newCount <= 6) {
        peopleCount = newCount;
        peopleCountEl.innerText = peopleCount;

        UpdateRoomsCount();
    }
}

function DateStripTime(epoch) {
    let date = new Date(epoch);
    date.setHours(2);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.valueOf();
}

function ValidateDate() {
    if (DateStripTime(firstNightEl.valueAsNumber) < DateStripTime(Date.now())) {
        dateErrorEl.innerText = "Korábbi napokon nem lehet foglalni.";
    }
    else if (DateStripTime(firstNightEl.valueAsNumber) > DateStripTime(lastNightEl.valueAsNumber)) {
        dateErrorEl.innerText = "Az utolsó éjszaka nem lehet korábban, mint az első éjszaka!";
    }
    else if (DateStripTime(lastNightEl.valueAsNumber) - DateStripTime(firstNightEl.valueAsNumber) > (DAY * 9)) {
        dateErrorEl.innerText = "Maximum 10 éjszakára lehet foglalni.";
    }
    else {
        dateErrorEl.innerText = "";
    }

    ToggleReserveButton();
}

function UpdateRoomsCount() {
    let count = 0;
    for (const room of roomsGridEl.querySelectorAll(".room-card")) {
        count += ROOM_TYPES[room.dataset.type].capacity;
    }

    roomsCountEl.classList.remove("error");
    if (count != peopleCount) {
        roomsCountEl.classList.add("error");
    }

    roomsCountEl.innerText = `${count} / ${peopleCount}`;

    ToggleReserveButton();
}

function ToggleReserveButton() {
    reserveButtonEl.disabled = roomsCountEl.classList.contains("error") || dateErrorEl.innerText != "";
}

function ToggleRoomModal() {
    roomModalEl.style.display = roomModalEl.style.display == "none" ? "" : "none";
}

function AddRoom(type) {
    const el = roomCardTemplate.content.cloneNode(true);
    el.querySelector("img").src = ROOM_TYPES[type].image;
    el.querySelector("img").alt = ROOM_TYPES[type].label;
    el.querySelector("h2").innerText = ROOM_TYPES[type].label;
    el.querySelector(".room-card").dataset.type = type;

    roomsGridEl.insertBefore(el, roomsGridEl.querySelector(".room-add"));

    UpdateRoomsCount();
    ToggleRoomModal();
}

function RemoveRoom(el) {
    el.remove();
    UpdateRoomsCount();
}

function Reserve() {
    const spans = summaryEl.querySelectorAll("span");
    spans[0].innerText = peopleCount;
    spans[1].innerText = new Date(firstNightEl.value).toLocaleDateString("hu-HU");
    spans[2].innerText = new Date(lastNightEl.value).toLocaleDateString("hu-HU");

    const lists = summaryEl.querySelectorAll("ul");

    let rooms = {};
    let dinings = {};
    for (const room of roomsGridEl.querySelectorAll(".room-card")) {
        const type = room.dataset.type;

        rooms[type] = (rooms[type] || 0) + 1;

        const dining = room.querySelector("select").value;
        dinings[dining] = (dinings[dining] || 0) + ROOM_TYPES[type].capacity;
    }

    for (const [key, value] of Object.entries(rooms)) {
        const el = document.createElement("li");
        el.innerText = `${value}x ${ROOM_TYPES[key].label}`;
        lists[1].appendChild(el);
    }

    for (const [key, value] of Object.entries(dinings)) {
        const el = document.createElement("li");
        el.innerText = `${key}: ${value} fő`;
        lists[2].appendChild(el);
    }

    const timelineTemplate = document.getElementById("timeline-item-template");
    const nights = (DateStripTime(lastNightEl.valueAsNumber) - DateStripTime(firstNightEl.valueAsNumber)) / DAY + 1 + 4;
    const startDate = DateStripTime(firstNightEl.valueAsNumber) - (DAY * 2);
    for (let index = 0; index < nights; index++) {
        const el = timelineTemplate.content.cloneNode(true);
        const date = new Date(startDate + index * DAY);
        el.querySelector("p").innerText = `${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}`;

        if (index < 2 || index > nights - 3) {
            el.querySelector(".dot").classList.add("free");
            el.querySelector(".timeline-item").title = "Erre a napra nincs foglalás";
        }
        else {
            el.querySelector(".timeline-item").title = `${index + 1 - 2}. éjszaka`;
        }

        timelineEl.appendChild(el);
    }

    document.querySelector("h1").innerText = "Sikeres foglalás";

    formEl.style.display = "none";
    summaryEl.style.display = "";
}

function Init() {
    firstNightEl.valueAsNumber = DateStripTime(Date.now());
    lastNightEl.valueAsNumber = DateStripTime(Date.now()) + (1000 * 60 * 60 * 24);

    const roomModalContainer = roomModalEl.querySelector(".container");
    const roomTypeTemplate = document.getElementById("room-type-card-template");

    for (const [key, value] of Object.entries(ROOM_TYPES)) {
        const el = roomTypeTemplate.content.cloneNode(true);
        el.querySelector("img").src = value.image;
        el.querySelector("img").alt = value.label;
        el.querySelector("h3").innerText = value.label;
        el.querySelector("p").innerText = value.description;

        el.querySelector(".room-type-card").addEventListener("click", () => AddRoom(key));

        roomModalContainer.appendChild(el);
    }

    UpdateRoomsCount();
}

Init();