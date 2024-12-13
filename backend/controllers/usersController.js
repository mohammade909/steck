const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/cathAsyncErrorsMiddleware");
const dotenv = require("dotenv");
const db = require("../database");
const asyncHandler = require("express-async-handler");



exports.getListOfUsers = catchAsyncErrors(async (request, response, next) => {
  let sql = `SELECT * FROM users`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching users:", err);
      return next(new ErrorHandler("Error fetching users!", 500));
    }
    if (result.length > 0) {
      return response.status(200).json({ allusers: result });
    } else {
      return response.status(404).json({ allusers: [] });
    }
  });
});

exports.getUsersById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  console.log(id)
  let sql = `SELECT * FROM users where id=${id}`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error during retrieval:", err);
      return next(new ErrorHandler("Error during retrieval", 500));
    }
    res.status(200).json({ success: true, singleuser: result[0] });
  });
});
exports.getUsersByEmail = asyncHandler(async (req, res, next) => {
  const  userby = req.body.userby;
  let sql = `SELECT * FROM users where email='${userby}'`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error during retrieval:", err);
      return next(new ErrorHandler("Error during retrieval", 500));
    }
    res.status(200).json({ success: true, emailuser: result[0] });
  });
});
exports.updateUser = asyncHandler(async (req, res, next) => {
  const updatedFields = req.body;
  const { id } = req.params;
  const updateFieldsString = Object.keys(updatedFields)
    .map((key) => `${key}="${updatedFields[key]}"`)
    .join(", ");

  const sql = `UPDATE users SET ${updateFieldsString} WHERE id = ${Number(
    id
  )};`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error during update:", err);
      next(new ErrorHandler("Error during update", 500));
    }

    if (result?.affectedRows > 0) {
      res.status(200).json({ success: true, message: "Update successful" });
    } else {
      next(new ErrorHandler("User not found or no changes applied", 404));
    }
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new ErrorHandler("user number (ID) is required", 400));
  }

  const sql = `DELETE FROM users WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error during deletion:", err);
      return next(new ErrorHandler("Error during deletion", 500));
    }

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: "Deletion successful" });
    } else {
      return next(
        new ErrorHandler("USer not found or no changes applied", 404)
      );
    }
  });
});

exports.updateamount = asyncHandler(async (req, res, next) => {
  const {amount,action} = req.body;
  console.log(req.body)
  let sql;
  if(action=="plus"){
  sql = `UPDATE users SET amount = amount + ? WHERE id = 1 ;`;
  }
  else{
  sql = `UPDATE users SET amount = amount - ? WHERE id = 1 ;`;
  }
  db.query(sql,[amount], (err, result) => {
    if (err) {
      console.error("Error during update:", err);
      next(new ErrorHandler("Error during update", 500));
    }
    if (result?.affectedRows > 0) {
      res.status(200).json({ success: true, message: "amount add successfully" });
    } else {
      next(new ErrorHandler("User not found or no changes applied", 404));
    }
  });
});
