"use server";
import { databases } from "@/lib/appwrite.config";
import { ID, Query, Models } from "node-appwrite";
import { sendMail } from "./mail.action";

const {
  DATABASE_ID,
  VISITORS_ID,
  TRANSACTIONS_ID,
  EMAILS_ID,
  REFERRALS_ID,
  STATS_COLLECTION_ID,
  REJECTED_AMOUNT_ID,
  TRANSACTION_HISTORY_ID,
} = process.env;

interface VisitorData {
  timestamp: string;
  pathname: string;
  userAgent: string;
  referrer: string;
  screenResolution: string;
  deviceType: string;
  deviceLanguage: string;
  visitorId: string;
}

interface PresetTransaction {
  address: string;
  amount: number;
  displayOrder: number; // To maintain consistent order
}

interface EmailSubmission {
  walletAddress: string;
  email: string;
  timestamp: string;
}

interface ReferralData {
  referrerWallet: string;
  referredWallet: string;
  referredEmail: string;
  timestamp: string;
}

export async function createVisitorInfo(data: VisitorData) {
  try {
    await databases.createDocument(
      DATABASE_ID as string,
      VISITORS_ID as string,
      ID.unique(),
      {
        timestamp: data.timestamp,
        pathname: data.pathname,
        userAgent: data.userAgent,
        referrer: data.referrer,
        screenResolution: data.screenResolution,
        deviceType: data.deviceType,
        deviceLanguage: data.deviceLanguage,
        visitorId: data.visitorId,
      }
    );

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(
        `Failed to create Visitor document in the DB: ${error.message}`
      );
      return { success: false, msg: error.message };
    }
    console.log(`Failed to create Visitor document in the DB: Unknown error`);
    return { success: false, msg: "Unknown error occurred" };
  }
}

export async function getPresetTransactions() {
  try {
    const data = await databases.listDocuments(
      DATABASE_ID as string,
      TRANSACTIONS_ID as string,
      [
        Query.orderAsc("displayOrder"), // Get them in specific order
      ]
    );

    if (data.documents.length === 0) {
      return { success: false, msg: "transactions not Found" };
    }

    const transactions: PresetTransaction[] = data.documents.map((doc) => ({
      address: doc.address || "",
      amount: doc.amount || 0,
      displayOrder: doc.displayOrder || 0,
    }));

    return { success: true, data: transactions };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Failed to fetch Transactions in the db: ${error.message}`);
      return { success: false, msg: error.message };
    }
    console.log(`Failed to fetch Transactions in the db: Unknown error`);
    return { success: false, msg: "Unknown error occurred" };
  }
}

// function to submit email
export async function submitEmail(data: EmailSubmission) {
  try {
    const existingEmail = await databases.listDocuments(
      DATABASE_ID as string,
      EMAILS_ID as string,
      [Query.equal("walletAddress", data.walletAddress)]
    );

    if (existingEmail.documents.length > 0) {
      return {
        success: false,
        msg: "Email already registered for this wallet",
      };
    }

    await databases.createDocument(
      DATABASE_ID as string,
      EMAILS_ID as string,
      ID.unique(),
      {
        walletAddress: data.walletAddress,
        email: data.email,
        timestamp: data.timestamp,
      }
    );

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Failed to submit email: ${error.message}`);
      return { success: false, msg: error.message };
    }
    return { success: false, msg: "Unknown error occurred" };
  }
}

// function to check if email exists
export async function checkEmailExists(walletAddress: string) {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID as string,
      EMAILS_ID as string,
      [Query.equal("walletAddress", walletAddress)]
    );

    return { success: true, exists: result.documents.length > 0 };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, msg: error.message };
    }
    return { success: false, msg: "Unknown error occurred" };
  }
}

