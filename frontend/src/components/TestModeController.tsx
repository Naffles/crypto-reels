import { motion } from 'framer-motion';

export default function TestModeController() {
  return (
    <motion.div
      className="test-mode-banner"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="test-mode-content">
        <span className="test-mode-icon">🧪</span>
        <span className="test-mode-text">TEST MODE</span>
        <span className="test-mode-subtitle">Free Credits - No Real Money</span>
      </div>
    </motion.div>
  );
}