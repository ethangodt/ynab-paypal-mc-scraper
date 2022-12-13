const date = "Dec 12";
const payee = "CH-ST. LOUIS, MO #197";
const amount = "44.17";
const innerText = "MACYS GALLERIA STL\nDec 4 ∙ Purchase\n$49.82\n2%";

const monthMap = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dev: 12,
};

const dotChar = "∙";

const ynab = (startingYearOverride) => {
  console.log("scraping recent activity transaction data");
  const startingYear = getStartingYear(startingYearOverride);
  const buttons = getAllTransactionButtons();
  const transactionData = Array.from(buttons).map(getDataFromButton);
  console.log(transactionData);
};

const getStartingYear = (override) => {
  if (override && typeof override !== "number") {
    throw new Error("Starting year parameter should be a number.");
  }
  return override || new Date().getFullYear();
};

// get all relevant buttons
const getAllTransactionButtons = () => {
  return document.querySelectorAll("#activity-panel button");
};

// get transaction data from button
const getDataFromButton = (button) => {
  let date;
  let payee;
  let amount;
  button.innerText.split("\n").forEach((text) => {
    // ignore 2% or 3% text
    if (text.includes("%")) {
      return;
    }

    if (text.includes("$")) {
      amount = text;
      return;
    }

    // the date text includes the weird dot separator "∙"
    if (text.includes("∙")) {
      const untrimmedDate = text.split("∙")[0];
      date = untrimmedDate.trim();
      return;
    }

    // anything else should be treated as the payee
    payee = text;
  });
  return {
    date,
    payee,
    amount,
  };
};

const copyFileData = (transactionData) => {
  copy(`"Date","Payee","Memo","Amount"
  "","","",""
  "Datetime","From","Note","Amount (total)"
  "","","",""
  "2022-12-02T06:58:00","Ethan Godt","Fees n shiiii","- $20.00"
  "2022-12-02T18:37:42","Molly McGraw","Spotify - December","+ $3.75"
  "2022-12-05T04:50:43","Lee H","Sold the extra stools","+ $135.00"
  "2022-12-07T03:51:11","Lee H","Spot dec","+ $3.75"
  "2022-12-08T06:05:34","Ethan Godt","🍹🍹🍺🍟","- $40.00"
  "","","",""
  `);
};

window.ynab = ynab;

console.log("ynab scraper registered");
