import pytest

pytestmark = pytest.mark.frontend


class TestCheckoutStory10:
    """Story 10: server cart add + checkout receipt on catalog (mock API)."""

    def test_pickup_quick_add_and_checkout_shows_receipt(self, catalog_browser):
        catalog_browser.when_the_buyer_sets_pickup_on_landing()
        catalog_browser.when_the_buyer_quick_adds_first_product_on_catalog()
        catalog_browser.when_the_buyer_submits_checkout_from_cart()
        catalog_browser.then_the_receipt_shows_order_placed()
