
/**
 * 包含购物车相关的所有路由
 */
const express= require('express');
const router =express.Router();
module.exports = router;
const pool = require('../pool');

/**
 *根据购物车详情记录编号删除该购买记录
 * DELETE /cart/detail/delete
 *请求参数：
     did-详情记录编号
 *输出结果：
 * {"code":1,"msg":"succ"}
 * 或
 * {"code":400}
 */

router.delete('/delete',(req,res)=>{
    let did = req.body.did;
    var sql = "DELETE FROM mf_cart_detail WHERE did=?";
    pool.query(sql,[did],(err,result)=>{
        if(err) throw err;
        if(result.affectedRows>0){
            res.json({"code":200,"msg":"删除成功"});
        }else{
            res.json('删除失败，请重试');
        }
    });
});

/**
 *向购物车中添加商品
 * POST /cart/detail/add
 *请求参数：
     uid-用户ID，必需
     pid-产品ID，必需
 *输出结果：
 * {"code":1,"msg":"succ", "productCount":1}
 * 或
 * {"code":400}
 */
router.post('/add',(req,res)=>{
    let useId = req.body.useId;
    let pid = req.body.pid;
    pool.query("SELECT cid FROM mf_cart WHERE userId=?",[useId],(err,result)=>{
        if(err) throw err;
        let cid = result[0].cid;
        //如果购物车存在
        if(cid){
            //判断购物车中是否已有该商品
            pool.query("SELECT did,count FROM mf_cart_detail WHERE cartId=? AND productId=?",[cid,pid],(err,result)=>{
                let data = result[0];
                if(data.length>0){
                    data.count ++;
                    pool.query("UPDATE mf_cart_detail SET count=? WHERE cartId=? AND productId=?",[data.count,cid,pid],(err,result)=>{
                        if(err) throw err;
                        if(result.affectedRows>0){
                            res.json({"code":201,"msg":"更新成功"});

                        }else{
                            res.json({"code":401,"msg":"更新失败"});
                        }
                    });
                }else{ //没购买过的商品,添加到购物车
                    pool.query("INSERT INTO mf_cart_detail VALUES(NULL,?, ?, ?)",[cid,pid,1],(err,result)=>{
                        if(err) throw err;
                        if(result.affectedRows){
                            res.json({"code":202,"msg":"添加成功"});
                        }else{
                            res.json({"code":402,"msg":"添加失败"});
                        }
                    });
                }
            });

        }else{   //购物车不存在
            pool.query("INSERT INTO mf_cart VALUES(NULL, ?)",[useId],(err,result)=>{
                if(result.affectedRows){
                    res.json({"code":200,"msg":"成功创建购物车"});
                }else{
                    res.json({"code":400,"msg":"创建购物车失败"});
                }
            });
        }
    });
});

/**
 *根据购物车详情记录编号修改该商品购买数量
 * POST cart/detail/update
 *请求参数：
     did-详情记录编号
     pid-商品编号
 count-更新后的购买数量
 *输出结果：
 * {"code":1,"msg":"succ"}
 * 或
 * {"code":400}
 */
router.post('/update',(req,res)=>{
    let did = req.body.did;
    let pid = req.body.pid;
    let count = req.body.count;
    let sql = "UPDATE mf_cart_detail SET count=? WHERE did=? AND productId=?";
    pool.query(sql,[count,did,pid],(err,result)=>{
        if(err) throw  err;
        if(result.affectedRows >0){
            res.json({"code":1,"msg":"更新成功"});
        }else{
            res.json({"code":400,"msg":"更新失败"});
        }
    });
});

/**
 *查询指定用户的购物车内容
 * GET /cart/detail/:uid
 *请求参数：
     uid-用户ID，必需
 *输出结果：
 {
   "uid": 1,
   "products":[
     {"pid":1,"title1":"xxx","pic":"xxx","price":1599.00,"count":3},
     {"pid":3,"title1":"xxx","pic":"xxx","price":1599.00,"count":3},
     ...
     {"pid":5,"title1":"xxx","pic":"xxx","price":1599.00,"count":3}
   ]
 }
 */
router.get('/detail/:uid',(req,res)=>{
    let uid = req.params.uid;
    let sql = "SELECT pid,title1,pic,price,count,did FROM mf_product,mf_cart_detail WHERE mf_cart_detail.productId=mf_product.pid AND pid IN (SELECT productId FROM mf_cart_detail WHERE cartId=(SELECT cid FROM mf_cart WHERE userId=?)) AND mf_cart_detail.cartId=(SELECT cid FROM mf_cart WHERE userId=?)";
    pool.query(sql,[uid,uid],(err,result)=>{
        if(err) throw err;
        res.json(result);
    });
});