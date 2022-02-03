import { writable } from 'svelte/store';

export const gameData = writable(
{
	wordToGuess: [
		"T",
		"R",
		"A",
		"I",
		"N"
	],
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
