/**
 * @name QOLPlugin
 * @author darthvader1925
 * @description A QOL Plugin with button hiding, lock screen etc.
 * @version 1.2.1
 */
const { Webpack, Webpack: { Filters } } = BdApi;
const Dispatcher = Webpack.getModule(Filters.byProps("dispatch", "isDispatching"));
const UserStore = Webpack.getModule(m => m?._dispatchToken && m?.getName() === "UserStore");
const clientUsername = UserStore.getCurrentUser().username;
const clientId = UserStore.getCurrentUser().id;
var showPush = false;
var useOnlyPush = true;
console.log("client id " + clientId)

const listener = (action) => {
  console.log(action)
  if (!showPush) return
  //if (!action.isPushNotification) {
    //if (useOnlyPush) return
 // }
  if (action.message.state == "SENDING") return
  if (action.message.content == null || action.message.content == "") return

  document.querySelectorAll(".bd-qol-notification").forEach(noti => {
    noti.remove();
  })

  try {
    const author = action.message.author.username;
    if (author == clientUsername) return;
    const profilePicture = "https://cdn.discordapp.com/avatars/" + action.message.author.id + "/" + action.message.author.avatar + ".webp";
    const notification = document.createElement("div")
    if (action.message.content.length > 28) {
      if (action.message.guild_id == undefined || action.message.guild_id == null) {
        notification.innerHTML = `
        <img src="${profilePicture}" class="bd-notification-pfp" style="width: 40px; height: 40px; vertical-align: middle; margin-left: 10px; margin-top: 10px;"> <span class="bd-notification-username" style="vertical-align: middle; margin-left: 15px; margin-top: 10px; font-size: 17px;">${author.substring(0, 7)}</span>
        <br><br>
        <span class="bd-notification-content" style="margin-left: 15px">${action.message.content.substring(0, 25)}...</span>
        <br><br>
        `
      } else {
        notification.innerHTML = `
        <img src="${profilePicture}" class="bd-notification-pfp" style="width: 40px; height: 40px; vertical-align: middle; margin-left: 10px; margin-top: 10px;"> <span class="bd-notification-username" style="vertical-align: middle; margin-left: 15px; margin-top: 10px; font-size: 17px;">${author.substring(0, 7)}</span> | <span id="bd-notification-channel" style="vertical-align: middle; margin-top: 10px; font-size: 17px;">#${action.message.channel_id}</span>
        <br><br>
        <span class="bd-notification-content" style="margin-left: 15px">${action.message.content.substring(0, 25)}...</span>
        <br><br>
        `
      }
    } else {
      if (action.message.guild_id == undefined || action.message.guild_id == null) {
        notification.innerHTML = `
        <img src="${profilePicture}" class="bd-notification-pfp" style="width: 40px; height: 40px; vertical-align: middle; margin-left: 10px; margin-top: 10px;"> <span class="bd-notification-username" style="vertical-align: middle; margin-left: 15px; margin-top: 10px; font-size: 17px;">${author.substring(0, 7)}</span>
        <br><br>
        <span class="bd-notification-content" style="margin-left: 15px">${action.message.content}</span>
        <br><br>
        `
      } else {
        notification.innerHTML = `
        <img src="${profilePicture}" class="bd-notification-pfp" style="width: 40px; height: 40px; vertical-align: middle; margin-left: 10px; margin-top: 10px;"> <span class="bd-notification-username" style="vertical-align: middle; margin-left: 15px; margin-top: 10px; font-size: 17px;">${author.substring(0, 7)}</span> | <span id="bd-notification-channel" style="vertical-align: middle; margin-top: 10px; font-size: 17px;">#${action.message.channel_id}</span>
        <br><br>
        <span class="bd-notification-content" style="margin-left: 15px">${action.message.content}</span>
        <br><br>
        `
      }

    }
    if (action.message.guild_id == null || action.message.guild_id == undefined) {
      notification.addEventListener("click", () => {
        console.log("Transitioning to DM")
        const transitionTo = BdApi.Webpack.getModule((m) => typeof m === "function" && String(m).includes(`"transitionTo - Transitioning to "`), { searchExports: true });
        transitionTo("/channels/@me/" + action.channelId);
        notification.remove();
      })
    } else {
      notification.addEventListener("click", () => {
        console.log("transitioning to server")
        const transitionTo = BdApi.Webpack.getModule((m) => typeof m === "function" && String(m).includes(`"transitionTo - Transitioning to "`), { searchExports: true });
        transitionTo("/channels/" + action.message.guild_id + "/" + action.channelId);
        notification.remove();
      })

    }
    notification.classList.add("bd-qol-notification")

    const id = performance.now();
    const progressBar = document.createElement("div");
    progressBar.classList.add("bd-qol-notification-progress");
    progressBar.setAttribute("id", "bd-" + id)
    notification.appendChild(progressBar);

    if (action.message.mention_everyone) notification.style.background = "#49443C"
    if (action.message.content.includes("<@" + clientId + ">")) {
      console.log("user mentioned")
      notification.style.background = "#49443C"
    }

    document.body.append(notification)

    setTimeout(() => {
      var progress = 100;
      function changeProgressBar() {
        if (!document.contains(progressBar)) return
        progress -= 1;
        progressBar.style.width = progress + "%";
        if (progress == 0) {
          notification.remove()
          return
        };
        setTimeout(changeProgressBar, 35)
      }
      changeProgressBar();
    }, 500)
  } catch (err) {
    console.error(err)
  }
}


