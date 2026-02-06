from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.accounting.service import (
    GeneralLedgerService, TrialBalanceService, IntercompanyService,
    ReconciliationService, CloseManagementService,
)


class AccountingFacade:
    def __init__(self, db: AsyncSession):
        self.gl_svc = GeneralLedgerService(db)
        self.tb_svc = TrialBalanceService(db)
        self.ic_svc = IntercompanyService(db)
        self.recon_svc = ReconciliationService(db)
        self.close_svc = CloseManagementService(db)
