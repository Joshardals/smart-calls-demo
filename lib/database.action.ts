"use server";
import { databases } from "@/lib/appwrite.config";
import { ID, Query } from "node-appwrite";

const { DATABASE_ID, VISITORS_ID, TRANSACTIONS_ID } = process.env;

interface VisitorData {
  timestamp: string;
  pathname: string;
  userAgent: string;
  referrer: string;
  screenResolution: string;
  deviceType: string;
  language: string;
  visitorId: string;
}

interface PresetTransaction {
  address: string;
  amount: number;
  displayOrder: number; // To maintain consistent order
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
        language: data.language,
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
