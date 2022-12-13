const ynab = (startingYearOverride) => {
  const startingYear = getStartingYear(startingYearOverride);
  const config = { startingYear };
  if (document.querySelectorAll('div[role="dialog"] button').length) {
    config.transactions = "STATEMENT";
  } else {
    config.transactions = "RECENT";
  }
  console.log(`scraping ${config.transactions} transaction data`);
  const buttons = getAllTransactionButtons(config);
  const transactionData = getDataFromButtons(buttons, config);
  console.log("transaction data:", transactionData);
  copyFileData(transactionData);
  console.log("success: csv formatted transaction data copied to clipboard");
};

const getStartingYear = (override) => {
  if (override && typeof override !== "number") {
    throw new Error("Starting year parameter should be a number.");
  }
  return override || new Date().getFullYear();
};

const getAllTransactionButtons = (config) => {
  const nodeList =
    config.transactions === "RECENT"
      ? document.querySelectorAll("#activity-panel button")
      : document.querySelectorAll('div[role="dialog"] button');
  const nodeArray = Array.from(nodeList).reverse(); // the DOM is in reverse chronological order
  return nodeArray.filter((n) => n.innerText.includes("$"));
};

const getDataFromButtons = (buttons, config) => {
  let currentYear = config.startingYear;
  let startedInJan = false;
  return buttons.map((button, i) => {
    let date;
    let payee;
    let amount;

    // this helps not create transactions for random buttons
    if (!button.innerText.includes("$")) {
      return;
    }

    button.innerText.split("\n").forEach((text) => {
      // ignore 2% or 3% text
      if (text.includes("%")) {
        return;
      }

      if (text.includes("$")) {
        amount = formatAmountString(text);
        return;
      }

      if (Object.keys(monthMap).some((month) => text.includes(month))) {
        const unformattedDate = text.split("∙")[0].trim();

        // this is hacky code that should automatically increment the
        // current year if a transaction range wraps over a new year
        if (i === 0 && unformattedDate.includes("Jan")) {
          startedInJan = true;
        } else if (!startedInJan && unformattedDate.includes("Jan")) {
          currentYear = config.startingYear + 1;
        }

        date = formatDateString(unformattedDate, currentYear);
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
  });
};

const formatDateString = (string, year) => {
  const [textMonth, date] = string.split(" ");
  return `${monthMap[textMonth]}/${date}/${year}`;
};

const formatAmountString = (amount) => {
  if (amount[0] === "-") {
    return `+ ${amount.slice(1)}`;
  } else {
    return `- ${amount}`;
  }
};

const formatTransactionData = (transactionData) => {
  return `"${transactionData.date}","${transactionData.payee}","","${transactionData.amount}"`;
};

const copyFileData = (transactionData) => {
  // prettier-ignore
  copy(`"Date","Payee","Memo","Amount"\n"","","",""\n"Datetime","From","Note","Amount (total)"\n"","","",""\n${transactionData.map(formatTransactionData).join("\n")}\n"","","",""\n`);
};

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
  Dec: 12,
};

window.ynab = ynab;

console.log("ynab scraper registered");
