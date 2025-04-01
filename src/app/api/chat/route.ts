import { NextRequest, NextResponse } from 'next/server';

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_ADMIN_ID = process.env.TELEGRAM_ADMIN_ID!;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Add polling configuration
const POLLING_INTERVAL = process.env.TELEGRAM_POLLING_INTERVAL 
  ? parseInt(process.env.TELEGRAM_POLLING_INTERVAL) 
  : 2000; // Default to 2 seconds
let lastUpdateId = 0;
let isPollingActive = false;

// Define interfaces
interface TelegramEntity {
  offset: number;
  length: number;
  type: string;
}

interface ChatMessage {
  text: string;
  timestamp: Date;
  retrieved: boolean;
}

// In-memory message store
const pendingMessages = new Map<string, Array<ChatMessage>>();

// Helper function to get normalized session ID variants
function getSessionIdVariants(sessionId: string): string[] {
  // Extract the base part of the session ID (without v2)
  const baseSessionId = sessionId.replace(/v2$/, '');
  // Return both with and without v2 suffix
  return [baseSessionId, `${baseSessionId}v2`];
}

// Helper function to extract short ticket ID from a session ID
function getShortTicketId(sessionId: string): string {
  return sessionId.split('_').pop()?.substring(0, 8) || sessionId;
}

// Helper function to store a new message
function storeMessage(sessionId: string, text: string) {
  console.log(`Storing message for session ${sessionId}: ${text}`);
  
  if (!sessionId) {
    console.error('No session ID provided, cannot store message');
    return;
  }
  
  // Generate multiple variants of the session ID to maximize chances of retrieval
  let variants: string[] = [];
  
  // Start with the exact session ID
  variants.push(sessionId);
  
  // Add normalized variants with/without v2 suffix
  const standardVariants = getSessionIdVariants(sessionId);
  for (const variant of standardVariants) {
    if (!variants.includes(variant)) {
      variants.push(variant);
    }
  }
  
  // Extract the short ID part (if present)
  if (sessionId.includes('_')) {
    const shortId = sessionId.split('_').pop()?.replace(/v2$/, '') || '';
    if (shortId && !variants.includes(shortId)) {
      variants.push(shortId);
      
      // Also add v2 variant for the short ID
      if (!variants.includes(`${shortId}v2`)) {
        variants.push(`${shortId}v2`);
      }
    }
  } 
  // If sessionId is already a short ID (no underscores), ensure v2 variant exists
  else if (!sessionId.endsWith('v2')) {
    const shortId = sessionId.replace(/v2$/, '');
    if (!variants.includes(`${shortId}v2`)) {
      variants.push(`${shortId}v2`);
    }
    
    // Also add session prefix variants with current timestamp
    const timestamp = Date.now();
    if (!variants.includes(`session_${timestamp}_${shortId}`)) {
      variants.push(`session_${timestamp}_${shortId}`);
    }
    if (!variants.includes(`session_${timestamp}_${shortId}v2`)) {
      variants.push(`session_${timestamp}_${shortId}v2`);
    }
  }
  
  // For compatibility with timestamp-based formats, add a generic variant
  if (sessionId.includes('_') && sessionId.startsWith('session_')) {
    const parts = sessionId.split('_');
    if (parts.length >= 3) {
      const shortId = parts[2]?.replace(/v2$/, '') || '';
      // Get just first digits of the timestamp
      const timestampPart = String(Date.now()).substring(0, 5);
      
      const estimatedSessionId = `session_${timestampPart}26238_${shortId}`;
      if (!variants.includes(estimatedSessionId)) {
        variants.push(estimatedSessionId);
        console.log(`Added estimated session ID variant: ${estimatedSessionId}`);
      }
    }
  }
  
  console.log(`Using ${variants.length} session ID variants: ${variants.join(', ')}`);
  
  // Create the message to store
  const newMessage: ChatMessage = {
    text,
    timestamp: new Date(),
    retrieved: false
  };
  
  // Store for all variants
  for (const variant of variants) {
    const messages = pendingMessages.get(variant) || [];
    
    // Check for duplicates to avoid storing the same message twice
    const isDuplicate = messages.some(m => 
      m.text === text && 
      Math.abs(m.timestamp.getTime() - newMessage.timestamp.getTime()) < 1000
    );
    
    if (!isDuplicate) {
      console.log(`Adding message to variant ${variant}`);
      messages.push({...newMessage}); // Clone to avoid reference issues
      pendingMessages.set(variant, messages);
    } else {
      console.log(`Skipping duplicate message for variant ${variant}`);
    }
  }
  
  // Return the number of variants used
  return variants.length;
}

/**
 * Handle POST requests - For LiveChat messages (no longer handling Telegram webhooks)
 */
