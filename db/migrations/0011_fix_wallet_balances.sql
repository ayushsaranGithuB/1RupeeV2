-- Recompute cached_balance for all wallets from their ledger (wallet_transactions)
-- This fixes corrupted balances that resulted from the 0010 migration
-- missing wallets.cached_balance, and from seed wallets being initialized
-- with a bare column write instead of a ledger-backed entry.
--
-- wallet.cached_balance is documented as derived from wallet_transactions:
-- balance = SUM(all wallet_transaction.amount for that wallet)

UPDATE wallets SET cached_balance = (
    SELECT COALESCE(SUM(wt.amount), 0)
    FROM wallet_transactions wt
    WHERE wt.wallet_id = wallets.id
);
