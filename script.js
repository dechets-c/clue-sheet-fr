function get_template(player_number) {
	const dataTemplate = {
		"suspects": {
			"Olive": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Moutarde": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Pervenche": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Violet": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Rose": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Leblanc": {
				"cells": Array(player_number).fill(0),
				"shown": false
			}
		},
		"weapons": {
			"Chandelier": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Poignard": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Tuyau": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Revolver": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Corde": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Clé": {
				"cells": Array(player_number).fill(0),
				"shown": false
			}
		},
		"locations": {
			"Salle de reception": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Salle de billard": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Jardin d'hiver": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Salle à manger": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Entrée": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Cuisine": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Bibliothèque": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Sallon": {
				"cells": Array(player_number).fill(0),
				"shown": false
			},
			"Bureau": {
				"cells": Array(player_number).fill(0),
				"shown": false
			}
		}
	};
	return dataTemplate;
}

// default data for initial load (3 columns is a safe default)
let data = get_template(3);
let currentPosition = 0;
const dbName = "database";
const storeName = "dataStore";

function toggleCell(block, text, column) {
	writeDataToIndexedDB(data);

	switch (data[block][text].cells[column]) {
		case 0:
			data[block][text].cells[column] = 1;
			break;
		case 1:
			data[block][text].cells[column] = 2;
			break;
		case 2:
			data[block][text].cells[column] = 3;
			break;
		case 3:
			data[block][text].cells[column] = 0;
			break;
	}

	refreshCells(block);
}

function refreshCells(block) {
	if (readValueFromLocalStorage("sheetActive")) {
		if (block) {
			const targets = Object.keys(data[block]);
			let marked = 0;
			targets.forEach(target => {
				if (data[block][target].shown) {
					document.getElementById(toID(target)).classList.add("shown");
				} else {
					document.getElementById(toID(target)).classList.remove("shown");
				}
	
				if (data[block][target].cells.includes(1)) {
					document.getElementById(toID(target)).classList.add("invalid");
					marked++;
				} else {
					document.getElementById(toID(target)).classList.remove("invalid");
				}
	
				if (data[block][target].cells.includes(3)) {
					document.getElementById(toID(target)).classList.add("possiblyValid");
				} else {
					document.getElementById(toID(target)).classList.remove("possiblyValid");
				}
	
				for (let i = 0; i < data[block][target].cells.length; i++) {
					const element = document.getElementById(toID(target + i));
					switch (data[block][target].cells[i]) {
						case 0:
							element.textContent = " ";
							break;
						case 1:
							element.textContent = "❌";
							break;
						case 2:
							element.textContent = "❓";
							break;
						case 3:
							element.textContent = "➖";
							break;
					}
				}
	
				document.getElementById(toID(target)).classList.remove("valid");
			});
	
			if (marked == targets.length - 1) {
				targets.forEach(target => {
					if (!document.getElementById(toID(target)).classList.contains("invalid")) {
						document.getElementById(toID(target)).classList.add("valid");
					}
				});
			}
		} else {
			Object.keys(data).forEach(block => {
				refreshCells(block);
			});
		}
	}
}

function toID(str) {
	// remove all whitespace and make lowercase for stable IDs
	return str.toLowerCase().replace(/\s+/g, "");
}

function generateRows(block, columns) {
	return Object.keys(data[block]).map(text => {
		const row = document.createElement("tr");
		const cell = document.createElement("td");
		cell.textContent = text;
		cell.addEventListener("click", () => {
			writeDataToIndexedDB(data);

			data[block][text].shown = !data[block][text].shown;
			refreshCells(block);
		});
		cell.id = toID(text);
		row.appendChild(cell);
		for (let i = 0; i < columns; i++) {
			const clickableCell = document.createElement("td");
			clickableCell.classList.add("clickableCell");
			clickableCell.addEventListener("click", () => {
				toggleCell(block, text, i);
			});
			clickableCell.id = toID(text + i);
			row.appendChild(clickableCell);
		}

		return row;
	});
}

