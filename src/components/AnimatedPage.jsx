import React from 'react'
import { motion } from 'framer-motion'
import { pageVariants, pageTransition } from '../lib/animations'

const AnimatedPage = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedPage