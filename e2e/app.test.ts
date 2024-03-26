import { type Browser, type Page, expect, test } from "@playwright/test";
import type { Player } from "../server/@types/entities";

const joinedPlayerNames: Player["name"][] = [];

test("players can join the game", async ({ browser }) => {
	const playersPages = await Promise.all([
		createPage(browser),
		createPage(browser),
	]);

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
