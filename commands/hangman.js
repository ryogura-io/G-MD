const fs = require('fs'); 
const axios = require("axios");

let hangmanGames = {};

async function startHangman(sock, chatId) {
    try {
        // Fetch random word from API
        const response = await axios.get("https://random-word-api.herokuapp.com/word");
        const word = response.data[0].toLowerCase();

        const maskedWord = '_ '.repeat(word.length).trim();

        hangmanGames[chatId] = {
            word,
            maskedWord: maskedWord.split(' '),
            guessedLetters: [],
            wrongGuesses: 0,
            maxWrongGuesses: 6,
        };

        await sock.sendMessage(chatId, { 
            text: `🎮 Hangman started!\n\nWord: ${maskedWord}\n\nGuess a letter with:\nguess <letter>` 
        });
    } catch (error) {
        console.error("Error fetching word:", error);
        await sock.sendMessage(chatId, { text: "❌ Couldn't start game. Try again later." });
    }
}

function guessLetter(sock, chatId, letter) {
    if (!hangmanGames[chatId]) {
        sock.sendMessage(chatId, { text: '❌ No game in progress. Start a new one with .hangman' });
        return;
    }

    const game = hangmanGames[chatId];
    const { word, guessedLetters, maskedWord, maxWrongGuesses } = game;

    if (guessedLetters.includes(letter)) {
        sock.sendMessage(chatId, { text: `⚠️ You already guessed "${letter}". Try another.` });
        return;
    }

    guessedLetters.push(letter);

    if (word.includes(letter)) {
        for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) {
                maskedWord[i] = letter;
            }
        }

        sock.sendMessage(chatId, { text: `✅ Good guess!\n${maskedWord.join(' ')}` });

        if (!maskedWord.includes('_')) {
            sock.sendMessage(chatId, { text: `🎉 Congratulations! You guessed the word: *${word}*` });
            delete hangmanGames[chatId];
        }
    } else {
        game.wrongGuesses += 1;
        sock.sendMessage(chatId, { text: `❌ Wrong guess! You have ${maxWrongGuesses - game.wrongGuesses} tries left.` });

        if (game.wrongGuesses >= maxWrongGuesses) {
            sock.sendMessage(chatId, { text: `💀 Game over! The word was: *${word}*` });
            delete hangmanGames[chatId];
        }
    }
}

module.exports = { startHangman, guessLetter };
