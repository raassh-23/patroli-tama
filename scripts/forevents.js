import vehicles from "./vehiclesData.js";
import kodePelanggaran from "./pelanggaran.js";
import { randomInt } from './commonFunctions.js';

function splitComma(str) {
	return str.split(',').map(num => parseInt(num));
}

function splitPipe(str) {
	return str.split('|').map(splitComma);
}

function checkTurn(vehicle, turnCheck) {

	const turnArray = splitPipe(turnCheck.instVars.turnAngle)

	const curAngle = vehicle.instVars.currentAngle;
	const pelanggaran = vehicle.instVars.pelanggaran;

	let turnable;

	if (turnArray.some(val => val[0] == pelanggaran)) {
		turnable = turnArray.filter(val => val[0] == pelanggaran && val[1] == curAngle);
	} else {
		turnable = turnArray.filter(val => val[0] == 0 && val[1] == curAngle)
	}

	let turnExceptionsObj;

	if (turnCheck.instVars.exceptions != "") {
		turnExceptionsObj = JSON.parse(turnCheck.instVars.exceptions);
	}

	if (turnExceptionsObj && Object.keys(turnExceptionsObj).includes(vehicle.objectType.name)) {
		const turnExceptions = splitPipe(turnExceptionsObj[vehicle.objectType.name])

		turnable = turnable.filter((val1) => !turnExceptions.some((val2) => val1.length == val2.length
			&& val1.every((x, i) => x == val2[i])));
	}

	if (turnable.length == 0) {
		console.error(`
		Belokan tidak ditemukan. 
		Pelanggaran = ${pelanggaran} 
		CurAngle = ${curAngle}
		TurnCheck UID = ${turnCheck.uid}
		Vehicle UID = ${vehicle.uid}
		`)
		return;
	}

	const [, , targetAngle, targetX, targetY] = turnable[randomInt(0, turnable.length - 1)];

	console.log(turnCheck.uid, targetAngle, targetX, targetY);
	console.log(turnable);

	vehicle.instVars.targetAngle = targetAngle;
	vehicle.instVars.targetTurnX = targetX;
	vehicle.instVars.targetTurnY = targetY;
	vehicle.instVars.turningId = turnCheck.instVars.intersectionId;
}

function checkLock(vehicle, lockCheck) {


	const turnArray = splitPipe(lockCheck.instVars.lockList);

	const curAngle = vehicle.instVars.currentAngle;
	const targetAngle = vehicle.instVars.targetAngle;
	const targetX = vehicle.instVars.targetTurnX;
	const targetY = vehicle.instVars.targetTurnY;
	const pelanggaran = vehicle.instVars.pelanggaran;

	let turn;

	if (turnArray.some(val => val[0] == pelanggaran)) {
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

	if (turn) {
		const intersectionLock = [lockCheck.instVars.intersectionId, turn[5], turn[6], turn[7]]
		vehicle.instVars.intersectionLock = intersectionLock.toString();

		return intersectionLock;
	} else {
		console.log("lock check tidak ada");
		console.log(test);
		console.log(vehicle);
		console.log(lockCheck);
	}
}

function lockIntersection(vehicle, allIntersections) {
	const pickedLock = splitComma(vehicle.instVars.intersectionLock);
	// 	console.log(pickedLock);

	const pickedIntersections = [];

	for (let i = 1; i <= 3; i++) {
		if (pickedLock[i] == -1) continue;

		const intersection = allIntersections.find(val => val.instVars.intersectionId == pickedLock[0]
			&& val.instVars.sequenceId == pickedLock[i]
			&& val.instVars.vehiclesUID == "");
		if (!intersection) {
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
			pickedVehicle = pickRandomVehicle(level);
			break;
	}

	// 	console.log(pickedVehicle);

	return pickedVehicle;
}

function pickRandomVehicle(level) {
	let vehiclesArray = Object.keys(vehicles).filter(v => v !== "motorbikeWithoutHelm"
														&& v !== "motorbikeWithoutLight"
														&& v !== "truckOverload"
														&& v !== "truckWithPassenger");

	if (level <= 8) {
		vehiclesArray = vehiclesArray.filter(v => v != "truck");
	} else if (level <= 12) {
		if (Math.random() < 0.25) {
			vehiclesArray = vehiclesArray.filter(v => v == "motorbike");
		} else {
			vehiclesArray = vehiclesArray.filter(v => v != "motorbike");
		}
	} else if (level <= 16) {
		vehiclesArray = vehiclesArray.filter(v => v != "motorbike");
	}

	return vehiclesArray[randomInt(0, vehiclesArray.length - 1)];
}

function pickType(vehicle) {
	return randomInt(1, vehicles[vehicle]);
}