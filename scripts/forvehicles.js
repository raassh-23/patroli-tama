import vehicles from "./vehiclesData.js";

function checkTurn(vehicle, turnCheck) {
	const turnArray = turnCheck.instVars.turnAngle
		.split('|').map(str => str.split(','));

	const curAngle = vehicle.instVars.currentAngle;

	// 	console.log(curAngle);

	const turnable = turnArray.filter(val => val[0] == curAngle);

	const rand = Math.floor(Math.random() * turnArray.length);

	const [, target, targetX, targetY] = turnable[rand];

	// 	console.table(target, targetX, targetY);

	if (target != curAngle) {
		vehicle.instVars.targetAngle = target;
		vehicle.instVars.targetTurnX = targetX;
		vehicle.instVars.targetTurnY = targetY;
		vehicle.instVars.turningId = turnCheck.instVars.id;
	}
}

function pickType(vehicle) {
	return Math.floor(Math.random() * vehicles[vehicle]) + 1;
}