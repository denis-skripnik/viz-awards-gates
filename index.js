const work = require("./js_modules/work");
const helpers = require("./js_modules/helpers");
const methods = require("./js_modules/methods");
const udb = require("./js_modules/usersdb");
const conf = require('./config.json');
const bdb = require("./js_modules/blocksdb");
const LONG_DELAY = 12000;
const SHORT_DELAY = 3000;
const SUPER_LONG_DELAY = 1000 * 60 * 15;

let PROPS = null;

let bn = 0;
let last_bn = 0;
let delay = SHORT_DELAY;

async function getAwards() {
    PROPS = await methods.getProps();
            const block_n = await bdb.getBlock(PROPS.last_irreversible_block_num);
bn = block_n.last_block;

delay = SHORT_DELAY;
while (true) {
    try {
        if (bn > PROPS.last_irreversible_block_num) {
            // console.log("wait for next blocks" + delay / 1000);
            await helpers.sleep(delay);
            PROPS = await methods.getProps();
        } else {
            if(0 < await work.processBlock(bn)) {
                delay = SHORT_DELAY;
            } else {
                delay = LONG_DELAY;
            }
            bn++;
            await bdb.updateBlock(bn);
        }
    } catch (e) {
        console.log("error in work loop" + e);
        await helpers.sleep(1000);
        }
    }
}

    setInterval(() => {
        if(last_bn == bn) {
    
            try {
                    process.exit(1);
            } catch(e) {
                process.exit(1);
            }
        }
        last_bn = bn;
    }, SUPER_LONG_DELAY);

async function addVizAccount(user, viz_login) {
        let user_data = await udb.getUser(user);
        if (user_data) {
try {
			await udb.updateUser(user, viz_login, user_data.balance);
            let json = {code: 1, message: 'Ok'};
            return JSON.stringify(json);
			} catch(e) {
let json = {code: -1, error: e};
			return JSON.stringify(json);
}
		} else {
            let json = {code: 0, error: 'No user in database.'};
        }
			}

async function withdraw(user, amount, mode) {
    amount = amount.toFixed(6);
    amount = parseFloat(amount);
    try {
        let user_data = await udb.getUser(user);
        if (user_data) {
                       if (user_data.balance >= amount) {
            let balance = user_data.balance - amount;
            let viz_amount = await methods.shares2viz(amount);
            viz_amount *= 1000;
            viz_amount = parseInt(viz_amount);
            viz_amount /= 1000;
            viz_amount = viz_amount.toFixed(3);
            let account = await methods.getAccount(conf.login);
            if (account[0].balance >= viz_amount) {
            viz_amount += ' VIZ';
            await udb.updateUser(user, user_data.viz_account, balance);
if (mode === 'to_balance') {
            await methods.transfer(conf.active_key, conf.login, user_data.viz_account, viz_amount, 'withdraw completed. Service: ' + conf.service);
} else if (mode === 'to_shares') {
    await methods.transferToVesting(conf.active_key, conf.login, user_data.viz_account, viz_amount);
}
            let json = {code: 1, message: 'Ok'};
return JSON.stringify(json);
}     else {
    let json = {code: 0, error: 'The amount is greater than the existing account gateway.'};
    return JSON.stringify(json);
}
} else {
let json = {code: 0, error: 'The amount is greater than the user has.'};
return JSON.stringify(json);
}
} else {
    let json = {code: 0, error: 'No user in database.'};
    return JSON.stringify(json);
}
    } catch(e) {
let json = {code: -1, error: e};
return JSON.stringify(json);
}
}

async function withdrawShares() {
let account = await methods.getAccount(conf.login);
let shares = parseFloat(account[0].vesting_shares)/28;
shares *= 1000000;
shares = parseInt(shares);
shares /= 1000000;
shares += ' SHARES';
await methods.withdrawVesting(conf.active_key, conf.login, shares);
}

async function userRegistration(user, viz_login) {
    let user_data = await udb.getUser(user);
    if (user_data) {
try {
    let regAction = await methods.reg(viz_login, user_data.balance);
    if (regAction === true) {
    await udb.updateUser(user, viz_login, 0);
return regAction.key;
}     else {
    let json = {code: -1, error: regAction.msg};
    return JSON.stringify(json);
}
        } catch(e) {
let json = {code: -1, error: e};
        return JSON.stringify(json);
}
    } else {
        let json = {code: 0, error: 'No user in database.'};
    }
}

setInterval(() => withdrawShares(), 86400000);
setInterval(() => methods.awardMe(), 450000);

module.exports.getAwards = getAwards;
module.exports.addVizAccount = addVizAccount;
module.exports.withdraw = withdraw;
module.exports.search = udb.getUser;
module.exports.userRegistration = userRegistration;