function generateSheet() {
	const numberOfPlayers = document.querySelector("#numUsers").value;
	const playerInitialsInput = Array.from(document.querySelectorAll(".userEntry")).map(entry => {
		return entry.querySelector("input").value;
	});
	const sheet = document.querySelector("#sheet");
	document.querySelector("#sheet").classList.remove("hidden");
	document.getElementById("undoButton").classList.remove("hidden");
	document.getElementById("redoButton").classList.remove("hidden");
	document.getElementById("resetButton").classList.remove("hidden");
	document.getElementById("instructions").classList.add("hidden");

	writeValueToLocalStorage("numberOfPlayers", numberOfPlayers);
	writeValueToLocalStorage("playerInitialsInput", playerInitialsInput);

	let colCount = numberOfPlayers;
	let boardRule = false;
	if (numberOfPlayers == 2) {
		colCount = 3;
		boardRule = true;
	}

	// (re)create data structure with the correct number of columns
	data = get_template(parseInt(colCount, 10));

	document.querySelector(".userEntryContainer").classList.add("hidden");
	sheet.innerHTML = "";

	Object.keys(data).forEach(block => {
		const headerRow = document.createElement("tr");
		const headerCell = document.createElement("td");
		headerCell.textContent = block;
		headerRow.appendChild(headerCell);
		sheet.appendChild(headerRow);
		headerRow.classList.add("headerRow");
		
		generateRows(block, colCount).forEach(child => sheet.appendChild(child));
	});
	
	// Append player initials to every header row so columns align
	const headerRows = Array.from(document.querySelectorAll(".headerRow"));
	for (let i = 0; i < colCount; i++) {
		headerRows.forEach(headerRow => {
			const playerInitial = document.createElement("td");
			playerInitial.classList.add("playerInitial");
			playerInitial.textContent = playerInitialsInput[i] || "";
			headerRow.appendChild(playerInitial);
		});
	}

	if (boardRule) {
		const playerInitials = Array.from(document.querySelectorAll(".playerInitial"));
		playerInitials[playerInitials.length - 1].textContent = "B";
		playerInitials[playerInitials.length - 1].classList.add("playerInitialBoard");
	}

	writeValueToLocalStorage("sheetActive", true);
}

function generateInitialsForm() {
	let numUsers = parseInt(document.getElementById("numUsers").value);
	if (numUsers < 2) {
		numUsers = 2;
		document.getElementById("numUsers").value = 2;
	}
	const userFormContainer = document.getElementById("userFormContainer");

	userFormContainer.innerHTML = "";

	for (let i = 0; i < numUsers; i++) {
		const userEntry = document.createElement("div");
		userEntry.className = "userEntry";
		userEntry.innerHTML = `
			<label for="user${i}">Initiales du joueur ${i + 1} :</label>
			<input type="text" id="user${i}" name="user${i}">
		`;
		userFormContainer.appendChild(userEntry);
	}
}

function prefill() {
	if (readValueFromLocalStorage("sheetActive")) {
		document.querySelector("#numUsers").value = readValueFromLocalStorage("numberOfPlayers");

		const initialFields = Array.from(document.querySelectorAll(".userEntry")).map(entry => {
			return entry.querySelector("input");
		});

		const initials = readValueFromLocalStorage("playerInitialsInput");
		for (let i = 0; i < initials.length; i++) {
			initialFields[i].value = initials[i];
		}

		generateSheet();
		currentPosition = parseInt(readValueFromLocalStorage("currentPosition"));
		
		indexedDB.open(dbName, 1).onsuccess = function (event) {
			const db = event.target.result;
			const transaction = db.transaction(storeName, "readonly");
			const store = transaction.objectStore(storeName);
			store.count().onsuccess = function (event) {
				const count = event.target.result;
				if (currentPosition == count) {
					getDBEntry(currentPosition - 1);
				} else {
					getDBEntry(currentPosition - 1);
				}
			};
		};
	}
}

function writeDataToIndexedDB(newData) {
	const request = indexedDB.open(dbName, 1);

	request.onsuccess = function (event) {
		const db = event.target.result;
		const store = db.transaction(storeName, "readwrite").objectStore(storeName, { autoIncrement: true });

		console.log(currentPosition)
		store.put(newData, currentPosition).onsuccess = function (event) {
			currentPosition++;
			writeValueToLocalStorage("currentPosition", currentPosition);
			refreshCells();
			
			store.count().onsuccess = function (event) {
				const count = event.target.result;
				if (currentPosition != count) {
					for (let i = currentPosition; i < count; i++) {
						store.delete(i);
					}
				}
			};
		};
	};

	request.onupgradeneeded = function (event) {
		const db = event.target.result;
		db.createObjectStore(storeName, { autoIncrement: true });
	};
}

