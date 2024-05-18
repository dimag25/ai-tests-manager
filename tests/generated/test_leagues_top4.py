import pytest
from playwright.sync_api import sync_playwright
import allure
from allure import step, attach

# Declare a fixture to initialize Playwright and create a browser context
playwright = sync_playwright()


@pytest.fixture
def context():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        yield context

@pytest.mark.parametrize("league", ["Premier League"])#, "La Liga", "Bundesliga", "Serie A"])
@allure.title('Test "{league}" Table on Google')
def test_google_search_league_table(context, league):
    # Open a new page in the browser context
    page = context.new_page()

    # Step 1: Navigate to Google homepage
    with step(f"Navigate to Google homepage"):
        page.goto('https://www.google.com')
        attach(page.screenshot(), "Google Homepage")

    # Step 2: Search for league table
    with step(f"Search for {league} table"):
        search_input = page.locator("textarea[name='q']")
        search_input.fill(f'{league} table')
        page.keyboard.press('Enter')
        attach(page.screenshot(), f"Search for {league} table")

    # Step 3: Wait for search results to load
    with step(f"Wait for search results to load"):
        page.wait_for_selector('.g')
        attach(page.screenshot(), f"Search results for {league}")

    # Step 4: Find and extract league table data
    with step(f"Find and extract {league} table data"):
        table_element = page.locator('.g-section-with-header')
        table_data = table_element.inner_text().split('\n')
        attach(table_element.screenshot(), f"{league} table data")

    # Step 5: Process and print top 4 teams
    with step(f"Process and print top 4 teams in {league} table"):
        # Process the table data to extract team names and points
        teams = []
        for row in table_data:
            if 'Pts' not in row:
                continue
            parts = row.split()
            if len(parts) >= 3:
                team_name = parts[0]
                points = int(parts[2])
                teams.append({'team': team_name, 'points': points})

        # Sort the teams by points in descending order
        sorted_teams = sorted(teams, key=lambda x: x['points'], reverse=True)

        # Print the top 4 teams for the league
        print(f"Top 4 teams in the {league} table:")
        for i, team in enumerate(sorted_teams[:4], start=1):
            print(f"{i}. {team['team']} - {team['points']} points")