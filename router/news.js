/**
 * 包含新闻相关的所有路由
 */

const express = require('express');
const router = express.Router();
module.exports = router;
const pool = require('../pool');

/**
 *按发布时间逆序返回新闻列表
 *GET  /news/list/5
 *请求参数：
     pageNum--需显示的页号；默认为1
 *输出结果：
 {
   totalRecord: 24,
   pageSize: 5,
   pageCount: 5,
   pageNum: 1,
   data: [{},{} ... {}]
 }
 */
router.get('/list/:pageNum',(req,res)=>{
    let pageNum =req.params.pageNum;
    let pager = {           //分页对象
        totalRecound:0,     //总记录数
        pageSize:5,         //页面大小
        pageCount:0,        //页面数量
        pageNum: parseInt(pageNum),    //当前页
        data:[]             //当前页数据
    };
    pool.query("SELECT COUNT(*) as c FROM mf_news",(err,result)=>{
        if(err) throw err;
        pager.totalRecound = result[0]['c'];
        pager.pageCount = Math.ceil(pager.totalRecound / pager.pageSize);
        let start = (pager.pageNum-1)*pager.pageSize;
        pool.query("SELECT nid,title,pubTime FROM mf_news ORDER BY pubTime DESC LIMIT ?,?",[start,pager.pageSize],
            (err,result)=>{
                if(err) throw err;
                pager.data = result;
                res.json(pager);     //返回响应消息
            });
    });
});
/**
 *根据新闻ID返回新闻详情
 * GET /news/10
 *请求参数：
     nid-新闻ID，必需
 *输出结果：
 {
   "nid": 1,
   ...
 }
 */
router.get('/:nid',(req,res)=>{
    //读取请求信息   ： nid 路由参数
    let nid = req.params.nid;
    pool.query('SELECT * from mf_news where nid=?',[nid],(err,result)=>{
        let row = result[0];
        res.json(row);
    });
});

