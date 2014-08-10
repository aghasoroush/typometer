$(document).ready(function() {
	var $input = $("#type_text");
	window.game = new Game({
		sentence: "salam halet chetore? omid varam ke hame chi khoob pish bere...",
		sentenceDomElem: $("#text")
	});

	game.on('correctKeyStroke', function(word, correctKeyStroke) {
		console.log('correctKeyStroke ', word, correctKeyStroke);
	});

	game.on('wrongKeyStroke', function(word, wrongContent) {
		console.log('wrongKeyStroke ', word, wrongContent);
	});

	game.on('correctWord', function(word) {
		console.log('correct word: ', word);
		$input.val('');
	});

	game.on('wrongWord', function(word) {
		console.log('wrong word: ', word);
	});

	game.on('finished', function(stats) {
		console.log(stats);
	});


	$("#type_text").bind('copy paste cut', function(e) {
		e.preventDefault();
	});

	$("#type_text").keyup(function(ev) {
		var content = $(this).val();
		game.process(content, ev.which);
		return;
		content = content.split(" ")[0];
		var charIndex = content.length ? content.length - 1 : 0;
		if (content == "") {
			$(this).val("");
			return;
		}
		// console.log(words[wordIndex][charIndex]);
		
		//remove continiously spaces
		if(ev.which == 32 && content == ' ')
		{
			$(this).val('');
		} else if (ev.which == 32) { //check if space pressed
			if (content == words[wordIndex]) {
				console.log('word is correct');
				changeBackground(wordIndex, 'green');
				$(this).val('');
				wordIndex++;
				if (wordIndex == words.length) {
					alert('Well done!');
					$(this).prop('disabled', true);
					showStats();
				}
				trueKeys += content.length;
				trueKeys++;
			} else {
				changeBackground(wordIndex, 'red');
				
				if (lastWrongWordIndex != wordIndex) {
					wrongWords++;
				}
			}
			
		} else {
			//process entered character
			allKeys++;
			var _w = content.replace(/\s/g, '');
			if (_w == words[wordIndex].substring(0, content.length)) {
				//all characters all correct
				changeBackground(wordIndex, 'white');
				lastWrongKeys = 0;
			} else {
				numOfDiffs = levenshteinDistance(words[wordIndex].substring(0, content.length), _w);
				if (ev.which == 8) {
					return;
				}
				if (wordIndex != lastWrongWordIndex) {
					wrongKeys += numOfDiffs;
				} else if (numOfDiffs != lastWrongKeys) {
					wrongKeys += Math.abs(numOfDiffs - lastWrongKeys);
				}
				changeBackground(wordIndex, 'red');
				lastWrongWordIndex = wordIndex;
				lastWrongKeys = numOfDiffs;
			}

			//allKeys += _w.length;
		}

		if (ev.which == 8) {
			if (content.length != 0) {
				allKeys--;
			}

			return;
		}
	});

	function changeBackground(wordIndex, color) {
		var wordElem = $("#word-" + wordIndex);
		wordElem.css('background-color', color);

		return wordElem;
	}

	function showStats() {
		console.log({
			wrongKeys: wrongKeys,
			wrongWords: wrongWords,
			allKeys: trueKeys + wrongKeys,
			trueKeys: trueKeys,
			accuracy:  Math.round(( 1 - wrongKeys / sentence.length ) *100),
			// WPM: 
		});
	};

	function levenshteinDistance (s, t) {
        if (s.length === 0) return t.length;
        if (t.length === 0) return s.length;
 
        return Math.min(
                levenshteinDistance(s.substr(1), t) + 1,
                levenshteinDistance(t.substr(1), s) + 1,
                levenshteinDistance(s.substr(1), t.substr(1)) + (s[0] !== t[0] ? 1 : 0)
        );
	}
})