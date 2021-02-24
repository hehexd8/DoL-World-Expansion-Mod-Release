window.prepareSaveDetails = function (forceRun){
	if("dolSaveDetails" in localStorage === false || forceRun === true){
		var saveDetails = {autosave: null, slots:[null,null,null,null,null,null,null,null]}
		var SugarCubeSaveDetails = Save.get();
		if(SugarCubeSaveDetails.autosave != null){
			saveDetails.autosave = {
				title:SugarCubeSaveDetails.autosave.title,
				date:SugarCubeSaveDetails.autosave.date,
				metadata:SugarCubeSaveDetails.autosave.metadata
			}
			if(saveDetails.autosave.metadata === undefined){
				saveDetails.autosave.metadata = {saveName:""};
			}
			if(saveDetails.autosave.metadata.saveName === undefined){
				saveDetails.autosave.metadata.saveName = "";
			}
		}
		for (var i=0; i<SugarCubeSaveDetails.slots.length;i++){
			if(SugarCubeSaveDetails.slots[i] !== null){
				saveDetails.slots[i] = {
					title:SugarCubeSaveDetails.slots[i].title,
					date:SugarCubeSaveDetails.slots[i].date,
					metadata:SugarCubeSaveDetails.slots[i].metadata
				};
				if(saveDetails.slots[i].metadata === undefined){
					saveDetails.slots[i].metadata = {saveName:"old save", saveId:0}
				}
				if(saveDetails.slots[i].metadata.saveName === undefined){
					saveDetails.slots[i].metadata.saveName = "old save";
				}
			}else{
				saveDetails.slots[i] = null;
			}
		}
	
		localStorage.setItem("dolSaveDetails" ,JSON.stringify(saveDetails));
	}
	return;
}

window.setSaveDetail = function (saveSlot, metadata, story){
	var saveDetails = JSON.parse(localStorage.getItem("dolSaveDetails"));
	if(saveSlot === "autosave"){
		saveDetails.autosave = {
			title:SugarCube.Story.get(SugarCube.State.variables.passage).description(),
			date:Date.now(),
			metadata:metadata
		};
	}else{
		var slot = parseInt(saveSlot);
		saveDetails.slots[slot] = {
			title:SugarCube.Story.get(SugarCube.State.variables.passage).description(),
			date:Date.now(),
			metadata:metadata
		};
	}
	localStorage.setItem("dolSaveDetails" ,JSON.stringify(saveDetails));
}

window.getSaveDetails = function (saveSlot){
	if("dolSaveDetails" in localStorage) return JSON.parse(localStorage.getItem("dolSaveDetails"));
}

window.deleteSaveDetails = function (saveSlot){
	var saveDetails = JSON.parse(localStorage.getItem("dolSaveDetails"));
	if(saveSlot === "autosave"){
		saveDetails.autosave = null;
	}else{
		var slot = parseInt(saveSlot);
		saveDetails.slots[slot] = null;
	}
	localStorage.setItem("dolSaveDetails" ,JSON.stringify(saveDetails));
}

window.deleteAllSaveDetails = function (saveSlot){
	var saveDetails = {autosave: null, slots:[null,null,null,null,null,null,null,null]};
	localStorage.setItem("dolSaveDetails" ,JSON.stringify(saveDetails));
}

window.returnSaveDetails = function () {
	return Save.get();
}

window.resetSaveMenu = function () {
	new Wikifier(null, '<<resetSaveMenu>>');
}

window.loadSave = function (saveSlot, confirm) {
	if (SugarCube.State.variables.confirmLoad === true && confirm === undefined) {
		new Wikifier(null, '<<loadConfirm ' + saveSlot + '>>');
	} else {
		if (saveSlot === "auto") {
			Save.autosave.load();
		} else {
			Save.slots.load(saveSlot);
		}
	}
}

window.save = function (saveSlot, confirm, saveId, saveName) {
	if (saveId == null) {
		new Wikifier(null, '<<saveConfirm ' + saveSlot + '>>');
	} else if ((SugarCube.State.variables.confirmSave === true && confirm != true) || (SugarCube.State.variables.saveId != saveId && saveId != null)) {
		new Wikifier(null, '<<saveConfirm ' + saveSlot + '>>');
	} else {
		if (saveSlot != undefined) {
			Save.slots.save(saveSlot, null, { "saveId": saveId, "saveName": saveName });
			setSaveDetail(saveSlot, { "saveId": saveId, "saveName": saveName })
			SugarCube.State.variables.currentOverlay = null;
			overlayShowHide("customOverlay");
		}
	}
}

