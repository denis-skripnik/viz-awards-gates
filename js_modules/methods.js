var conf = require('../config.json');
var viz = require('viz-js-lib');
viz.config.set('websocket','wss://solox.world/ws');

async function awardMe() {
return await viz.broadcast.awardAsync(conf.regular_key, conf.login, conf.login, 10,0,'Viz-awards-gates: https://github.com/denis-skripnik/viz-awards-gates.',[])
}

async function getOpsInBlock(bn) {
    return await viz.api.getOpsInBlockAsync(bn, false);
  }
  
  async function getProps() {
  return await viz.api.getDynamicGlobalPropertiesAsync();
  }
  
  async function transfer(wif, from, to, amount, memo) {
    var newTx = [];
    newTx = [['transfer', {from:from,to:to,amount:amount,memo:memo}]];
    var now = new Date().getTime() + 18e5,
    expire = new Date(now).toISOString().split('.')[0];
  
    const current = await getProps();
    var blockid = current.head_block_id;
    n = [];
    for (var i = 0; i < blockid.length; i += 2)
    {
        n.push(blockid.substr(i, 2));
    }
    var hex = n[7] + n[6] + n[5] + n[4];
    var refBlockNum = current.head_block_number & 0xffff;
    var refBlockPrefix = parseInt(hex, 16)
    var trx = {
        'expiration': expire,
        'extensions': [],
        'operations': newTx,
        'ref_block_num': refBlockNum,
        'ref_block_prefix': refBlockPrefix
    };
    var trxs = "";
    try {
        trxs = await viz.auth.signTransaction(trx, {"active": wif});
    } catch (error) {
        console.log("Не удалось подписать транзакцию: " + error.message);
    }
    try {
    const broadcast_trx_sync = await viz.api.broadcastTransactionSynchronousAsync(trxs);
  return broadcast_trx_sync.id;
    } catch(e) {
        return 0;
    }
  }

  async function transferToVesting(wif, from, to, amount) {
    var newTx = [];
    newTx = [['transfer_to_vesting', {from:from,to:to,amount:amount}]];
    var now = new Date().getTime() + 18e5,
    expire = new Date(now).toISOString().split('.')[0];
  
    const current = await getProps();
    var blockid = current.head_block_id;
    n = [];
    for (var i = 0; i < blockid.length; i += 2)
    {
        n.push(blockid.substr(i, 2));
    }
    var hex = n[7] + n[6] + n[5] + n[4];
    var refBlockNum = current.head_block_number & 0xffff;
    var refBlockPrefix = parseInt(hex, 16)
    var trx = {
        'expiration': expire,
        'extensions': [],
        'operations': newTx,
        'ref_block_num': refBlockNum,
        'ref_block_prefix': refBlockPrefix
    };
    var trxs = "";
    try {
        trxs = await viz.auth.signTransaction(trx, {"active": wif});
    } catch (error) {
        console.log("Не удалось подписать транзакцию: " + error.message);
    }
    try {
    const broadcast_trx_sync = await viz.api.broadcastTransactionSynchronousAsync(trxs);
  return broadcast_trx_sync.id;
    } catch(e) {
        return 0;
    }
  }

async function shares2viz(vesting_shares) {
    let props = await getProps();
vesting_shares += ' SHARES';
    let shares = viz.formatter.sharesToVIZ(vesting_shares, parseFloat(props.total_vesting_shares), parseFloat(props.total_vesting_fund));
    return shares;
}

async function getAccount(login) {
    return await viz.api.getAccountsAsync([login]);
    }
  
async function withdrawVesting(wif, account, vestingShares) {
return await viz.broadcast.withdrawVestingAsync(wif, account, vestingShares);
}

async function regg(newAccountName, amount) {
    var fee = amount.toFixed(3) + ' VIZ';
    var delegation = '0.000000 SHARES';
    var creator = conf.login;
    
    let length=100;
	let charset='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-=_:;.,@!^&*$';
	let ret='';
	for (var i=0,n=charset.length;i<length;++i){
		ret+=charset.charAt(Math.floor(Math.random()*n));
	}
	let wif=viz.auth.toWif('',ret,'');
    let resultWifToPublic = viz.auth.wifToPublic(wif);
    var master = {
      weight_threshold: 1,
      account_auths: [],
      key_auths: [[resultWifToPublic, 1]]
    };
    var active = {
      weight_threshold: 1,
      account_auths: [],
      key_auths: [[resultWifToPublic, 1]]
    };
    var regular = {
      weight_threshold: 1,
      account_auths: [],
      key_auths: [[resultWifToPublic, 1]]
    };
    var memoKey = resultWifToPublic;
    var jsonMetadata = '{}';
    var referer = '';
    var extensions = [];
    try {
    let registration = await viz.broadcast.accountCreateAsync(conf.active_key, fee, delegation, creator, newAccountName, master, active, regular, memoKey, jsonMetadata, referer, extensions);
return {status: true, key: wif};
    } catch(e) {
return {status: false, msg: e};
    }
}

module.exports.awardMe = awardMe;
  module.exports.getOpsInBlock = getOpsInBlock;
module.exports.getProps = getProps;
module.exports.transfer = transfer;
module.exports.shares2viz = shares2viz;
module.exports.transferToVesting = transferToVesting;
module.exports.getAccount = getAccount;
module.exports.withdrawVesting = withdrawVesting;
module.exports.reg = reg;