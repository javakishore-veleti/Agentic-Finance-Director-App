from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.treasury.service import (
    BankAccountService, CashPositionService, CashForecastService, ArAgingService, LiquidityService,
)


class TreasuryFacade:
    def __init__(self, db: AsyncSession):
        self.bank_svc = BankAccountService(db)
        self.cash_svc = CashPositionService(db)
        self.forecast_svc = CashForecastService(db)
        self.ar_svc = ArAgingService(db)
        self.liquidity_svc = LiquidityService(db)
