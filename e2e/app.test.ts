import { test, expect } from "@playwright/test";

test("test application", async ({ page }) => {
  await page.goto("/");

  //   Verify page title
  await expect(page).toHaveTitle("Colour Me Knowledgeable!");

  //   Verify colour is visible
  await page.getByText("Connected 🟢");

  //   Enter name
  const displayNameInput = await page.getByLabel("Display name");
  displayNameInput.click();
  displayNameInput.fill("Test name");

  //   Click join
  await page.getByRole("button", { name: "Join game" }).click();

  //   Verify name is visible
  await page.getByText("Name: Test name");
  await page.getByText("Test name", { exact: true });
});
