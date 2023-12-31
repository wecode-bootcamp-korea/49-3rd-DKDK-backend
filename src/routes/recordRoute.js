const recordController = require("../controllers/recordController");
const { asyncWrap } = require("../middlewares/errorHandler");
const { validateToken } = require("../middlewares/auth");
const express = require("express");

const recordRoute = express.Router(); //라우터를 시작합니다.

const createRecord = recordController.createRecord;
const readRecord = recordController.readRecord;

recordRoute.post("/", validateToken, asyncWrap(recordController.createRecord));
recordRoute.get("/", validateToken, asyncWrap(recordController.readRecord));

module.exports = { recordRoute };