export async function POST(req: NextRequest) {
  try {
    // Extract the request body and clone for reuse
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Only handle LiveChat messages now
    console.log('Handling LiveChat message');
    return handleLiveChatMessage(body);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handle GET requests - For fetching messages
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const debug = searchParams.get('debug');
    const testMessage = searchParams.get('testMessage');
    const userId = searchParams.get('userId');
    const showAllMessages = searchParams.get('showAllMessages') === 'true';
    const dontMarkRetrieved = searchParams.get('dontMarkRetrieved') === 'true';
    
    // AUTO-FETCH FROM TELEGRAM: Always fetch latest messages from Telegram before responding
    // This ensures the client always gets the most up-to-date messages without manual polling
    if (sessionId) {
      console.log(`Auto-fetching latest messages from Telegram before responding for session: ${sessionId}`);
      try {
        // Perform a quick poll to get new messages
        const response = await fetch(`${TELEGRAM_API}/getUpdates?offset=${lastUpdateId}&timeout=1`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.result && data.result.length > 0) {
            console.log(`Found ${data.result.length} new Telegram updates, processing...`);
            
            // Process each update
            for (const update of data.result) {
              // Update the lastUpdateId for future polls
              lastUpdateId = update.update_id + 1;
              
              // Handle admin replies
              if (update.message?.reply_to_message && update.message?.text) {
                // Check if this is from the admin
                if (update.message.from.id.toString() === TELEGRAM_ADMIN_ID) {
                  await handleTelegramAdminReply(update.message);
                }
              }
              
              // Handle callback queries (button clicks)
              if (update.callback_query) {
                await handleTelegramCallbackQuery(update.callback_query);
              }
            }
            
            console.log(`Completed processing of ${data.result.length} Telegram updates`);
          } else {
            console.log('No new Telegram updates found');
          }
        } else {
          console.error('Error auto-fetching from Telegram:', response.statusText);
        }
      } catch (error) {
        console.error('Error during auto-fetch from Telegram:', error);
        // Continue with existing messages even if fetch fails
      }
    }
    
    // Polling control endpoint
    const pollingAction = searchParams.get('polling');
    if (pollingAction === 'start' || pollingAction === 'stop' || pollingAction === 'status') {
      console.log(`Polling control requested: ${pollingAction}`);
      
      if (pollingAction === 'start') {
        if (!isPollingActive) {
          startPolling();
          return NextResponse.json({ 
            success: true, 
            message: 'Polling started. Webhook (if exists) has been deleted.'
          });
        } else {
          return NextResponse.json({ 
            success: true, 
            message: 'Polling was already active.'
          });
        }
      } else if (pollingAction === 'stop') {
        if (isPollingActive) {
          stopPolling();
          return NextResponse.json({ 
            success: true, 
            message: 'Polling stopped.'
          });
        } else {
          return NextResponse.json({ 
            success: true, 
            message: 'Polling was not active.'
          });
        }
      } else if (pollingAction === 'status') {
        // Get webhook info for additional context
        const webhookInfo = await getWebhookInfo();
        
        return NextResponse.json({ 
          active: isPollingActive,
          lastUpdateId: lastUpdateId,
          pollingInterval: POLLING_INTERVAL,
          webhook: webhookInfo || { error: 'Failed to fetch webhook info' }
        });
      }
    }
    
    // Special debug mode for just checking recent Telegram messages
    if (searchParams.get('checkTelegram') === 'true') {
      console.log(`DEBUG: Checking recent Telegram messages (${pendingMessages.size} total sessions in storage)`);
      
      // Look for session IDs with recent or unretrieved messages
      const relevantSessions: Record<string, any> = {};
      pendingMessages.forEach((messages, key) => {
        // Check if it has unretrieved messages
        if (messages.some(m => !m.retrieved)) {
          relevantSessions[key] = {
            messageCount: messages.length,
            unretrieved: messages.filter(m => !m.retrieved).length,
            messages: messages.map(m => ({
              text: m.text.substring(0, 50) + (m.text.length > 50 ? '...' : ''),
              timestamp: m.timestamp,
              retrieved: m.retrieved
            }))
          };
        }
      });
      
      return NextResponse.json({ 
        telegram_check: true,
        matchingSessions: Object.keys(relevantSessions).length,
        sessions: relevantSessions
      });
    }
    
    // Special debug feature to add a test message to a session
    if (sessionId && testMessage) {
      console.log(`DEBUG: Manually adding test message to session ${sessionId}: ${testMessage}`);
      
      // Store the message directly to this exact session ID
      const messages = pendingMessages.get(sessionId) || [];
      messages.push({
        text: testMessage,
        timestamp: new Date(),
        retrieved: false
      });
      pendingMessages.set(sessionId, messages);
      
      // Also try standard variants to maximize chances
      storeMessage(sessionId, testMessage);
      
      return NextResponse.json({ 
        success: true, 
        message: `Test message added to session ${sessionId}`,
        sessionKeys: Array.from(pendingMessages.keys())
      });
    }

    // Special debug mode to list all pending messages
    if (debug === 'true') {
      const debugInfo: Record<string, any> = {};
      let totalMessages = 0;
      let totalUnretrieved = 0;
      
      // First analyze all keys and their patterns
      const sessionPatterns: Record<string, any> = {
        exact: {},
        withTimestamp: {},
        shortIds: {},
        other: {}
      };
      
      pendingMessages.forEach((messages, key) => {
        // Analyze key pattern
        if (key.includes('_')) {
          const parts = key.split('_');
          if (parts.length === 3 && !isNaN(Number(parts[1]))) {
            // This looks like a timestamp-based session ID (session_1234567890_abc123)
            sessionPatterns.withTimestamp[key] = parts[2];
          } else {
            // Some other format with underscores
            sessionPatterns.other[key] = true;
          }
        } else {
          // Probably a short ID
          sessionPatterns.shortIds[key] = true;
        }
        
        // Count messages
        totalMessages += messages.length;
        totalUnretrieved += messages.filter(m => !m.retrieved).length;
        
        // Add to debug info
        debugInfo[key] = {
          messageCount: messages.length,
          retrieved: messages.filter(m => m.retrieved).length,
          unretrieved: messages.filter(m => !m.retrieved).length,
          messages: messages.map(m => ({
            text: m.text,
            timestamp: m.timestamp,
            retrieved: m.retrieved
          }))
        };
      });
      
      // Return detailed info
      return NextResponse.json({ 
        totalSessions: pendingMessages.size,
        totalMessages,
        totalUnretrieved,
        sessionKeyPatterns: {
          withTimestamp: Object.keys(sessionPatterns.withTimestamp).length,
          shortIds: Object.keys(sessionPatterns.shortIds).length,
          other: Object.keys(sessionPatterns.other).length
        },
        sessionKeys: Array.from(pendingMessages.keys()),
        sessions: debugInfo
      });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log(`Looking for messages for session ID: ${sessionId}`);
    
    // Look for every possible way to match this session ID
    // 1. Direct match for the exact session ID
    // 2. Variants with/without v2 suffix
    // 3. Match by short ticket ID (the part after the last underscore)
    
    // Get standard variants (with/without v2)
    const standardVariants = getSessionIdVariants(sessionId);
    
    // Also try matching by the ticket ID portion (last part after underscore)
    const shortTicketId = sessionId.split('_').pop()?.replace(/v2$/, '') || sessionId;
    let matchingSessionIds: string[] = [];
    
    // Log all current keys to understand what we're working with
    const allKeys = Array.from(pendingMessages.keys());
    console.log(`All current session keys in storage: [${allKeys.join(', ')}]`);
    
    // Collect all possible matching session IDs
    pendingMessages.forEach((_, key) => {
      // Direct match or standard variant match
      if (standardVariants.includes(key)) {
        matchingSessionIds.push(key);
        console.log(`Found direct variant match: ${key}`);
      } 
      // Match by short ticket ID (check if the key ends with or contains the shortTicketId)
      else if (shortTicketId) {
        // More sophisticated matching for short IDs
        const keyLastPart = key.split('_').pop()?.replace(/v2$/, '') || '';
        
        if (keyLastPart === shortTicketId || key === shortTicketId || key === `${shortTicketId}v2`) {
          matchingSessionIds.push(key);
          console.log(`Found shortTicketId match: ${key} (from ${shortTicketId})`);
        }
        // Also check for the short ID embedded in the session ID
        else if (key.includes(shortTicketId)) {
          matchingSessionIds.push(key);
          console.log(`Found embedded shortTicketId match: ${key} (from ${shortTicketId})`);
        }
      }
    });
    
    // Log all the potential matches we found
    console.log(`Found ${matchingSessionIds.length} potential matching sessions:`, matchingSessionIds.join(', '));
    
    // Special case: If we're querying with what looks like a short ticket ID,
    // ensure we check all formats that might contain that ID
    const isShortIdQuery = !sessionId.includes('_') && sessionId.length < 15;
    if (isShortIdQuery) {
      console.log(`Query appears to be a short ticket ID: ${sessionId}. Will check all possible container formats.`);
      
      // Add special cases for short ticket ID queries
      allKeys.forEach(key => {
        if (!matchingSessionIds.includes(key)) {
          // Check if the key contains the short ID as part
          // but only if it's not just embedded in a random position
          const keyParts = key.split('_');
          const shortIdMatch = keyParts.find(part => 
            part.replace(/v2$/, '') === sessionId.replace(/v2$/, '')
          );
          
          if (shortIdMatch) {
            matchingSessionIds.push(key);
            console.log(`Found container format for short ID: ${key} (from ${sessionId})`);
          }
        }
      });
    }
    
    // Collect messages from all matching sessions
    let allMessages: Array<ChatMessage> = [];
    
    // First check for direct exact match
    if (pendingMessages.has(sessionId)) {
      const directMatches = pendingMessages.get(sessionId) || [];
      console.log(`Found ${directMatches.length} direct match messages for ${sessionId}`);
      allMessages = [...allMessages, ...directMatches];
    }
    
    // Then check standard variants
    for (const variant of standardVariants.filter(v => v !== sessionId)) {
      const messages = pendingMessages.get(variant) || [];
      console.log(`Found ${messages.length} messages for variant ${variant}`);
      allMessages = [...allMessages, ...messages];
    }
    
    // Finally check other potential matches by shortTicketId
    for (const matchId of matchingSessionIds.filter(id => !standardVariants.includes(id) && id !== sessionId)) {
      const messages = pendingMessages.get(matchId) || [];
      console.log(`Found ${messages.length} messages for related session ${matchId}`);
      allMessages = [...allMessages, ...messages];
    }
    
    // Remove duplicates (same text and similar timestamp within 1 second)
    const uniqueMessages: Array<ChatMessage> = [];
    allMessages.forEach(msg => {
      const isDuplicate = uniqueMessages.some(existingMsg => 
        existingMsg.text === msg.text && 
        Math.abs(existingMsg.timestamp.getTime() - msg.timestamp.getTime()) < 1000
      );
      
      if (!isDuplicate) {
        uniqueMessages.push(msg);
      }
    });
    
    // Sort messages by timestamp (oldest first)
    uniqueMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Filter messages based on parameters
    let newMessages: Array<ChatMessage>;
    
    if (showAllMessages) {
      // Return all messages regardless of retrieved status
      newMessages = uniqueMessages;
      console.log(`Returning ${newMessages.length} total messages (including already retrieved) for session ${sessionId}`);
    } else {
      // Return only unretrieved messages (default behavior)
      newMessages = uniqueMessages.filter(msg => !msg.retrieved);
      console.log(`Returning ${newMessages.length} unretrieved messages for session ${sessionId}`);
    }
    
    // If no messages found and this is a short ID query, log detailed debugging info
    if (newMessages.length === 0 && isShortIdQuery) {
      console.log(`No messages found for short ticket ID ${sessionId}. Here is detailed session info:`);
      allKeys.forEach(key => {
        const messages = pendingMessages.get(key) || [];
        if (messages.length > 0) {
          console.log(`Session ${key}: ${messages.length} messages, ${messages.filter(m => !m.retrieved).length} unretrieved`);
          console.log(`First message: ${messages[0].text.substring(0, 30)}...`);
        }
      });
    }
    
    // Mark all matching messages as retrieved
    // ONLY if dontMarkRetrieved is NOT set to true
    const allSessionIdsToUpdate = [sessionId, ...standardVariants, ...matchingSessionIds];
    
    if (!dontMarkRetrieved) {
      for (const id of allSessionIdsToUpdate) {
        if (pendingMessages.has(id)) {
          const messages = pendingMessages.get(id) || [];
          messages.forEach(msg => {
            // Only mark as retrieved if we're actually returning this message
            const matchingNewMsg = newMessages.some(newMsg => 
              newMsg.text === msg.text && 
              Math.abs(newMsg.timestamp.getTime() - msg.timestamp.getTime()) < 1000
            );
            
            if (matchingNewMsg) {
              msg.retrieved = true;
            }
          });
          pendingMessages.set(id, messages);
        }
      }
    } else {
      console.log(`Not marking messages as retrieved due to dontMarkRetrieved=true parameter`);
    }
    
    // Schedule cleanup of old messages after an hour
    if (newMessages.length > 0) {
      setTimeout(() => {
        for (const id of allSessionIdsToUpdate) {
          if (pendingMessages.has(id)) {
            const messages = pendingMessages.get(id) || [];
            const unretrievedMessages = messages.filter(msg => !msg.retrieved);
            if (unretrievedMessages.length === 0) {
              pendingMessages.delete(id);
              console.log(`Cleaned up empty session ${id}`);
            } else {
              pendingMessages.set(id, unretrievedMessages);
            }
          }
        }
      }, 60 * 60 * 1000); // 1 hour
    }

    // Return with optimized response structure
    return NextResponse.json({ 
      messages: newMessages.map(({ text, timestamp }) => ({ text, timestamp })),
      autoFetched: true, // Flag indicating we auto-fetched from Telegram
      lastUpdateId: lastUpdateId
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle LiveChat message from client to admin
 */
async function handleLiveChatMessage(body: any) {
  try {
    // Expecting both message and sessionId in the payload
    const { message, sessionId } = body;
    
    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Message and sessionId are required' }, { status: 400 });
    }
    
    // Create a shortened ticket ID from the sessionId - this is critical for consistent ID matching
    // Extract only the last part after the final underscore
    const shortTicketId = sessionId.split('_').pop() || sessionId;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Log the complete session ID and short ticket ID for debugging
    console.log(`LiveChat message received - full sessionId: ${sessionId}, shortTicketId: ${shortTicketId}`);
    
    // Format message for Telegram, including the FULL session ID in the callback data
    const telegramMessage = `🎫 New Live Chat Ticket #${shortTicketId}\n⏰ ${timestamp}\n\n${message}\n\n💬 Reply directly to this message to respond to the customer.`;
    
    // Send message to Telegram admin
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_ID,
        text: telegramMessage,
        reply_markup: {
          inline_keyboard: [
            [
              { 
                text: "✉️ Reply to this ticket", 
                callback_data: `ticket_${sessionId}`
              }
            ]
          ]
        }
      }),
    });
    
    // Log the session ID for debugging
    console.log(`Sent ticket to Telegram admin with complete sessionId: ${sessionId}`);
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error sending message to Telegram:', result);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, messageId: result.result?.message_id });
  } catch (error) {
    console.error('Error in livechat API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Delete the Telegram webhook
 */
async function deleteWebhook() {
  try {
    console.log('Deleting Telegram webhook to enable polling...');
    const response = await fetch(`${TELEGRAM_API}/deleteWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log('Webhook deleted successfully. Polling can now be used.');
      return true;
    } else {
      console.error('Failed to delete webhook:', result.description);
      return false;
    }
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return false;
  }
}

/**
 * Start the polling mechanism
 */
function startPolling() {
  if (isPollingActive) {
    console.log('Polling already active, not starting another instance');
    return;
  }
  
  console.log('Preparing to start Telegram polling mechanism...');
  
  // First delete any existing webhook
  deleteWebhook().then(success => {
    if (success) {
      isPollingActive = true;
      console.log('Starting Telegram polling mechanism');
      
      async function pollLoop() {
        try {
          lastUpdateId = await pollTelegramUpdates(lastUpdateId);
          
          if (isPollingActive) {
            setTimeout(pollLoop, POLLING_INTERVAL);
          }
        } catch (error) {
          console.error('Error in polling loop:', error);
          
          // Try to recover by continuing after a delay
          if (isPollingActive) {
            setTimeout(pollLoop, POLLING_INTERVAL * 2);
          }
        }
      }
      
      pollLoop();
    } else {
      console.error('Could not start polling because webhook deletion failed');
    }
  });
}

/**
 * Stop the polling mechanism
 */
function stopPolling() {
  console.log('Stopping Telegram polling');
  isPollingActive = false;
}

/**
 * Handle admin replies from Telegram polling
 */
async function handleTelegramAdminReply(message: any) {
  try {
    console.log('===============================================================');
    console.log(`Received admin reply via polling at ${new Date().toISOString()}`);
    console.log(`Admin ID from env: ${TELEGRAM_ADMIN_ID} (Type: ${typeof TELEGRAM_ADMIN_ID})`);
    console.log(`From ID in message: ${message.from?.id?.toString()} (Type: ${typeof message.from?.id})`);
    
    // Detailed logging similar to the original webhook handler
    const replyMsg = message.text;
    const originalText = message.reply_to_message.text || '';
    
    console.log("Admin replied to message:", {
      replyText: replyMsg,
      originalMessage: originalText,
      hasInlineKeyboard: !!message.reply_to_message.reply_markup,
      replyMarkup: JSON.stringify(message.reply_to_message.reply_markup)
    });
    
    // ====== SESSION ID EXTRACTION LOGIC ======
    // Use the same extraction logic as the original webhook handler
    
    // METHOD 1: Extract complete session ID from inline keyboard
    let sessionId = null;
    let extractionMethod = '';
    
    // Check if we have a reply markup with inline keyboard
    if (message.reply_to_message.reply_markup?.inline_keyboard) {
      try {
        console.log('Examining inline keyboard:', JSON.stringify(message.reply_to_message.reply_markup.inline_keyboard));
        
        // Loop through all buttons in all rows
        for (const row of message.reply_to_message.reply_markup.inline_keyboard) {
          for (const button of row) {
            console.log('Checking button callback data:', button.callback_data);
            
            // Extract from ticket_ or reply_ prefixed callback data
            if (button.callback_data?.startsWith('ticket_') || button.callback_data?.startsWith('reply_')) {
              sessionId = button.callback_data.replace(/^(ticket_|reply_)/, '');
              extractionMethod = 'inline_keyboard';
              console.log(`FOUND SESSION ID (from ${extractionMethod}): ${sessionId}`);
              break;
            }
          }
          if (sessionId) break;
        }
      } catch (error) {
        console.error("Error parsing inline keyboard:", error);
      }
    } else {
      console.log('No inline keyboard found in reply markup');
    }

    // METHOD 2: Extract from message text  
    // Only proceed if we don't have a session ID yet
    if (!sessionId) {
      console.log('Attempting to extract session ID from message text');
      
      // Try to find session ID in the original message text (embedded format)
      const embeddedSessionIdMatch = originalText.match(/Session ID: ([a-zA-Z0-9_]+)/i);
      if (embeddedSessionIdMatch) {
        sessionId = embeddedSessionIdMatch[1];
        extractionMethod = 'embedded_text';
        console.log(`FOUND SESSION ID (from ${extractionMethod}): ${sessionId}`);
      }
    }
    
    // METHOD 3: Extract short ticket ID from message text
    let shortTicketId = null;
    let shortTicketIdExtractionMethod = '';
    
    // Try multiple patterns to find the ticket ID in the message
    console.log('Trying to extract short ticket ID from text patterns');
    
    // Pattern 1: Match emoji + Live Chat Thread/Ticket format (most specific)
    const threadMatch = originalText.match(/(?:🎫|🎟️) (?:New )?Live Chat (?:Thread|Ticket) #([a-zA-Z0-9]+)/);
    if (threadMatch) {
      shortTicketId = threadMatch[1];
      shortTicketIdExtractionMethod = 'emoji_format';
      console.log(`FOUND TICKET ID (from ${shortTicketIdExtractionMethod}): ${shortTicketId}`);
    }
    
    // Pattern 2: Simple hashtag pattern (more generic)
    if (!shortTicketId) {
      const hashtagMatch = originalText.match(/#([a-zA-Z0-9]+)/);
      if (hashtagMatch) {
        shortTicketId = hashtagMatch[1];
        shortTicketIdExtractionMethod = 'hashtag';
        console.log(`FOUND TICKET ID (from ${shortTicketIdExtractionMethod}): ${shortTicketId}`);
      }
    }
    
    // Pattern 3: From entities (Telegram metadata)
    if (!shortTicketId && message.reply_to_message.entities) {
      console.log('Looking for ticket ID in message entities:', JSON.stringify(message.reply_to_message.entities));
      
      // Try to find a hashtag entity
      const hashtagEntity = message.reply_to_message.entities.find(
        (e: TelegramEntity) => e.type === 'hashtag'
      );
      
      if (hashtagEntity) {
        // Extract the text using the offset and length
        const start = hashtagEntity.offset;
        const end = start + hashtagEntity.length;
        // The extracted text will include the # symbol, so remove it
        const hashtagText = originalText.substring(start, end).replace('#', '');
        shortTicketId = hashtagText;
        shortTicketIdExtractionMethod = 'entity';
        console.log(`FOUND TICKET ID (from ${shortTicketIdExtractionMethod}): ${shortTicketId}`);
        
        // Verify the extracted ticket ID matches expected format (alphanumeric)
        if (!/^[a-zA-Z0-9]+$/.test(shortTicketId)) {
          console.log(`Extracted ticket ID "${shortTicketId}" doesn't match expected format, trying to clean it`);
          // Try to extract just the alphanumeric part
          const cleanedId = shortTicketId.match(/([a-zA-Z0-9]+)/);
          if (cleanedId && cleanedId[1]) {
            shortTicketId = cleanedId[1];
            console.log(`Cleaned ticket ID: ${shortTicketId}`);
          }
        }
      } else {
        // If no hashtag entity found, look at all entities that might contain our ticket
        console.log('No hashtag entity found, checking all entities');
        for (const entity of message.reply_to_message.entities || []) {
          const start = entity.offset;
          const end = start + entity.length;
          const entityText = originalText.substring(start, end);
          console.log(`Examining entity: type=${entity.type}, text="${entityText}"`);
          
          // Look for ticket ID pattern within this entity text
          const ticketMatch = entityText.match(/#([a-zA-Z0-9]+)/);
          if (ticketMatch) {
            shortTicketId = ticketMatch[1];
            shortTicketIdExtractionMethod = 'entity_content';
            console.log(`FOUND TICKET ID in entity content: ${shortTicketId}`);
            break;
          }
        }
      }
    }
    
    // Pattern 4: Check for "Ticket #ABC123" format without emoji
    if (!shortTicketId) {
      const plainTicketMatch = originalText.match(/Ticket #([a-zA-Z0-9]+)/i);
      if (plainTicketMatch) {
        shortTicketId = plainTicketMatch[1];
        shortTicketIdExtractionMethod = 'plain_ticket';
        console.log(`FOUND TICKET ID (from ${shortTicketIdExtractionMethod}): ${shortTicketId}`);
      }
    }
    
    // ====== MESSAGE STORAGE LOGIC ======
    
    // Prepare fallback variants if we need them
    let fallbackVariants: string[] = [];
    
    // CASE 1: We have a full session ID from inline keyboard - best case
    if (sessionId) {
      console.log(`Using direct session ID: ${sessionId}`);
      
      // Store directly with exact match
      console.log(`Storing reply for EXACT session ${sessionId}: ${replyMsg}`);
      
      // First directly store the message with the exact session ID
      // CRITICAL CHANGE: Set retrieved to false explicitly for admin replies
      const exactSessionMessages = pendingMessages.get(sessionId) || [];
      exactSessionMessages.push({
        text: replyMsg,
        timestamp: new Date(),
        retrieved: false // Changed from true to false
      });
      pendingMessages.set(sessionId, exactSessionMessages);
      
      // Also use storeMessage function but with a modified approach
      // to ensure retrieved is set to false for all variants
      directStoreMessage(sessionId, replyMsg);
      
      // If we have a short ticket ID, show it in the confirmation
      const displayId = shortTicketId || sessionId.split('_').pop()?.substring(0, 8) || sessionId;
      
      // Confirm to admin that reply was sent
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_ADMIN_ID,
          text: `✅ Reply sent to ticket #${displayId} (from exact session ID)`,
          reply_to_message_id: message.message_id
        }),
      });
      
      console.log(`Successfully processed reply to session ${sessionId} (ticket #${displayId})`);
      return;
    } 
    // CASE 2: We have a short ticket ID - lookup matching sessions or create fallback
    else if (shortTicketId) {
      console.log(`No session ID found, using short ticket ID: ${shortTicketId}`);
      
      // Look across all stored sessions to find ones matching this shortTicketId
      let matchingSessionIds: string[] = [];
      
      // Search through all current session keys to find any that match
      console.log(`Searching for sessions with ticket ID ${shortTicketId} among keys:`, Array.from(pendingMessages.keys()));
      
      pendingMessages.forEach((_, key) => {
        // Parse the key to check for a match
        const parts = key.split('_');
        const lastPart = parts[parts.length - 1]?.replace(/v2$/, '');
        
        // Check if the key ends with or contains our shortTicketId
        if (lastPart === shortTicketId || key.includes(shortTicketId)) {
          matchingSessionIds.push(key);
          console.log(`Found matching session with ID: ${key}`);
        }
      });
      
      if (matchingSessionIds.length > 0) {
        console.log(`Found ${matchingSessionIds.length} matching sessions for ticket ID ${shortTicketId}: ${matchingSessionIds.join(', ')}`);
        
        // Store the reply for all matching sessions with retrieved: false
        for (const matchingId of matchingSessionIds) {
          console.log(`Storing reply for matching session ${matchingId}: ${replyMsg}`);
          directStoreMessage(matchingId, replyMsg);
        }
        
        // Confirm to admin 
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_ADMIN_ID,
            text: `✅ Reply sent to ticket #${shortTicketId} (matched ${matchingSessionIds.length} sessions)`,
            reply_to_message_id: message.message_id
          }),
        });
        
        return;
      }
      // No matching session found - store with multiple variants
      else {
        console.log(`No matching sessions found for ticket ${shortTicketId}, creating fallback variants`);
        
        // Store with multiple potential formats to maximize chance of delivery
        fallbackVariants = [
          `session_${Date.now()}_${shortTicketId}`,
          shortTicketId,
          `${shortTicketId}v2`,
          `session_${Date.now()}_${shortTicketId}v2`,
          `session_${shortTicketId}`,
          `session_${shortTicketId}v2`
        ];
        
        // Log all fallback variants we're trying
        console.log(`Using ${fallbackVariants.length} fallback variants for ${shortTicketId}: ${fallbackVariants.join(', ')}`);
        
        for (const variant of fallbackVariants) {
          console.log(`Storing reply for fallback variant ${variant}: ${replyMsg}`);
          directStoreMessage(variant, replyMsg);
        }
        
        // Inform admin
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_ADMIN_ID,
            text: `✅ Reply sent to ticket #${shortTicketId} (using fallback methods)`,
            reply_to_message_id: message.message_id
          }),
        });
        
        return;
      }
    }
    
    // Try to match regular Telegram user ID as final fallback
    const match = originalText.match(/\(ID:\s*(\d+)\)/);
    if (match && match[1]) {
      const userId = match[1];
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: userId,
          text: replyMsg,
        }),
      });
      
      return;
    }
    
    // No session ID found at all
    console.error("Couldn't determine session ID or ticket ID from the message");
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_ID,
        text: `⚠️ Failed to process reply: Couldn't determine session ID or ticket ID`,
        reply_to_message_id: message.message_id
      }),
    });
    
  } catch (error) {
    console.error('Error handling admin reply:', error);
  }
}

