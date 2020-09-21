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
    //1. 继承基类
    Base.call(this,options);
    
    //2. 设置校验类型
    this.paramsType = {
        rootPath:'string',
        sqlPath:'string',
        tableName:'string',
        params:'function',
        autoReadDirs:'boolean'
    };
    this.checkOptions();
    
    //3. 初始化实例参数
    this.isDirsUpdate = true;
    Object.assign(this.params,{
        file:['$FILE_FILENAME','$FILE_FILEPATH'],
    });
    initParams(this,this.params);

    //4. 格式化路径
    const {rootPath,sqlPath} = options;
    options.rootPath = path.join(rootPath,"");
    options.sqlPath = path.join(sqlPath,"");

    //5. 获取目录和文件
    const autoReadDirs = options.autoReadDirs == null?true:options.autoReadDirs;
    if(autoReadDirs){
        this.getDirs(options.rootPath);
    }
}
File.prototype = Base.prototype;

const {checkOptions} = File.prototype;
File.prototype.checkOptions = function(){
    const ifOptions = checkOptions.call(this);
    const ifFileRules = typeof this.options.fileRules === 'function';
    if(!ifFileRules){
        throw Error(`Please set fileRules in options`);
    }
    return ifFileRules && ifOptions;
}
/**
 * 覆写设置参数方法
 * @param {*} options 
 */
File.prototype.setOptions = function(options={}){
    const _options = this.options;
    if(this.checkOptions()){
        this.options = options;
        if(_options.rootPath !== options.rootPath){
            this.isDirsUpdate = true;
            if(options.autoReadDirs){
                this.getDirs(options.rootPath);
            }
        }
    }
};
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
    function collectDir(dirPath,dirsBuf,filesBuf,lastDir) {
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
                obj.last = lastDir;
                if(fs.statSync(subPath).isDirectory()){
                    obj.isDir = true;
                    dirsBuf[index] = obj;
                    collectDir(subPath,dirsBuf[index].sub,filesBuf,dirsBuf[index]);
                }else{
                    obj.isDir = false;
                    dirsBuf[index] = obj;
                    filesBuf.push(obj);
                }
            });
        } catch (error) {
            if(errorFlag !== 0){
                throw error;
            }
            return;
        }
    }
    collectDir(root,dirs,files,null);
    this.dirs = dirs;
    this.files = files;
    this.isDirsUpdate = false;
    console.log('文件收集完成，总文件数：'+files.length);
    return {dirs,files};
};
File.prototype.matchFiles = function(fileObj){
    const {pathRules} = this.options;
    let result = null;
    if(typeof pathRules === 'function'){
        result = pathMatch(this,fileObj);
    }else{
        result = allFileMatch(this,fileObj);
    }
    return result;
};
function pathMatch(instance,fileObj){
    const {pathRules} = instance.options;
    const {dirs} = fileObj;
    const files_result = [];
    function collectFileMatchingResults(dir){
        const {isDir,match,name,path,root,sub} = dir;
        instance.$dir = dir;
        if(isDir && pathRules.call(instance)){
            if(sub.length > 0){
                sub.forEach(subDir=>{
                    collectFileMatchingResults(subDir);
                });
            }
        }
        if(!(isDir&&match)){
            instance.matchCount++;
            const matchResult = instance.checkFileByFileRules(dir);
            if(matchResult){
                dir.match = true;
                files_result.push(dir);
            }
        }
    }
    dirs.forEach(dir=>{
        collectFileMatchingResults(dir);
    });
    return files_result.length > 0?files_result:null;
}
function allFileMatch(instance,fileObj){
    const {files} = fileObj;
    const files_result = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if(file.match){continue;}
        instance.matchCount++;
        const matchResult = instance.checkFileByFileRules(file);
        if(matchResult){
            files[i].match = true;
            files_result.push(files[i]);
        }
    }
    return files_result.length > 0?files_result:null;
}
File.prototype.checkFileByFileRules = function(file){
    const {fileRules} = this.options;
    this.$FILE_FILENAME = file.name;
    this.$FILE_FILEPATH = file.root + file.path;
    return fileRules.call(this);
};
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
    fs.writeFileSync(p, data_str);
};
File.prototype.readFile = function(_path, _decode){
    let data = fs.readFileSync(_path, _decode?_decode:'utf8');
    return data;
};
File.prototype.build = function (){ // 暂时作为预留
    console.warn('Not yet implemented');
};

module.exports = {
    File
};