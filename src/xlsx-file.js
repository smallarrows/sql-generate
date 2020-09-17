const xlsx = require('node-xlsx');
const path = require('path');
const {File} = require('./file');
const {initParams} = require('./util');

/**
 * 根据xlsx和文件生成SQL
 * @param {
 *  rootPath:String, // 文件根目录
 *  sqlPath:String,  // 生成的脚本路径
 *  xlsxPath:String, // 需要补充的单号数据
 *  tableName:String,// 插入语句的表名
 *  params:{
 *      value:String,   // file: $FILENAME 文件夹中文件的全路径 
 *      observers: function // 对value进行set时触发
 *  },       // 参数
 *  autoReadXlsx:'boolean'
 * } options 
 */
const XlsxFile = function(options){
    //1. 处理路径
    const {xlsxPath} = options;
    options.xlsxPath = path.join(xlsxPath,"");

    //2. 继承基类
    File.call(this,options);

    //3. 设置校验类型
    Object.assign(this.paramsType,{
        xlsxPath:'string',
        autoReadXlsx:'boolean',
        rules:"function"
    })
    this.checkOptions();

    //4. 初始化属性
    this.sqls = [];
    this.paramsList = [];

    //5. 初始化实例参数
    this.params = {
        xlsx:[{name:'$xlsx',value:{}}] //$XLSX 每行的对象
    }
    initParams(this,this.params)

    //6. 获取xlsx内容
    const autoReadXlsx = options.autoReadXlsx == null?true:options.autoReadXlsx;
    if(autoReadXlsx){
        this.getXlsx();
    }
}
XlsxFile.prototype = File.prototype;

XlsxFile.prototype.getClassParams = function(){
    return XlsxFile.PARAMS;
}

/**
 * 覆写设置参数方法
 * @param {*} options 
 */
XlsxFile.prototype.setOptions = function(options={}){
    const {rootPath,xlsxPath} = this.options;
    if(this.checkOptions(options)){
        this.options = options;
        if(rootPath !== options.rootPath && options.autoReadDirs){
            this.getDirs(options.rootPath);
        }
        if(xlsxPath !== options.xlsxPath && options.autoReadXlsx){
            this.xlsxs = xlsx.parse(options.xlsxPath);
        }
    }
}
XlsxFile.prototype.getXlsx = function(options){
    const o = options?options:this.options;
    this.xlsxs = xlsx.parse(o.xlsxPath);
    return this.xlsxs;
}
XlsxFile.prototype.getDataFromXlsx = function(){
    const data = [];
    const xlsxs = this.xlsxs;
    //1. 获取每个字段的名称
    xlsxs.forEach((sheet)=>{
        const xlsx = sheet.data;
        const indexes = xlsx[0];
        for (let i = 1; i < xlsx.length; i++) {
            const row = xlsx[i];
            const obj = {};
            row.forEach((col,index)=>{
                const key = indexes[index];
                if(key){
                    obj[key] = col;
                }
            })
            data.push(obj);
        }
    })
    return data;
}
XlsxFile.prototype.build = function(){
    this.checkOptions();
    if(!this.options.autoReadXlsx){ this.getXlsx(); }
    this.formatXlsx = this.getDataFromXlsx();
    
}

module.exports = {
    XlsxFile
}