/**
 * Helper function to store a message with retrieved=false directly
 * This is a modified version of storeMessage that ensures admin replies
 * are always marked as unretrieved so they show up in the client
 */
function directStoreMessage(sessionId: string, text: string) {
  console.log(`Direct storing message for session ${sessionId}: ${text}`);
  
  if (!sessionId) {
    console.error('No session ID provided, cannot store message');
    return;
  }
  
  // Generate multiple variants of the session ID to maximize chances of retrieval
  let variants: string[] = [];
  
  // Start with the exact session ID
  variants.push(sessionId);
  
  // Add normalized variants with/without v2 suffix
  const standardVariants = getSessionIdVariants(sessionId);
  for (const variant of standardVariants) {
    if (!variants.includes(variant)) {
      variants.push(variant);
    }
  }
  
  // Extract the short ID part (if present)
  if (sessionId.includes('_')) {
    const shortId = sessionId.split('_').pop()?.replace(/v2$/, '') || '';
    if (shortId && !variants.includes(shortId)) {
      variants.push(shortId);
      
      // Also add v2 variant for the short ID
      if (!variants.includes(`${shortId}v2`)) {
        variants.push(`${shortId}v2`);
      }
    }
  } 
  // If sessionId is already a short ID (no underscores), ensure v2 variant exists
  else if (!sessionId.endsWith('v2')) {
    const shortId = sessionId.replace(/v2$/, '');
    if (!variants.includes(`${shortId}v2`)) {
      variants.push(`${shortId}v2`);
    }
    
    // Also add session prefix variants with current timestamp
    const timestamp = Date.now();
    if (!variants.includes(`session_${timestamp}_${shortId}`)) {
      variants.push(`session_${timestamp}_${shortId}`);
    }
    if (!variants.includes(`session_${timestamp}_${shortId}v2`)) {
      variants.push(`session_${timestamp}_${shortId}v2`);
    }
  }
  
  console.log(`Using ${variants.length} session ID variants: ${variants.join(', ')}`);
  
  // Create the message to store with retrieved: false
  const newMessage: ChatMessage = {
    text,
    timestamp: new Date(),
    retrieved: false // ALWAYS false for admin replies
  };
  
  // Store for all variants
  for (const variant of variants) {
    const messages = pendingMessages.get(variant) || [];
    
    // Check for duplicates to avoid storing the same message twice
    const isDuplicate = messages.some(m => 
      m.text === text && 
      Math.abs(m.timestamp.getTime() - newMessage.timestamp.getTime()) < 1000
    );
    
    if (!isDuplicate) {
      console.log(`Adding message to variant ${variant}`);
      messages.push({...newMessage}); // Clone to avoid reference issues
      pendingMessages.set(variant, messages);
    } else {
      console.log(`Skipping duplicate message for variant ${variant}`);
    }
  }
  
  // Return the number of variants used
  return variants.length;
}

