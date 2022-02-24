/*
东东种植乐园

更新时间: 2022.2.23
*/
var CheckinMsg = ''
var isvToken = '',
    token = '',
    bearToken = ''
var base_api_url = 'https://xinruismzd-isv.isvjcloud.com'
let plant_id = 0,
    has_daily_pay_number = 0,
    daily_pay_number = 10

var barkKey = '' //Bark APP 通知推送Key
var barkServer = '' //Bark APP 通知服务端地址(默认官方)

let timeout = 15000
let SCKEY = ''
let TG_BOT_TOKEN = ''
let TG_USER_ID = ''
let TG_API_HOST = 'api.telegram.org'
let TG_PROXY_HOST = '' //例如:127.0.0.1(环境变量名:TG_PROXY_HOST)
let TG_PROXY_PORT = '' //例如:1080(环境变量名:TG_PROXY_PORT)
let TG_PROXY_AUTH = '' //tg代理配置认证参数

if (process.env.PUSH_KEY) {
    SCKEY = process.env.PUSH_KEY
}
if (process.env.TG_BOT_TOKEN) {
    TG_BOT_TOKEN = process.env.TG_BOT_TOKEN
}
if (process.env.TG_USER_ID) {
    TG_USER_ID = process.env.TG_USER_ID
}
if (process.env.TG_PROXY_AUTH) TG_PROXY_AUTH = process.env.TG_PROXY_AUTH
if (process.env.TG_PROXY_HOST) TG_PROXY_HOST = process.env.TG_PROXY_HOST
if (process.env.TG_PROXY_PORT) TG_PROXY_PORT = process.env.TG_PROXY_PORT
if (process.env.TG_API_HOST) TG_API_HOST = process.env.TG_API_HOST

var $nobyda = nobyda()

const $ = new Env('健康种植园')
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : ''

let cookiesArr = [],
    cookie = ''

if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
} else {
    cookiesArr = [
        $.getdata('CookieJD'),
        $.getdata('CookieJD2'),
        ...jsonParse($.getdata('CookiesJD') || '[]').map((item) => item.cookie),
    ].filter((item) => !!item)
}

;(async () => {
    if (!cookiesArr[0]) {
        $.msg(
            $.name,
            '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取',
            'https://bean.m.jd.com/',
            { 'open-url': 'https://bean.m.jd.com/' }
        )

        return
    }

    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            plant_id = 0
            has_daily_pay_number = 0
            isvToken = ''
            token = ''
            bearToken = ''

            cookie = cookiesArr[i]

            await getIsvToken()

            if (isvToken.length > 10) await getIsvToken2()

            if (token.length > 10) await getToken()

            if (bearToken.length > 10) await GetUserInfo()

            if (plant_id > 0) {
                console.log(`剩余充能量次数: ${has_daily_pay_number}`)
                for (let i = 0; i < has_daily_pay_number; i++) {
                    await Sleep(3000)
                    console.log(`进行第${i + 1}次充能量`)
                    await Plant()
                }
            }
        }
    }
})().finally(() => {
    $nobyda.done()
})

async function getIsvToken() {
    let config = {
        url: 'https://api.m.jd.com/client.action?functionId=genToken',
        body: 'body=%7B%22to%22%3A%22https%3A%5C/%5C/xinruimz-isv.isvjcloud.com%5C/?channel%3Dmeizhuangguandibudaohang%26collectionId%3D96%26tttparams%3DYEyYQjMIeyJnTG5nIjoiMTE4Ljc2MjQyMSIsImdMYXQiOiIzMi4yNDE4ODIifQ8%253D%253D%26un_area%3D12_904_908_57903%26lng%3D118.7159742308471%26lat%3D32.2010317443041%22%2C%22action%22%3A%22to%22%7D&build=167490&client=apple&clientVersion=9.3.2&openudid=53f4d9c70c1c81f1c8769d2fe2fef0190a3f60d2&osVersion=14.2&partner=apple&rfs=0000&scope=01&sign=b0aac3dd04b1c6d68cee3d425e27f480&st=1610161913667&sv=111',
        headers: {
            Host: 'api.m.jd.com',
            accept: '*/*',
            'user-agent': 'JD4iPhone/167490 (iPhone; iOS 14.2; Scale/3.00)',
            'accept-language':
                'zh-Hans-JP;q=1, en-JP;q=0.9, zh-Hant-TW;q=0.8, ja-JP;q=0.7, en-US;q=0.6',
            'content-type': 'application/x-www-form-urlencoded',
            Cookie: cookie,
        },
    }
    return new Promise((resolve) => {
        $nobyda.post(config, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data)
                    isvToken = data.tokenKey
                    console.log(`【isvToken】: ${isvToken}`)
                }
            } catch (e) {
                console.log(data)
            } finally {
                resolve(data)
            }
        })
    })
}

