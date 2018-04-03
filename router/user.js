/**
 * 包含用户相关所有路由
 */
const express = require('express');
const router = express.Router();
module.exports = router;
const pool = require('../pool');

/**
 *验证电话号码是否已经存在
 * POST
 *请求参数：
    phone-用户名
 *输出结果：
 * {"code":1,"msg":"exist"}
 * 或
 * {"code":2,"msg":"non-exist"}
 */
router.post('/check/phone',(req,res)=>{
    let phone = req.body.phone;
    let resultMsg = {};
    pool.query("SELECT uid FROM mf_user WHERE phone=? ",[phone],(err,result)=>{
        if(err) throw err;
        if(result){
            resultMsg = {"code":1,"msg":"手机号已存在"};
        }else{
            resultMsg = {"code":2,"msg":"该手机号可以使用"};
        }
        res.json(resultMsg);
    });

});

/**
 *验证用户名是否已经存在
 * POST
 *请求参数：
    uname-用户名
 *输出结果：
 * {"code":1,"msg":"exist"}  存在
 * 或
 * {"code":2,"msg":"non-exist"}  不存在
 */
router.post('/check/uname',(req,res)=>{
    let uname = req.body.uname;
    console.log(uname);
    let msg = {};
    pool.query("SELECT uid FROM mf_user WHERE uname= ?",[uname],(err,result)=>{
        if(err) throw err;
        if(result){
            msg = {"code":1,"msg":"该用户名已存在"};
        }else{
            msg = {"code":2,"msg":"该用户名可以使用"};
        }
        res.json(msg);
    });
});

/**
 *用户登录验证
 * POST
 *请求参数：
     unameOrPhone-用户名或密码
     upwd-密码
 *输出结果：
 * {"code":1,"uid":1,"uname":"test","phone":"13012345678"}
 * 或
 * {"code":400}
 */
router.post('/login',(req,res)=>{
    let uname = null;
    if(req.body.uname){
        uname = req.body.uname;
    }else{
        uname = req.body.phone;
    }
    let upwd = req.body.upwd;
    let sql = "SELECT uid,uname,phone FROM mf_user WHERE " +
                 "(uname=? AND upwd=?) OR " +
                    "(phone=? AND upwd=?)";
    pool.query(sql,[uname,upwd,uname,upwd],(err,result)=>{
        res.json(result);
    });
});

/**
 *注册新用户
 *请求参数：
     uname-用户名
     upwd-密码
     phone-电话号码
 *输出结果：
 * {"code":1,"uid":3,"uname":"test"}
 * 或
 * {"code":500}
 */
router.post('/register',(req,res)=>{
    let uname = req.body.uname;
    let upwd = req.body.upwd;
    let phone = req.body.phone;
    let sql = "INSERT INTO mf_user VALUES(NULL,?,?,?)";
    pool.query(sql,[uname,upwd,phone],(err,result)=>{
        let msg = {};
        if(result.affectedRows){
            msg = {"code":1,"uid":result.insertId,"uname":uname};
        }else{
            msg = {"code":500};
        }
        res.json(msg);
    });
});