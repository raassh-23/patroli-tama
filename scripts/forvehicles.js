import vehicles from "./vehiclesData.js";
import { randomInt } from './commonFunctions.js';

function checkTurn(vehicle, turnCheck) {
	console.log("vehicle uid " + vehicle.uid);
	
	const turnArray = turnCheck.instVars.turnAngle
		.split('|').map((str) => {
			const arr = str.split(',');
			
			return arr.map(num => parseInt(num));
		});
	
	console.log(turnArray);
	
	const curAngle = vehicle.instVars.currentAngle;
	let pelanggaran = vehicle.instVars.pelanggaran == 1 
						|| vehicle.instVars.pelanggaran == 5 
						? vehicle.instVars.pelanggaran : 0;

	console.table({curAngle, pelanggaran});

	const turnable = turnArray.filter(val => val[0] == pelanggaran && val[1] == curAngle);
	
	console.log(turnable);

	const [, , targetAngle, targetX, targetY] = turnable[randomInt(0, turnable.length - 1)];

	console.table({targetAngle, targetX, targetY});

	if (targetAngle != curAngle) {
		vehicle.instVars.targetAngle = targetAngle;
		vehicle.instVars.targetTurnX = targetX;
		vehicle.instVars.targetTurnY = targetY;
		vehicle.instVars.turningId = turnCheck.instVars.id;
	}
}

function pickVehicle(pelanggaran) {
	let pickedVehicle = "";

	switch (pelanggaran) {
		case 2:
			pickedVehicle = "motorbikeWithoutHelm";
			break;

		case 3:
			pickedVehicle = "motorbikeWithoutLight";
			break;
			
		default:
			const vehiclesArray = Object.keys(vehicles).filter(v => v !== "motorbikeWithoutHelm" 
														&& v !== "motorbikeWithoutLight");

			pickedVehicle = vehiclesArray[randomInt(0, vehiclesArray.length - 1)]
			break;
	}

	return pickedVehicle;
}

function pickType(vehicle) {
	return randomInt(1, vehicles[vehicle]);
}