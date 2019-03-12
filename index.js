const work = require("./js_modules/work");
const helpers = require("./js_modules/helpers");
const methods = require("./js_modules/methods");
const udb = require("./js_modules/usersdb");
const conf = require('./config.json');
const bdb = require("./js_modules/blocksdb");
const LONG_DELAY = 12000;
const SHORT_DELAY = 3000;

async function getAwards() {
    let PROPS = await methods.getProps();
            const block_n = await bdb.getBlock(PROPS.last_irreversible_block_num);
let bn = block_n.last_block;

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

async function withdraw(user, viz_login, amount) {
    amount = amount.toFixed(6);
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
            await udb.updateUser(user, balance);
const transfer = await methods.transfer(conf.active_key, conf.login, viz_login, viz_amount, 'withdraw completed. Service: ' + conf.service);
return transfer;
}     else {
    console.log('Сумма больше имеющейся у аккаунта шлюза.');
return 0;
}
} else {
console.log('Сумма больше имеющейся у пользователя.');
return 0;    
}
} else {
console.log('Не удалось. Пользователь не найден');
return 0;    
}
    } catch(e) {
console.log('Error: ' + e);
return -1;    
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

setInterval(() => withdrawShares(), 86400000);

module.exports.getAwards = getAwards;
module.exports.withdraw = withdraw;
module.exports.search = udb.getUser;