window.deleteSave = function (saveSlot, confirm) {
	if (saveSlot === "all") {
		if (confirm === undefined) {
			new Wikifier(null, '<<clearSaveMenu>>');
			return;
		} else if (confirm === true) {
			Save.clear();
			deleteAllSaveDetails();
		}
	} else if (saveSlot === "auto") {
		if (SugarCube.State.variables.confirmDelete === true && confirm === undefined) {
			new Wikifier(null, '<<deleteConfirm ' + saveSlot + '>>');
			return;
		} else {
			Save.autosave.delete();
			deleteSaveDetails("autosave");
		}
	} else {
		if (SugarCube.State.variables.confirmDelete === true && confirm === undefined) {
			new Wikifier(null, '<<deleteConfirm ' + saveSlot + '>>');
			return;
		} else {
			Save.slots.delete(saveSlot);
			deleteSaveDetails(saveSlot)
		}
	}
	new Wikifier(null, '<<resetSaveMenu>>');
}

window.importSave = function (saveFile) {
	if (!window.FileReader) return; // Browser is not compatible

	var reader = new FileReader();

	reader.onloadend = function () {
		DeserializeGame(this.result);
	}

	reader.readAsText(saveFile[0]);
}

window.SerializeGame = function () { return Save.serialize(); }; window.DeserializeGame = function (myGameState) { return Save.deserialize(myGameState) };

window.getSaveData = function () {
	var input = document.getElementById("saveDataInput");
	input.value = Save.serialize();
}

window.loadSaveData = function () {
	var input = document.getElementById("saveDataInput");
	var result = Save.deserialize(input.value);
	if (result === null) {
		input.value = "Invalid Save."
	}
}

window.clearTextBox = function (id) {
	document.getElementById(id).value = "";
}

window.topTextArea = function (id) {
	var textArea = document.getElementById(id);
	textArea.scroll(0, 0);
}

window.bottomTextArea = function (id) {
	var textArea = document.getElementById(id);
	textArea.scroll(0, textArea.scrollHeight);
}

window.copySavedata = function (id) {
	var saveData = document.getElementById(id);
	saveData.focus();
	saveData.select();

	try {
		var successful = document.execCommand('copy');
	} catch (err) {
		var copyTextArea = document.getElementById("CopyTextArea");
		copyTextArea.value = "Copying Error";
		console.log('Unable to copy: ', err);
	}
}

window.copySavedata = function (id) {
	var saveData = document.getElementById(id);
	saveData.focus();
	saveData.select();

	try {
		var successful = document.execCommand('copy');
	} catch (err) {
		var copyTextArea = document.getElementById("CopyTextArea");
		copyTextArea.value = "Copying Error";
		console.log('Unable to copy: ', err);
	}
}

window.importSettings = function (data, type) {
	switch(type){
		case "text":
			SugarCube.State.variables.importString = document.getElementById("settingsDataInput").value
			new Wikifier(null, '<<displaySettings "importConfirmDetails">>');
			break;
		case "file":
			var reader = new FileReader();
			reader.addEventListener('load', function (e) {
				SugarCube.State.variables.importString = e.target.result;
				new Wikifier(null, '<<displaySettings "importConfirmDetails">>');
			});
			reader.readAsBinaryString(data[0]);
			break;
		case "function":
			importSettingsData(data);
			break;
	}
}

