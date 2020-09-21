const {initParams,addManyObservers,triggerObservers} = require('./util');
/**
 * 基类
 * @param {*} options 
 */
const Base = function(options){
    //1. 初始化实例参数
    this.options = options;
    this.paramsType = {};
    this.sqls = [];
    //2. 设置实例常量
    this.params = {
        sqlTypes:["__SELECT__","__INSERT__","__UPDATE__","__DELETE__"],
        dataBase:["__ORACLE__","__SQLSERVER__","__MYSQL__"]
    };
    initParams(this,this.params);
};
Base.prototype.getParamsOptions = function(){
    const params = this.options.params;
    const paramOptions = params.call(this);
    addManyObservers(paramOptions,this);
    triggerObservers(paramOptions);
    return paramOptions;
};
Base.prototype.setOptions = function(options={}){
    if(this.checkOptions()){
        this.options = options;
    }
};
Base.prototype.getOptions= function(){
    return this.options;
};
Base.prototype.checkOptions = function(){
    const opt = this.options;
    if(opt===undefined){return true;}
    if(JSON.stringify(opt)==="{}"){
        throw new TypeError(`Please set the correct options!`);
    }
    for (const key in opt) {
        const paramType = this.paramsType[key];
        if (opt.hasOwnProperty(key)&& paramType) {
            const attr = opt[key];
            if(typeof attr === 'symbol'){continue;}
            if(typeof paramType === 'object'){
                if(paramType.required && opt[key]==null){
                    throw new TypeError(`${key} is required in options!`);
                }
                if(typeof attr !== paramType.type){
                    throw new TypeError(`${key} should be ${paramType.type} type!`);
                }
                // 走到这里证明类型验证通过
                if(typeof attr === 'string' && attr.length === 0){
                    throw new TypeError(`${key} can not be empty!`);
                }
            }else if(typeof paramType === 'string'){
                if((typeof attr !== paramType) || (typeof attr === 'string' && attr.length === 0)){
                    throw new TypeError(`${key} should be ${paramType.type} type!`);
                }
            }
        }
    }
    return true;
};
Base.prototype.getSqlObjList = function(){
    throw new Error('Please override getSqlObjList method!');
};
Base.prototype.getSqls = function(){
    throw new Error('Please override getSqls method!');
};
Base.prototype.build = function (){
    throw new Error('Please override build method!');
};

Base.prototype.getClassConstant = function(){
    return XlsxFile.PARAMS;
};

module.exports = {
    Base
};


