import { useState, ReactNode } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { UPGRADE_MESSAGES, type FeatureKey } from '../../lib/planLimits';
import UpgradeModal from './UpgradeModal';
import { colors } from '../../theme';

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  /** If true, renders a locked placeholder instead of nothing */
  showLocked?: boolean;
  requiredPlan?: 'basic' | 'pro';
}

/**
 * Wraps a feature — renders children if the user has access,
 * otherwise shows a locked state that opens the UpgradeModal on click.
 */
export default function FeatureGate({ feature, children, showLocked = false, requiredPlan = 'basic' }: FeatureGateProps) {
  const { canUse } = useSubscription();
  const [modalOpen, setModalOpen] = useState(false);

  const msg = UPGRADE_MESSAGES[feature] ?? { title: 'Upgrade required', description: 'This feature requires a paid plan.' };

  if (canUse(feature)) return <>{children}</>;

  if (!showLocked) return null;

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
          borderRadius: 12, border: '1px dashed rgba(0,0,0,0.12)',
          background: 'rgba(0,0,0,0.02)', cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(42,157,143,0.04)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')}
      >
        <LockClosedIcon style={{ width: 14, height: 14, color: colors.textSubtle, flexShrink: 0 }} />
        <span style={{ fontSize: '0.82rem', color: colors.textSubtle }}>{msg.title}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700, color: colors.accentStrong, background: 'rgba(42,157,143,0.08)', padding: '2px 8px', borderRadius: 999 }}>Upgrade</span>
      </div>

      <UpgradeModal open={modalOpen} onClose={() => setModalOpen(false)} title={msg.title} description={msg.description} requiredPlan={requiredPlan} />
    </>
  );
}
