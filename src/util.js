const util = {};
/**
 * 初始化参数
 */
util.initParams = function(obj,params){
    const {keys} = Object;
    for (const key of keys(params)) {
        params[key].forEach(p =>{
            switch(typeof p){
                case 'string':
                    const time = new Date().getTime();
                    obj[p] = time+p+time;
                    break;
                case 'object':
                    obj[p.name] = p.value != null?p.value:time+p.name+time;
                break;
            }
        })
    }
}
module.exports = util;