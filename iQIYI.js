/*
爱奇艺会员签到脚本

更新时间: 2021.9.22
脚本兼容: QuantumultX, Surge4, Loon, JsBox, Node.js
电报频道: @NobyDa
问题反馈: @NobyDa_bot

获取Cookie说明：
打开爱奇艺App后(AppStore中国区)，点击"我的", 如通知成功获取cookie, 则可以使用此签到脚本.
获取Cookie后, 请将Cookie脚本禁用并移除主机名，以免产生不必要的MITM.
脚本将在每天上午9:00执行, 您可以修改执行时间。

如果使用Node.js, 需自行安装'request'模块. 例: npm install request -g

JsBox, Node.js用户抓取Cookie说明：
开启抓包, 打开爱奇艺App后(AppStore中国区)，点击"我的" 返回抓包App 搜索请求头关键字 psp_cki= 或 P00001= 或 authcookie=
提取字母数字混合字段, 到&结束, 填入以下单引号内即可.
*/

var cookie = '94k9wEuSgCoHvKijSxpd8K6m1Nr1nRCNtrDRFL4IfOEoswf5LA9Cm1YKNMlAV8zm2fBcx6a'

if (process.env.IQIYI) {
  cookie = process.env.IQIYI;
}

var barkKey = ''; //Bark APP 通知推送Key
let timeout = 15000;
let SCKEY = 'SCT82442Tit4ztyEVxifjAF2PfmfdVgg0';
let TG_BOT_TOKEN = '';
let TG_USER_ID = '';
let TG_API_HOST = 'api.telegram.org';
let TG_PROXY_HOST = ''; //例如:127.0.0.1(环境变量名:TG_PROXY_HOST)
let TG_PROXY_PORT = ''; //例如:1080(环境变量名:TG_PROXY_PORT)
let TG_PROXY_AUTH = ''; //tg代理配置认证参数

if (process.env.PUSH_KEY) {
  SCKEY = process.env.PUSH_KEY;
}
if (process.env.TG_BOT_TOKEN) {
  TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
}
if (process.env.TG_USER_ID) {
  TG_USER_ID = process.env.TG_USER_ID;
}
if (process.env.TG_PROXY_AUTH) TG_PROXY_AUTH = process.env.TG_PROXY_AUTH;
if (process.env.TG_PROXY_HOST) TG_PROXY_HOST = process.env.TG_PROXY_HOST;
if (process.env.TG_PROXY_PORT) TG_PROXY_PORT = process.env.TG_PROXY_PORT;
if (process.env.TG_API_HOST) TG_API_HOST = process.env.TG_API_HOST;

/*********************
QuantumultX 远程脚本配置:
**********************
[task_local]
# 爱奇艺会员签到
0 9 * * * https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js

[rewrite_local]
# 获取Cookie
^https?:\/\/iface(\d)?\.iqiyi\.com\/ url script-request-header https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js

[mitm] 
hostname= ifac*.iqiyi.com

**********************
Surge 4.2.0+ 脚本配置:
**********************
[Script]
爱奇艺签到 = type=cron,cronexp=0 9 * * *,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js

爱奇艺获取Cookie = type=http-request,pattern=^https?:\/\/iface(\d)?\.iqiyi\.com\/,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js

[MITM] 
hostname= ifac*.iqiyi.com

************************
Loon 2.1.0+ 脚本配置:
************************

[Script]
# 爱奇艺签到
cron "0 9 * * *" script-path=https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js

# 获取Cookie
http-request ^https?:\/\/iface(\d)?\.iqiyi\.com\/ script-path=https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js

[Mitm] 
hostname= ifac*.iqiyi.com

*/

var LogDetails = false; // 响应日志

var out = 0; // 超时 (毫秒) 如填写, 则不少于3000

var $nobyda = nobyda();

(async () => {
  out = $nobyda.read("iQIYI_TimeOut") || out
  cookie = cookie || $nobyda.read("CookieQY")
  LogDetails = $nobyda.read("iQIYI_LogDetails") === "true" ? true : LogDetails
  if ($nobyda.isRequest) {
    GetCookie()
  } else if (cookie) {
    await login();
    await Checkin();
    await Lottery(500);
    await $nobyda.time();
  } else {
    $nobyda.notify("爱奇艺会员", "", "签到终止, 未获取Cookie");
  }
})().finally(() => {
  $nobyda.done();
})

