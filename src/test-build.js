// Simple syntax check for the main files
import React from 'react';

// Test the problematic components
try {
  const ExamWizard = require('./components/ExamWizard.tsx');
  const StudentExamInterface = require('./components/StudentExamInterface.tsx');
  const ExamMonitoring = require('./components/ExamMonitoring.tsx');
  console.log('✅ All components imported successfully');
} catch (error) {
  console.error('❌ Import error:', error.message);
}