//var events = require('events');

function levenshteinDistance (s, t) {
        if (s.length === 0) return t.length;
        if (t.length === 0) return s.length;
 
        return Math.min(
                levenshteinDistance(s.substr(1), t) + 1,
                levenshteinDistance(t.substr(1), s) + 1,
                levenshteinDistance(s.substr(1), t.substr(1)) + (s[0] !== t[0] ? 1 : 0)
        );
	}

function __getStats(gameObject) {
	var g = gameObject;
	return {
		keyStrokes: g.correctKeyStrokes + g.wrongKeyStrokes,
		wrongKeyStorkes: g.wrongKeyStrokes,
		correctKeyStrokes: g.correctKeyStrokes,
		wrongWords: g.wrongWords,
		correctWords: g.correctWords,
		accuracy: Math.round(( 1 - g.wrongKeyStrokes / g.sentence.length ) *100),
	};
}

function Game(options) {
	this.sentence 			= options.sentence;
	this.events				= {};
	this.wrongKeyStrokes	= 0;
	this.correctKeyStrokes 	= 0;
	this.correctWords 		= 0;
	this.wrongWords 		= 0;
	this.wordIndex			= 0;
	this.lastWrongWordIndex	= 0;
	this.lastWrongKeys		= 0;
	this.words 				= options.sentence.split(" ");

	this.onWrongKeyStroke = function(word, worngContent) {
		this.__emit('wrongKeyStroke', word, worngContent);
	};

	this.onCorrectKeyStroke = function(word, correctContent) {
		this.__emit('correctKeyStroke', word, correctContent);
	};

	this.onFinished = function(stats) {
		this.__emit('finished', stats);
	};

	this.onCorrectWord = function(correctWord) {
		this.__emit('correctWord', correctWord);
	};

	this.onWrongWord = function(wongWord) {
		this.__emit('wrongWord', wongWord);
	};
}

Game.prototype.__emit = function(evName) {
	var ev = this.events[evName];
	var args = [];

	for(var arg in arguments) {
		args.push(arguments[arg]);
	}
	
	if (ev) {
		ev.apply(this, args.slice(1));
	}
}

Game.prototype.Process = function(text, lastCharCode) {
	var self = this;
	text = text.split(" ")[0];
	var charIndex = text.length ? text.length - 1 : 0;
	if (text == "") {
		return false;
	}
	
	//remove continiously spaces
	if(lastCharCode == 32 && text == ' ') {
		return false;
	} else if (lastCharCode == 32) { //check if space pressed
		if (text == self.words[self.wordIndex]) {
			console.log('word is correct');
			self.onCorrectWord(text);
			self.wordIndex++;
			self.correctKeyStrokes += text.length;
			self.correctKeyStrokes++;
			if (self.wordIndex == this.words.length) {
				self.onFinished(__getStats(self));
			}
		} else {
			if (self.lastWrongWordIndex != self.wordIndex) {
				self.wrongWords++;
			}

			self.onWrongWord(text);
		}
		
	} else {
		//process entered character
		var _w = text.replace(/\s/g, '');
		if (_w == self.words[self.wordIndex].substring(0, text.length)) {
			//all characters all correct
			self.onCorrectKeyStroke(self.words[self.wordIndex], _w);
			self.lastWrongKeys = 0;
		} else {
			var numOfDiffs = levenshteinDistance(self.words[self.wordIndex].substring(0, text.length), _w);
			if (self.lastCharCode == 8) {
				return;
			}
			if (self.wordIndex != self.lastWrongWordIndex) {
				self.wrongKeyStrokes += numOfDiffs;
			} else if (numOfDiffs != self.lastWrongKeys) {
				self.wrongKeyStrokes += Math.abs(numOfDiffs - self.lastWrongKeys);
			}

			self.onWrongKeyStroke(self.words[self.wordIndex], _w);
			self.lastWrongWordIndex = self.wordIndex;
			self.lastWrongKeys = numOfDiffs;
		}

		//allKeys += _w.length;
	}

	if (lastCharCode == 8) {
		if (text.length != 0) {
			self.allKeys--;
		}

		return;
	}
}


Game.prototype.on = function(evName, callback) {
	this.events[evName] = callback;
	return this;
}

// Game.prototype.__proto__ = events.EventEmitter.prototype;
// module.exports = Game;
