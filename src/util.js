const util = {};
/**
 * 初始化参数
 */
util.initParams = function (instance, params) {
    Object.keys(params).forEach(key=>{
        params[key].forEach(p => {
            switch (typeof p) {
                case 'string':
                    instance[p] = p.replace(/^__(.*)__$/, "$1");
                    break;
                case 'object':
                    instance[p.name] = p.value != null ? p.value : time + p.name + time;
                    break;
            }
        });
    });
    return instance;
};
// util.getParams = function(instance){
//     const params = {};
//     for (const key in instance) {
//         if (instance.hasOwnProperty(key)) {
//             if(/^\$.*/.test(key)){
//                 params[key] = instance[key];
//             }
//         }
//     }
//     return params;
// }
/**
 * 执行param内字段值监听
 * @param {*} param 
 */
util.execObservers = function (param) {
    for (const key in param) {
        if (param.hasOwnProperty(key)) {
            const v = param[key];
            if (typeof v === 'object' && typeof v.observers === 'function') {
                v.observers();
            }
        }
    }
};
/**
 * 添加监听
 * @param {*} param 
 * @param {*} instance 实例
 */
util.addObservers = function (param,instance) {
    if(typeof param !== 'object'){return param;}
    if(typeof param.observers !== 'function'){return param;}
    let paramProxy = new Proxy(param, {
        set: function (target, propKey, value, receiver) {
            const isRunObservers = target.isRunObservers?target.isRunObservers:true;
            target[propKey] = value;
            if(propKey !== 'value'){return Reflect.set(target, propKey, value, receiver);}
            if(isRunObservers){
                if(instance){
                    target.observers.call(instance);
                }else{
                    target.observers();
                }
            }
            target.isRunObservers = true;
            return Reflect.set(target, propKey, value, receiver);
        }
    });
    return paramProxy;
};
/**
 * 批量添加监听
 * @param {*}} params 
 * @param {*} instance 实例
 */
util.addManyObservers = function(params,instance){
    Object.keys(params).forEach(key=>{
        params[key] = util.addObservers(params[key],instance);
    });
    return params;
};
/**
 * 对param内字段值进行类型处理
 * @param {*} param 
 */
util.initParamType = function (params, database) {
    Object.keys(params).forEach(key=>{
        const param = params[key];
        if(typeof param === 'object' && param.type){
            let type,format;
            if(typeof param.type === 'object'){
                type = param.type.name;
                format = param.type.format;
            }else if(typeof param.type === 'string'){
                type = param.type;
            }else{
                return;
            }
            if (type.toUpperCase() === 'DATE') {
                switch(database){
                    case 'ORACLE':
                        format = 'yyyy/mm/dd hh24:mi:ss';
                        params[key].value = "TO_DATE('"+params[key].value+"','"+format+"')";
                    break;
                    case 'MYSQL':
                    default:
                        format = '%Y-%m-%d %H:%i:%s';
                        params[key].value = "STR_TO_DATE('"+params[key].value+"','"+format+"')";
                    break;
                }
                params[key].isRunObservers = false;     // 关闭监听
                params[key].addApostrophe = false;   // 拼接SQL时不加单引号
            }
        }
    });
    return params;
};
module.exports = util;