from usecase.staff_analytics.aggregate import InflowRow, MoneyResult, StatsResult


def stats_payload(result: StatsResult) -> dict:
    return {
        "order_count": result.order_count,
        "buyer_count": result.buyer_count,
        "buyer_slices": [
            {"label": row.label, "value_rub": row.value_rub} for row in result.buyer_slices
        ],
        "product_slices": [
            {"label": row.label, "value_rub": row.value_rub} for row in result.product_slices
        ],
    }


def money_payload(result: MoneyResult) -> dict:
    return {
        "revenue_rub": result.revenue_rub,
        "avg_check_rub": result.avg_check_rub,
        "inflow_rub": result.inflow_rub,
        "operation_count": result.operation_count,
        "revenue_by_day": [
            {"day": row.day, "label": row.label, "value_rub": row.value_rub}
            for row in result.revenue_by_day
        ],
        "top_by_qty": [
            {"label": row.label, "quantity": row.quantity} for row in result.top_by_qty
        ],
        "inflows": [_inflow_payload(row) for row in result.inflows],
    }


def _inflow_payload(row: InflowRow) -> dict:
    return {
        "id": row.id,
        "at": row.at.isoformat(),
        "title": row.title,
        "subtitle": row.subtitle,
        "amount_rub": row.amount_rub,
        "channel": row.channel,
    }
