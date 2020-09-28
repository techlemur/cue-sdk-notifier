//Modified from https://github.com/CorsairOfficial/cue-sdk-node/tree/master/example/color_pulse
const sdk = require('cue-sdk')
const cli = require('cli')
const readline = require('readline')
//const inquirer = require('inquirer');
const hex2rgb = require('hex2rgb');

const input_queue = []
const test_key = "";
const details = sdk.CorsairPerformProtocolHandshake()
const errCode = sdk.CorsairGetLastError()

cli.enable("catchall");


const args = cli.parse({
	interactive: [ 'i', 'Interactive mode', 'boolean', false ],
	device: [ 'n', 'Device number ', 'int', 0 ],
	keyIds: [ 'k', 'Key id\'s EX: -k "27 38 39 40" ', 'string', "" ],
	keys: [ 'e', 'Easy keys', 'string', false ],
	color: [ 'c', 'Hex color', 'string', "f00" ],
	color2: [ 'c2', 'Hex color', 'string', "000" ],
	blink: [ 'b', 'Number of times to flash keys', 'int', 1 ],
	delay: [ 'd', 'Delay between flashes in milliseconds', 'int', 1000 ],
	delay2: [ 'd2', 'Delay between flashes in milliseconds', 'int', false ],
	//autoExit: [ 't', 'Time the key should stay changed before reverting in milliseconds', 'int', 500],
})

const di = args.device;
const color = hex2rgb(args.color).rgb;
const color2 = hex2rgb(args.color2).rgb;

var mode = 0;
// 0 = wait for command 
// 1 = test ID mode 
// 2 = run loop 
// 3 = press key for id
// 4 = manual loop

