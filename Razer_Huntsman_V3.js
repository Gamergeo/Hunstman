export function Name() { return "Razer Huntsman V3"; }
export function VendorId() { return 0x1532; }
export function Documentation(){ return "troubleshooting/razer"; }
export function ProductId() { return 0x02a6; }
export function Publisher() { return "WhirlwindFX"; }
export function Size() { return [24, 9]; }
export function Type() { return "Hid"; }
export function DefaultPosition() {return [75, 70]; }
export function DefaultScale(){return 8.0;}
/* global
shutdownColor:readonly
LightingMode:readonly
forcedColor:readonly
*/
export function ControllableParameters(){
	return [
		{"property":"shutdownColor", "group":"lighting", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"LightingMode", "group":"lighting", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "group":"lighting", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
	];
}
const vLedNames = [
	"Del", "End", "Page Down", 
];
const vKeymap = [


	59, 60, 61,

];
const RowDict = {
	0: 22,
	1: 22,
};
const vLedPositions = [
	[1, 1], [1, 2], [1, 3],
];

function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	const colors = [];
	colors[0] = parseInt(result[1], 16);
	colors[1] = parseInt(result[2], 16);
	colors[2] = parseInt(result[3], 16);

	return colors;
}

export function LedNames() {
	return vLedNames;
}

export function LedPositions() {
	return vLedPositions;
}


export function Initialize() {

}

export function Render() {
	SendColors();
}


export function Shutdown() {
	SendColors(true);
}

function packetSend(packet, length) //Wrapper for always including our CRC
{
	const packetToSend = packet;
	packetToSend[89] = CalculateCrc(packet);
	device.send_report(packetToSend, length);
}

function CalculateCrc(report) {
	let iCrc = 0;

	for (let iIdx = 3; iIdx < 89; iIdx++) {
		iCrc ^= report[iIdx];
	}

	return iCrc;
}

function SendColors(shutdown = false) {

	const RGBData = new Array(390).fill(0);
	let TotalLedCount = 0;

	for(let iIdx = 0; iIdx < vKeymap.length; iIdx++) {
		const iPxX = vLedPositions[iIdx][0];
		const iPxY = vLedPositions[iIdx][1];
		var color;

		if(shutdown){
			color = hexToRgb(shutdownColor);
		}else if (LightingMode === "Forced") {
			color = hexToRgb(forcedColor);
		}else{
			color = device.color(iPxX, iPxY);
		}

		RGBData[vKeymap[iIdx]*3] = color[0];
		RGBData[vKeymap[iIdx]*3+1] = color[1];
		RGBData[vKeymap[iIdx]*3+2] = color[2];
		TotalLedCount += 1;
	}

	const sentLeds = 0;
	let PacketCount = 0;

	for(let i = 0; i < Object.keys(RowDict).length ;i++) {
		const LedsToSend = RowDict[PacketCount];

		let packet = [];
		packet[0] = 0x00;
		packet[1] = 0x00;
		packet[2] = 0x1F;
		packet[3] = 0x00;
		packet[4] = 0x00;
		packet[5] = 0x00;
		packet[6] = 0x47;
		packet[7] = 0x0F;
		packet[8] = 0x03;
		packet[11] = PacketCount++;
		packet[13] = 0x15;
		packet = packet.concat(RGBData.splice(0, LedsToSend*3));

		packetSend(packet, 91);
	}
}

export function Validate(endpoint) {
	return endpoint.interface === 3;
}

export function ImageUrl(){
	return "https://assets.signalrgb.com/devices/brands/razer/keyboards/huntsman-v2%20-%20analog.png";
}
