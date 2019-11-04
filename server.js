const express = require("express");
const next = require("next");
var compression = require("compression");
const sms = require("./data/sms");
const fs = require("fs");
const cors = require("cors");
const port = 8080;
// const app = next({ dev });
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");
var compression = require("compression");
// var appRoot = require("app-root-path");
const tsFormat = () => new Date().toLocaleTimeString();
// var winston = require("./config/winston");
// var MobileDetect = require("mobile-detect");
// const isMobile = require("ismobilejs");
const logDir = "../logs";
const winston = require("winston");
const uuid = require("./config/uuidGen");
var corsOptions = {
  origin: "https://install.mpl.live",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
const logger = winston.createLogger({
  transports: [
    // colorize the output to the console
    new winston.transports.Console({
      timestamp: tsFormat,
      colorize: true,
      level: "info"
    }),
    new (require("winston-daily-rotate-file"))({
      colorize: true,
      filename: `${logDir}/%DATE%-results.log`,
      timestamp: tsFormat,
      prepend: true,
      maxSize: "20m",
      zippedArchive: true,
      maxFiles: "14d",
      datePattern: "YYYY-MM-MM",

      level: "info"
    })
  ]
});
// var redirectToHTTPS = require("express-http-to-https").redirectToHTTPS;
// proto definition////////////////////

// Configs///////////////////////////////////
let config = {
  env: "LOCAL",
  IOS_APP_URL:
    "itms-apps://itunes.apple.com/us/app/mpl-mobile-premier-league/id1447849626?ls=1&mt=8",
  REWARDS: {
    tokenBonus: 20,
    cashBonus: 10
  },
  APP_REDIRECT: "PRO",
  HEADER_BUTTON: true,
  BLOCK_VISIBILITY: {
    Home: {
      STATS: true,
      GET_APP: true,
      MPL_HERO: true
    },
    "Hero Adda": {
      STATS: true,
      GET_APP: true,
      MPL_HERO: true
    }
  },
  DOWNLOAD_LINK: {
    DEFAULT: "https://akedge.mpl.live/pb/static/app/20190718/mpl-pro-v64.apk",
    SUPERTEAM:
      "https://akedge.mpl.live/pb/static/app/20190718/mpl-pro-v64-superteam.apk",
    RUNNER_GAME:
      "https://akedge.mpl.live/pb/static/app/20190718/mpl-pro-v64-runner.apk",
    POOL_GAME:
      "https://akedge.mpl.live/pb/static/app/20190718/mpl-pro-v64-pool.apk",
    BUBBLESHOOTER_GAME:
      "https://akedge.mpl.live/pb/static/app/20190718/mpl-pro-v64-bs.apk",
    PROCRICKET_GAME:
      "https://akedge.mpl.live/pb/static/app/20190718/mpl-pro-v64-cricket.apk",
    GOOGLE_CAMPAIGN:
      "https://akedge.mpl.live/pb/static/app/20190506/mpl-pro-campaign-v51.apk",
    INSTALL_DOWNLOAD_MPL:
      "https://akedge.mpl.live/pb/static/app/20190706/mpl-pro-v62-aff.apk"
  },
  SMS_LINKS: [
    "https://snap.onelink.me/fU2e/snap01",
    "https://snap.onelink.me/fU2e/snap02",
    "https://snap.onelink.me/fU2e/snap03",
    "https://snap.onelink.me/fU2e/snap04",
    "https://snap.onelink.me/fU2e/snap05",
    "https://snap.onelink.me/fU2e/snap06",
    "https://snap.onelink.me/fU2e/snap07",
    "https://snap.onelink.me/fU2e/snap08",
    "https://snap.onelink.me/fU2e/snap09",
    "https://snap.onelink.me/fU2e/snap10",
    "https://snap.onelink.me/fU2e/snap11",
    "https://snap.onelink.me/fU2e/snap12",
    "https://snap.onelink.me/fU2e/snap13",
    "https://snap.onelink.me/fU2e/snap14",
    "https://snap.onelink.me/fU2e/snap15",
    "https://snap.onelink.me/fU2e/snap16",
    "https://snap.onelink.me/fU2e/snap17",
    "https://snap.onelink.me/fU2e/snap18",
    "https://snap.onelink.me/fU2e/snap19",
    "https://snap.onelink.me/fU2e/snap20"
  ]
};
const dev = config.env && config.env === "LOCAL" ? true : false;
// const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();
let getConfigurations = function(page) {
  if (config.DOWNLOAD_LINK[page]) {
    config.APP_URL = config.DOWNLOAD_LINK[page];
  } else {
    config.APP_URL = config.DOWNLOAD_LINK.DEFAULT;
  }

  delete config.CLAVERTAP_KEY;
  delete config.BRANCH_KEY;
  return config;
};
// app.use(compression());
app.prepare().then(() => {
  const server = express();
  server.use(compression());
  // server.use(morgan("combined", { stream: winston.stream }));
  server.use(bodyParser.json());

  server.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
  server.use(
    "/static",
    express.static(__dirname + "/static", {
      maxAge: "365d"
    })
  );
  const faviconOptions = {
    root: __dirname + "/static/"
  };
  const robotOptions = {
    root: __dirname + "/static/",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8"
    }
  };
  const sitemapOptions = {
    root: __dirname + "/static/",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8"
    }
  };
  const ampOptions = {
    root: __dirname + "/static/",
    headers: {
      "Content-Type": "text/html"
    }
  };
  const akamaiOptions = {
    root: __dirname + "/static/",
    headers: {
      "Content-Type": "text/htm"
    }
  };

  server.get("/*", function(req, res, next) {
    if (req.headers.host.match(/^www/) == null && req.hostname === "mpl.live") {
      // next();
      res.redirect(301, "https://www." + req.hostname + req.url);
    } else next();
  });
  server.get("/favicon.ico", (req, res) =>
    res.status(200).sendFile("favicon.ico", faviconOptions)
  );
  server.get("/robots.txt", (req, res) => {
    if (
      req.hostname === "mplgaming.com" ||
      // req.hostname === "dweb.mpl.live" ||
      req.hostname === "dweb.mplgaming.com" ||
      req.hostname === "sweb.mplgaming.com" ||
      req.hostname === "mplapp.pro"
    ) {
      res.type("text/plain");
      res.send("User-agent: *\nDisallow: /");
    } else {
      res.status(200).sendFile("robots.txt", robotOptions);
    }
  });
  //////////////////
  server.get("/sitemap.xml", (req, res) => {
    res.status(200).sendFile("sitemap.xml", sitemapOptions);
  });
  ////////////////////////////

  server.get("/fantasycricket", (req, res) => {
    res.status(200).sendFile("index.html", ampOptions);
  });
  ////////////////////////////////////
  server.get("/check", (req, res) => {
    res.status(200).send("OK");
  });
  server.get("/app-link", cors(corsOptions), (req, res) => {
    res.status(200).json({ APP_URL: config.DOWNLOAD_LINK.DEFAULT });
  });
  server.get("/akamai/sureroute-test-object.html", (req, res) => {
    // res.type("text/html");
    res.header("Content-Type", "text/html");
    res.type("text/html");
    res.status(200);
    res.sendFile(path.join(__dirname + "/static/sureroute-test-object.html"));
  });
  // Reafaraal ///////////////////////////////////////////////////////////
  server.get("/download", (req, res) => {
    referralFlow(req, res);
  });
  ////////////////New Referral//////////////
  function referralFlow(req, res) {
    let config = getConfigurations("REFERRAL");

    if (
      req.query.referralCode ||
      (req.query.rc && req.query.ps === "f") ||
      req.query.mplReferrerCode
    ) {
      var referralCode = "";
      if (req.query.mplReferrerCode) {
        referralCode = req.query.mplReferrerCode;
      } else if (req.query.referralCode) {
        referralCode = req.query.referralCode
          ? req.query.referralCode
          : req.query.rc;
      }
      logger.info(`Referral Code: ${req.query.referralCode}`);
      referralClient.getDownloadPageConfig({ referralCode }, function(
        error,
        resp
      ) {
        if (error) {
          logger.error(`Referral Response Error: ${JSON.stringify(error)}`);

          return app.render(req, res, "/download", {
            config
          });
        } else {
          if (!resp.error) {
            createBranchLink(req, config, "REFERRAL", updatedConfig => {
              updatedConfig.referral = resp;
              return app.render(req, res, `/download`, {
                config: updatedConfig
              });
            });
          } else {
            return app.render(req, res, "/download", {
              config
            });
          }
        }
      });
    } else if (req.query.rc && req.query.ps === "t") {
      res.redirect(
        301,
        "https://play.google.com/store/apps/details?id=com.mpl.androidapp.ps"
      );
    } else {
      // config.referral = {
      //   referralCode: "U3QSVH6USY",
      //   displayName: "89*****628",
      //   cashBonus: 20,
      //   tokenBonus: 20
      // };
      return app.render(req, res, "/download", {
        config
      });
    }
  }
  // Reafaraal /////////////////////////////////
  server.get("/rd", (req, res) => {
    referralFlow(req, res);
  });

  ///////////////////////////////Superteam redirect//////////////////////////////

  ///////////////////////////////SuperYTeam/////////////////////////////////////
  server.get("/superteam", (req, res) => {
    let pageName = "SUPERTEAM";
    let config = getConfigurations(pageName);

    createBranchLink(req, config, pageName, updatedConfig => {
      return app.render(req, res, `/superteam`, {
        config: updatedConfig
      });
    });
  });

  ////////////////////////////////////////////////////////
  server.get("/download/:referralCode/:flag", (req, res) => {
    let config = getConfigurations("REFERRAL");
    if (req.params.referralCode && req.params.flag === "f") {
      res.redirect(
        301,
        `https://www.mpl.live/download?referralCode=${req.params.referralCode}`
      );
    } else if (req.params.referralCode && req.params.flag === "t") {
      res.redirect(
        301,
        "https://play.google.com/store/apps/details?id=com.mpl.androidapp.ps"
      );
    } else {
      return app.render(req, res, "/download", {
        config
      });
    }
  });
  /////////////////////////////////////Tournament Page///////////////////////////////////////////////////
  server.get("/tournament/:id", (req, res) => {
    let config = getConfigurations("HOME");
    switch (req.query.at) {
      case "ps":
        // res.redirect(
        //   301,
        //   "https://play.google.com/store/apps/details?id=com.mpl.androidapp.ps"
        // );
        return app.render(req, res, "/tournament", {
          config
        });
        break;
      case "ios":
        res.redirect(
          301,
          "itms-apps://itunes.apple.com/us/app/mpl-mobile-premier-league/id1447849626?ls=1&mt=8"
        );
        break;
      case "pro":
        return app.render(req, res, "/tournament", {
          config
        });
        break;

      default:
        return app.render(req, res, "/tournament", {
          config
        });
        break;
    }
  });
  ////////////////////////////////////////////////Battle Page//////////////////////////////////////////////
  server.get("/battle/:id", (req, res) => {
    // return app.render(req, res, "/tournament", {
    //   id: req.params.id,
    //   config
    // });
    let config = getConfigurations("HOME");
    switch (req.query.at) {
      case "ps":
        // res.redirect(
        //   301,
        //   "https://play.google.com/store/apps/details?id=com.mpl.androidapp.ps"
        // );
        return app.render(req, res, "/tournament", {
          config
        });
        break;
      case "ios":
        res.redirect(
          301,
          "itms-apps://itunes.apple.com/us/app/mpl-mobile-premier-league/id1447849626?ls=1&mt=8"
        );
        break;
      case "pro":
        return app.render(req, res, "/tournament", {
          config
        });
        break;

      default:
        return app.render(req, res, "/tournament", {
          config
        });
        break;
    }
  });

  /////////////////////////////////////Superteam Page///////////////////////////////////////////////////
  server.get("/superteam/:id", (req, res) => {
    let pageName = "SUPERTEAM";
    let config = getConfigurations(pageName);

    switch (req.query.at) {
      case "ps":
        // res.redirect(
        //   301,
        //   "https://play.google.com/store/apps/details?id=com.mpl.androidapp.ps"
        // );
        createBranchLink(req, config, pageName, updatedConfig => {
          return app.render(req, res, `/superteam`, {
            config: updatedConfig
          });
        });
        break;
      case "ios":
        res.redirect(
          301,
          "itms-apps://itunes.apple.com/us/app/mpl-mobile-premier-league/id1447849626?ls=1&mt=8"
        );
        break;
      case "pro":
        createBranchLink(req, config, pageName, updatedConfig => {
          return app.render(req, res, `/superteam`, {
            config: updatedConfig
          });
        });
        break;

      default:
        createBranchLink(req, config, pageName, updatedConfig => {
          return app.render(req, res, `/superteam`, {
            config: updatedConfig
          });
        });
        break;
    }
  });
  /////////////////////////////////////Tournament Page///////////////////////////////////////////////////
  server.get("/tournament", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/tournament", {
      config
    });
  });
  /////////////////////////////// Battle///////////////////////////
  server.get("/battle", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/tournament", {
      config
    });
  });
  //////////////Indiavs Pak/////////////////////////////////////
  server.get("/indiavspak", (req, res) => {
    res.redirect(301, `https://mpl.live/match/indvspak`);
  });
  //////////////////////Snapchat/////////////////////////////////
  server.get("/snapchat", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/snapchat", {
      config
    });
  });
  //////////////////////Blue page/////////////////////////////////
  server.get("/bl", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/bl", {
      config
    });
  });
  //////////////////////red page/////////////////////////////////
  server.get("/red", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/red", {
      config
    });
  });
  //////////////////////yellow page/////////////////////////////////
  server.get("/yl", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/yl", {
      config
    });
  });
  //////////////////////purple page/////////////////////////////////
  server.get("/pl", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/pl", {
      config
    });
  });

  //////////////////////Balla Ghuma/////////////////////////////////
  server.get("/ballaghuma", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/ballaghuma", {
      config
    });
  });
  //////////////////////Balla Hindi/////////////////////////////////
  server.get("/ballaghuma/hi", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/ballaghuma-hi", {
      config
    });
  });
  //////////////////////Blue page/////////////////////////////////
  server.get("/blg", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/blg", {
      config
    });
  });

  //////////////////////VK PLAIN/////////////////////////////////
  server.get("/p", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/vk-plain", {
      config
    });
  });
  ////////////////////// Winner /////////////////////////////////
  server.get("/winner", (req, res) => {
    let config = getConfigurations("SUPERTEAM");
    return app.render(req, res, "/winner", {
      config
    });
  });
  //////////////////////refer and earn page/////////////////////////////////
  server.get("/refer", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/refer", {
      config
    });
  });
  //////////////////////refer new /////////////////////////////////
  server.get("/refer-new", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/refer-new", {
      config
    });
  });

  //////////////////////refer green bengali /////////////////////////////////
  server.get("/refer-green-bengali", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/refer-green-bengali", {
      config
    });
  });

  server.get("/refer-green-kannada", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/refer-green-kannada", {
      config
    });
  });

  server.get("/refer-green-malayalam", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/refer-green-malayalam", {
      config
    });
  });

  server.get("/refer-green-tamil", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/refer-green-tamil", {
      config
    });
  });

  server.get("/refer-green-telugu", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/refer-green-telugu", {
      config
    });
  });

  server.get("/refer-pink-bengali", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/refer-pink-bengali", {
      config
    });
  });

  server.get("/refer-pink-kannada", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/refer-pink-kannada", {
      config
    });
  });

  server.get("/refer-pink-malayalam", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/refer-pink-malayalam", {
      config
    });
  });

  server.get("/refer-pink-tamil", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/refer-pink-tamil", {
      config
    });
  });

  server.get("/refer-pink-telugu", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/refer-pink-telugu", {
      config
    });
  });
  // -------------------- KABADDI --------------------  //

  server.get("/kabaddi-blue", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/kabaddi-blue", {
      config
    });
  });

  server.get("/kabaddi-pink", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/kabaddi-pink", {
      config
    });
  });
  server.get("/kabaddi", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/kabaddi-pink", {
      config
    });
  });

  server.get("/audio-show", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/audio-show", {
      config
    });
  });

  //////////////////////////////////////////////////////
  server.get("/tiktok", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/snapchat", {
      config
    });
  });
  //////////////////Fantasy-winner////////////////////////////////
  server.get("/fantasywinner", (req, res) => {
    let config = getConfigurations("SUPERTEAM");
    return app.render(req, res, "/indiavspak", {
      config
    });
  });

  /////////////////////?ELvis Page///////////////////////////////
  server.get("/elvis-promo", (req, res) => {
    let config = getConfigurations("HOME");
    config.APP_URL =
      "https://akedge.mpl.live/pb/static/app/20190718/mpl-pro-v64-elvis.apk";
    return app.render(req, res, "/elvis", {
      config
    });
  });

  /////////////////////////////KYC Flow/////////////////////////////
  server.get("/kyc", (req, res) => {
    if (req.query.mplve) {
      let { mplve } = { ...req.query };
      logger.info(`Email Verify Code: ${mplve}`);
      axios
        .get("https://api.mpl.live/kyc/mplve/" + mplve)
        .then(verifyRes => {
          logger.info(
            `Email Verify Message: ${JSON.stringify(
              verifyRes.data.payload.message
            )}`
          );
          return app.render(req, res, "/kyc", {
            emailRes: verifyRes.data.payload.message
          });
        })
        .catch(err => {
          logger.error(`Email Verify Error: ${JSON.stringify(err)}`);
          return app.render(req, res, "/kyc", { emailRes: "SERVER_ERROR" });
        });
    } else {
      return app.render(req, res, "/kyc", { emailRes: "LINK_INVALID" });
    }
  });
  /////////////////////////////////Video Service URL///////////////////////////////////////////////////////////

  server.get("/video", (req, res) => {
    let config = getConfigurations("HOME");
    return app.render(req, res, "/index", {
      config
    });
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////
  server.get("/game/:game", (req, res) => {
    let config = getConfigurations(`${req.params.game.toUpperCase()}_GAME`);

    // if (req.query.utm_source) {
    //   createBranchLink(req, config, "CAMPAIGN", updatedConfig => {
    //     return app.render(req, res, `/getapp/${req.params.ln}`, {
    //       config: updatedConfig
    //     });
    //   });
    // } else {
    config.game = req.params.game;
    getGameAssets(config, updateconfig => {
      return app.render(req, res, `/game`, {
        config: updateconfig
      });
    });

    // }
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////
  server.get("/match/:match", (req, res) => {
    let config = getConfigurations(`SUPERTEAM`);

    config.match = req.params.match;
    getMatchAssets(config, updateconfig => {
      return app.render(req, res, `/match`, {
        config: updateconfig
      });
    });
  });
  /////////////////////////////////Video Service URL///////////////////////////////////////////////////////////

  server.get("/allgames", (req, res) => {
    let config = getConfigurations("HOME");
    try {
      teClient.getAllGamesV2({ combined: true }, (err, teRes) => {
        return app.render(req, res, "/allgames", {
          config
        });
      });
    } catch (error) {
      return app.render(req, res, "/index", {
        config
      });
    }
  });

  ////////////////////////////////Home Page///////////////////////////////////////////////

  server.get("/", (req, res) => {
    let config = getConfigurations("HOME");

    return app.render(req, res, "/index", {
      config
    });
  });

  /////////////////VL_SUPERTEAM/////////////////////
  server.get("/cricket", (req, res) => {
    let config = getConfigurations("SUPERTEAM");

    return app.render(req, res, "/cricket", {
      config
    });
  });
  //////////////////////////////// Hero Adda ///////////////////////////////////////////////
  server.get("/heroadda", (req, res) => {
    let config = getConfigurations("HEROADDA");

    return app.render(req, res, "/heroadda", {
      config
    });
  });
  //////////////////////////////// Hero ///////////////////////////////////////////////
  server.get("/hero", (req, res) => {
    let config = getConfigurations("HERO");

    return app.render(req, res, "/hero", {
      config
    });
  });
  //////////////////////////
  server.get("/g-ad-pro", (req, res) => {
    let config = getConfigurations("GOOGLE_CAMPAIGN");
    return app.render(req, res, "/index", {
      config
    });
  });
  /////////////////////get App////////////////////////////////////////////////////////////////
  server.get("/getapp/:ln", (req, res) => {
    let config = getConfigurations("DEFAULT");

    // if (req.query.utm_source) {
    //   createBranchLink(req, config, "CAMPAIGN", updatedConfig => {
    //     return app.render(req, res, `/getapp/${req.params.ln}`, {
    //       config: updatedConfig
    //     });
    //   });
    // } else {
    return app.render(req, res, `/getapp/${req.params.ln}`, {
      config
    });
    // }
  });
  /////////////////////////////////////////////////////////////////
  server.post("/api/applink", (req, res) => {
    var { To, VAR1 } = { ...req.body };

    if (VAR1 !== "DEFAULT") {
      VAR1 = config.SMS_LINKS[VAR1 - 1];
    } else {
      VAR1 = config.DOWNLOAD_LINK.DEFAULT;
    }

    logger.info(`SMS Request for Mobile: ${JSON.stringify(req.body)}`);
    sms.send_AppLink({ To, VAR1 }, val => {
      if (val.status === 200) {
        logger.info(`SMS Response for Mobile: ${JSON.stringify(req.body)}`);
      }

      res.json({ status: res.status });
    });
  });
  ///////////////////////Banner Data//////////////////////
  server.get("/api/banners", (req, res) => {
    bannnersClient.getLive(
      {
        requestId: uuid(),
        appType: "WEBSITE",
        location: "HOME"
      },
      (err, bannerRes) => {
        var bannersData = {
          banners: [
            {
              imageUrl: "/static/banners/003.png"
            },
            {
              imageUrl: "/static/banners/002.png"
            },
            {
              imageUrl: "/static/banners/001.png"
            },
            {
              imageUrl: "/static/banners/004.png"
            },
            {
              imageUrl: "/static/banners/005.png"
            }
          ]
        };
        if (!err) {
          if (bannerRes.banners) {
            res.json(bannerRes);
          } else {
            res.json(bannersData);
          }
        } else {
          console.log(err);

          res.json(bannersData);
        }
      }
    );
  });
  ///////////////////////////////////////ABout site redirects/////////////////////////////
  server.get("/terms", (req, res) => {
    res.redirect(301, `https://about.mpl.live/terms`);
  });
  server.get("/termsandconditions", (req, res) => {
    res.redirect(301, `https://about.mpl.live/terms-and-conditions/`);
  });
  server.get("/gamesofskill", (req, res) => {
    res.redirect(301, `https://about.mpl.live/game-of-skill/`);
  });
  server.get("/skillgames", (req, res) => {
    res.redirect(301, `https://about.mpl.live/gamesofskill/`);
  });
  server.get("/privacy", (req, res) => {
    res.redirect(301, `https://about.mpl.live/privacy/`);
  });
  server.get("/privacypolicy", (req, res) => {
    res.redirect(301, `https://about.mpl.live/privacy-policy/`);
  });
  server.get("/about", (req, res) => {
    res.redirect(301, `https://about.mpl.live/`);
  });
  server.get("/disclaimer", (req, res) => {
    res.redirect(301, `https://about.mpl.live/disclaimer`);
  });
  /////////////////////////////////////////////////////////////////////////////////////////
  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
    // process.send("ready");
  });
});

