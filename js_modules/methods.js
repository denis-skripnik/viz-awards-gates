var conf = require('../config.json');
var viz = require('viz-js-lib');
viz.config.set('websocket','wss://solox.world/ws');

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

  module.exports.getOpsInBlock = getOpsInBlock;
module.exports.getProps = getProps;
module.exports.transfer = transfer;
module.exports.shares2viz = shares2viz;
module.exports.getAccount = getAccount;
module.exports.withdrawVesting = withdrawVesting;