from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class CatalogStatements:
    def __init__(self, driver, app_url: str) -> None:
        self.driver = driver
        self.app_url = app_url.rstrip("/")
        self.wait = WebDriverWait(driver, 20)

    def given_the_buyer_opens_catalog(self) -> None:
        self.driver.get(f"{self.app_url}/catalog")
        self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='catalog-page']")))

    def then_the_catalog_route_body_class_is_set(self) -> None:
        body = self.driver.find_element(By.TAG_NAME, "body")
        assert "route-catalog" in body.get_attribute("class").split()

    def then_the_body_background_is_dark_catalog_theme(self) -> None:
        bg = self.driver.execute_script(
            "return window.getComputedStyle(document.body).backgroundImage;",
        )
        assert bg and bg != "none", "catalog body should use gradient background, not flat landing gray"
        rgb = self.driver.execute_script("return window.getComputedStyle(document.body).backgroundColor;")
        # Landing leak is #f5f5f5 ≈ rgb(245, 245, 245)
        assert "245, 245, 245" not in rgb, f"landing background leaked on catalog: {rgb}"

    def then_products_are_shown(self) -> None:
        self.wait.until(
            lambda d: d.find_element(By.CSS_SELECTOR, "[data-testid='product-grid']").get_attribute(
                "aria-busy",
            )
            == "false",
        )
        grid = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='product-grid']")
        cards = grid.find_elements(By.CSS_SELECTOR, ".card")
        assert len(cards) >= 1

    def when_the_buyer_opens_cart_overlay(self) -> None:
        self.given_the_buyer_opens_catalog()
        cart_btn = self.wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".icon-circle.cart")),
        )
        cart_btn.click()
        self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "#cart.drawer")))

    def then_cart_drawer_uses_dark_theme(self) -> None:
        drawer = self.driver.find_element(By.CSS_SELECTOR, "#cart.drawer")
        bg = self.driver.execute_script(
            "return window.getComputedStyle(arguments[0]).backgroundColor;",
            drawer,
        )
        title_color = self.driver.execute_script(
            "return window.getComputedStyle(arguments[0]).color;",
            drawer.find_element(By.CSS_SELECTOR, "h2"),
        )
        assert "245, 245, 245" not in bg, f"cart drawer should not be light landing sheet: {bg}"
        assert title_color == "rgb(255, 255, 255)", f"cart title should be white on dark drawer: {title_color}"

    def when_the_buyer_opens_landing_then_catalog(self) -> None:
        self.driver.get(f"{self.app_url}/")
        self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".hero-shell")))
        self.driver.get(f"{self.app_url}/catalog")
        self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='catalog-page']")))

    def when_the_buyer_sets_pickup_on_landing(self) -> None:
        self.driver.get(f"{self.app_url}/")
        self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "#mode-pickup"))).click()

    def then_the_catalog_address_chip_shows_pickup(self) -> None:
        chip = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='address-chip']")))
        assert chip.text.strip() == "Самовывоз"

    def when_the_buyer_quick_adds_first_product_on_catalog(self) -> None:
        self.given_the_buyer_opens_catalog()
        quick_add = self.wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='product-grid'] .card .add")),
        )
        quick_add.click()
        self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "#cart.drawer")))

    def when_the_buyer_submits_checkout_from_cart(self) -> None:
        checkout = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "#checkout:not([disabled])")))
        checkout.click()

    def then_the_receipt_shows_order_placed(self) -> None:
        self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "#receipt.drawer")))
        title = self.driver.find_element(By.ID, "receipt-title")
        assert title.text.strip() == "Заказ оформлен"
        lines = self.driver.find_elements(By.CSS_SELECTOR, "#receipt ul li")
        assert len(lines) >= 1
