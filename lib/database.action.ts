"use server";
import { databases } from "@/lib/appwrite.config";
import { ID, Query } from "node-appwrite";
import { sendMail } from "./mail.action";

const { DATABASE_ID, VISITORS_ID, TRANSACTIONS_ID, EMAILS_ID, REFERRALS_ID } =
  process.env;

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
