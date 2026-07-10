# Payments Guide (Plain English)

This document explains how payments work in this project today, what has already been built, and what will happen once Razorpay details are available.

## What We Have Built

We now have a provider-based payment system in the API with two modes:

- Mock provider (default)
- Razorpay provider (ready to use when credentials are added)

The main idea is simple:

1. A payment provider sends a webhook when payment is captured.
2. The API verifies the webhook signature.
3. The API reads the payment details from the webhook payload.
4. The user wallet is credited through ledger business logic.

This means the system is already structured so we can swap from mock to Razorpay without rewriting business logic.

## Current Endpoints

- POST /payments/webhook

  - Public webhook endpoint for payment providers.
  - Verifies signature.
  - Parses captured payment event.
  - Credits the user wallet.

- POST /wallets/topup
  - Existing endpoint for wallet top-up behavior.
  - In production, final wallet credit should come from webhook verification, not from client-reported success.

## Security Model

Webhook requests are accepted only if signature verification passes.

- Mock mode uses header: x-mock-signature
- Razorpay mode uses header: x-razorpay-signature

If signature verification fails, the API returns unauthorized.

## How Signature Verification Works

Both providers use HMAC SHA-256 on the raw request body.

- The API computes expected signature using the configured secret.
- The API compares expected signature and incoming signature using timing-safe comparison.

If they match, webhook is trusted.

## Payloads We Accept

Only captured payment events are processed.

### Mock payload shape

{ "event": "payment.captured", "data": { "reference_id": "uuid", "user_id": "uuid", "amount": 500, "payment_id": "pay_mock_123" } }

### Razorpay payload shape (supported)

{ "event": "payment.captured", "payload": { "payment": { "entity": { "id": "pay_xxx", "amount": 500, "notes": { "reference_id": "uuid", "user_id": "uuid" } } } } }

## Wallet Crediting Behavior

On successful webhook processing:

1. We find the user wallet.
2. We add a TOPUP transaction in wallet ledger.
3. We update wallet cached balance.
4. We return success response.

If wallet is missing, the API returns not found for that webhook user.

## Configuration

Use these environment variables:

- PAYMENT_PROVIDER

  - mock (default)
  - razorpay

- MOCK_WEBHOOK_SECRET

  - Secret used to validate mock webhook signatures.
  - Defaults to mock-webhook-secret if not provided.

- RAZORPAY_WEBHOOK_SECRET
  - Required when PAYMENT_PROVIDER is razorpay.

## What Happens When Razorpay Details Arrive

No major refactor is needed.

Steps:

1. Set PAYMENT_PROVIDER=razorpay.
2. Set RAZORPAY_WEBHOOK_SECRET.
3. Configure Razorpay webhook URL to POST /payments/webhook.
4. Ensure checkout flow sends reference_id and user_id in payment notes.

After this, the same core wallet business logic continues to work.

## Testing Status

Automated tests now cover:

- Invalid webhook signature rejection.
- Invalid webhook payload rejection.
- Valid webhook path through business logic.

This gives us confidence that provider wiring, signature checks, and event parsing are in place.

## Practical Summary

In plain terms:

- We are no longer blocked waiting for Razorpay details to structure payments.
- The system is already webhook-first and provider-ready.
- Mock mode lets us continue building and testing now.
- Razorpay can be plugged in later with configuration, not redesign.
