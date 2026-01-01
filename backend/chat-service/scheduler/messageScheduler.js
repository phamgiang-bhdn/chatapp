const scheduledMessageController = require('../controllers/scheduledMessageController');

let schedulerInterval = null;

// Check for scheduled messages every 10 seconds
const INTERVAL_MS = 10000;

function startScheduler() {
  if (schedulerInterval) {
    console.log('[Scheduler] Already running');
    return;
  }

  console.log('[Scheduler] Starting message scheduler...');
  
  // Run immediately once
  scheduledMessageController.processScheduledMessages();
  
  // Then run on interval
  schedulerInterval = setInterval(() => {
    scheduledMessageController.processScheduledMessages();
  }, INTERVAL_MS);
}

function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Scheduler] Stopped');
  }
}

module.exports = {
  startScheduler,
  stopScheduler
};