async function getIsvToken2() {
    let config = {
        url: 'https://api.m.jd.com/client.action?functionId=isvObfuscator',
        body: 'body=%7B%22url%22%3A%22https%3A%5C/%5C/xinruimz-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167490&client=apple&clientVersion=9.3.2&openudid=53f4d9c70c1c81f1c8769d2fe2fef0190a3f60d2&osVersion=14.2&partner=apple&rfs=0000&scope=01&sign=6eb3237cff376c07a11c1e185761d073&st=1610161927336&sv=102&uuid=hjudwgohxzVu96krv/T6Hg%3D%3D',
        headers: {
            Host: 'api.m.jd.com',
            accept: '*/*',
            'user-agent': 'JD4iPhone/167490 (iPhone; iOS 14.2; Scale/3.00)',
            'accept-language':
                'zh-Hans-JP;q=1, en-JP;q=0.9, zh-Hant-TW;q=0.8, ja-JP;q=0.7, en-US;q=0.6',
            'content-type': 'application/x-www-form-urlencoded',
            Cookie: cookie,
        },
    }
    return new Promise((resolve) => {
        $nobyda.post(config, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data)
                    token = data.token
                    console.log(`【token】: ${token}`)
                }
            } catch (e) {
                console.log(data)
            } finally {
                resolve(data)
            }
        })
    })
}

async function getToken() {
    let config = {
        url: base_api_url + '/api/auth',
        body: JSON.stringify({ token: token, source: '01' }),
        headers: {
            Host: 'xinruismzd-isv.isvjcloud.com',
            Accept: 'application/x.jd-school-island.v1+json',
            Source: '02',
            'Accept-Language': 'zh-cn',
            'Content-Type': 'application/json;charset=utf-8',
            Origin: base_api_url,
            'User-Agent':
                'jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            Referer: base_api_url,
            Authorization: 'Bearer undefined',
            Cookie: cookie,
        },
    }
    return new Promise((resolve) => {
        $nobyda.post(config, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`API请求失败，请检查网路重试`)
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data)
                    bearToken = data.access_token
                    console.log(`【bearToken】: ${bearToken}`)
                }
            } catch (e) {
                console.log(data)
            } finally {
                resolve(data)
            }
        })
    })
}

async function GetUserInfo() {
    var config = {
        url: base_api_url + '/api/get_home_info',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + bearToken,
        },
    }
    return new Promise((resolve) => {
        $nobyda.get(config, function (error, response, data) {
            try {
                // console.log(data)
                parseData(data)
            } catch (e) {
                console.log(data)
            } finally {
                resolve(data)
            }
        })
    })
}

async function Plant() {
    const post_data = {
        plant_id,
    }
    let config = {
        url: base_api_url + '/api/add_growth_value',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + bearToken,
        },
        body: JSON.stringify(post_data),
    }
    return new Promise((resolve) => {
        $nobyda.post(config, function (error, response, data) {
            let obj
            try {
                if (error) throw new Error(`接口请求出错 ‼️`)
                obj = JSON.parse(data)

                if (obj.plant_info.id) {
                    CheckinMsg = `注入能量成功`
                } else {
                    CheckinMsg = `注入能量失败`
                }
            } catch (e) {
                CheckinMsg = obj.message
            }

            //$nobyda.notify(`东东健康乐园`, '', CheckinMsg)
            resolve()
        })
    })
}

