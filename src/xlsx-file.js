"use strict";
const xlsx = require('node-xlsx');
const path = require('path');
const {File} = require('./file');
const {initParams,initParamType} = require('./util');
const {SqlObj} = require('./obj');
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
        xlsxPath:{type:'string',required:true},
        autoReadXlsx:'boolean',
        pathRules:{type:"function",required:true},
        fileRules:{type:"function",required:true}
    })
    this.checkOptions();

    //4. 初始化属性
    this.isXlsxUpdate = true;// 标记是否需要更新xlsx信息
    this.sqls = [];
    this.paramsList = [];

    //5. 初始化实例参数
    Object.assign(this.params,{
        xlsx:[{name:'$xlsx',value:{}}] //$XLSX 每行的对象
    })
    initParams(this,this.params);

    //6. 获取xlsx内容
    const autoReadXlsx = options.autoReadXlsx == null?true:options.autoReadXlsx;
    if(autoReadXlsx){
        this.getXlsx();
    }
}
XlsxFile.prototype = File.prototype;

/**
 * 覆写设置参数方法
 * @param {*} options 
 */
XlsxFile.prototype.setOptions = function(options={}){
    const {rootPath,xlsxPath} = this.options;
    if(this.checkOptions(options)){
        this.options = options;
        if(rootPath !== options.rootPath){
            this.isDirsUpdate = true;
            if(options.autoReadDirs){
                this.getDirs(options.rootPath);
            }
        }
        if(xlsxPath !== options.xlsxPath){
            this.isXlsxUpdate = true;
            if(options.autoReadXlsx){
                this.getXlsx(options.xlsxPath);
            }
        }
    }
}
XlsxFile.prototype.getXlsx = function(_xlsxPath){
    console.log('开始解析xlsx...')
    const xlsxPath = _xlsxPath?_xlsxPath:this.options.xlsxPath;
    this.xlsx_source = xlsx.parse(xlsxPath);
    this.xlsxs = xlsxFormat(this.xlsx_source);
    this.isXlsxUpdate = false;
    console.log('解析完成, 总行数：'+this.xlsxs.length)
    return {xlsxs:this.xlsxs,xlsx_source:this.xlsx_source};
}
const xlsxFormat = function(xlsx_source){
    const data = [];
    const xlsxs = xlsx_source;
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
/**
 * 根据相关参数得到SQL对象列表
 * @param [XlsxObj,{}] xlsxs 
 * @param [FileObj,{}] files 
 */
XlsxFile.prototype.getSqlObjList = function(_xlsxs,_files){
    console.log('开始生成SQL虚拟对象列表...')
    const xlsxs = _xlsxs?_xlsxs:this.xlsxs;
    const files = _files?_files:this.files;
    const {params,sql} = this.options;
    let sqlList = [];
    if(!xlsxs){
        throw TypeError(`xlsxs type is error!`);
    }
    if(!files){
        throw TypeError(`files type is error!`);
    }
    console.log('开始对比文件...')
    this.matchCount = 0;
    files.forEach((file)=>{
        //1. 处理sql对象需要使用的参数
        this.$FILE_FILENAME = file.name;
        this.$FILE_FILEPATH = file.root + file.path; 
        const match_result = this.matchXlsx(xlsxs);
        if(match_result!=null){
            const sqlOptions = sql.call(this);  // 获取 sql 配置
            const paramOptions = this.getParamsOptions();    // 获取 param 参数
            initParamType(paramOptions,sqlOptions.database);
            const sqlObj = SqlObj(sqlOptions);
            sqlObj.setFields(paramOptions);
            sqlObj.setValues(paramOptions);
            sqlList.push(sqlObj);
        };
    })
    console.log('对比文件次数：'+this.matchCount);

    console.log('SQL虚拟对象列表生成完成，总匹对SQL数：'+sqlList.length)
    return sqlList;
}
XlsxFile.prototype.matchXlsx = function(_xlsxs){
    const xlsxs = _xlsxs;
    const {fileRules} = this.options;
    let index = -1;
    for (let i = 0; i < xlsxs.length; i++) {
        const xlsx = xlsxs[i];
        if(xlsx.match){continue;}
        this.matchCount++;
        this.$xlsx = xlsx;
        if(fileRules.call(this)){
            index = i;
            xlsxs[index].match = true;
            break;
        }
    }
    if(index > -1){
        return {index,xlsx:xlsxs[index]}
    }
    return null;
}
XlsxFile.prototype.getSqls = function(_sqlObjList){
    console.log('开始生成有效SQL语句列表...')
    const sqlObjList = _sqlObjList?_sqlObjList:this.sqlObjList;
    const sqls = [];
    sqlObjList.forEach(sqlObj => {
        sqls.push(sqlObj.toSqlString());
    });
    console.log('生成有效SQL语句列表结束')
    return sqls;
}
XlsxFile.prototype.build = function(){
    console.log('构建开始')
    const start = new Date();
    //1. 检查options内容
    this.checkOptions();
    //2. 设置参数
    const {isDirsUpdate,isXlsxUpdate} = this;
    const {sqlPath} = this.options;
    if(isDirsUpdate){ this.getDirs(); }
    if(isXlsxUpdate){ this.getXlsx(); }
    this.sqlObjList = this.getSqlObjList();
    this.sqls = this.getSqls();
    this.writeFile(sqlPath,this.sqls.join(';\n'));
    const end = new Date();
    console.log('构建结束, 总耗时：'+(end-start)+'ms.');
    return this.sqls;
}

module.exports = {
    XlsxFile
}