function createBranchLink(req, config, pageName, cb) {
  var body = {
    branch_key: config.BRANCH_KEY,
    channel: req.query.utm_source ? req.query.utm_source : "",
    feature: req.query.utm_name ? req.query.utm_name : "",
    campaign: req.query.utm_campaign ? req.query.utm_campaign : ""
  };
  var data = {
    $og_title: config.OG_TITLE,
    $og_description: config.OG_DESCRIPTION,
    $og_image_url: config.OG_IMAGE,
    $desktop_url: config.APP_URL,
    $android_url: config.APP_URL,
    $ios_url: config.IOS_APP_URL,
    webpage: pageName
  };
  if (pageName === "SUPERTEAM") {
    cb(config);
    // data.$og_title = "MPL | Mobile Premier League - Super Team Fantasy Cricket";
    // data.$og_description =
    //   "Play Fantasy Cricket and win real cash daily! Download the MPL Pro App to join 2 Crore+ players & more than 5 lakh+ daily winners.";
    // data.$og_image_url = `https://www.mpl.live/static/OG_SUPERTEAM.jpg`;
    // data.redirect = "superteam";
  } else {
    if (req.query.referralCode) {
      data.mplReferrerCode = req.query.referralCode;
    }
    for (obj in req.query) {
      if (
        obj !== "_branch_match_id" ||
        obj !== "utm_name" ||
        obj !== "utm_campaign" ||
        obj !== "utm_source"
      ) {
        data[obj] = req.query[obj];
      }
    }
    body.data = data;

    axios
      .post("https://api.branch.io/v1/url", body)
      .then(function(response) {
        config.APP_URL = response.data.url;
        config.BRANCH_URL = true;

        cb(config);
      })
      .catch(function(error) {
        logger.error(JSON.stringify(error.data));
        cb(config);
      });
  }
}

