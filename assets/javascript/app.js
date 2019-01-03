/*
Developer: Justas Lauzinskas
Title: Trivia Game
Description: Homework 5: JavaScript + jQuery + Timers
Date: 2018-12-17
*/
// Game Global Variables
var player;
var questionsTimer = 15; // seconds, time to select answer
var correctTimer = 5000; // m seconds, time to show result
var intervalId;
var resultCorrect = 0;
var resultIncorrect = 0;
var resultNoAnswer = 0;
var randomNumber;
var gifApiKey = "4Z0UHPk0D2V4xiPLjrtUcMs6MoFpAb0J";

function Game() {
	self = this;
	this.questionsList = Array();
	this.randomNumberList = Array();
	// Method to start timer
	this.runTimer = function() {
		clearInterval(intervalId);
		intervalId = setInterval(this.decrementTime, 1000);
	}
	// Method to decrement time and display on screen
	this.decrementTime = function() {
		questionsTimer--;
		$("#show-number").html("<h2>" + questionsTimer + "</h2>");
		if (questionsTimer === 0) {
			clearInterval(intervalId);
			resultNoAnswer++;
			self.showCorrectAnswer();
		}
	}
	// Method to push questions to array as object
	this.Questions = function(question, correctAnswer, randomAnswer1, randomAnswer2, randomAnswer3) {
		var self = this;
		this.question = question;
		this.correctAnswer = correctAnswer;
		this.randomAnswers = [];
		this.randomAnswers.push(correctAnswer, randomAnswer1, randomAnswer2, randomAnswer3);
		this.linkToGif;
		// Method to assign GIF by correct answer (using API)
		this.selectGif = function() {
			var queryURL = "https://api.giphy.com/v1/gifs/search?q=" + correctAnswer + "&api_key=" + gifApiKey + "&limit=1";
			$.ajax({
				url: queryURL,
				method: "GET"
			}).then(function(response) {
				self.linkToGif = response.data[0].images.fixed_width.url;
			});
		}
		this.selectGif();
	}
	// Method to generate random number to select question from array
	this.generateRandomNumber = function() {
		if (this.randomNumberList.length != this.questionsList.length) {
			var genRandomNumber = Math.floor(Math.random() * this.questionsList.length);
			if (this.randomNumberList.indexOf(genRandomNumber) === -1) {
				this.randomNumberList.push(genRandomNumber);
				randomNumber = genRandomNumber;
				// Reset timer before new question is selected
				questionsTimer = 15;
			} else {
				// Generate new number if question already was dispayed
				this.generateRandomNumber();
			}
		}
	}
	// Method to show correct answer on screen, after 10 seconds, display new question
	this.showCorrectAnswer = function() {
		$(".after-start").remove();
		$('<div class="correct-answer"></div>').appendTo(".game-section").hide();
		$('<p>').appendTo(".correct-answer");
		$('p').html("Correct answer is <strong>" + this.questionsList[randomNumber].correctAnswer + "</strong>");
		$('<img class="answer-gif">').appendTo(".correct-answer");
		$('.answer-gif').attr("src", this.questionsList[randomNumber].linkToGif);
		$('.correct-answer').fadeIn(1000);
		if (this.questionsList.length != this.randomNumberList.length) {
			setTimeout(function() {
				self.hideContent(".correct-answer", self.generateRandomNumber(), self.runTimer());
			}, correctTimer);
		} else {
			setTimeout(self.showScore, correctTimer);
		}
	}
	// Method (event listener) waiting until one of the answers is clicked
	this.waitForAnswer = function() {
		$(".select-answer").one("click", function() {
			selectedAnswer = $(this).text();
			if (selectedAnswer === self.questionsList[randomNumber].correctAnswer) {
				resultCorrect++;
				console.log(resultCorrect);
				clearInterval(intervalId);
				self.showCorrectAnswer();
			} else {
				resultIncorrect++;
				console.log(resultIncorrect);
				clearInterval(intervalId);
				self.showCorrectAnswer();
			}
		});
	}
	// Hide old answers/score and prepare screen for new question/game
	this.hideContent = function(hiding) {
		$(hiding).fadeOut(300);
		$(hiding).remove();
		$('<div class="after-start"></div>').appendTo(".game-section").hide();
		$('<div id="show-number"></div>').appendTo(".after-start");
		$('<div class="question"></div>').appendTo(".after-start");
		$("#show-number").html("<h2>" + questionsTimer + "</h2>");
		$(".question").text(this.questionsList[randomNumber].question);
		// Mix answers in array
		this.questionsList[randomNumber].randomAnswers.sort(function() {
			return 0.5 - Math.random()
		});
		// Display answers
		for (var i = 0; i < 4; i++) {
			$('<div class="select-answer" id="answer' + i + '"></div>').appendTo(".after-start");
			$('#answer' + i).text(this.questionsList[randomNumber].randomAnswers[i]);
		}
		setTimeout(this.showContent, 300);
		$("header").text("Question " + this.randomNumberList.length + " of " + this.questionsList.length);
	}
	// Method to reset global values and start new game
	this.playAgain = function() {
		this.randomNumberList = [];
		resultCorrect = 0;
		resultIncorrect = 0;
		resultNoAnswer = 0;
		this.hideContent(".show-score", this.generateRandomNumber(), this.runTimer());
	}
	// Display generated answer on screen
	this.showContent = function() {
		$(".after-start").fadeIn(500);
		self.waitForAnswer();
	}
	// Method to show result after all questions finished
	this.showScore = function() {
		$(".correct-answer").fadeOut(300);
		$(".correct-answer").remove();
		$('<div class="show-score"></div>').appendTo(".game-section").hide();
		$('<div id="show-title"></div>').appendTo(".show-score");
		$('<div id="correct"></div>').appendTo(".show-score");
		$('<div id="incorrect"></div>').appendTo(".show-score");
		$('<div id="noanswer"></div>').appendTo(".show-score");
		$('<button id="try-again">').appendTo(".show-score");
		$("#try-again").text("Play Again!");
		$("#show-title").html("<h2>" + player + ", your score:</h2>");
		$("#correct").html("Correct: " + resultCorrect);
		$("#incorrect").html("Incorrect: " + resultIncorrect);
		$("#noanswer").html("Not answered: " + resultNoAnswer);
		$(".show-score").fadeIn(500);
		$("header").text("You finished this quiz.");
		$("#try-again").one("click", function() {
			self.playAgain();
		});
	}
}
$(document).ready(function() {
	var ourGame = new Game();
	// Game questions (0 - question, 1 - correctAnswer, 2,3,4 - wrong answers)
	ourGame.questionsList.push(new ourGame.Questions("What does the online acronym SMH stand for?", "Shaking my head", "Something", "No meaning", "So much hate"));
	ourGame.questionsList.push(new ourGame.Questions("What is the EN translation automaker Volkswagen?", "People's car", "Safe car", "Family car", "Comfort car"));
	ourGame.questionsList.push(new ourGame.Questions("What is the Spanish word for meat?", "Carne", "Pollo", "Asada", "Pescado"));
	ourGame.questionsList.push(new ourGame.Questions("The term “déjà vu” comes from what language?", "French", "Spanish", "English", "German"));
	ourGame.questionsList.push(new ourGame.Questions("What language do they speak in Brazil?", "Portuguese", "Spanish", "Brazilian", "English"));
	ourGame.questionsList.push(new ourGame.Questions("How do you say hello in Mandarin Chinese?", "Ni Hao", "My dahn", "Zhow", "Boo kuh-chi"));
	ourGame.questionsList.push(new ourGame.Questions("Which is the most widely spoken language in the world?", "Mandarin Chinese", "English", "Russian", "Spanish"));
	ourGame.questionsList.push(new ourGame.Questions("What does the Japanese phrase, “domo arigato” mean in English?", "Thank you very much", "You are very welcome", "It's my pleasyre", "Have a wonderful day"));
	ourGame.questionsList.push(new ourGame.Questions("What is the national language of India?", "Hindi", "Punjabi", "Tamil", "Telugu"));
	ourGame.questionsList.push(new ourGame.Questions("What is the Spanish word for money?", "Dinero", "Plata", "Oro", "Telugu"));
	// After confirm button is clicked start game
	$("#confirm").click(function() {
		player = $("#name").val();
		if (!player) {
			player = "Player";
		}
		ourGame.hideContent(".before-start", ourGame.generateRandomNumber(), ourGame.runTimer());
	});
	$("#name").click(function() {
		$(this).attr("placeholder", "");
	});
});