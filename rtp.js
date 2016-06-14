/* Benjamin Markson 2016. All Rights Reserved. All Wrongs Denied. Absolutely No Refunds. */
/* Originally coded as a Firefox add-on: https://addons.mozilla.org/en-US/firefox/addon/rotating-tiles-picture-puzz/ */

	var defaultImage = 'default.jpg';
	var randomImageURL = 'http://api.flickr.com/services/feeds/photos_public.gne';
		randomImageURL +='?tags=landscape,water,animals,clouds,statue,fire';
		randomImageURL +='&tagmode=any';
		randomImageURL +='&format=json';
//		randomImageURL +='&nojsoncallback=1';
	var randomImage = null;
	var randomImageArray = [];
	var randomLinkArray = [];
	var randomAuthorArray = [];
	var randomIndex = -1;
	var currentImage = null;
	var originalImage = new Image();
	var imageIndex = -1;
	var xArray = [];
	var yArray = [];
	var rArray = [];
	var remainingTiles = 0;
	var totalTiles = 0;
	var targetSizeArray = [200, 100, 75, 50];
	var tSize = 0;
	var scale = 1;

	init = function()
	{
		var elTiles = document.getElementById('rtpPuzzle-tiles');
		elTiles.style.left = ((window.innerWidth - elTiles.clientWidth) / 2) + "px";
		elTiles.style.top = ((window.innerHeight - elTiles.clientHeight) / 2) + "px";

		var elControls = document.getElementById('rtpPuzzle-controls');
		elControls.style.visibility = 'visible';

		newPicture('init');
	}

	showControls = function()
	{
		var elControls = document.getElementById('rtpPuzzle-controls');
		var elImage = document.getElementById('rtpPuzzle-controls-image');
		var elImageTp = document.getElementById('rtpPuzzle-controls-image-tp');

		if (elImageTp.textContent == 'Show Options')
		{
			elControls.style.borderColor = 'white';
			elControls.style.backgroundColor = 'black';
			elImage.style.borderColor = 'black';
			elImage.src = 'collapse.png';
			elImageTp.textContent = 'Hide Options';
			elControls.style.left = '0px';
			elControls.style.top = '0px';
		}
		else
		{
			elControls.style.borderColor = 'black';
			elControls.style.backgroundColor = 'transparent';
			elImage.style.borderColor = 'white';
			elImage.src = 'expand.png';
			elImageTp.textContent = 'Show Options';
			elControls.style.left = (((elControls.clientWidth - elImage.clientWidth) * -1) + 1) + 'px';
			elControls.style.top = (((elControls.clientHeight - elImage.clientHeight) * -1) + 1) + 'px';
		}
	}

	newPicture = function(context)
	{
		var elDifficulty = document.getElementsByName('rtpPuzzle-controls-difficulty');
		var elForwards = document.getElementById("rtpPuzzle-controls-forwards");
		var elLink = document.getElementById("rtpPuzzle-controls-link");

		for (var i = 0; i < elDifficulty.length; i++)
		{
			if (elDifficulty[i].checked == true)
			{
				var targetSize = targetSizeArray[i];
				break;
			}
		}

		elLink.style.display = 'none';
		elForwards.style.visibility = 'hidden';
		currentImage = null;

		originalImage.onload = function() {initTiles('init', targetSize)};
		originalImage.onerror = function() {originalImage.onerror = function() {initTiles('init', targetSize)};
											 originalImage.src = defaultImage};

		if (context == 'init' || context == 'moveForwards' || originalImage.src != randomImage)
		{
			var elScore = document.getElementById("rtpPuzzle-score");
			elScore.textContent = 'Fetching image...';
			fetchFlickrImage();
		}
		else originalImage.src = randomImage;
	}

	initTiles = function(context, targetSize)
	{
		var actualWidth = originalImage.width;
		var actualHeight = originalImage.height;

		if (context == 'init')
		{
			xArray = [];
			yArray = [];
			rArray = [];
			remainingTiles = 0;
			totalTiles = 0;

			if (window.innerWidth / actualWidth > window.innerHeight / actualHeight)
				 scale = window.innerHeight / actualHeight;
			else scale = window.innerWidth / actualWidth;
			tSize = Math.floor(targetSize / scale);

			var elTiles = document.getElementById('rtpPuzzle-tiles');
			elTiles.style.borderColor = 'white';
		}

		var tCols = Math.floor(actualWidth / tSize);
		var tRows = Math.floor(actualHeight / tSize);

		var xOffset = Math.floor((actualWidth - (tCols * tSize)) / 2);
		var yOffset = Math.floor((actualHeight - (tRows * tSize)) / 2);

		if ((window.innerWidth - 20) / (actualWidth - (xOffset * 2)) > (window.innerHeight - 40) / (actualHeight - (yOffset * 2)))
			 scale = (window.innerHeight - 40) / (actualHeight - (yOffset * 2));
		else scale = (window.innerWidth - 20) / (actualWidth - (xOffset * 2));

		var k = 0;
		var x = xOffset;
		var y = yOffset;
		var elRows = document.getElementById('rtpPuzzle-tiles-rows');
		while(elRows.hasChildNodes()) {elRows.removeChild(elRows.lastChild);}

		for (var i = 1; i <= tRows; i++)
		{
			var row = document.createElement("tr");
			var div = document.createElement("td");
			div.style.lineHeight = "1px";
			div.style.padding = "0px";
			div.style.whiteSpace = "nowrap";

			for (var j = 1; j <= tCols; j++)
			{
				k += 1;
				var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
				canvas.setAttribute('id', k);
				canvas.addEventListener('click', function(event){clickTile(this);} ,false);
				canvas.setAttribute('width', (tSize * scale));
				canvas.setAttribute('height', (tSize * scale));
				canvas.style.cursor = "pointer";
				div.appendChild(canvas);

				var ctx = canvas.getContext('2d');
				ctx.translate((tSize * scale) / 2, (tSize * scale) / 2);

				xArray[k] = x;
				yArray[k] = y;

				if (context == 'init')
				{
					rArray[k] = Math.floor(Math.random()*4);
					totalTiles += 1;
					if (rArray[k] > 0) remainingTiles += 1;
				}

				ctx.rotate(rArray[k] * 90 * Math.PI/180);
				ctx.drawImage(originalImage, xArray[k], yArray[k], tSize, tSize,
							 ((tSize * scale) / 2) * -1, ((tSize * scale) / 2) * -1, (tSize * scale), (tSize * scale));

				x += tSize;
				if (x >= (tSize * tCols))
				{
					x = xOffset;
					y += tSize;
				}
			}

			row.appendChild(div);
			elRows.appendChild(row);
		}

		if (context == 'init')
		{
			var elForwards = document.getElementById("rtpPuzzle-controls-forwards");
			elForwards.style.visibility = 'visible'

			if (originalImage.src == randomImage)
			{
				var elLink = document.getElementById("rtpPuzzle-controls-link");

				elLink.style.display = 'inline';
			}

			var elScore = document.getElementById("rtpPuzzle-score");
			var elScoreTp = document.getElementById("rtpPuzzle-score-tp");
			if (tCols == 0 || tRows == 0 || tSize == 0)
			{
				elScore.textContent = 'Picture ' + originalImage.src + ' is too small to tile or missing.'
				elScoreTp.textContent = originalImage.src;
			}
			else
			{
				elScore.textContent = 'You have ' + remainingTiles + ' tiles to find... good luck.';
				if (randomIndex >= 0) elScoreTp.innerHTML = originalImage.src + '<br>(' + randomAuthorArray[randomIndex] + ')';
				else elScoreTp.textContent = originalImage.src;
			}
		}

		var elTiles = document.getElementById('rtpPuzzle-tiles');
		elTiles.style.left = ((window.innerWidth - elTiles.clientWidth) / 2) + "px";
		elTiles.style.top = ((window.innerHeight - elTiles.clientHeight) / 2) + "px";
	}

	clickTile = function(el)
	{
		var i = el.getAttribute('id');
		var r = rArray[i];
		if (r > 0) remainingTiles -= 1;
		r += 1;
		if (r > 3) r = 0;
		rArray[i] = r;
		if (r > 0) remainingTiles += 1;

		var ctx = el.getContext('2d');
		ctx.rotate(90*Math.PI/180);
		ctx.clearRect(((tSize * scale) / 2) * -1, ((tSize * scale) / 2) * -1,  (tSize * scale), (tSize * scale));
		ctx.drawImage(originalImage, xArray[i], yArray[i], tSize, tSize, 
					 ((tSize * scale) / 2) * -1, ((tSize * scale) / 2) * -1, (tSize * scale), (tSize * scale));

		var elHints = document.getElementById("rtpPuzzle-controls-hints");
		var elTiles = document.getElementById("rtpPuzzle-tiles");
		if (remainingTiles == 0) elTiles.style.borderColor = 'green';
		else if (remainingTiles == 1 && elHints.checked) elTiles.style.borderColor = 'yellow';
		else  elTiles.style.borderColor = 'white';

		var elScore = document.getElementById("rtpPuzzle-score");
		if (remainingTiles == 0) elScore.textContent = 'Well done, the picture is complete.';
		else if (!elHints.checked) elScore.textContent = 'I\'ll tell you when you\'re finished.'
		else if (remainingTiles == 1) elScore.textContent = 'Only 1 tile left to find!';
		else elScore.textContent = 'You still have ' + remainingTiles + ' tiles left to find.';
	}

	moveForwards = function()
	{
		if (randomImage)
		{
			randomIndex += 1;
			newPicture('moveForwards');
		}
	}

	showHref = function()
	{
		var url = randomLinkArray[randomIndex];
		window.open(url);
	}

	fetchFlickrImage = function()
	{
		if (randomIndex >= 0 && randomIndex <= randomImageArray.length - 1)
		{
			randomImage = randomImageArray[randomIndex];
			originalImage.src = randomImage;
		}
		else
		{
			randomIndex = -1;
			randomImage = defaultImage;

//			$.getJSON(randomImageURL + '&jsoncallback=?')
//			.always(function(json) {processFlickrImage(json);});

			var request = $.ajax
			({
				dataType: "jsonp",
				type: "GET",
				url: randomImageURL + '&jsoncallback=?',
				success: function(json) {processFlickrImage(json);},
				timeout: 10000
			})
			.fail(function(xhr, status) {processFlickrImage('fail');});
		}
	}

	processFlickrImage = function(randomData)
	{
		if(randomData != 'fail' && typeof randomData.items != 'undefined' && randomData.items.length > 0)
		{
			randomImageArray = [];
			randomLinkArray = [];
			randomIndex = 0;

			var j = 0
			for (var i = 0; i < randomData.items.length; i++)
			{
				randomImageArray[j] = randomData.items[i].media.m.replace("_m", "_b");
				randomLinkArray[j] = randomData.items[i].link;
				randomAuthorArray[j] = randomData.items[i].author_id;
				j++;
			}

			randomImage = randomImageArray[0];
			originalImage.src = randomImage;
		}
		else originalImage.src = defaultImage;
	}

	resizeTiles = function()
	{
		initTiles('resize', 0)
	}

	window.onload = init;
	window.onresize = resizeTiles;