function undo() {
	indexedDB.open(dbName, 1).onsuccess = function (event) {
		const db = event.target.result;
		const transaction = db.transaction(storeName, "readonly");
		const store = transaction.objectStore(storeName);
		store.count().onsuccess = function (event) {
			const count = event.target.result;
			if (count > 1 && currentPosition == count) {
				currentPosition--;
				writeValueToLocalStorage("currentPosition", currentPosition);
				getDBEntry(currentPosition - 1);
			} else if (currentPosition - 2 >= 0) {
				currentPosition--;
				writeValueToLocalStorage("currentPosition", currentPosition);
				getDBEntry(currentPosition - 1);
			}
		};
	};
}

function redo() {
	indexedDB.open(dbName, 1).onsuccess = function (event) {
		const db = event.target.result;
		const transaction = db.transaction(storeName, "readonly");
		const store = transaction.objectStore(storeName);
		store.count().onsuccess = function (event) {
			const count = event.target.result;
			if (currentPosition < count) {
				getDBEntry(currentPosition);
				currentPosition++;
				writeValueToLocalStorage("currentPosition", currentPosition);
			} 
		};
	};
}

function resetSheet() {
	writeValueToLocalStorage("sheetActive", false);
	document.querySelector(".userEntryContainer").classList.remove("hidden");
	document.querySelector("#sheet").classList.add("hidden");
	document.getElementById("undoButton").classList.add("hidden");
	document.getElementById("redoButton").classList.add("hidden");
	document.getElementById("resetButton").classList.add("hidden");
	document.getElementById("instructions").classList.remove("hidden");
}

function clearIndexedDB() {
	indexedDB.open(dbName, 1).onsuccess = function (event) {
		const db = event.target.result;

		const transaction = db.transaction(storeName, "readwrite");
		const store = transaction.objectStore(storeName);

		const clearRequest = store.clear();
		clearRequest.onsuccess = function (event) {
			data = structuredClone(dataTemplate)
			const putRequest = store.put(data, 0);
			putRequest.onsuccess = function (event) {
				currentPosition = 1;
				writeValueToLocalStorage("currentPosition", currentPosition);
				resetSheet();
			};
		};
	};
}

function getDBEntry(id) {
	console.log(id);
	indexedDB.open(dbName, 1).onsuccess = function (event) {
		const db = event.target.result;
		db.transaction(storeName, "readonly").objectStore(storeName).get(id).onsuccess = function (event) {
			data = event.target.result;
			refreshCells();
		};
	};
}

function getLastDBEntry() {
	indexedDB.open(dbName, 1).onsuccess = function (event) {
		const db = event.target.result;
		const store = db.transaction(storeName, "readonly").objectStore(storeName);
		store.count().onsuccess = function (event) {
			const count = event.target.result - 1;
			store.get(count).onsuccess = function (event) {
				const lastElement = event.target.result;
				if (count > 0) {
					currentPosition = count + 1;
					writeValueToLocalStorage("currentPosition", currentPosition);
					data = lastElement;
					refreshCells();
				} else {
					writeDataToIndexedDB(data);
				}
			};
		};
	};
}

function writeValueToLocalStorage(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
}

function readValueFromLocalStorage(key) {
	const stored = localStorage.getItem(key);
	if (stored) {
		return JSON.parse(stored);
	} else {
		return null;
	}
}

document.addEventListener("DOMContentLoaded", () => {
	generateInitialsForm();

	document.getElementById("numUsers").addEventListener("change", generateInitialsForm);
	document.getElementById("generateButton").addEventListener("click", generateSheet);
	document.getElementById("undoButton").addEventListener("click", undo);
	document.getElementById("redoButton").addEventListener("click", redo);
	document.getElementById("resetButton").addEventListener("click", clearIndexedDB);
	
	prefill();
});
