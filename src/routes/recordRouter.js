const { throwError } = require('../utils');
// const { request } = require('http');    
const express = require('express');
const recordController = require('../controllers/recordController');

const recordRouter = express.Router(); //라우터를 시작합니다.

const createRecord = recordController.createRecord;
const readRecord = recordController.readRecord;
const testController = recordController.testController;

recordRouter.post('/createRecord', recordController.createRecord);
recordRouter.get('/readRecord/:id', recordController.readRecord);
recordRouter.get('/:id', recordController.testController);

module.exports = recordRouter;