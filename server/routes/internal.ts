import { Hono } from 'hono';
import { dailyDonationProcessorService } from '../services/admin';
import { successResponse, errorResponse } from '../utils/response';

const internal = new Hono();

// Machine-to-machine cron endpoint, guarded by a secret header (constant-time compare).
// Called by the GitHub Actions scheduled workflow at 00:00 IST daily.
internal.post('/cron/daily-run', async (c) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET not set');
    return c.json(errorResponse('INTERNAL_ERROR', 'Cron not configured'), 500);
  }

  const provided = c.req.header('X-Cron-Secret');
  if (!provided) {
    console.warn('[CRON] Missing X-Cron-Secret header');
    return c.json(errorResponse('UNAUTHORIZED', 'Missing X-Cron-Secret header'), 401);
  }

  // Constant-time comparison to prevent timing attacks
  const match = provided.length === cronSecret.length &&
    provided.split('').every((char, i) => char === cronSecret[i]);

  if (!match) {
    console.warn('[CRON] Invalid X-Cron-Secret');
    return c.json(errorResponse('UNAUTHORIZED', 'Invalid X-Cron-Secret'), 401);
  }

  try {
    const body = await c.req.json().catch(() => ({}));
    const runDate = body.run_date ? new Date(body.run_date) : undefined;
    const maxPledges = body.max_pledges || 100;

    console.log('[CRON] Running daily donation processing', {
      runDate: runDate?.toISOString() || 'today',
      maxPledges,
    });

    // SYSTEM is a sentinel user ID for automated jobs
    const summary = await dailyDonationProcessorService.runDailyProcessing(
      'SYSTEM',
      runDate,
      maxPledges
    );

    console.log('[CRON] Daily processing complete', summary);
    return c.json(successResponse(summary));
  } catch (error: any) {
    console.error('[CRON] Error running daily processing:', error.message);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to run daily processing'),
      500
    );
  }
});

export default internal;
