import { HOP_abi, HOP_address, USDT_abi, USDT_address, investor_abi, investor_address } from "./abi_address.js"
import "./jquery.i18n.js";
import { investor_list } from "./white_list.js"
import { detectBroswer, showMsg, jumpToEtherscan, languageSelect, getProgress, formatDate, firstLimit, commonLimit } from "./utils.js"


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
    window.app.hop = new web3.eth.Contract(HOP_abi, HOP_address)
    window.app.usdt = new web3.eth.Contract(USDT_abi, USDT_address)
    window.app.investor = new web3.eth.Contract(investor_abi, investor_address)

    await injectContractBaseInfo()

    interceptNormalUser()

    if (window.app.current_account == window.app.owner) {
        $("#contract_owner").show()
    }
    if (window.app.current_account == window.app.fundAddress) {
        $("#hop_funder").show()
    }
    $("#owner_addr").html(window.app.owner)
    $("#fund_addr").html(window.app.fundAddress)


    ethereum.on('accountsChanged', async () => {
        location.reload()
    })

    ethereum.on('chainChanged', async () => {
        location.reload()
    })

    //init
    await syncBalance()
    showExchangeRate()
    attachEvents()
}

function interceptNormalUser() {
    if (investor_list.includes(window.app.current_account)
        || window.app.current_account == window.app.fundAddress
        || window.app.current_account == window.app.owner) {
    } else {
        showMsg("当前账户不在投资人名单", "current account is not in investor list")
        window.location = window.location.href.replace(/\w*\.html/, "")
    }
}

async function injectContractBaseInfo() {
    let p1 = window.app.investor.methods.HOP_FUND().call()
    let p2 = window.app.investor.methods.owner().call()
    let p3 = window.app.hop.methods.totalSupply().call()
    let p4 = window.app.usdt.methods._totalSupply().call()
    let p5 = window.app.hop.methods.balanceOf(window.app.investor._address).call()
    let p6 = window.app.investor.methods.totalLocked().call()

    let values = await Promise.all([p1, p2, p3, p4, p5, p6])
    window.app.fundAddress = values[0]
    window.app.owner = values[1]
    window.app.totalHop = values[2]
    window.app.totalSupply = values[3]
    window.app.contractHop = values[4]
    window.app.lockedHop = values[5]
}




async function syncBalance() {
    {
        let account = window.app.current_account
        let p1 = window.app.hop.methods.balanceOf(account).call()
        let p2 = window.app.usdt.methods.balanceOf(account).call()
        let p3 = window.app.investor.methods.balanceDetail(account).call()
        let p4 = window.app.usdt.methods.allowance(window.app.current_account, investor_address).call()

        let values = await Promise.all([p1, p2, p3, p4])
        window.app.hopBalance = values[0]
        window.app.usdtBalance = values[1]
        window.app.balanceDetail = values[2]
        window.app.mutiplier = window.app.balanceDetail.mutiplier
        window.app.allowance = values[3]


        $("#hop_balance").html(window.app.hopBalance / 1e18 + "")
        $("#usdt_balance").html(window.app.usdtBalance / 1e6 + "")
        $("#claimable").html(window.app.balanceDetail.claimable / 1e18 + "")
        $("#wait_claim").html(window.app.balanceDetail.balance / 1e18 + "")

        if (parseInt(window.app.allowance) > 10000000000000000) {
            $("#user_address").html(window.app.current_account + "✅")
        }
    }
}

function showExchangeRate() {
    if(window.app.mutiplier != null){
        $("#rate").html(window.app.mutiplier / 1e12)
    } 
    $("#lock_deposite").html(window.app.lockedHop / 1e18 + "/" + window.app.contractHop / 1e18)
}