var importSettingsData = function (data) {
	var V = State.variables;
	var S = null;
	var result = data;
	if (result != null && result != undefined) {
		//console.log("json",JSON.parse(result));
		S = JSON.parse(result);

		if (V.passage === "Start" && S.starting != undefined) {
			var listObject = settingsObjects("starting");
			var listKey = Object.keys(listObject);
			var namedObjects = ["player", "skinColor"];

			for (var i = 0; i < listKey.length; i++) {
				if (namedObjects.contains(listKey[i]) && S.starting[listKey[i]] != undefined) {
					var itemKey = Object.keys(listObject[listKey[i]]);
					for (var j = 0; j < itemKey.length; j++) {
						if (V[listKey[i]][itemKey[j]] != undefined && S.starting[listKey[i]][itemKey[j]] != undefined) {
							if (validateValue(listObject[listKey[i]][itemKey[j]], S.starting[listKey[i]][itemKey[j]])) {
								V[listKey[i]][itemKey[j]] = S.starting[listKey[i]][itemKey[j]];
							}
						}
					}
				} else if (!namedObjects.contains(listKey[i])) {
					if (V[listKey[i]] != undefined && S.starting[listKey[i]] != undefined) {
						if (validateValue(listObject[listKey[i]], S.starting[listKey[i]])) {
							V[listKey[i]] = S.starting[listKey[i]];
						}
					}
				}
			}
		}

		if (S.general != undefined) {
			var listObject = settingsObjects("general");
			var listKey = Object.keys(listObject);
			var namedObjects = ["map", "skinColor"];

			for (var i = 0; i < listKey.length; i++) {
				if (namedObjects.contains(listKey[i]) && S.general[listKey[i]] != undefined) {
					var itemKey = Object.keys(listObject[listKey[i]]);
					for (var j = 0; j < itemKey.length; j++) {
						if (V[listKey[i]][itemKey[j]] != undefined && S.general[listKey[i]][itemKey[j]] != undefined) {
							if (validateValue(listObject[listKey[i]][itemKey[j]], S.general[listKey[i]][itemKey[j]])) {
								V[listKey[i]][itemKey[j]] = S.general[listKey[i]][itemKey[j]];
							}
						}
					}
				} else if (!namedObjects.contains(listKey[i])) {
					if (V[listKey[i]] != undefined && S.general[listKey[i]] != undefined) {
						if (validateValue(listObject[listKey[i]], S.general[listKey[i]])) {
							V[listKey[i]] = S.general[listKey[i]];
						}
					}
				}
			}
		}

		if (S.npc != undefined) {
			var listObject = settingsObjects("npc");
			var listKey = Object.keys(listObject);
			for (var i = 0; i < V.NPCNameList.length; i++) {
				if (S.npc[V.NPCNameList[i]] != undefined) {
					for (var j = 0; j < listKey.length; j++) {
						//Overwrite to allow for "none" default value in the start passage to allow for rng to decide
						if (SugarCube.State.variables.passage === "Start" && ["pronoun","gender"].includes(listKey[j]) && S.npc[V.NPCNameList[i]][listKey[j]] === "none"){
							V.NPCName[i][listKey[j]] = S.npc[V.NPCNameList[i]][listKey[j]];
						}
						else if (validateValue(listObject[listKey[j]], S.npc[V.NPCNameList[i]][listKey[j]])) {
							V.NPCName[i][listKey[j]] = S.npc[V.NPCNameList[i]][listKey[j]];
						}
					}
				}
			}
		}
	}
}

window.validateValue = function (keys, value) {
	//console.log("validateValue",keys,value);
	var keyArray = Object.keys(keys);
	var valid = false;
	if (keyArray.length === 0) {
		valid = true;
	}
	if (keyArray.includes("min")) {
		if (keys.min <= value && keys.max >= value) {
			valid = true;
		}
	}
	if (keyArray.includes("decimals")) {
		if (value.toFixed(keys.decimals) != value) {
			valid = false;
		}
	}
	if (keyArray.includes("bool")) {
		if (value === true || value === false) {
			valid = true;
		}
	}
	if (keyArray.includes("boolLetter")) {
		if (value === "t" || value === "f") {
			valid = true;
		}
	}
	if (keyArray.includes("strings")) {
		if (keys.strings.includes(value)) {
			valid = true;
		}
	}
	return valid;
}