export async function trackReferral(data: ReferralData) {
  try {
    console.log("Starting referral tracking for:", data);

    // Check if referral already exists
    const existingReferral = await databases.listDocuments(
      DATABASE_ID as string,
      REFERRALS_ID as string,
      [Query.equal("referredWallet", data.referredWallet)]
    );

    if (existingReferral.documents.length > 0) {
      console.log("Referral already exists");
      return {
        success: false,
        msg: "User already referred",
      };
    }

    // Count existing referrals for the referrer
    const referrerReferrals = await databases.listDocuments(
      DATABASE_ID as string,
      REFERRALS_ID as string,
      [Query.equal("referrerWallet", data.referrerWallet)]
    );

    const referralCount = referrerReferrals.documents.length;

    // Verify referrer has email and get their email
    const referrerEmail = await databases.listDocuments(
      DATABASE_ID as string,
      EMAILS_ID as string,
      [Query.equal("walletAddress", data.referrerWallet)]
    );

    if (referrerEmail.documents.length === 0) {
      console.log("Referrer email not found");
      return {
        success: false,
        msg: "Referrer has not registered email",
      };
    }

    // Get referred user's email
    const referredEmail = await databases.listDocuments(
      DATABASE_ID as string,
      EMAILS_ID as string,
      [Query.equal("walletAddress", data.referredWallet)]
    );

    if (referredEmail.documents.length === 0) {
      console.log("Referred user email not found");
      return {
        success: false,
        msg: "Referred user email not found",
      };
    }

    const referrerEmailAddress = referrerEmail.documents[0].email;
    const referredEmailAddress = referredEmail.documents[0].email;

    console.log("Emails found:", {
      referrer: referrerEmailAddress,
      referred: referredEmailAddress,
    });

    // Create referral record
    try {
      await databases.createDocument(
        DATABASE_ID as string,
        REFERRALS_ID as string,
        ID.unique(),
        data
      );
      console.log("Referral record created successfully");
    } catch (error) {
      console.error("Failed to create referral record:", error);
      throw new Error("Failed to create referral record");
    }

    console.log("Sending notification emails");

    // Prepare email tasks array
    const emailTasks = [
      // Admin notification
      sendMail({
        to: "smartcalls3web@gmail.com",
        subject: "New Referral Notification",
        body: `
          <p>Hey Admin,</p>
          <p>A new user ${referredEmailAddress} just registered using ${referrerEmailAddress}'s referral link.</p>
          <p>Best regards,<br>
          The Web3SmartCalls System</p>
        `,
      }).catch((error) => {
        console.error("Failed to send admin notification:", error);
        throw error;
      }),

      // Referrer notification
      sendMail({
        to: referrerEmailAddress,
        subject: "Welcome to Web3SmartCalls!",
        body: `
          <p>Hi,</p>
          <p>Great news! A new user just registered on Web3SmartCalls using your referral link.</p>
          <p>Keep sharing your link to earn even more rewards and grow the Web3SmartCalls community!</p>
          <p>Reminder: Only users who add their email and deploy the smart contract are eligible to count toward your rewards.</p>
          <p>Thank you for being an active part of our journey.</p>
          <p>Best regards,<br>
          The Web3SmartCalls Team</p>
        `,
      }).catch((error) => {
        console.error("Failed to send referrer notification:", error);
        throw error;
      }),
    ];

    // Add warning email if referral count exceeds 3
    if (referralCount >= 5) {
      emailTasks.push(
        sendMail({
          to: referrerEmailAddress,
          subject: "Referral Activity Flagged as Malicious",
          body: `
            <p>Hi,</p>
            <p>After a review of your referrals, the Web3SmartCalls. team has flagged your referral activity as malicious due to one or more of the following reasons:</p>
            <ul>
              <li>Use of auto-clickers</li>
              <li>Bot-generated referrals</li>
              <li>Malicious referral methods</li>
              <li>Self-referrals</li>
            </ul>
            <p>As a result, your address has been flagged. Any further involvement in malicious referral activities will result in your address being banned from receiving benefits on the platform.</p>
            <p>We encourage you to refer genuine users who can contribute to the growth of the Web3 community. Together, we can build a better future in Web3 technology.</p>
            <p>Best regards,<br>
            The Web3SmartCalls Team</p>
          `,
        }).catch((error) => {
          console.error("Failed to send warning notification:", error);
          throw error;
        })
      );
    }

    // Send all emails in parallel
    try {
      await Promise.all(emailTasks);
      console.log("All notification emails sent successfully");
    } catch (error) {
      console.error("Error sending notification emails:", error);
      throw new Error("Failed to send notification emails");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in trackReferral:", error);
    if (error instanceof Error) {
      return {
        success: false,
        msg: `Error processing referral: ${error.message}`,
      };
    }
    return {
      success: false,
      msg: "Unknown error occurred while processing referral",
    };
  }
}

interface UserStats {
  activeUsers: number;
  totalRegistered: number;
  timestamp: string;
  lastRegistrationUpdate: string;
}

interface StatsResponse {
  success: boolean;
  data?: UserStats;
  msg?: string;
}

interface StatsDocument extends Models.Document {
  activeUsers: number;
  totalRegistered: number;
  timestamp: string;
  lastRegistrationUpdate: string;
}

const MIN_ACTIVE_USERS = 30000;

function generateNewStats(previousStats: UserStats): UserStats {
  const now = new Date();
  const lastRegUpdate = new Date(previousStats.lastRegistrationUpdate);
  const timeSinceLastReg = now.getTime() - lastRegUpdate.getTime();

  // Registration updates (8-15 minutes)
  const regUpdateInterval =
    (Math.floor(Math.random() * (15 - 8 + 1)) + 8) * 60 * 1000;
  const shouldUpdateRegistrations = timeSinceLastReg >= regUpdateInterval;

  let newTotalRegistered = previousStats.totalRegistered;
  let newLastRegUpdate = previousStats.lastRegistrationUpdate;

  // Update total registered users every 8-15 minutes
  if (shouldUpdateRegistrations) {
    const increment = Math.floor(Math.random() * (11 - 7 + 1)) + 7;
    newTotalRegistered += increment;
    newLastRegUpdate = now.toISOString();
  }

  // Calculate active users change
  const hour = now.getHours();
  let timeModifier = 1;

  // Time-based modifiers
  if ((hour >= 9 && hour <= 11) || (hour >= 19 && hour <= 21)) {
    timeModifier = 1.2; // Peak hours: 20% increase
  } else if (hour >= 2 && hour <= 5) {
    timeModifier = 0.8; // Low hours: 20% decrease
  }

  // Generate base change (200-500)
  const baseChange = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
  // Apply time modifier
  const modifiedChange = Math.round(baseChange * timeModifier);
  // 50% chance to decrease
  const finalChange = Math.random() < 0.5 ? -modifiedChange : modifiedChange;

  // Calculate new active users
  let newActiveUsers = previousStats.activeUsers + finalChange;

  // Ensure active users stay within bounds
  const maxActiveUsers = Math.min(
    newTotalRegistered,
    Math.round(newTotalRegistered * 0.9) // Max 90% of total registered
  );

  newActiveUsers = Math.min(
    maxActiveUsers,
    Math.max(newActiveUsers, MIN_ACTIVE_USERS)
  );

  return {
    activeUsers: Math.round(newActiveUsers),
    totalRegistered: newTotalRegistered,
    timestamp: now.toISOString(),
    lastRegistrationUpdate: newLastRegUpdate,
  };
}

export async function getCurrentStats(): Promise<StatsResponse> {
  if (!DATABASE_ID || !STATS_COLLECTION_ID) {
    return { success: false, msg: "Database configuration is missing" };
  }

  try {
    const data = await databases.listDocuments<StatsDocument>(
      DATABASE_ID,
      STATS_COLLECTION_ID,
      [Query.orderDesc("timestamp"), Query.limit(1)]
    );

    const now = new Date();
    // Update every 10-15 seconds
    const updateInterval = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
    const shouldUpdate = now.getSeconds() % updateInterval === 0;

    if (data.documents.length === 0) {
      const initialStats: UserStats = {
        activeUsers: MIN_ACTIVE_USERS,
        totalRegistered: 200000,
        timestamp: now.toISOString(),
        lastRegistrationUpdate: now.toISOString(),
      };

      await databases.createDocument(
        DATABASE_ID,
        STATS_COLLECTION_ID,
        ID.unique(),
        initialStats
      );

      return { success: true, data: initialStats };
    }

    const latestDoc = data.documents[0];
    const lastUpdate = new Date(latestDoc.timestamp);
    const timeDiff = now.getTime() - lastUpdate.getTime();

    if (shouldUpdate && timeDiff >= 10000) {
      // Minimum 10 seconds between updates
      const currentStats: UserStats = {
        activeUsers: latestDoc.activeUsers,
        totalRegistered: latestDoc.totalRegistered,
        timestamp: latestDoc.timestamp,
        lastRegistrationUpdate: latestDoc.lastRegistrationUpdate,
      };

      const newStats = generateNewStats(currentStats);

      await databases.createDocument(
        DATABASE_ID,
        STATS_COLLECTION_ID,
        ID.unique(),
        newStats
      );

      // Cleanup old documents
      const oldDocs = await databases.listDocuments<StatsDocument>(
        DATABASE_ID,
        STATS_COLLECTION_ID,
        [Query.orderDesc("timestamp"), Query.limit(30)]
      );

      if (oldDocs.documents.length > 20) {
        const docsToDelete = oldDocs.documents.slice(20);
        for (const doc of docsToDelete) {
          await databases.deleteDocument(
            DATABASE_ID,
            STATS_COLLECTION_ID,
            doc.$id
          );
        }
      }

      return { success: true, data: newStats };
    }

    return {
      success: true,
      data: {
        activeUsers: latestDoc.activeUsers,
        totalRegistered: latestDoc.totalRegistered,
        timestamp: latestDoc.timestamp,
        lastRegistrationUpdate: latestDoc.lastRegistrationUpdate,
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Failed to update stats: ${error.message}`);
      return { success: false, msg: error.message };
    }
    console.error("Failed to update stats: Unknown error");
    return { success: false, msg: "Unknown error occurred" };
  }
}

// Rejected Amount
export async function trackRejectedAmount(
  walletAddress: string,
  amount: number
) {
  try {
    // First check if wallet exists
    const existingRecords = await databases.listDocuments(
      DATABASE_ID as string,
      REJECTED_AMOUNT_ID as string,
      [Query.equal("wallet_address", walletAddress)]
    );

    if (existingRecords.documents.length > 0) {
      // Update existing record
      const doc = existingRecords.documents[0];
      await databases.updateDocument(
        DATABASE_ID as string,
        REJECTED_AMOUNT_ID as string,
        doc.$id,
        {
          amount: doc.amount + amount,
          last_updated: new Date().toISOString(),
        }
      );
    } else {
      // Create new record
      await databases.createDocument(
        DATABASE_ID as string,
        REJECTED_AMOUNT_ID as string,
        ID.unique(),
        {
          wallet_address: walletAddress,
          amount: amount,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        }
      );
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Failed to track rejected amount: ${error.message}`);
      return { success: false, msg: error.message };
    }
    return { success: false, msg: "Unknown error occurred" };
  }
}

export async function getRejectedAmount(walletAddress: string) {
  try {
    const records = await databases.listDocuments(
      DATABASE_ID as string,
      REJECTED_AMOUNT_ID as string,
      [Query.equal("wallet_address", walletAddress)]
    );

    if (records.documents.length > 0) {
      return { success: true, amount: records.documents[0].amount };
    }
    return { success: true, amount: 0 };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Failed to get rejected amount: ${error.message}`);
      return { success: false, msg: error.message };
    }
    return { success: false, msg: "Unknown error occurred" };
  }
}


// Add new function to track all transaction attempts
export async function trackTransactionAttempt(
  walletAddress: string,
  amount: number,
  confirmationCount: number,
  status: "rejected" | "completed"
) {
  try {
    await databases.createDocument(
      DATABASE_ID as string,
      TRANSACTION_HISTORY_ID as string,
      ID.unique(),
      {
        wallet_address: walletAddress,
        amount: amount,
        confirmation_count: confirmationCount,
        status: status,
        created_at: new Date().toISOString(),
      }
    );

    // Only track rejected amount if there was at least one confirmation
    if (status === "rejected" && confirmationCount > 0) {
      await trackRejectedAmount(walletAddress, amount);
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Failed to track transaction attempt: ${error.message}`);
      return { success: false, msg: error.message };
    }
    return { success: false, msg: "Unknown error occurred" };
  }
}

// Update getTransactionHistory to fetch from new collection
export async function getTransactionHistory(walletAddress: string) {
  try {
    const records = await databases.listDocuments(
      DATABASE_ID as string,
      TRANSACTION_HISTORY_ID as string,
      [
        Query.equal("wallet_address", walletAddress),
        Query.orderDesc("created_at"),
      ]
    );

    return { success: true, transactions: records.documents };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, msg: error.message };
    }
    return { success: false, msg: "Unknown error occurred" };
  }
}
