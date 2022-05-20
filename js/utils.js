export function showMsg(strCN, strEN) {
    let str = ""
    if ($("#lang").val() == "cn"){
        str = strCN
    }else{
        str = strEN
    }
    if (typeof imtoken == 'undefined') {
        alert(str)
    } else {
        imToken.callAPI('native.alert', str)
    }
}

export function jumpToEtherscan(address) {
    showMsg("正在前往 ropsten etherscan", "redirecting to ropsten etherscan")
    setTimeout(() => {
        window.location = 'https://https://ropsten.etherscan.io/address/' + address 
    }, 2000)
}

export function languageSelect(defaultLang){
    $("[i18n]").i18n({
        defaultLang: defaultLang,
        filePath: "./i18n/",
        filePrefix: "i18n_",
        fileSuffix: "",
        forever: true,
        callback: function(res) {}
    });
}


// export function getProgress(current) {
//     let day = 24 * 60 * 60 * 1000
//     if(!window.app.onExchange){
//         return 0
//     }
//     let period = (current - window.app.onExchangeTime) / (30 * day) + 1
//     if (period >= 6) {
//         return 100
//     }
//     let p = Math.floor(period)
//     return p / 6 * 100
// }

export function formatDate(now) {
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}

export async function detectBroswer(){
    // Modern dApp browsers...
    if (window.ethereum) {
        $("#broswer_type").html("modern")
        window.web3 = new Web3(ethereum)
        try {
            // await ethereum.enable()
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
            showMsg(error, error)
        }
    }
    // Legacy dApp browsers...
    else if (window.web3) {
        $("#broswer_type").html("Legacy")
        window.web3 = new Web3(web3.currentProvider)
    }
    // Non-dApp browsers...
    else {
        $("#broswer_type").html("none")
        showMsg("请链接 Metamask","Please connect to Metamask.")
    }
}

export const firstLimit = 200000
export const commonLimit = 50000