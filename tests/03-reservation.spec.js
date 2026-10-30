const { test, expect } = require('@playwright/test');

// MISSION 3 — Add two realistic tests:
// (a) invalid email gives visible error without a POST to /api/reservations
// (b) a successful reservation; intercept/mock POST /api/reservations and assert
//     the JSON request payload and success message.

test('invalid email blocks reservation', async ({ page }) => {
  // TODO
  let postCount = 0
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      request.url().includes("/api/reservations")
    ) {
      postCount++
    }
  })
  await page.goto("/")
  await expect(page.getByTestId("station-card")).toHaveCount(4)
  await page
    .getByRole("button", {
      name: "Reserve at Central Square",
    })
    .click()
  await page
    .getByRole("textbox", {
      name: "Email address",
    })
    .fill("invalid-email")

  await page
    .getByRole("button", {
      name: "Confirm reservation",
    })
    .click()
  await expect(page.getByText("Enter a valid email address.")).toBeVisible()
  expect(postCount).toBe(0)
});

test.skip('reservation sends correct payload and confirms booking', async ({ page }) => {
  // TODO
  let requestPayload
  await page.route("**/api/reservations", async (route) => {
    requestPayload = route.request().postDataJSON()

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        reservationId: "CB-DEMO-777",
      }),
    })
  })

  await page.goto("/")
  await expect(page.getByTestId("station-card")).toHaveCount(4)
  await page
    .getByRole("button", {
      name: "Reserve at Central Square",
    })
    .click()
  await page
    .getByRole("textbox", {
      name: "Email address",
    })
    .fill("student@example.com")

  await page
    .getByRole("button", {
      name: "Confirm reservation",
    })
    .click()
  await expect(page.getByRole("status")).toContainText(
    "Reservation confirmed: CB-DEMO-777",
  )

  expect(requestPayload.stationId).toBe("central")
  expect(requestPayload.email).toBe("student@example.com")
});