window.exportSettings = function (data, type) {
	var V = State.variables;
	var S = {
		general: {
			map: {},
			skinColor: {},
		},
		npc: {},
	};
	if (V.passage === "Start") {
		S.starting = {
			player: {},
			skinColor: {},
		};
		var listObject = settingsObjects("starting");
		var listKey = Object.keys(listObject);
		var namedObjects = ["player", "skinColor"];

		for (var i = 0; i < listKey.length; i++) {
			if (namedObjects.contains(listKey[i]) && V[listKey[i]] != undefined) {
				var itemKey = Object.keys(listObject[listKey[i]]);
				for (var j = 0; j < itemKey.length; j++) {
					if (V[listKey[i]][itemKey[j]] != undefined) {
						if (validateValue(listObject[listKey[i]][itemKey[j]], V[listKey[i]][itemKey[j]])) {
							S.starting[listKey[i]][itemKey[j]] = V[listKey[i]][itemKey[j]];
						}
					}
				}
			} else if (!namedObjects.contains(listKey[i])) {
				if (V[listKey[i]] != undefined) {
					if (validateValue(listObject[listKey[i]], V[listKey[i]])) {
						S.starting[listKey[i]] = V[listKey[i]];
					}
				}
			}
		}
	}

	var listObject = settingsObjects("general");
	var listKey = Object.keys(listObject);
	var namedObjects = ["map", "skinColor"];

	for (var i = 0; i < listKey.length; i++) {
		if (namedObjects.contains(listKey[i]) && V[listKey[i]] != undefined) {
			var itemKey = Object.keys(listObject[listKey[i]]);
			for (var j = 0; j < itemKey.length; j++) {
				if (V[listKey[i]][itemKey[j]] != undefined) {
					if (validateValue(listObject[listKey[i]][itemKey[j]], V[listKey[i]][itemKey[j]])) {
						S.general[listKey[i]][itemKey[j]] = V[listKey[i]][itemKey[j]];
					}
				}
			}
		} else if (!namedObjects.contains(listKey[i])) {
			if (V[listKey[i]] != undefined) {
				if (validateValue(listObject[listKey[i]], V[listKey[i]])) {
					S.general[listKey[i]] = V[listKey[i]];
				}
			}
		}
	}
	var listObject = settingsObjects("npc");
	var listKey = Object.keys(listObject);
	for (var i = 0; i < V.NPCNameList.length; i++) {
		S.npc[V.NPCNameList[i]] = {};
		for (var j = 0; j < listKey.length; j++) {
			//Overwrite to allow for "none" default value in the start passage to allow for rng to decide
			if (SugarCube.State.variables.passage === "Start" && ["pronoun","gender"].includes(listKey[i]) && V.NPCName[i][listKey[j]] === "none"){
				S.npc[V.NPCNameList[i]][listKey[j]] = V.NPCName[i][listKey[j]];
			}
			else if (validateValue(listObject[listKey[j]], V.NPCName[i][listKey[j]])) {
				S.npc[V.NPCNameList[i]][listKey[j]] = V.NPCName[i][listKey[j]];
			}
		}
	}

	//console.log(S);
	var result = JSON.stringify(S);
	if (type === "text") {
		var textArea = document.getElementById("settingsDataInput");
		textArea.value = result;
	}
	else if (type === "file") {
		var blob = new Blob([result], { type: "text/plain;charset=utf-8" });
		saveAs(blob, "DolSettingsExport.txt");
	}
}

