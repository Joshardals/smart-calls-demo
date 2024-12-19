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

// Define the shape of the document as it comes from Appwrite
interface StatsDocument extends Models.Document {
  activeUsers: number;
  totalRegistered: number;
  timestamp: string;
  lastRegistrationUpdate: string;
}

const MIN_ACTIVE_RATIO = 0.25;
const MAX_ACTIVE_RATIO = 0.45;

function generateNewStats(previousStats: UserStats): UserStats {
  const now = new Date();
  const lastRegUpdate = new Date(previousStats.lastRegistrationUpdate);
  const timeSinceLastReg = now.getTime() - lastRegUpdate.getTime();
  const shouldUpdateRegistrations = timeSinceLastReg >= 8 * 60 * 1000;

  let newTotalRegistered = previousStats.totalRegistered;
  let newLastRegUpdate = previousStats.lastRegistrationUpdate;

  // Only increment if enough time has passed
  if (shouldUpdateRegistrations && Math.random() < 0.3) {
    const increment = Math.floor(Math.random() * 3) + 1;
    newTotalRegistered += increment;
    newLastRegUpdate = now.toISOString();
  }

  // Calculate active users based on time of day
  const hour = now.getHours();
  let timeModifier = 1;

  // Peak hours: 9-11 AM and 7-9 PM
  if ((hour >= 9 && hour <= 11) || (hour >= 19 && hour <= 21)) {
    timeModifier = 1.2;
  }
  // Low activity hours: 2-5 AM
  else if (hour >= 2 && hour <= 5) {
    timeModifier = 0.7;
  }

  // Calculate base active users with some randomness
  const targetRatio =
    MIN_ACTIVE_RATIO + Math.random() * (MAX_ACTIVE_RATIO - MIN_ACTIVE_RATIO);
  const baseActiveUsers = Math.round(newTotalRegistered * targetRatio);

  // Apply time modifier and add small random variation
  const variation = Math.random() * 0.1 - 0.05; // ±5% variation
  const newActiveUsers = Math.round(
    baseActiveUsers * timeModifier * (1 + variation)
  );

  return {
    activeUsers: newActiveUsers,
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
    // Get the latest stats document
    const data = await databases.listDocuments<StatsDocument>(
      DATABASE_ID,
      STATS_COLLECTION_ID,
      [Query.orderDesc("timestamp"), Query.limit(1)]
    );

    const now = new Date();
    const currentMinute = now.getMinutes();

    // Only update at specific intervals (every 4 minutes)
    const shouldUpdate = currentMinute % 4 === 0 && now.getSeconds() < 10;

    // If no documents exist, create initial stats
    if (data.documents.length === 0) {
      const initialStats: UserStats = {
        activeUsers: 80000,
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

    // Only update if enough time has passed and it's the right time
    if (shouldUpdate && timeDiff >= 230000) {
      // Double-check that no other client has updated in the meantime
      const latestCheck = await databases.listDocuments<StatsDocument>(
        DATABASE_ID,
        STATS_COLLECTION_ID,
        [Query.orderDesc("timestamp"), Query.limit(1)]
      );

      // If another client has updated, return their data
      if (latestCheck.documents[0].$id !== latestDoc.$id) {
        return {
          success: true,
          data: {
            activeUsers: latestCheck.documents[0].activeUsers,
            totalRegistered: latestCheck.documents[0].totalRegistered,
            timestamp: latestCheck.documents[0].timestamp,
            lastRegistrationUpdate:
              latestCheck.documents[0].lastRegistrationUpdate,
          },
        };
      }

      const currentStats: UserStats = {
        activeUsers: latestDoc.activeUsers,
        totalRegistered: latestDoc.totalRegistered,
        timestamp: latestDoc.timestamp,
        lastRegistrationUpdate: latestDoc.lastRegistrationUpdate,
      };

      const newStats = generateNewStats(currentStats);

      // Create new document
      await databases.createDocument(
        DATABASE_ID,
        STATS_COLLECTION_ID,
        ID.unique(),
        newStats
      );

      // Clean up old documents
      const oldDocs = await databases.listDocuments<StatsDocument>(
        DATABASE_ID,
        STATS_COLLECTION_ID,
        [Query.orderDesc("timestamp"), Query.limit(100)]
      );

      if (oldDocs.documents.length > 50) {
        // Reduced from 100 to 50
        const docsToDelete = oldDocs.documents.slice(50);
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

    // Return existing stats if no update is needed
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
