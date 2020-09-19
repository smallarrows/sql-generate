"use strict";
const fs = require('fs');
const path = require('path');
const {Base} = require('./base');
const {initParams} = require('./util');
const {FileObj} = require('./obj');
/**
 * 根据文件生成SQL
 * @param {
    *  rootPath:String, // 文件根目录
    *  sqlPath:String,  // 生成的脚本路径
    *  xlsxPath:String, // 需要补充的单号数据
    *  tableName:String,// 插入语句的表名
    *  params:{
    *      from:String, // filename|xlsx|path
    *      key:String,
    *      value:String,
    *      pathSep:'string', // 在from为path生效，路径使用该符号分割
    * 
    *  },       // 参数
    * autoReadDirs:boolean
    * } options 
    */
function File(options){
    //1. 处理路径
    const {rootPath,sqlPath} = options;
    options.rootPath = path.join(rootPath,"");
    options.sqlPath = path.join(sqlPath,"");

    //2. 继承基类
    Base.call(this,options);

    //3. 设置校验类型
    this.paramsType = {
        rootPath:'string',
        sqlPath:'string',
        tableName:'string',
        params:'function',
        autoReadDirs:'boolean'
    }
    this.checkOptions();

    //4. 初始化实例参数
    this.isDirsUpdate = true;
    Object.assign(this.params,{
        file:['$FILE_FILENAME','$FILE_FILEPATH'],
    })
    initParams(this,this.params);

    //5. 获取目录和文件
    const autoReadDirs = options.autoReadDirs == null?true:options.autoReadDirs;
    if(autoReadDirs){
        this.getDirs(options.rootPath);
    }
}
File.prototype = Base.prototype;

/**
 * 覆写设置参数方法
 * @param {*} options 
 */
File.prototype.setOptions = function(options={}){
    const _options = this.options;
    if(this.checkOptions(options)){
        this.options = options;
        if(_options.rootPath !== options.rootPath){
            this.isDirsUpdate = true;
            if(options.autoReadDirs){
                this.getDirs(options.rootPath);
            }
        }
    }
}
/**
 * 获取目录和文件数据
 * @dirs 
 * [{
 *      name，
 *      sub:[{name,sub:[]},{name}]
 *  },...]
 * @files [{name,path}]
 */
File.prototype.getDirs = function(_root) {
    console.log('开始遍历文件夹...');
    const {options} = this;
    const root = _root?_root:this.options.rootPath;
    let dirs = [];
    let files = [];
    function collectDir(dirPath,dirsBuf,filesBuf) {
        let errorFlag = 0;
        try {
            const dirs = fs.readdirSync(dirPath);
            errorFlag = 1;
            dirs.forEach((dir,index)=>{
                const subPath = path.join(dirPath,dir);
                const obj = FileObj(options);
                obj.name = dir;
                obj.root = root;
                obj.path = subPath.replace(root,"");
                obj.isDir = true;
                if(fs.statSync(subPath).isDirectory()){
                    dirsBuf[index] = obj;
                    collectDir(subPath,dirsBuf[index]['sub'],filesBuf);
                }else{
                    dirsBuf[index] = obj;
                    filesBuf.push(obj);
                }
            })
        } catch (error) {
            if(errorFlag !== 0){
                throw error;
            }
            return;
        }
    }
    collectDir(root,dirs,files);
    this.dirs = dirs;
    this.files = files;
    this.isDirsUpdate = false;
    console.log('文件收集完成，总文件数：'+files.length);
    return {dirs,files}
}
File.prototype.matchFile = function(_files){
    const files = _files?_files:this.files;
    const {fileRules} = this.options;
    let index = 0;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.$FILE_FILENAME = file.name;
        this.$FILE_FILEPATH = file.path; 
        if(fileRules.call(this)){
            index = i;
            break;
        }
    }
    return {index,file:files[index]}
}
File.prototype.writeFile = function(_path,_data){
    let data_str,p;
    if(!_path){
        throw new TypeError("path type is error!");
    }
    switch(typeof _data){
        case 'object':
            data_str = JSON.stringify(_data);
            break;
        case 'string':
            data_str = _data;
            break;
        default:
            throw new TypeError("data type is error!");
    }
    switch(path.extname(_path)){
        case '.sql':
        case '.txt':
            p = _path;
            break;
        default:
            p = path.join(_path,'sql_result.sql');
        break;
    }
    fs.writeFileSync(p, data_str)
}
File.prototype.readFile = function(_path, _decode){
    let data = fs.readFileSync(_path, _decode?_decode:'utf8');
    return data;
}
File.prototype.build = function (){ // 暂时作为预留
    console.warn('Not yet implemented');
}

module.exports = {
    File
}