function parseData(data) {
    //data = '{ "plant_info": { "id": 113113, "user_id": 291298, "prize_id": 32, "coins": 40000, "position": 4, "status": 0, "created_at": "2022-02-23 14:53:23", "updated_at": "2022-02-23 14:54:52" }, "user_coins": 1498378, "send_prize": [] }    '

    const obj = JSON.parse(data)
    daily_pay_number = parseInt(obj.user.daily_pay_number)
    has_daily_pay_number =
        daily_pay_number - parseInt(obj.user.has_daily_pay_number)

    for (let i = 1; i < 10; i++) {
        if (obj.plant[i].data.id) {
            plant_id = obj.plant[i].data.id

            // break
        }
    }

    console.log(plant_id)
}

async function Sleep(timeout) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout)
    })
}

async function sendNotify(
    text,
    desp,
    params = {},
    author = '\n\n本通知 By：https://github.com/whyour/qinglong'
) {
    //提供6种通知
    desp += author //增加作者信息，防止被贩卖等
    //await Promise.all([
    //  serverNotify(text, desp), //微信server酱
    //  pushPlusNotify(text, desp), //pushplus(推送加)
    //]);
    //由于上述两种微信通知需点击进去才能查看到详情，故text(标题内容)携带了账号序号以及昵称信息，方便不点击也可知道是哪个京东哪个活动
    text = text.match(/.*?(?=\s?-)/g) ? text.match(/.*?(?=\s?-)/g)[0] : text
    await Promise.all([
        //serverNotify(text, desp),
        tgBotNotify(text, desp), //telegram 机器人
    ])
}

