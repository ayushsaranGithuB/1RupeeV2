-- Convert all amounts from paisa (x100) to rupees
-- This migration divides all amount fields by 100

-- Campaign amounts
UPDATE campaigns SET goal_amount = goal_amount / 100 WHERE goal_amount IS NOT NULL;
UPDATE campaigns SET raised_amount = raised_amount / 100 WHERE raised_amount > 0;

-- Campaign tier amounts
UPDATE campaign_tiers SET daily_amount = daily_amount / 100;
UPDATE campaign_tiers SET monthly_equivalent = monthly_equivalent / 100;

-- Wallet transaction amounts
UPDATE wallet_transactions SET amount = amount / 100;

-- Donation amounts
UPDATE donations SET amount = amount / 100;

-- Payout amounts
UPDATE payouts SET total_amount = total_amount / 100;

-- Audit log amounts
UPDATE audit_logs SET amount = amount / 100 WHERE amount IS NOT NULL;
