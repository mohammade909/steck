const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/cathAsyncErrorsMiddleware");
const dotenv = require("dotenv");
const db = require("../database");



exports.updateresult = catchAsyncErrors(async (request, response, next) => {
  const { result, amount, bet, action, multiplier } = request.body;

  try {
    db.beginTransaction(async (transactionErr) => {
      if (transactionErr) {
        console.error("Error starting transaction:", transactionErr);
        return next(new ErrorHandler("Error during transaction!", 500));
      }

      try {
        // Insert into leaderboard
        const sqlInsert = `
            INSERT INTO leaderboard (user_id, result, amount, bet, action, multiplier)
            VALUES (?, ?, ?, ?, ?, ?)`;
        const insertValues = [1, result, amount, bet, action, multiplier];

        await new Promise((resolve, reject) => {
          db.query(sqlInsert, insertValues, (err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
        });

        // Update user's balance
        const updateUserSql =
          result === "Win"
            ? `UPDATE users SET amount = amount + ? WHERE id = ?`
            : `UPDATE users SET amount = amount - ? WHERE id = ?`;
        const updateValue = result === "Win" ? amount : bet;

        await new Promise((resolve, reject) => {
          db.query(updateUserSql, [updateValue, 1], (err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
        });

        // Commit transaction
        db.commit((commitErr) => {
          if (commitErr) {
            console.error("Error committing transaction:", commitErr);
            return next(new ErrorHandler("Error committing transaction!", 500));
          }
          return response
            .status(201)
            .json({ message: `Transaction completed successfully.` });
        });
      } catch (err) {
        db.rollback(() => {
          console.error("Error during transaction:", err);
          return next(
            err instanceof ErrorHandler
              ? err
              : new ErrorHandler("Error during transaction!", 500)
          );
        });
      }
    });
  } catch (err) {
    return next(new ErrorHandler("Error updating result!", 500));
  }
});

exports.addstrategy = catchAsyncErrors(async (request, response, next) => {
  const { name, betCount, onProfitInc, onLossDec, stopProfit, stopLoss } = request.body;

  try {
    // Check if the strategy name already exists
    const sqlCheck = `SELECT * FROM strategy WHERE name = ?`;
    const nameExists = await new Promise((resolve, reject) => {
      db.query(sqlCheck, [name], (err, result) => {
        if (err) {
          console.error("Error checking strategy name:", err);
          return reject(err);
        }
        console.log(result)
        resolve(result.length > 0);
      });
    });

    if (nameExists) {
      return response.status(400).json({ message: "Name already exists." });
    }

    // Insert the new strategy
    const sqlInsert = `
      INSERT INTO strategy (name, betCount, onProfitInc, onLossDec, stopProfit, stopLoss)
      VALUES (?, ?, ?, ?, ?, ?)`;
    const insertValues = [
      name,
      betCount,
      onProfitInc,
      onLossDec,
      stopProfit,
      stopLoss,
    ];

    await new Promise((resolve, reject) => {
      db.query(sqlInsert, insertValues, (err, result) => {
        if (err) {
          console.error("Error inserting strategy:", err);
          return reject(err);
        }
        resolve(result);
      });
    });

    return response
      .status(201)
      .json({ message: `Strategy "${name}" added successfully.` });
  } catch (err) {
    console.error("Error adding strategy:", err);
    return next(new ErrorHandler("Error adding strategy!", 500));
  }
});


exports.getstrategy = catchAsyncErrors(async (request, response, next) => {
  let sql = `SELECT * FROM strategy`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching leaderboard:", err);
      return next(new ErrorHandler("Error fetching leaderboard!", 500));
    }
    if (result.length > 0) {
      return response.status(200).json({ strategy: result });
    } else {
      return response.status(404).json({ strategy: [] });
    }
  });
});

exports.getLeaderBoard = catchAsyncErrors(async (request, response, next) => {
  let sql = `SELECT * FROM leaderboard ORDER BY id DESC LIMIT 50`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching leaderboard:", err);
      return next(new ErrorHandler("Error fetching leaderboard!", 500));
    }
    if (result.length > 0) {
      return response.status(200).json({ leaderboard: result });
    } else {
      return response.status(404).json({ leaderboard: [] });
    }
  });
});