if (errCode !== 0) {
	console.error(`Handshake failed: ${sdk.CorsairErrorString[errCode]}`)
	process.exit(1)
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function exit(code = 0) {
	console.log('Exiting.')
	sdk.CorsairUnsubscribeFromEvents()
	sdk.CorsairReleaseControl()
	process.exit(code)
}

function getAvailableLeds() {
	const leds = []
	const deviceCount = sdk.CorsairGetDeviceCount()
	for (let di = 0; di < deviceCount; ++di) {
	const ledPositions = sdk.CorsairGetLedPositionsByDeviceIndex(di)
		leds.push(ledPositions.map((p) => ({ ledId: p.ledId, r: 0, g: 0, b: 0 })))
	}

	return leds
}

function findID() {
	const TIME_PER_FRAME = 25
	if (input_queue.length > 0) {
		const input = input_queue.shift()
		if (input === 'q' || input === 'Q') {
			exit(0)
		} else {
			
		}
	}

	performPulseEffect(leds, x)
		return setTimeout(
			findID,
			TIME_PER_FRAME
		)
}

async function testLed(keyId){
	findBlankAll();
	sdk.CorsairSetLedsColorsFlushBuffer()
	sdk.CorsairSetLedsColors([{
		ledId: parseInt(keyId),
		r : color[0],
		g : color[1],
		b : color[2]
	}]);
	sdk.CorsairSetLedsColorsFlushBuffer()
	await sleep(500);
	sdk.CorsairSetLedsColors([{
		ledId: parseInt(keyId),
		r : 0,
		g : 0,
		b : 0
	}]);
	sdk.CorsairSetLedsColorsFlushBuffer()
	return
}

function testKey(){
	if(mode !== 1) return;
	
	//findBlankAll();
	
	
	
	
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	
	rl.question("Enter ID number ('q' to quit) ", function(keyId) {
		//console.log(keyId);
		//console.log(mode);
		if (isNaN(keyId)) {
			switch(keyId) {
				case 'q':
				case 'Q':
					mode = 0;
					
				default:
					console.log('Not a Number!');
			}
		}else{
			testLed(keyId)
		}
		
		
			rl.close();
	});
	
	rl.on("close", function() {
		//console.log("\nBYE BYE !!!");
		if(mode === 1){
			testKey();
		}else{
			exit();
		}
	});
	
}

function findHelp(){
	console.log(
		'Select Mode:\n' +
		'h - Help \n' +
		't - Test key mode \n' +
		'p - Print all led positions \n' +
		'f - Find mode (show key id on press) \n' +
		'l - Loop through all keys \n' +
		'm - Manually loop through all keys \n' +
		'q - Quit \n' +
//		' -  \n' +
		''
	)
}


async function findBlankAll(){
	
	const availableLeds = getAvailableLeds()
	if (!availableLeds.length) {
		console.error('No devices found')
		exit(1)
	}
	return new Promise(resolve => {
		var leds = [];
		for (let i = 0; i < availableLeds[0].length; i++) {
			leds.push({
				ledId: availableLeds[0][i].ledId,
				r : 0,
				g : 0,
				b : 0
			});
		}
		sdk.CorsairSetLedsColorsBufferByDeviceIndex(di, leds)
	//sdk.CorsairSetLedsColors(leds);
	sdk.CorsairSetLedsColorsFlushBuffer()
	});
}

async function findLoop(){
	while(true){
		console.log(availableLeds[0].length);
		for (let i = 0; i < availableLeds[0].length; i++) {
			console.log(availableLeds[0][i].ledId);
			console.log(i);
			await sleep(1000);
			sdk.CorsairSetLedsColors([{
				ledId: availableLeds[0][i].ledId,
				r : color[0],
				g : color[1],
				b : color[2]
			}]);
			
			if(i === 5){
				//exit();
			}
		}
	}
}

function debug(thing){
	console.log(thing);
}

async function main() {
	
	
	//sdk.CorsairSubscribeForEvents(debug)
	
	if(args.interactive){
		
		findHelp();
		
		var manLoopPos = 0;
		
		readline.emitKeypressEvents(process.stdin)
		process.stdin.setRawMode(true)
		process.stdin.on('keypress', (key, data) => {
			if (data.sequence === '\u0003') {
				// ^C
				exit()
			}
			//console.log(mode);
			switch(mode) {
				case 1:
					
					break;
				case 2:
					findHelp();
					mode = 0;
					break;
				case 3:
					//console.log(key);
					//console.log(data);
					console.log(key+" = "+sdk.CorsairGetLedIdForKeyName(data.sequence));
					console.log(data.name+" = "+sdk.CorsairGetLedIdForKeyName(data.name));
					//if(data.code){
						//console.log(data.code+" = "+sdk.CorsairGetLedIdForKeyName(data.code));
					//}
					break;
				case 4:
					//console.log(key);
					//console.log(data);
					//console.log(data.name);
					sdk.CorsairSetLedsColorsFlushBuffer()
					if(data.code){
						console.log(data.code);
					}
					
					sdk.CorsairSetLedsColors([{
						ledId: availableLeds[0][manLoopPos].ledId,
						r : 0,
						g : 0,
						b : 0
					}]);
					
					if (key === 'q' || key === 'Q') {
						findHelp();
						mode = 0;
					} else if (key === '+' || data.name == "space") {
						manLoopPos++
					} else if (key === '-') {
						manLoopPos--
					}
					//console.log(data.name);
					if(manLoopPos < 0){
						manLoopPos = availableLeds[0].length - 1;
					}
					
					if(manLoopPos >= availableLeds[0].length){
						manLoopPos = 0;
					}
					
					sdk.CorsairSetLedsColors([{
						ledId: availableLeds[0][manLoopPos].ledId,
						r : color[0],
						g : color[1],
						b : color[2]
					}]);
					
					//cli.progress((manLoopPos+1) / availableLeds[0].length);
					
					//console.log((manLoopPos+1)+" out of "+availableLeds[0].length+" led id: "+availableLeds[0][manLoopPos].ledId);
					
					console.log((manLoopPos+1)+" out of "+availableLeds[0].length+"  ------ "+availableLeds[0][manLoopPos].ledId+" ------");
					
					break;
				default:
					if(key === 'q' || key === 'Q'){
						exit();
					}
					
					switch(key) {
						case 'q':
						case 'Q':
							exit();
							break;
						case 't':
						case 'T':
							mode = 1;
							findBlankAll();
							//testLed(51);
							testKey();
							break;
						case 'l':
						case 'L':
							mode = 2;
							findLoop();
							break;
						case 'f':
						case 'F':
							mode = 3;
							break;
						case 'm':
						case 'M':
							mode = 4;
							findBlankAll();
							console.log(
								'Manual loop: \n' +
								'Press + for next led\n' +
								'Press - for last led\n' +
								'Press q to return to the main menu\n' +
								//'\n' +
								'\n' 
							);
							break;
						case 'p':
						case 'P':
							console.log(sdk.CorsairGetLedPositions());
							break;
						case 'h':
						case 'H':
							findHelp();
							break;
						case 'l':
							// loop
							findLoop();
							break;
						default:
							findHelp();
					}
			}
			
			
		})
		
		const availableLeds = getAvailableLeds()
		if (!availableLeds.length) {
			console.error('No devices found')
			exit(1)
		}
		
		async function findLoop(){
			while(true){
				if(mode !== 2) break;
				console.log(availableLeds[di].length);
				for (let i = 0; i < availableLeds[di].length; i++) {
					if(mode !== 2) break;
					console.log(availableLeds[di][i].ledId);
					console.log(i);
					sdk.CorsairSetLedsColors([{
						ledId: availableLeds[di][i].ledId,
						r : color[0],
						g : color[1],
						b : color[2]
					}]);
					await sleep(1000);
					
					if(i === 5){
						exit();
					}
				}
			}
		}
		//console.log(getAvailableLeds());
		//console.log(sdk.CorsairGetLedPositionsByDeviceIndex(1));
		
		//performPulseEffect(leds, x)
		//console.log(typeof(availableLeds[0]));
		
		
		
		
	}else{
		
		//console.log(args);
		//console.log(args.color);
		//console.log(hex2rgb(args.color).rgb);
		
		var device_leds = [];
		
		if(args.keyIds){
			//console.log(args.keyIds);
			
			try{
				var tmpKeys = args.keyIds.split(" ");
			}catch(err){
				var tmpKeys = [args.keyIds]
			}
			
			tmpKeys.forEach((keyId)=>{
				//console.log(keyId)
				if(!isNaN(parseInt(keyId))){
					device_leds.push({
						ledId: parseInt(keyId),
						r : color[0],
						g : color[1],
						b : color[2]
					});
				}
			})
			
		}
		
		if(args.keys){
			for (var i = 0; i < args.keys.length; i++) {
				var keyID = sdk.CorsairGetLedIdForKeyName(args.keys.charAt(i))
				device_leds.push({
					ledId: keyID,
					r : color[0],
					g : color[1],
					b : color[2]
				});
			}
		}
		
		//console.log(device_leds);
		
		sdk.CorsairSetLedsColorsBufferByDeviceIndex(di, device_leds)
		sdk.CorsairSetLedsColorsFlushBuffer();
		console.log(args.delay);
		await sleep(parseInt(args.delay));
		
		for (var b = 0; b < args.blink; b++) {
			//console.log(b);
			
			
			device_leds.forEach((led) => {
				led.r = color2[0]
				led.g = color2[1]
				led.b = color2[2]
			})
			sdk.CorsairSetLedsColorsBufferByDeviceIndex(di, device_leds)
			sdk.CorsairSetLedsColorsFlushBuffer();
			
			await sleep(args.delay2 || args.delay);
			
			
			device_leds.forEach((led) => {
				led.r = color[0]
				led.g = color[1]
				led.b = color[2]
			})
			//sdk.CorsairSetLedsColorsFlushBuffer();
			//sdk.CorsairReleaseControl();
			sdk.CorsairSetLedsColorsBufferByDeviceIndex(di, device_leds)
			
			sdk.CorsairSetLedsColorsFlushBuffer()
			
			await sleep(args.delay);
			
			
			
		}
		
		process.exit(0)
		
		
		/*
		setTimeout(function () {
			process.exit(0)
		}, args.autoExit);
		*/
		
		

		//return loop()
	}
	
}

main()
