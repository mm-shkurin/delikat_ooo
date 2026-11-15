def half_away_round(value: float) -> int:
    if value >= 0:
        return int(value + 0.5)
    return int(value - 0.5)