function login() {
  return new Promise(resolve => {
    var URL = {
      url: 'https://cards.iqiyi.com/views_category/3.0/vip_home?secure_p=iPhone&scrn_scale=0&dev_os=0&ouid=0&layout_v=6&psp_cki=' + cookie + '&page_st=suggest&app_k=8e48946f144759d86a50075555fd5862&dev_ua=iPhone8%2C2&net_sts=1&cupid_uid=0&xas=1&init_type=6&app_v=11.4.5&idfa=0&app_t=0&platform_id=0&layout_name=0&req_sn=0&api_v=0&psp_status=0&psp_uid=451953037415627&qyid=0&secure_v=0&req_times=0',
      headers: {
        sign: '7fd8aadd90f4cfc99a858a4b087bcc3a',
        t: '479112291'
      }
    }
    $nobyda.get(URL, function(error, response, data) {
      const Details = LogDetails ? data ? `response:\n${data}` : '' : ''
      if (!error && data.match(/\"text\":\"\d.+?\u5230\u671f\"/)) {
        $nobyda.expire = data.match(/\"text\":\"(\d.+?\u5230\u671f)\"/)[1]
        console.log(`爱奇艺-查询成功: ${$nobyda.expire} ${Details}`)
      } else {
        console.log(`爱奇艺-查询失败${error || ': 无到期数据 ⚠️'} ${Details}`)
      }
      resolve()
    })
    if (out) setTimeout(resolve, out)
  })
}

function Checkin() {
  return new Promise(resolve => {
    var URL = {
      url: 'https://tc.vip.iqiyi.com/taskCenter/task/queryUserTask?autoSign=yes&P00001=' + cookie
    }
    $nobyda.get(URL, function(error, response, data) {
      if (error) {
        $nobyda.data = "签到失败: 接口请求出错 ‼️"
        console.log(`爱奇艺-${$nobyda.data} ${error}`)
      } else {
        const obj = JSON.parse(data)
        const Details = LogDetails ? `response:\n${data}` : ''
        if (obj.msg == "成功") {
          if (obj.data.signInfo.code == "A00000") {
            var AwardName = obj.data.signInfo.data.rewards[0].name;
            var quantity = obj.data.signInfo.data.rewards[0].value;
            var continued = obj.data.signInfo.data.cumulateSignDaysSum;
            $nobyda.data = "签到成功: " + AwardName + quantity + ", 累计签到" + continued + "天 🎉"
            console.log(`爱奇艺-${$nobyda.data} ${Details}`)
          } else {
            $nobyda.data = "签到失败: " + obj.data.signInfo.msg + " ⚠️"
            console.log(`爱奇艺-${$nobyda.data} ${Details}`)
          }
        } else {
          $nobyda.data = "签到失败: Cookie无效 ⚠️"
          console.log(`爱奇艺-${$nobyda.data} ${Details}`)		  
        }
      }
      resolve()
    })
    if (out) setTimeout(resolve, out)
  })
}

function Lottery(s) {
  return new Promise(resolve => {
    $nobyda.times++
      const URL = {
        url: 'https://iface2.iqiyi.com/aggregate/3.0/lottery_activity?app_k=0&app_v=0&platform_id=0&dev_os=0&dev_ua=0&net_sts=0&qyid=0&psp_uid=0&psp_cki=' + cookie + '&psp_status=0&secure_p=0&secure_v=0&req_sn=0'
      }
    setTimeout(() => {
      $nobyda.get(URL, async function(error, response, data) {
        if (error) {
          $nobyda.data += "\n抽奖失败: 接口请求出错 ‼️"
          console.log(`爱奇艺-抽奖失败: 接口请求出错 ‼️ ${error} (${$nobyda.times})`)
          //$nobyda.notify("爱奇艺", "", $nobyda.data)
        } else {
          const obj = JSON.parse(data);
          const Details = LogDetails ? `response:\n${data}` : ''
          $nobyda.last = data.match(/(机会|已经)用完/) ? true : false
          if (obj.awardName && obj.code == 0) {
            $nobyda.data += !$nobyda.last ? `\n抽奖成功: ${obj.awardName.replace(/《.+》/, "未中奖")} 🎉` : `\n抽奖失败: 今日已抽奖 ⚠️`
            console.log(`爱奇艺-抽奖明细: ${obj.awardName.replace(/《.+》/, "未中奖")} 🎉 (${$nobyda.times}) ${Details}`)
          } else if (data.match(/\"errorReason\"/)) {
            const msg = data.match(/msg=.+?\)/) ? data.match(/msg=(.+?)\)/)[1].replace(/用户(未登录|不存在)/, "Cookie无效") : ""
            $nobyda.data += `\n抽奖失败: ${msg || `未知错误`} ⚠️`
            console.log(`爱奇艺-抽奖失败: ${msg || `未知错误`} ⚠️ (${$nobyda.times}) ${msg ? Details : `response:\n${data}`}`)
          } else {
            $nobyda.data += "\n抽奖错误: 已输出日志 ⚠️"
            console.log(`爱奇艺-抽奖失败: \n${data} (${$nobyda.times})`)
          }
        }
        if (!$nobyda.last && $nobyda.times < 3) {
          await Lottery(s)
        } else {
          const expires = $nobyda.expire ? $nobyda.expire.replace(/\u5230\u671f/, "") : "获取失败 ⚠️"
          if (!$nobyda.isNode) $nobyda.notify("爱奇艺", "到期时间: " + expires, $nobyda.data);
          
		  $nobyda.notify('爱奇艺', "", `到期时间: ${expires}\n${$nobyda.data}`);
        }
        resolve()
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  })
}

function GetCookie() {
  var CKA = $request.url.match(/(psp_cki=|P00001=|authcookie=)([A-Za-z0-9]+)/)
  var CKB = JSON.stringify($request.headers).match(/(psp_cki=|P00001=|authcookie=)([A-Za-z0-9]+)/)
  var iQIYI = CKA || CKB || null
  var RA = $nobyda.read("CookieQY")
  if (iQIYI) {
    if (RA != iQIYI[2]) {
      var OldTime = $nobyda.read("CookieQYTime")
      if (!$nobyda.write(iQIYI[2], "CookieQY")) {
        $nobyda.notify(`${RA?`更新`:`首次写入`}爱奇艺签到Cookie失败‼️`, "", "")
      } else {
        if (!OldTime || OldTime && (Date.now() - OldTime) / 1000 >= 21600) {
          $nobyda.write(JSON.stringify(Date.now()), "CookieQYTime")
          $nobyda.notify(`${RA?`更新`:`首次写入`}爱奇艺签到Cookie成功 🎉`, "", "")
        } else {
          console.log(`\n更新爱奇艺Cookie成功! 🎉\n检测到频繁通知, 已转为输出日志`)
        }
      }
    } else {
      console.log("\n爱奇艺-与本机储存Cookie相同, 跳过写入 ⚠️")
    }
  } else {
    console.log("\n爱奇艺-请求不含Cookie, 跳过写入 ‼️")
  }
}

async function BarkNotify(c,k,t,b){for(let i=0;i<3;i++){console.log(`🔷Bark notify >> Start push (${i+1})`);const s=await new Promise((n)=>{c.post({url:'https://api.day.app/push',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:t,body:b,device_key:k,ext_params:{group:t}})},(e,r,d)=>r&&r.status==200?n(1):n(d||e))});if(s===1){console.log('✅Push success!');break}else{console.log(`❌Push failed! >> ${s.message||s}`)}}}

async function sendNotify(
  text,
  desp,
  params = {},
  author = '\n\n本通知 By：https://github.com/whyour/qinglong',
) {
  //提供6种通知
  desp += author; //增加作者信息，防止被贩卖等
  //await Promise.all([
  //  serverNotify(text, desp), //微信server酱
  //  pushPlusNotify(text, desp), //pushplus(推送加)
  //]);
  //由于上述两种微信通知需点击进去才能查看到详情，故text(标题内容)携带了账号序号以及昵称信息，方便不点击也可知道是哪个京东哪个活动
  text = text.match(/.*?(?=\s?-)/g) ? text.match(/.*?(?=\s?-)/g)[0] : text;
  await Promise.all([
    serverNotify(text, desp),
    tgBotNotify(text, desp), //telegram 机器人
  ]);
}

function serverNotify(text, desp, time = 2100) {
  return new Promise((resolve) => {
    if (SCKEY) {
      //微信server酱推送通知一个\n不会换行，需要两个\n才能换行，故做此替换
      desp = desp.replace(/[\n\r]/g, '\n\n');
      const options = {
        url: SCKEY.includes('SCT')
          ? `https://sctapi.ftqq.com/${SCKEY}.send`
          : `https://sc.ftqq.com/${SCKEY}.send`,
        body: `text=${text}&desp=${desp}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout,
      };
      setTimeout(() => {
        $nobyda.post(options, (err, resp, data) => {
          try {
            if (err) {
              console.log('发送通知调用API失败！！\n');
              console.log(err);
            } else {
              data = JSON.parse(data);
              //server酱和Server酱·Turbo版的返回json格式不太一样
              if (data.errno === 0 || data.data.errno === 0) {
                console.log('server酱发送通知消息成功🎉\n');
              } else if (data.errno === 1024) {
                // 一分钟内发送相同的内容会触发
                console.log(`server酱发送通知消息异常: ${data.errmsg}\n`);
              } else {
                console.log(
                  `server酱发送通知消息异常\n${JSON.stringify(data)}`,
                );
              }
            }
          } catch (e) {
            $.logErr(e, resp);
          } finally {
            resolve(data);
          }
        });
      }, time);
    } else {
      resolve();
    }
  });
}

function tgBotNotify(text, desp) {
  return new Promise((resolve) => {
    if (TG_BOT_TOKEN && TG_USER_ID) {
      const options = {
        url: `https://${TG_API_HOST}/bot${TG_BOT_TOKEN}/sendMessage`,
        body: `chat_id=${TG_USER_ID}&text=${text}\n\n${desp}&disable_web_page_preview=true`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout,
      };
      if (TG_PROXY_HOST && TG_PROXY_PORT) {
        const tunnel = require('tunnel');
        const agent = {
          https: tunnel.httpsOverHttp({
            proxy: {
              host: TG_PROXY_HOST,
              port: TG_PROXY_PORT * 1,
              proxyAuth: TG_PROXY_AUTH,
            },
          }),
        };
        Object.assign(options, { agent });
      }
      $nobyda.post(options, (err, resp, data) => {
        try {
          if (err) {
            console.log('telegram发送通知消息失败！！\n');
            console.log(err);
          } else {
            data = JSON.parse(data);
            if (data.ok) {
              console.log('Telegram发送通知消息成功🎉。\n');
            } else if (data.error_code === 400) {
              console.log(
                '请主动给bot发送一条消息并检查接收用户ID是否正确。\n',
              );
            } else if (data.error_code === 401) {
              console.log('Telegram bot token 填写错误。\n');
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve(data);
        }
      });
    } else {
      resolve();
    }
  });
}

function nobyda() {
  const times = 0
  const start = Date.now()
  const isRequest = typeof $request != "undefined"
  const isSurge = typeof $httpClient != "undefined"
  const isQuanX = typeof $task != "undefined"
  const isLoon = typeof $loon != "undefined"
  const isJSBox = typeof $app != "undefined" && typeof $http != "undefined"
  const isNode = typeof require == "function" && !isJSBox;
  const node = (() => {
    if (isNode) {
      const request = require('request');
      return ({
        request
      })
    } else {
      return (null)
    }
  })()
  const notify = (title, subtitle, message) => {
    if (isQuanX) $notify(title, subtitle, message)
    if (isSurge) $notification.post(title, subtitle, message)
    if (isNode) log('\n' + title + '\n' + subtitle + '\n' + message)
    if (isJSBox) $push.schedule({
      title: title,
      body: subtitle ? subtitle + "\n" + message : message
    })
	
	sendNotify(title,message)
  }
  const write = (value, key) => {
    if (isQuanX) return $prefs.setValueForKey(value, key)
    if (isSurge) return $persistentStore.write(value, key)
  }
  const read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key)
    if (isSurge) return $persistentStore.read(key)
  }
  const adapterStatus = (response) => {
    if (response) {
      if (response.status) {
        response["statusCode"] = response.status
      } else if (response.statusCode) {
        response["status"] = response.statusCode
      }
    }
    return response
  }
  const get = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "GET"
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) $httpClient.get(options, (error, response, body) => {
      callback(error, adapterStatus(response), body)
    })
    if (isNode) {
      node.request(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function(resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data);
        callback(error, adapterStatus(resp.response), body)
      };
      $http.get(options);
    }
  }
  const post = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "POST"
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) {
      options.headers['X-Surge-Skip-Scripting'] = false
      $httpClient.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isNode) {
      node.request.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function(resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data)
        callback(error, adapterStatus(resp.response), body)
      }
      $http.post(options);
    }
  }

  const log = (message) => console.log(message)
  const time = () => {
    const end = ((Date.now() - start) / 1000).toFixed(2)
    return console.log('\n签到用时: ' + end + ' 秒')
  }
  const done = (value = {}) => {
    if (isQuanX) return $done(value)
    if (isSurge) isRequest ? $done(value) : $done()
  }
  return {
    isRequest,
    isNode,
    notify,
    write,
    read,
    get,
    post,
    log,
    time,
    times,
    done
  }
};