function serverNotify(text, desp, time = 2100) {
    return new Promise((resolve) => {
        if (SCKEY) {
            //微信server酱推送通知一个\n不会换行，需要两个\n才能换行，故做此替换
            desp = desp.replace(/[\n\r]/g, '\n\n')
            const options = {
                url: SCKEY.includes('SCT')
                    ? `https://sctapi.ftqq.com/${SCKEY}.send`
                    : `https://sc.ftqq.com/${SCKEY}.send`,
                body: `text=${text}&desp=${desp}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                timeout,
            }
            setTimeout(() => {
                $nobyda.post(options, (err, resp, data) => {
                    try {
                        if (err) {
                            console.log('发送通知调用API失败！！\n')
                            console.log(err)
                        } else {
                            data = JSON.parse(data)
                            //server酱和Server酱·Turbo版的返回json格式不太一样
                            if (data.errno === 0 || data.data.errno === 0) {
                                console.log('server酱发送通知消息成功🎉\n')
                            } else if (data.errno === 1024) {
                                // 一分钟内发送相同的内容会触发
                                console.log(
                                    `server酱发送通知消息异常: ${data.errmsg}\n`
                                )
                            } else {
                                console.log(
                                    `server酱发送通知消息异常\n${JSON.stringify(
                                        data
                                    )}`
                                )
                            }
                        }
                    } catch (e) {
                        $.logErr(e, resp)
                    } finally {
                        resolve(data)
                    }
                })
            }, time)
        } else {
            resolve()
        }
    })
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
            }
            if (TG_PROXY_HOST && TG_PROXY_PORT) {
                const tunnel = require('tunnel')
                const agent = {
                    https: tunnel.httpsOverHttp({
                        proxy: {
                            host: TG_PROXY_HOST,
                            port: TG_PROXY_PORT * 1,
                            proxyAuth: TG_PROXY_AUTH,
                        },
                    }),
                }
                Object.assign(options, { agent })
            }
            $nobyda.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('telegram发送通知消息失败！！\n')
                        console.log(err)
                    } else {
                        data = JSON.parse(data)
                        if (data.ok) {
                            console.log('Telegram发送通知消息成功🎉。\n')
                        } else if (data.error_code === 400) {
                            console.log(
                                '请主动给bot发送一条消息并检查接收用户ID是否正确。\n'
                            )
                        } else if (data.error_code === 401) {
                            console.log('Telegram bot token 填写错误。\n')
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp)
                } finally {
                    resolve(data)
                }
            })
        } else {
            resolve()
        }
    })
}

function nobyda() {
    const times = 0
    const start = Date.now()
    const isRequest = typeof $request != 'undefined'
    const isSurge = typeof $httpClient != 'undefined'
    const isQuanX = typeof $task != 'undefined'
    const isLoon = typeof $loon != 'undefined'
    const isJSBox = typeof $app != 'undefined' && typeof $http != 'undefined'
    const isNode = typeof require == 'function' && !isJSBox
    const node = (() => {
        if (isNode) {
            const request = require('request')
            return {
                request,
            }
        } else {
            return null
        }
    })()
    const notify = (title, subtitle, message) => {
        if (isQuanX) $notify(title, subtitle, message)
        if (isSurge) $notification.post(title, subtitle, message)
        if (isNode) log('\n' + title + '\n' + subtitle + '\n' + message)
        if (isJSBox)
            $push.schedule({
                title: title,
                body: subtitle ? subtitle + '\n' + message : message,
            })

        sendNotify(title, message)
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
                response['statusCode'] = response.status
            } else if (response.statusCode) {
                response['status'] = response.statusCode
            }
        }
        return response
    }
    const get = (options, callback) => {
        if (isQuanX) {
            if (typeof options == 'string')
                options = {
                    url: options,
                }
            options['method'] = 'GET'
            $task.fetch(options).then(
                (response) => {
                    callback(null, adapterStatus(response), response.body)
                },
                (reason) => callback(reason.error, null, null)
            )
        }
        if (isSurge)
            $httpClient.get(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        if (isNode) {
            node.request(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
        if (isJSBox) {
            if (typeof options == 'string')
                options = {
                    url: options,
                }
            options['header'] = options['headers']
            options['handler'] = function (resp) {
                let error = resp.error
                if (error) error = JSON.stringify(resp.error)
                let body = resp.data
                if (typeof body == 'object') body = JSON.stringify(resp.data)
                callback(error, adapterStatus(resp.response), body)
            }
            $http.get(options)
        }
    }
    const post = (options, callback) => {
        if (isQuanX) {
            if (typeof options == 'string')
                options = {
                    url: options,
                }
            options['method'] = 'POST'
            $task.fetch(options).then(
                (response) => {
                    callback(null, adapterStatus(response), response.body)
                },
                (reason) => callback(reason.error, null, null)
            )
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
            if (typeof options == 'string')
                options = {
                    url: options,
                }
            options['header'] = options['headers']
            options['handler'] = function (resp) {
                let error = resp.error
                if (error) error = JSON.stringify(resp.error)
                let body = resp.data
                if (typeof body == 'object') body = JSON.stringify(resp.data)
                callback(error, adapterStatus(resp.response), body)
            }
            $http.post(options)
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
        done,
    }
}

function k(e, t) {
    var a = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
        n = a.split,
        c = void 0 === n ? '|' : n,
        r = a.sort,
        s = void 0 === r || r,
        o = a.splitSecretKey,
        i = void 0 !== o && o,
        l = s ? Object.keys(t).sort() : Object.keys(t),
        u =
            l
                .map(function (e) {
                    return ''.concat(e, '=').concat(t[e])
                })
                .join(c) +
            (i ? c : '') +
            e
    return md5(u)
}

// Modified from https://github.com/blueimp/JavaScript-MD5
function md5(string) {
    function RotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits))
    }
    function AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult
        lX8 = lX & 0x80000000
        lY8 = lY & 0x80000000
        lX4 = lX & 0x40000000
        lY4 = lY & 0x40000000
        lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff)
        if (lX4 & lY4) {
            return lResult ^ 0x80000000 ^ lX8 ^ lY8
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return lResult ^ 0xc0000000 ^ lX8 ^ lY8
            } else {
                return lResult ^ 0x40000000 ^ lX8 ^ lY8
            }
        } else {
            return lResult ^ lX8 ^ lY8
        }
    }
    function F(x, y, z) {
        return (x & y) | (~x & z)
    }
    function G(x, y, z) {
        return (x & z) | (y & ~z)
    }
    function H(x, y, z) {
        return x ^ y ^ z
    }
    function I(x, y, z) {
        return y ^ (x | ~z)
    }
    function FF(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac))
        return AddUnsigned(RotateLeft(a, s), b)
    }
    function GG(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac))
        return AddUnsigned(RotateLeft(a, s), b)
    }
    function HH(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac))
        return AddUnsigned(RotateLeft(a, s), b)
    }
    function II(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac))
        return AddUnsigned(RotateLeft(a, s), b)
    }
    function ConvertToWordArray(string) {
        var lWordCount
        var lMessageLength = string.length
        var lNumberOfWords_temp1 = lMessageLength + 8
        var lNumberOfWords_temp2 =
            (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16
        var lWordArray = Array(lNumberOfWords - 1)
        var lBytePosition = 0
        var lByteCount = 0
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4
            lBytePosition = (lByteCount % 4) * 8
            lWordArray[lWordCount] =
                lWordArray[lWordCount] |
                (string.charCodeAt(lByteCount) << lBytePosition)
            lByteCount++
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4
        lBytePosition = (lByteCount % 4) * 8
        lWordArray[lWordCount] =
            lWordArray[lWordCount] | (0x80 << lBytePosition)
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29
        return lWordArray
    }
    function WordToHex(lValue) {
        var WordToHexValue = '',
            WordToHexValue_temp = '',
            lByte,
            lCount
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255
            WordToHexValue_temp = '0' + lByte.toString(16)
            WordToHexValue =
                WordToHexValue +
                WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2)
        }
        return WordToHexValue
    }
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, '\n')
        var utftext = ''
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n)
            if (c < 128) {
                utftext += String.fromCharCode(c)
            } else if (c > 127 && c < 2048) {
                utftext += String.fromCharCode((c >> 6) | 192)
                utftext += String.fromCharCode((c & 63) | 128)
            } else {
                utftext += String.fromCharCode((c >> 12) | 224)
                utftext += String.fromCharCode(((c >> 6) & 63) | 128)
                utftext += String.fromCharCode((c & 63) | 128)
            }
        }
        return utftext
    }
    var x = Array()
    var k, AA, BB, CC, DD, a, b, c, d
    var S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22
    var S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20
    var S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23
    var S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21
    string = Utf8Encode(string)
    x = ConvertToWordArray(string)
    a = 0x67452301
    b = 0xefcdab89
    c = 0x98badcfe
    d = 0x10325476
    for (k = 0; k < x.length; k += 16) {
        AA = a
        BB = b
        CC = c
        DD = d
        a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478)
        d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756)
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070db)
        b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee)
        a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf)
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a)
        c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613)
        b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501)
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8)
        d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af)
        c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1)
        b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be)
        a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122)
        d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193)
        c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e)
        b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821)
        a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562)
        d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340)
        c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51)
        b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa)
        a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d)
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453)
        c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681)
        b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8)
        a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6)
        d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6)
        c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87)
        b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed)
        a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905)
        d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8)
        c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9)
        b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a)
        a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942)
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681)
        c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122)
        b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c)
        a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44)
        d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9)
        c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60)
        b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70)
        a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6)
        d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa)
        c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085)
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05)
        a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039)
        d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5)
        c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8)
        b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665)
        a = II(a, b, c, d, x[k + 0], S41, 0xf4292244)
        d = II(d, a, b, c, x[k + 7], S42, 0x432aff97)
        c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7)
        b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039)
        a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3)
        d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92)
        c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d)
        b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1)
        a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f)
        d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0)
        c = II(c, d, a, b, x[k + 6], S43, 0xa3014314)
        b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1)
        a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82)
        d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235)
        c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb)
        b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391)
        a = AddUnsigned(a, AA)
        b = AddUnsigned(b, BB)
        c = AddUnsigned(c, CC)
        d = AddUnsigned(d, DD)
    }
    var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d)
    return temp.toLowerCase()
}

function w() {
    var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        t = []
    return (
        Object.keys(e).forEach(function (a) {
            t.push(''.concat(a, '=').concat(e[a]))
        }),
        t.join('&')
    )
}

// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
