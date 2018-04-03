/**
 *
 *包含产品信息的所有路由
 */
const express  =require('express');
const router = express.Router();
module.exports = router;
const pool = require('../pool');

/**
 *根据产品ID返回产品详情
 * GET /product/detail/pid
 *请求参数：
     pid-产品ID，必需
 *输出结果：
 {
   "pid": 1,
   "title1":"xxx",
   ...
 }
 */
router.get('/detail/:pid',(req,res)=>{
    let pid = req.params.pid;
    let sql = "SELECT * FROM mf_product WHERE pid=?";
    pool.query(sql,[pid],(err,result)=>{
        res.json(result);
    });
});

/**
 *分页获取产品信息
 * GET /product/select/:pageNum,:type
 *请求参数：
     pageNum-需显示的页号；默认为1
     type-可选，默认为1
 *输出结果：
 {
   totalRecord: 37,
   pageSize: 6,
   pageCount: 7,
   pageNum: 1,
   type: 1,
   data: [{},{} ... {}]
 }
 */
router.get('/select/:pageNum/:type?',(req,res)=>{
    let pager = {
        pageNum:1,
        type:1,
        pageCount:7,
        pageSize:3,
        totalRecord:37,
        data:[]
    };
    pager.pageNum = req.params.pageNum;
    pager.type = isNaN(req.params.type)||req.params.type==" " ? 1 :req.params.type ;

    pool.query("SELECT COUNT(*) as count FROM mf_product WHERE type=?",[pager.type],(err,result)=>{
        if(err) throw err;
        pager.totalRecord = result[0].count;
        pager.pageCount =(pager.totalRecord / pager.pageSize) | 1;
        let start = (pager.pageNum-1)*pager.pageSize;
        pool.query("SELECT * FROM mf_product WHERE type=? ORDER BY pid DESC LIMIT ?,?",[pager.type,start,pager.pageSize],(err,result)=>{
            pager.data = result;
            res.json(pager);
        });
    });
});


