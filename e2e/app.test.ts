import { type Browser, type Page, expect, test } from "@playwright/test";
import type { Colour, Player } from "../server/@types/entities";

const joinedPlayerNames: Player["name"][] = [];

test("players can join and start the game", async ({ browser }) => {
	const playersPages = await Promise.all([
		createPage(browser),
		createPage(browser),
	]);
	const player1Page = playersPages[0];

	await Promise.all(
		playersPages.map(async (playerPage, playerPageIndex) => {
			await connect(playerPage);
			const name = `Player ${playerPageIndex + 1}`;
			await addName(playerPage, name);

			//   Verify name is visible
			await expect(
				playerPage.getByText(`Name: ${name}`, { exact: true }),
			).toBeVisible();
		}),
	);

	//   Verify full player list is visible on all players' browsers
	for (const playerPage of playersPages) {
		for (const joinedPlayerName of joinedPlayerNames) {
			await expect(
				playerPage.getByRole("listitem").getByText(joinedPlayerName),
			).toBeVisible();
		}
	}

	//   Start game
	await startGame(player1Page);

	//  Verify game has started
	for (const playerPage of playersPages) {
		await expect(playerPage.getByText("Choose your colour")).toBeVisible();
	}

	const playerColours: Colour[][] = [
		["red", "blue"],
		["green", "yellow"],
	];

	// Select colours
	await Promise.all(
		playersPages.map(async (playerPage, index) => {
			await selectColours(playerPage, playerColours[index]);
		}),
	);

	// Verify colours are visible
	for (const [index, playerPage] of playersPages.entries()) {
		const colours = playerColours[index];
		await expect(
			playerPage.getByText(`You picked: ${colours.sort().join(", ")}`),
		).toBeVisible();
	}
});

const createPage = async (browser: Browser) => {
	const context = await browser.newContext();
	const page = await context.newPage();
	return page;
};

const connect = async (page: Page) => {
	await page.goto("/");

	//   Verify page title
	await expect(page).toHaveTitle("Colour Me Knowledgeable!");

	//   Verify colour is visible
	await page.getByText("Connected 🟢");
};

const addName = async (page: Page, name: Player["name"]) => {
	//   Enter name
	const displayNameInput = page.getByLabel("Display name");
	await displayNameInput.fill(name);

	//   Click join
	const joinButton = page.getByRole("button", { name: "Join game" });
	await joinButton.click();
	joinedPlayerNames.push(name);
};

const startGame = async (page: Page) => {
	const startButton = page.getByRole("button", { name: "Start game!" });
	await startButton.click();
};

const selectColours = async (page: Page, colours: Colour[]) => {
	for (const colour of colours) {
		await page.getByRole("checkbox", { name: colour }).check();
	}

	await page.getByRole("button", { name: "Submit" }).click();
};
