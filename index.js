require("dotenv").config();
const express = require("express");
const app = express();
const port = 3026;
const cors = require("cors");
const { Data } = require("./Data");
const { tours } = require("./Data");
app.use(express.json());
const jwt = require("jsonwebtoken");

const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

app.get("/gets", (req, res) => {
    res.send("Welcome");
});

app.post("/Login", (req, res) => {
    const { email, password } = req.body;
    const user = { email: email, password: password };
    console.log("login")

    const accessToken = jwt.sign({ email }, "kjsdksdlkslds12ksjdksd", {
        expiresIn: "1m",
    });
    const refreshToken = jwt.sign({ email }, "kjsdksdlkslds12ksjdksd", {
        expiresIn: "1h",
    });
    res.json({
        status: "success",
        accessToken: accessToken,
        refreshToken: refreshToken,
    });
});

app.post("/refresh", (req, res) => {
    console.log("hai refresh")
    let refreshToken = req.body["x-access-token"];
    console.log("refesh token", refreshToken)
    let decode = jwt.decode(refreshToken);
    console.log("ha ecode", decode)
    let currentEmail = decode.email;
    let Email = Data.find((main) => main.email === decode.email);
    console.log("emails====>", Email);
    console.log(currentEmail);
    if (currentEmail) {
        const token = jwt.sign({ currentEmail }, "kjsdksdlkslds12ksjdksd", {
            expiresIn: "1m",
        });
        return res.status(200).json({
            status: "success",
            data: {
                token,
                refreshToken,
            },
        });
    }
});
const checkAuth = (req, res, next) => {
    console.log("req", req);
    console.log("i ma in check auth");
    const { TokenExpiredError } = jwt;
    const catchError = (err, res) => {
        if (err instanceof TokenExpiredError) {
            return res
                .status(401)
                .send({ message: "Unauthorized! Access Token was expired!" });
        }
        return res.sendStatus(401).send({ message: "Unauthorized!" });
    };
    const token = req.headers["x-access-token"];
    console.log("token", token);
    if (!token) {
        res.status(400).json({
            errors: [{ msg: "No Token Found" }],
        });
    }
    jwt.verify(token, "kjsdksdlkslds12ksjdksd", (err, decoded) => {
        console.log("haieer", err);
        if (err) {
            return catchError(err, res);
        }
        next();
    });
};

app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;
    let data = Data.find((main) => main.username === username);

    if (data) {
        res.status(401).json({
            status: "error",
            message: "already exists",
        });
    }
    Data.push({
        username,
        email,
        password,
    });
    console.log(Data);

    res.status(200).json({
        status: "Successfully Registered",
    });
});

app.get("/Home", checkAuth, (req, res) => {
    console.log("welcome api");
    res.status(200).json({
        status: "success",
        data: {
            Data: tours,
        },
    });
});

app.listen(port, () => {
    console.log("hiG");
});