function attachEvents() {

    $("#input_usdt").keyup(() => {
        let number = $("#input_usdt").val()
        $("#hop_amount").html(number * window.app.mutiplier / 1e12)
    })

    $("#all").click(() => {
        window.app.usdt.methods.balanceOf(window.app.current_account).call().then(x => {
            $("#input_usdt").val(x / 1e6)
            $("#input_usdt").keyup()
        })
    })

    $("#exchange").click(async () => {

        if (!investor_list.includes(window.app.current_account)) {
            showMsg("当前账户不在投资人名单", "current account is not in investor list")
            return
        }

        if (window.app.mutiplier == null){
            showMsg("当前汇率未设置", "exchange rate not set")
            return
        }

        let number = parseInt(parseFloat($("#input_usdt").val()) * 1e6)
        if (isNaN(number) || number == 0) {
            showMsg("请输入大于0的数字/浮点数", "please input a number greater than 0")
            return
        }

        let balance = window.app.usdtBalance

        if (number - balance > 0) {
            showMsg("usdt不足", "insufficient usdt")
            return
        }

        let cost = number
        let address = window.app.current_account
        let allowance = await window.app.usdt.methods.allowance(address, investor_address).call()

        if (allowance < number) {

            showMsg("授权 USDT", "approve USDT")
            try {
                await window.app.usdt.methods.approve(investor_address, window.app.totalSupply).send({ from: address })
                showMsg("授权成功", "approve succeed")
            } catch (error) {
                jumpToEtherscan(address)
            }
        } else {

            let firstLimitHop = (window.app.mutipler / 1e12) * firstLimit
            let limitHop = (window.app.mutipler / 1e12) * commonLimit

            if (window.app.balanceDetail.totalBalance / 1e18 === 0 && window.app.balanceDetail.claimed / 1e18 === 0) {

                if (cost < firstLimitHop) {
                    showMsg(`首次购买不应小于${firstLimitHop} HOP`, `The number of HOP must be greater than ${firstLimitHop}`)
                    return
                }
                
            } else {

                if (cost < limitHop) {
                    showMsg(`购买不应小于${limitHop}HOP`, `The number of HOP must be greater than ${limitHop}`)
                    return
                }
            }

            try {
                await window.app.investor.methods.exchangeForHOP(cost).send({ from: address })
                showMsg("购买成功", "exchange succeed")
                await syncBalance()
            } catch (error) {
                jumpToEtherscan(address)
            }
        }

    })

    $("#claim_btn").click(async () => {
        try {
            let value = new BN($("#claim_number").val()).mul(new BN(1e9)).mul(new BN(1e9)).toString()
            await window.app.investor.methods.claimHOP(value).send({ from: window.app.current_account })
            showMsg("收取成功", "claim succeed")
            await syncBalance()
        } catch (error) {
            jumpToEtherscan(address)
        }
    })

    $("#deposite_hop").click(() => {
        let value = new BN($("#deposite_number").val()).mul(new BN(1e9)).mul(new BN(1e9)).toString()
        window.app.hop.methods.transfer(window.app.investor._address, value).send({ from: window.app.fundAddress })
            .then(async () => {
                showMsg("质押成功", "deposite success!")
                await showExchangeRate()
            })
    })

    $("#set_rate").click(() => {
        let r = $("#new_rate").val()
        let who = $("#rate_for_who").val()
        window.app.investor.methods.setRateFor(who, r).send({ from: window.app.owner })
            .then(async () => {
                showMsg("汇率变化", "rate changed!")
                await showExchangeRate()
            })
    })

    $("#release_btn").click(() => {
        let value = new BN($("#release_amount").val()).mul(new BN(1e9)).mul(new BN(1e9)).toString()
        let who = $("#release_for_who").val()
        window.app.investor.methods.releaseFor(who, value).send({ from: window.app.owner })
            .then(async () => {
                showMsg("释放HOP", "HOP released!")
                await showExchangeRate()
            })
    })

    $("#change_address").click(() => {
        let f_address = $("#f_addr").val()
        let b_address = $("#b_addr").val()
        window.app.investor.methods.changeAddress(f_address, b_address).send({ from: window.app.owner })
            .then(() => {
                showMsg("地址改变，请刷新", "address changed, please reload")
            })
    })

    $("#append").click(() => {
        let address = $("#append_address").val()
        if (!web3.utils.isAddress(address)) {
            showMsg("无效的账户地址", "not an address!")
            return
        }
        if (address in window.app.update) {
            showMsg("地址已经存在", "address already inserted!")
            return
        }
        let value = new BN($("#append_value").val()).mul(new BN(1e9)).mul(new BN(1e9)).toString()
        let text = $("#sell_record").val()
        if (text != "") {
            text = text + "\n"
        }
        text = text + address + "\t" + value.toString()
        $("#sell_record").val(text)
        $("#append_address").val("")
        $("#append_value").val("")
        //reconstruct update
        let lines = text.split("\n")
        window.app.update = {}
        for (var index in lines) {
            let line = lines[index]
            let pair = line.split("\t")
            let addr = pair[0]
            let balance = pair[1]
            if (addr in window.app.update) {
                showMsg("地址已经插入", "address already inserted")
                return
            }
            window.app.update[addr] = balance
        }
    })

    $("#update").click(() => {
        let text = $("#sell_record").val()
        let lines = text.split("\n")
        window.app.update = {}
        for (var index in lines) {
            let line = lines[index]
            let pair = line.split("\t")
            let addr = pair[0]
            let balance = pair[1]
            if (addr in window.app.update) {
                showMsg("地址已经插入", "address already inserted")
                return
            }
            window.app.update[addr] = balance
        }
        let addr_array = []
        let val_array = []
        for (var a in window.app.update) {
            addr_array.push(a)
            val_array.push(window.app.update[a])
        }
        let address = window.app.current_account
        window.app.investor.methods.addBalance(addr_array, val_array).send({ from: address }).then(() => {
            showMsg("数据成功插入", "data inserted")
        })
    })


    var defaultLang = "en"

    // languageSelect(defaultLang);
    var lang = $("#lang")
    lang.change(() => {
        defaultLang = lang.val()
        languageSelect(defaultLang)
    })

}