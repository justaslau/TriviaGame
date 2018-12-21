/*
Developer: Justas Lauzinskas
Title: Trivia Game
Description: Homework 5: JavaScript + jQuery + Timers
Date: 2018-12-17
*/
// Game Global Variables
var player;
var questionsTimer = 10;
var intervalId;
var correctTimer = 1500;
var resultCorrect = 0;
var resultIncorrect = 0;
var resultNoAnswer = 0;
var randomNumber;
var gifApiKey = "4Z0UHPk0D2V4xiPLjrtUcMs6MoFpAb0J";

function Game() {
	self = this;
	this.questionsList = Array();
	this.randomNumberList = Array();
	this.runTimer = function() {
		clearInterval(intervalId);
		intervalId = setInterval(this.decrementTime, 1000);
	}
	this.decrementTime = function() {
		questionsTimer--;
		$("#show-number").html("<h2>" + questionsTimer + "</h2>");
		if (questionsTimer === 0) {
			clearInterval(intervalId);
			resultNoAnswer++;
			self.showCorrectAnswer();
		}
	}
	this.Questions = function(question, correctAnswer, randomAnswer1, randomAnswer2, randomAnswer3) {
		var self = this;
		this.question = question;
		this.correctAnswer = correctAnswer;
		this.randomAnswers = [];
		this.randomAnswers.push(correctAnswer, randomAnswer1, randomAnswer2, randomAnswer3);
		this.linkToGif;
		this.selectGif = function() {
			var queryURL = "http://api.giphy.com/v1/gifs/search?q=" + correctAnswer + "&api_key=" + gifApiKey + "&limit=1";
			$.ajax({
				url: queryURL,
				method: "GET"
			}).then(function(response) {
				self.linkToGif = response.data[0].images.fixed_width.url;
			});
		}
		this.selectGif();
	}
	this.generateRandomNumber = function() {
		if (this.randomNumberList.length != this.questionsList.length) {
			var genRandomNumber = Math.floor(Math.random() * this.questionsList.length);
			if (this.randomNumberList.indexOf(genRandomNumber) === -1) {
				this.randomNumberList.push(genRandomNumber);
				randomNumber = genRandomNumber;
				questionsTimer = 10;
				// kai sugeneruojam kur kreiptis toliau ?
			} else {
				// kai sugeneruotas skaicius jau egzistuoja
				this.generateRandomNumber();
			}
		}
	}
	this.showCorrectAnswer = function() {
		$(".after-start").remove();
		$('<div class="correct-answer"></div>').appendTo(".game-section").hide();
		$('<img class="answer-gif">').appendTo(".correct-answer");
		$('.answer-gif').attr("src", this.questionsList[randomNumber].linkToGif);
		$('.correct-answer').fadeIn(1000);
		if (this.questionsList.length != this.randomNumberList.length) {
			setTimeout(function() {
				self.hideContent(".correct-answer", self.generateRandomNumber(), self.runTimer());
			}, 10000);
		} else {
			console.log("you answered to all questions");
		}
	}
	this.waitForAnswer = function() {
		$(".select-answer").one("click", function() {
			selectedAnswer = $(this).text();
			if (selectedAnswer === self.questionsList[randomNumber].correctAnswer) {
				resultCorrect++;
				console.log("correct " + resultCorrect);
				clearInterval(intervalId);
				self.showCorrectAnswer();
			} else {
				resultIncorrect++;
				console.log("in correct " + resultIncorrect);
				clearInterval(intervalId);
				self.showCorrectAnswer();
			}
		});
	}
	this.hideContent = function(hiding) {
		$(hiding).fadeOut(300);
		$(hiding).remove();
		$('<div class="after-start"></div>').appendTo(".game-section").hide();
		$('<div id="show-number"></div>').appendTo(".after-start");
		$('<div class="question"></div>').appendTo(".after-start");
		$('<div class="answers"></div>').appendTo(".after-start");
		$("#show-number").html("<h2>" + questionsTimer + "</h2>");
		$(".question").text(this.questionsList[randomNumber].question);
		this.questionsList[randomNumber].randomAnswers.sort(function() {
			return 0.5 - Math.random()
		});
		for (var i = 0; i < 4; i++) {
			$('<div class="select-answer" id="answer' + i + '"></div>').appendTo(".after-start");
			$('#answer' + i).text(this.questionsList[randomNumber].randomAnswers[i]);
		}
		setTimeout(this.showContent, 300);
	}
	this.showContent = function() {
		$(".after-start").fadeIn(500);
		self.waitForAnswer();
	}
}
$(document).ready(function() {
	var ourGame = new Game();
	ourGame.questionsList.push(new ourGame.Questions("koks mano vardas", "justin", "tomas", "jonas", "ramunas"));
	ourGame.questionsList.push(new ourGame.Questions("kia mano pavarde", "bieber", "lauzinskas", "baltrunas", "jonikas"));
	$("#confirm").click(function() {
		player = $("#name").val();
		if (!player) {
			player = "Guess";
		}
		ourGame.hideContent(".before-start", ourGame.generateRandomNumber(), ourGame.runTimer());
	});
});