module.exports = meta => {
  var removed = false;
  const shade = document.createElement("div")
  const password_input = document.createElement("div")



  const defaults = {
    password: "",
    hideMsgIcons: false,
    hideChannelIcons: false,
    idleTime: 60,
    logDeletedMessages: false,
    logEditedMessages: false,
    replaceHyphenChannel: false,
    useOnlyPush: true,
    showPush: true,
  };

  const settings = {};

  const stored_data = BdApi.loadData(meta.name, "settings");
  Object.assign(settings, defaults, stored_data);
  console.log("QOL PLUGIN SETTINGS:")
  console.log(settings);
  showPush = settings.showPush;
  useOnlyPush = settings.useOnlyPush;

  function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) &&
      !isNaN(parseFloat(str))
  }

  return {
    start: () => {
      // Add zeres plugin lib
      //if (!global.ZeresPluginLibrary) return window.BdApi.alert("Library Missing",`The library plugin needed for ${this.getName()} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);

      var idleTime = 0;
      var inAnimationPhase = false;
      Dispatcher.subscribe("MESSAGE_CREATE", listener);

      const mo = document.addEventListener("mousemove", resetIdle)
      const kp = document.addEventListener("keypress", (e) => {
        idleTime = 0;
        if (password_input.style.display == "block") {
          if (!e) e = event;
          if (!isNumeric(String.fromCharCode(e.which))) {
            e.preventDefault();
            return;
          }
          if (inAnimationPhase) return;
          e.preventDefault();
          inputtedPassword += String.fromCharCode(e.which);
          document.querySelector("#bd-discordpswrd-qol-input").value = inputtedPassword;
          authPassword();
        }
      });

      function resetIdle() {
        idleTime = 0;
      }

      function timerIncrement() {
        if (removed) return
        idleTime = idleTime + 1;
        //console.log(idleTime);
        if (idleTime > settings.idleTime) {
          shade.style.display = "block"
          password_input.style.display = "block"
          document.querySelector("#bd-discordpswrd-qol-input").style.color = "white"
          return;
        }
        setTimeout(timerIncrement, 1000);
      }

      timerIncrement()

      shade.style.position = "fixed";
      shade.style.top = "0%";
      shade.style.left = "0%";
      shade.style.background = "black"
      shade.style.width = "100%";
      shade.style.height = "100%";
      shade.style.opacity = "0.95";
      shade.style.zIndex = "9998";
      shade.style.display = "none";
      shade.id = "bd-discordpswrd-qol-shade";
      document.body.append(shade)


      password_input.style.position = "fixed";
      password_input.style.top = "55%";
      password_input.style.left = "50%";
      password_input.style.background = "transparent";
      password_input.style.width = "50%";
      password_input.style.height = "50%";
      password_input.style.zIndex = "9999";
      password_input.style.display = "none"
      password_input.style.opacity = "1"
      password_input.style.color = "white";
      password_input.style.textAlign = "center";
      password_input.style.transform = "translate(-50%, -50%)";
      password_input.id = "bd-discordpswrd-qol-pl"
      password_input.innerHTML = `
      <h1 style="text-decoration: underline;">Enter Discord Password</h1>
      <br><br>
      <input type="password" id="bd-discordpswrd-qol-input" disabled>
      <br><br>
      <span align="center" class="bd-discordpswrd-qol-num" style="margin-left: 50px;">1</span> <span align="center" class="bd-discordpswrd-qol-num">2</span> <span align="center" class="bd-discordpswrd-qol-num">3</span>
      <br><br>
      <span align="center" class="bd-discordpswrd-qol-num" style="margin-left: 50px;">4</span> <span align="center" class="bd-discordpswrd-qol-num">5</span> <span align="center" class="bd-discordpswrd-qol-num">6</span>
      <br><br>
      <span align="center" class="bd-discordpswrd-qol-num" style="margin-left: 50px;">7</span> <span align="center" class="bd-discordpswrd-qol-num">8</span> <span align="center" class="bd-discordpswrd-qol-num">9</span>
      <br><br>
      <span align="center" class="bd-discordpswrd-qol-num" style="margin-left: 50px;">0</span>
      <br><br>
      <span align="center" id="bd-discordpswrd-qol-backspace"><span style="font-size: 55px; vertical-align: middle;" data="bd-discordpswrd-qol-backspace">&#x2190;</span> <span style="font-size: 20px; vertical-align: middle;" data="bd-discordpswrd-qol-backspace">Backspace</span></span>
      `
      document.body.append(password_input)

      BdApi.injectCSS("QOLPlugin", `
    .bd-discordpswrd-qol-num:hover {
      color: #0be3ca;
    }

    #bd-discordpswrd-qol-input {
      border: none; 
      border-bottom: 1.5px solid white; 
      width: 200px; color: white; 
      font-size: 45px; 
      text-align: center; 
      background: transparent;
      transition: .5s;
    }

    .bd-discordpswrd-qol-num {
      font-size: 30px; 
      margin-right: 50px; 
      margin-bottom: 50px; 
      cursor: pointer; 
      text-align: center;
      width: 20px;
      transition: 1.5s;
    }

    #bd-discordpswrd-qol-backspace {
      transition: 1.5s;
      cursor: pointer;
      color: white;
    }

    #bd-discordpswrd-qol-backspace:hover {
      color: #0be3ca;
    }

    #bd-password-strength {
      margin-left: 10px;
    }

    .bd-qol-notification {
      position: fixed;
      z-index: 9997;
      left: 1%;
      top: 1%;
      width: 350px;
      background: #36393F;
      color: white;
      height: 100px;
      cursor: pointer;
    }

    .bd-notification-pfp {
      height: 80px;
      width: 80px;
      border-radius: 100%;
    }

    .bd-qol-notification-progress {
      width: 100%;
      background: #195ea8;
      height: 10px;
    }
  `);

      const detectKeyShow = document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.keyCode == 76) {
          if (shade.style.display == "none") {
            password_input.style.display = "block"
            shade.style.display = "block"
            document.querySelector("#bd-discordpswrd-qol-input").style.color = "white"
            document.querySelector("#bd-discordpswrd-qol-input").focus();
          }
        }
      })

      var inputtedPassword = "";
      const detectNumPress = document.addEventListener("click", (e) => {
        if (password_input.style.display == "none") return;
        if (inAnimationPhase == true) return;
        if (isNumeric(e.target.innerHTML)) {
          inputtedPassword += e.target.innerHTML;
          document.querySelector("#bd-discordpswrd-qol-input").value = inputtedPassword;
          authPassword();
        } else if (e.target.getAttribute("data") == "bd-discordpswrd-qol-backspace" && inputtedPassword.length > 0 && !inAnimationPhase) {
          inputtedPassword = inputtedPassword.slice(0, -1)
          document.querySelector("#bd-discordpswrd-qol-input").value = inputtedPassword;
        } else if (e.shiftKey && e.ctrlKey && e.keyCode == 73 && password_input.style.display == "block") {
          e.preventDefault();
        }
      })

      function authPassword() {
        if (inputtedPassword.length == settings.password.length) {
          if (inputtedPassword == settings.password) {
            document.querySelector("#bd-discordpswrd-qol-input").style.color = "#0be3ca"
            inputtedPassword = "";
            inAnimationPhase = true;
            setTimeout(function () {
              password_input.style.display = "none"
              shade.style.display = "none"
              document.querySelector("#bd-discordpswrd-qol-input").style.color = "white"
              document.querySelector("#bd-discordpswrd-qol-input").value = ""
              inAnimationPhase = false;
              timerIncrement();
              return
            }, 1200)
          } else {
            document.querySelector("#bd-discordpswrd-qol-input").style.color = "red"
            inputtedPassword = "";
            inAnimationPhase = true;
            setTimeout(function () {
              document.querySelector("#bd-discordpswrd-qol-input").value = ""
              document.querySelector("#bd-discordpswrd-qol-input").style.color = "white"
              inAnimationPhase = false;
              return
            }, 500)
          }
        }
      }

      // Hide icons
      function hideIcons() {
        console.log("hiding icons");
        document.querySelectorAll(".buttonWrapper-3YFQGJ").forEach(button => {
          if (settings.hideMsgIcons == false) return
          button.style.display = 'none'; // message bar
        })

        document.querySelectorAll(".icon-2W8DHg").forEach(button => {
          if (settings.hideChannelIcons == false) return
          button.style.display = 'none'; // channel icons
        })

        //setInterval(hideIcons, 60000);
      }
      hideIcons();
    },

    stop: () => {
      BdApi.clearCSS("QOLPlugin");
      shade.remove()
      Dispatcher.unsubscribe("MESSAGE_CREATE", listener);
      password_input.remove()
      removed = true;
      //document.removeEventListener("keydown", detectKeyShow)
      //document.removeEventListener("keypress", kp)
      //document.removeEventListener("mousemove", mo)
    },
    onSwitch: () => {
      //setTimeout(function() {
      //observer.disconnect()
      //observer.observe(document.querySelector(".scrollerInner-2PPAp2"), config);
      //}, 1000)
      function hideIcons() {
        if (settings.hideMsgIcons == false) return
        document.querySelectorAll(".buttonWrapper-3YFQGJ").forEach(button => {
          button.style.display = 'none'; // message bar
        })

        document.querySelectorAll(".icon-2W8DHg").forEach(button => {
          if (settings.hideChannelIcons == false) return
          button.style.display = 'none'; // channel icons
        })
      }
      hideIcons();

      function addSpaceInChannelNames() {
        if (settings.replaceHyphenChannel == false) return
        document.querySelectorAll(".channelName-3KPsGw").forEach(channel => {
          console.log(channel.innerHTML)
          channel.innerHTML = channel.innerHTML.replaceAll("-", " ")
        })
      }
      addSpaceInChannelNames();
    },
    getSettingsPanel: () => {
      const panel = document.createElement("div");
      panel.id = "bd-discordpswrd-settings-panel";

      const titleIcons = document.createElement("h2")
      titleIcons.innerHTML = "Icons"
      titleIcons.style.color = "white"
      titleIcons.style.fontWeight = "bold"
      titleIcons.style.marginBottom = "10px";

      panel.appendChild(titleIcons);

      const showChannelIcons = document.createElement("div");
      showChannelIcons.classList.add("setting");

      const sci_l = document.createElement("span")
      sci_l.innerHTML = "Hide Channel Icons (#)"
      sci_l.style.marginLeft = "10px"
      sci_l.style.color = "white"
      sci_l.style.verticalAlign = "middle"

      const sci = document.createElement("input")
      sci.type = "checkbox"
      sci.style.cursor = "pointer"
      sci.style.height = "20px"
      sci.style.width = "20px"
      sci.style.verticalAlign = "middle";

      sci.checked = settings.hideChannelIcons;

      sci.addEventListener("change", (e) => {
        if (sci.checked) {
          settings.hideChannelIcons = true;
          BdApi.saveData(meta.name, "settings", settings);
        } else {
          settings.hideChannelIcons = false;
          BdApi.saveData(meta.name, "settings", settings);
        }
      })

      showChannelIcons.append(sci, sci_l);


      const showMessageIcons = document.createElement("div");
      showMessageIcons.classList.add("setting");

      const smi_l = document.createElement("span")
      smi_l.innerHTML = "Hide Message Box Icons"
      smi_l.style.marginLeft = "10px"
      smi_l.style.color = "white"
      smi_l.style.height = "20px"
      smi_l.style.width = "20px"
      smi_l.style.verticalAlign = "middle"

      const smi = document.createElement("input")
      smi.type = "checkbox"
      smi.style.cursor = "pointer"
      smi.style.height = "20px"
      smi.style.width = "20px"
      smi.style.verticalAlign = "middle"

      smi.checked = settings.hideMsgIcons;

      smi.addEventListener("change", (e) => {
        settings.hideMsgIcons = smi.checked;
        BdApi.saveData(meta.name, "settings", settings);
      })

      showMessageIcons.append(smi, smi_l);

      const replaceHypenC = document.createElement("div")
      replaceHypenC.classList.add("setting");

      const asc = document.createElement("input")
      asc.type = "checkbox"
      asc.style.cursor = "pointer"
      asc.style.height = "20px"
      asc.style.width = "20px"
      asc.style.verticalAlign = "middle"

      asc.checked = settings.replaceHyphenChannel;

      asc.addEventListener("change", (e) => {
        settings.replaceHyphenChannel = asc.checked;
        BdApi.saveData(meta.name, "settings", settings);
      })

      const asc_l = document.createElement("span")
      asc_l.innerHTML = `Replace "-" with "-" in channel names`
      asc_l.style.marginLeft = "10px"
      asc_l.style.color = "white"
      asc_l.style.height = "20px"
      asc_l.style.width = "20px"
      asc_l.style.verticalAlign = "middle"

      replaceHypenC.append(asc, asc_l);

      const titlePs = document.createElement("h2")
      titlePs.innerHTML = "Password Settings"
      titlePs.style.color = "white"
      titlePs.style.fontWeight = "bold"
      titlePs.style.marginBottom = "10px"
      titlePs.style.marginTop = "10px";

      const passwordP = document.createElement("div");
      passwordP.appendChild(titlePs);

      const pswrd_input = document.createElement("input")
      pswrd_input.type = "password"
      pswrd_input.style.border = "none"
      pswrd_input.style.background = "none"
      pswrd_input.style.borderBottom = "1.5px solid white"
      pswrd_input.style.textAlign = "left"
      pswrd_input.style.fontSize = "15px"
      pswrd_input.style.verticalAlign = "middle"
      pswrd_input.style.color = "aqua"
      pswrd_input.value = settings.password;
      pswrd_input.addEventListener("keypress", (e) => {
        var char = String.fromCharCode(e.which)
        if (e.keyCode == 46) {
          setTimeout(() => {
            calculatePasswordStrength()
          })
        }
        if (!isNumeric(char)) e.preventDefault();
        setTimeout(() => {
          settings.password = pswrd_input.value;
          BdApi.saveData(meta.name, "settings", settings);
          var hiddenPswrd = "";
          for (let i = 0; i < settings.password.length - 1; i++) {
            hiddenPswrd += "*"
          }
          hiddenPswrd += settings.password.slice(-1);
          pswrd_il.innerHTML = "Pin (current: " + hiddenPswrd + ") <span id='bd-password-strength'></span>"
          calculatePasswordStrength();
        })
      })

      function calculatePasswordStrength() {
        if (!document.body.contains(document.querySelector("#bd-password-strength"))) {
          console.error("Body does not contain bd-password-strength");
          return
        }
        const password = settings.password;
        const passwordStrEle = document.querySelector("#bd-password-strength");

        // Calculate strength of password
        if (password.length < 4) {
          passwordStrEle.innerHTML = "Very weak";
          passwordStrEle.style.color = "red";
        } else if (password.length >= 4 && password.length < 6) {
          passwordStrEle.innerHTML = "Weak";
          passwordStrEle.style.color = "orange";
        } else if (password.length >= 6 && password.length < 8) {
          passwordStrEle.innerHTML = "Strong";
          passwordStrEle.style.color = "green";
        } else if (password.length >= 8 && password.length < 20) {
          passwordStrEle.innerHTML = "Very strong wtf";
          passwordStrEle.style.color = "green";
        } else if (password.length >= 20 && password.length < 100) {
          passwordStrEle.innerHTML = "ARE YOU OKAY??";
          passwordStrEle.style.color = "green";
        } else if (password.length >= 100) {
          passwordStrEle.innerHTML = "BRO GET SOME FREAKING THERAPY";
          passwordStrEle.style.color = "red";
        } else {
          passwordStrEle.innerHTML = ""
        }
      }


      const pswrd_il = document.createElement("span")
      var hiddenPswrd = "";
      console.log(settings.password.length)
      for (let i = 0; i < settings.password.length - 1; i++) {
        hiddenPswrd += "*"
      }
      hiddenPswrd += settings.password.slice(-1);
      pswrd_il.innerHTML = "Pin (current: " + hiddenPswrd + ") <span id='bd-password-strength'></span>"
      pswrd_il.style.marginLeft = "10px"
      pswrd_il.style.color = "white"
      pswrd_il.style.height = "20px"
      pswrd_il.style.width = "20px"
      pswrd_il.style.verticalAlign = "middle"
      setTimeout(() => {
        calculatePasswordStrength();
      }, 1000)

      const password_timeout = document.createElement("input")
      password_timeout.value = settings.idleTime;
      password_timeout.type = "number"
      password_timeout.style.border = "none"
      password_timeout.style.background = "none"
      password_timeout.style.borderBottom = "1.5px solid white"
      password_timeout.style.textAlign = "left"
      password_timeout.style.fontSize = "15px"
      password_timeout.style.verticalAlign = "middle"
      password_timeout.style.color = "aqua"

      password_timeout.addEventListener("keypress", (e) => {
        var char = String.fromCharCode(e.which)
        if (!isNumeric(char)) e.preventDefault();
        setTimeout(() => {
          settings.idleTime = password_timeout.value;
          BdApi.saveData(meta.name, "settings", settings);
        }, 150)
      })

      const lineBreak1 = document.createElement("br")

      const pswrdt_l = document.createElement("span")
      pswrdt_l.innerHTML = "Lock after x seconds"
      pswrdt_l.style.marginLeft = "10px"
      pswrdt_l.style.color = "white"
      pswrdt_l.style.height = "20px"
      pswrdt_l.style.width = "20px"
      pswrdt_l.style.verticalAlign = "middle"

      passwordP.append(pswrd_input, pswrd_il)
      passwordP.append(lineBreak1, password_timeout, pswrdt_l)

      const iaNotifications = document.createElement("div")
      iaNotifications.innerHTML = 
      `
      <br>
      <h1 style="color: white;"><b>In-app Notifications</b></h1>
      <br>
      `

      const showAppNotifications = document.createElement("div")
      const san_i = document.createElement("input")
      san_i.type = "checkbox";
      san_i.checked = settings.showPush;
      san_i.style.cursor = "pointer"
      san_i.style.height = "20px"
      san_i.style.width = "20px"
      san_i.style.verticalAlign = "middle"
      san_i.addEventListener("change", () => {
        settings.showPush = san_i.checked;
        BdApi.saveData(meta.name, "settings", settings);
        showPush = san_i.checked;
      })
      const san_l = document.createElement("span");
      san_l.innerHTML = "Show in-app notificiations"
      san_l.style.marginLeft = "10px"
      san_l.style.color = "white"
      san_l.style.height = "20px"
      san_l.style.width = "20px"
      san_l.style.verticalAlign = "middle"
      showAppNotifications.append(san_i, san_l);
/*
      const uop = document.createElement("div")
      const useOnlyPush_i = document.createElement("input")
      useOnlyPush_i.type = "checkbox";
      useOnlyPush_i.checked = settings.useOnlyPush;
      useOnlyPush_i.style.cursor = "pointer"
      useOnlyPush_i.style.height = "20px"
      useOnlyPush_i.style.width = "20px"
      useOnlyPush_i.style.verticalAlign = "middle"
      useOnlyPush_i.addEventListener("change", (e) => {
        settings.useOnlyPush = useOnlyPush_i.checked;
        BdApi.saveData(meta.name, "settings", settings);
        useOnlyPush = useOnlyPush_i.checked;
      })

      const useOnlyPush_l = document.createElement("span")
      useOnlyPush_l.innerHTML = "Only show important notifications (when mentioned, etc)"
      useOnlyPush_l.style.marginLeft = "10px"
      useOnlyPush_l.style.color = "white"
      useOnlyPush_l.style.height = "20px"
      useOnlyPush_l.style.width = "20px"
      useOnlyPush_l.style.verticalAlign = "middle"

      uop.append(useOnlyPush_i, useOnlyPush_l)*/
      iaNotifications.append(showAppNotifications, uop)
    
      panel.append(showChannelIcons, showMessageIcons, replaceHypenC, passwordP, iaNotifications);

      return panel;
    }
  }
};