function getGameAssets(config, cb) {
  var gameAssets = {};
  gameAssets.DESKTOP_BG = `/static/game/${config.game}/BG.png`;
  gameAssets.MOBILE_BG = `/static/game/${config.game}/BG.png`;
  gameAssets.GAME_IMG = `/static/game/${config.game}/Logo.png`;
  gameAssets.USER_IMG = `/static/game/Virat.png`;
  config.gameAssets = gameAssets;
  cb(config);
}

function getMatchAssets(config, cb) {
  var matchAssets = {};
  let match = config.match.toUpperCase();
  matchAssets.team1 = match.slice(0, 3);
  matchAssets.team2 = match.slice(5, match.length);

  matchAssets.DESKTOP_BG = `/static/match/BG_DESKTOP.png`;
  matchAssets.TEAM1_MOBILE = `/static/match/${config.match}/Mobile/${
    matchAssets.team1
  }.png`;
  matchAssets.TEAM2_MOBILE = `/static/match/${config.match}/Mobile/${
    matchAssets.team2
  }.png`;
  matchAssets.TEAM1_DESKTOP = `/static/match/${config.match}/Desktop/${
    matchAssets.team1
  }.png`;
  matchAssets.TEAM2_DESKTOP = `/static/match/${config.match}/Desktop/${
    matchAssets.team2
  }.png`;
  matchAssets.MOBILE_BG = `/static/match/BG_MOBILE.png`;
  config.matchAssets = matchAssets;
  cb(config);
}
