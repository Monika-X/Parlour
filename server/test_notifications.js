/**
 * test_notifications.js - End-to-End Notification System Test
 * This script verifies Email, SMS, and WhatsApp triggers for various flows.
 */
require('dotenv').config();
const { sendNotification } = require('./utils/notificationService');

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890'
};

const mockService = 'Luxury Spa Ritual';

async function runTests() {
  console.log('🚀 Starting Notification System Audit...\n');

  // Test 1: Booking Confirmation
  console.log('-- Test 1: Booking Confirmation --');
  await sendNotification({
    to: { email: mockUser.email, phone: mockUser.phone },
    subject: 'Booking Confirmed! - Parlour Salon & Spa',
    message: `Hi ${mockUser.name},\n\nYour appointment for ${mockService} is confirmed!\n\n📅 Date: 2026-04-17\n⏰ Time: 10:00 AM\n\nWe look forward to seeing you.`,
    type: 'all'
  });

  // Test 2: Status Update (In Progress)
  console.log('\n-- Test 2: Status Update (IN_PROGRESS) --');
  await sendNotification({
    to: { email: mockUser.email, phone: mockUser.phone },
    subject: `Appointment IN_PROGRESS - Parlour`,
    message: `Hi ${mockUser.name},\n\nYour appointment for ${mockService} is now IN_PROGRESS.\n\nThank you for choosing Parlour.`,
    type: 'all'
  });

  // Test 3: Reschedule
  console.log('\n-- Test 3: Reschedule --');
  await sendNotification({
    to: { email: mockUser.email, phone: mockUser.phone },
    subject: 'Appointment Rescheduled - Parlour',
    message: `Hi ${mockUser.name},\n\nYour appointment for ${mockService} has been rescheduled.\n\n📅 New Date: 2026-04-18\n⏰ New Time: 11:30 AM\n\nSee you then!`,
    type: 'all'
  });

  // Test 4: Cancellation
  console.log('\n-- Test 4: Cancellation --');
  await sendNotification({
    to: { email: mockUser.email, phone: mockUser.phone },
    subject: 'Appointment Cancelled - Parlour',
    message: `Hi ${mockUser.name},\n\nYour appointment for ${mockService} on 2026-04-17 has been CANCELLED as requested.`,
    type: 'all'
  });

  console.log('\n✅ Audit Script Completed.');
}

runTests().catch(err => {
  console.error('🔥 Audit Failed:', err.message);
  process.exit(1);
});
