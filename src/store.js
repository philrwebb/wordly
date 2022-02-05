import { writable } from 'svelte/store';

export const keyboardData = writable({
	keystate: [
		[
			{keyLetter: "Q", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "W", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "E", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "R", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "T", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "Y", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "I", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "O", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "P", inWord: false, picked: false, rightPlace: false, color: "white"}
		],
		[
			{keyLetter: "A", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "S", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "D", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "F", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "G", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "H", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "J", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "K", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "L", inWord: false, picked: false, rightPlace: false, color: "white"}
		],
		[
			{keyLetter: "ENTER", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "Z", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "X", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "C", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "V", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "B", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "N", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "M", inWord: false, picked: false, rightPlace: false, color: "white"},
			{keyLetter: "DEL", inWord: false, picked: false, rightPlace: false, color: "white"}
		]
	]
})

export const gameData = writable(
{
	wordToGuess: [
		"ARRAY".split(""),
		"TRAIT".split(""),
		"TREAT".split(""),
		"PANIC".split(""),
		"PANTS".split(""),
		"MOIST".split(""),
		"MOTOR".split(""),
		"BACON".split(""),
		"BANJO".split(""),
		"BARKS".split(""),
		"BARON".split(""),
		"BASIC".split(""),
		"BASIS".split(""),
		"BASTE".split(""),
		"COURT".split(""),
		"CRABS".split(""),
		"DAMNS".split(""),
		"CEDAR".split(""),
		"CEDES".split(""),
		"CEDED".split(""),
		"FACED".split(""),
		"FACES".split(""),
		"GRAVE".split(""),
		"GRAIL".split(""),
		"GRAIN".split(""),
		"GRAYS".split(""),
		"GRAZE".split(""),
		"HIDES".split("")
	][Math.floor(Math.random() * 5)],
	gameWon: false,
	currentRow: 0,
	currentCol: 0,
	rowstate: [
	[
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false}
	],
	[
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false}
	],
		[
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false}
	],
		[
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false}
	],
		[
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false}
	],
		[
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false},
		{content: "", color: "white", inWord: false, rightPlace: false}
	]
]}
);

