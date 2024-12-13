const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/cathAsyncErrorsMiddleware");
const sendToken = require("../utils/jwtToken");
const sendAdminToken = require("../utils/adminjwtToken");
// const sendMail = require("../utils/mailer");
const dotenv = require("dotenv");
const db = require("../database");
const bcrypt = require('bcrypt');


exports.signup = catchAsyncErrors(async (request, response, next) => {
  const { username, email, password, confirmPassword } = request.body;
  
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match.", 400));
  }
  try {
    const existingUser = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE email = ? OR username = ?",
        [email, username],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });
    if (existingUser) {
      if (existingUser.email === email) {
      return response.status(400).json({ error: "A user with this email already exists." });
      }
      if (existingUser.username === username) {
        return response.status(400).json({ error: "A user with this username already exists." });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    db.beginTransaction(async (transactionErr) => {
      if (transactionErr) {
        console.error("Error starting transaction:", transactionErr);
        return next(new ErrorHandler("Error during signup!", 500));
      }
      try {
        const sql = `
          INSERT INTO users (username, email, password ) VALUES (?, ?, ?)`;
        const values = [username, email, hashedPassword];
        const insertResult = await new Promise((resolve, reject) => {
          db.query(sql, values, (err, result) => {
            if (err) {
              return reject(err);
            }
            // sendMail(email,username,password)
            resolve(result);
          });
        });

        if (insertResult.affectedRows > 0) {
          db.commit((commitErr) => {
            if (commitErr) {
              console.error("Error committing transaction:", commitErr);
              return next(new ErrorHandler("Error during signup!", 500));
            }
            return response.status(201).json({ message: `User Created with Email : ${email} ` });
          });
        } else {
          throw new ErrorHandler("User could not be created", 400);
        }
      } catch (err) {
        db.rollback(() => {
          console.error("Error during signup:", err);
          return next(
            err instanceof ErrorHandler
              ? err
              : new ErrorHandler("Error during signup!", 500)
          );
        });
      }
    });
  } catch (err) {
    return next(new ErrorHandler("Error checking existing email!", 500));
  }
});
exports.adminsignin = catchAsyncErrors(async (request, response, next) => {
  const { email, password } = request.body;

  const sql = `SELECT * FROM users WHERE email = ? AND role = 'admin';`; // No need to include password in the query
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error("Error during login:", err);
      return next(new ErrorHandler("Error during login!", 400));
    }

    if (result.length > 0) {
      const admin = result[0];

      // Compare provided password with stored hashed password
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        return response
          .status(401)
          .json({ message: "Invalid credentials. Please try again." });
      }

      // Update last login time
      const updateLastLoginSql = `UPDATE users SET login_at = NOW() WHERE id = ?`;
      db.query(updateLastLoginSql, [admin.id], (updateErr) => {
        if (updateErr) {
          console.error("Error updating last login:", updateErr);
          return next(new ErrorHandler("Error updating last login!", 500));
        }

        // Generate and send token to admin
        sendAdminToken(admin, 200, response);
      });
    } else {
      return response
        .status(404)
        .json({ message: "Admin not found with provided credentials" });
    }
  });
});
exports.signin = catchAsyncErrors(async (request, response, next) => {
  const { email, password } = request.body;
  const sql = `SELECT * FROM users WHERE email = ? AND role = 'user';`; // No need to include password in the query
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error("Error during login:", err);
      return next(new ErrorHandler("Error during login!", 400));
    }
    if (result.length > 0) {
      const auth = result[0];
      const passwordMatch = await bcrypt.compare(password, auth.password);
      if (!passwordMatch) {
        return response
          .status(401)
          .json({ message: "Invalid credentials. Please try again." });
      }
      const updateLastLoginSql = `UPDATE users SET login_at = NOW() WHERE id = ?`;
      db.query(updateLastLoginSql, [auth.id], (updateErr) => {
        if (updateErr) {
          console.error("Error updating last login:", updateErr);
          return next(new ErrorHandler("Error updating last login!", 500));
        }
        sendToken(auth, 200, response);
      });
    } else {
      return response
        .status(404)
        .json({ message: "User not found with provided credentials" });
    }
  });
});
exports.signout = catchAsyncErrors(async (request, response, next) => {
  console.log("logout");
  response.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  response.status(200).json({
    success: true,
    message: "Logout successfully !",
  });
});
exports.PasswordChange = catchAsyncErrors(async (request, response, next) => {
  const { email, currentpassword, newpassword } = request.body;
  const sql = `SELECT * FROM users WHERE email=? AND password=?;`;
  db.query(sql, [email, currentpassword], (err, result) => {
    if (err) {
      console.error("Error during login:", err);
      return next(new ErrorHandler("Error during login !", 500));
    }
    if (result.length > 0) {
      const sql2 = `update users set password='${newpassword}' WHERE email='${email}' AND password='${currentpassword}';`;
      db.query(sql2, (err, result) => {
        if (err) {
          console.error("Error during password change:", err);
          return next(new ErrorHandler("Error during password change !", 500));
        } else {
          return response
            .status(400)
            .json({ message: "Password change succesfully" });
        }
      });
    } else {
      return response.status(404).json({ message: "password does'nt match" });
    }
  });
});
