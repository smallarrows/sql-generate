const {initParams} = require('./util');
/**
 * 基类
 * @param {*} options 
 */
const Base = function(options){
    this.options = options;
    this.paramsType = {};
    this.sqls = [];
}
Base.prototype.setOptions = function(options={}){
    if(this.checkOptions(options)){
        this.options = options;
    }
}
Base.prototype.getOptions= function(){
    return this.options;
}
Base.prototype.checkOptions = function(options){
    const opt = options?options:this.options;
    if(opt===undefined){return true;}
    if(JSON.stringify(opt)==="{}"){
        throw new TypeError(`Please set the correct options!`);
    }
    for (const key in opt) {
        const paramType = this.paramsType[key];
        if (opt.hasOwnProperty(key)&& paramType) {
            const value = opt[key];
            if(typeof value === 'symbol'){continue;}
            if(!(typeof value === paramType)||(typeof value === 'String' && value.length === 0)){
                throw new TypeError(`Please set the correct ${key}!`);
            }
        }
    }
    return true;
}
Base.prototype.build = function (){
    throw new Error('Please override build method!');
}
// 初始化类常量
const init = function(){
    Base.PARAMS = {
        sqlTypes:["SELECT","INSERT","UPDATE","DELETE"],
    } 
    initParams(Base,Base.PARAMS);
}
init();

module.exports = {
    Base
}


