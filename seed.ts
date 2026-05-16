import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const USER_ID = "252398148833416@lid";

const categories = ["food", "transport", "utilities", "entertainment", "shopping"];
const descriptions = {
  food: ["Lunch at McDonald's", "Dinner at local warung", "Groceries at Superindo", "Coffee at Starbucks", "Snacks"],
  transport: ["Gojek to office", "Grab to mall", "Gasoline", "Train ticket", "Parking fee"],
  utilities: ["Electricity token", "Internet bill", "Water bill", "Phone credit"],
  entertainment: ["Netflix subscription", "Spotify premium", "Movie ticket", "Game top-up"],
  shopping: ["New shoes", "T-shirt", "Skincare", "Book"],
};

const incomeSources = ["Monthly Salary", "Freelance Project", "Cashback", "Bonus"];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDummyData(count: number) {
  const data = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const isIncome = Math.random() > 0.8; // 20% chance of income
    
    // Generate a random date within the last 14 days
    const date = new Date(now.getTime() - getRandomInt(0, 14 * 24 * 60 * 60 * 1000));

    if (isIncome) {
      data.push({
        user_id: USER_ID,
        type: "income",
        category: "salary/bonus",
        description: incomeSources[getRandomInt(0, incomeSources.length - 1)],
        amount: getRandomInt(500, 5000) * 1000, // Rp 500k to Rp 5M
        created_at: date.toISOString(),
      });
    } else {
      const category = categories[getRandomInt(0, categories.length - 1)];
      const descList = descriptions[category as keyof typeof descriptions];
      const description = descList[getRandomInt(0, descList.length - 1)];

      data.push({
        user_id: USER_ID,
        type: "expense",
        category: category,
        description: description,
        amount: getRandomInt(10, 300) * 1000, // Rp 10k to Rp 300k
        created_at: date.toISOString(),
      });
    }
  }

  // Sort by date descending
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

async function seed() {
  console.log("Generating dummy data...");
  const dummyTransactions = generateDummyData(35); // Generate 35 realistic transactions

  console.log("Inserting into Supabase...");
  const { data, error } = await supabase.from("transactions").insert(dummyTransactions);

  if (error) {
    console.error("Error inserting data:", error);
  } else {
    console.log(`✅ Successfully seeded 35 transactions for user ${USER_ID}.`);
    console.log("Refresh your Next.js dashboard to see the showcase data!");
  }
}

seed();
