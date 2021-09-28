import vehicles from "./vehiclesData.js";
import kodePelanggaran from "./pelanggaran.js";
import { randomInt } from './commonFunctions.js';

function splitTurnElements(str) {
	return str.split(',').map(num => parseInt(num));
}

function splitTurnArray(str) {
	return str.split('|').map(splitTurnElements);
}

function checkTurn(vehicle, turnCheck) {
// 	console.log("vehicle uid " + vehicle.uid);
	
	const turnArray = splitTurnArray(turnCheck.instVars.turnAngle)
	
	const curAngle = vehicle.instVars.currentAngle;
	const pelanggaran = vehicle.instVars.pelanggaran;

	let turnable;
	
	if(turnArray.find(val => val[0] == pelanggaran)) {
		turnable = turnArray.filter(val => val[0] == pelanggaran && val[1] == curAngle);
	} else {
		turnable = turnArray.filter(val => val[0] == 0 && val[1] == curAngle)
	}

// 	console.log("sebelum");
// 	console.log(turnable);
	
	let turnExceptionsObj;
	
	if(turnCheck.instVars.exceptions != ""){
		turnExceptionsObj = JSON.parse(turnCheck.instVars.exceptions);
	}
	
	if (turnExceptionsObj && Object.keys(turnExceptionsObj).includes(vehicle.objectType.name)) {
		const turnExceptions = splitTurnArray(turnExceptionsObj[vehicle.objectType.name])

		turnable = turnable.filter((val1) => !turnExceptions.some((val2) => val1.length == val2.length
																	&& val1.every((x, i) => x == val2[i])));

// 		console.log("setelah");
// 		console.log(turnable);
	}
// 	console.log(turnable);

	if(turnable.length == 0) {
		console.error(`
		Belokan tidak ditemukan. 
		Pelanggaran = ${pelanggaran} 
		CurAngle = ${curAngle}
		TurnCheck UID = ${turnCheck.uid}
		`)
		return;
	}

	const [, , targetAngle, targetX, targetY] = turnable[randomInt(0, turnable.length - 1)];

// 	console.table({targetAngle, targetX, targetY});

	vehicle.instVars.targetAngle = targetAngle;
	vehicle.instVars.targetTurnX = targetX;
	vehicle.instVars.targetTurnY = targetY;
	vehicle.instVars.turningId = turnCheck.instVars.intersectionId;
}

function checkLock(vehicle, lockCheck) {
// 	console.log("vehicle uid " + vehicle.uid);
	
	const turnArray = splitTurnArray(lockCheck.instVars.lockList);
	
// 	console.log(turnArray);
	
	const curAngle = vehicle.instVars.currentAngle;
	const targetAngle = vehicle.instVars.targetAngle;
	const targetX = vehicle.instVars.targetTurnX;
	const targetY = vehicle.instVars.targetTurnY;
	const pelanggaran = vehicle.instVars.pelanggaran;
	
// 	console.log(vehicle);
// 	console.table({curAngle, targetAngle, targetX, targetY, pelanggaran});

	let turn;

	if(turnArray.find(val => val[0] == pelanggaran)) {
		turn = turnArray.find(val => val[0] == pelanggaran 
								&& val[1] == curAngle
								&& val[2] == targetAngle
								&& val[3] == targetX
								&& val[4] == targetY);
	} else {
		turn = turnArray.find(val => val[0] == 0 
								&& val[1] == curAngle
								&& val[2] == targetAngle
								&& val[3] == targetX
								&& val[4] == targetY);
	}

// 	console.log(turn);
	if(turn) {
		const intersectionLock = [lockCheck.instVars.intersectionId, turn[5], turn[6], turn[7]]
		vehicle.instVars.intersectionLock = intersectionLock.toString();
		
		return intersectionLock;
	}
}

function lockIntersection(vehicle, allIntersections) {
	const pickedLock = splitTurnElements(vehicle.instVars.intersectionLock);
// 	console.log(pickedLock);
	
	const pickedIntersections = [];
	
	for(let i=1;i<=3;i++){
		if (pickedLock[i] == -1) continue;
		
		const intersection = allIntersections.find(val => val.instVars.intersectionId == pickedLock[0]
													&& val.instVars.sequenceId == pickedLock[i]
													&& val.instVars.vehiclesUID == "");
		if(!intersection) {
			return false;
		} else {
			pickedIntersections.push(intersection);
		}
	}
	
	pickedIntersections.forEach(val => val.instVars.vehiclesUID = vehicle.uid);
	
	return true;
}

function pickVehicle(pelanggaran, level) {
	let pickedVehicle = "";

	switch (pelanggaran) {
		case kodePelanggaran.TANPA_HELM:
			pickedVehicle = "motorbikeWithoutHelm";
			break;

		case kodePelanggaran.TANPA_LAMPU:
			pickedVehicle = "motorbikeWithoutLight";
			break;
		
		case kodePelanggaran.MELEBIHI_MUATAN:
			pickedVehicle = "truckOverload";
			break;
			
		case kodePelanggaran.MENGANGKUT_PENUMPANG:
			pickedVehicle = "truckWithPassenger";
			break;
			
		case kodePelanggaran.DILARANG_MOBIL:
			pickedVehicle = "car";
			break;
		
		case kodePelanggaran.DILARANG_TRUK:
			pickedVehicle = "truck";
			break;

		default:
			let vehiclesArray = Object.keys(vehicles).filter(v => v !== "motorbikeWithoutHelm" 
														&& v !== "motorbikeWithoutLight"
														&& v !== "truckOverload"
														&& v !== "truckWithPassenger");
			
			if(level <= 8) {
				vehiclesArray = vehiclesArray.filter(v => v != "truck");
			} else if (level <= 12) {
				if(Math.random() < 0.25) {
					vehiclesArray = vehiclesArray.filter(v => v == "motorbike");
				} else {
					vehiclesArray = vehiclesArray.filter(v => v != "motorbike");
				}
			} else if (level <= 16) {
				vehiclesArray = vehiclesArray.filter(v => v != "motorbike");
			}
			
			pickedVehicle = vehiclesArray[randomInt(0, vehiclesArray.length - 1)]
			break;
	}

// 	console.log(pickedVehicle);

	return pickedVehicle;
}

function pickType(vehicle) {
	return randomInt(1, vehicles[vehicle]);
}