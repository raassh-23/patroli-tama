import vehicles from "./vehiclesData.js";
import { randomInt } from './commonFunctions.js';

function checkTurn(vehicle, turnCheck) {
	const turnArray = turnCheck.instVars.turnAngle
		.split('|').map(str => str.split(','));

	const curAngle = vehicle.instVars.currentAngle;
	const melawanArus = vehicle.instVars.pelanggaran == 1? 1 : 0;

		console.log(curAngle, melawanArus);

	const turnable = turnArray.filter(val => val[0] == melawanArus && val[1] == curAngle);

	const rand = Math.floor(Math.random() * turnArray.length);

	const [, , target, targetX, targetY] = turnable[rand];

		console.table(target, targetX, targetY);

	if (target != curAngle) {
		vehicle.instVars.targetAngle = target;
		vehicle.instVars.targetTurnX = targetX;
		vehicle.instVars.targetTurnY = targetY;
		vehicle.instVars.turningId = turnCheck.instVars.id;
	}
}

function pickVehicle(pelanggaran) {
	let pickedVehicle = "";

	if(pelanggaran == 2) {
		pickedVehicle = "motorbikeWithoutHelm";
	} else if (pelanggaran == 3) {
		pickedVehicle = "motorbikeWithoutLight";
	} else {
		const vehiclesArray = Object.keys(vehicles).filter(v => v !== "motorbikeWithoutHelm" 
														&& v !== "motorbikeWithoutLight");

		pickedVehicle = vehiclesArray[randomInt(0, vehiclesArray.length - 1)]
	}

	return pickedVehicle;
}

function pickType(vehicle) {
	return randomInt(1, vehicles[vehicle]);
}