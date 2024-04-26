require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const utils = require("./server-util.js");
const { response } = require("express");
const multer = require("multer");
const { exec } = require("child_process");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Output/");
  },
  filename: function (req, file, cb) {
    if(file.fieldname === "file") {
      cb(null, "port_template_creation");

    } else if(file.fieldname === "port-file") {
      cb(null, "ping_template_creation");
    } else if(file.fieldname === "web-file") {
      cb(null, "web_template_creation");
    }
  },
});

const upload = multer({ storage: storage });

let refreshTokens = [];

app.use(express.static(path.join(__dirname, "static")));
app.use(cookieParser());
app.use(session({ secret: process.env.SESSION_SECRET_KEY, cookie: { maxAge: 600000 }}))

app.use(express.json());

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post("/zabbixAPI", async (req, res) => {
  const {method, ...body} = req.body;
  console.log(" ----------------> ",{
    auth: req.session.auth,
    id: req.session.id
  })
  try {
    const resp = await utils.fetchZabbixAPI({
      jsonrpc: "2.0",
      method: method || "host.get",
      params: {
        ...body,
      },
      auth: req.session.auth,
      id: req.session.id,
    })
    const response = await resp.json();
    res.json({...response });

  } catch (error) {
    console.error(error)
    res.statusCode(500)
    res.json({ status: false});
  }

});

app.post("/login", async (req, res) => {
  // Authenticate User
  const username = req.body.username;
  const password = req.body.password;
  try {
    const authRes = await utils.fetchZabbixAPI({
      jsonrpc: "2.0",
      method: "user.login",
      params: {
        user: username,
        password: password,
      },
      id: 1,
      auth: null,
    });
    const { result, id } = await authRes.json();
    console.log(result, id);
    if(!result){
      throw new Error("Unautorized");
    }
    req.session.auth = result
    req.session.id = id
    const user = { name: username, password: password };
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    res.cookie("accessToken", accessToken, {
      maxAge: 900000,
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 900000,
      httpOnly: true,
    });
    refreshTokens.push(refreshToken);
    res.json({ status: true, message: "Login Successfully" });
  } catch (error) {
    console.error(error)
    res.status(500);
    res.json({ status: false, message: "Login UnSuccessful" });
  }
});

app.get("/login", (req, res) => {
  try {
    res.sendFile(path.join(__dirname + "/login.html"));
  } catch (e) {
    console.error(new Error(e));
  }
});
app.get("/main", authenticateToken, (req, res) => {
  try {
    res.sendFile(path.join(__dirname + "/main.html"));
  } catch (e) {
    console.error(new Error(e));
  }
});
app.get("/detail", authenticateToken, (req, res) => {
  try {
    res.sendFile(path.join(__dirname + "/detail.html"));
  } catch (e) {
    console.error(new Error(e));
  }
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}

function authenticateToken(req, res, next) {
  const token = req.cookies.accessToken;
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

  app.post("/save-file", upload.single("file"), (req, res) => {
	  conevertWindowsToLinux("port_template_creation",res,()=>{
		   console.log("return sucessfully");
	  exec("Output/port_monitoring_creation.sh", (error, stdout, stderr) => {
     if (error) {
       console.error(`error: ${error.message}`);
       res.sendStatus(500);
       return;
     }
     if (stderr) {
       console.error(`stderr: ${stderr}`);
       res.sendStatus(500);
       return;
     }
     console.log("script executed");
     res.sendStatus(200);
   });
	  })
});

app.post("/save-port-file", upload.single("port-file"), (req, res) => {
	conevertWindowsToLinux("ping_template_creation",res,()=>{
  exec("Output/Ping_bulk_monitoring.sh", (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      res.sendStatus(500);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      res.sendStatus(500);
      return;
    }
    console.log(stdout);
    res.sendStatus(200);
  });
 })
});

function conevertWindowsToLinux(filename,res,cb)
{
	exec("sed -i 's/\r//' Output/"+ filename, (error, stdout, stderr) => {
		if (error) {
       console.error(`error: ${error.message}`);
       res.sendStatus(500);
       return;
     }
     if (stderr) {
       console.error(`stderr: ${stderr}`);
       res.sendStatus(500);
       return;
     }
    console.log("sed executed");
      cb()
});
}
app.post("/save-web-file", upload.single("web-file"), (req, res) => {
	conevertWindowsToLinux("web_template_creation",res,()=>{
  exec("Output/Web_bulk_monitoring.sh", (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      res.sendStatus(500);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      res.sendStatus(500);
      return;
    }
    console.log(stdout);
    res.sendStatus(200);
  });
})
});

app.listen(3001, () => {
  console.log("server started");
});
