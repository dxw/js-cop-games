import { type BrowserContext, type Page, expect, test } from "@playwright/test";
import { konamiCode } from "../client/utils/adminUtils";
import type { Colour, Player } from "../server/@types/entities";

const joinedPlayerNames: Player["name"][] = [];
let playersPages: Page[] = [];
let contexts: BrowserContext[];

test.beforeEach(async ({ browser }) => {
	contexts = await Promise.all([
		await browser.newContext(),
		await browser.newContext(),
	]);
	playersPages = await Promise.all(
		contexts.map(async (context) => await context.newPage()),
	);
});

test.afterEach(async () => {
	// biome-ignore lint/complexity/noForEach: this doesn't work with a for ... of loop
	konamiCode.forEach(async (key) => {
		await playersPages[0].keyboard.down(key);
	});

	await playersPages[0].getByRole("button", { name: "Reset round" }).click();

	for (const context of contexts) {
		await context.close();
	}
});

test("players can join and start the game", async () => {
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
		["yellow", "green"],
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
		await expect(playerPage.getByText("Your selection")).toBeVisible();
		await expect(playerPage.locator(".colour-cards__card p")).toHaveText(
			colours.map((colour) => colour[0].toUpperCase() + colour.slice(1)),
		);
	}
});

const connect = async (page: Page) => {
	await page.goto("/");

	//   Verify page title
	await expect(page).toHaveTitle("Colour Me Knowledgeable!");
};

const addName = async (page: Page, name: Player["name"]) => {
	//   Enter name
	const displayNameInput = page.getByLabel("Display name");
	await displayNameInput.fill(name);

	//   Click join
	const joinButton = page.getByRole("button", { name: "Join game" });
	await joinButton.click();

	//   Verify colour is visible
	await page.getByText("Connected 🟢");

	joinedPlayerNames.push(name);
};

const startGame = async (page: Page) => {
	const startButton = page.getByRole("button", { name: "Start game!" });
	await startButton.click();
};

const selectColours = async (page: Page, colours: Colour[]) => {
	for (const colour of colours) {
		await page.locator(`label[for="${colour}"]`).click();
	}

	await page.getByRole("button", { name: "Submit" }).click();
};
