const helpers = require("./helpers");
const methods = require("./methods");
const udb = require("./usersdb");
const conf = require('../config.json');

async function processAwards(shares, service_user) {
    let balance;
    try {
    let user_data = await udb.getUser(service_user);
    if (user_data) {
balance = user_data.balance + shares;
} else {
balance = shares;
}
} catch(e) {
balance = shares;
}

try {
await udb.updateUser(service_user, '', balance);
return 1;
} catch(error) {
return 0;
}
}

async function processBlock(bn) {
    const block = await methods.getOpsInBlock(bn);
let ok_ops_count = 0;
    for(let tr of block) {
        const [op, opbody] = tr.op;
        switch(op) {
                case "receive_award":
let memo = opbody.memo.split(':');
let shares = parseFloat(opbody.shares);
if (opbody.receiver === conf.login && memo[0].toLowerCase() === conf.service) {
    ok_ops_count += await processAwards(shares, memo[1]);
}
               break;
    default:
                    //неизвестная команда
            }
        }
        return ok_ops_count;
    }

module.exports.processBlock = processBlock;