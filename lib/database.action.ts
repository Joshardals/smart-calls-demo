"use server";
import { databases } from "@/lib/appwrite.config";
import { ID, Query } from "node-appwrite";
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
}

// Keep track of trend direction and strength
let trendMomentum = 0; // Range: -1 to 1
const MOMENTUM_CHANGE_CHANCE = 0.1; // 10% chance to shift trend direction

function generateNewStats(baseActive: number, baseTotal: number): UserStats {
  // Possibly change trend direction
  if (Math.random() < MOMENTUM_CHANGE_CHANCE) {
    trendMomentum += Math.random() * 0.4 - 0.2; // Shift by -0.2 to +0.2
    trendMomentum = Math.max(-1, Math.min(1, trendMomentum)); // Clamp between -1 and 1
  }

  // Base fluctuation (-3% to +3%)
  const baseFluctuation = Math.random() * 0.06 - 0.03;

  // Apply momentum to fluctuation
  const totalFluctuation = baseFluctuation + trendMomentum * 0.02;

  // Calculate new active users
  let newActiveUsers = Math.round(baseActive * (1 + totalFluctuation));

  // Time-based modifier (simulating daily/weekly patterns)
  const hour = new Date().getHours();
  let timeModifier = 1;

  // Peak hours: 9-11 AM and 7-9 PM (assuming UTC)
  if ((hour >= 9 && hour <= 11) || (hour >= 19 && hour <= 21)) {
    timeModifier = 1.2;
  }
  // Low hours: 2-5 AM
  else if (hour >= 2 && hour <= 5) {
    timeModifier = 0.7;
  }

  newActiveUsers = Math.round(newActiveUsers * timeModifier);

  // Ensure reasonable bounds (40% below to 80% above base)
  const minActiveUsers = Math.floor(baseActive * 0.6);
  const maxActiveUsers = Math.ceil(baseActive * 1.8);
  newActiveUsers = Math.max(
    minActiveUsers,
    Math.min(maxActiveUsers, newActiveUsers)
  );

  // Total registered users grows more slowly and steadily
  // During down trends, growth slows but never stops
  const growthRate =
    0.0001 + Math.random() * 0.0003 * (trendMomentum > 0 ? 1.2 : 0.8);
  const growth = Math.ceil(baseTotal * growthRate);
  const newTotalRegistered = baseTotal + growth;

  return {
    activeUsers: newActiveUsers,
    totalRegistered: newTotalRegistered,
    timestamp: new Date().toISOString(),
  };
}

export async function getCurrentStats() {
  try {
    // Get the most recent stats
    const data = await databases.listDocuments(
      DATABASE_ID as string,
      STATS_COLLECTION_ID as string,
      [Query.orderDesc("timestamp"), Query.limit(1)]
    );

    const now = new Date();
    const currentMinute = now.getMinutes();

    // Only update if we're at a 4-minute interval (0, 4, 8, 12, etc.)
    const shouldUpdate = currentMinute % 4 === 0 && now.getSeconds() < 10;

    if (data.documents.length === 0) {
      // Initialize first stats document
      const initialStats = {
        activeUsers: 6000,
        totalRegistered: 40000,
        timestamp: now.toISOString(),
      };

      await databases.createDocument(
        DATABASE_ID as string,
        STATS_COLLECTION_ID as string,
        ID.unique(),
        initialStats
      );

      return { success: true, data: initialStats };
    }

    const lastUpdate = new Date(data.documents[0].timestamp);
    const timeDiff = now.getTime() - lastUpdate.getTime();

    // Only generate new stats if it's time for an update
    if (shouldUpdate && timeDiff >= 230000) {
      // 3.8 minutes (buffer for network delays)
      const newStats = generateNewStats(
        data.documents[0].activeUsers,
        data.documents[0].totalRegistered
      );

      await databases.createDocument(
        DATABASE_ID as string,
        STATS_COLLECTION_ID as string,
        ID.unique(),
        newStats
      );

      // Clean up old documents (keep last 100)
      const oldDocs = await databases.listDocuments(
        DATABASE_ID as string,
        STATS_COLLECTION_ID as string,
        [Query.orderDesc("timestamp"), Query.limit(100)]
      );

      if (oldDocs.documents.length >= 100) {
        const docsToDelete = oldDocs.documents.slice(100);
        for (const doc of docsToDelete) {
          await databases.deleteDocument(
            DATABASE_ID as string,
            STATS_COLLECTION_ID as string,
            doc.$id
          );
        }
      }

      return { success: true, data: newStats };
    }

    // Return existing stats if it's not time to update
    return { success: true, data: data.documents[0] };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Failed to update stats: ${error.message}`);
      return { success: false, msg: error.message };
    }
    console.error("Failed to update stats: Unknown error");
    return { success: false, msg: "Unknown error occurred" };
  }
}
