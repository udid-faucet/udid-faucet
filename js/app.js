import { FreeUDID_abi, FreeUDID_Addr, UDID_abi, UDID_Addr } from "./abi_address.js"
import "./jquery.i18n.js";
// import {white_list} from "./white_list.js"
import {detectBroswer, showMsg, jumpToEtherscan, languageSelect, formatDate} from "./utils.js"

window.onload = async () => {
    window.app = {};
    window.app.update = {}
    $("#network").click(async () => {
        await start()
    })
    await start()
}





async function start() {
   
    detectBroswer()
    languageSelect("en")
    window.BN = web3.utils.BN
    let accounts = await web3.eth.getAccounts();
    $("#user_address").html(accounts[0]);
    window.app.current_account = accounts[0];

    let network = await web3.eth.net.getNetworkType();
    $("#network_type").html(network)
    window.app.fu = new web3.eth.Contract(FreeUDID_abi, FreeUDID_Addr)
    window.app.udid = new web3.eth.Contract(UDID_abi, UDID_Addr)
   

    await injectContractBaseInfo()

    // if (window.app.current_account == window.app.owner) {
    //     $("#contract_owner").show()
    // }
    // if (window.app.current_account == window.app.fundAddress) {
    $("#hop_funder").show()
    // }
    // $("#owner_addr").html(window.app.owner)
    $("#fund_addr").html(window.app.current_account)

    let now = (new Date()).getTime();
    // let width = getProgress(now) + '%'
    // $("#progress").css('width', width)
    // $('#progress_hop').html(width)

    //calculate new time
    // let day = 24 * 60 * 60 * 1000
    // let times = [window.app.exchangeEndTime + day / 2, window.app.onlineTime]
    // for (var i = 0; i < 11; i++) {
    //     times.push(times[times.length - 1] + 30 * day)
    // }
    // window.app.times = times
    // for (var i in times) {
    //     if (now < times[i])
    //         $("#next_release").html(formatDate(new Date(times[i])))
    //     break;
    // }

    ethereum.on('accountsChanged', async () => {
        location.reload()
    })

    ethereum.on('chainChanged', async () => {
        location.reload()
    })

    // window.app.firstLimit = firstLimit
    // window.app.commonLimit = commonLimit

    //init
    await syncBalance()
    // showExchangeRate()
    attachEvents()
}

