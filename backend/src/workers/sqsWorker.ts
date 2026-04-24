import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { pool } from '../config/db.js';

const sqs = new SQSClient({ region: process.env.AWS_REGION || 'us-west-2' });
const QUEUE_URL = process.env.SQS_QUEUE_URL;
const POLL_INTERVAL = 10_000; // 10 seconds

/**
 * SQS Worker – polls for AI analysis results and updates the database.
 *
 * Actual SQS message body (sent by Lambda after Comprehend):
 * {
 *   "file": "cvs/1777002544785-CV_TAHOANGHUY_INTERN.pdf",
 *   "extracted_skills": ["React.js", "Vite", "Tailwind CSS", "Shadcn UI"],
 *   "status": "COMPLETED"
 * }
 */

interface SQSMessageBody {
  file: string;              // cv_s3_key in applications table
  extracted_skills: string[];
  status: string;            // "COMPLETED" | "FAILED" etc.
}

async function processMessage(body: SQSMessageBody): Promise<boolean> {
  const { file, extracted_skills, status } = body;

  console.log(`[SQS Worker] Processing AI result for file: ${file}`);
  console.log(`[SQS Worker] Status: ${status}`);
  console.log(`[SQS Worker] Skills extracted: ${extracted_skills?.join(', ')}`);

  if (status !== 'COMPLETED') {
    console.warn(`[SQS Worker] Skipping non-completed message (status: ${status})`);
    return true; // Still delete the message
  }

  // Build ai_analysis JSONB from the extracted data
  const aiAnalysis = {
    skills: extracted_skills || [],
    match_score: Math.min(95, 60 + (extracted_skills?.length || 0) * 5), // Score based on skill count
    summary: `AI đã phân tích CV và bóc tách được ${extracted_skills?.length || 0} kỹ năng chính: ${extracted_skills?.slice(0, 3).join(', ')}${extracted_skills?.length > 3 ? '...' : ''}.`,
    analyzed_at: new Date().toISOString(),
  };

  // Find application by cv_s3_key and update
  const query = `
    UPDATE applications 
    SET ai_analysis = $1
    WHERE cv_s3_key = $2
    RETURNING id, full_name
  `;

  const result = await pool.query(query, [JSON.stringify(aiAnalysis), file]);

  if (result.rowCount === 0) {
    console.warn(`[SQS Worker] No application found with cv_s3_key = "${file}". Skipping.`);
    return false;
  }

  const row = result.rows[0];
  console.log(`[SQS Worker] ✅ Updated "${row.full_name}" (${row.id}) with AI analysis.`);
  console.log(`[SQS Worker] → Match Score: ${aiAnalysis.match_score}% | Skills: ${aiAnalysis.skills.length}`);
  return true;
}

async function pollMessages(): Promise<void> {
  if (!QUEUE_URL) return;

  try {
    const response = await sqs.send(new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 5,       // Long polling — reduces API calls
      VisibilityTimeout: 30,
    }));

    const messages = response.Messages || [];

    if (messages.length > 0) {
      console.log(`[SQS Worker] Received ${messages.length} message(s).`);
    }

    for (const message of messages) {
      try {
        // Parse – the body may be wrapped in an SNS envelope or sent directly
        let body: SQSMessageBody;
        const raw = JSON.parse(message.Body || '{}');

        // Handle SNS-wrapped messages
        if (raw.Message) {
          body = JSON.parse(raw.Message);
        } else {
          body = raw;
        }

        if (!body.file || !body.extracted_skills) {
          console.warn('[SQS Worker] Invalid message format, skipping:', message.Body);
          // Still delete invalid messages to prevent infinite retry
          await sqs.send(new DeleteMessageCommand({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle!,
          }));
          continue;
        }

        const processed = await processMessage(body);

        // Delete message after processing
        if (processed) {
          await sqs.send(new DeleteMessageCommand({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle!,
          }));
          console.log(`[SQS Worker] Message deleted from queue.`);
        }

      } catch (msgErr: any) {
        console.error(`[SQS Worker] Error processing message:`, msgErr.message);
        // Don't delete — it will become visible again after VisibilityTimeout
      }
    }
  } catch (err: any) {
    console.error(`[SQS Worker] Poll error: ${err.message}`);
  }
}

export function startSQSWorker(): void {
  if (!QUEUE_URL) {
    console.log('[SQS Worker] ⚠️  SQS_QUEUE_URL not configured. Worker disabled.');
    return;
  }

  console.log('-------------------------------------------');
  console.log('🤖 SQS AI WORKER STARTED');
  console.log(`📬 Queue: ${QUEUE_URL}`);
  console.log(`⏱️  Poll interval: ${POLL_INTERVAL / 1000}s`);
  console.log('-------------------------------------------');

  // Initial poll
  pollMessages();

  // Continuous polling
  setInterval(pollMessages, POLL_INTERVAL);
}
