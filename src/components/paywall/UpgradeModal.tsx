import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { colors } from '../../theme';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  /** Which plan unlocks this feature */
  requiredPlan?: 'basic' | 'pro';
}

export default function UpgradeModal({ open, onClose, title, description, requiredPlan = 'basic' }: UpgradeModalProps) {
  const isPro = requiredPlan === 'pro';

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', zIndex: 9000 }} />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -12 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              zIndex: 9001, width: '100%', maxWidth: 420, padding: '0 16px',
            }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              borderRadius: 22, border: '1px solid rgba(164,216,225,0.35)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.15)', padding: '28px 26px',
            }}>
              {/* Close */}
              <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: colors.textSubtle, display: 'flex', padding: 4 }}>
                <XMarkIcon style={{ width: 18, height: 18 }} />
              </button>

              {/* Icon */}
              <div style={{ width: 48, height: 48, borderRadius: 14, background: isPro ? 'rgba(124,58,237,0.1)' : 'rgba(42,157,143,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <SparklesIcon style={{ width: 24, height: 24, color: isPro ? '#7c3aed' : colors.accentStrong }} />
              </div>

              <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: colors.textMain, letterSpacing: '-0.02em' }}>{title}</h2>
              <p style={{ margin: '0 0 22px', fontSize: '0.88rem', color: colors.textMuted, lineHeight: 1.6 }}>{description}</p>

              {/* Plan badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: isPro ? 'rgba(124,58,237,0.06)' : 'rgba(42,157,143,0.06)', borderRadius: 12, border: `1px solid ${isPro ? 'rgba(124,58,237,0.2)' : 'rgba(42,157,143,0.2)'}`, marginBottom: 20 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isPro ? '#7c3aed' : colors.accentStrong, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {isPro ? 'Pro' : 'Basic or Pro'}
                </span>
                <span style={{ fontSize: '0.82rem', color: colors.textMuted }}>plan required</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', color: colors.textMuted, fontFamily: 'Inter,sans-serif' }}>
                  Maybe later
                </button>
                <Link to="/pricing" onClick={onClose} style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '10px 0', borderRadius: 12, border: 'none', background: isPro ? '#7c3aed' : colors.accentStrong, color: '#fff', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                    View Plans
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
