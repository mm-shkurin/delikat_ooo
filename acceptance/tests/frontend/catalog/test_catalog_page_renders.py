import pytest

pytestmark = pytest.mark.frontend


class TestCatalogPageRenders:
    """Story 08: catalog screen loads from Store API with dark page background."""

    def test_catalog_has_dark_background_and_products(self, catalog_browser):
        catalog_browser.given_the_buyer_opens_catalog()
        catalog_browser.then_the_catalog_route_body_class_is_set()
        catalog_browser.then_the_body_background_is_dark_catalog_theme()
        catalog_browser.then_products_are_shown()

    def test_cart_drawer_dark_not_landing_light(self, catalog_browser):
        catalog_browser.when_the_buyer_opens_cart_overlay()
        catalog_browser.then_cart_drawer_uses_dark_theme()

    def test_background_after_navigating_from_landing(self, catalog_browser):
        catalog_browser.when_the_buyer_opens_landing_then_catalog()
        catalog_browser.then_the_catalog_route_body_class_is_set()
        catalog_browser.then_the_body_background_is_dark_catalog_theme()
        catalog_browser.then_products_are_shown()

    def test_fulfillment_mode_syncs_from_landing_to_catalog(self, catalog_browser):
        catalog_browser.when_the_buyer_sets_pickup_on_landing()
        catalog_browser.given_the_buyer_opens_catalog()
        catalog_browser.then_the_catalog_address_chip_shows_pickup()