/**
 * Handle Telegram callback queries from polling
 */
async function handleTelegramCallbackQuery(callbackQuery: any) {
  try {
    if (!callbackQuery.data) {
      return;
    }
    
    console.log(`Processing callback query: ${callbackQuery.data}`);
    
    // Handle ticket_ callback (create thread)
    if (callbackQuery.data.startsWith('ticket_')) {
      const sessionId = callbackQuery.data.replace('ticket_', '');
      const shortTicketId = getShortTicketId(sessionId);
      
      console.log(`Admin clicked reply button for ticket #${shortTicketId}, sessionId: ${sessionId}`);
      
      // Create a new chat thread
      const messageText = `🎟️ Live Chat Thread #${shortTicketId}\n━━━━━━━━━━━━━━━\n👤 Customer initiated chat from website\n⏰ ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\n✏️ Reply to THIS message to send a response to the customer.`;
      
      // Send message to create the thread
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_ADMIN_ID,
          text: messageText,
          reply_markup: {
            inline_keyboard: [
              [
                { 
                  text: "✉️ Send reply", 
                  callback_data: `reply_${sessionId}`
                }
              ],
              [
                {
                  text: "✅ Mark as resolved",
                  callback_data: `resolve_${sessionId}`
                },
                {
                  text: "📝 View history",
                  callback_data: `history_${sessionId}`
                }
              ]
            ]
          }
        }),
      });
    } 
    // Handle reply_ callback (create reply context)
    else if (callbackQuery.data.startsWith('reply_')) {
      const sessionId = callbackQuery.data.replace('reply_', '');
      const shortTicketId = getShortTicketId(sessionId);
      
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_ADMIN_ID,
          text: `To reply to ticket #${shortTicketId}, simply hit reply on this message.`,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Mark as resolved",
                  callback_data: `resolve_${sessionId}`
                }
              ]
            ]
          }
        }),
      });
    }
    // Handle "resolve" and "history" callbacks
    else if (callbackQuery.data.startsWith('resolve_') || callbackQuery.data.startsWith('history_')) {
      const isResolve = callbackQuery.data.startsWith('resolve_');
      const sessionId = callbackQuery.data.replace(isResolve ? 'resolve_' : 'history_', '');
      const shortTicketId = getShortTicketId(sessionId);
      
      if (isResolve) {
        // Mark the ticket as resolved
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_ADMIN_ID,
            text: `✅ Ticket #${shortTicketId} has been marked as resolved.`,
            reply_to_message_id: callbackQuery.message.message_id
          }),
        });
      } else {
        // Show ticket history
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_ADMIN_ID,
            text: `📝 Chat history for ticket #${shortTicketId}:\n\nThis would show the full conversation history in a production environment.`,
            reply_to_message_id: callbackQuery.message.message_id
          }),
        });
      }
    }
    
    // Answer callback query (clear loading state of the button)
    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQuery.id,
        text: "Action processed"
      }),
    });
  } catch (error) {
    console.error('Error handling callback query:', error);
  }
}

