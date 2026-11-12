from adapters.http.catalog_router import ProductDetailResponse, ProductSummaryResponse


def test_buyer_product_payloads_never_expose_hidden():
    assert "hidden" not in ProductSummaryResponse.model_fields
    assert "hidden" not in ProductDetailResponse.model_fields