async function injectContractBaseInfo() {
    // let p1 = window.app.exchange.methods.mutiplier().call()
    // let p2 = window.app.exchange.methods.HOP_FUND().call()
    // let p3 = window.app.exchange.methods.owner().call()
    // let p4 = window.app.hop.methods.totalSupply().call()
    // let p5 = window.app.exchange.methods.ON_EXCHANGE_TIME().call()
    // let p6 = window.app.exchange.methods.ON_EXCHANGE().call()
    // let p7 = window.app.usdt.methods._totalSupply().call()
    // let values = await Promise.all([p1, p2, p3, p4, p5, p6, p7])
    // window.app.mutipler = values[0]
    // window.app.fundAddress = values[1]
    // window.app.owner = values[2]
    // window.app.totalHop = values[3]
    // window.app.onExchangeTime = values[4] * 1000
    // window.app.onExchange = values[5]
    // window.app.totalSupply = values[6]

    // window.app.udid.methods.balance
    

    let p1 = window.app.fu.methods.LastTime().call({from:window.app.current_account})
    let p2 = window.app.udid.methods.balanceOf(window.app.current_account).call()

    let values = await Promise.all([p1,p2])
    window.app.lastAccTime = values[0]
    window.app.udidBalance = values[1]

    console.log("---->",window.app.lastAccTime)

    $("#user_address").html(window.app.current_account + "✅")
    console.log("balance",window.app.udidBalance)

    var b = parseInt(window.app.udidBalance)/1000000000000000
    var bf = b/1000.0

    $("#udid_balance").html(""+String(bf))
    console.log("lasttime",window.app.lastAccTime)
    if (parseInt(window.app.lastAccTime) > 0){

        Date.prototype.Format = function (fmt) { 
            var o = {
                "M+": this.getMonth() + 1, //月份 
                "d+": this.getDate(), //日 
                "h+": this.getHours(), //小时 
                "m+": this.getMinutes(), //分 
                "s+": this.getSeconds(), //秒 
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
                "S": this.getMilliseconds() //毫秒 
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }

        var ld = new Date(parseInt(window.app.lastAccTime)*1000)
        $("#last_Time").html(ld.Format("yyyy-MM-dd hh:mm"));
        console.log(ld.toLocaleString())
    }else{
        $("#last_Time").html("you haven't get free udid");
    }

}




async function syncBalance() {
    {
        // let currentTime = Math.floor(Date.now() / 1000)
        let account = window.app.current_account
        let p1 = window.app.fu.methods.LastTime().call({from:window.app.current_account})
        let p2 = window.app.udid.methods.balanceOf(account).call()
        // let p2 = window.app.usdt.methods.balanceOf(account).call()
        // let p3 = window.app.exchange.methods.balanceDetail(account).call()
        // let p4 = window.app.exchange.methods.accountInfo(account, currentTime).call()
        // let p5 = window.app.usdt.methods.allowance(window.app.current_account, exchange_address).call()
        let values = await Promise.all([p1,p2])
        window.app.lastAccTime = values[0]
        window.app.udidBalance = values[1]
       
        // window.app.usdtBalance = values[1]
        // window.app.balanceDetail = values[2]
        // window.app.claimInfo = values[3]
        // window.app.allowance = values[4]

        // $("#hop_balance").html(window.app.hopBalance / 1e18 + "")
        // $("#usdt_balance").html(window.app.usdtBalance / 1e6 + "")
        // $("#Total_balance").html(window.app.balanceDetail.totalBalance / 1e18 + "")
        // $("#claimable").html(window.app.claimInfo[2] / 1e18 + "")
        // $("#wait_claim").html((window.app.claimInfo[0] - window.app.claimInfo[1]) / 1e18 + "")

        
        $("#user_address").html(window.app.current_account + "✅")
        // $("udid_balance").html(window.app.udidBalance)
        var b = parseInt(window.app.udidBalance)/1000000000000000
        var bf = b/1000.0
    
        console.log("balance",window.app.udidBalance)
        $("#udid_balance").html(String(bf))
        console.log("lasttime",window.app.lastAccTime)

        if (parseInt(window.app.lastAccTime) > 0){
            Date.prototype.Format = function (fmt) { 
                var o = {
                    "M+": this.getMonth() + 1, //月份 
                    "d+": this.getDate(), //日 
                    "h+": this.getHours(), //小时 
                    "m+": this.getMinutes(), //分 
                    "s+": this.getSeconds(), //秒 
                    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
                    "S": this.getMilliseconds() //毫秒 
                };
                if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            }
            var ld = new Date(parseInt(window.app.lastAccTime)*1000)
            $("#last_Time").html(ld.Format("yyyy-MM-dd hh:mm"));
            console.log(""+ld.Format("yyyy-MM-dd hh:mm"))
        }else{
            $("#last_Time").html("you haven't get free udid");
        }
       
    
    }
}

function showExchangeRate() {
    $("#rate").html(window.app.mutipler / 1e12)
}

function attachEvents() {

    // $("#input_usdt").keyup(() => {
    //     let number = $("#input_usdt").val()
    //     $("#hop_amount").html(number * window.app.mutipler / 1e12)
    // })

    // $("#all").click(() => {
    //     window.app.usdt.methods.balanceOf(window.app.current_account).call().then(x => {
    //         $("#input_usdt").val(x / 1e6)
    //         $("#input_usdt").keyup()
    //     })
    // })

    $("#exchange").click(async () => {
        try {
            await window.app.fu.methods.TransferUDID().send({from: window.app.current_account})
                    showMsg("成功", "success")
                    await syncBalance()
        } catch (error) {
            showMsg("错误", "failed")
            // jumpToEtherscan(window.app.current_account)

        }
        

        // if(!white_list.includes(window.app.current_account)){
        //     showMsg("当前账户不在白名单", "current account is not in whitelist")
        //     return
        // }

        // let number = parseInt(parseFloat($("#input_usdt").val()) * 1e6)
        // if(isNaN(number) || number == 0){
        //     showMsg("请输入大于0的数字/浮点数","please input a number greater than 0")
        //     return
        // }
        
        // let balance = window.app.usdtBalance

        // if (number - balance > 0) {
        //     showMsg("usdt不足", "insufficient usdt")
        //     return
        // }

        // let cost = number
        // let address = window.app.current_account
        // let allowance = await window.app.usdt.methods.allowance(address, exchange_address).call()

        // if (allowance < number) {

        //     showMsg("授权 USDT", "approve USDT")
        //     try {
        //         await window.app.usdt.methods.approve(exchange_address, window.app.totalSupply).send({ from: address })
        //         showMsg("授权成功", "approve succeed")
        //     } catch (error) {
        //         jumpToEtherscan(address)
        //     }
        // } else {

        //     let firstLimitHop = (window.app.mutipler / 1e12) * firstLimit
        //     let limitHop = (window.app.mutipler / 1e12) * commonLimit

        //     if (window.app.balanceDetail.totalBalance / 1e18 === 0 && window.app.balanceDetail.claimed / 1e18 === 0) {

        //         if (cost < firstLimitHop) {
        //             showMsg(`首次购买不应小于${firstLimitHop} HOP`, `The number of HOP must be greater than ${firstLimitHop}`)
        //             return
        //         }
                
        //     } else {

        //         if (cost < limitHop) {
        //             showMsg(`购买不应小于${limitHop}HOP`, `The number of HOP must be greater than ${limitHop}`)
        //             return
        //         }
        //     }

        //     try {
        //         await window.app.exchange.methods.exchangeForHOP(cost).send({ from: address })
        //         showMsg("购买成功", "exchange succeed")
        //         await syncBalance()
        //     } catch (error) {
        //         jumpToEtherscan(address)
        //     }
        // }



    })

    // $("#claim_btn").click(async () => {
    //     try{
    //         await window.app.exchange.methods.claimHOP(window.app.claimInfo[2]).send({ from: window.app.current_account })
    //         showMsg("收取成功", "claim succeed")
    //         await syncBalance()
    //     }catch (error){
    //         jumpToEtherscan(address)
    //     }
    // })

    // $("#approve_hop").click(() => {
    //     window.app.hop.methods.approve(exchange_address, window.app.totalHop).send({ from: window.app.fundAddress })
    //         .then(async () => {
    //             showMsg("授权成功","approve success!")
    //         })
    // })

    // $("#set_rate").click(() => {
    //     let r = $("#new_rate").val()
    //     window.app.exchange.methods.setRate(r).send({ from: window.app.owner })
    //         .then(async () => {
    //             showMsg("汇率变化","rate changed!")
    //             await showExchangeRate()
    //         })
    // })

    // $("#change_address").click(() => {
    //     let f_address = $("#f_addr").val()
    //     let b_address = $("#b_addr").val()
    //     window.app.exchange.methods.changeAddress(f_address, b_address).send({ from: window.app.owner })
    //         .then(() => {
    //             showMsg("地址改变，请刷新","address changed, please reload")
    //         })
    // })

    // $("#append").click(() => {
    //     let address = $("#append_address").val()
    //     if (!web3.utils.isAddress(address)) {
    //         showMsg("无效的账户地址","not an address!")
    //         return
    //     }
    //     if (address in window.app.update) {
    //         showMsg("地址已经存在","address already inserted!")
    //         return
    //     }
    //     let value = new BN($("#append_value").val()).mul(new BN(1e9)).mul(new BN(1e9)).toString()
    //     let text = $("#sell_record").val()
    //     if (text != "") {
    //         text = text + "\n"
    //     }
    //     text = text + address + "\t" + value.toString()
    //     $("#sell_record").val(text)
    //     $("#append_address").val("")
    //     $("#append_value").val("")
    //     //reconstruct update
    //     let lines = text.split("\n")
    //     window.app.update = {}
    //     for (var index in lines) {
    //         let line = lines[index]
    //         let pair = line.split("\t")
    //         let addr = pair[0]
    //         let balance = pair[1]
    //         if (addr in window.app.update) {
    //             showMsg("地址已经插入","address already inserted")
    //             return
    //         }
    //         window.app.update[addr] = balance
    //     }
    // })

    // $("#update").click(() => {
    //     let text = $("#sell_record").val()
    //     let lines = text.split("\n")
    //     window.app.update = {}
    //     for (var index in lines) {
    //         let line = lines[index]
    //         let pair = line.split("\t")
    //         let addr = pair[0]
    //         let balance = pair[1]
    //         if (addr in window.app.update) {
    //             showMsg("地址已经插入","address already inserted")
    //             return
    //         }
    //         window.app.update[addr] = balance
    //     }
    //     let addr_array = []
    //     let val_array = []
    //     for (var a in window.app.update) {
    //         addr_array.push(a)
    //         val_array.push(window.app.update[a])
    //     }
    //     let address = window.app.current_account
    //     window.app.exchange.methods.editBalance(addr_array, val_array).send({ from: address }).then(() => {
    //         showMsg("数据成功插入","data inserted")
    //     })
    // })

    // $("#on_exchange_btn").click(()=>{
    //     let address = window.app.current_account
    //     window.app.exchange.methods.onExchange().send({from:address }).then(()=>{
    //         showMsg("声明上交易所", "token is on exchange")
    //     })
    // })

    var defaultLang = "en"

    // languageSelect(defaultLang);
    var lang = $("#lang")
    lang.change(() => {
        defaultLang = lang.val()
        languageSelect(defaultLang)
    })

}