/**
 * Poll for Telegram updates using getUpdates API
 */
async function pollTelegramUpdates(offset = 0) {
  try {
    console.log(`Polling Telegram updates with offset: ${offset}`);
    const response = await fetch(`${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=30`);
    
    if (!response.ok) {
      console.error('Error polling Telegram API:', response.statusText);
      
      // If we get a 409 conflict error, it means a webhook is still active
      if (response.status === 409) {
        console.log('Webhook conflict detected, attempting to delete webhook...');
        const webhookDeleted = await deleteWebhook();
        if (webhookDeleted) {
          console.log('Webhook deleted, retrying poll...');
          return offset; // Retry with same offset
        }
      }
      
      return offset;
    }
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error('Telegram API returned error:', data.description);
      
      // Check for webhook conflict in the error description
      if (data.error_code === 409 || (data.description && data.description.includes('webhook'))) {
        console.log('Webhook conflict detected in API response, attempting to delete webhook...');
        const webhookDeleted = await deleteWebhook();
        if (webhookDeleted) {
          console.log('Webhook deleted, retrying poll...');
          return offset; // Retry with same offset
        }
      }
      
      return offset;
    }
    
    let newOffset = offset;
    
    // Process each update
    for (const update of data.result) {
      console.log('Processing update:', JSON.stringify(update));
      newOffset = update.update_id + 1;
      
      // Handle callback queries (button clicks)
      if (update.callback_query) {
        await handleTelegramCallbackQuery(update.callback_query);
      }
      
      // Handle admin replies
      if (update.message?.reply_to_message && update.message?.text) {
        // Check if this is from the admin
        if (update.message.from.id.toString() === TELEGRAM_ADMIN_ID) {
          await handleTelegramAdminReply(update.message);
        }
      }
    }
    
    return newOffset;
  } catch (error) {
    console.error('Error during polling:', error);
    return offset;
  }
}

