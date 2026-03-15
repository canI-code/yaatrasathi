import { useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { UPGRADE_MESSAGES } from '../lib/planLimits';

/**
 * Returns a wrapper that checks + increments the AI quota before
 * executing any async AI function. If the quota is exceeded, it
 * sets an upgrade prompt instead of calling the function.
 */
export function useAIQuota() {
  const { hasAIQuota, incrementAIUsage } = useSubscription();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const upgradeMsg = UPGRADE_MESSAGES['aiQueriesPerDay'];

  async function withQuota<T>(fn: () => Promise<T>): Promise<T | null> {
    if (!hasAIQuota()) {
      setUpgradeOpen(true);
      return null;
    }
    const allowed = await incrementAIUsage();
    if (!allowed) {
      setUpgradeOpen(true);
      return null;
    }
    return fn();
  }

  return { withQuota, upgradeOpen, setUpgradeOpen, upgradeMsg };
}