window.settingsObjects = function (type) {
	var result = undefined;
	switch (type) {
		case "starting":
			result = {
				bodysize: { min: 0, max: 3, decimals: 0 },
				penissize: { min: 0, max: 3, decimals: 0 },
				breastsize: { min: 0, max: 4, decimals: 0 },
				bottomsize: { min: 0, max: 3, decimals: 0 },
				breastsensitivity: { min: 0, max: 5, decimals: 0 },
				genitalsensitivity: { min: 0, max: 5, decimals: 0 },
				eyeselect: { strings: ["purple", "dark blue", "light blue", "amber", "hazel", "green", "red", "pink", "grey"] },
				hairselect: { strings: ["red", "jetblack", "black", "brown", "softbrown", "lightbrown", "burntorange", "blond", "softblond", "platinumblond", "ashyblond", "strawberryblond", "ginger"] },
				hairlength: { min: 0, max: 400, decimals: 0 },
				awareselect: { strings: ["innocent", "knowledgeable"] },
				background: { strings: ["waif", "nerd", "athlete", "delinquent", "promiscuous", "exhibitionist", "deviant", "beautiful", "crossdresser", "lustful", "greenthumb"] },
				gamemode: { strings: ["normal", "soft", "hard"] },
				player: {
					gender: { strings: ["m", "f", "h"] },
					gender_body: { strings: ["m", "f", "a"] },
					ballsExist: { bool: true },
					freckles: { bool: true, strings: ["random"] },
				},
				skinColor: {
					natural: { strings: ["light", "medium", "dark", "gyaru", "ylight", "ymedium", "ydark", "ygyaru"] },
					range: { min: 0, max: 100, decimals: 0 },
				}
			};
			break;
		case "general":
			result = {
				malechance: { min: 0, max: 100, decimals: 0 },
				dgchance: { min: 0, max: 100, decimals: 0 },
				cbchance: { min: 0, max: 100, decimals: 0 },
				malevictimchance: { min: 0, max: 100, decimals: 0 },
				homochance: { min: 0, max: 100, decimals: 0 },
				breast_mod: { min: -12, max: 12, decimals: 0 },
				penis_mod: { min: -8, max: 8, decimals: 0 },
				whitechance: { min: 0, max: 100, decimals: 0 },
				blackchance: { min: 0, max: 100, decimals: 0 },
				straponchance: { min: 0, max: 100, decimals: 0 },
				alluremod: { min: 0.2, max: 2, decimals: 1 },
				beastmalechance: { min: 0, max: 100, decimals: 0 },
				monsterchance: { min: 0, max: 100, decimals: 0 },

				/*noeinan mod START*/
				/*Changed beasts to always be monster boys/girls*/
				/*Changed default fetishes enabled*/
				/*Changed default tips enabled*/

				monsterhallucinations: { boolLetter: false },
				blackwolfmonster: { min: 0, max: 1, decimals: 0 },
				bestialitydisable: { boolLetter: false },
				swarmdisable: { boolLetter: true },
				slimedisable: { boolLetter: true },
				voredisable: { boolLetter: true },
				tentacledisable: { boolLetter: true },
				analdisable: { boolLetter: true },
				transformdisable: { boolLetter: true },
				hirsutedisable: { boolLetter: false },
				breastfeedingdisable: { boolLetter: true },
				analpregdisable: { boolLetter: true },
				watersportsdisable: { boolLetter: true },
				spiderdisable: { boolLetter: true },
				bodywritingdisable: { boolLetter: true },
				breastsizemax: { min: 0, max: 13, decimals: 0 },
				bottomsizemax: { min: 0, max: 9, decimals: 0 },
				penissizemax: { min: -1, max: 4, decimals: 0 },
				penissizemin: { min: -1, max: 0, decimals: 0 },
				images: { min: 0, max: 1, decimals: 0 },
				sidebarAnimations: { bool: true },
				combatAnimations: { bool: true },
				bodywritingImages: { bool: false },
				silhouettedisable: { boolLetter: true },
				numberify_enabled: { min: 0, max: 1, decimals: 0 },
				timestyle: { strings: ["military", "ampm"] },
				tipdisable: { boolLetter: false },

				/*noeinan mod END*/
				
				debugdisable: { boolLetter: true },
				cheatdisable: { boolLetter: true },
				showCaptionText: { bool: true },
				confirmSave: { bool: true },
				confirmLoad: { bool: true },
				confirmDelete: { bool: true },
				newWardrobeStyle: { bool: true },
				imgLighten: { strings: ["", "imgLighten", "imgLighten2"] },
				sidebarStats: { strings: ["Disabled", "Limited", "All"] },
				sidebarTime: { strings: ["Disabled", "top", "bottom"] },
				combatControls: { strings: ["radio", "lists", "limitedLists"] },
				reducedLineHeight: { bool: true },
				neverNudeMenus: { bool: false },
				map: {
					movement: { bool: true },
					top: { bool: true },
					markers: { bool: true },
				},
				skinColor: {
					tanImgEnabled: { boolLetter: true },
					tanningEnabled: { bool: true },
				}
			};
			break;
		case "npc":
			result = {
				pronoun: { strings: ["m", "f"] },
				gender: { strings: ["m", "f"] },
				penissize: { min: 0, max: 4, decimals: 0 },
				breastsize: { min: 0, max: 5, decimals: 0 },
			}
			break;
	}
	return result;
}

window.loadExternalExportFile = function () {
	importScripts("DolSettingsExport.json")
		.then(function () {
			var textArea = document.getElementById("settingsDataInput");
			textArea.value = JSON.stringify(DolSettingsExport);
		})
		.catch(function (err) {
			//console.log(err);
			var button = document.getElementById("LoadExternalExportFile");
			button.value = "Error Loading";
		});
}