// Initialize polling when the server starts
// Only in production or when explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_TELEGRAM_POLLING === 'true') {
  // Use setTimeout to start polling after the server has initialized
  setTimeout(async () => {
    console.log('======= TELEGRAM BOT INITIALIZATION =======');
    
    // Check if we should perform a webhook clean-up even if not polling
    if (process.env.TELEGRAM_DELETE_WEBHOOK === 'true') {
      console.log('🧹 Webhook deletion requested via environment variable');
      const deleted = await deleteWebhook();
      console.log(`🧹 Webhook deletion ${deleted ? 'successful' : 'failed'}`);
    }
    
    // Check for debugging mode where we just get webhook info
    if (process.env.TELEGRAM_DEBUG === 'true') {
      console.log('🔍 Debug mode enabled, checking webhook status...');
      const webhookInfo = await getWebhookInfo();
      console.log('🔍 Current webhook status:', JSON.stringify(webhookInfo, null, 2));
    }
    
    // Start polling if enabled
    if (process.env.TELEGRAM_POLLING === 'false') {
      console.log('⏸️ Polling disabled via environment variable');
    } else {
      console.log('▶️ Starting Telegram polling...');
      startPolling();
    }
    
    console.log('=========================================');
  }, 1000);
}

// Keep original handleTelegramWebhook function for backward compatibility
// but modify it to not be exported or used directly
async function handleTelegramWebhook(body: any) {
  console.log('WARNING: handleTelegramWebhook called directly. Using polling instead of webhooks now.');
  
  try {
    // Handle callback queries
    if (body.callback_query) {
      await handleTelegramCallbackQuery(body.callback_query);
    }
    
    // Handle admin replies
    if (body.message?.reply_to_message && body.message?.text && 
        body.message.from.id.toString() === TELEGRAM_ADMIN_ID) {
      await handleTelegramAdminReply(body.message);
    }
    
    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error('Error in handleTelegramWebhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Check current webhook status
 */
async function getWebhookInfo() {
  try {
    console.log('Checking current webhook status...');
    const response = await fetch(`${TELEGRAM_API}/getWebhookInfo`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      console.error('Error fetching webhook info:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error('Telegram API error:', data.description);
      return null;
    }
    
    return data.result;
  } catch (error) {
    console.error('Error checking webhook status:', error);
    return null;
  }
} 