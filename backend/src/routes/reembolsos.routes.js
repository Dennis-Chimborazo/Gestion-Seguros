const { Router } = require("express");
const { DataBase } = require("../database.js");
const jwt = require('jsonwebtoken');

const router = Router();
const db = new DataBase();
const database = db.getConexion();


module.exports = router;
