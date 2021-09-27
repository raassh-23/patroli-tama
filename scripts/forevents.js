import vehicles from "./vehiclesData.js";
import kodePelanggaran from "./pelanggaran.js";
import { randomInt } from './commonFunctions.js';

function checkTurn(vehicle, turnCheck) {
// 	console.log("vehicle uid " + vehicle.uid);
	
	const turnArray = turnCheck.instVars.turnAngle
		.split('|').map((str) => str.split(',').map(num => parseInt(num)));
	
// 	console.log(turnArray);
	
	const curAngle = vehicle.instVars.currentAngle;
	let pelanggaran = vehicle.instVars.pelanggaran == 1 
						|| vehicle.instVars.pelanggaran == 5 
						? vehicle.instVars.pelanggaran : 0;

// 	console.table({curAngle, pelanggaran});

	const turnable = turnArray.filter(val => val[0] == pelanggaran && val[1] == curAngle);
	
// 	console.log(turnable);

	if(turnable.length == 0) {
		console.error(`
		Belok tidak ditemukan. 
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
	
	const turnArray = lockCheck.instVars.lockList
		.split('|').map((str) => str.split(',').map(num => parseInt(num)));
	
// 	console.log(turnArray);
	
	const curAngle = vehicle.instVars.currentAngle;
	const targetAngle = vehicle.instVars.targetAngle;
	const targetX = vehicle.instVars.targetTurnX;
	const targetY = vehicle.instVars.targetTurnY;
	const pelanggaran = vehicle.instVars.pelanggaran == 1 
						|| vehicle.instVars.pelanggaran == 5 
						? vehicle.instVars.pelanggaran : 0;
	
// 	console.log(vehicle);
// 	console.table({curAngle, targetAngle, targetX, targetY, pelanggaran});

	const turn = turnArray.find(val => val[0] == pelanggaran 
								  && val[1] == curAngle
								  && val[2] == targetAngle
								  && val[3] == targetX
								  && val[4] == targetY);

// 	console.log(turn);
	if(turn) {
		const intersectionLock = [lockCheck.instVars.intersectionId, turn[5], turn[6], turn[7]]
		vehicle.instVars.intersectionLock = intersectionLock.toString();
		
		return intersectionLock;
	}
}

function lockIntersection(vehicle, allIntersections) {
	const pickedLock = vehicle.instVars.intersectionLock.split(",").map(val => parseInt(val));
// 	console.log(pickedLock);
	
	const pickedIntersections = [];
	
	for(let i=1;i<=3;i++){
		if (pickedLock[i] == -1) continue;
		
		const intersection = allIntersections.find(val => val.instVars.intersectionId == pickedLock[0]
													&& val.instVars.id == pickedLock[i]
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
			
		default:
			let vehiclesArray = Object.keys(vehicles).filter(v => v !== "motorbikeWithoutHelm" 
														&& v !== "motorbikeWithoutLight");
			
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